/**
 * Middleware de permisos específico para el módulo de proveedores
 * Implementa los 6 roles del sistema: superadmin, admin, comite, tesorero, conserje, residente
 */

const proveedoresPermissions = {

    /**
     * ✅ Permisos para VER proveedores
     * Roles permitidos: superadmin, admin, comite, tesorero, conserje, residente, propietario
     */
    canView: (req, res, next) => {
        const { user } = req;

        console.log('🛡️ Verificando permisos canView para:', user.username);
        console.log('🏢 Membresías del usuario:', user.memberships);
        console.log('🎯 Roles del usuario:', user.roles);

        // Superadmin siempre puede ver
        if (user.is_superadmin) {
            console.log('👑 Superadmin detectado - acceso concedido');
            return next();
        }

        // Verificar que el usuario tenga comunidad
        if (!user.memberships || !Array.isArray(user.memberships) || user.memberships.length === 0) {
            console.log('❌ Usuario sin membresías');
            return res.status(403).json({
                success: false,
                error: 'Usuario no tiene comunidad asignada',
                details: 'No se encontraron membresías para el usuario'
            });
        }

        // ✅ Usar comunidadId en lugar de comunidad_id
        const comunidadId = user.memberships[0].comunidadId;
        console.log('🏠 Comunidad del usuario:', comunidadId);

        if (!comunidadId) {
            console.log('❌ ComunidadId no encontrado');
            return res.status(403).json({
                success: false,
                error: 'Usuario no tiene comunidad asignada',
                details: 'ComunidadId no encontrado en membresías'
            });
        }

        // Verificar roles permitidos
        const rolesPermitidos = ['admin', 'comite', 'tesorero', 'conserje', 'residente', 'propietario'];
        const tieneRolValido = user.roles?.some(rol => rolesPermitidos.includes(rol));

        if (!tieneRolValido) {
            console.log('❌ Usuario sin rol válido:', user.roles);
            return res.status(403).json({
                success: false,
                error: 'No tienes permisos para ver proveedores',
                required_roles: rolesPermitidos
            });
        }

        console.log('✅ Permisos canView verificados correctamente');
        return next();
    },

    /**
     * ✅ Permisos para VER datos COMPLETOS de proveedores
     * Roles permitidos: superadmin, admin, comite (datos financieros, etc.)
     */
    canViewFull: (req, res, next) => {
        const { user } = req;

        console.log('🛡️ Verificando permisos canViewFull para:', user.username);

        if (user.is_superadmin ||
            user.roles?.includes('admin') ||
            user.roles?.includes('comite')) {
            console.log('✅ Permisos canViewFull verificados');
            return next();
        }

        return res.status(403).json({
            success: false,
            error: 'No tienes permisos para ver información completa de proveedores',
            required_roles: ['admin', 'comite', 'superadmin']
        });
    },

    /**
     * ✅ Permisos para CREAR proveedores
     * Roles permitidos: superadmin, admin
     */
    canCreate: (req, res, next) => {
        const { user } = req;

        console.log('🛡️ Verificando permisos canCreate para:', user.username);

        if (user.is_superadmin || user.roles?.includes('admin')) {
            console.log('✅ Permisos canCreate verificados');
            return next();
        }

        return res.status(403).json({
            success: false,
            error: 'No tienes permisos para crear proveedores',
            required_roles: ['admin', 'superadmin']
        });
    },

    /**
     * ✅ Permisos para EDITAR proveedores
     * Roles permitidos: superadmin, admin
     */
    canEdit: (req, res, next) => {
        const { user } = req;

        console.log('🛡️ Verificando permisos canEdit para:', user.username);

        if (user.is_superadmin || user.roles?.includes('admin')) {
            console.log('✅ Permisos canEdit verificados');
            return next();
        }

        return res.status(403).json({
            success: false,
            error: 'No tienes permisos para editar proveedores',
            required_roles: ['admin', 'superadmin']
        });
    },

    /**
     * ✅ Permisos para ELIMINAR proveedores
     * Roles permitidos: solo superadmin y admin
     */
    canDelete: (req, res, next) => {
        const { user } = req;

        console.log('🛡️ Verificando permisos canDelete para:', user.username);

        if (user.is_superadmin || user.roles?.includes('admin')) {
            console.log('✅ Permisos canDelete verificados');
            return next();
        }

        return res.status(403).json({
            success: false,
            error: 'No tienes permisos para eliminar proveedores',
            required_roles: ['admin', 'superadmin']
        });
    },

    /**
     * ✅ Permisos para VER TODOS los proveedores (multi-comunidad)
     * Solo superadmin
     */
    canViewAll: (req, res, next) => {
        const { user } = req;

        console.log('🛡️ Verificando permisos canViewAll para:', user.username);

        if (user.is_superadmin) {
            console.log('✅ Permisos canViewAll verificados');
            return next();
        }

        return res.status(403).json({
            success: false,
            error: 'Solo superadmin puede ver proveedores de todas las comunidades',
            required_roles: ['superadmin']
        });
    },

    /**
     * ✅ CORREGIDO - Middleware para verificar acceso a proveedor específico
     * Verifica que el usuario tenga acceso al proveedor según su comunidad
     */
    canAccessProveedor: async (req, res, next) => {
        const { user } = req;
        const proveedorId = Number(req.params.id);

        console.log('🔍 Verificando acceso al proveedor:', proveedorId, 'para usuario:', user.username);

        try {
            // Superadmin puede acceder a cualquier proveedor
            if (user.is_superadmin) {
                console.log('👑 Superadmin - acceso total al proveedor');
                return next();
            }

            // ✅ CORREGIDO: Usar comunidadId consistente
            const comunidadId = user.memberships?.[0]?.comunidadId;
            if (!comunidadId) {
                console.log('❌ Usuario sin comunidad asignada');
                return res.status(403).json({
                    success: false,
                    error: 'Usuario no tiene comunidad asignada'
                });
            }

            // Verificar que el proveedor pertenece a la comunidad del usuario
            const db = require('../db');
            const [rows] = await db.query(
                'SELECT comunidad_id FROM proveedor WHERE id = ?',
                [proveedorId]
            );

            if (!rows.length) {
                console.log('❌ Proveedor no encontrado:', proveedorId);
                return res.status(404).json({
                    success: false,
                    error: 'Proveedor no encontrado'
                });
            }

            const proveedorComunidadId = rows[0].comunidad_id;
            console.log('🏠 Comunidad del proveedor:', proveedorComunidadId);
            console.log('🏠 Comunidad del usuario:', comunidadId);

            if (proveedorComunidadId !== comunidadId) {
                console.log('❌ Proveedor no pertenece a la comunidad del usuario');
                return res.status(403).json({
                    success: false,
                    error: 'No tienes permisos para acceder a este proveedor'
                });
            }

            console.log('✅ Acceso al proveedor verificado correctamente');
            return next();

        } catch (error) {
            console.error('❌ Error verificando acceso a proveedor:', error);
            return res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
};

module.exports = proveedoresPermissions;