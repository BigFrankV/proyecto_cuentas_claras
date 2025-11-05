import dynamic from 'next/dynamic';

import { ProtectedRoute } from '@/lib/useAuth';

const AmenidadesCalendarioPage = dynamic(
  () => import('../components/amenidades/AmenidadesCalendarioPage'),
  { ssr: false },
);

export default function AmenidadesCalendario() {
  return (
    <ProtectedRoute>
      <AmenidadesCalendarioPage />
    </ProtectedRoute>
  );
}
