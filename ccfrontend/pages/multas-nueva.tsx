import MultaNuevaPage from '@/components/multas/MultaNuevaPage';
import { ProtectedRoute } from '@/lib/useAuth';

export default function MultasNueva() {
  return (
    <ProtectedRoute>
      <MultaNuevaPage />
    </ProtectedRoute>
  );
}
