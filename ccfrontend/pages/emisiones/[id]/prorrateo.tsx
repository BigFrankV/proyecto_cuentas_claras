import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function EmisionProrrateo() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <ProtectedRoute>
      <Head>
        <title>Prorrateo de Emisión — Cuentas Claras</title>
      </Head>

      <Layout title='Prorrateo de Emisión'>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <h1 className='h3'>Prorrateo - Emisión {id}</h1>
                <button
                  className='btn btn-secondary'
                  onClick={() => router.push('/emisiones')}
                >
                  <i className='material-icons me-2'>arrow_back</i>
                  Volver a Emisiones
                </button>
              </div>

              <div className='card'>
                <div className='card-body'>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar prorrateo de emisión */}
                  <div className='alert alert-info'>
                    <i className='material-icons me-2'>pie_chart</i>
                    Funcionalidad de prorrateo de emisión pendiente de
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
