const db = require('../db');

/**
 * requireCommunity(paramName = 'comunidadId', allowedRoles = [])
 * - Permite superadmin.
 * - Verifica existencia de membresía activa (persona_id + comunidad_id).
 * - Si allowedRoles vacía: pertenecer basta para permitir.
 * - Si allowedRoles provisto: valida rol de la membresía O roles globales del usuario.
 * - Adjunta req.membership = { comunidadId, rol } cuando aplica.
 */
function requireCommunity(paramName = 'comunidadId', allowedRoles = []) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'unauthorized' });
      if (req.user.is_superadmin) return next();

      const comunidadId = req.params[paramName];
      if (!comunidadId) return res.status(400).json({ error: 'missing comunidad id' });

      const usuarioId = req.user.sub;
      if (!usuarioId) return res.status(403).json({ error: 'forbidden' });

      // buscar membresía activa en usuario_rol_comunidad (nueva estructura)
      const [rows] = await db.query(`
        SELECT r.codigo as rol, r.nivel_acceso 
        FROM usuario_rol_comunidad ucr
        INNER JOIN rol_sistema r ON r.id = ucr.rol_id
        WHERE ucr.comunidad_id = ? AND ucr.usuario_id = ? AND ucr.activo = 1 
        LIMIT 1
      `, [comunidadId, usuarioId]);

      if (rows && rows.length) {
        const rolMembresia = String(rows[0].rol || '').toLowerCase();
        const nivelAcceso = rows[0].nivel_acceso;
        req.membership = { comunidadId: Number(comunidadId), rol: rolMembresia, nivel_acceso: nivelAcceso };

        // si no se requieren roles específicos, pertenecer basta
        if (!allowedRoles || allowedRoles.length === 0) return next();

        // si rol de membresía está permitido
        if (allowedRoles.map(r => String(r).toLowerCase()).includes(rolMembresia)) return next();
      }

      // fallback: roles globales del usuario (req.user.roles)
      const userRoles = (req.user.roles || []).map(r => String(r).toLowerCase());
      if ((allowedRoles || []).some(r => userRoles.includes(String(r).toLowerCase()))) return next();

      return res.status(403).json({ error: 'forbidden' });
    } catch (err) {
      console.error('tenancy middleware error', err);
      return res.status(500).json({ error: 'server error' });
    }
  };
}

module.exports = { requireCommunity };