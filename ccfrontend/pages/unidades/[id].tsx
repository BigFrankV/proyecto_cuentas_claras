import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import apiClient from '@/lib/api';
import { ProtectedRoute } from '@/lib/useAuth';

interface Unidad {
  id: string;
  numero: string;
  piso: number;
  torre: string;
  edificio: string;
  comunidad: string;
  tipo: 'Departamento' | 'Casa' | 'Local' | 'Oficina';
  superficie: number;
  superficieTerraza: number;
  superficieTotal: number;
  alicuota: number;
  dormitorios: number;
  banos: number;
  estado: 'Activo' | 'Inactivo' | 'Mantenimiento';
  propietario: {
    nombre: string;
    fechaIngreso: string;
    rut: string;
  };
  residentes: {
    id: string;
    nombre: string;
    iniciales: string;
  }[];
  estacionamiento?: {
    numero: string;
    ubicacion: string;
  };
  bodega?: {
    numero: string;
    ubicacion: string;
  };
  caracteristicas: string[];
  descripcion: string;
  saldoPendiente: number;
  ultimoPago?: {
    fecha: string;
    monto: number;
  };
  consumoAgua: number;
  consumoElectricidad: number;
  medidores: {
    agua?: {
      codigo: string;
      ultimaLectura: number;
      fechaLectura: string;
      consumoActual: number;
      promedioMensual: number;
    };
    electricidad?: {
      codigo: string;
      ultimaLectura: number;
      fechaLectura: string;
      consumoActual: number;
      promedioMensual: number;
    };
  };
  fechaCreacion: string;
}

interface Cargo {
  id: string;
  fecha: string;
  periodo: string;
  concepto: string;
  monto: number;
  estado: 'Pendiente' | 'Pagado' | 'Vencido';
}

interface Pago {
  id: string;
  fecha: string;
  medioPago: string;
  monto: number;
  comprobante: string;
  estado: 'Aplicado' | 'Pendiente' | 'Rechazado';
}

interface HistorialItem {
  id: string;
  fecha: string;
  tipo: string;
  descripcion: string;
}

const mockUnidad: Unidad = {
  id: '1',
  numero: 'A-101',
  piso: 1,
  torre: 'Torre A',
  edificio: 'Edificio Norte',
  comunidad: 'Las Palmas',
  tipo: 'Departamento',
  superficie: 78.5,
  superficieTerraza: 12.3,
  superficieTotal: 90.8,
  alicuota: 0.0125,
  dormitorios: 3,
  banos: 2,
  estado: 'Activo',
  propietario: {
    nombre: 'Juan Ramírez',
    fechaIngreso: '2021-03-15',
    rut: '12.345.678-9',
  },
  residentes: [
    { id: '1', nombre: 'Juan Ramírez', iniciales: 'JR' },
    { id: '2', nombre: 'María Ramírez', iniciales: 'MR' },
    { id: '3', nombre: 'Luis Pérez', iniciales: 'LP' },
  ],
  estacionamiento: {
    numero: 'E-25',
    ubicacion: 'Subterráneo 2, Sector Norte',
  },
  bodega: {
    numero: 'B-12',
    ubicacion: 'Subterráneo 1, Pasillo Central',
  },
  caracteristicas: ['Balcón', 'Terraza', 'Luminoso', 'Vista', 'Pet Friendly'],
  descripcion:
    'Departamento de 3 dormitorios, 2 baños, luminoso, ubicado en primer piso.',
  saldoPendiente: 256800,
  ultimoPago: {
    fecha: '2023-08-15',
    monto: 156000,
  },
  consumoAgua: 14.5,
  consumoElectricidad: 258,
  medidores: {
    agua: {
      codigo: 'AG-101-A',
      ultimaLectura: 1452.5,
      fechaLectura: '2023-09-01',
      consumoActual: 14.5,
      promedioMensual: 13.2,
    },
    electricidad: {
      codigo: 'EL-101-A',
      ultimaLectura: 8542,
      fechaLectura: '2023-09-01',
      consumoActual: 258,
      promedioMensual: 242,
    },
  },
  fechaCreacion: '2020-12-05',
};

