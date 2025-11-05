import { useRouter } from 'next/router';
import React from 'react';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

export default function EditarProveedor() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <ProtectedRoute>
      <Layout title='Editar Proveedor'>
        <div className='container py-4'>
          <h1>Editar Proveedor {id}</h1>
          <p>Página en construcción</p>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
