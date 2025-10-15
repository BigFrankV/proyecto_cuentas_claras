import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import MultasListadoPage from '@/components/multas/MultasListadoPage';

export default function MultasListado() {
  return (
    <ProtectedRoute>
      <MultasListadoPage />
    </ProtectedRoute>
  );
}
