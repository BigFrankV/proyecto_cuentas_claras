/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from 'next/router';
import React, { useCallback } from 'react';

import { useAuth } from './useAuth';

export enum UserRole {
  SUPERUSER = 'superuser',
  ADMIN = 'admin',
  CONCIERGE = 'concierge',
  ACCOUNTANT = 'accountant',
  TESORERO = 'tesorero',
  PRESIDENTE_COMITE = 'presidente_comite',
  PROVIDER = 'proveedor_servicio',
  RESIDENT = 'residente',
  OWNER = 'propietario',
  TENANT = 'inquilino',
  GUEST = 'guest',
}

// ===========================
// ✅ PERMISOS (MANTENIENDO LOS EXISTENTES + AGREGAR NUEVOS)
// ===========================
export enum Permission {
  // === PERMISOS EXISTENTES (NO TOCAR) ===
  MANAGE_COMMUNITIES = 'manage_communities',
  VIEW_COMMUNITIES = 'view_communities',
  MANAGE_FINANCES = 'manage_finances',
  VIEW_FINANCES = 'view_finances',
  APPROVE_PAYMENTS = 'approve_payments',
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  VIEW_REPORTS = 'view_reports',
  EXPORT_REPORTS = 'export_reports',
  SYSTEM_CONFIG = 'system_config',
  MANAGE_AMENITIES = 'manage_amenities',
  VIEW_TICKETS = 'view_tickets',
  CREATE_TICKETS = 'create_tickets',
  MANAGE_MULTAS = 'manage_multas',
  VIEW_OWN_MEMBERSHIP = 'view_own_membership',

  // === ✅ PERMISOS GRANULARES NUEVOS (AGREGAR) ===
  // Comunidades CRUD
  CREATE_COMUNIDAD = 'create_comunidad',
  EDIT_COMUNIDAD = 'edit_comunidad',
  DELETE_COMUNIDAD = 'delete_comunidad',
  VIEW_COMUNIDAD = 'view_comunidad',

  // Estructura CRUD
  CREATE_EDIFICIO = 'create_edificio',
  EDIT_EDIFICIO = 'edit_edificio',
  DELETE_EDIFICIO = 'delete_edificio',
  VIEW_EDIFICIO = 'view_edificio',
  CREATE_TORRE = 'create_torre',
  EDIT_TORRE = 'edit_torre',
  DELETE_TORRE = 'delete_torre',
  VIEW_TORRE = 'view_torre',
  CREATE_UNIDAD = 'create_unidad',
  EDIT_UNIDAD = 'edit_unidad',
  DELETE_UNIDAD = 'delete_unidad',
  VIEW_UNIDAD = 'view_unidad',

  // Personas y Membresías CRUD
  CREATE_PERSONA = 'create_persona',
  EDIT_PERSONA = 'edit_persona',
  DELETE_PERSONA = 'delete_persona',
  VIEW_PERSONA = 'view_persona',
  CREATE_MEMBRESIA = 'create_membresia',
  EDIT_MEMBRESIA = 'edit_membresia',
  DELETE_MEMBRESIA = 'delete_membresia',
  VIEW_MEMBRESIA = 'view_membresia',

  // Finanzas CRUD
  CREATE_GASTO = 'create_gasto',
  EDIT_GASTO = 'edit_gasto',
  DELETE_GASTO = 'delete_gasto',
  VIEW_GASTO = 'view_gasto',
  CREATE_COMPRA = 'create_compra',
  EDIT_COMPRA = 'edit_compra',
  DELETE_COMPRA = 'delete_compra',
  VIEW_COMPRA = 'view_compra',
  CREATE_CATEGORIA_GASTO = 'create_categoria_gasto',
  EDIT_CATEGORIA_GASTO = 'edit_categoria_gasto',
  DELETE_CATEGORIA_GASTO = 'delete_categoria_gasto',
  VIEW_CATEGORIA_GASTO = 'view_categoria_gasto',
  CREATE_CENTRO_COSTO = 'create_centro_costo',
  EDIT_CENTRO_COSTO = 'edit_centro_costo',
  DELETE_CENTRO_COSTO = 'delete_centro_costo',
  VIEW_CENTRO_COSTO = 'view_centro_costo',
  CREATE_PROVEEDOR = 'create_proveedor',
  EDIT_PROVEEDOR = 'edit_proveedor',
  DELETE_PROVEEDOR = 'delete_proveedor',
  VIEW_PROVEEDOR = 'view_proveedor',

