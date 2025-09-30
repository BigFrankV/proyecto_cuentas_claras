import { ProtectedRoute } from '@/lib/useAuth';
import MultaNuevaPage from '@/components/multas/MultaNuevaPage';

export default function MultasNueva() {
  return (
    <ProtectedRoute>
      <MultaNuevaPage />
    </ProtectedRoute>
  );
}