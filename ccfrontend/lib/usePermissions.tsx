import React from 'react'; // ✅ AGREGAR ESTA LÍNEA

import { useAuth } from './useAuth';

// Definición de roles del sistema
export enum UserRole {
  SUPERUSER = 'superuser',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

// Definición de permisos
export enum Permission {
  // Gestión de comunidades
  MANAGE_COMMUNITIES = 'manage_communities',
  VIEW_COMMUNITIES = 'view_communities',

  // Gestión financiera
  MANAGE_FINANCES = 'manage_finances',
  VIEW_FINANCES = 'view_finances',
  APPROVE_PAYMENTS = 'approve_payments',

  // Gestión de usuarios
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',

  // Reportes
  VIEW_REPORTS = 'view_reports',
  EXPORT_REPORTS = 'export_reports',

  // Configuración del sistema
  SYSTEM_CONFIG = 'system_config',
}

// Mapa de roles y sus permisos
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPERUSER]: [
    // Superuser tiene todos los permisos
    Permission.MANAGE_COMMUNITIES,
    Permission.VIEW_COMMUNITIES,
    Permission.MANAGE_FINANCES,
    Permission.VIEW_FINANCES,
    Permission.APPROVE_PAYMENTS,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.SYSTEM_CONFIG,
  ],
  [UserRole.ADMIN]: [
    Permission.MANAGE_COMMUNITIES,
    Permission.VIEW_COMMUNITIES,
    Permission.MANAGE_FINANCES,
    Permission.VIEW_FINANCES,
    Permission.APPROVE_PAYMENTS,
    Permission.VIEW_USERS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
  ],
  [UserRole.MANAGER]: [
    Permission.VIEW_COMMUNITIES,
    Permission.VIEW_FINANCES,
    Permission.VIEW_USERS,
    Permission.VIEW_REPORTS,
  ],
  [UserRole.USER]: [Permission.VIEW_COMMUNITIES, Permission.VIEW_FINANCES],
};

// Hook para manejo de roles y permisos
export function usePermissions() {
  const { user } = useAuth();

  // Determinar el rol del usuario
  const getUserRole = (): UserRole => {
    if (!user) {
      return UserRole.USER;
    }

    // Verificar si es superadmin desde el token
    if (user.is_superadmin) {
      return UserRole.SUPERUSER;
    }

    // Si tiene roles específicos, usar el más alto
    if (user.roles && user.roles.length > 0) {
      const roles = user.roles.map((r: any) => r.toLowerCase()); // ✅ AGREGAR tipo any

      if (roles.includes('admin')) {
        return UserRole.ADMIN;
      }
      if (roles.includes('manager') || roles.includes('comite')) {
        return UserRole.MANAGER;
      }
      if (roles.includes('propietario') || roles.includes('residente')) {
        return UserRole.USER;
      }
    }

    // Patrick es superuser por defecto (fallback para compatibilidad)
    if (
      user.username === 'patrick' ||
      user.username === 'patricio.quintanilla'
    ) {
      return UserRole.SUPERUSER;
    }

    // En el futuro, esto vendría de la API
    // Por ahora, defaultear a USER
    return UserRole.USER;
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
  const getUserCommunities = (): Array<{
    comunidadId: number;
    rol: string;
  }> => {
    if (user?.is_superadmin) {
      return [];
    } // Superadmin ve todas
    return user?.memberships || [];
  };

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

  // ✅ MODIFICADO: Verificar permisos con contexto de comunidad
  const hasPermission = (
    permission: Permission,
    communityId?: number,
  ): boolean => {
    const rolePermissions = ROLE_PERMISSIONS[currentRole] || [];
    const hasBasePermission = rolePermissions.includes(permission);

    // Si no tiene el permiso base, denegar
    if (!hasBasePermission) {
      return false;
    }

    // Si es superadmin, permitir siempre
    if (user?.is_superadmin) {
      return true;
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
      UserRole.USER,
      UserRole.MANAGER,
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

  // Verificar si el usuario es admin o superior
  const isAdmin = (): boolean => {
    return hasRole(UserRole.ADMIN);
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

  // Dentro de la función usePermissions()
  const canCreateMulta = (user: any, communityId?: number): boolean => {
    return hasPermission(Permission.MANAGE_FINANCES, communityId) || isAdmin();
  };

  return {
    currentRole,
    hasPermission,
    hasRole,
    isSuperUser,
    isAdmin,
    getUserPermissions,

    // ✅ NUEVAS FUNCIONES para multi-tenancy
    hasAccessToCommunity,
    getUserCommunities,
    hasRoleInCommunity,
    canManageCommunity,
    canViewCommunityFinances,
    canManageCommunityUsers,
    canCreateMulta, // Asegúrate de que esté aquí

    // Helpers para UI (actualizados para soportar comunidad específica)
    canManageCommunities: hasPermission(Permission.MANAGE_COMMUNITIES),
    canManageFinances: hasPermission(Permission.MANAGE_FINANCES),
    canManageUsers: hasPermission(Permission.MANAGE_USERS),
    canViewReports: hasPermission(Permission.VIEW_REPORTS),
    canExportReports: hasPermission(Permission.EXPORT_REPORTS),
    canConfigureSystem: hasPermission(Permission.SYSTEM_CONFIG),
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