  // Facturación CRUD
  CREATE_EMISION = 'create_emision',
  EDIT_EMISION = 'edit_emision',
  DELETE_EMISION = 'delete_emision',
  VIEW_EMISION = 'view_emision',
  EXECUTE_PRORRATEO = 'execute_prorrateo',
  CREATE_CARGO = 'create_cargo',
  EDIT_CARGO = 'edit_cargo',
  DELETE_CARGO = 'delete_cargo',
  VIEW_CARGO = 'view_cargo',
  VIEW_PAGO = 'view_pago',
  VIEW_RECIBO = 'view_recibo',

  // Medidores CRUD
  CREATE_MEDIDOR = 'create_medidor',
  EDIT_MEDIDOR = 'edit_medidor',
  DELETE_MEDIDOR = 'delete_medidor',
  VIEW_MEDIDOR = 'view_medidor',
  CREATE_LECTURA = 'create_lectura',
  EDIT_LECTURA = 'edit_lectura',
  DELETE_LECTURA = 'delete_lectura',
  VIEW_LECTURA = 'view_lectura',
  IMPORT_LECTURAS = 'import_lecturas',

  // Multas CRUD
  CREATE_MULTA = 'create_multa',
  EDIT_MULTA = 'edit_multa',
  DELETE_MULTA = 'delete_multa',
  VIEW_MULTA = 'view_multa',

  // Apelaciones CRUD
  CREATE_APELACION = 'create_apelacion',
  EDIT_APELACION = 'edit_apelacion',
  DELETE_APELACION = 'delete_apelacion',
  RESOLVE_APELACION = 'resolve_apelacion',
  VIEW_APELACION = 'view_apelacion',

  // Tickets CRUD
  CREATE_TICKET = 'create_ticket',
  EDIT_TICKET = 'edit_ticket',
  DELETE_TICKET = 'delete_ticket',
  VIEW_TICKET = 'view_ticket',

  // Reservas CRUD
  CREATE_RESERVA = 'create_reserva',
  EDIT_RESERVA = 'edit_reserva',
  DELETE_RESERVA = 'delete_reserva',
  VIEW_RESERVA = 'view_reserva',

  // Amenidades CRUD
  CREATE_AMENIDAD = 'create_amenidad',
  EDIT_AMENIDAD = 'edit_amenidad',
  DELETE_AMENIDAD = 'delete_amenidad',
  VIEW_AMENIDAD = 'view_amenidad',

  // Notificaciones
  CREATE_NOTIFICACION = 'create_notificacion',
  VIEW_NOTIFICACION = 'view_notificacion',

  // Bitácora
  CREATE_BITACORA = 'create_bitacora',
  VIEW_BITACORA = 'view_bitacora',

  // Documentos
  VIEW_DOCUMENTO = 'view_documento',

  // Parámetros
  VIEW_PARAMETRO = 'view_parametro',
  EDIT_PARAMETRO = 'edit_parametro',

  // Dashboard
  VIEW_DASHBOARD = 'view_dashboard',
}

