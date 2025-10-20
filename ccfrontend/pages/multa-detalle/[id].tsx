// import { useRouter } from 'next/router'; // Removed unused

import MultaDetallePage from '@/components/multas/MultaDetallePage';
import { ProtectedRoute } from '@/lib/useAuth';

export default function MultaDetalle() {
  // const router = useRouter(); // Removed unused
  // const { id } = router.query; // Removed unused

  return (
    <ProtectedRoute>
      <MultaDetallePage />
    </ProtectedRoute>
  );
}
