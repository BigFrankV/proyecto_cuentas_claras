import React from 'react';
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
    if (!user) return UserRole.USER;

    console.log('🔍 [usePermissions] Determinando rol para:', {
      username: user.username,
      is_superadmin: user.is_superadmin,
      is_admin: user.is_admin,
      roles: user.roles,
      roles_slug: user.roles_slug
    });

    // ✅ 1. Verificar si es superadmin desde el backend
    if (user.is_superadmin === true) {
      console.log('✅ [usePermissions] Usuario es SUPERUSER (is_superadmin=true)');
      return UserRole.SUPERUSER;
    }

    // ✅ 2. Verificar si es admin desde el backend
    if (user.is_admin === true) {
      console.log('✅ [usePermissions] Usuario es ADMIN (is_admin=true)');
      return UserRole.ADMIN;
    }

    // ✅ 3. Extraer roles (priorizar roles_slug si existe)
    let rolesSlug: string[] = [];

    if (user.roles_slug && Array.isArray(user.roles_slug)) {
      // Usar roles_slug directamente (es un array de strings)
      rolesSlug = user.roles_slug.map((r: string) => r.toLowerCase());
      console.log('📋 [usePermissions] Usando roles_slug:', rolesSlug);
    } else if (user.roles && Array.isArray(user.roles)) {
      // ✅ CORRECCIÓN: Extraer slug desde array de objetos
      rolesSlug = user.roles
        .map((r: any) => {
          // Intentar obtener slug, codigo, o el valor directo
          if (typeof r === 'string') return r;
          return r.slug || r.codigo || null;
        })
        .filter((r: any): r is string => typeof r === 'string' && r.length > 0)
        .map((r: string) => r.toLowerCase());
      console.log('📋 [usePermissions] Roles extraídos desde user.roles:', rolesSlug);
    }

    // ✅ 4. Mapear roles del backend a roles del frontend
    // Superadmin
    if (rolesSlug.includes('superadmin')) {
      console.log('✅ [usePermissions] Rol "superadmin" detectado → SUPERUSER');
      return UserRole.SUPERUSER;
    }

    // Admin
    if (
      rolesSlug.includes('admin') || 
      rolesSlug.includes('admin_comunidad') ||
      rolesSlug.includes('admin_externo')
    ) {
      console.log('✅ [usePermissions] Rol admin detectado → ADMIN');
      return UserRole.ADMIN;
    }

    // Manager (Tesorero, Presidente, Secretario, Moderador)
    if (
      rolesSlug.includes('manager') || 
      rolesSlug.includes('comite') || 
      rolesSlug.includes('tesorero') ||
      rolesSlug.includes('presidente_comite') ||
      rolesSlug.includes('secretario') ||
      rolesSlug.includes('moderador_comunidad') ||
      rolesSlug.includes('coordinador_reservas') ||
      rolesSlug.includes('sindico')
    ) {
      console.log('✅ [usePermissions] Rol manager detectado → MANAGER');
      return UserRole.MANAGER;
    }

    // Usuario regular (Propietario, Residente, Inquilino)
    if (
      rolesSlug.includes('propietario') || 
      rolesSlug.includes('residente') ||
      rolesSlug.includes('inquilino') ||
      rolesSlug.includes('conserje') ||
      rolesSlug.includes('proveedor_servicio')
    ) {
      console.log('✅ [usePermissions] Rol usuario detectado → USER');
      return UserRole.USER;
    }

    // ✅ 5. Fallback: Patrick es superuser (compatibilidad)
    if (user.username === 'patrick' || user.username === 'patricio.quintanilla' || user.username === 'patricio') {
      console.log('✅ [usePermissions] Usuario especial (Patrick) → SUPERUSER');
      return UserRole.SUPERUSER;
    }

    // Por defecto, usuario regular
    console.log('⚠️ [usePermissions] Sin rol específico → USER por defecto');
    return UserRole.USER;
  };

  const currentRole = getUserRole();

  // ✅ CORRECCIÓN: Verificar acceso a comunidad específica
  const hasAccessToCommunity = (communityId?: number): boolean => {
    // Superadmin ve todas las comunidades
    if (user?.is_superadmin) return true;
    
    // Si no hay comunidad específica, permitir
    if (!communityId) return true;
    
    // ✅ CORRECCIÓN: usar comunidad_id (con guion bajo)
    if (user?.memberships && Array.isArray(user.memberships)) {
      return user.memberships.some((membership: any) => 
        membership.comunidad_id === communityId // ✅ CORREGIDO
      );
    }
    
    // Fallback: verificar comunidad_id principal
    return user?.comunidad_id === communityId;
  };

  // ✅ CORRECCIÓN: Obtener comunidades del usuario
  const getUserCommunities = (): Array<{comunidad_id: number, rol: string, comunidad_nombre?: string}> => {
    if (user?.is_superadmin) return []; // Superadmin ve todas
    return user?.memberships || [];
  };

  // ✅ CORRECCIÓN: Verificar si tiene un rol específico en una comunidad
  const hasRoleInCommunity = (communityId: number, roleToCheck: string): boolean => {
    if (user?.is_superadmin) return true;
    
    return user?.memberships?.some((membership: any) => 
      membership.comunidad_id === communityId && // ✅ CORREGIDO
      membership.rol?.toLowerCase() === roleToCheck.toLowerCase()
    ) || false;
  };

  // Verificar permisos con contexto de comunidad
  const hasPermission = (permission: Permission, communityId?: number): boolean => {
    const rolePermissions = ROLE_PERMISSIONS[currentRole] || [];
    const hasBasePermission = rolePermissions.includes(permission);
    
    // Si no tiene el permiso base, denegar
    if (!hasBasePermission) return false;
    
    // Si es superadmin, permitir siempre
    if (user?.is_superadmin) return true;
    
    // Si no se especifica comunidad, verificar solo el permiso base
    if (!communityId) return true;
    
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

  // Verificar si puede administrar una comunidad específica
  const canManageCommunity = (communityId?: number): boolean => {
    return hasPermission(Permission.MANAGE_COMMUNITIES, communityId);
  };

  // Verificar si puede ver finanzas de una comunidad específica  
  const canViewCommunityFinances = (communityId?: number): boolean => {
    return hasPermission(Permission.VIEW_FINANCES, communityId);
  };

  // Verificar si puede gestionar usuarios de una comunidad específica
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
    
    // Funciones para multi-tenancy
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