// ===========================
// ✅ AGREGAR PERMISOS NUEVOS A LOS ROLES (SIN QUITAR LOS EXISTENTES)
// ===========================
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPERUSER]: Object.values(Permission), // ✅ SUPERUSER tiene TODOS

  [UserRole.ADMIN]: [
    // Permisos existentes (mantener)
    Permission.MANAGE_COMMUNITIES,
    Permission.VIEW_COMMUNITIES,
    Permission.MANAGE_FINANCES,
    Permission.VIEW_FINANCES,
    Permission.APPROVE_PAYMENTS,
    Permission.VIEW_USERS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.SYSTEM_CONFIG,
    Permission.CREATE_EDIFICIO,
    Permission.EDIT_EDIFICIO,
    Permission.DELETE_EDIFICIO,
    Permission.VIEW_EDIFICIO,
    Permission.CREATE_TORRE,
    Permission.EDIT_TORRE,
    Permission.DELETE_TORRE,
    Permission.VIEW_TORRE,
    Permission.CREATE_UNIDAD,
    Permission.EDIT_UNIDAD,
    Permission.DELETE_UNIDAD,
    Permission.VIEW_UNIDAD,
    Permission.CREATE_PERSONA,
    Permission.EDIT_PERSONA,
    Permission.DELETE_PERSONA,
    Permission.VIEW_PERSONA,
    Permission.CREATE_MEMBRESIA,
    Permission.EDIT_MEMBRESIA,
    Permission.DELETE_MEMBRESIA,
    Permission.VIEW_MEMBRESIA,
    Permission.CREATE_GASTO,
    Permission.EDIT_GASTO,
    Permission.DELETE_GASTO,
    Permission.VIEW_GASTO,
    Permission.CREATE_COMPRA,
    Permission.EDIT_COMPRA,
    Permission.DELETE_COMPRA,
    Permission.VIEW_COMPRA,
    Permission.CREATE_CATEGORIA_GASTO,
    Permission.EDIT_CATEGORIA_GASTO,
    Permission.DELETE_CATEGORIA_GASTO,
    Permission.VIEW_CATEGORIA_GASTO,
    Permission.CREATE_CENTRO_COSTO,
    Permission.EDIT_CENTRO_COSTO,
    Permission.DELETE_CENTRO_COSTO,
    Permission.VIEW_CENTRO_COSTO,
    Permission.CREATE_PROVEEDOR,
    Permission.EDIT_PROVEEDOR,
    Permission.DELETE_PROVEEDOR,
    Permission.VIEW_PROVEEDOR,
    Permission.CREATE_EMISION,
    Permission.EDIT_EMISION,
    Permission.DELETE_EMISION,
    Permission.VIEW_EMISION,
    Permission.EXECUTE_PRORRATEO,
    Permission.CREATE_CARGO,
    Permission.EDIT_CARGO,
    Permission.DELETE_CARGO,
    Permission.VIEW_CARGO,
    Permission.VIEW_PAGO,
    Permission.VIEW_RECIBO,
    Permission.CREATE_MEDIDOR,
    Permission.EDIT_MEDIDOR,
    Permission.DELETE_MEDIDOR,
    Permission.VIEW_MEDIDOR,
    Permission.CREATE_LECTURA,
    Permission.EDIT_LECTURA,
    Permission.DELETE_LECTURA,
    Permission.VIEW_LECTURA,
    Permission.IMPORT_LECTURAS,
    Permission.CREATE_MULTA,
    Permission.EDIT_MULTA,
    Permission.DELETE_MULTA,
    Permission.VIEW_MULTA,
    Permission.EDIT_APELACION,
    Permission.RESOLVE_APELACION,
    Permission.VIEW_APELACION,
    Permission.VIEW_RESERVA,
    Permission.CREATE_AMENIDAD,
    Permission.EDIT_AMENIDAD,
    Permission.DELETE_AMENIDAD,
    Permission.VIEW_AMENIDAD,
    Permission.CREATE_NOTIFICACION,
    Permission.VIEW_NOTIFICACION,
    Permission.CREATE_BITACORA,
    Permission.VIEW_BITACORA,
    Permission.VIEW_DOCUMENTO,
    Permission.EDIT_PARAMETRO,
    Permission.VIEW_PARAMETRO,
    Permission.VIEW_DASHBOARD,
    Permission.EDIT_TICKET,
    Permission.DELETE_TICKET,
    Permission.VIEW_TICKET,
  ],

  [UserRole.CONCIERGE]: [
    Permission.VIEW_COMMUNITIES,
    Permission.MANAGE_AMENITIES,
    Permission.VIEW_TICKETS,
    Permission.VIEW_AMENIDAD,
    Permission.VIEW_RESERVA,
    Permission.VIEW_BITACORA,
    Permission.EDIT_TICKET,
    Permission.CREATE_BITACORA,
    Permission.VIEW_TICKET,
    Permission.VIEW_DASHBOARD,
  ],

  [UserRole.ACCOUNTANT]: [
    Permission.VIEW_COMMUNITIES,
    Permission.VIEW_FINANCES,
    Permission.APPROVE_PAYMENTS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_COMUNIDAD,
    Permission.VIEW_EDIFICIO,
    Permission.VIEW_UNIDAD,
    Permission.VIEW_PERSONA,
    Permission.CREATE_GASTO,
    Permission.EDIT_GASTO,
    Permission.DELETE_GASTO,
    Permission.VIEW_GASTO,
    Permission.CREATE_COMPRA,
    Permission.EDIT_COMPRA,
    Permission.DELETE_COMPRA,
    Permission.VIEW_COMPRA,
    Permission.CREATE_CATEGORIA_GASTO,
    Permission.EDIT_CATEGORIA_GASTO,
    Permission.DELETE_CATEGORIA_GASTO,
    Permission.VIEW_CATEGORIA_GASTO,
    Permission.CREATE_CENTRO_COSTO,
    Permission.EDIT_CENTRO_COSTO,
    Permission.DELETE_CENTRO_COSTO,
    Permission.VIEW_CENTRO_COSTO,
    Permission.CREATE_PROVEEDOR,
    Permission.EDIT_PROVEEDOR,
    Permission.DELETE_PROVEEDOR,
    Permission.VIEW_PROVEEDOR,
    Permission.CREATE_EMISION,
    Permission.EDIT_EMISION,
    Permission.VIEW_EMISION,
    Permission.EXECUTE_PRORRATEO,
    Permission.CREATE_CARGO,
    Permission.EDIT_CARGO,
    Permission.VIEW_CARGO,
    Permission.VIEW_PAGO,
    Permission.VIEW_RECIBO,
    Permission.CREATE_MULTA,
    Permission.EDIT_MULTA,
    Permission.VIEW_MULTA,
    Permission.RESOLVE_APELACION,
    Permission.VIEW_APELACION,
    Permission.VIEW_DASHBOARD,
  ],

  [UserRole.TESORERO]: [
    Permission.VIEW_COMMUNITIES,
    Permission.VIEW_FINANCES,
    Permission.APPROVE_PAYMENTS,
    Permission.VIEW_COMUNIDAD,
    Permission.VIEW_EMISION,
    Permission.VIEW_GASTO,
    Permission.VIEW_COMPRA,
    Permission.VIEW_CARGO,
    Permission.VIEW_PAGO,
    Permission.VIEW_RECIBO,
    Permission.CREATE_MULTA,
    Permission.EDIT_MULTA,
    Permission.DELETE_MULTA,
    Permission.VIEW_MULTA,
    Permission.RESOLVE_APELACION,
    Permission.VIEW_APELACION,
    Permission.VIEW_DASHBOARD,
  ],

  [UserRole.PRESIDENTE_COMITE]: [
    Permission.VIEW_COMMUNITIES,
    Permission.MANAGE_MULTAS,
    Permission.VIEW_COMUNIDAD,
    Permission.VIEW_EMISION,
    Permission.VIEW_GASTO,
    Permission.CREATE_MULTA,
    Permission.EDIT_MULTA,
    Permission.DELETE_MULTA,
    Permission.VIEW_MULTA,
    Permission.VIEW_APELACION,
    Permission.VIEW_DASHBOARD,
  ],

  [UserRole.PROVIDER]: [
    Permission.VIEW_COMMUNITIES,
    Permission.VIEW_TICKETS,
    Permission.VIEW_TICKET,
  ],

  [UserRole.RESIDENT]: [
    Permission.VIEW_COMMUNITIES,
    Permission.CREATE_TICKETS,
    Permission.VIEW_COMUNIDAD,
    Permission.VIEW_EDIFICIO,
    Permission.VIEW_TORRE,
    Permission.VIEW_UNIDAD,
    Permission.VIEW_PERSONA,
    Permission.VIEW_MEMBRESIA,
    // ✅ AGREGAR permisos de finanzas (gastos comunes)
    Permission.VIEW_FINANCES, // ✅ Ver finanzas generales
    // Permission.VIEW_EMISION solo para admins (backend restringe)
    Permission.VIEW_CARGO,    // ✅ Ver cargos
    Permission.VIEW_PAGO,     // ✅ Ver pagos (los suyos)
    Permission.VIEW_RECIBO,
    Permission.VIEW_GASTO,
    Permission.VIEW_COMPRA,
    Permission.VIEW_CATEGORIA_GASTO,
    Permission.VIEW_CENTRO_COSTO,
    Permission.VIEW_PROVEEDOR,
    Permission.VIEW_MEDIDOR,
    Permission.VIEW_LECTURA,
   
    Permission.VIEW_MULTA,
    Permission.VIEW_TICKETS,
    
    Permission.CREATE_RESERVA,
    Permission.EDIT_RESERVA,
    Permission.DELETE_RESERVA,
    Permission.VIEW_RESERVA,
    Permission.VIEW_AMENIDAD,
    Permission.VIEW_NOTIFICACION,
    Permission.VIEW_BITACORA,
    Permission.VIEW_PARAMETRO,
    Permission.CREATE_TICKET,
    Permission.VIEW_TICKET,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_REPORTS,
  ],

  [UserRole.OWNER]: [
    Permission.VIEW_COMMUNITIES,
    Permission.VIEW_OWN_MEMBERSHIP,
    Permission.VIEW_COMUNIDAD,
    Permission.VIEW_EDIFICIO,
    Permission.VIEW_TORRE,
    Permission.VIEW_UNIDAD,
    Permission.VIEW_PERSONA,
    Permission.VIEW_MEMBRESIA,
    // ✅ AGREGAR permisos de finanzas (gastos comunes)
    Permission.VIEW_FINANCES, // ✅ Ver finanzas generales
    // Permission.VIEW_EMISION solo para admins (backend restringe)
    Permission.VIEW_CARGO,    // ✅ Ver cargos
    Permission.VIEW_PAGO,     // ✅ Ver pagos
    Permission.VIEW_RECIBO,
    Permission.VIEW_GASTO,
    Permission.VIEW_COMPRA,
    Permission.VIEW_CATEGORIA_GASTO,
    Permission.VIEW_CENTRO_COSTO,
    Permission.VIEW_PROVEEDOR,
    Permission.VIEW_MEDIDOR,
    Permission.VIEW_LECTURA,
    Permission.VIEW_MULTA,
    Permission.CREATE_TICKETS,
    Permission.VIEW_TICKETS,
    Permission.CREATE_RESERVA,
    Permission.EDIT_RESERVA,
    Permission.DELETE_RESERVA,
    Permission.VIEW_RESERVA,
    Permission.VIEW_AMENIDAD,
    Permission.VIEW_NOTIFICACION,
    Permission.VIEW_BITACORA,
    Permission.VIEW_DOCUMENTO,
    Permission.VIEW_PARAMETRO,
    Permission.CREATE_TICKET,
    Permission.VIEW_TICKET,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_REPORTS,
  ],

  [UserRole.TENANT]: [
    Permission.VIEW_COMMUNITIES,
    Permission.VIEW_COMUNIDAD,
    Permission.VIEW_EDIFICIO,
    Permission.VIEW_TORRE,
    Permission.VIEW_UNIDAD,
    Permission.VIEW_PERSONA,
    Permission.VIEW_MEMBRESIA,
    // ✅ AGREGAR permisos de finanzas (gastos comunes)
    Permission.VIEW_FINANCES, // ✅ Ver finanzas generales
    // Permission.VIEW_EMISION solo para admins (backend restringe)
    Permission.VIEW_CARGO,    // ✅ Ver cargos
    Permission.VIEW_PAGO,     // ✅ Ver pagos
    Permission.VIEW_RECIBO,
    Permission.VIEW_GASTO,
    Permission.VIEW_COMPRA,
    Permission.VIEW_CATEGORIA_GASTO,
    Permission.VIEW_CENTRO_COSTO,
    Permission.VIEW_PROVEEDOR,
    Permission.VIEW_MEDIDOR,
    Permission.VIEW_LECTURA,
    Permission.VIEW_MULTA,
    Permission.CREATE_TICKETS,
    Permission.VIEW_TICKETS,
    Permission.VIEW_MEDIDOR,
    Permission.VIEW_LECTURA,
    Permission.VIEW_MULTA,
    Permission.CREATE_TICKETS,
    Permission.VIEW_TICKETS,
    Permission.CREATE_RESERVA,
    Permission.EDIT_RESERVA,
    Permission.DELETE_RESERVA,
    Permission.VIEW_RESERVA,
    Permission.VIEW_AMENIDAD,
    Permission.VIEW_NOTIFICACION,
    Permission.VIEW_BITACORA,
    Permission.VIEW_PARAMETRO,
    Permission.CREATE_TICKET,
    Permission.VIEW_TICKET,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_REPORTS,
  ],

  [UserRole.GUEST]: [],
};

