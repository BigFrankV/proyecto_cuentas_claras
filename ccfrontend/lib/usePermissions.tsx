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

    // Verificar si es superadmin desde el token
    if (user.is_superadmin) {
      return UserRole.SUPERUSER;
    }

    // Si tiene roles específicos, usar el primero (o implementar lógica más compleja)
    if (user.roles && user.roles.length > 0) {
      const role = user?.roles?.[0]?.toLowerCase() || 'guest';
      switch (role) {
        case 'admin':
          return UserRole.ADMIN;
        case 'manager':
          return UserRole.MANAGER;
        default:
          return UserRole.USER;
      }
    }

    // Patrick es superuser por defecto (fallback para compatibilidad)
    if (user.username === 'patrick') {
      return UserRole.SUPERUSER;
    }

    // En el futuro, esto vendría de la API
    // Por ahora, defaultear a USER
    return UserRole.USER;
  };

  const currentRole = getUserRole();

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (permission: Permission): boolean => {
    const rolePermissions = ROLE_PERMISSIONS[currentRole] || [];
    return rolePermissions.includes(permission);
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

  return {
    currentRole,
    hasPermission,
    hasRole,
    isSuperUser,
    isAdmin,
    getUserPermissions,
    // Helpers para UI
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
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  permission,
  role,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasRole } = usePermissions();

  const hasAccess =
    (permission && hasPermission(permission)) ||
    (role && hasRole(role)) ||
    (!permission && !role); // Si no se especifica permiso/rol, mostrar siempre

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
