export interface User {
  id: number;
  username: string;
  email?: string;
  is_superadmin: boolean;
  roles?: string[];
  memberships?: Array<{
    comunidadId: number;
    rol: string;
  }>;
}

export const ProveedorPermissions = {
  canView: (user: User | null): boolean => {
    if (!user) return false;
    return user.is_superadmin ||
      user.roles?.some(rol => ['admin', 'comite', 'tesorero', 'conserje', 'residente', 'propietario'].includes(rol)) || false;
  },

  canViewRut: (user: User | null): boolean => {
    if (!user) return false;
    return user.is_superadmin ||
      user.roles?.some(rol => ['admin', 'comite', 'tesorero'].includes(rol)) || false;
  },

  canViewDireccion: (user: User | null): boolean => {
    if (!user) return false;
    if (user.is_superadmin) return true;

    // Conserje y admin pueden ver direcciones
    return user.roles?.some(role =>
      ['admin', 'comite', 'conserje'].includes(role)
    ) || false;
  },

  canCreate: (user: User | null): boolean => {
    if (!user) return false;
    return user.is_superadmin || user.roles?.includes('admin') || false;
  },

  canEdit: (user: User | null): boolean => {
    if (!user) return false;
    return user.is_superadmin || user.roles?.includes('admin') || false;
  },

  canDelete: (user: User | null): boolean => {
    if (!user) return false;
    return user.is_superadmin || user.roles?.includes('admin') || false;
  },

  canViewAll: (user: User | null): boolean => {
    if (!user) return false;
    return user.is_superadmin || false;
  }
};