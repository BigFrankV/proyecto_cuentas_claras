import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { CargosUnidad, UnitInfo, Cargo } from '@/components/cargos';
import Layout from '@/components/layout/Layout';
import { cargosApi } from '@/lib/api/cargos';
import { ProtectedRoute } from '@/lib/useAuth';

export default function CargosUnidadPage() {
  const router = useRouter();
  const { unidad } = router.query;
  const [unitInfo, setUnitInfo] = useState<UnitInfo | null>(null);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnitData = async () => {
      if (!unidad || typeof unidad !== 'string') {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // eslint-disable-next-line no-console
        console.log('🔍 Cargando datos de la unidad:', unidad);

        // Obtener cargos de la unidad desde la API
        const cargosData = await cargosApi.getByUnidad(parseInt(unidad));

        // Mapear los datos de la API al formato que espera el componente
        const mappedCargos: Cargo[] = cargosData.map(cargo => ({
          id: cargo.id.toString(),
          concepto: cargo.concepto,
          descripcion: cargo.descripcion || '',
          tipo: cargo.tipo.toLowerCase().includes('administración')
            ? 'administration'
            : cargo.tipo.toLowerCase().includes('mantenimiento')
              ? 'maintenance'
              : cargo.tipo.toLowerCase().includes('servicio')
                ? 'service'
                : cargo.tipo.toLowerCase().includes('seguro')
                  ? 'insurance'
                  : 'other',
          estado:
            cargo.estado === 'pendiente'
              ? 'pending'
              : cargo.estado === 'pagado'
                ? 'paid'
                : cargo.estado === 'parcial'
                  ? 'partial'
                  : 'pending',
          monto: cargo.monto,
          montoAplicado: cargo.monto - cargo.saldo,
          saldo: cargo.saldo,
          unidad: cargo.unidad,
          periodo: cargo.periodo || '',
          fechaVencimiento: cargo.fechaVencimiento,
          fechaCreacion: cargo.fechaCreacion,
          cuentaCosto: `CCU-${cargo.id}`,
          observaciones: `Comunidad: ${cargo.nombreComunidad || 'N/A'}`,
        }));

        // Crear información básica de la unidad (mock por ahora)
        const unitData: UnitInfo = {
          numero: unidad,
          torre: unidad.includes('-')
            ? `Torre ${unidad.split('-')[1]}`
            : 'Torre A',
          propietario: 'Información no disponible',
          residente: 'Información no disponible',
          telefono: 'N/A',
          email: 'N/A',
          metrosCuadrados: 0,
          coeficiente: 0,
        };

        // eslint-disable-next-line no-console
        console.log('✅ Datos cargados:', {
          unitData,
          cargosCount: mappedCargos.length,
        });
        setUnitInfo(unitData);
        setCargos(mappedCargos);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('❌ Error al cargar datos de la unidad:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Error desconocido al cargar los datos',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUnitData();
  }, [unidad]);

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Cargando...'>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ minHeight: '400px' }}
          >
            <div className='text-center'>
              <div className='spinner-border mb-3' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='text-muted'>Cargando información de la unidad...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error || !unitInfo) {
    return (
      <ProtectedRoute>
        <Layout title='Error'>
          <div className='container-fluid p-4'>
            <div className='row justify-content-center'>
              <div className='col-md-6'>
                <div className='text-center'>
                  <i className='material-icons display-1 text-muted'>
                    home_work
                  </i>
                  <h2 className='mt-3'>Unidad no encontrada</h2>
                  <p className='text-muted mb-4'>
                    {error ||
                      'La unidad solicitada no existe o no tienes permisos para verla.'}
                  </p>
                  <div className='d-flex gap-2 justify-content-center'>
                    <button
                      className='btn btn-primary'
                      onClick={() => router.push('/cargos')}
                    >
                      <i className='material-icons me-2'>arrow_back</i>
                      Volver a Cargos
                    </button>
                    <button
                      className='btn btn-outline-primary'
                      onClick={() => router.push('/unidades')}
                    >
                      <i className='material-icons me-2'>home</i>
                      Ver Unidades
                    </button>
                    <button
                      className='btn btn-outline-secondary'
                      onClick={() => router.reload()}
                    >
                      <i className='material-icons me-2'>refresh</i>
                      Reintentar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Cargos Unidad {unitInfo.numero} — Cuentas Claras</title>
      </Head>

      <Layout title={`Cargos Unidad ${unitInfo.numero}`}>
        <div className='container-fluid p-4'>
          {/* Breadcrumb */}
          <nav aria-label='breadcrumb' className='mb-4'>
            <ol className='breadcrumb'>
              <li className='breadcrumb-item'>
                <button
                  className='btn btn-link p-0 text-decoration-none'
                  onClick={() => router.push('/cargos')}
                >
                  Cargos
                </button>
              </li>
              <li className='breadcrumb-item'>
                <button
                  className='btn btn-link p-0 text-decoration-none'
                  onClick={() => router.push('/unidades')}
                >
                  Unidades
                </button>
              </li>
              <li className='breadcrumb-item active' aria-current='page'>
                Unidad {unitInfo.numero}
              </li>
            </ol>
          </nav>

          <CargosUnidad unidad={unitInfo} cargos={cargos} />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
