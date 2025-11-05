import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import apiClient from '@/lib/api';
import { ProtectedRoute } from '@/lib/useAuth';

export default function CargosUnidad() {
  const router = useRouter();
  const { id } = router.query;
  const [cargos, setCargos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/unidades/${id}/cuentas`);
        if (mounted) {
          setCargos(res.data || []);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

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
                    Cuentas / cargos emitidos a la unidad
                  </p>
                  {loading && (
                    <div className='alert alert-info'>Cargando...</div>
                  )}
                  {!loading && cargos.length === 0 && (
                    <div className='alert alert-warning'>No hay cargos</div>
                  )}
                  {!loading && cargos.length > 0 && (
                    <ul className='list-group'>
                      {cargos.map(c => (
                        <li
                          key={c.id}
                          className='list-group-item d-flex justify-content-between align-items-center'
                        >
                          <div>
                            <div className='fw-medium'>
                              {c.periodo || c.concepto || 'Periodo'}
                            </div>
                            <div className='small text-muted'>
                              {c.concepto || ''}
                            </div>
                          </div>
                          <div className='text-end'>
                            <div className='fw-medium'>
                              {new Intl.NumberFormat('es-CL', {
                                style: 'currency',
                                currency: 'CLP',
                              }).format(c.monto || c.total || 0)}
                            </div>
                            <div className='small text-muted'>
                              {c.estado || ''}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
