import Head from 'next/head';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

export default function UtilUf() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Utilidad UF — Cuentas Claras</title>
      </Head>

      <Layout title='Utilidad - UF'>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <h1 className='h3 mb-4'>Unidad de Fomento (UF)</h1>

              <div className='card'>
                <div className='card-body'>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar calculadora/consulta de UF */}
                  <div className='alert alert-info'>
                    <i className='material-icons me-2'>calculate</i>
                    Herramienta de conversión UF pendiente de implementación
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

