// Utilidades para el manejo de roles de usuario de forma neutra

import { User } from './auth';

/**
 * Extrae el slug del rol (puede ser string u objeto)
 */
function extractRoleSlug(role: any): string {
  if (typeof role === 'string') {
    return role;
  }
  
  if (typeof role === 'object' && role !== null) {
    return role.slug || role.codigo || role.nombre || '';
  }
  
  return '';
}

/**
 * Obtiene el rol principal del usuario en formato neutro
 * @param user - Objeto usuario
 * @returns Rol en formato neutro (string)
 */
export function getUserRole(user: User | null): string {
  if (!user) {
    return 'Invitado';
  }

  console.log('🔍 [roles.ts] getUserRole - Usuario:', {
    username: user.username,
    is_superadmin: user.is_superadmin,
    roles: user.roles,
    roles_slug: user.roles_slug
  });

  // Verificar si es superadmin (prioridad máxima)
  if (user.is_superadmin) {
    console.log('✅ [roles.ts] Usuario es Superadmin (is_superadmin=true)');
    return 'Superadmin';
  }

  // ✅ CORRECCIÓN: Usar roles_slug si existe
  let rolesSlug: string[] = [];

  if (user.roles_slug && Array.isArray(user.roles_slug)) {
    rolesSlug = user.roles_slug.map((r: string) => r.toLowerCase());
    console.log('📋 [roles.ts] Usando roles_slug:', rolesSlug);
  } else if (user.roles && Array.isArray(user.roles)) {
    // ✅ CORRECCIÓN: Extraer slug desde array de objetos
    rolesSlug = user.roles
      .map((role: any) => extractRoleSlug(role))
      .filter((slug: string) => slug.length > 0)
      .map((slug: string) => slug.toLowerCase());
    console.log('📋 [roles.ts] Roles extraídos desde user.roles:', rolesSlug);
  }

  // Verificar roles específicos del array
  if (rolesSlug.length > 0) {
    // Buscar el rol con mayor prioridad
    const roleHierarchy = [
      'superadmin', 'superadministrador', 'superadministradora',
      'admin', 'administrador', 'administradora', 'admin_comunidad', 'admin_externo',
      'manager', 'gerente', 'tesorero', 'presidente_comite', 'secretario', 'sindico',
      'proveedor', 'proveedora', 'contractor', 'proveedor_servicio',
      'conserje', 'portero', 'portera', 'vigilante',
      'propietario', 'propietaria',
      'inquilino', 'inquilina', 
      'residente', 'resident'
    ];

    for (const hierarchyRole of roleHierarchy) {
      // ✅ CORRECCIÓN: Comparar strings extraídos
      const foundRoleSlug = rolesSlug.find((roleSlug: string) => 
        roleSlug === hierarchyRole
      );
      
      if (foundRoleSlug) {
        const normalized = normalizeRole(foundRoleSlug);
        console.log(`✅ [roles.ts] Rol encontrado en jerarquía: ${foundRoleSlug} → ${normalized}`);
        return normalized;
      }
    }

    // Si no está en la jerarquía, usar el primer rol
    const primaryRoleSlug = rolesSlug[0];
    if (primaryRoleSlug) {
      const normalized = normalizeRole(primaryRoleSlug);
      console.log(`✅ [roles.ts] Usando primer rol: ${primaryRoleSlug} → ${normalized}`);
      return normalized;
    }
  }

  // Si tiene comunidad_id, probablemente es admin de comunidad
  if (user.comunidad_id) {
    console.log('✅ [roles.ts] Usuario tiene comunidad_id → Admin');
    return 'Admin';
  }

  // Por defecto, asumir que es residente
  console.log('⚠️ [roles.ts] Sin rol específico → Residente por defecto');
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
    'administrador': 'Admin',
    'administradora': 'Admin',
    'admin': 'Admin',
    'administrator': 'Admin',
    'admin_comunidad': 'Admin',
    'admin_externo': 'Admin',
    
    // Roles de super administración
    'superadministrador': 'Superadmin',
    'superadministradora': 'Superadmin',
    'superadmin': 'Superadmin',
    'super_admin': 'Superadmin',
    
    // Roles de gestión
    'manager': 'Manager',
    'gerente': 'Manager',
    'tesorero': 'Tesorero',
    'presidente_comite': 'Presidente',
    'secretario': 'Secretario',
    'sindico': 'Síndico',
    'moderador_comunidad': 'Moderador',
    'coordinador_reservas': 'Coordinador',
    
    // Roles de residentes
    'residente': 'Residente',
    'resident': 'Residente',
    'propietario': 'Propietario',
    'propietaria': 'Propietario',
    'inquilino': 'Inquilino',
    'inquilina': 'Inquilino',
    
    // Roles de staff
    'conserje': 'Conserje',
    'portero': 'Portero',
    'portera': 'Portero',
    'vigilante': 'Vigilante',
    
    // Roles de proveedores
    'proveedor': 'Proveedor',
    'proveedora': 'Proveedor',
    'contractor': 'Proveedor',
    'proveedor_servicio': 'Proveedor',
    
    // Roles especiales
    'contador': 'Contador',
    'auditor_externo': 'Auditor',
    'revisor_cuentas': 'Revisor',
    'soporte_tecnico': 'Soporte',
    'visitante_autorizado': 'Visitante',
    'sistema': 'Sistema',
    
    // Otros
    'invitado': 'Invitado',
    'invitada': 'Invitado',
    'guest': 'Invitado',
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
    case 'Manager':
    case 'Tesorero':
    case 'Presidente':
    case 'Secretario':
    case 'Síndico':
      return 'tag--primary';
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
    case 'Contador':
    case 'Auditor':
    case 'Revisor':
      return 'tag--info';
    case 'Soporte':
    case 'Sistema':
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

  // ✅ CORRECCIÓN: Usar roles_slug si existe
  let rolesSlug: string[] = [];

  if (user.roles_slug && Array.isArray(user.roles_slug)) {
    rolesSlug = user.roles_slug;
  } else if (user.roles && Array.isArray(user.roles)) {
    // ✅ CORRECCIÓN: Extraer slug desde array de objetos
    rolesSlug = user.roles
      .map((role: any) => extractRoleSlug(role))
      .filter((slug: string) => slug.length > 0);
  }

  if (rolesSlug.length > 0) {
    rolesSlug.forEach((roleSlug: string) => {
      const normalizedRole = normalizeRole(roleSlug);
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