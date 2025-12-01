import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';


import {
  CargoDetalle,
  Cargo,
  PaymentRecord,
  Document,
  TimelineItem,
} from '@/components/cargos';
import Layout from '@/components/layout/Layout';
import { cargosApi } from '@/lib/api/cargos';
import { ProtectedRoute } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';
import { CargoDetalle as CargoDetalleType } from '@/types/cargos';

export default function CargoDetallePage() {
  const router = useRouter();
  const { id } = router.query;
  const [cargo, setCargo] = useState<Cargo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const { comunidadSeleccionada } = useComunidad();

  useEffect(() => {
    const fetchCargo = async () => {
      if (!id || typeof id !== 'string') {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // eslint-disable-next-line no-console
        console.log('🔍 Cargando detalle del cargo:', id);

        // Obtener el cargo desde la API
        const cargoData = await cargosApi.getById(parseInt(id));

        // Mapear los datos de la API al formato que espera el componente
        const estadoMapping: Record<
          string,
          'pending' | 'approved' | 'rejected' | 'paid' | 'partial'
        > = {
          pendiente: 'pending',
          pagado: 'paid',
          vencido: 'pending', // Mapear vencido como pending
          parcial: 'partial',
        };

        const mappedCargo: Cargo = {
          id: cargoData.id.toString(),
          concepto: cargoData.concepto,
          descripcion: cargoData.descripcion || '',
          tipo: cargoData.tipo.toLowerCase().includes('administración')
            ? 'administration'
            : cargoData.tipo.toLowerCase().includes('mantenimiento')
              ? 'maintenance'
              : cargoData.tipo.toLowerCase().includes('servicio')
                ? 'service'
                : cargoData.tipo.toLowerCase().includes('seguro')
                  ? 'insurance'
                  : 'other',
          estado: estadoMapping[cargoData.estado] || 'pending',
          monto: cargoData.monto,
          saldo: cargoData.saldo, // Agregar campo saldo
          montoAplicado: cargoData.monto - cargoData.saldo, // Calcular monto aplicado
          unidad: cargoData.unidad,
          periodo: cargoData.periodo || '',
          fechaVencimiento: cargoData.fechaVencimiento,
          fechaCreacion: cargoData.fechaCreacion,
          cuentaCosto: `CCU-${cargoData.id}`, // Generar un código de cuenta de costo
          observaciones: `Propietario: ${cargoData.propietario || 'N/A'}`,
        };

        // eslint-disable-next-line no-console

        // eslint-disable-next-line no-console
        console.log('✅ Cargo mapeado:', mappedCargo);
        setCargo(mappedCargo);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('❌ Error al cargar cargo:', err);
        const m = String(err || '');
        if (/403|forbidden/i.test(m)) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar el cargo');
      } finally {
        setLoading(false);
      }
    };

    fetchCargo();
  }, [id]);

  // Re-cargar si cambia la comunidad global
  useEffect(() => {
    if (id) {
      setAccessDenied(false);
      // re-run fetch by changing id dependency indirectly
      // call fetch again
      const fetchAgain = async () => {
        setLoading(true);
        setError(null);
        try {
          const cargoData = await cargosApi.getById(parseInt(String(id)));
          const estadoMapping: Record<string, 'pending' | 'approved' | 'rejected' | 'paid' | 'partial'> = {
            pendiente: 'pending',
            pagado: 'paid',
            vencido: 'pending',
            parcial: 'partial',
          };
          const mappedCargo: Cargo = {
            id: cargoData.id.toString(),
            concepto: cargoData.concepto,
            descripcion: cargoData.descripcion || '',
            tipo: cargoData.tipo?.toLowerCase().includes('administración')
              ? 'administration'
              : cargoData.tipo?.toLowerCase().includes('mantenimiento')
                ? 'maintenance'
                : cargoData.tipo?.toLowerCase().includes('servicio')
                  ? 'service'
                  : cargoData.tipo?.toLowerCase().includes('seguro')
                    ? 'insurance'
                    : 'other',
            estado: estadoMapping[cargoData.estado] || 'pending',
            monto: cargoData.monto,
            saldo: cargoData.saldo,
            montoAplicado: cargoData.monto - cargoData.saldo,
            unidad: cargoData.unidad,
            periodo: cargoData.periodo || '',
            fechaVencimiento: cargoData.fechaVencimiento,
            fechaCreacion: cargoData.fechaCreacion,
            cuentaCosto: `CCU-${cargoData.id}`,
            observaciones: `Propietario: ${cargoData.propietario || 'N/A'}`,
          };
          setCargo(mappedCargo);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('❌ Error al recargar cargo tras cambio de comunidad:', err);
          const m = String(err || '');
          if (/403|forbidden/i.test(m)) {
            setAccessDenied(true);
            setLoading(false);
            return;
          }
          setError(err instanceof Error ? err.message : 'Error desconocido al cargar el cargo');
        } finally {
          setLoading(false);
        }
      };
      fetchAgain();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comunidadSeleccionada]);

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
              <p className='text-muted'>Cargando información del cargo...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error || !cargo) {
    return (
      <ProtectedRoute>
        <Layout title='Error'>
          <div className='container-fluid p-4'>
            <div className='row justify-content-center'>
              <div className='col-md-6'>
                <div className='text-center'>
                  {accessDenied ? (
                    <>
                      <div className='alert alert-warning'>
                        <i className='material-icons me-2'>warning</i>
                        No tienes permiso para ver este cargo en la comunidad seleccionada.
                      </div>
                      <div className='d-flex gap-2 justify-content-center'>
                        <button
                          className='btn btn-primary'
                          onClick={() => router.push('/cargos')}
                        >
                          <i className='material-icons me-2'>arrow_back</i>
                          Volver a Cargos
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <i className='material-icons display-1 text-muted'>
                        error_outline
                      </i>
                      <h2 className='mt-3'>Cargo no encontrado</h2>
                      <p className='text-muted mb-4'>
                        {error || 'El cargo solicitado no existe o no tienes permisos para verlo.'}
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
                          className='btn btn-outline-secondary'
                          onClick={() => router.reload()}
                        >
                          <i className='material-icons me-2'>refresh</i>
                          Reintentar
                        </button>
                      </div>
                    </>
                  )}
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
        <title>{cargo.concepto} — Cuentas Claras</title>
      </Head>

      <Layout title={`Cargo ${cargo.id}`}>
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
              <li className='breadcrumb-item active' aria-current='page'>
                {cargo.id}
              </li>
            </ol>
          </nav>

          <CargoDetalle cargo={cargo} pagos={[]} documentos={[]} historial={[]} />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
