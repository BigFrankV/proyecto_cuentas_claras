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
  return (req, res, next) => {
    // Superadmin siempre puede todo
    if (req.user.is_superadmin) return next();
    
    // Obtener rol de la membresía
    const membershipRole = req.membership?.rol;
    if (!membershipRole) {
      return res.status(403).json({ error: 'No membership found' });
    }
    
    const permissions = GASTOS_PERMISSIONS[membershipRole];
    if (!permissions || !permissions[action]) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    // Adjuntar permisos específicos al request
    req.gastoPermissions = permissions;
    next();
  };
}

module.exports = { checkGastoPermission, GASTOS_PERMISSIONS };