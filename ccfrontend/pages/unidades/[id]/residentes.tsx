import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import apiClient from '@/lib/api';
import { ProtectedRoute } from '@/lib/useAuth';

export default function ResidentesUnidad() {
  const router = useRouter();
  const { id } = router.query;
  const [residentes, setResidentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/unidades/${id}/residentes`);
        if (mounted) {
          setResidentes(res.data || []);
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
                    Lista de residentes asociados a la unidad
                  </p>
                  {loading && (
                    <div className='alert alert-info'>Cargando...</div>
                  )}
                  {!loading && residentes.length === 0 && (
                    <div className='alert alert-warning'>No hay residentes</div>
                  )}
                  {!loading && residentes.length > 0 && (
                    <ul className='list-group'>
                      {residentes.map(r => (
                        <li key={r.id} className='list-group-item'>
                          <div className='fw-medium'>{r.nombre}</div>
                          <div className='small text-muted'>{r.rut || ''}</div>
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