// Hook para manejo de roles y permisos (actualizado)
export function usePermissions() {
  const { user } = useAuth();

  // Determinar el rol del usuario (actualizado con agrupamiento completo)
  const getUserRole = (): UserRole => {
    if (!user) {return UserRole.GUEST;}
    if (user.is_superadmin) {return UserRole.SUPERUSER;}

    const roles = user.roles?.map((r: any) => typeof r === 'string' ? r.toLowerCase() : r.rol?.toLowerCase()).filter(Boolean) || [];
    if (roles.includes('admin_comunidad')) {return UserRole.ADMIN;}
    if (roles.includes('conserje')) {return UserRole.CONCIERGE;}
    if (roles.includes('contador')) {return UserRole.ACCOUNTANT;}
    if (roles.includes('tesorero')) {return UserRole.TESORERO;}
    if (roles.includes('presidente_comite')) {return UserRole.PRESIDENTE_COMITE;}
    if (roles.includes('proveedor_servicio')) {return UserRole.PROVIDER;}
    if (roles.includes('residente')) {return UserRole.RESIDENT;}
    if (roles.includes('propietario')) {return UserRole.OWNER;}
    if (roles.includes('inquilino')) {return UserRole.TENANT;}
    if (roles.includes('proveedor_servicio')) {return UserRole.PROVIDER;}

    // Fallback para Patrick
    if (user.username === 'patrick' || user.username === 'patricio.quintanilla') {return UserRole.SUPERUSER;}

    return UserRole.GUEST;
  };

  const currentRole = getUserRole();

  // ✅ NUEVO: Verificar acceso a comunidad específica
  const hasAccessToCommunity = (communityId?: number): boolean => {
    // Superadmin ve todas las comunidades
    if (user?.is_superadmin) {
      return true;
    }

    // Si no hay comunidad específica, permitir
    if (!communityId) {
      return true;
    }

    // Verificar si el usuario pertenece a esa comunidad
    if (user?.memberships && Array.isArray(user.memberships)) {
      return user.memberships.some(
        (membership: any) => membership.comunidadId === communityId,
      );
    }

    // Fallback: verificar comunidad_id principal
    return user?.comunidad_id === communityId;
  };

  // ✅ NUEVO: Obtener comunidades del usuario
  const getUserCommunities = useCallback(() => {
    if (user?.is_superadmin) {
      return [];
    } // Superadmin ve todas
    return user?.memberships || [];
  }, []); // Dependencias vacías, ya que no depende de nada

  // ✅ NUEVO: Verificar si tiene un rol específico en una comunidad
  const hasRoleInCommunity = (
    communityId: number,
    roleToCheck: string,
  ): boolean => {
    if (user?.is_superadmin) {
      return true;
    }

    return (
      user?.memberships?.some(
        (membership: any) =>
          membership.comunidadId === communityId &&
          membership.rol.toLowerCase() === roleToCheck.toLowerCase(),
      ) || false
    );
  };

  // ✅ MODIFICADO: Verificar permisos con contexto de comunidad y checks específicos
  const hasPermission = (
    permission: Permission,
    communityId?: number,
  ): boolean => {
    // Si es superadmin, permitir siempre
    if (user?.is_superadmin) {
      return true;
    }

    // Determinar el rol a usar: si hay communityId, usar rol de esa comunidad
    let roleToCheck = currentRole;
    if (communityId && user?.memberships) {
      const membership = user.memberships.find(
        (m: any) => m.comunidadId === communityId || m.comunidad_id === communityId,
      );
      if (membership) {
        const rolComunidad = membership.rol?.toLowerCase();
        // Mapear rol de la comunidad a UserRole
        if (rolComunidad === 'admin_comunidad' || rolComunidad === 'admin') {
          roleToCheck = UserRole.ADMIN;
        } else if (rolComunidad === 'propietario') {
          roleToCheck = UserRole.OWNER;
        } else if (rolComunidad === 'inquilino') {
          roleToCheck = UserRole.TENANT;
        } else if (rolComunidad === 'residente') {
          roleToCheck = UserRole.RESIDENT;
        } else if (rolComunidad === 'conserje') {
          roleToCheck = UserRole.CONCIERGE;
        } else if (rolComunidad === 'contador') {
          roleToCheck = UserRole.ACCOUNTANT;
        } else if (rolComunidad === 'tesorero') {
          roleToCheck = UserRole.TESORERO;
        } else if (rolComunidad === 'presidente_comite') {
          roleToCheck = UserRole.PRESIDENTE_COMITE;
        }
      } else {
        // Si no pertenece a esa comunidad, denegar
        return false;
      }
    }

    const rolePermissions = ROLE_PERMISSIONS[roleToCheck] || [];
    const hasBasePermission = rolePermissions.includes(permission);

    // Si no tiene el permiso base con ese rol, denegar
    if (!hasBasePermission) {
      return false;
    }

    // Para ADMIN, limitar MANAGE_COMMUNITIES a comunidades propias
    if (roleToCheck === UserRole.ADMIN && permission === Permission.MANAGE_COMMUNITIES) {
      if (!communityId) {
        return false; // No permitir gestión global (crear/eliminar)
      }
      return hasAccessToCommunity(communityId); // Solo editar si pertenece
    }

    // Si no se especifica comunidad, verificar solo el permiso base
    if (!communityId) {
      return true;
    }

    // Verificar acceso a la comunidad específica
    return hasAccessToCommunity(communityId);
  };

  // Verificar si el usuario tiene un rol específico o superior
  const hasRole = (role: UserRole): boolean => {
    const roleHierarchy = [
      UserRole.TENANT,
      UserRole.RESIDENT,
      UserRole.OWNER,
      UserRole.PROVIDER,
      UserRole.CONCIERGE,
      UserRole.ACCOUNTANT,
      UserRole.TESORERO,      // Agregar
      UserRole.PRESIDENTE_COMITE, // Agregar
      UserRole.ADMIN,
      UserRole.SUPERUSER,
    ];
    const userRoleIndex = roleHierarchy.indexOf(currentRole);
    const requiredRoleIndex = roleHierarchy.indexOf(role);

    return userRoleIndex >= requiredRoleIndex;
  };

  // Verificar si el usuario es superuser
  const isSuperUser = (): boolean => {
    return currentRole === UserRole.SUPERUSER;
  };

  // Obtener el nombre legible del rol del usuario
  const getUserRoleName = (): string => {
    const roleNames: Record<UserRole, string> = {
      [UserRole.SUPERUSER]: 'Superusuario',
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.CONCIERGE]: 'Conserje',
      [UserRole.ACCOUNTANT]: 'Contador',
      [UserRole.TESORERO]: 'Tesorero',
      [UserRole.PRESIDENTE_COMITE]: 'Presidente de Comité',
      [UserRole.PROVIDER]: 'Proveedor de Servicio',
      [UserRole.RESIDENT]: 'Residente',
      [UserRole.OWNER]: 'Propietario',
      [UserRole.TENANT]: 'Inquilino',
      [UserRole.GUEST]: 'Invitado',
    };
    return roleNames[currentRole] || 'Usuario';
  };

  // Obtener todos los permisos del usuario actual
  const getUserPermissions = (): Permission[] => {
    return ROLE_PERMISSIONS[currentRole] || [];
  };

  // ✅ NUEVO: Verificar si puede administrar una comunidad específica
  const canManageCommunity = (communityId?: number): boolean => {
    return hasPermission(Permission.MANAGE_COMMUNITIES, communityId);
  };

  // ✅ NUEVO: Verificar si puede ver finanzas de una comunidad específica
  const canViewCommunityFinances = (communityId?: number): boolean => {
    return hasPermission(Permission.VIEW_FINANCES, communityId);
  };

  // ✅ NUEVO: Verificar si puede gestionar usuarios de una comunidad específica
  const canManageCommunityUsers = (communityId?: number): boolean => {
    return hasPermission(Permission.MANAGE_USERS, communityId);
  };

  return {
    currentRole,
    hasPermission,
    hasRole,
    isSuperUser,
    getUserRoleName, // ✅ Incluir la nueva función aquí
    getUserPermissions,
    // ✅ NUEVAS FUNCIONES para multi-tenancy
    hasAccessToCommunity,
    getUserCommunities,  // Agrega esta línea
    hasRoleInCommunity,
    canManageCommunity,
    canViewCommunityFinances,
    canManageCommunityUsers,

    // Helpers para UI (actualizados para soportar comunidad específica)
    canManageCommunities: hasPermission(Permission.MANAGE_COMMUNITIES),
    canManageFinances: hasPermission(Permission.MANAGE_FINANCES),
    canManageUsers: hasPermission(Permission.MANAGE_USERS),
    canViewReports: hasPermission(Permission.VIEW_REPORTS),
    canExportReports: hasPermission(Permission.EXPORT_REPORTS),
    canConfigureSystem: hasPermission(Permission.SYSTEM_CONFIG),

    // Añadir nuevos permisos en return
    canManageAmenities: hasPermission(Permission.MANAGE_AMENITIES),
    canViewTickets: hasPermission(Permission.VIEW_TICKETS),
    canCreateTickets: hasPermission(Permission.CREATE_TICKETS),
    canManageMultas: hasPermission(Permission.MANAGE_MULTAS),
    canViewOwnMembership: hasPermission(Permission.VIEW_OWN_MEMBERSHIP),
  };
}

