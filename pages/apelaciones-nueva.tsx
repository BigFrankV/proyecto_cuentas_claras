import { ProtectedRoute } from '@/lib/useAuth';
import Layout from '@/components/layout/Layout';

export default function ApelacionesNueva() {
  return (
    <ProtectedRoute>
      <Layout title='Nueva Apelación'>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <h1 className='h3'>Nueva Apelación</h1>
                <button className='btn btn-secondary' onClick={() => window.history.back()}>
                  <i className='material-icons me-2'>arrow_back</i>
                  Cancelar
                </button>
              </div>

              <div className='card'>
                <div className='card-body'>
                  <p className='text-muted'>
                    Esta página está en desarrollo...
                  </p>

                  {/* TODO: Implementar formulario de nueva apelación */}
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