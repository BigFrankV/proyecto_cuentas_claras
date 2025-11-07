/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from 'next/router';
import React from 'react'; // ✅ AGREGAR ESTA LÍNEA

import { useAuth } from './useAuth';

// Definición de roles del sistema
export enum UserRole {
  SUPERUSER = 'superuser',
  ADMIN = 'admin',
  CONCIERGE = 'concierge', // Nuevo para conserje
  ACCOUNTANT = 'accountant', // Nuevo para contador
  MANAGER = 'manager', // Para tesorero, presidente, proveedor
  USER = 'user',
}

// Definición de permisos (añadidos nuevos)
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

  // Nuevos permisos específicos
  MANAGE_AMENITIES = 'manage_amenities',
  VIEW_TICKETS = 'view_tickets',
  CREATE_TICKETS = 'create_tickets',
  MANAGE_MULTAS = 'manage_multas',
  VIEW_OWN_MEMBERSHIP = 'view_own_membership',
}

// Mapa de roles y sus permisos (actualizado con ajustes)
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
    Permission.MANAGE_AMENITIES,
    Permission.VIEW_TICKETS,
    Permission.CREATE_TICKETS,
    Permission.MANAGE_MULTAS,
    Permission.VIEW_OWN_MEMBERSHIP,
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
    Permission.SYSTEM_CONFIG, // Añadido para config básica
  ],
  [UserRole.CONCIERGE]: [
    Permission.VIEW_COMMUNITIES,
    Permission.MANAGE_AMENITIES, // Añadido
    Permission.VIEW_TICKETS, // Añadido
  ],
  [UserRole.ACCOUNTANT]: [
    Permission.VIEW_COMMUNITIES,
    Permission.VIEW_FINANCES,
    Permission.APPROVE_PAYMENTS, // Único para contador
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
  ],
  [UserRole.MANAGER]: [
    Permission.VIEW_COMMUNITIES,
    Permission.VIEW_FINANCES,
    Permission.VIEW_USERS,
    Permission.VIEW_REPORTS,
  ],
  [UserRole.USER]: [
    Permission.VIEW_COMMUNITIES,
    Permission.VIEW_FINANCES,
  ],
};

// Hook para manejo de roles y permisos (actualizado)
export function usePermissions() {
  const { user } = useAuth();

  // Determinar el rol del usuario (actualizado con agrupamiento completo)
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
      const roles = user.roles.map((r: any) => r.toLowerCase());

      if (roles.includes('admin_comunidad')) {
        return UserRole.ADMIN;
      }
      // Agrupar MANAGER: tesorero, presidente_comite, proveedor_servicio
      if (roles.includes('tesorero') || roles.includes('presidente_comite') || roles.includes('proveedor_servicio')) {
        return UserRole.MANAGER;
      }
      // Agrupar USER: residente, propietario, inquilino
      if (roles.includes('residente') || roles.includes('propietario') || roles.includes('inquilino')) {
        return UserRole.USER;
      }
      if (roles.includes('conserje')) return UserRole.CONCIERGE;
      if (roles.includes('contador')) return UserRole.ACCOUNTANT;
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

  // ✅ MODIFICADO: Verificar permisos con contexto de comunidad y checks específicos
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

    // Checks específicos dentro de grupos
    if (currentRole === UserRole.MANAGER) {
      if (permission === Permission.APPROVE_PAYMENTS && !user.roles.includes('tesorero')) return false;
      if (permission === Permission.MANAGE_MULTAS && !user.roles.includes('presidente_comite')) return false;
      if (permission === Permission.VIEW_TICKETS && !user.roles.includes('proveedor_servicio')) return false;
    }
    if (currentRole === UserRole.USER) {
      if (permission === Permission.CREATE_TICKETS && !user.roles.includes('residente')) return false;
      if (permission === Permission.VIEW_OWN_MEMBERSHIP && !user.roles.includes('propietario')) return false;
    }

    // Para ADMIN, limitar MANAGE_COMMUNITIES a comunidades propias
    if (currentRole === UserRole.ADMIN && permission === Permission.MANAGE_COMMUNITIES) {
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
  const { hasPermission, hasRole, isSuperUser } = usePermissions();
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
    // Usar getUserRole del módulo roles
    const { getUserRole } = require('./roles');
    const currentUserRole = getUserRole(user);
    hasAccess = allowedRoles.includes(currentUserRole);
  } else {
    // Si no se especifica ningún requisito, denegar por defecto
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
