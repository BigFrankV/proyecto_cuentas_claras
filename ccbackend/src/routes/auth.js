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
 * /auth/verify-2fa:
 *   post:
 *     tags: [Auth]
 *     summary: Verificar código 2FA
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token JWT válido
 *       401:
 *         description: Código 2FA inválido
 */
router.post('/verify-2fa', [
  body('userId').isInt(),
  body('token').isString().isLength({ min: 6, max: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId, token } = req.body;

    // Obtener el secret 2FA del usuario
    const [rows] = await db.query(
      'SELECT totp_secret, totp_enabled FROM usuario WHERE id = ?',
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = rows[0];

    if (!user.totp_enabled || !user.totp_secret) {
      return res.status(400).json({ error: '2FA no está habilitado para este usuario' });
    }

    // Verificar el token
    const verified = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: 'base32',
      token: token,
      window: 2 // Permite 2 códigos anteriores/posteriores
    });

    if (!verified) {
      return res.status(401).json({ error: 'Código 2FA inválido' });
    }

    // Generar token JWT completo
    const jwtToken = generateToken({ id: userId });

    res.json({
      message: '2FA verificado exitosamente',
      token: jwtToken,
      userId: userId
    });

  } catch (error) {
    console.error('Error verifying 2FA:', error);
    res.status(500).json({ error: 'Error al verificar 2FA' });
  }
});

// Helper function to determine identification type and build query
function buildUserQuery(identifier) {
  const cleanIdentifier = identifier.replace(/\s+/g, '').toUpperCase();

  if (cleanIdentifier.includes('@')) {
    return {
      query: 'SELECT u.id, u.persona_id, u.hash_password, u.is_superadmin, u.username FROM usuario u WHERE u.email = ? LIMIT 1',
      param: identifier.toLowerCase()
    };
  }

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

  const dniPattern = /^\d{7,9}$/;
  if (dniPattern.test(cleanIdentifier)) {
    return {
      query: `SELECT u.id, u.persona_id, u.hash_password, u.is_superadmin, u.username 
              FROM usuario u 
              JOIN persona p ON u.persona_id = p.id 
              WHERE p.rut = ? LIMIT 1`,
      param: cleanIdentifier
    };
  }

  return {
    query: 'SELECT id, persona_id, hash_password, is_superadmin, username FROM usuario WHERE username = ? LIMIT 1',
    param: identifier
  };
}

