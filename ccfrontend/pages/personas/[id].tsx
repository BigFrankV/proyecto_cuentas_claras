import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import { usePersonas } from '@/hooks/usePersonas';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';
import {
  Persona,
  UnidadAsociada,
  PagoRealizado,
  ActividadAuditoria,
  DocumentoAsociado,
  NotaAsociada,
  RolComunidad,
  ResumenFinanciero,
} from '@/types/personas';

// Interfaces movidas a @/types/personas.ts

export default function PersonaDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState('unidades');
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);

  // Estados para datos de la API
  const [persona, setPersona] = useState<Persona | null>(null);
  const [unidades, setUnidades] = useState<UnidadAsociada[]>([]);
  const [pagos, setPagos] = useState<PagoRealizado[]>([]);
  const [actividades, setActividades] = useState<ActividadAuditoria[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoAsociado[]>([]);
  const [notas, setNotas] = useState<NotaAsociada[]>([]);
  const [roles, setRoles] = useState<RolComunidad[]>([]);
  const [resumenFinanciero, setResumenFinanciero] = useState<
    ResumenFinanciero[]
  >([]);

  const {
    obtenerPersona,
    obtenerUnidadesAsociadas,
    obtenerPagosRealizados,
    obtenerActividad,
    obtenerDocumentos,
    obtenerNotas,
    obtenerRolesComunidades,
    obtenerResumenFinanciero,
    loading,
    error,
    clearError,
  } = usePersonas();

  const { comunidadSeleccionada } = useComunidad();

  const { user } = useAuth();

  const isSelf = !!(user?.persona_id && persona && Number(user.persona_id) === Number(persona.id));
  const userAdminCommunities = user?.memberships?.filter((m: any) => ['admin', 'admin_comunidad'].includes(m.rol)).map((m: any) => m.comunidadId) || [];
  const personaCommunityIds = roles.map(r => r.comunidad_id);
  const canManage = !!(user?.is_superadmin || isSelf || userAdminCommunities.some((id: number) => personaCommunityIds.includes(id)));

  // Cargar datos cuando cambia el ID
  useEffect(() => {
    if (id && typeof id === 'string') {
      cargarDatosPersona(parseInt(id));
    }
  }, [id, comunidadSeleccionada]);

  const cargarDatosPersona = async (personaId: number) => {
    try {
      // Cargar datos principales
      const personaData = await obtenerPersona(personaId);
      setPersona(personaData);

      // Cargar datos de pestañas en paralelo
      const [
        unidadesData,
        pagosData,
        actividadesData,
        documentosData,
        notasData,
        rolesData,
        resumenData,
      ] = await Promise.all([
        obtenerUnidadesAsociadas(personaId),
        obtenerPagosRealizados(personaId),
        obtenerActividad(personaId),
        obtenerDocumentos(personaId),
        obtenerNotas(personaId),
        obtenerRolesComunidades(personaId),
        obtenerResumenFinanciero(personaId),
      ]);

      setUnidades(unidadesData);
      setPagos(pagosData);
      setActividades(actividadesData);
      setDocumentos(documentosData);
      setNotas(notasData);
      setRoles(rolesData);
      setResumenFinanciero(resumenData);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error cargando datos de persona:', err);
      // Si el backend indica 403, limpiar error del hook para evitar banner peligroso
      // (el hook puede encapsular la respuesta, intentamos limpiar por seguridad)
      // @ts-ignore
      if (err?.response?.status === 403) {
        clearError();
        setPersona(null);
        return;
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const getTipoBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'Propietario':
        return 'bg-success';
      case 'Inquilino':
        return 'bg-info';
      case 'Administrador':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  const getEstadoBadgeClass = (estado: string) => {
    return estado === 'Activo' ? 'bg-success' : 'bg-secondary';
  };

  // Mostrar loading mientras carga
  if (loading && !persona) {
    return (
      <ProtectedRoute>
        <Layout title='Detalle de Persona'>
          <div className='container-fluid py-4'>
            <div className='text-center py-5'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='mt-2 text-muted'>Cargando datos de la persona...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Mostrar error si existe
  if (error && !persona) {
    return (
      <ProtectedRoute>
        <Layout title='Detalle de Persona'>
          <div className='container-fluid py-4'>
            <div className='alert alert-danger' role='alert'>
              <i className='material-icons me-2'>error</i>
              Error al cargar los datos de la persona: {error}
            </div>
            <div className='text-center py-4'>
              <Link href='/personas' className='btn btn-primary'>
                Volver al listado
              </Link>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Si no hay persona, mostrar mensaje
  if (!persona) {
    return (
      <ProtectedRoute>
        <Layout title='Detalle de Persona'>
          <div className='container-fluid py-4'>
            <div className='text-center py-5'>
              <i
                className='material-icons'
                style={{ fontSize: '4rem', color: '#6c757d' }}
              >
                person_off
              </i>
              <h5 className='mt-3 text-muted'>Persona no encontrada</h5>
              <p className='text-muted'>
                La persona solicitada no existe o no tienes permisos para verla.
              </p>
              <Link href='/personas' className='btn btn-primary'>
                Volver al listado
              </Link>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Detalle de Persona — Cuentas Claras</title>
      </Head>

      <Layout title='Detalle de Persona'>
        <div className='container-fluid py-4'>
          {/* Header */}
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div className='d-flex align-items-center'>
              <Link
                href='/personas'
                className='btn btn-link text-secondary p-0 me-3'
              >
                <i className='material-icons'>arrow_back</i>
              </Link>
              <h1 className='h3 mb-0'>Detalle de Persona</h1>
            </div>
            <div className='d-flex align-items-center'>
              <div className='dropdown me-2'>
                <button
                  className='btn btn-outline-secondary dropdown-toggle'
                  type='button'
                  data-bs-toggle='dropdown'
                >
                  <i
                    className='material-icons me-1'
                    style={{ fontSize: '16px' }}
                  >
                    more_vert
                  </i>
                  Acciones
                </button>
                <ul className='dropdown-menu'>
                  {canManage ? (
                    <>
                      <li>
                        <button type='button' className='dropdown-item'>
                          <i
                            className='material-icons me-2'
                            style={{ fontSize: '16px' }}
                          >
                            email
                          </i>
                          Enviar email
                        </button>
                      </li>
                      <li>
                        <button type='button' className='dropdown-item'>
                          <i
                            className='material-icons me-2'
                            style={{ fontSize: '16px' }}
                          >
                            vpn_key
                          </i>
                          Restablecer acceso
                        </button>
                      </li>
                      <li>
                        <hr className='dropdown-divider' />
                      </li>
                      <li>
                        <button type='button' className='dropdown-item text-danger'>
                          <i
                            className='material-icons me-2'
                            style={{ fontSize: '16px' }}
                          >
                            block
                          </i>
                          Desactivar
                        </button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <div className='dropdown-item text-muted'>No tienes permisos</div>
                    </li>
                  )}
                </ul>
              </div>
              {canManage && (
              <button className='btn btn-primary'>
                <i className='material-icons me-1' style={{ fontSize: '16px' }}>
                  edit
                </i>
                Editar
              </button>
              )}
            </div>
          </div>

          {/* Profile Header */}
          <div
            className='card shadow-sm mb-4'
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          >
            <div className='card-body py-4'>
              <div className='row align-items-center'>
                <div
                  className='col-auto'
                  style={{
                    position: 'relative',
                    width: '80px',
                    height: '80px',
                  }}
                >
                  {persona.avatar ? (
                    <Image
                      src={persona.avatar}
                      alt='Foto de perfil'
                      width={80}
                      height={80}
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid rgba(255,255,255,0.3)',
                      }}
                    />
                  ) : (
                    <div
                      className='d-flex align-items-center justify-content-center bg-white text-primary'
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        fontSize: '32px',
                        fontWeight: 'bold',
                      }}
                    >
                      {getInitials(persona.nombres, persona.apellidos)}
                    </div>
                  )}
                </div>
                <div className='col'>
                  <h3 className='mb-2'>
                    {persona.nombres} {persona.apellidos}
                  </h3>
                  <div className='d-flex align-items-center mb-2'>
                    <span
                      className={`badge ${getTipoBadgeClass(persona.usuario ? 'Administrador' : 'Propietario')} me-2`}
                    >
                      {persona.usuario ? 'Administrador' : 'Propietario'}
                    </span>
                    <span className='small'>
                      RUT: {persona.rut}-{persona.dv}
                    </span>
                  </div>
                  <div className='d-flex align-items-center'>
                    <i
                      className='material-icons me-2'
                      style={{ fontSize: '18px' }}
                    >
                      email
                    </i>
                    <span className='small me-4'>{persona.email}</span>
                    <i
                      className='material-icons me-2'
                      style={{ fontSize: '18px' }}
                    >
                      phone
                    </i>
                    <span className='small'>{persona.telefono}</span>
                  </div>
                </div>
                <div className='col-auto'>
                  <span
                    className={`badge ${getEstadoBadgeClass(persona.usuario?.estado || 'Activo')} fs-6`}
                  >
                    {persona.usuario?.estado || 'Activo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className='row'>
            {/* Sidebar */}
            <div className='col-12 col-lg-4'>
              {/* Resumen */}
              <div className='card shadow-sm mb-4'>
                <div className='card-header bg-transparent'>
                  <h6 className='mb-0'>Resumen</h6>
                </div>
                <div className='card-body'>
                  <div className='row g-3'>
                    <div className='col-6'>
                      <div className='text-center'>
                        <div className='text-muted small'>Unidades</div>
                        <div className='h4 mb-0'>{unidades.length}</div>
                      </div>
                    </div>
                    <div className='col-6'>
                      <div className='text-center'>
                        <div className='text-muted small'>Saldo Total</div>
                        <div className='h4 mb-0 text-success'>
                          {formatCurrency(0)}
                        </div>
                      </div>
                    </div>
                    <div className='col-6'>
                      <div className='text-center'>
                        <div className='text-muted small'>Último Pago</div>
                        <div className='fw-medium'>15/05/2023</div>
                      </div>
                    </div>
                    <div className='col-6'>
                      <div className='text-center'>
                        <div className='text-muted small'>Fecha Alta</div>
                        <div className='fw-medium'>
                          {new Date(persona.fecha_registro).toLocaleDateString(
                            'es-AR',
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='text-center'>
                        <div className='text-muted small'>Dirección</div>
                        <div className='fw-medium'>{persona.direccion}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Cuenta */}
              <div className='card shadow-sm mb-4'>
                <div className='card-header bg-transparent d-flex justify-content-between align-items-center'>
                  <h6 className='mb-0'>Información de Cuenta</h6>
                  {canManage && (
                  <button className='btn btn-sm btn-outline-primary'>
                    Editar
                  </button>
                  )}
                </div>
                <div className='card-body'>
                  <div className='mb-3'>
                    <div className='text-muted small'>Usuario</div>
                    <div className='fw-medium'>
                      {persona.usuario?.username || 'N/A'}
                    </div>
                  </div>
                  <div className='mb-3'>
                    <div className='text-muted small'>Nivel de acceso</div>
                    <div className='fw-medium'>
                      {persona.usuario?.nivel_acceso || 'N/A'}
                    </div>
                  </div>
                  <div className='mb-3'>
                    <div className='text-muted small'>Estado</div>
                    <span
                      className={`badge ${getEstadoBadgeClass(persona.usuario?.estado || 'Activo')}`}
                    >
                      {persona.usuario?.estado || 'Activo'}
                    </span>
                  </div>
                  <div className='mb-0'>
                    <div className='text-muted small'>Último acceso</div>
                    <div className='fw-medium'>
                      {persona.ultimo_acceso
                        ? new Date(persona.ultimo_acceso).toLocaleString(
                            'es-AR',
                          )
                        : 'Nunca'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className='card shadow-sm mb-4'>
                <div className='card-header bg-transparent'>
                  <h6 className='mb-0'>Acciones Rápidas</h6>
                </div>
                <div className='card-body'>
                    <div className='d-grid gap-2'>
                    {canManage ? (
                      <>
                        <button className='btn btn-outline-primary text-start'>
                          <i className='material-icons me-2'>email</i>
                          Enviar email
                        </button>
                        <button className='btn btn-outline-primary text-start'>
                          <i className='material-icons me-2'>receipt_long</i>
                          Ver estado de cuenta
                        </button>
                        <button className='btn btn-outline-primary text-start'>
                          <i className='material-icons me-2'>add_home</i>
                          Asignar nueva unidad
                        </button>
                        <button className='btn btn-outline-primary text-start'>
                          <i className='material-icons me-2'>vpn_key</i>
                          Restablecer contraseña
                        </button>
                      </>
                    ) : (
                      <div className='text-muted small'>No tienes acciones disponibles.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className='col-12 col-lg-8'>
              {/* Tabs */}
              <ul className='nav nav-tabs mb-4'>
                <li className='nav-item'>
                  <button
                    className={`nav-link ${activeTab === 'unidades' ? 'active' : ''}`}
                    onClick={() => setActiveTab('unidades')}
                  >
                    <i
                      className='material-icons me-1'
                      style={{ fontSize: '16px' }}
                    >
                      home
                    </i>
                    Unidades
                  </button>
                </li>
                <li className='nav-item'>
                  <button
                    className={`nav-link ${activeTab === 'pagos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pagos')}
                  >
                    <i
                      className='material-icons me-1'
                      style={{ fontSize: '16px' }}
                    >
                      receipt
                    </i>
                    Pagos
                  </button>
                </li>
                <li className='nav-item'>
                  <button
                    className={`nav-link ${activeTab === 'actividad' ? 'active' : ''}`}
                    onClick={() => setActiveTab('actividad')}
                  >
                    <i
                      className='material-icons me-1'
                      style={{ fontSize: '16px' }}
                    >
                      history
                    </i>
                    Actividad
                  </button>
                </li>
                <li className='nav-item'>
                  <button
                    className={`nav-link ${activeTab === 'documentos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('documentos')}
                  >
                    <i
                      className='material-icons me-1'
                      style={{ fontSize: '16px' }}
                    >
                      folder
                    </i>
                    Documentos
                  </button>
                </li>
                <li className='nav-item'>
                  <button
                    className={`nav-link ${activeTab === 'notas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notas')}
                  >
                    <i
                      className='material-icons me-1'
                      style={{ fontSize: '16px' }}
                    >
                      sticky_note_2
                    </i>
                    Notas
                  </button>
                </li>
                <li className='nav-item'>
                  <button
                    className={`nav-link ${activeTab === 'roles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('roles')}
                  >
                    <i
                      className='material-icons me-1'
                      style={{ fontSize: '16px' }}
                    >
                      group
                    </i>
                    Roles
                  </button>
                </li>
                <li className='nav-item'>
                  <button
                    className={`nav-link ${activeTab === 'financiero' ? 'active' : ''}`}
                    onClick={() => setActiveTab('financiero')}
                  >
                    <i
                      className='material-icons me-1'
                      style={{ fontSize: '16px' }}
                    >
                      account_balance_wallet
                    </i>
                    Financiero
                  </button>
                </li>
              </ul>

              {/* Tab Content */}
              <div className='tab-content'>
                {/* Unidades Tab */}
                {activeTab === 'unidades' && (
                  <div className='card shadow-sm'>
                    <div className='card-header bg-transparent d-flex justify-content-between align-items-center'>
                      <h6 className='mb-0'>Unidades Asociadas</h6>
                      {canManage && (
                      <button className='btn btn-sm btn-primary'>
                        <i
                          className='material-icons me-1'
                          style={{ fontSize: '16px' }}
                        >
                          add
                        </i>
                        Asignar Unidad
                      </button>
                      )}
                    </div>
                    <div className='card-body'>
                      {unidades.length === 0 ? (
                        <div className='text-center py-4'>
                          <i
                            className='material-icons'
                            style={{ fontSize: '3rem', color: '#6c757d' }}
                          >
                            home
                          </i>
                          <p className='mt-2 text-muted'>
                            No hay unidades asociadas
                          </p>
                        </div>
                      ) : (
                        unidades.map(unidad => (
                          <div key={unidad.id} className='card mb-3 border'>
                            <div className='card-header bg-light d-flex justify-content-between align-items-center'>
                              <div>
                                <h6 className='mb-0'>{unidad.nombre}</h6>
                                <div className='small text-muted'>
                                  {unidad.edificio} - {unidad.comunidad}
                                </div>
                              </div>
                              <span
                                className={`badge ${getTipoBadgeClass(unidad.relacion)}`}
                              >
                                {unidad.relacion}
                              </span>
                            </div>
                            <div className='card-body'>
                              <div className='row'>
                                <div className='col-md-6'>
                                  <div className='mb-2'>
                                    <div className='small text-muted'>
                                      Dirección
                                    </div>
                                    <div className='fw-medium'>
                                      {unidad.direccion}
                                    </div>
                                  </div>
                                  <div>
                                    <div className='small text-muted'>
                                      Metros Cuadrados
                                    </div>
                                    <div className='fw-medium'>
                                      {unidad.metros_cuadrados} m²
                                    </div>
                                  </div>
                                </div>
                                <div className='col-md-6'>
                                  <div className='mb-2'>
                                    <div className='small text-muted'>
                                      Estado
                                    </div>
                                    <div className='fw-medium'>
                                      <span className='d-inline-flex align-items-center'>
                                        <span
                                          className='me-2'
                                          style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            backgroundColor:
                                              'var(--color-success)',
                                          }}
                                        />
                                        {unidad.estado}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className='small text-muted'>
                                      Saldo Pendiente
                                    </div>
                                    <div className='fw-medium text-danger'>
                                      {formatCurrency(unidad.saldo_pendiente)}
                                    </div>
                                  </div>
                                </div>
                                <div className='col-12 mt-3'>
                                  <Link
                                    href={`/unidades/${unidad.id}`}
                                    className='btn btn-sm btn-outline-primary'
                                  >
                                    Ver Unidad
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Pagos Tab */}
                {activeTab === 'pagos' && (
                  <div className='card shadow-sm'>
                    <div className='card-header bg-transparent d-flex justify-content-between align-items-center'>
                      <h6 className='mb-0'>Historial de Pagos</h6>
                      {canManage && (
                      <button className='btn btn-sm btn-primary'>
                        <i
                          className='material-icons me-1'
                          style={{ fontSize: '16px' }}
                        >
                          add
                        </i>
                        Registrar Pago
                      </button>
                      )}
                    </div>
                    <div className='card-body'>
                      {pagos.length === 0 ? (
                        <div className='text-center py-4'>
                          <i
                            className='material-icons'
                            style={{ fontSize: '3rem', color: '#6c757d' }}
                          >
                            receipt
                          </i>
                          <p className='mt-2 text-muted'>
                            No hay pagos registrados
                          </p>
                        </div>
                      ) : (
                        <div className='table-responsive'>
                          <table className='table table-hover'>
                            <thead className='table-light'>
                              <tr>
                                <th>#</th>
                                <th>Fecha</th>
                                <th>Unidad</th>
                                <th>Periodo</th>
                                <th>Importe</th>
                                <th>Método</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pagos.map(pago => (
                                <tr key={pago.id}>
                                  <td>{pago.id}</td>
                                  <td>{pago.fecha}</td>
                                  <td>{pago.unidad}</td>
                                  <td>{pago.periodo}</td>
                                  <td>{formatCurrency(pago.importe)}</td>
                                  <td>{pago.metodo}</td>
                                  <td>
                                    <span className='badge bg-success'>
                                      {pago.estado}
                                    </span>
                                  </td>
                                  <td>
                                    <button className='btn btn-sm btn-outline-primary'>
                                      <i
                                        className='material-icons'
                                        style={{ fontSize: '16px' }}
                                      >
                                        visibility
                                      </i>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actividad Tab */}
                {activeTab === 'actividad' && (
                  <div className='card shadow-sm'>
                    <div className='card-header bg-transparent'>
                      <h6 className='mb-0'>Registro de Actividad</h6>
                    </div>
                    <div className='card-body'>
                      {actividades.length === 0 ? (
                        <div className='text-center py-4'>
                          <i
                            className='material-icons'
                            style={{ fontSize: '3rem', color: '#6c757d' }}
                          >
                            history
                          </i>
                          <p className='mt-2 text-muted'>
                            No hay actividad registrada
                          </p>
                        </div>
                      ) : (
                        actividades.map(actividad => (
                          <div
                            key={`${actividad.fecha_completa}`}
                            className='mb-3 pb-3 border-bottom'
                          >
                            <div className='small text-muted mb-1'>
                              {actividad.fecha} {actividad.hora}
                            </div>
                            <div className='fw-medium mb-1'>
                              {actividad.titulo}
                            </div>
                            <div className='small text-muted'>
                              {actividad.descripcion}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Documentos Tab */}
                {activeTab === 'documentos' && (
                  <div className='card shadow-sm'>
                    <div className='card-header bg-transparent d-flex justify-content-between align-items-center'>
                      <h6 className='mb-0'>Documentos</h6>
                      {canManage && (
                      <button className='btn btn-sm btn-primary'>
                        <i
                          className='material-icons me-1'
                          style={{ fontSize: '16px' }}
                        >
                          upload
                        </i>
                        Subir Documento
                      </button>
                      )}
                    </div>
                    <div className='card-body'>
                      {documentos.length === 0 ? (
                        <div className='text-center py-4'>
                          <i
                            className='material-icons'
                            style={{ fontSize: '3rem', color: '#6c757d' }}
                          >
                            folder
                          </i>
                          <p className='mt-2 text-muted'>
                            No hay documentos asociados
                          </p>
                        </div>
                      ) : (
                        <div className='table-responsive'>
                          <table className='table table-hover'>
                            <thead className='table-light'>
                              <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Fecha</th>
                                <th>Tamaño</th>
                                <th>Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {documentos.map(doc => (
                                <tr key={doc.id}>
                                  <td>
                                    <div className='d-flex align-items-center'>
                                      <i
                                        className={`material-icons me-2 ${doc.tipo === 'pdf' ? 'text-danger' : 'text-info'}`}
                                      >
                                        {doc.tipo === 'pdf'
                                          ? 'picture_as_pdf'
                                          : 'description'}
                                      </i>
                                      <span>{doc.nombre}</span>
                                    </div>
                                  </td>
                                  <td>{doc.tipo}</td>
                                  <td>{doc.fecha_subida}</td>
                                  <td>{doc.tamano} KB</td>
                                  <td>
                                    <div className='btn-group'>
                                      <button className='btn btn-sm btn-outline-primary'>
                                        <i
                                          className='material-icons'
                                          style={{ fontSize: '16px' }}
                                        >
                                          visibility
                                        </i>
                                      </button>
                                      <button className='btn btn-sm btn-outline-secondary'>
                                        <i
                                          className='material-icons'
                                          style={{ fontSize: '16px' }}
                                        >
                                          download
                                        </i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notas Tab */}
                {activeTab === 'notas' && (
                  <div className='card shadow-sm'>
                    <div className='card-header bg-transparent d-flex justify-content-between align-items-center'>
                      <h6 className='mb-0'>Notas Internas</h6>
                      {canManage && (
                      <button
                        className='btn btn-sm btn-primary'
                        onClick={() => setShowNewNoteForm(!showNewNoteForm)}
                      >
                        <i
                          className='material-icons me-1'
                          style={{ fontSize: '16px' }}
                        >
                          add
                        </i>
                        Nueva Nota
                      </button>
                      )}
                    </div>
                    <div className='card-body'>
                      {notas.length === 0 ? (
                        <div className='text-center py-4'>
                          <i
                            className='material-icons'
                            style={{ fontSize: '3rem', color: '#6c757d' }}
                          >
                            sticky_note_2
                          </i>
                          <p className='mt-2 text-muted'>
                            No hay notas registradas
                          </p>
                        </div>
                      ) : (
                        notas.map(nota => (
                          <div key={nota.id} className='card mb-3'>
                            <div className='card-body'>
                              <div className='d-flex justify-content-between align-items-center mb-2'>
                                <h6 className='card-title mb-0'>
                                  {nota.titulo}
                                </h6>
                                <div className='text-muted small'>
                                  {nota.fecha_creacion}
                                </div>
                              </div>
                              <p className='card-text'>{nota.contenido}</p>
                              <div className='d-flex justify-content-between align-items-center'>
                                <div className='small text-muted'>
                                  Creado por: {nota.autor}
                                </div>
                                  <div>
                                  {canManage && (
                                  <>
                                  <button className='btn btn-sm btn-outline-secondary me-1'>
                                    <i
                                      className='material-icons'
                                      style={{ fontSize: '16px' }}
                                    >
                                      edit
                                    </i>
                                  </button>
                                  <button className='btn btn-sm btn-outline-danger'>
                                    <i
                                      className='material-icons'
                                      style={{ fontSize: '16px' }}
                                    >
                                      delete
                                    </i>
                                  </button>
                                  </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      {/* Form para nueva nota */}
                      {showNewNoteForm && (
                        <div className='card mt-4'>
                          <div className='card-body'>
                            <h6 className='card-title mb-3'>
                              Agregar nueva nota
                            </h6>
                            <form>
                              <div className='mb-3'>
                                <label
                                  htmlFor='noteTitulo'
                                  className='form-label'
                                >
                                  Título
                                </label>
                                <input
                                  type='text'
                                  className='form-control'
                                  id='noteTitulo'
                                />
                              </div>
                              <div className='mb-3'>
                                <label
                                  htmlFor='noteContenido'
                                  className='form-label'
                                >
                                  Contenido
                                </label>
                                <textarea
                                  className='form-control'
                                  id='noteContenido'
                                  rows={3}
                                ></textarea>
                              </div>
                              <div className='d-flex justify-content-end'>
                                <button
                                  type='button'
                                  className='btn btn-outline-secondary me-2'
                                  onClick={() => setShowNewNoteForm(false)}
                                >
                                  Cancelar
                                </button>
                                <button
                                  type='submit'
                                  className='btn btn-primary'
                                >
                                  Guardar Nota
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Roles Tab */}
                {activeTab === 'roles' && (
                  <div className='card shadow-sm'>
                    <div className='card-header bg-transparent'>
                      <h6 className='mb-0'>Roles y Comunidades</h6>
                    </div>
                    <div className='card-body'>
                      {roles.length === 0 ? (
                        <div className='text-center py-4'>
                          <i
                            className='material-icons'
                            style={{ fontSize: '3rem', color: '#6c757d' }}
                          >
                            group
                          </i>
                          <p className='mt-2 text-muted'>
                            No hay roles asignados
                          </p>
                        </div>
                      ) : (
                        <div className='row'>
                          {roles.map(rol => (
                            <div
                              key={`${rol.comunidad_id}-${rol.rol}`}
                              className='col-md-6 mb-3'
                            >
                              <div className='card h-100 border'>
                                <div className='card-body'>
                                  <div className='d-flex justify-content-between align-items-center mb-2'>
                                    <h6 className='card-title mb-0'>
                                      {rol.comunidad_nombre}
                                    </h6>
                                    <span
                                      className={`badge ${getTipoBadgeClass(rol.rol)}`}
                                    >
                                      {rol.rol}
                                    </span>
                                  </div>
                                  <div className='small text-muted'>
                                    Comunidad ID: {rol.comunidad_id}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Financiero Tab */}
                {activeTab === 'financiero' && (
                  <div className='card shadow-sm'>
                    <div className='card-header bg-transparent'>
                      <h6 className='mb-0'>Resumen Financiero</h6>
                    </div>
                    <div className='card-body'>
                      {resumenFinanciero.length === 0 ? (
                        <div className='text-center py-4'>
                          <i
                            className='material-icons'
                            style={{ fontSize: '3rem', color: '#6c757d' }}
                          >
                            account_balance_wallet
                          </i>
                          <p className='mt-2 text-muted'>
                            No hay información financiera disponible
                          </p>
                        </div>
                      ) : (
                        <div className='row'>
                          {resumenFinanciero.map(resumen => (
                            <div
                              key={resumen.comunidad_id}
                              className='col-md-6 mb-4'
                            >
                              <div className='card h-100 border'>
                                <div className='card-header bg-light'>
                                  <h6 className='mb-0'>
                                    {resumen.comunidad_nombre}
                                  </h6>
                                </div>
                                <div className='card-body'>
                                  <div className='row'>
                                    <div className='col-6'>
                                      <div className='mb-3'>
                                        <div className='small text-muted'>
                                          Saldo Pendiente
                                        </div>
                                        <div
                                          className={`fw-bold ${resumen.saldo_pendiente > 0 ? 'text-danger' : 'text-success'}`}
                                        >
                                          {formatCurrency(
                                            resumen.saldo_pendiente,
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className='col-6'>
                                      <div className='mb-3'>
                                        <div className='small text-muted'>
                                          Pagos Pendientes
                                        </div>
                                        <div className='fw-bold text-warning'>
                                          {resumen.pagos_pendientes}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {resumen.ultimo_pago && (
                                    <div className='border-top pt-3'>
                                      <div className='small text-muted mb-1'>
                                        Último Pago
                                      </div>
                                      <div className='d-flex justify-content-between'>
                                        <span>{resumen.ultimo_pago.fecha}</span>
                                        <span className='fw-bold text-success'>
                                          {formatCurrency(
                                            resumen.ultimo_pago.importe,
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
