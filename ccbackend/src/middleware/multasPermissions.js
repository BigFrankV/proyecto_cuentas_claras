// ✅ CREAR ARCHIVO: ccbackend/src/middleware/multasPermissions.js

const { hasRole, isSuperAdmin } = require('./authorize');
const db = require('../db');

/**
 * Middleware de permisos para MULTAS
 * Basado en los 20 roles del sistema
 */
const MultasPermissions = {
  
  /**
   * VER MULTAS
   * - Superadmin, Sistema, Soporte: Ven todas las comunidades
   * - Roles administrativos: Ven todas de su comunidad
   * - Propietario, Inquilino, Residente: Solo ven SUS multas
   */
  canView: (req, res, next) => {
    const user = req.user;

    // Roles que pueden ver todas las multas de la comunidad
    const rolesVerTodas = [
      'superadmin', 'sistema', 'soporte_tecnico',
      'presidente_comite', 'admin_comunidad', 'sindico', 'contador', 'admin_externo',
      'tesorero', 'conserje', 'revisor_cuentas', 'auditor_externo',
      'moderador_comunidad', 'secretario'
    ];

    // Roles que solo ven sus propias multas
    const rolesSoloSuyas = ['propietario', 'inquilino', 'residente'];

    if (isSuperAdmin(req) || hasRole(req, rolesVerTodas)) {
      req.canViewAll = true;
      return next();
    }

    if (hasRole(req, rolesSoloSuyas)) {
      req.canViewAll = false;
      req.viewOnlyOwn = true;
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      error: 'No tiene permisos para ver multas' 
    });
  },

  /**
   * CREAR MULTAS
   */
  canCreate: (req, res, next) => {
    const rolesPermitidos = [
      'superadmin', 'sistema',
      'presidente_comite', 'admin_comunidad', 'sindico', 
      'contador', 'admin_externo', 'conserje'
    ];

    if (isSuperAdmin(req) || hasRole(req, rolesPermitidos)) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      error: 'No tiene permisos para crear multas' 
    });
  },

  /**
   * EDITAR MULTAS
   */
  canEdit: (req, res, next) => {
    const rolesPermitidos = [
      'superadmin', 'soporte_tecnico',
      'presidente_comite', 'admin_comunidad', 'sindico', 
      'contador', 'admin_externo'
    ];

    if (isSuperAdmin(req) || hasRole(req, rolesPermitidos)) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      error: 'No tiene permisos para editar multas' 
    });
  },

  /**
   * ANULAR MULTAS
   */
  canAnular: (req, res, next) => {
    const rolesPermitidos = [
      'superadmin',
      'presidente_comite', 'admin_comunidad'
    ];

    if (isSuperAdmin(req) || hasRole(req, rolesPermitidos)) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      error: 'Solo Presidente o Admin puede anular multas' 
    });
  },

  /**
   * REGISTRAR PAGO
   */
  canRegistrarPago: (req, res, next) => {
    const rolesPermitidos = [
      'superadmin',
      'presidente_comite', 'admin_comunidad', 'sindico', 
      'contador', 'tesorero'
    ];

    if (isSuperAdmin(req) || hasRole(req, rolesPermitidos)) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      error: 'No tiene permisos para registrar pagos' 
    });
  },

  /**
   * ELIMINAR MULTAS
   */
  canDelete: (req, res, next) => {
    const rolesPermitidos = [
      'superadmin',
      'presidente_comite', 'admin_comunidad'
    ];

    if (isSuperAdmin(req) || hasRole(req, rolesPermitidos)) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      error: 'Solo Presidente o Admin puede eliminar multas' 
    });
  },

  /**
   * CREAR APELACIÓN
   */
  canApelar: async (req, res, next) => {
    const user = req.user;
    const multaId = req.params.id;

    if (isSuperAdmin(req)) {
      return next();
    }

    if (!hasRole(req, ['propietario', 'inquilino', 'residente'])) {
      return res.status(403).json({ 
        success: false, 
        error: 'Solo propietarios e inquilinos pueden apelar' 
      });
    }

    try {
      const [multa] = await db.query(
        'SELECT unidad_id FROM multa WHERE id = ?',
        [multaId]
      );

      if (!multa.length) {
        return res.status(404).json({ 
          success: false, 
          error: 'Multa no encontrada' 
        });
      }

      const [relacion] = await db.query(`
        SELECT 1 FROM persona_unidad 
        WHERE persona_id = ? AND unidad_id = ? AND activo = 1
      `, [user.persona_id, multa[0].unidad_id]);

      if (!relacion.length) {
        return res.status(403).json({ 
          success: false, 
          error: 'Solo puede apelar multas de su unidad' 
        });
      }

      return next();

    } catch (error) {
      console.error('Error verificando permisos de apelación:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Error verificando permisos' 
      });
    }
  }
};

module.exports = MultasPermissions;