import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getTenenciasUnidad, type Tenencia } from '@/lib/unidadesService';

export default function TenenciasUnidad() {
  const router = useRouter();
  const { id } = router.query;
  const [tenencias, setTenencias] = useState<Tenencia[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getTenenciasUnidad(Number(id), true);
        if (mounted) {
          setTenencias(data || []);
        }
      } catch (err) {
        console.error('Error loading tenencias', err);
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
        <title>Tenencias — Cuentas Claras</title>
      </Head>

      <Layout title={`Tenencias - Unidad ${id || ''}`}>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <div className='card'>
                <div className='card-body'>
                  <h1 className='card-title'>
                    Gestión de Propietarios/Tenencias
                  </h1>
                  <p className='text-muted'>
                    Lista de propietarios / tenencias de la unidad
                  </p>
                  {loading && <div className='alert alert-info'>Cargando...</div>}
                  {!loading && tenencias.length === 0 && (
                    <div className='alert alert-warning'>No se encontraron tenencias</div>
                  )}
                  {!loading && tenencias.length > 0 && (
                    <ul className='list-group'>
                      {tenencias.map((t) => (
                        <li key={t.id} className='list-group-item'>
                          <div className='fw-medium'>
                            {t.nombres} {t.apellidos}
                          </div>
                          <div className='small text-muted'>
                            Tipo: {t.tipo} • Desde: {t.desde}
                            {t.hasta && ` • Hasta: ${t.hasta}`}
                            {t.porcentaje && ` • ${t.porcentaje}%`}
                          </div>
                          {t.email && (
                            <div className='small text-muted'>Email: {t.email}</div>
                          )}
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