// ============================================
// POST /auth/login - ✅ CORREGIDO
// ============================================
router.post('/login', [
  body('identifier').exists().withMessage('Identifier is required'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { identifier, password } = req.body;

  try {
    console.log('🔐 Intento de login:', identifier);

    // 1. Buscar usuario
    const { query, param } = buildUserQuery(identifier);
    const params = Array.isArray(param) ? param : [param];
    const [rows] = await db.query(query, params);

    if (!rows.length) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const user = rows[0];

    // 2. Verificar contraseña
    const ok = await bcrypt.compare(password, user.hash_password);
    if (!ok) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    console.log('✅ Contraseña verificada para usuario:', user.username);

    // 3. ✅ OBTENER ROLES Y MEMBRESÍAS (USANDO VISTA DIRECTAMENTE)
    const [userRoles] = await db.query(`
      SELECT 
        umc.id as membership_id,
        umc.comunidad_id,
        umc.persona_id,
        umc.rol,
        umc.activo,
        c.razon_social as comunidad_nombre,
        rs.id as rol_id,
        rs.nombre as rol_nombre,
        rs.codigo as rol_slug,
        rs.nivel_acceso as nivel,
        rs.es_rol_sistema as es_admin
      FROM usuario_miembro_comunidad umc
      INNER JOIN comunidad c ON umc.comunidad_id = c.id
      INNER JOIN rol_sistema rs ON umc.rol = rs.codigo
      WHERE umc.persona_id = ? AND umc.activo = 1
    `, [user.persona_id]);

    console.log(`📋 ${userRoles.length} roles y membresías encontrados`);

    // 4. ✅ DETERMINAR SI ES SUPERADMIN O ADMIN
    const isSuperAdmin = user.is_superadmin === 1;
    const hasAdminRole = userRoles.some(r => r.es_admin === 1 || r.nivel >= 90);
    const isAdmin = isSuperAdmin || hasAdminRole;

    console.log('🔑 Permisos:', { isSuperAdmin, hasAdminRole, isAdmin });

    // 5. ✅ OBTENER DATOS DE PERSONA
    const [personaRows] = await db.query(`
      SELECT rut, dv, nombres, apellidos, email, telefono, direccion
      FROM persona
      WHERE id = ?
    `, [user.persona_id]);

    const persona = personaRows[0] || null;

    // 6. ✅ VERIFICAR 2FA
    const [userRow] = await db.query(
      'SELECT totp_secret, totp_enabled, email FROM usuario WHERE id = ? LIMIT 1',
      [user.id]
    );
    const totp_info = userRow[0] || { totp_secret: null, totp_enabled: 0 };

    if (totp_info.totp_enabled) {
      const tempPayload = {
        sub: user.id,
        username: user.username,
        persona_id: user.persona_id,
        twoFactor: true
      };
      const tempToken = generateTempToken(tempPayload, '5m');
      return res.json({ twoFactorRequired: true, tempToken });
    }

    // Obtener memberships desde la view consolidada
    const [memberships] = await db.query(
      `SELECT
         id AS membership_id,
         usuario_id,
         persona_id,
         comunidad_id,
         rol_id,
         rol_slug AS rol,
         rol_nombre,
         desde,
         hasta,
         activo,
         comunidad_nombre
       FROM usuario_miembro_comunidad
       WHERE persona_id = ? AND activo = 1`,
      [ user.persona_id ]
    );
    user.memberships = memberships || [];

    // 7. ✅ CONSTRUIR ARRAYS (SIN DUPLICADOS)
    const rolesArray = userRoles.map(r => ({
      id: r.rol_id,
      nombre: r.rol_nombre,
      slug: r.rol_slug,
      comunidad_id: r.comunidad_id,
      comunidad_nombre: r.comunidad_nombre,
      nivel: r.nivel,
      es_admin: r.es_admin === 1
    }));

    const membershipsArray = userRoles.map(m => ({
      id: m.membership_id,
      comunidad_id: m.comunidad_id,
      comunidad_nombre: m.comunidad_nombre,
      estado: 'activo' // La vista ya filtra por activo=1
    }));

    const rolesSlugArray = Array.from(
      new Set(rolesArray.map(r => (r.slug || '').toLowerCase()))
    );

    const comunidad_id = membershipsArray.length > 0 ? membershipsArray[0].comunidad_id : null;

    // 8. ✅ PAYLOAD DEL TOKEN
    const payload = {
      sub: user.id,
      username: user.username,
      persona_id: user.persona_id,
      is_superadmin: isSuperAdmin,
      is_admin: isAdmin,
      roles: rolesSlugArray,
      comunidad_id,
      memberships: membershipsArray,
      full_roles: rolesArray
    };

    // 9. ✅ GENERAR TOKEN
    const token = generateToken(payload);

    // 10. ✅ RESPUESTA
    const userData = {
      id: user.id,
      username: user.username,
      email: totp_info.email || null,
      persona_id: user.persona_id,
      is_superadmin: isSuperAdmin,
      is_admin: isAdmin,
      activo: 1,
      created_at: new Date().toISOString(),
      persona: persona,
      roles: rolesArray,
      memberships: membershipsArray
    };

    console.log('✅ Login exitoso:', {
      username: user.username,
      is_superadmin: isSuperAdmin,
      is_admin: isAdmin,
      roles_count: rolesArray.length,
      memberships_count: membershipsArray.length
    });

    res.json({ token, user: userData });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'server error', message: err.message });
  }
});

