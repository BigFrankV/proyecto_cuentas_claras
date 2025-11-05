const { isSuperAdmin } = require('./authorize');

/**
 * Helpers mínimos (ajustar según estructura real de usuario)
 */
function isResident(user) {
  return !!(user && (user.persona_id || user.id));
}

function hasManageRole(user) {
  if (!user) return false;
  if (isSuperAdmin(user) || user.is_superadmin) return true;
  const roles = (user.memberships || []).map((m) =>
    String(m.rol_slug || m.rol || '').toLowerCase()
  );
  const allowed = [
    'presidente_comite',
    'admin_comunidad',
    'sindico',
    'contador',
    'admin',
    'gestor',
  ];
  return roles.some((r) => allowed.includes(r));
}

/**
 * Permiso para crear apelación: usuario autenticado con persona_id o id
 */
exports.canApelar = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
  if (!isResident(req.user))
    return res.status(403).json({ error: 'forbidden' });
  return next();
};

/**
 * Permiso para gestionar (listar/resolver) apelaciones: roles de gestión o superadmin
 */
exports.canManageApelaciones = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
  if (hasManageRole(req.user)) return next();
  return res.status(403).json({ error: 'forbidden' });
};
