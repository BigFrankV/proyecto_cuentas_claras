import { useRouter } from 'next/router';

import MultaDetallePage from '@/components/multas/MultaDetallePage';
import { ProtectedRoute } from '@/lib/useAuth';

export default function MultaDetalle() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <ProtectedRoute>
      <MultaDetallePage />
    </ProtectedRoute>
  );
}
