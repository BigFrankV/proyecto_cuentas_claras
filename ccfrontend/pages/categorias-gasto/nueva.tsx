import Head from 'next/head';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

export default function CategoriaGastoNueva() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Nueva Categoría de Gasto — Cuentas Claras</title>
      </Head>

      <Layout title='Crear Nueva Categoría de Gasto'>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <div className='card'>
                <div className='card-body'>
                  <h1 className='card-title'>Crear Nueva Categoría de Gasto</h1>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar formulario de nueva categoría */}
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

