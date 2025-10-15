import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';

export default function UtilRut() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Utilidad RUT — Cuentas Claras</title>
      </Head>

      <Layout title='Utilidad - RUT'>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <h1 className='h3 mb-4'>Validador de RUT</h1>

              <div className='card'>
                <div className='card-body'>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar validador de RUT */}
                  <div className='alert alert-info'>
                    <i className='material-icons me-2'>verified_user</i>
                    Herramienta de validación de RUT pendiente de implementación
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
