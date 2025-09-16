import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function ResidentesUnidad() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <ProtectedRoute>
      <Head>
        <title>Residentes — Cuentas Claras</title>
      </Head>

      <Layout title={`Residentes - Unidad ${id || ''}`}>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <div className='card'>
                <div className='card-body'>
                  <h1 className='card-title'>Gestión de Residentes</h1>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar gestión de residentes */}
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
