import { useRouter } from 'next/router';
import { ProtectedRoute } from '@/lib/useAuth';
import MultaDetallePage from '@/components/multas/MultaDetallePage';

export default function MultaDetalle() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <ProtectedRoute>
      <MultaDetallePage />
    </ProtectedRoute>
  );
}