import { useRouter } from 'next/router';
import React from 'react';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

export default function EditProveedorPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <ProtectedRoute>
      <Layout title='Editar Proveedor'>
        <div className='container p-4'>
          <h1>Editar Proveedor #{id}</h1>
          <p>Esta página está en construcción.</p>
          <button
            className='btn btn-secondary'
            onClick={() => router.push('/proveedores')}
          >
            Volver a Proveedores
          </button>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
