/**
 * Permisos para multas — roles según tabla de la base de datos.
 * Roles disponibles: superadmin, admin_comunidad, conserje, contador,
 * proveedor_servicio, residente, propietario, inquilino, tesorero, presidente_comite
 */

const rolesVerTodas = ['admin_comunidad', 'presidente_comite', 'contador', 'tesorero'];
const rolesSoloSuyas = ['propietario', 'inquilino', 'residente'];

const rolesCrear = ['admin_comunidad', 'presidente_comite', 'contador', 'tesorero', 'conserje'];
const rolesEditar = ['admin_comunidad', 'presidente_comite', 'contador', 'tesorero'];
const rolesAnular = ['admin_comunidad', 'presidente_comite', 'contador', 'tesorero'];
const rolesRegistrarPago = ['tesorero', 'contador', 'admin_comunidad'];
const rolesApelar = ['propietario', 'inquilino', 'residente'];

function isSuperAdminFn(req) {
  if (!req || !req.user) return false;
  if (req.user.is_superadmin) return true;
  const roles = (req.user.roles || []).map(r => String(r).toLowerCase());
  return roles.includes('superadmin');
}

function hasAnyRole(req, rolesList) {
  if (!req || !req.user) return false;
  const userRoles = (req.user.roles || []).map(r => String(r).toLowerCase());
  return rolesList.some(r => userRoles.includes(String(r).toLowerCase()));
}

function isOwnerOfRecord(req) {
  const personaId = req.user && (req.user.persona_id || req.user.sub || req.user.id);
  if (!personaId) return false;
  if (req.multa && (req.multa.creador_persona_id || req.multa.persona_id)) {
    return String(personaId) === String(req.multa.creador_persona_id || req.multa.persona_id);
  }
  if (req.body && (req.body.creador_persona_id || req.body.persona_id)) {
    return String(personaId) === String(req.body.creador_persona_id || req.body.persona_id);
  }
  return false;
}

module.exports = {
  canView: (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'unauthorized' });
      if (isSuperAdminFn(req)) return next();

      if (req.membership && rolesVerTodas.includes(String(req.membership.rol).toLowerCase())) {
        req.canViewAll = true;
        return next();
      }

      if (hasAnyRole(req, rolesVerTodas)) {
        req.canViewAll = true;
        return next();
      }

      if (hasAnyRole(req, rolesSoloSuyas)) {
        req.canViewAll = false;
        req.viewOnlyOwn = true;
        return next();
      }

      return res.status(403).json({ error: 'forbidden' });
    } catch (err) {
      console.error('multasPermissions.canView error', err);
      return res.status(500).json({ error: 'server error' });
    }
  },

  canCreate: (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'unauthorized' });
      if (isSuperAdminFn(req)) return next();
      if (req.membership && rolesCrear.includes(String(req.membership.rol).toLowerCase())) return next();
      if (hasAnyRole(req, rolesCrear)) return next();
      return res.status(403).json({ error: 'forbidden' });
    } catch (err) {
      console.error('multasPermissions.canCreate error', err);
      return res.status(500).json({ error: 'server error' });
    }
  },

  canEdit: (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'unauthorized' });
      if (isSuperAdminFn(req)) return next();
      if (req.membership && rolesEditar.includes(String(req.membership.rol).toLowerCase())) return next();
      if (hasAnyRole(req, rolesEditar)) return next();
      if (isOwnerOfRecord(req)) return next();
      return res.status(403).json({ error: 'forbidden' });
    } catch (err) {
      console.error('multasPermissions.canEdit error', err);
      return res.status(500).json({ error: 'server error' });
    }
  },

  canAnular: (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'unauthorized' });
      if (isSuperAdminFn(req)) return next();
      if (req.membership && rolesAnular.includes(String(req.membership.rol).toLowerCase())) return next();
      if (hasAnyRole(req, rolesAnular)) return next();
      if (isOwnerOfRecord(req)) return next();
      return res.status(403).json({ error: 'forbidden' });
    } catch (err) {
      console.error('multasPermissions.canAnular error', err);
      return res.status(500).json({ error: 'server error' });
    }
  },

  canRegistrarPago: (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'unauthorized' });
      if (isSuperAdminFn(req)) return next();
      if (req.membership && rolesRegistrarPago.includes(String(req.membership.rol).toLowerCase())) return next();
      if (hasAnyRole(req, rolesRegistrarPago)) return next();
      return res.status(403).json({ error: 'forbidden' });
    } catch (err) {
      console.error('multasPermissions.canRegistrarPago error', err);
      return res.status(500).json({ error: 'server error' });
    }
  },

  canApelar: (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'unauthorized' });
      if (isSuperAdminFn(req)) return next();
      if (hasAnyRole(req, rolesApelar)) return next();
      if (isOwnerOfRecord(req)) return next();
      return res.status(403).json({ error: 'forbidden' });
    } catch (err) {
      console.error('multasPermissions.canApelar error', err);
      return res.status(500).json({ error: 'server error' });
    }
  },

  canDelete: (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'unauthorized' });
      if (isSuperAdminFn(req)) return next();
      if (req.membership && rolesEditar.includes(String(req.membership.rol).toLowerCase())) return next();
      if (hasAnyRole(req, rolesEditar)) return next();
      if (isOwnerOfRecord(req)) return next();
      return res.status(403).json({ error: 'forbidden' });
    } catch (err) {
      console.error('multasPermissions.canDelete error', err);
      return res.status(500).json({ error: 'server error' });
    }
  }
};