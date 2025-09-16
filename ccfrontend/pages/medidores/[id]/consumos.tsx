import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ConsumosMedidor() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <ProtectedRoute>
      <Head>
        <title>Consumos del Medidor — Cuentas Claras</title>
      </Head>

      <Layout title='Consumos del Medidor'>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <h1 className='h3'>Consumos del Medidor {id}</h1>
                <button
                  className='btn btn-secondary'
                  onClick={() => router.push('/medidores')}
                >
                  <i className='material-icons me-2'>arrow_back</i>
                  Volver a Medidores
                </button>
              </div>

              <div className='card'>
                <div className='card-body'>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar vista de consumos del medidor */}
                  <div className='alert alert-info'>
                    <i className='material-icons me-2'>water_drop</i>
                    Vista de consumos del medidor pendiente de implementación
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
