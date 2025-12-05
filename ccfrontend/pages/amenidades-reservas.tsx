import AmenidadesReservasPage from '@/components/amenidades/AmenidadesReservasPage';
import { ProtectedRoute } from '@/lib/useAuth';

export default function AmenidadesReservas() {
  return (
    <ProtectedRoute>
      <AmenidadesReservasPage />
    </ProtectedRoute>
  );
}
