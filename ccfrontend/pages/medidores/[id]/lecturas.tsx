import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LecturasMedidor() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <ProtectedRoute>
      <Head>
        <title>Lecturas del Medidor — Cuentas Claras</title>
      </Head>

      <Layout title='Lecturas del Medidor'>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <h1 className='h3'>Lecturas del Medidor {id}</h1>
                <div>
                  <button className='btn btn-primary me-2'>
                    <i className='material-icons me-2'>add</i>
                    Nueva Lectura
                  </button>
                  <button
                    className='btn btn-secondary'
                    onClick={() => router.push('/medidores')}
                  >
                    <i className='material-icons me-2'>arrow_back</i>
                    Volver a Medidores
                  </button>
                </div>
              </div>

              <div className='card'>
                <div className='card-body'>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar vista de lecturas del medidor */}
                  <div className='alert alert-info'>
                    <i className='material-icons me-2'>visibility</i>
                    Vista de lecturas del medidor pendiente de implementación
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
