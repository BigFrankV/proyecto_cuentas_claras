const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken, authenticate } = require('../middleware/auth');
const crypto = require('crypto');

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
  const payload = { sub: user.id, username, persona_id: user.persona_id, roles, comunidad_id, is_superadmin: !!user.is_superadmin };
    const token = generateToken(payload);
    res.json({ token });
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
  const [rows] = await db.query('SELECT id, username, email, persona_id, activo, created_at, is_superadmin FROM usuario WHERE id = ? LIMIT 1', [req.user.sub]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
  // include is_superadmin as boolean in the response
  const user = rows[0];
  user.is_superadmin = !!user.is_superadmin;
  res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
