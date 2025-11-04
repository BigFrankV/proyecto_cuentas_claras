const db = require('../db');
function authorize(...allowed) {
  return async (req, res, next) => {
    console.log('authorize debug:', {
      user: req.user,
      allowed,
      userRoles: req.user?.roles,
    }); // <-- añadir
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    // DEPRECADO pero mantener compatibilidad: Global superadmin bypass
    if (req.user.is_superadmin) return next();

    // Si is_superadmin no está en el token, verificar en DB (para compatibilidad con tokens antiguos)
    if (req.user.id && req.user.is_superadmin === undefined) {
      try {
        const [rows] = await db.query(
          'SELECT is_superadmin FROM usuario WHERE id = ?',
          [req.user.id]
        );
        if (rows.length && rows[0].is_superadmin) {
          req.user.is_superadmin = true; // Cache it
          return next();
        }
      } catch (error) {
        console.error('Error al verificar estado de superadmin:', error);
        // Continue to role check
      }
    }

    const userRoles = req.user.roles || [];
    const ok = allowed.some((r) => userRoles.includes(r));
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
    // DEPRECADO: Compatibilidad con is_superadmin
    if (req.user.is_superadmin) return next();

    const comunidadId = Number(req.params[comunidadIdParam]);
    const memberships = req.user.memberships || [];
    const membership = memberships.find((m) => m.comunidadId === comunidadId);

    if (!membership) {
      return res.status(403).json({ error: 'no membership in this community' });
    }

    // nivel_acceso menor = más privilegios (1=superadmin, 7=residente)
    if (membership.nivel_acceso > minLevel) {
      return res.status(403).json({ error: 'insufficient privileges' });
    }

    next();
  };
}

/**
 * Allows access if the authenticated persona matches the :id param OR user has one of the allowed roles
 */
function allowSelfOrRoles(paramName = 'id', ...allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    // DEPRECADO: Global superadmin bypass
    if (req.user.is_superadmin) return next();
    const personaId = req.user.persona_id;
    if (personaId && String(personaId) === String(req.params[paramName]))
      return next();
    const userRoles = req.user.roles || [];
    const ok = allowed.some((r) => userRoles.includes(r));
    if (!ok) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

module.exports = { authorize, allowSelfOrRoles, checkRoleLevel };
