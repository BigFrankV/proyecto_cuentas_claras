// Utilidades para el manejo de roles de usuario de forma neutra

import { User } from './auth';

/**
 * Obtiene el rol principal del usuario en formato neutro
 * @param user - Objeto usuario
 * @returns Rol en formato neutro (string)
 */
export function getUserRole(user: User | null): string {
  if (!user) {
    return 'Invitado';
  }

  // Verificar si es superadmin (prioridad máxima)
  if (user.is_superadmin) {
    return 'Superadmin';
  }

  // Verificar roles específicos del array
  if (user.roles && user.roles.length > 0) {
    // Buscar el rol con mayor prioridad
    const roleHierarchy = [
      'superadmin',
      'superadministrador',
      'superadministradora',
      'admin',
      'administrador',
      'administradora',
      'manager',
      'gerente',
      'proveedor',
      'proveedora',
      'contractor',
      'conserje',
      'portero',
      'portera',
      'vigilante',
      'propietario',
      'propietaria',
      'inquilino',
      'inquilina',
      'residente',
      'resident',
    ];

    for (const hierarchyRole of roleHierarchy) {
      const foundRole = user.roles.find(
        role => role?.toLowerCase() === hierarchyRole,
      );
      if (foundRole) {
        return normalizeRole(foundRole);
      }
    }

    // Si no está en la jerarquía, usar el primer rol
    const primaryRole = user.roles[0];
    if (primaryRole) {
      return normalizeRole(primaryRole);
    }
  }

  // Si tiene comunidad_id, probablemente es admin de comunidad
  if (user.comunidad_id) {
    return 'Admin';
  }

  // Por defecto, asumir que es residente
  return 'Residente';
}

/**
 * Normaliza un rol a formato neutro
 * @param role - Rol original
 * @returns Rol en formato neutro
 */
export function normalizeRole(role: string): string {
  const roleMap: Record<string, string> = {
    // Roles de administración
    administrador: 'Admin',
    administradora: 'Admin',
    admin: 'Admin',
    administrator: 'Admin',

    // Roles de super administración
    superadministrador: 'Superadmin',
    superadministradora: 'Superadmin',
    superadmin: 'Superadmin',
    super_admin: 'Superadmin',

    // Roles de residentes
    residente: 'Residente',
    resident: 'Residente',
    propietario: 'Propietario',
    propietaria: 'Propietario',
    inquilino: 'Inquilino',
    inquilina: 'Inquilino',

    // Roles de staff
    conserje: 'Conserje',
    portero: 'Portero',
    portera: 'Portero',
    vigilante: 'Vigilante',

    // Roles de proveedores
    proveedor: 'Proveedor',
    proveedora: 'Proveedor',
    contractor: 'Proveedor',

    // Otros
    invitado: 'Invitado',
    invitada: 'Invitado',
    guest: 'Invitado',
  };

  const normalizedRole = roleMap[role.toLowerCase()];
  return normalizedRole || role; // Si no está en el mapa, devolver el original
}

/**
 * Obtiene la clase CSS para el tag del rol
 * @param user - Objeto usuario
 * @returns Clase CSS para el tag
 */
export function getRoleTagClass(user: User | null): string {
  if (!user) {
    return 'tag--secondary';
  }

  if (user.is_superadmin) {
    return 'tag--success';
  }

  const role = getUserRole(user);

  switch (role) {
    case 'Admin':
      return 'tag--primary';
    case 'Superadmin':
      return 'tag--success';
    case 'Residente':
    case 'Propietario':
    case 'Inquilino':
      return 'tag--info';
    case 'Proveedor':
      return 'tag--warning';
    case 'Conserje':
    case 'Portero':
    case 'Vigilante':
      return 'tag--secondary';
    default:
      return 'tag--secondary';
  }
}

/**
 * Obtiene todos los roles del usuario en formato neutro
 * @param user - Objeto usuario
 * @returns Array de roles en formato neutro
 */
export function getUserRoles(user: User | null): string[] {
  if (!user) {
    return ['Invitado'];
  }

  const roles: string[] = [];

  if (user.is_superadmin) {
    roles.push('Superadmin');
  }

  if (user.roles && user.roles.length > 0) {
    user.roles.forEach(role => {
      const normalizedRole = normalizeRole(role);
      if (!roles.includes(normalizedRole)) {
        roles.push(normalizedRole);
      }
    });
  }

  // Si no tiene roles específicos pero tiene comunidad_id, asumir admin
  if (roles.length === 0 && user.comunidad_id) {
    roles.push('Admin');
  }

  // Si no tiene ningún rol, asumir residente
  if (roles.length === 0) {
    roles.push('Residente');
  }

  return roles;
}