const mockCargos: Cargo[] = [
  {
    id: '1',
    fecha: '2023-09-01',
    periodo: 'Septiembre 2023',
    concepto: 'Gastos comunes',
    monto: 156800,
    estado: 'Pendiente',
  },
  {
    id: '2',
    fecha: '2023-09-01',
    periodo: 'Septiembre 2023',
    concepto: 'Consumo agua',
    monto: 35000,
    estado: 'Pendiente',
  },
  {
    id: '3',
    fecha: '2023-09-01',
    periodo: 'Septiembre 2023',
    concepto: 'Fondo de reserva',
    monto: 15000,
    estado: 'Pendiente',
  },
  {
    id: '4',
    fecha: '2023-09-01',
    periodo: 'Septiembre 2023',
    concepto: 'Multa asamblea',
    monto: 50000,
    estado: 'Pendiente',
  },
];

const mockPagos: Pago[] = [
  {
    id: '1',
    fecha: '2023-08-15',
    medioPago: 'Transferencia',
    monto: 156000,
    comprobante: '#12345',
    estado: 'Aplicado',
  },
  {
    id: '2',
    fecha: '2023-07-15',
    medioPago: 'Transferencia',
    monto: 156000,
    comprobante: '#12289',
    estado: 'Aplicado',
  },
  {
    id: '3',
    fecha: '2023-06-15',
    medioPago: 'Webpay',
    monto: 152000,
    comprobante: '#12187',
    estado: 'Aplicado',
  },
];

const mockHistorial: HistorialItem[] = [
  {
    id: '1',
    fecha: '2021-03-15',
    tipo: 'Cambio de propietario',
    descripcion:
      'La propiedad fue transferida a Juan Ramírez (RUT: 12.345.678-9)',
  },
  {
    id: '2',
    fecha: '2021-01-10',
    tipo: 'Actualización de alícuota',
    descripcion: 'Se actualizó la alícuota de 0.012000 a 0.012500',
  },
  {
    id: '3',
    fecha: '2020-12-05',
    tipo: 'Alta de unidad',
    descripcion: 'Se registró la unidad en el sistema',
  },
];

