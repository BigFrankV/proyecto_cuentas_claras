const db = require('../db');

/**
 * Permisos específicos para gastos según rol en la comunidad
 */
const GASTOS_PERMISSIONS = {
  admin: {
    create: true,
    read: true,
    update: true,
    delete: true,
    approve: true,
    reject: true,
    viewAll: true
  },
  contador: {
    create: true,
    read: true,
    update: true,
    delete: false,
    approve: true,
    reject: true,
    viewAll: true
  },
  consejo: {
    create: false,
    read: true,
    update: false,
    delete: false,
    approve: true,
    reject: true,
    viewAll: true
  },
  residente: {
    create: false,
    read: ['approved_only'],
    update: false,
    delete: false,
    approve: false,
    reject: false,
    viewAll: false
  }
};

function checkGastoPermission(action) {
  return async (req, res, next) => {
    try {
      // Si token/middleware ya marcó user.is_superadmin -> permitir
      if (req.user?.is_superadmin) {
        return next();
      }

      // Determinar comunidadId: puede venir en params, body o query
      const comunidadId = Number(req.params?.comunidadId || req.body?.comunidad_id || req.query?.comunidadId || req.body?.comunidadId);
      // Si no lo tenemos, intentar sacar de req.gasto (cuando se usen rutas por id)
      if (!comunidadId && req.gasto?.comunidad_id) {
        req.params = req.params || {};
        req.params.comunidadId = req.gasto.comunidad_id;
      }

      const comunidad = Number(req.params?.comunidadId || req.body?.comunidad_id || req.query?.comunidadId);
      if (!comunidad) {
        return res.status(400).json({ success: false, error: 'Falta comunidadId para verificar permisos' });
      }

      const usuarioId = req.user?.id;
      if (!usuarioId) {
        return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
      }

      // Si membership ya está seteada y coincide con comunidad, reutilizarla
      if (req.membership && Number(req.membership.comunidad_id) === comunidad) {
        // continuar con la verificación abajo
      } else {
        // Buscar membership en la tabla real (usuario_rol_comunidad) y traer rol_slug desde rol_sistema
        const [rows] = await db.query(`
          SELECT urc.id as membership_id, urc.usuario_id, urc.comunidad_id, urc.rol_id, urc.activo,
                 rs.slug as rol_slug, rs.nombre as rol_nombre
          FROM usuario_rol_comunidad urc
          LEFT JOIN rol_sistema rs ON urc.rol_id = rs.id
          WHERE urc.comunidad_id = ? AND urc.usuario_id = ? AND urc.activo = 1
          LIMIT 1
        `, [comunidad, usuarioId]);

        if (!rows || rows.length === 0) {
          return res.status(403).json({ success: false, error: 'No tiene membresía activa en esta comunidad' });
        }

        const m = rows[0];
        req.membership = {
          membership_id: m.membership_id,
          usuario_id: m.usuario_id,
          comunidad_id: m.comunidad_id,
          rol_id: m.rol_id,
          rol: (m.rol_nombre || m.rol_slug || '').toString(),
          rol_slug: (m.rol_slug || (m.rol_nombre || '')).toString().toLowerCase(),
          activo: m.activo
        };
      }

      const role = req.membership.rol_slug;
      const permDef = GASTOS_PERMISSIONS[role] || {};

      const allowed = permDef[action];

      // permiso booleano directo
      if (allowed === true) return next();

      // permiso denegado explícito
      if (allowed === false || typeof allowed === 'undefined') {
        return res.status(403).json({ success: false, error: `Rol '${role}' no tiene permiso para ${action}` });
      }

      // casos especiales (arrays)
      if (Array.isArray(allowed)) {
        // lectura limitada a aprobados (ej. residente)
        if (action === 'read' && allowed.includes('approved_only')) {
          // marcar para los handlers que deben filtrar solo aprobados
          req.onlyApprovedGastos = true;
          return next();
        }
        // otras reglas especiales pueden añadirse aquí
      }

      // fallback deny
      return res.status(403).json({ success: false, error: `Acción ${action} no permitida para rol ${role}` });
    } catch (err) {
      console.error('Error en gastosPermissions.checkGastoPermission:', err);
      return res.status(500).json({ success: false, error: 'Error interno', message: err.message });
    }
  };
}

module.exports = { checkGastoPermission, GASTOS_PERMISSIONS };