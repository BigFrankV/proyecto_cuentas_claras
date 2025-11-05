import { Membership } from '../lib/auth';
import { useAuth } from '../lib/useAuth';

export function useCurrentComunidad(): number | null {
  const { user } = useAuth();

  // Si el usuario es superadmin, puede que no tenga una comunidad específica
  // En ese caso, devolver null o la primera membresía activa
  if (user?.is_superadmin) {
    // Para superadmin, devolver la primera membresía activa o null
    const activeMembership = user.memberships?.find(
      (m: Membership) => m.activo !== false,
    );
    return activeMembership?.comunidadId || null;
  }

  // Para usuarios normales, devolver la primera membresía activa
  const activeMembership = user?.memberships?.find(
    (m: Membership) => m.activo !== false,
  );
  return activeMembership?.comunidadId || null;
}

export function useUserMemberships(): Membership[] {
  const { user } = useAuth();
  return user?.memberships || [];
}

export function useIsSuperAdmin(): boolean {
  const { user } = useAuth();
  return user?.is_superadmin || false;
}
