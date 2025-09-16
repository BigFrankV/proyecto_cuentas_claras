import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function BitacoraNueva() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <Head>
        <title>Nueva Entrada de Bitácora — Cuentas Claras</title>
      </Head>

      <Layout title='Nueva Entrada de Bitácora'>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <h1 className='h3'>Nueva Entrada de Bitácora</h1>
                <button
                  className='btn btn-secondary'
                  onClick={() => router.push('/bitacora')}
                >
                  <i className='material-icons me-2'>arrow_back</i>
                  Volver
                </button>
              </div>

              <div className='card'>
                <div className='card-body'>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar formulario para nueva entrada de bitácora */}
                  <div className='alert alert-info'>
                    <i className='material-icons me-2'>edit</i>
                    Formulario de nueva entrada de bitácora pendiente de
                    implementación
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
