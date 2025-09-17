const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken, generateTempToken, authenticate } = require('../middleware/auth');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Autenticación y gestión de cuentas
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               persona_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/register', [body('username').isLength({ min: 3 }), body('password').isLength({ min: 6 })], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { username, password, email, persona_id } = req.body;
  try {
    const [exists] = await db.query('SELECT id FROM usuario WHERE username = ? LIMIT 1', [username]);
    if (exists.length) return res.status(409).json({ error: 'username exists' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO usuario (persona_id, username, hash_password, email) VALUES (?,?,?,?)', [persona_id || null, username, hash, email || null]);
    const id = result.insertId;
    const token = generateToken({ sub: id, username });
    res.status(201).json({ id, username, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/login', [body('username').exists(), body('password').exists()], async (req, res) => {
  const { username, password } = req.body;
  try {
  const [rows] = await db.query('SELECT id, persona_id, hash_password, is_superadmin FROM usuario WHERE username = ? LIMIT 1', [username]);
    if (!rows.length) return res.status(401).json({ error: 'invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.hash_password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    // fetch roles from membresia_comunidad and tenencia_unidad
    const [membresias] = await db.query('SELECT comunidad_id, rol FROM membresia_comunidad WHERE persona_id = ? AND activo = 1', [user.persona_id]);
    const roles = membresias.map(m => m.rol);
    // choose a default comunidad_id if any
    const comunidad_id = membresias.length ? membresias[0].comunidad_id : null;
  // If user has TOTP enabled, return a short-lived temp token and indicate 2FA required
  const [userRow] = await db.query('SELECT totp_secret, totp_enabled FROM usuario WHERE id = ? LIMIT 1', [user.id]);
  const totp_info = userRow[0] || { totp_secret: null, totp_enabled: 0 };
  if (totp_info.totp_enabled) {
    const tempPayload = { sub: user.id, username, persona_id: user.persona_id, twoFactor: true };
    const tempToken = generateTempToken(tempPayload, '5m');
    return res.json({ twoFactorRequired: true, tempToken });
  }

  const payload = { sub: user.id, username, persona_id: user.persona_id, roles, comunidad_id, is_superadmin: !!user.is_superadmin };
    const token = generateToken(payload);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Verify TOTP using tempToken produced by /auth/login
router.post('/2fa/verify', [body('tempToken').exists(), body('code').exists()], async (req, res) => {
  const { tempToken, code } = req.body;
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'change_me';
  try {
    const data = jwt.verify(tempToken, secret);
    if (!data || !data.twoFactor) return res.status(400).json({ error: 'invalid temp token' });
    const userId = data.sub;
    const [rows] = await db.query('SELECT id, persona_id, username, totp_secret FROM usuario WHERE id = ? LIMIT 1', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'user not found' });
    const user = rows[0];
    // verify code
    const verified = speakeasy.totp.verify({ secret: user.totp_secret, encoding: 'base32', token: code, window: 1 });
    if (!verified) return res.status(401).json({ error: 'invalid code' });
    // create final token
    const [membresias] = await db.query('SELECT comunidad_id, rol FROM membresia_comunidad WHERE persona_id = ? AND activo = 1', [user.persona_id]);
    const roles = membresias.map(m => m.rol);
    const comunidad_id = membresias.length ? membresias[0].comunidad_id : null;
    const payload = { sub: user.id, username: user.username, persona_id: user.persona_id, roles, comunidad_id };
    const token = generateToken(payload);
    res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'invalid or expired temp token' });
  }
});

// Protected: generate TOTP secret and otpauth URL for QR
router.get('/2fa/setup', authenticate, async (req, res) => {
  try {
    const userId = req.user.sub;
    const [rows] = await db.query('SELECT id, username, email FROM usuario WHERE id = ? LIMIT 1', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'user not found' });
    const user = rows[0];
    const secret = speakeasy.generateSecret({ name: `CuentasClaras:${user.email || user.username}` });
    const otpauth = secret.otpauth_url;
    const qrData = await qrcode.toDataURL(otpauth);
    // return secret.base32 and qr
    res.json({ base32: secret.base32, otpauth, qr: qrData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Protected: enable 2FA after verifying a code from user's authenticator app
router.post('/2fa/enable', authenticate, [body('code').exists(), body('base32').exists()], async (req, res) => {
  const { code, base32 } = req.body;
  try {
    const userId = req.user.sub;
    const verified = speakeasy.totp.verify({ secret: base32, encoding: 'base32', token: code, window: 1 });
    if (!verified) return res.status(400).json({ error: 'invalid code' });
    // store secret encrypted (here stored plain for demo — in prod encrypt)
    await db.query('UPDATE usuario SET totp_secret = ?, totp_enabled = 1 WHERE id = ?', [base32, userId]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Protected: disable 2FA
router.post('/2fa/disable', authenticate, [body('code').exists()], async (req, res) => {
  const { code } = req.body;
  try {
    const userId = req.user.sub;
    const [rows] = await db.query('SELECT totp_secret FROM usuario WHERE id = ? LIMIT 1', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'user not found' });
    const secret = rows[0].totp_secret;
    const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token: code, window: 1 });
    if (!verified) return res.status(400).json({ error: 'invalid code' });
    await db.query('UPDATE usuario SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?', [userId]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Refresh: issue a new token for a valid current token
router.post('/refresh', authenticate, async (req, res) => {
  try {
    const payload = { sub: req.user.sub, username: req.user.username, persona_id: req.user.persona_id, roles: req.user.roles || [], is_superadmin: !!req.user.is_superadmin };
    const token = generateToken(payload);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Logout (stateless) - client should drop token; respond OK
router.post('/logout', authenticate, async (req, res) => {
  // In a real app we'd blacklist the token or remove session; here we return success
  res.json({ ok: true });
});

// Forgot password - generate a reset token and (theoretically) email it
router.post('/forgot-password', [body('email').isEmail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email } = req.body;
  try {
    const [rows] = await db.query('SELECT id, username FROM usuario WHERE email = ? LIMIT 1', [email]);
    if (!rows.length) return res.status(200).json({ ok: true }); // don't reveal
    const user = rows[0];
    const token = crypto.randomBytes(24).toString('hex');
    // store token in a simple table reset_tokens if exists; here we just return it for demo
    // In production: save token with expiry and send email
    res.json({ ok: true, resetToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Reset password - accepts token and new password
router.post('/reset-password', [body('token').exists(), body('password').isLength({ min: 6 })], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { token, password } = req.body;
  try {
    // For demo we don't persist tokens; in production validate token and map to user
    // Here we return success to keep flow consistent
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, email, persona_id, activo, created_at, is_superadmin, totp_secret FROM usuario WHERE id = ? LIMIT 1', [req.user.sub]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    
    // Include is_superadmin as boolean in the response
    const user = rows[0];
    user.is_superadmin = !!user.is_superadmin;
    
    // Include totp_enabled status (true if totp_secret exists)
    user.totp_enabled = !!(user.totp_secret && user.totp_secret.trim() !== '');
    
    // Remove totp_secret from response for security
    delete user.totp_secret;
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /auth/sessions:
 *   get:
 *     tags: [Auth]
 *     summary: Get active sessions for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active sessions
 */
router.get('/sessions', authenticate, async (req, res) => {
  try {
    // For now, return a simple mock response
    // In a real implementation, you would track sessions in Redis or database
    const currentSession = {
      id: 'current-session',
      device: req.headers['user-agent'] || 'Unknown Device',
      location: 'Unknown Location', // You could use IP geolocation
      ip: req.ip || req.connection.remoteAddress || 'Unknown IP',
      lastAccess: new Date().toISOString(),
      isCurrent: true
    };
    
    res.json({
      sessions: [currentSession]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /auth/sessions/{sessionId}:
 *   delete:
 *     tags: [Auth]
 *     summary: Close a specific session
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session closed successfully
 */
router.delete('/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // For now, just return success
    // In a real implementation, you would revoke the specific session token
    res.json({ message: 'Session closed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /auth/sessions:
 *   delete:
 *     tags: [Auth]
 *     summary: Close all sessions except current
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions closed successfully
 */
router.delete('/sessions', authenticate, async (req, res) => {
  try {
    // For now, just return success
    // In a real implementation, you would revoke all session tokens except current
    res.json({ message: 'All sessions closed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
