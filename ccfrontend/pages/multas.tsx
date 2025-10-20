// import Layout from '@/components/layout/Layout'; // Removed unused
import MultasListadoPage from '@/components/multas/MultasListadoPage';
import { ProtectedRoute } from '@/lib/useAuth';

export default function MultasListado() {
  return (
    <ProtectedRoute>
      <MultasListadoPage />
    </ProtectedRoute>
  );
}
