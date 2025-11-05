import dynamic from 'next/dynamic';
import React from 'react';

import { ProtectedRoute } from '@/lib/useAuth';

const ConsumosPage = dynamic(
  () => import('@/components/consumos/ConsumosPage'),
  { ssr: false },
);

export default function ConsumosRoute() {
  return (
    <ProtectedRoute>
      <ConsumosPage />
    </ProtectedRoute>
  );
}
