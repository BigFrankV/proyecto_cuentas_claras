import Head from 'next/head';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

export default function Demo() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Demo — Cuentas Claras</title>
      </Head>

      <Layout title='Demostración'>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <h1 className='h3 mb-4'>Demostración del Sistema</h1>

              <div className='card'>
                <div className='card-body'>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar demo del sistema */}
                  <div className='alert alert-info'>
                    <i className='material-icons me-2'>slideshow</i>
                    Página de demostración pendiente de implementación
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

