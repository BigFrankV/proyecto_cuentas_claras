import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';

export default function ConciliacionesListado() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Conciliaciones — Cuentas Claras</title>
      </Head>

      <Layout title='Lista de Conciliaciones'>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <h1 className='h3'>Lista de Conciliaciones</h1>
                <button className='btn btn-primary'>
                  <i className='material-icons me-2'>add</i>
                  Nueva Conciliación
                </button>
              </div>

              <div className='card'>
                <div className='card-body'>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar listado de conciliaciones */}
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
