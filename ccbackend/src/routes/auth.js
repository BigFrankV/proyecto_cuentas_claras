const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken, generateTempToken, authenticate } = require('../middleware/auth');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Helper function to determine identification type and build query
function buildUserQuery(identifier) {
  // Remove spaces and convert to uppercase for RUT comparison
  const cleanIdentifier = identifier.replace(/\s+/g, '').toUpperCase();
  
  // Check if it's an email
  if (cleanIdentifier.includes('@')) {
    return {
      query: 'SELECT u.id, u.persona_id, u.hash_password, u.is_superadmin, u.username FROM usuario u WHERE u.email = ? LIMIT 1',
      param: identifier.toLowerCase()
    };
  }
  
  // Check if it's a Chilean RUT (format: 12345678-9 or 123456789)
  const rutPattern = /^(\d{1,8})-?([0-9K])$/i;
  const rutMatch = cleanIdentifier.match(rutPattern);
  if (rutMatch) {
    const rutNumber = rutMatch[1];
    const dv = rutMatch[2];
    return {
      query: `SELECT u.id, u.persona_id, u.hash_password, u.is_superadmin, u.username 
              FROM usuario u 
              JOIN persona p ON u.persona_id = p.id 
              WHERE p.rut = ? AND p.dv = ? LIMIT 1`,
      param: [rutNumber, dv]
    };
  }
  
  // Check if it's a numeric DNI (Argentina, other countries)
  const dniPattern = /^\d{7,9}$/;
  if (dniPattern.test(cleanIdentifier)) {
    // For DNI, we'll store it in a new field or use the rut field
    // For now, let's check if it matches the rut field as numeric
    return {
      query: `SELECT u.id, u.persona_id, u.hash_password, u.is_superadmin, u.username 
              FROM usuario u 
              JOIN persona p ON u.persona_id = p.id 
              WHERE p.rut = ? LIMIT 1`,
      param: cleanIdentifier
    };
  }
  
  // Default: treat as username
  return {
    query: 'SELECT id, persona_id, hash_password, is_superadmin, username FROM usuario WHERE username = ? LIMIT 1',
    param: identifier
  };
}

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
 *     summary: Registrar un nuevo usuario
 *     description: Crea una nueva cuenta de usuario en el sistema. El usuario debe tener una persona_id válida.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 description: Nombre de usuario único
 *                 example: "usuario123"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Contraseña del usuario
 *                 example: "MiPassword123!"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "usuario@example.com"
 *               persona_id:
 *                 type: integer
 *                 description: ID de la persona asociada al usuario
 *                 example: 1
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID del usuario creado
 *                 username:
 *                   type: string
 *                   description: Nombre de usuario
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación
 *       400:
 *         description: Error de validación
 *       409:
 *         description: El nombre de usuario ya existe
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
 *     summary: Iniciar sesión en el sistema
 *     description: |
 *       Autentica un usuario y retorna un token JWT con información de roles y membresías.
 *       
 *       **El token JWT incluye:**
 *       - Información básica del usuario (id, username, persona_id)
 *       - Lista de roles del usuario
 *       - Membresías por comunidad con nivel de acceso
 *       - Información de 2FA si está habilitado
 *       
 *       **Tipos de identificadores aceptados:**
 *       - Email: `usuario@example.com`
 *       - RUT chileno: `12345678-9`
 *       - DNI numérico: `12345678`
 *       - Username: `usuario123`
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email, RUT, DNI o nombre de usuario
 *                 example: "usuario@example.com"
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "MiPassword123!"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Login exitoso sin 2FA
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Token JWT con roles y membresías
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 - type: object
 *                   description: Se requiere verificación 2FA
 *                   properties:
 *                     twoFactorRequired:
 *                       type: boolean
 *                       example: true
 *                     tempToken:
 *                       type: string
 *                       description: Token temporal para completar 2FA
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 *     x-codeSamples:
 *       - lang: JavaScript
 *         source: |
 *           // Ejemplo de decodificación del token JWT
 *           const token = response.token;
 *           const decoded = jwt.decode(token);
 *           console.log(decoded);
 *           // {
 *           //   sub: 1,
 *           //   username: "usuario123",
 *           //   persona_id: 1,
 *           //   roles: ["admin", "propietario"],
 *           //   comunidad_id: 1,
 *           //   memberships: [
 *           //     { comunidadId: 1, rol: "admin", nivel_acceso: 2 },
 *           //     { comunidadId: 2, rol: "propietario", nivel_acceso: 6 }
 *           //   ]
 *           // }
 */
