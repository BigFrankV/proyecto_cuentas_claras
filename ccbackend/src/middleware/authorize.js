const db = require('../db');

/**
 * authorize(...allowedRoles)
 * - permite acceso si req.user.is_superadmin
 * - si req.user.roles existe lo usa
 * - si no, consulta membresia_comunidad usando persona_id (o usuario.id -> persona_id)
 * - si la request incluye comunidad_id o unidad_id valida el rol dentro de esa comunidad
 */
function authorize(...allowed) {
  const allowedRoles = Array.isArray(allowed[0]) ? allowed[0] : allowed;
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'unauthorized' });
      if (req.user.is_superadmin) return next();
      if (!allowedRoles || allowedRoles.length === 0) return next();

      // si el token ya trae roles
      const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [];
      if (userRoles.length && allowedRoles.some(r => userRoles.includes(r))) return next();

      // obtener persona_id si hace falta
      let personaId = req.user.persona_id || req.user.personaId || null;
      if (!personaId && req.user.id) {
        const [urows] = await db.query('SELECT persona_id FROM usuario WHERE id = ? LIMIT 1', [req.user.id]);
        personaId = urows?.[0]?.persona_id || null;
      }
      if (!personaId) return res.status(403).json({ error: 'forbidden' });

      // intentar extraer comunidad_id de params/body
      const params = req.params || {};
      const body = req.body || {};
      let comunidadId = body.comunidad_id || body.comunidadId || params.comunidadId || params.comunidad_id || null;

      // resolver comunidad si se pasó unidad
      const unidadId = params.unidadId || params.unidad_id || body.unidad_id || body.unidadId || null;
      if (!comunidadId && unidadId) {
        const [urows] = await db.query('SELECT comunidad_id FROM unidad WHERE id = ? LIMIT 1', [unidadId]);
        comunidadId = urows?.[0]?.comunidad_id || null;
      }

      if (comunidadId) {
        const [mrows] = await db.query('SELECT rol FROM membresia_comunidad WHERE persona_id = ? AND comunidad_id = ? AND activo = 1', [personaId, comunidadId]);
        if (mrows.some(r => allowedRoles.includes(r.rol))) return next();
        return res.status(403).json({ error: 'forbidden' });
      }

      // sin comunidad concreta: validar rol en cualquiera de sus membresías activas
      const [mrows] = await db.query('SELECT rol FROM membresia_comunidad WHERE persona_id = ? AND activo = 1', [personaId]);
      if (mrows.some(r => allowedRoles.includes(r.rol))) return next();

      return res.status(403).json({ error: 'forbidden' });
    } catch (err) {
      console.error('authorize error', err);
      return res.status(500).json({ error: 'server error' });
    }
  };
}

/**
 * allowSelfOrRoles(paramName='id', ...allowed)
 * - conserva la funcionalidad anterior y delega a authorize cuando corresponda
 */
function allowSelfOrRoles(paramName = 'id', ...allowed) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'unauthorized' });
      if (req.user.is_superadmin) return next();
      const personaId = req.user.persona_id || req.user.personaId || null;
      if (personaId && String(personaId) === String(req.params[paramName])) return next();
      return authorize(...allowed)(req, res, next);
    } catch (err) {
      console.error('allowSelfOrRoles error', err);
      return res.status(500).json({ error: 'server error' });
    }
  }
}

module.exports = { authorize, allowSelfOrRoles };
