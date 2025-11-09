import dynamic from 'next/dynamic';
import React from 'react';

import { ProtectedRoute } from '@/lib/useAuth';
import { ProtectedPage } from '@/lib/usePermissions';

const LecturasPage = dynamic(
  () => import('@/components/lecturas/LecturasPage'),
  { ssr: false },
);

export default function LecturasRoute() {
  return (
    <ProtectedRoute>
      <ProtectedPage allowedRoles={[
        'Superadmin',
        'admin_comunidad',
        'conserje',
        'contador',
        'tesorero',
        'presidente_comite',
        'residente',
        'propietario',
        'inquilino',
        'usuario'
      ]}>        <LecturasPage />
      </ProtectedPage>
    </ProtectedRoute>
  );
}
