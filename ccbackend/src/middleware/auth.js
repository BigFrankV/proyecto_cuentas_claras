const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'change_me';

function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: '6h' });
}

function generateTempToken(payload, expiresIn = '5m') {
  return jwt.sign(payload, secret, { expiresIn });
}

function authenticate(req, res, next) {
  console.log('[AUTH Middleware] Verificando token');
  console.log('[AUTH Middleware] Headers:', {
    authorization: req.headers.authorization ? 'presente' : 'NO PRESENTE',
    'content-type': req.headers['content-type'] || 'NO PRESENTE',
  });

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    console.error('[AUTH Middleware] Token no presente o formato inválido');
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = auth.slice(7);
  console.log(
    '[AUTH Middleware] Token extraído:',
    token.substring(0, 20) + '...'
  );

  try {
    const data = jwt.verify(token, secret);
    console.log('[AUTH Middleware] Token validado exitosamente');
    // Normalizar id: algunos tokens usan `sub`, otros incluyen `id` explícito.
    const user = Object.assign({}, data, { id: data.id || data.sub });
    console.log('[AUTH Middleware] Usuario:', {
      sub: user.sub,
      id: user.id,
      username: user.username,
      persona_id: user.persona_id,
      is_superadmin: user.is_superadmin,
    });
    req.user = user;
    next();
  } catch (err) {
    console.error('[AUTH Middleware] Error validando token:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { generateToken, generateTempToken, authenticate };