// Componente para proteger contenido basado en permisos
interface PermissionGuardProps {
  permission?: Permission;
  role?: UserRole;
  communityId?: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  permission,
  role,
  communityId,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasRole } = usePermissions();

  const hasAccess =
    (permission && hasPermission(permission, communityId)) ||
    (role && hasRole(role)) ||
    (!permission && !role); // Si no se especifica permiso/rol, mostrar siempre

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Componente para proteger páginas completas basado en permisos
interface ProtectedPageProps {
  permission?: Permission;
  role?: UserRole;
  allowedRoles?: string[]; // Roles específicos permitidos (usando getUserRole)
  children: React.ReactNode;
  redirectTo?: string; // Ruta a la que redirigir si no tiene acceso
  showAccessDenied?: boolean; // Mostrar página de acceso denegado en lugar de redirigir
}

export function ProtectedPage({
  permission,
  role,
  allowedRoles,
  children,
  redirectTo = '/dashboard',
  showAccessDenied = true,
}: ProtectedPageProps) {
  const { hasPermission, hasRole, isSuperUser, currentRole } = usePermissions();  // ✅ Usar hook
  const { user } = useAuth();
  const router = useRouter();

  // Superadmin siempre tiene acceso
  if (isSuperUser()) {
    return <>{children}</>;
  }

  // Verificar acceso basado en parámetros
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (role) {
    hasAccess = hasRole(role);
  } else if (allowedRoles && allowedRoles.length > 0) {
    hasAccess = allowedRoles.some(role => user?.roles?.some((r: any) =>
      (typeof r === 'string' ? r : r.rol) === role,
    ));
  } else {
    hasAccess = false;
  }

  // Si no tiene acceso
  if (!hasAccess) {
    if (showAccessDenied) {
      // Mostrar página de acceso denegado
      return (
        <div className='container-fluid'>
          <div className='row justify-content-center align-items-center min-vh-100'>
            <div className='col-12 col-md-8 col-lg-6'>
              <div className='card shadow-lg border-0'>
                <div className='card-body text-center p-5'>
                  <div className='mb-4'>
                    <span
                      className='material-icons text-danger'
                      style={{ fontSize: '80px' }}
                    >
                      block
                    </span>
                  </div>
                  <h2 className='card-title mb-3'>Acceso Denegado</h2>
                  <p className='card-text text-muted mb-4'>
                    No tienes permisos para acceder a esta página.
                    <br />
                    Si crees que esto es un error, contacta al administrador.
                  </p>
                  <div className='d-flex gap-2 justify-content-center'>
                    <button
                      type='button'
                      className='btn btn-primary'
                      onClick={() => router.back()}
                    >
                      <span className='material-icons align-middle me-1'>
                        arrow_back
                      </span>
                      Volver Atrás
                    </button>
                    <button
                      type='button'
                      className='btn btn-outline-primary'
                      onClick={() => router.push('/dashboard')}
                    >
                      <span className='material-icons align-middle me-1'>
                        home
                      </span>
                      Ir al Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Redirigir a la ruta especificada
      router.push(redirectTo);
      return (
        <div className='d-flex justify-content-center align-items-center min-vh-100'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Redirigiendo...</span>
          </div>
        </div>
      );
    }
  }

  // Tiene acceso, mostrar contenido
  return <>{children}</>;
}
