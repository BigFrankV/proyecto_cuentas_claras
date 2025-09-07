/**
 * Simple role-based authorization middleware
 * Usage: authorize('admin','superadmin')
 */
function authorize(...allowed) {
  return (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  // Global superadmin bypass: if the authenticated user is a superadmin,
  // allow access regardless of specific role checks.
  if (req.user.is_superadmin) return next();
  const userRoles = req.user.roles || [];
  const ok = allowed.some(r => userRoles.includes(r));
  if (!ok) return res.status(403).json({ error: 'forbidden' });
  next();
  };
}

/**
 * Allows access if the authenticated persona matches the :id param OR user has one of the allowed roles
 */
function allowSelfOrRoles(paramName = 'id', ...allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  // Global superadmin bypass
  if (req.user.is_superadmin) return next();
  const personaId = req.user.persona_id;
  if (personaId && String(personaId) === String(req.params[paramName])) return next();
  const userRoles = req.user.roles || [];
  const ok = allowed.some(r => userRoles.includes(r));
  if (!ok) return res.status(403).json({ error: 'forbidden' });
  next();
  };
}

module.exports = { authorize, allowSelfOrRoles };
