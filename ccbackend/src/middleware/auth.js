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
    // data should contain sub or id; si no, usar data.sub
    const userId = data.sub || data.id;
    if (!userId) {
      req.user = data; // defensa: al menos pasar payload
      return next();
    }

    // Cargar usuario actual desde BD para exponer is_superadmin, persona_id, roles, username...
    const [rows] = await db.query('SELECT id, persona_id, username, is_superadmin FROM usuario WHERE id = ? LIMIT 1', [userId]);
    const userRow = rows[0] || null;

    req.user = {
      id: userRow ? userRow.id : userId,
      sub: userRow ? userRow.id : userId,
      persona_id: userRow ? userRow.persona_id : (data.persona_id || null),
      username: userRow ? userRow.username : data.username,
      is_superadmin: !!(userRow ? userRow.is_superadmin : data.is_superadmin),
      roles: data.roles || []
    };

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { generateToken, generateTempToken, authenticate };