// ============================================
// GET /auth/me - ✅ CORREGIDO
// ============================================
router.get('/me', authenticate, async (req, res) => {
  try {
    console.log('🔍 GET /auth/me - Usuario ID:', req.user.sub);

    // 1. Obtener datos del usuario con persona
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

    if (!rows.length) {
      return res.status(404).json({ error: 'user not found' });
    }

    const user = rows[0];

    // 2. ✅ Obtener roles y membresías desde la vista
    const [userRoles] = await db.query(`
      SELECT 
        umc.id as membership_id,
        umc.comunidad_id,
        c.razon_social as comunidad_nombre,
        rs.id as rol_id,
        rs.nombre as rol_nombre,
        rs.codigo as rol_slug,
        rs.nivel_acceso as nivel,
        rs.es_rol_sistema as es_admin
      FROM usuario_miembro_comunidad umc
      INNER JOIN comunidad c ON umc.comunidad_id = c.id
      INNER JOIN rol_sistema rs ON umc.rol = rs.codigo
      WHERE umc.persona_id = ? AND umc.activo = 1
    `, [user.persona_id]);

    const isSuperAdmin = user.is_superadmin === 1;
    const hasAdminRole = userRoles.some(r => r.es_admin === 1 || r.nivel >= 90);
    const isAdmin = isSuperAdmin || hasAdminRole;

    const rolesArray = userRoles.map(r => ({
      id: r.rol_id,
      nombre: r.rol_nombre,
      slug: r.rol_slug,
      comunidad_id: r.comunidad_id,
      comunidad_nombre: r.comunidad_nombre,
      nivel: r.nivel,
      es_admin: r.es_admin === 1
    }));

    const rolesSlugArray = Array.from(
      new Set(rolesArray.map(r => (r.slug || '').toLowerCase()))
    );

    const membershipsArray = userRoles.map(m => ({
      id: m.membership_id,
      comunidad_id: m.comunidad_id,
      comunidad_nombre: m.comunidad_nombre,
      estado: 'activo'
    }));

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      persona_id: user.persona_id,
      is_superadmin: isSuperAdmin,
      is_admin: isAdmin,
      is_2fa_enabled: !!(user.totp_secret && user.totp_secret.trim() !== ''),
      activo: user.activo,
      created_at: user.created_at,
      persona: user.persona_id ? {
        rut: user.rut,
        dv: user.dv,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.persona_email,
        telefono: user.telefono,
        direccion: user.direccion
      } : null,
      roles: rolesArray,
      memberships: membershipsArray,
      roles_slug: rolesSlugArray
    };

    console.log('✅ Usuario verificado:', {
      username: user.username,
      is_admin: isAdmin,
      roles_count: rolesArray.length,
      memberships_count: membershipsArray.length
    });

    res.json(userData);

  } catch (err) {
    console.error('❌ Error en /auth/me:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// ============================================
// POST /auth/verify-2fa - ✅ CORREGIDO
// ============================================
router.post('/verify-2fa', [
  body('tempToken').exists(),
  body('code').exists().isLength({ min: 6, max: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { tempToken, code } = req.body;
  const jwt = require('jsonwebtoken');

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'change_me');
    if (!decoded.twoFactor) {
      return res.status(400).json({ error: 'invalid temp token' });
    }

    const [userRow] = await db.query(
      'SELECT totp_secret, persona_id FROM usuario WHERE id = ? LIMIT 1',
      [decoded.sub]
    );

    if (!userRow.length || !userRow[0].totp_secret) {
      return res.status(400).json({ error: '2FA not configured' });
    }

    const verified = speakeasy.totp.verify({
      secret: userRow[0].totp_secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({ error: 'invalid 2FA code' });
    }

    const persona_id = userRow[0].persona_id;

    // Obtener roles y membresías desde la vista
    const [userRoles] = await db.query(`
      SELECT 
        umc.id as membership_id,
        umc.comunidad_id,
        c.razon_social as comunidad_nombre,
        rs.id as rol_id,
        rs.nombre as rol_nombre,
        rs.codigo as rol_slug,
        rs.nivel_acceso as nivel,
        rs.es_rol_sistema as es_admin
      FROM usuario_miembro_comunidad umc
      INNER JOIN comunidad c ON umc.comunidad_id = c.id
      INNER JOIN rol_sistema rs ON umc.rol = rs.codigo
      WHERE umc.persona_id = ? AND umc.activo = 1
    `, [persona_id]);

    const rolesArray = userRoles.map(r => ({
      id: r.rol_id,
      nombre: r.rol_nombre,
      slug: r.rol_slug,
      comunidad_id: r.comunidad_id,
      nivel: r.nivel,
      es_admin: r.es_admin === 1
    }));

    const membershipsArray = userRoles.map(m => ({
      id: m.membership_id,
      comunidad_id: m.comunidad_id,
      comunidad_nombre: m.comunidad_nombre,
      estado: 'activo'
    }));

    const rolesSlugArray = Array.from(
      new Set(rolesArray.map(r => (r.slug || '').toLowerCase()))
    );

    const payload = {
      sub: decoded.sub,
      username: decoded.username,
      persona_id: decoded.persona_id,
      roles: rolesSlugArray,
      memberships: membershipsArray,
      full_roles: rolesArray
    };

    const token = generateToken(payload);
    res.json({ token });

  } catch (err) {
    console.error('2FA verification error:', err);
    res.status(401).json({ error: 'invalid or expired temp token' });
  }
});

// ============================================
// Resto de endpoints sin cambios (no usan las tablas afectadas)
// ============================================

router.get('/2fa/setup', authenticate, async (req, res) => {
  try {
    const userId = req.user.sub;
    const [rows] = await db.query('SELECT id, username, email FROM usuario WHERE id = ? LIMIT 1', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'user not found' });
    const user = rows[0];
    const secret = speakeasy.generateSecret({
      name: `CuentasClaras:${user.email || user.username}`,
      length: 32
    });
    const otpauth = secret.otpauth_url;
    const qrData = await qrcode.toDataURL(otpauth);
    res.json({ base32: secret.base32, otpauth, qr: qrData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/2fa/enable', authenticate, [
  body('code').exists(),
  body('base32').exists()
], async (req, res) => {
  const { code, base32 } = req.body;
  try {
    const userId = req.user.sub;
    const verified = speakeasy.totp.verify({
      secret: base32,
      encoding: 'base32',
      token: code,
      window: 2
    });
    if (!verified) return res.status(400).json({ error: 'invalid code' });
    await db.query('UPDATE usuario SET totp_secret = ?, totp_enabled = 1 WHERE id = ?', [base32, userId]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/2fa/disable', authenticate, [
  body('code').exists()
], async (req, res) => {
  const { code } = req.body;
  try {
    const userId = req.user.sub;
    const [rows] = await db.query('SELECT totp_secret FROM usuario WHERE id = ? LIMIT 1', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'user not found' });
    const secret = rows[0].totp_secret;
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2
    });
    if (!verified) return res.status(400).json({ error: 'invalid code' });
    await db.query('UPDATE usuario SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?', [userId]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/refresh', authenticate, async (req, res) => {
  try {
    const payload = {
      sub: req.user.sub,
      username: req.user.username,
      persona_id: req.user.persona_id,
      roles: req.user.roles || [],
      is_superadmin: !!req.user.is_superadmin
    };
    const token = generateToken(payload);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/logout', authenticate, async (req, res) => {
  res.json({ ok: true });
});

router.post('/forgot-password', [
  body('email').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email } = req.body;
  try {
    const [rows] = await db.query('SELECT id, username FROM usuario WHERE email = ? LIMIT 1', [email]);
    if (!rows.length) return res.status(200).json({ ok: true });
    const token = crypto.randomBytes(24).toString('hex');
    res.json({ ok: true, resetToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/reset-password', [
  body('token').exists(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  res.json({ ok: true });
});

router.post('/change-password', authenticate, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { currentPassword, newPassword } = req.body;
  const userId = req.user.sub;

  try {
    const [rows] = await db.query('SELECT id, hash_password FROM usuario WHERE id = ? LIMIT 1', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    const user = rows[0];
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.hash_password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE usuario SET hash_password = ? WHERE id = ?', [newHashedPassword, userId]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/profile', authenticate, [
  body('username').optional().isLength({ min: 3 }),
  body('email').optional().isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const userId = req.user.sub;
  const { username, email } = req.body;

  if (!username && !email) {
    return res.status(400).json({ error: 'At least one field must be provided' });
  }

  try {
    const updates = [];
    const values = [];

    if (username) {
      const [existingUsername] = await db.query('SELECT id FROM usuario WHERE username = ? AND id != ? LIMIT 1', [username, userId]);
      if (existingUsername.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      updates.push('username = ?');
      values.push(username);
    }

    if (email) {
      const [existingEmail] = await db.query('SELECT id FROM usuario WHERE email = ? AND id != ? LIMIT 1', [email, userId]);
      if (existingEmail.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      updates.push('email = ?');
      values.push(email);
    }

    values.push(userId);
    await db.query(`UPDATE usuario SET ${updates.join(', ')} WHERE id = ?`, values);

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

router.patch('/profile/persona', authenticate, [
  body('nombres').optional().isLength({ min: 1 }),
  body('apellidos').optional().isLength({ min: 1 }),
  body('telefono').optional().isLength({ min: 1 }),
  body('email').optional().isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const userId = req.user.sub;
  const { nombres, apellidos, telefono, direccion, email } = req.body;

  try {
    const [userRows] = await db.query('SELECT persona_id FROM usuario WHERE id = ? LIMIT 1', [userId]);
    if (!userRows.length) return res.status(404).json({ error: 'User not found' });

    const personaId = userRows[0].persona_id;
    if (!personaId) return res.status(400).json({ error: 'No persona linked' });

    const updates = [];
    const values = [];

    if (nombres !== undefined) { updates.push('nombres = ?'); values.push(nombres); }
    if (apellidos !== undefined) { updates.push('apellidos = ?'); values.push(apellidos); }
    if (telefono !== undefined) { updates.push('telefono = ?'); values.push(telefono); }
    if (direccion !== undefined) { updates.push('direccion = ?'); values.push(direccion); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(personaId);
    await db.query(`UPDATE persona SET ${updates.join(', ')} WHERE id = ?`, values);

    const [updatedPersona] = await db.query('SELECT rut, dv, nombres, apellidos, email, telefono, direccion FROM persona WHERE id = ? LIMIT 1', [personaId]);

    res.json({
      message: 'Persona updated successfully',
      persona: updatedPersona[0]
    });
  } catch (err) {
    console.error('Update persona error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/sessions', authenticate, async (req, res) => {
  try {
    const currentSession = {
      id: 'current-session',
      device: req.headers['user-agent'] || 'Unknown Device',
      location: 'Unknown Location',
      ip: req.ip || req.connection.remoteAddress || 'Unknown IP',
      lastAccess: new Date().toISOString(),
      isCurrent: true
    };
    res.json({ sessions: [currentSession] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.delete('/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    res.json({ message: 'Session closed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.delete('/sessions', authenticate, async (req, res) => {
  try {
    res.json({ message: 'All sessions closed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/preferences', authenticate, async (req, res) => {
  try {
    const userId = req.user.sub;
    const [rows] = await db.query('SELECT preferences FROM user_preferences WHERE user_id = ? LIMIT 1', [userId]);

    if (rows.length > 0) {
      return res.json(rows[0].preferences);
    }

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

router.patch('/preferences', authenticate, async (req, res) => {
  try {
    const userId = req.user.sub;
    const preferences = req.body;

    if (typeof preferences !== 'object') {
      return res.status(400).json({ error: 'Invalid preferences format' });
    }

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