const jwt = require('jsonwebtoken');
const db = require('../db');

const secret = process.env.JWT_SECRET || 'change_me';

function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: '6h' });
}

function generateTempToken(payload, expiresIn = '5m') {
  return jwt.sign(payload, secret, { expiresIn });
}

async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.slice(7);
  try {
    const data = jwt.verify(token, secret);
    // Enriquecer req.user con datos de la tabla usuario si no vienen en el token
    if (data && data.id && (!data.persona_id || typeof data.is_superadmin === 'undefined')) {
      try {
        const [rows] = await db.query('SELECT id, persona_id, is_superadmin, username, email FROM usuario WHERE id = ? LIMIT 1', [data.id]);
        if (rows && rows[0]) {
          data.persona_id = data.persona_id || rows[0].persona_id;
          data.is_superadmin = typeof data.is_superadmin === 'undefined' ? !!rows[0].is_superadmin : data.is_superadmin;
          data.username = data.username || rows[0].username;
          data.email = data.email || rows[0].email;
        }
      } catch (e) {
        // no bloquear autenticación por fallo menor al leer usuario
        console.error('auth: error fetching usuario', e);
      }
    }
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// añadir helper para verificar tokens (usado por /auth/refresh)
function verifyToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch (e) {
    return null;
  }
}

module.exports = { generateToken, generateTempToken, authenticate, verifyToken };
