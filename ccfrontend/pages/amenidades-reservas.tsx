import dynamic from 'next/dynamic';

import { ProtectedRoute } from '@/lib/useAuth';

const AmenidadesReservasPage = dynamic(
  () => import('../components/amenidades/AmenidadesReservasPage'),
  { ssr: false },
);

export default function AmenidadesReservas() {
  return (
    <ProtectedRoute>
      <AmenidadesReservasPage />
    </ProtectedRoute>
  );
}
