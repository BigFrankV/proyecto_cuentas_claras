/**
 * SUPERADMIN GLOBAL ACCESS HELPER
 *
 * Helper que facilita acceso global para superadmin en todas las páginas.
 * Para usuarios regulares, restringe a sus comunidades asignadas.
 * Para superadmin, permite ver todo globalmente.
 */

interface UserWithMemberships {
  is_superadmin?: boolean;
  memberships?: Array<{ comunidadId: number; rol?: string }>;
  comunidad_id?: number;
}

/**
 * Obtiene el ID de comunidad para una solicitud
 *
 * REGLAS:
 * - Superadmin sin selección: null (carga TODO)
 * - Superadmin con selección: devuelve la selección
 * - Usuario regular: devuelve su primer membresía
 *
 * @param user - Usuario actual
 * @param selectedCommunityIdForSuper - ID de comunidad seleccionada por superadmin (opcional)
 * @returns ID de comunidad o null/undefined para cargar todo
 */
export function getCommunityIdForRequest(
  user: UserWithMemberships | null | undefined,
  selectedCommunityIdForSuper?: number | null,
): number | null | undefined {
  // Si no hay usuario, retornar null
  if (!user) {
    return null;
  }

  // SUPERADMIN: Acceso global
  if (user.is_superadmin) {
    // Si el superadmin seleccionó una comunidad específica, devolverla
    if (selectedCommunityIdForSuper) {
      return selectedCommunityIdForSuper;
    }
    // Si no seleccionó nada, retornar undefined para cargar TODO
    return undefined;
  }

  // USUARIO REGULAR: Restringido a sus comunidades
  return user.memberships?.[0]?.comunidadId || null;
}

/**
 * Valida si un usuario puede acceder a datos sin comunidad específica
 * (útil para determinar si puede usar endpoints de "lista todo")
 *
 * @param user - Usuario actual
 * @returns true si puede cargar datos globales
 */
export function canAccessGlobalData(
  user: UserWithMemberships | null | undefined,
): boolean {
  return !!user?.is_superadmin;
}

/**
 * Determina si el usuario debe mostrar selector de comunidad
 *
 * @param user - Usuario actual
 * @returns true si debe mostrar selector
 */
export function shouldShowCommunitySelector(
  user: UserWithMemberships | null | undefined,
): boolean {
  // Mostrar selector solo a superadmin
  return !!user?.is_superadmin;
}

/**
 * Helper para construir parámetros de query global para superadmin
 * Útil cuando el backend tiene endpoints distintos para lista global vs filtrada
 *
 * @param isSuperadmin - Si es superadmin
 * @param selectedCommunityId - ID seleccionada (solo aplica si es superadmin)
 * @returns { global: boolean, comunidad_id?: number }
 */
export function buildGlobalAccessParams(
  isSuperadmin: boolean,
  selectedCommunityId?: number | null,
): { global?: boolean; comunidad_id?: number } {
  if (!isSuperadmin) {
    return {}; // Usuario regular, sin parámetro especial
  }

  // Superadmin
  if (selectedCommunityId) {
    return { comunidad_id: selectedCommunityId }; // Filtrado a comunidad específica
  }

  return { global: true }; // Acceso global a todo
}

/**
 * Valida que el usuario tenga permiso para ver datos de una comunidad específica
 *
 * @param user - Usuario actual
 * @param communityIdToCheck - ID de comunidad a verificar
 * @returns true si tiene permiso
 */
export function hasAccessToCommunity(
  user: UserWithMemberships | null | undefined,
  communityIdToCheck?: number | null,
): boolean {
  if (!user || !communityIdToCheck) {
    return true; // Sin restricción si no hay datos
  }

  // Superadmin siempre tiene acceso
  if (user.is_superadmin) {
    return true;
  }

  // Usuario regular solo a sus comunidades
  return user.memberships?.some((m) => m.comunidadId === communityIdToCheck) || false;
}
