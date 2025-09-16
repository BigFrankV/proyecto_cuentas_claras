import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function CargosUnidad() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <ProtectedRoute>
      <Head>
        <title>Cargos de la Unidad — Cuentas Claras</title>
      </Head>

      <Layout title='Cargos de la Unidad'>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <h1 className='h3'>Cargos - Unidad {id}</h1>
                <div>
                  <button className='btn btn-primary me-2'>
                    <i className='material-icons me-2'>add_circle</i>
                    Nuevo Cargo
                  </button>
                  <button
                    className='btn btn-secondary'
                    onClick={() => router.push('/unidades')}
                  >
                    <i className='material-icons me-2'>arrow_back</i>
                    Volver a Unidades
                  </button>
                </div>
              </div>

              <div className='card'>
                <div className='card-body'>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar gestión de cargos de la unidad */}
                  <div className='alert alert-info'>
                    <i className='material-icons me-2'>monetization_on</i>
                    Gestión de cargos de la unidad pendiente de implementación
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
