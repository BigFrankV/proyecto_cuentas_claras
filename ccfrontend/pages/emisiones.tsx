import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';

export default function EmisionesListado() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Emisiones — Cuentas Claras</title>
      </Head>

      <Layout title='Lista de Emisiones'>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <h1 className='h3'>Lista de Emisiones</h1>
                <button className='btn btn-primary'>
                  <i className='material-icons me-2'>add</i>
                  Nueva Emisión
                </button>
              </div>

              <div className='card'>
                <div className='card-body'>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar listado de emisiones */}
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
