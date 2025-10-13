/**
 * Simple role-based authorization middleware
 * Usage: authorize('admin','superadmin')
 * Ahora usa el sistema de roles con niveles de acceso
 */
function authorize(...allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    if (req.user.is_superadmin) return next();
    const userRoles = (req.user.roles || []).map(r => typeof r === 'string' ? r.toLowerCase() : (r.slug || r.codigo || '').toLowerCase());
    const ok = allowed.some(r => userRoles.includes(String(r).toLowerCase()));
    if (!ok) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

/**
 * Verifica que el usuario tenga un nivel de acceso mínimo en la comunidad especificada
 * @param {string} comunidadIdParam - Nombre del parámetro que contiene el comunidad_id
 * @param {number} minLevel - Nivel de acceso mínimo requerido (1-7, donde 1=superadmin, 7=residente)
 */
function checkRoleLevel(comunidadIdParam = 'comunidadId', minLevel = 5) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    if (req.user.is_superadmin) return next();
    const comunidadId = Number(req.params[comunidadIdParam]);
    const memberships = req.user.memberships || [];
    // buscar por comunidad_id (snake_case) o comunidadId por compatibilidad
    const membership = memberships.find(m => Number(m.comunidad_id ?? m.comunidadId) === comunidadId);
    if (!membership) return res.status(403).json({ error: 'no membership in this community' });
    const nivel = membership.nivel ?? membership.nivel_acceso ?? 99;
    if (nivel > minLevel) return res.status(403).json({ error: 'insufficient privileges' });
    next();
  };
}

/**
 * Allows access if the authenticated persona matches the :id param OR user has one of the allowed roles
 */
function allowSelfOrRoles(paramName = 'id', ...allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    if (req.user.is_superadmin) return next();
    const personaId = req.user.persona_id || req.user.personaId;
    if (personaId && String(personaId) === String(req.params[paramName])) return next();
    const userRoles = (req.user.roles || []).map(r => typeof r === 'string' ? r.toLowerCase() : (r.slug || r.codigo || '').toLowerCase());
    const ok = allowed.some(r => userRoles.includes(String(r).toLowerCase()));
    if (!ok) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

// Helpers exportables usados en middleware específicos
function hasRole(req, allowedRoles = []) {
  if (!req.user) return false;
  if (req.user.is_superadmin) return true;
  const userRoles = (req.user.roles || []).map(r => typeof r === 'string' ? r.toLowerCase() : (r.slug || r.codigo || '').toLowerCase());
  return allowedRoles.some(r => userRoles.includes(String(r).toLowerCase()));
}

function isSuperAdmin(req) {
  return !!req.user && !!req.user.is_superadmin;
}

module.exports = { authorize, allowSelfOrRoles, checkRoleLevel, hasRole, isSuperAdmin };
