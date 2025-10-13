const jwt = require('jsonwebtoken');
const db = require('../db');

const secret = process.env.JWT_SECRET || 'change_me';

/**
 * ✅ MIDDLEWARE ESPECÍFICO PARA PROVEEDORES
 * - Autentica con el token normal
 * - Enriquece req.user con datos de BD
 * - Solo se usa en rutas de proveedores
 */
async function authenticateProveedores(req, res, next) {
  try {
    console.log('🛡️ AuthProveedores - Verificando token...');
    
    // ✅ PASO 1: Autenticación normal (igual que auth.js)
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Missing token' 
      });
    }
    
    const token = auth.slice(7);
    const tokenData = jwt.verify(token, secret);
    console.log('✅ Token válido para usuario:', tokenData.username);
    
    // ✅ PASO 2: Obtener datos completos del usuario
    const [userRows] = await db.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.is_superadmin,
        u.persona_id
      FROM usuario u
      WHERE u.id = ?
    `, [tokenData.sub]);

    if (!userRows.length) {
      console.log('❌ Usuario no encontrado en BD:', tokenData.sub);
      return res.status(401).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }

    const user = userRows[0];
    console.log('✅ Usuario encontrado:', user.username);

    // ✅ PASO 3: Obtener membresías (para verificar comunidad)
    const [membershipRows] = await db.query(`
      SELECT 
        mc.comunidad_id as comunidadId,
        mc.rol,
        c.razon_social as comunidad_nombre
      FROM membresia_comunidad mc
      JOIN comunidad c ON mc.comunidad_id = c.id
      WHERE mc.usuario_id = ? AND mc.activo = 1
    `, [user.id]);

    console.log('🏢 Membresías encontradas:', membershipRows.length);

    // ✅ PASO 4: Construir req.user enriquecido
    const roles = membershipRows.map(m => m.rol);
    
    req.user = {
      // Datos básicos del token
      id: user.id,
      username: user.username,
      email: user.email,
      is_superadmin: Boolean(user.is_superadmin),
      persona_id: user.persona_id,
      
      // Datos enriquecidos de BD
      roles: roles,
      memberships: membershipRows,
      
      // Compatibilidad con token original
      sub: user.id,
      iat: tokenData.iat,
      exp: tokenData.exp
    };

    console.log('✅ req.user construido:', {
      username: req.user.username,
      roles: req.user.roles,
      memberships_count: req.user.memberships.length,
      is_superadmin: req.user.is_superadmin
    });

    next();

  } catch (error) {
    console.error('❌ Error en authProveedores:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token inválido' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expirado' 
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
}

module.exports = { authenticateProveedores };