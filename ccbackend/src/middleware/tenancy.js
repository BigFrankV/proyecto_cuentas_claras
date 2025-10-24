const db = require('../db');

/**
 * requireCommunity(paramName = 'comunidadId', allowedRoles = [])
 * valida que el usuario pertenece a la comunidad (o es superadmin)
 */
function requireCommunity(paramName = 'comunidadId', allowedRoles = []) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'unauthorized' });

      const usuarioId = req.user.sub;
      // Primero: comprobar flags en token
      const tokenRoles = (req.user.roles || []).map(r => String(r).toLowerCase());
      let isSuper = Boolean(req.user.is_superadmin === true || req.user.isSuper === true || tokenRoles.includes('superadmin'));

      // Si no viene en token, comprobar DB
      if (!isSuper && usuarioId) {
        const [urows] = await db.query('SELECT is_superadmin FROM usuario WHERE id = ? LIMIT 1', [usuarioId]);
        if (urows && urows.length && Number(urows[0].is_superadmin) === 1) isSuper = true;
      }
      if (isSuper) return next();

      const comunidadId = req.params[paramName];
      if (!comunidadId) return res.status(400).json({ error: 'missing comunidad id' });

      // comprobar membership en DB
      if (!usuarioId) return res.status(403).json({ error: 'forbidden' });
      const [mrows] = await db.query(`
        SELECT r.codigo AS rol
        FROM usuario_rol_comunidad ucr
        JOIN rol_sistema r ON r.id = ucr.rol_id
        WHERE ucr.comunidad_id = ? AND ucr.usuario_id = ? AND ucr.activo = 1
        LIMIT 1
      `, [comunidadId, usuarioId]);

      if (mrows && mrows.length) {
        const rolM = String(mrows[0].rol || '').toLowerCase();
        req.membership = { comunidadId: Number(comunidadId), rol: rolM };
        if (!allowedRoles || allowedRoles.length === 0) return next();
        const allowed = allowedRoles.map(r => String(r).toLowerCase());
        if (allowed.includes(rolM)) return next();
      }

      // fallback: comprobar roles globales del token
      if ((allowedRoles || []).some(r => tokenRoles.includes(String(r).toLowerCase()))) return next();

      return res.status(403).json({ error: 'forbidden' });
    } catch (err) {
      console.error('requireCommunity error', err);
      return res.status(500).json({ error: 'server error' });
    }
  };
}

/**
 * requireUnidad(paramName = 'id')
 * valida que la unidad pertenece a una comunidad que el usuario puede ver (o es superadmin)
 */
function requireUnidad(paramName = 'id') {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'unauthorized' });

      const usuarioId = req.user.sub;
      const tokenRoles = (req.user.roles || []).map(r => String(r).toLowerCase());
      let isSuper = Boolean(req.user.is_superadmin === true || req.user.isSuper === true || tokenRoles.includes('superadmin'));

      // fallback a DB para is_superadmin
      if (!isSuper && usuarioId) {
        const [urows] = await db.query('SELECT is_superadmin FROM usuario WHERE id = ? LIMIT 1', [usuarioId]);
        if (urows && urows.length && Number(urows[0].is_superadmin) === 1) isSuper = true;
      }
      if (isSuper) return next();

      const unidadId = Number(req.params[paramName]);
      if (!unidadId) return res.status(400).json({ error: 'invalid unidad id' });

      const [rows] = await db.query('SELECT comunidad_id FROM unidad WHERE id = ? LIMIT 1', [unidadId]);
      if (!rows || !rows.length) return res.status(404).json({ error: 'not found' });
      const comunidadId = Number(rows[0].comunidad_id);

      // comprobar membership explícito
      if (usuarioId) {
        const [mrows] = await db.query('SELECT 1 FROM usuario_rol_comunidad WHERE usuario_id = ? AND comunidad_id = ? AND activo = 1 LIMIT 1', [usuarioId, comunidadId]);
        if (mrows && mrows.length) {
          req.membership = { comunidadId, via: 'ucr' };
          return next();
        }
      }

      // fallback: si token trae comunidades comprobar ahí
      const userComs = (req.user.comunidades || []).map(Number);
      if (userComs.includes(comunidadId)) return next();

      return res.status(403).json({ error: 'forbidden' });
    } catch (err) {
      console.error('requireUnidad error', err);
      return res.status(500).json({ error: 'server error' });
    }
  };
}

module.exports = { requireCommunity, requireUnidad };