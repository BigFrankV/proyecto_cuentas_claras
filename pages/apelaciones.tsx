import { ProtectedRoute } from '@/lib/useAuth';
import ApelacionesListadoPage from '@/components/apelaciones/ApelacionesListadoPage';

export default function ApelacionesListado() {
  return (
    <ProtectedRoute>
      <ApelacionesListadoPage />
    </ProtectedRoute>
  );
}