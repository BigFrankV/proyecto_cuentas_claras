import Head from 'next/head';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

export default function DisenoAtomico() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Diseño Atómico — Cuentas Claras</title>
      </Head>

      <Layout title='Diseño Atómico'>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <h1 className='h3 mb-4'>Guía de Diseño Atómico</h1>

              <div className='card'>
                <div className='card-body'>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar guía de diseño atómico */}
                  <div className='alert alert-info'>
                    <i className='material-icons me-2'>palette</i>
                    Guía de diseño atómico pendiente de implementación
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