router.post('/login', [
  body('identifier').exists().withMessage('Identifier (email, RUT, DNI or username) is required'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  const { identifier, password } = req.body;
  
  try {
    // Build query based on identifier type
    const { query, param } = buildUserQuery(identifier);
    const params = Array.isArray(param) ? param : [param];
    
    const [rows] = await db.query(query, params);
    if (!rows.length) return res.status(401).json({ error: 'invalid credentials' });
    
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.hash_password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    
    // Fetch roles from usuario_comunidad_rol (nueva estructura)
    const [membresias] = await db.query(`
      SELECT ucr.comunidad_id, r.codigo as rol, r.nivel_acceso 
      FROM usuario_comunidad_rol ucr
      INNER JOIN rol r ON r.id = ucr.rol_id
      WHERE ucr.usuario_id = ? AND ucr.activo = 1
    `, [user.id]);
    // Normalizar roles (lowercase) y eliminar duplicados
    const roles = Array.from(new Set(membresias.map(m => String(m.rol || '').toLowerCase())));
    const comunidad_id = membresias.length ? membresias[0].comunidad_id : null;
    const memberships = membresias.map(m => ({ 
      comunidadId: m.comunidad_id, 
      rol: String(m.rol || '').toLowerCase(),
      nivel_acceso: m.nivel_acceso 
    }));
    
    // Check if user has TOTP enabled
    const [userRow] = await db.query('SELECT totp_secret, totp_enabled FROM usuario WHERE id = ? LIMIT 1', [user.id]);
    const totp_info = userRow[0] || { totp_secret: null, totp_enabled: 0 };
    
    if (totp_info.totp_enabled) {
      const tempPayload = { sub: user.id, username: user.username, persona_id: user.persona_id, twoFactor: true };
      const tempToken = generateTempToken(tempPayload, '5m');
      return res.json({ twoFactorRequired: true, tempToken });
    }

    const payload = { 
      sub: user.id, 
      username: user.username, 
      persona_id: user.persona_id, 
      roles, 
      comunidad_id, 
      is_superadmin: !!user.is_superadmin,
      memberships
    };
    const token = generateToken(payload);
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
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
    const [membresias] = await db.query(`
      SELECT ucr.comunidad_id, r.codigo as rol, r.nivel_acceso 
      FROM usuario_comunidad_rol ucr
      INNER JOIN rol r ON r.id = ucr.rol_id
      WHERE ucr.usuario_id = ? AND ucr.activo = 1
    `, [user.id]);
    // Normalizar roles (lowercase) y eliminar duplicados
    const roles = Array.from(new Set(membresias.map(m => String(m.rol || '').toLowerCase())));
    const comunidad_id = membresias.length ? membresias[0].comunidad_id : null;
    const memberships = membresias.map(m => ({ 
      comunidadId: m.comunidad_id, 
      rol: String(m.rol || '').toLowerCase(),
      nivel_acceso: m.nivel_acceso 
    }));
    const payload = { sub: user.id, username: user.username, persona_id: user.persona_id, roles, comunidad_id, memberships, is_superadmin: !!user.is_superadmin };
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
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 description: New password (minimum 6 characters)
 *             required:
 *               - currentPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password or validation error
 *       500:
 *         description: Server error
 */
router.post('/change-password', authenticate, [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.sub;
  
  try {
    // Get current user data
    const [rows] = await db.query('SELECT id, hash_password FROM usuario WHERE id = ? LIMIT 1', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    
    const user = rows[0];
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.hash_password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password in database
    await db.query('UPDATE usuario SET hash_password = ? WHERE id = ?', [newHashedPassword, userId]);
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @openapi
 * /auth/profile:
 *   patch:
 *     tags: [Auth]
 *     summary: Update user profile information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: New username (minimum 3 characters)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New email address
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error or username/email already exists
 *       500:
 *         description: Server error
 */
router.patch('/profile', authenticate, [
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  const userId = req.user.sub;
  const { username, email } = req.body;
  
  // Check if at least one field is provided
  if (!username && !email) {
    return res.status(400).json({ error: 'At least one field (username or email) must be provided' });
  }
  
  try {
    const updates = [];
    const values = [];
    
    // Check for username availability if provided
    if (username) {
      const [existingUsername] = await db.query('SELECT id FROM usuario WHERE username = ? AND id != ? LIMIT 1', [username, userId]);
      if (existingUsername.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      updates.push('username = ?');
      values.push(username);
    }
    
    // Check for email availability if provided
    if (email) {
      const [existingEmail] = await db.query('SELECT id FROM usuario WHERE email = ? AND id != ? LIMIT 1', [email, userId]);
      if (existingEmail.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      updates.push('email = ?');
      values.push(email);
    }
    
    values.push(userId);
    
    // Update user profile
    await db.query(`UPDATE usuario SET ${updates.join(', ')} WHERE id = ?`, values);
    
    // Get updated user data
    const [updatedUser] = await db.query('SELECT id, username, email, persona_id, is_superadmin FROM usuario WHERE id = ? LIMIT 1', [userId]);
    
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error' });
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
    // Join usuario with persona to get complete profile data
    const [rows] = await db.query(`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.persona_id, 
        u.activo, 
        u.created_at, 
        u.is_superadmin, 
        u.totp_secret,
        p.rut,
        p.dv,
        p.nombres,
        p.apellidos,
        p.email as persona_email,
        p.telefono,
        p.direccion
      FROM usuario u 
      LEFT JOIN persona p ON u.persona_id = p.id 
      WHERE u.id = ? LIMIT 1
    `, [req.user.sub]);
    
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    
    const user = rows[0];
    
    // Include is_superadmin as boolean in the response
    user.is_superadmin = !!user.is_superadmin;
    
    // Include totp_enabled status (true if totp_secret exists)
    user.totp_enabled = !!(user.totp_secret && user.totp_secret.trim() !== '');
    
    // Remove totp_secret from response for security
    delete user.totp_secret;
    
    // Structure the response to separate user and person data
    const response = {
      // User data
      id: user.id,
      username: user.username,
      email: user.email,
      persona_id: user.persona_id,
      activo: user.activo,
      created_at: user.created_at,
      is_superadmin: user.is_superadmin,
      totp_enabled: user.totp_enabled,
      
      // Person data (if exists)
      persona: user.persona_id ? {
        rut: user.rut,
        dv: user.dv,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.persona_email,
        telefono: user.telefono,
        direccion: user.direccion
      } : null
    };
    
    const [membresias] = await db.query(
      'SELECT comunidad_id AS comunidadId, rol FROM membresia_comunidad WHERE persona_id = ? AND activo = 1',
      [user.persona_id]
    );
    const memberships = (membresias || []).map(m => ({ comunidadId: m.comunidadId, rol: String(m.rol || '').toLowerCase() }));
    // roles globales derivados de memberships
    const roles = Array.from(new Set(memberships.map(m => m.rol)));
    return res.json({ ...response, roles, memberships });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /auth/profile/persona:
 *   patch:
 *     tags: [Auth]
 *     summary: Update persona information linked to the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombres:
 *                 type: string
 *                 description: First names
 *               apellidos:
 *                 type: string
 *                 description: Last names
 *               telefono:
 *                 type: string
 *                 description: Phone number
 *               direccion:
 *                 type: string
 *                 description: Address
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *     responses:
 *       200:
 *         description: Persona information updated successfully
 *       400:
 *         description: Validation error or no persona linked
 *       404:
 *         description: User not found or no persona linked
 *       500:
 *         description: Server error
 */
router.patch('/profile/persona', authenticate, [
  body('nombres').optional().isLength({ min: 1 }).withMessage('Names cannot be empty'),
  body('apellidos').optional().isLength({ min: 1 }).withMessage('Last names cannot be empty'),
  body('telefono').optional().isLength({ min: 1 }).withMessage('Phone cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email format')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  const userId = req.user.sub;
  const { nombres, apellidos, telefono, direccion, email } = req.body;
  
  try {
    // Get user's persona_id
    const [userRows] = await db.query('SELECT persona_id FROM usuario WHERE id = ? LIMIT 1', [userId]);
    if (!userRows.length) return res.status(404).json({ error: 'User not found' });
    
    const personaId = userRows[0].persona_id;
    if (!personaId) return res.status(400).json({ error: 'No persona linked to this user' });
    
    // Build update query
    const updates = [];
    const values = [];
    
    if (nombres !== undefined) {
      updates.push('nombres = ?');
      values.push(nombres);
    }
    if (apellidos !== undefined) {
      updates.push('apellidos = ?');
      values.push(apellidos);
    }
    if (telefono !== undefined) {
      updates.push('telefono = ?');
      values.push(telefono);
    }
    if (direccion !== undefined) {
      updates.push('direccion = ?');
      values.push(direccion);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(personaId);
    
    // Update persona data
    await db.query(`UPDATE persona SET ${updates.join(', ')} WHERE id = ?`, values);
    
    // Get updated persona data
    const [updatedPersona] = await db.query('SELECT rut, dv, nombres, apellidos, email, telefono, direccion FROM persona WHERE id = ? LIMIT 1', [personaId]);
    
    res.json({ 
      message: 'Persona information updated successfully',
      persona: updatedPersona[0]
    });
  } catch (err) {
    console.error('Update persona error:', err);
    res.status(500).json({ error: 'Server error' });
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

/**
 * @openapi
 * /auth/preferences:
 *   get:
 *     tags: [Auth]
 *     summary: Get user preferences
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences
 *       500:
 *         description: Server error
 */
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Get user preferences from database
    const [rows] = await db.query('SELECT preferences FROM user_preferences WHERE user_id = ? LIMIT 1', [userId]);
    
    if (rows.length > 0) {
      return res.json(rows[0].preferences);
    }
    
    // If no preferences found, return and create default preferences
    const defaultPreferences = {
      notifications: {
        email_enabled: true,
        payment_notifications: true,
        weekly_summaries: true
      },
      display: {
        timezone: 'America/Santiago',
        date_format: 'DD/MM/YYYY',
        language: 'es'
      }
    };
    
    // Create default preferences for user
    await db.query(
      'INSERT INTO user_preferences (user_id, preferences) VALUES (?, ?)',
      [userId, JSON.stringify(defaultPreferences)]
    );
    
    res.json(defaultPreferences);
  } catch (err) {
    console.error('Get preferences error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @openapi
 * /auth/preferences:
 *   patch:
 *     tags: [Auth]
 *     summary: Update user preferences
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email_enabled:
 *                     type: boolean
 *                   payment_notifications:
 *                     type: boolean
 *                   weekly_summaries:
 *                     type: boolean
 *               display:
 *                 type: object
 *                 properties:
 *                   timezone:
 *                     type: string
 *                   date_format:
 *                     type: string
 *                   language:
 *                     type: string
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.patch('/preferences', authenticate, async (req, res) => {
  try {
    const userId = req.user.sub;
    const preferences = req.body;
    
    // Validate preferences structure
    if (typeof preferences !== 'object') {
      return res.status(400).json({ error: 'Invalid preferences format' });
    }
    
    // Save preferences to database
    await db.query(
      'INSERT INTO user_preferences (user_id, preferences) VALUES (?, ?) ON DUPLICATE KEY UPDATE preferences = ?',
      [userId, JSON.stringify(preferences), JSON.stringify(preferences)]
    );
    
    res.json({ 
      message: 'Preferences updated successfully',
      preferences: preferences
    });
  } catch (err) {
    console.error('Update preferences error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
