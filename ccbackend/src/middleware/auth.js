const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'change_me';

function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: '6h' });
}

function generateTempToken(payload, expiresIn = '5m') {
  return jwt.sign(payload, secret, { expiresIn });
}

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.slice(7);
  try {
    const data = jwt.verify(token, secret);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { generateToken, generateTempToken, authenticate };
