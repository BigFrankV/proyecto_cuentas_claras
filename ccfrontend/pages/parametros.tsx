import Head from 'next/head';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { ProtectedPage, UserRole } from '@/lib/usePermissions';

export default function TarifasListado() {
  return (
    <ProtectedRoute>
      <ProtectedPage role={UserRole.ADMIN}>
      <Head>
        <title>Tarifas de Consumo — Cuentas Claras</title>
      </Head>

      <Layout title='Tarifas de Consumo'>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <h1 className='h3'>Tarifas de Consumo</h1>
                <button className='btn btn-primary'>
                  <i className='material-icons me-2'>add</i>
                  Nueva Tarifa
                </button>
              </div>

              <div className='card'>
                <div className='card-body'>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar listado de tarifas */}
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
      </ProtectedPage>
    </ProtectedRoute>
  );
}
