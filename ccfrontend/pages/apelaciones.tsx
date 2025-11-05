import ApelacionesListadoPage from '@/components/apelaciones/ApelacionesListadoPage';
import { ProtectedRoute } from '@/lib/useAuth';

export default function ApelacionesListado() {
  return (
    <ProtectedRoute>
      <ApelacionesListadoPage />
    </ProtectedRoute>
  );
}
