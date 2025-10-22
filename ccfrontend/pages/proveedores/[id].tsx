import Head from 'next/head';
import { useRouter } from 'next/router';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

export default function ProveedorDetalle() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <ProtectedRoute>
      <Head>
        <title>Detalle Proveedor — Cuentas Claras</title>
      </Head>

      <Layout title={`Proveedor ${id || 'Detalle'}`}>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <div className='card'>
                <div className='card-body'>
                  <h1 className='card-title'>Detalle de Proveedor {id}</h1>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar detalle de proveedor */}
                  <div className='alert alert-info'>
                    <i className='material-icons me-2'>info</i>
                    Funcionalidad pendiente de implementación
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