export default function UnidadDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [unidad, setUnidad] = useState<Unidad | null>(null);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('cargos');
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch unidad summary, cargos, pagos, medidores
  useEffect(() => {
    if (!id) {return;}
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // summary
        const summaryRes = await apiClient.get(`/unidades/${id}/summary`);
        const u = summaryRes.data;
        if (mounted) {
          setUnidad({
            id: String(u.id),
            numero: u.codigo || u.numero || '',
            piso: u.piso || 0,
            torre: u.torre_nombre || '',
            edificio: u.edificio_nombre || '',
            comunidad: u.comunidad_nombre || '',
            tipo: u.tipo || 'Departamento',
            superficie: u.m2_utiles || 0,
            superficieTerraza: u.m2_terraza || 0,
            superficieTotal: (u.m2_utiles || 0) + (u.m2_terraza || 0),
            alicuota: u.alicuota || 0,
            dormitorios: u.dormitorios || 0,
            banos: u.nro_banos || 0,
            estado: u.estado || 'Activo',
            propietario: u.propietario
              ? {
                  nombre: u.propietario.nombre || u.propietario_nombre,
                  fechaIngreso:
                    u.propietario.fecha_ingreso || u.propietario_fecha_ingreso,
                  rut: u.propietario.rut || u.propietario_rut,
                }
              : { nombre: '', fechaIngreso: '', rut: '' },
            residentes: (u.residentes || []).map((r: any) => ({
              id: String(r.id),
              nombre: r.nombre,
              iniciales: r.iniciales || '',
            })),
            estacionamiento: u.estacionamiento || undefined,
            bodega: u.bodega || undefined,
            caracteristicas: u.caracteristicas || [],
            descripcion: u.descripcion || '',
            saldoPendiente: u.saldo_pendiente || 0,
            ultimoPago: u.ultimo_pago
              ? { fecha: u.ultimo_pago.fecha, monto: u.ultimo_pago.monto }
              : undefined,
            consumoAgua: u.consumo_agua || 0,
            consumoElectricidad: u.consumo_electricidad || 0,
            medidores: u.medidores || {},
            fechaCreacion: u.created_at || '',
          } as Unidad);
        }

        // cargos / cuentas
        const cuentasRes = await apiClient.get(`/unidades/${id}/cuentas`);
        if (mounted) {setCargos(cuentasRes.data || []);}

        // pagos
        const pagosRes = await apiClient.get(`/unidades/${id}/pagos`);
        if (mounted) {setPagos(pagosRes.data || []);}

        // historial / tickets could be another endpoint; use resumen.history if available
        if (mounted)
          {setHistorial(
            (u.historial || []).map((h: any) => ({
              id: String(h.id),
              fecha: h.fecha,
              tipo: h.tipo,
              descripcion: h.descripcion,
            })),
          );}
      } catch (err: any) {
// eslint-disable-next-line no-console
        console.error('Error loading unidad data', err);
        setError(
          err?.response?.data?.error || err.message || 'Error al cargar unidad',
        );
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Early returns to avoid rendering when data not ready
  if (loading) {
    return (
      <ProtectedRoute>
        <Head>
          <title>Cargando unidad — Cuentas Claras</title>
        </Head>
        <Layout title='Detalle de Unidad'>
          <div className='container-fluid py-4'>
            <div className='alert alert-info'>Cargando unidad...</div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!unidad) {
    return (
      <ProtectedRoute>
        <Head>
          <title>Unidad no encontrada — Cuentas Claras</title>
        </Head>
        <Layout title='Detalle de Unidad'>
          <div className='container-fluid py-4'>
            <div className='alert alert-warning'>Unidad no encontrada</div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Activo':
      case 'Aplicado':
      case 'Pagado':
        return 'bg-success';
      case 'Pendiente':
        return 'bg-warning';
      case 'Inactivo':
      case 'Vencido':
      case 'Rechazado':
        return 'bg-danger';
      case 'Mantenimiento':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>{unidad.numero} — Cuentas Claras</title>
      </Head>

      <Layout title={'Detalle de Unidad'}>
        <div className='container-fluid py-4'>
          {loading && (
            <div className='alert alert-info'>Cargando unidad...</div>
          )}
          {error && <div className='alert alert-danger'>Error: {error}</div>}
          {/* Breadcrumb y acciones */}
          <div className='row mb-4'>
            <div className='col-md-6'>
              <nav aria-label='breadcrumb'>
                <ol className='breadcrumb'>
                  <li className='breadcrumb-item'>
                    <Link href='/dashboard'>Dashboard</Link>
                  </li>
                  <li className='breadcrumb-item'>
                    <Link href='/unidades'>Unidades</Link>
                  </li>
                  <li className='breadcrumb-item active' aria-current='page'>
                    {unidad.numero}
                  </li>
                </ol>
              </nav>
            </div>
            <div className='col-md-6 d-flex justify-content-end'>
              <div className='dropdown'>
                <button
                  className='btn btn-outline-primary dropdown-toggle me-2'
                  type='button'
                  data-bs-toggle='dropdown'
                >
                  <i className='material-icons align-middle me-1'>more_horiz</i>
                  Acciones
                </button>
                <ul className='dropdown-menu'>
                  <li>
                    <Link
                      className='dropdown-item'
                      href={`/unidades/${unidad.id}/tenencias`}
                    >
                      <i className='material-icons align-middle me-1 small'>
                        person
                      </i>
                      Gestionar propietarios
                    </Link>
                  </li>
                  <li>
                    <Link
                      className='dropdown-item'
                      href={`/unidades/${unidad.id}/residentes`}
                    >
                      <i className='material-icons align-middle me-1 small'>
                        people
                      </i>
                      Gestionar residentes
                    </Link>
                  </li>
                  <li>
                    <button className='dropdown-item'>
                      <i className='material-icons align-middle me-1 small'>
                        receipt_long
                      </i>
                      Ver estado de cuenta
                    </button>
                  </li>
                  <li>
                    <button
                      className='dropdown-item'
                      data-bs-toggle='modal'
                      data-bs-target='#nuevoCargoPorUnidadModal'
                    >
                      <i className='material-icons align-middle me-1 small'>
                        receipt
                      </i>
                      Generar cargo
                    </button>
                  </li>
                  <li>
                    <hr className='dropdown-divider' />
                  </li>
                  <li>
                    <button className='dropdown-item text-danger'>
                      <i className='material-icons align-middle me-1 small'>
                        delete
                      </i>
                      Eliminar unidad
                    </button>
                  </li>
                </ul>
              </div>
              <button
                className='btn btn-primary'
                onClick={() => setShowEditModal(true)}
              >
                <i className='material-icons align-middle me-1'>edit</i>
                Editar
              </button>
            </div>
          </div>

          {/* Resumen de Unidad */}
          <div className='row mb-4'>
            <div className='col-md-12'>
              <div
                className='mb-4'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  className='d-flex justify-content-between align-items-center p-3'
                  style={{
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <div>
                    <h5 className='mb-0'>Unidad {unidad.numero}</h5>
                    <span
                      className={`badge ${getEstadoBadgeClass(unidad.estado)}`}
                    >
                      {unidad.estado}
                    </span>
                  </div>
                  <div>
                    <span className='badge bg-light text-dark me-2'>
                      {unidad.tipo}
                    </span>
                    <span className='badge bg-light text-dark'>
                      {unidad.superficie} m²
                    </span>
                  </div>
                </div>

                <div className='p-4'>
                  <div className='row'>
                    <div className='col-md-6'>
                      <div className='mb-4'>
                        <h6 className='text-muted mb-3'>Información Básica</h6>
                        <div className='row mb-2'>
                          <div className='col-md-4'>
                            <span className='text-muted'>Comunidad:</span>
                          </div>
                          <div className='col-md-8'>{unidad.comunidad}</div>
                        </div>
                        <div className='row mb-2'>
                          <div className='col-md-4'>
                            <span className='text-muted'>Edificio:</span>
                          </div>
                          <div className='col-md-8'>{unidad.edificio}</div>
                        </div>
                        <div className='row mb-2'>
                          <div className='col-md-4'>
                            <span className='text-muted'>Torre:</span>
                          </div>
                          <div className='col-md-8'>{unidad.torre}</div>
                        </div>
                        <div className='row mb-2'>
                          <div className='col-md-4'>
                            <span className='text-muted'>Piso:</span>
                          </div>
                          <div className='col-md-8'>{unidad.piso}</div>
                        </div>
                        <div className='row mb-2'>
                          <div className='col-md-4'>
                            <span className='text-muted'>Tipo:</span>
                          </div>
                          <div className='col-md-8'>{unidad.tipo}</div>
                        </div>
                        <div className='row mb-2'>
                          <div className='col-md-4'>
                            <span className='text-muted'>Descripción:</span>
                          </div>
                          <div className='col-md-8'>{unidad.descripcion}</div>
                        </div>
                      </div>

                      <div className='mb-3'>
                        <h6 className='text-muted mb-3'>Propietario</h6>
                        <div className='d-flex align-items-center'>
                          <div
                            className='avatar me-2 d-flex align-items-center justify-content-center text-white'
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-primary)',
                              fontSize: '12px',
                            }}
                          >
                            {unidad.propietario.nombre
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </div>
                          <div>
                            <div className='fw-medium'>
                              {unidad.propietario.nombre}
                            </div>
                            <div className='small text-muted'>
                              Propietario desde{' '}
                              {formatDate(unidad.propietario.fechaIngreso)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h6 className='text-muted mb-3'>Residentes</h6>
                        <div className='d-flex mb-2'>
                          {unidad.residentes.map((residente, index) => (
                            <div
                              key={residente.id}
                              className='avatar d-flex align-items-center justify-content-center text-white'
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor:
                                  index === 0
                                    ? 'var(--color-primary)'
                                    : index === 1
                                      ? 'var(--color-accent)'
                                      : 'var(--color-secondary)',
                                fontSize: '12px',
                                marginLeft: index > 0 ? '-10px' : '0',
                                border: '2px solid white',
                              }}
                              title={residente.nombre}
                            >
                              {residente.iniciales}
                            </div>
                          ))}
                        </div>
                        <Link
                          href={`/unidades/${unidad.id}/residentes`}
                          className='btn btn-sm btn-outline-primary mt-2'
                        >
                          <i
                            className='material-icons align-middle me-1'
                            style={{ fontSize: '16px' }}
                          >
                            people
                          </i>
                          Gestionar residentes
                        </Link>
                      </div>
                    </div>

                    <div className='col-md-6'>
                      <div className='mb-4'>
                        <h6 className='text-muted mb-3'>Detalles y Medidas</h6>
                        <div className='row mb-2'>
                          <div className='col-md-6'>
                            <span className='text-muted'>M² Útiles:</span>
                          </div>
                          <div className='col-md-6'>{unidad.superficie} m²</div>
                        </div>
                        <div className='row mb-2'>
                          <div className='col-md-6'>
                            <span className='text-muted'>M² Terrazas:</span>
                          </div>
                          <div className='col-md-6'>
                            {unidad.superficieTerraza} m²
                          </div>
                        </div>
                        <div className='row mb-2'>
                          <div className='col-md-6'>
                            <span className='text-muted'>M² Totales:</span>
                          </div>
                          <div className='col-md-6'>
                            {unidad.superficieTotal} m²
                          </div>
                        </div>
                        <div className='row mb-2'>
                          <div className='col-md-6'>
                            <span className='text-muted'>Alícuota:</span>
                          </div>
                          <div className='col-md-6'>
                            {unidad.alicuota.toFixed(6)}
                          </div>
                        </div>
                        <div className='row mb-2'>
                          <div className='col-md-6'>
                            <span className='text-muted'>Dormitorios:</span>
                          </div>
                          <div className='col-md-6'>{unidad.dormitorios}</div>
                        </div>
                        <div className='row mb-2'>
                          <div className='col-md-6'>
                            <span className='text-muted'>Baños:</span>
                          </div>
                          <div className='col-md-6'>{unidad.banos}</div>
                        </div>
                      </div>

                      {(unidad.estacionamiento || unidad.bodega) && (
                        <div className='mb-4'>
                          <h6 className='text-muted mb-3'>
                            Bodega y Estacionamiento
                          </h6>
                          {unidad.estacionamiento && (
                            <>
                              <div className='row mb-2'>
                                <div className='col-md-6'>
                                  <span className='text-muted'>
                                    N° Estacionamiento:
                                  </span>
                                </div>
                                <div className='col-md-6'>
                                  {unidad.estacionamiento.numero}
                                </div>
                              </div>
                              <div className='row mb-2'>
                                <div className='col-md-6'>
                                  <span className='text-muted'>
                                    Ubicación Estacionamiento:
                                  </span>
                                </div>
                                <div className='col-md-6'>
                                  {unidad.estacionamiento.ubicacion}
                                </div>
                              </div>
                            </>
                          )}
                          {unidad.bodega && (
                            <>
                              <div className='row mb-2'>
                                <div className='col-md-6'>
                                  <span className='text-muted'>N° Bodega:</span>
                                </div>
                                <div className='col-md-6'>
                                  {unidad.bodega.numero}
                                </div>
                              </div>
                              <div className='row mb-2'>
                                <div className='col-md-6'>
                                  <span className='text-muted'>
                                    Ubicación Bodega:
                                  </span>
                                </div>
                                <div className='col-md-6'>
                                  {unidad.bodega.ubicacion}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <div>
                        <h6 className='text-muted mb-3'>Características</h6>
                        <div>
                          {unidad.caracteristicas.map(
                            (caracteristica, index) => (
                              <span
                                key={index}
                                className='badge me-2 mb-2'
                                style={{
                                  backgroundColor: 'var(--color-primary)',
                                  color: 'white',
                                  borderRadius: '16px',
                                  padding: '0.25rem 0.75rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 'normal',
                                }}
                              >
                                {caracteristica}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas de la unidad */}
          <div className='row mb-4'>
            <div className='col-md-3 mb-3'>
              <div
                className='card h-100'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div className='d-flex align-items-center mb-2'>
                  <i
                    className='material-icons me-2'
                    style={{ color: 'var(--color-danger)' }}
                  >
                    account_balance
                  </i>
                  <span className='small text-muted'>Saldo Pendiente</span>
                </div>
                <div
                  className='h4 mb-0'
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: 'var(--color-primary)',
                  }}
                >
                  {formatCurrency(unidad.saldoPendiente)}
                </div>
              </div>
            </div>
            <div className='col-md-3 mb-3'>
              <div
                className='card h-100'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div className='d-flex align-items-center mb-2'>
                  <i
                    className='material-icons me-2'
                    style={{ color: 'var(--color-primary)' }}
                  >
                    payments
                  </i>
                  <span className='small text-muted'>Último Pago</span>
                </div>
                <div
                  className='h4 mb-0'
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: 'var(--color-primary)',
                  }}
                >
                  {unidad.ultimoPago
                    ? formatCurrency(unidad.ultimoPago.monto)
                    : 'N/A'}
                </div>
                {unidad.ultimoPago && (
                  <div className='small text-muted'>
                    {formatDateShort(unidad.ultimoPago.fecha)}
                  </div>
                )}
              </div>
            </div>
            <div className='col-md-3 mb-3'>
              <div
                className='card h-100'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div className='d-flex align-items-center mb-2'>
                  <i
                    className='material-icons me-2'
                    style={{ color: 'var(--color-warning)' }}
                  >
                    water_drop
                  </i>
                  <span className='small text-muted'>Consumo Agua</span>
                </div>
                <div
                  className='h4 mb-0'
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: 'var(--color-primary)',
                  }}
                >
                  {unidad.consumoAgua} m³
                </div>
                <div className='small text-muted'>Último mes</div>
              </div>
            </div>
            <div className='col-md-3 mb-3'>
              <div
                className='card h-100'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div className='d-flex align-items-center mb-2'>
                  <i
                    className='material-icons me-2'
                    style={{ color: 'var(--color-success)' }}
                  >
                    bolt
                  </i>
                  <span className='small text-muted'>Consumo Electricidad</span>
                </div>
                <div
                  className='h4 mb-0'
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: 'var(--color-primary)',
                  }}
                >
                  {unidad.consumoElectricidad} kWh
                </div>
                <div className='small text-muted'>Último mes</div>
              </div>
            </div>
          </div>

          {/* Tabs de contenido */}
          <div
            className='mb-4'
            style={{
              backgroundColor: '#fff',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
              <ul className='nav nav-tabs' role='tablist'>
                <li className='nav-item' role='presentation'>
                  <button
                    className={`nav-link ${activeTab === 'cargos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cargos')}
                    type='button'
                    role='tab'
                  >
                    <i className='material-icons align-middle me-1'>
                      receipt_long
                    </i>
                    Cargos
                  </button>
                </li>
                <li className='nav-item' role='presentation'>
                  <button
                    className={`nav-link ${activeTab === 'pagos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pagos')}
                    type='button'
                    role='tab'
                  >
                    <i className='material-icons align-middle me-1'>payments</i>
                    Pagos
                  </button>
                </li>
                <li className='nav-item' role='presentation'>
                  <button
                    className={`nav-link ${activeTab === 'medidores' ? 'active' : ''}`}
                    onClick={() => setActiveTab('medidores')}
                    type='button'
                    role='tab'
                  >
                    <i className='material-icons align-middle me-1'>speed</i>
                    Medidores
                  </button>
                </li>
                <li className='nav-item' role='presentation'>
                  <button
                    className={`nav-link ${activeTab === 'historico' ? 'active' : ''}`}
                    onClick={() => setActiveTab('historico')}
                    type='button'
                    role='tab'
                  >
                    <i className='material-icons align-middle me-1'>history</i>
                    Histórico
                  </button>
                </li>
              </ul>
            </div>

            <div className='tab-content p-3'>
              {/* Tab Cargos */}
              {activeTab === 'cargos' && (
                <div className='tab-pane fade show active'>
                  <div className='table-responsive'>
                    <table className='table table-hover table-striped mb-0'>
                      <thead className='table-light'>
                        <tr>
                          <th scope='col'>Fecha</th>
                          <th scope='col'>Período</th>
                          <th scope='col'>Concepto</th>
                          <th scope='col'>Monto</th>
                          <th scope='col'>Estado</th>
                          <th scope='col'>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cargos.map(cargo => (
                          <tr key={cargo.id}>
                            <td>{formatDateShort(cargo.fecha)}</td>
                            <td>{cargo.periodo}</td>
                            <td>{cargo.concepto}</td>
                            <td>{formatCurrency(cargo.monto)}</td>
                            <td>
                              <span
                                className={`badge ${getEstadoBadgeClass(cargo.estado)}`}
                              >
                                {cargo.estado}
                              </span>
                            </td>
                            <td>
                              <button className='btn btn-sm btn-outline-primary'>
                                Ver detalle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab Pagos */}
              {activeTab === 'pagos' && (
                <div className='tab-pane fade show active'>
                  <div className='table-responsive'>
                    <table className='table table-hover table-striped mb-0'>
                      <thead className='table-light'>
                        <tr>
                          <th scope='col'>Fecha</th>
                          <th scope='col'>Medio de pago</th>
                          <th scope='col'>Monto</th>
                          <th scope='col'>Comprobante</th>
                          <th scope='col'>Estado</th>
                          <th scope='col'>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagos.map(pago => (
                          <tr key={pago.id}>
                            <td>{formatDateShort(pago.fecha)}</td>
                            <td>{pago.medioPago}</td>
                            <td>{formatCurrency(pago.monto)}</td>
                            <td>{pago.comprobante}</td>
                            <td>
                              <span
                                className={`badge ${getEstadoBadgeClass(pago.estado)}`}
                              >
                                {pago.estado}
                              </span>
                            </td>
                            <td>
                              <button className='btn btn-sm btn-outline-primary'>
                                Ver detalle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab Medidores */}
              {activeTab === 'medidores' && (
                <div className='tab-pane fade show active'>
                  <div className='row'>
                    {unidad.medidores.agua && (
                      <div className='col-md-6'>
                        <div className='card mb-4'>
                          <div className='card-header bg-white'>
                            <h6 className='mb-0'>
                              <i
                                className='material-icons align-middle me-1'
                                style={{ color: 'var(--color-warning)' }}
                              >
                                water_drop
                              </i>
                              Medidor de Agua
                            </h6>
                          </div>
                          <div className='card-body'>
                            <div className='row mb-3'>
                              <div className='col-md-4 text-muted'>Código:</div>
                              <div className='col-md-8'>
                                {unidad.medidores.agua.codigo}
                              </div>
                            </div>
                            <div className='row mb-3'>
                              <div className='col-md-4 text-muted'>
                                Última lectura:
                              </div>
                              <div className='col-md-8'>
                                {unidad.medidores.agua.ultimaLectura} m³ (
                                {formatDateShort(
                                  unidad.medidores.agua.fechaLectura,
                                )}
                                )
                              </div>
                            </div>
                            <div className='row mb-3'>
                              <div className='col-md-4 text-muted'>
                                Consumo actual:
                              </div>
                              <div className='col-md-8'>
                                {unidad.medidores.agua.consumoActual} m³
                              </div>
                            </div>
                            <div className='row mb-3'>
                              <div className='col-md-4 text-muted'>
                                Promedio mensual:
                              </div>
                              <div className='col-md-8'>
                                {unidad.medidores.agua.promedioMensual} m³
                              </div>
                            </div>
                            <button className='btn btn-sm btn-outline-primary mt-2'>
                              <i
                                className='material-icons align-middle me-1'
                                style={{ fontSize: '16px' }}
                              >
                                add
                              </i>
                              Nueva Lectura
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {unidad.medidores.electricidad && (
                      <div className='col-md-6'>
                        <div className='card mb-4'>
                          <div className='card-header bg-white'>
                            <h6 className='mb-0'>
                              <i
                                className='material-icons align-middle me-1'
                                style={{ color: 'var(--color-success)' }}
                              >
                                bolt
                              </i>
                              Medidor de Electricidad
                            </h6>
                          </div>
                          <div className='card-body'>
                            <div className='row mb-3'>
                              <div className='col-md-4 text-muted'>Código:</div>
                              <div className='col-md-8'>
                                {unidad.medidores.electricidad.codigo}
                              </div>
                            </div>
                            <div className='row mb-3'>
                              <div className='col-md-4 text-muted'>
                                Última lectura:
                              </div>
                              <div className='col-md-8'>
                                {unidad.medidores.electricidad.ultimaLectura}{' '}
                                kWh (
                                {formatDateShort(
                                  unidad.medidores.electricidad.fechaLectura,
                                )}
                                )
                              </div>
                            </div>
                            <div className='row mb-3'>
                              <div className='col-md-4 text-muted'>
                                Consumo actual:
                              </div>
                              <div className='col-md-8'>
                                {unidad.medidores.electricidad.consumoActual}{' '}
                                kWh
                              </div>
                            </div>
                            <div className='row mb-3'>
                              <div className='col-md-4 text-muted'>
                                Promedio mensual:
                              </div>
                              <div className='col-md-8'>
                                {unidad.medidores.electricidad.promedioMensual}{' '}
                                kWh
                              </div>
                            </div>
                            <button className='btn btn-sm btn-outline-primary mt-2'>
                              <i
                                className='material-icons align-middle me-1'
                                style={{ fontSize: '16px' }}
                              >
                                add
                              </i>
                              Nueva Lectura
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab Histórico */}
              {activeTab === 'historico' && (
                <div className='tab-pane fade show active'>
                  <div style={{ position: 'relative', paddingLeft: '30px' }}>
                    {historial.map((item, index) => (
                      <div
                        key={item.id}
                        className='position-relative'
                        style={{
                          paddingBottom:
                            index < historial.length - 1 ? '1.5rem' : '0',
                        }}
                      >
                        <div
                          className='position-absolute'
                          style={{
                            left: '-20px',
                            top: '0',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-primary)',
                          }}
                        />
                        {index < historial.length - 1 && (
                          <div
                            className='position-absolute'
                            style={{
                              left: '-16px',
                              top: '10px',
                              width: '2px',
                              height: 'calc(100% - 10px)',
                              backgroundColor: '#dee2e6',
                            }}
                          />
                        )}
                        <div className='fw-medium'>{item.tipo}</div>
                        <div className='text-muted'>
                          {formatDateShort(item.fecha)}
                        </div>
                        <p className='mb-0'>{item.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
