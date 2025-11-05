import MultaNuevaPage from '@/components/multas/MultaNuevaPage';
import { ProtectedRoute } from '@/lib/useAuth';
import { ProtectedPage, UserRole } from '@/lib/usePermissions';

export default function MultasNueva() {
  return (
    <ProtectedRoute>
      <ProtectedPage role={UserRole.ADMIN}>
        <MultaNuevaPage />
      </ProtectedPage>
    </ProtectedRoute>
  );
}
