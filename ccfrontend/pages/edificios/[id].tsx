import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import { useEdificios, useTorres, useUnidades } from '@/hooks/useEdificios';
import { ProtectedRoute } from '@/lib/useAuth';
import {
  Edificio,
  ESTADOS_EDIFICIO,
  TIPOS_EDIFICIO,
  SERVICIOS_DISPONIBLES,
  AMENIDADES_DISPONIBLES,
} from '@/types/edificios';

export default function EdificioDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [edificio, setEdificio] = useState<Edificio | null>(null);
  const [activeTab, setActiveTab] = useState('informacion');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Hooks para APIs
  const { getEdificioById, deleteEdificio, checkDependencies, loading, error } =
    useEdificios();
  const {
    torres,
    loading: torresLoading,
    fetchTorres,
  } = useTorres(id as string);
  const {
    unidades,
    loading: unidadesLoading,
    fetchUnidades,
  } = useUnidades(id as string);

  useEffect(() => {
    const loadEdificioData = async () => {
      if (id && typeof id === 'string') {
        try {
          const edificioData = await getEdificioById(id);
          setEdificio(edificioData);

          // Cargar torres y unidades en paralelo
          fetchTorres();
          fetchUnidades();
        } catch (error) {
          console.error('Error cargando edificio:', error);
        }
      }
    };

    loadEdificioData();
  }, [id, getEdificioById, fetchTorres, fetchUnidades]);

  if (loading || torresLoading || unidadesLoading) {
    return (
      <ProtectedRoute>
        <Layout title='Cargando...'>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ height: '400px' }}
          >
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Cargando...</span>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Layout title='Error'>
          <div className='text-center py-5'>
            <i
              className='material-icons mb-3'
              style={{ fontSize: '64px', color: '#dc3545' }}
            >
              error_outline
            </i>
            <h3>Error al cargar el edificio</h3>
            <p className='text-muted'>{error}</p>
            <div className='d-flex gap-2 justify-content-center'>
              <button
                onClick={() => window.location.reload()}
                className='btn btn-primary'
              >
                <i className='material-icons me-2'>refresh</i>
                Reintentar
              </button>
              <Link href='/edificios' className='btn btn-outline-primary'>
                <i className='material-icons me-2'>arrow_back</i>
                Volver al listado
              </Link>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!edificio) {
    return (
      <ProtectedRoute>
        <Layout title='Edificio no encontrado'>
          <div className='text-center py-5'>
            <h3>Edificio no encontrado</h3>
            <Link href='/edificios' className='btn btn-primary'>
              Volver al listado
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const getEstadoBadge = (estado: string) => {
    const badges = {
      activo: 'bg-success',
      inactivo: 'bg-secondary',
      construccion: 'bg-warning',
      mantenimiento: 'bg-info',
    };
    return badges[estado as keyof typeof badges] || 'bg-secondary';
  };

  const handleDeleteEdificio = async () => {
    if (!edificio?.id) {
      return;
    }

    try {
      // First check if the edificio has dependencies
      const dependencies = await checkDependencies(edificio.id);

      // Check if there are any related records
      const hasDependencies =
        dependencies.torres > 0 || dependencies.unidades > 0;

      if (hasDependencies) {
        // Show warning about dependencies
        const confirmDelete = window.confirm(
          `El edificio "${edificio.nombre}" tiene ${dependencies.torres} torres y ${dependencies.unidades} unidades relacionadas.\n\n` +
            'Eliminar este edificio también eliminará toda la información relacionada.\n\n' +
            '¿Estás seguro de que deseas continuar?',
        );

        if (!confirmDelete) {
          setShowDeleteModal(false);
          return;
        }
      }

      await deleteEdificio(edificio.id);
      setShowDeleteModal(false);
      router.push('/edificios');
    } catch (error) {
      console.error('Error eliminando edificio:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>{edificio.nombre} — Cuentas Claras</title>
      </Head>

      <Layout title={edificio.nombre}>
        <div className='container-fluid py-4'>
          {/* Breadcrumb */}
          <nav aria-label='breadcrumb' className='mb-4'>
            <ol className='breadcrumb'>
              <li className='breadcrumb-item'>
                <Link href='/dashboard'>Dashboard</Link>
              </li>
              <li className='breadcrumb-item'>
                <Link href='/edificios'>Edificios</Link>
              </li>
              <li className='breadcrumb-item active'>{edificio.nombre}</li>
            </ol>
          </nav>

          {/* Header del edificio con imagen de fondo */}
          <div
            className='edificio-cover mb-4'
            style={{
              backgroundImage: edificio.imagen
                ? `url(${edificio.imagen})`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <div className='edificio-cover-overlay'>
              <div className='cover-actions'>
                <div className='btn-group'>
                  <Link
                    href={`/edificios/${id}/editar`}
                    className='btn btn-light btn-sm'
                  >
                    <i className='material-icons'>edit</i>
                  </Link>
                  <button className='btn btn-light btn-sm'>
                    <i className='material-icons'>share</i>
                  </button>
                  <button
                    className='btn btn-danger btn-sm'
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <i className='material-icons'>delete</i>
                  </button>
                </div>
              </div>
              <div>
                <div className='d-flex align-items-center mb-2'>
                  <h1 className='text-white mb-0 me-3'>{edificio.nombre}</h1>
                  <span className={`badge ${getEstadoBadge(edificio.estado)}`}>
                    {
                      ESTADOS_EDIFICIO.find(e => e.value === edificio.estado)
                        ?.label
                    }
                  </span>
                </div>
                <p className='text-white-50 mb-0'>
                  <i className='material-icons me-1'>location_on</i>
                  {edificio.direccion}
                </p>
                {edificio.codigo && (
                  <p className='text-white-50 mb-0'>
                    <i className='material-icons me-1'>tag</i>
                    {edificio.codigo}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className='row mb-4'>
            <div className='col-lg-3 col-md-6 mb-3'>
              <div className='stat-card'>
                <div className='stat-icon'>
                  <i className='material-icons'>apartment</i>
                </div>
                <div className='stat-content'>
                  <div className='stat-value'>{edificio.totalUnidades}</div>
                  <div className='stat-label'>Total Unidades</div>
                </div>
              </div>
            </div>
            <div className='col-lg-3 col-md-6 mb-3'>
              <div className='stat-card'>
                <div className='stat-icon'>
                  <i className='material-icons'>groups</i>
                </div>
                <div className='stat-content'>
                  <div className='stat-value'>
                    {edificio.totalUnidadesOcupadas}
                  </div>
                  <div className='stat-label'>Unidades Ocupadas</div>
                </div>
              </div>
            </div>
            <div className='col-lg-3 col-md-6 mb-3'>
              <div className='stat-card'>
                <div className='stat-icon'>
                  <i className='material-icons'>business</i>
                </div>
                <div className='stat-content'>
                  <div className='stat-value'>{edificio.numeroTorres}</div>
                  <div className='stat-label'>Torres</div>
                </div>
              </div>
            </div>
            <div className='col-lg-3 col-md-6 mb-3'>
              <div className='stat-card'>
                <div className='stat-icon'>
                  <i className='material-icons'>percent</i>
                </div>
                <div className='stat-content'>
                  <div className='stat-value'>
                    {(
                      (edificio.totalUnidadesOcupadas /
                        edificio.totalUnidades) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <div className='stat-label'>Ocupación</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pestañas de navegación */}
          <div className='d-flex border-bottom mb-4'>
            <div
              className={`tab-edificio ${activeTab === 'informacion' ? 'active' : ''}`}
              onClick={() => setActiveTab('informacion')}
            >
              <i className='material-icons me-2'>info</i>
              Información
            </div>
            <div
              className={`tab-edificio ${activeTab === 'torres' ? 'active' : ''}`}
              onClick={() => setActiveTab('torres')}
            >
              <i className='material-icons me-2'>business</i>
              Torres
            </div>
            <div
              className={`tab-edificio ${activeTab === 'unidades' ? 'active' : ''}`}
              onClick={() => setActiveTab('unidades')}
            >
              <i className='material-icons me-2'>apartment</i>
              Unidades
            </div>
            <div
              className={`tab-edificio ${activeTab === 'servicios' ? 'active' : ''}`}
              onClick={() => setActiveTab('servicios')}
            >
              <i className='material-icons me-2'>build</i>
              Servicios
            </div>
          </div>

          {/* Contenido de las pestañas */}
          <div className='tab-content'>
            {/* Pestaña: Información */}
            {activeTab === 'informacion' && (
              <div className='row'>
                <div className='col-lg-8'>
                  <div className='content-section'>
                    <div className='content-section-header'>
                      <h5 className='mb-0'>Información Básica</h5>
                      <Link
                        href={`/edificios/${id}/editar`}
                        className='btn btn-sm btn-outline-primary'
                      >
                        <i className='material-icons me-1'>edit</i>
                        Editar
                      </Link>
                    </div>
                    <div className='content-section-body'>
                      <div className='row'>
                        <div className='col-md-6'>
                          <div className='detail-item'>
                            <div className='detail-label'>Nombre</div>
                            <div className='detail-value'>
                              {edificio.nombre}
                            </div>
                          </div>
                        </div>
                        <div className='col-md-6'>
                          <div className='detail-item'>
                            <div className='detail-label'>Código</div>
                            <div className='detail-value'>
                              {edificio.codigo || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className='col-md-6'>
                          <div className='detail-item'>
                            <div className='detail-label'>Tipo</div>
                            <div className='detail-value'>
                              {
                                TIPOS_EDIFICIO.find(
                                  t => t.value === edificio.tipo,
                                )?.label
                              }
                            </div>
                          </div>
                        </div>
                        <div className='col-md-6'>
                          <div className='detail-item'>
                            <div className='detail-label'>
                              Año de Construcción
                            </div>
                            <div className='detail-value'>
                              {edificio.anoConstructccion || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className='col-12'>
                          <div className='detail-item'>
                            <div className='detail-label'>Dirección</div>
                            <div className='detail-value'>
                              {edificio.direccion}
                            </div>
                          </div>
                        </div>
                        <div className='col-12'>
                          <div className='detail-item'>
                            <div className='detail-label'>Comunidad</div>
                            <div className='detail-value'>
                              {edificio.comunidadNombre}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='content-section'>
                    <div className='content-section-header'>
                      <h5 className='mb-0'>Detalles Técnicos</h5>
                      <Link
                        href={`/edificios/${id}/editar`}
                        className='btn btn-sm btn-outline-primary'
                      >
                        <i className='material-icons me-1'>edit</i>
                        Editar
                      </Link>
                    </div>
                    <div className='content-section-body'>
                      <div className='row'>
                        <div className='col-md-3'>
                          <div className='detail-item'>
                            <div className='detail-label'>Pisos</div>
                            <div className='detail-value'>{edificio.pisos}</div>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className='detail-item'>
                            <div className='detail-label'>Área Común</div>
                            <div className='detail-value'>
                              {edificio.areaComun} m²
                            </div>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className='detail-item'>
                            <div className='detail-label'>Parqueaderos</div>
                            <div className='detail-value'>
                              {edificio.parqueaderos}
                            </div>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className='detail-item'>
                            <div className='detail-label'>Depósitos</div>
                            <div className='detail-value'>
                              {edificio.depositos}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {edificio.observaciones && (
                    <div className='content-section'>
                      <div className='content-section-header'>
                        <h5 className='mb-0'>Observaciones</h5>
                        <Link
                          href={`/edificios/${id}/editar`}
                          className='btn btn-sm btn-outline-primary'
                        >
                          <i className='material-icons me-1'>edit</i>
                          Editar
                        </Link>
                      </div>
                      <div className='content-section-body'>
                        <p className='mb-0'>{edificio.observaciones}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className='col-lg-4'>
                  <div className='content-section'>
                    <div className='content-section-header'>
                      <h5 className='mb-0'>Contacto</h5>
                      <Link
                        href={`/edificios/${id}/editar`}
                        className='btn btn-sm btn-outline-primary'
                      >
                        <i className='material-icons me-1'>edit</i>
                        Editar
                      </Link>
                    </div>
                    <div className='content-section-body'>
                      <div className='detail-item'>
                        <div className='detail-label'>Administrador</div>
                        <div className='detail-value'>
                          {edificio.administrador || 'N/A'}
                        </div>
                      </div>
                      <div className='detail-item'>
                        <div className='detail-label'>Teléfono</div>
                        <div className='detail-value'>
                          {edificio.telefonoAdministrador ? (
                            <a href={`tel:${edificio.telefonoAdministrador}`}>
                              {edificio.telefonoAdministrador}
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </div>
                      <div className='detail-item'>
                        <div className='detail-label'>Email</div>
                        <div className='detail-value'>
                          {edificio.emailAdministrador ? (
                            <a href={`mailto:${edificio.emailAdministrador}`}>
                              {edificio.emailAdministrador}
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='content-section'>
                    <div className='content-section-header'>
                      <h5 className='mb-0'>Ubicación</h5>
                    </div>
                    <div className='content-section-body'>
                      <div className='map-container'>
                        <div className='d-flex align-items-center justify-content-center h-100 text-muted'>
                          <div className='text-center'>
                            <i
                              className='material-icons mb-2'
                              style={{ fontSize: '48px' }}
                            >
                              map
                            </i>
                            <div>Mapa del edificio</div>
                            <small>
                              {edificio.latitud && edificio.longitud
                                ? `${edificio.latitud}, ${edificio.longitud}`
                                : 'Coordenadas no disponibles'}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña: Torres */}
            {activeTab === 'torres' && (
              <div className='content-section'>
                <div className='content-section-header'>
                  <h5 className='mb-0'>Torres del Edificio</h5>
                  <button className='btn btn-sm btn-primary'>
                    <i className='material-icons me-1'>add</i>
                    Nueva Torre
                  </button>
                </div>
                <div className='content-section-body p-0'>
                  {torresLoading ? (
                    <div className='text-center py-5'>
                      <div
                        className='spinner-border text-primary mb-3'
                        role='status'
                      >
                        <span className='visually-hidden'>Cargando...</span>
                      </div>
                      <div>Cargando torres...</div>
                    </div>
                  ) : torres && torres.length > 0 ? (
                    <div className='torres-list'>
                      {torres.map(torre => (
                        <div key={torre.id} className='torre-item'>
                          <div className='d-flex align-items-center'>
                            <div className='me-3'>
                              <div className='edificio-icon'>
                                <i className='material-icons'>business</i>
                              </div>
                            </div>
                            <div className='flex-grow-1'>
                              <div className='d-flex justify-content-between align-items-start'>
                                <div>
                                  <h6 className='mb-1'>{torre.nombre}</h6>
                                  <p className='text-muted small mb-1'>
                                    {torre.codigo}
                                  </p>
                                  <p className='text-muted small mb-0'>
                                    {torre.observaciones}
                                  </p>
                                </div>
                                <div className='text-end'>
                                  <div className='fw-semibold'>
                                    {torre.unidadesOcupadas}/
                                    {torre.totalUnidades}
                                  </div>
                                  <small className='text-muted'>
                                    unidades ocupadas
                                  </small>
                                </div>
                              </div>
                              <div className='row mt-2'>
                                <div className='col-4'>
                                  <small className='text-muted d-block'>
                                    Pisos
                                  </small>
                                  <span className='fw-semibold'>
                                    {torre.pisos}
                                  </span>
                                </div>
                                <div className='col-4'>
                                  <small className='text-muted d-block'>
                                    Unidades/Piso
                                  </small>
                                  <span className='fw-semibold'>
                                    {torre.unidadesPorPiso}
                                  </span>
                                </div>
                                <div className='col-4'>
                                  <small className='text-muted d-block'>
                                    Ocupación
                                  </small>
                                  <span className='fw-semibold'>
                                    {(
                                      (torre.unidadesOcupadas /
                                        torre.totalUnidades) *
                                      100
                                    ).toFixed(0)}
                                    %
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className='ms-3'>
                              <div className='btn-group' role='group'>
                                <button className='btn btn-sm btn-outline-primary'>
                                  <i className='material-icons'>visibility</i>
                                </button>
                                <button
                                  className='btn btn-sm btn-outline-secondary'
                                  onClick={() =>
                                    router.push(`/edificios/${id}/editar`)
                                  }
                                >
                                  <i className='material-icons'>edit</i>
                                </button>
                                <button className='btn btn-sm btn-outline-danger'>
                                  <i className='material-icons'>delete</i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-5'>
                      <i
                        className='material-icons mb-3'
                        style={{ fontSize: '64px', color: '#ddd' }}
                      >
                        business
                      </i>
                      <h5>Sin torres registradas</h5>
                      <p className='text-muted'>
                        Este edificio aún no tiene torres registradas.
                      </p>
                      <button className='btn btn-primary'>
                        <i className='material-icons me-2'>add</i>
                        Crear Primera Torre
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pestaña: Unidades */}
            {activeTab === 'unidades' && (
              <div className='content-section'>
                <div className='content-section-header'>
                  <h5 className='mb-0'>Unidades del Edificio</h5>
                  <button className='btn btn-sm btn-primary'>
                    <i className='material-icons me-1'>add</i>
                    Nueva Unidad
                  </button>
                </div>
                <div className='content-section-body'>
                  {unidadesLoading ? (
                    <div className='text-center py-5'>
                      <div
                        className='spinner-border text-primary mb-3'
                        role='status'
                      >
                        <span className='visually-hidden'>Cargando...</span>
                      </div>
                      <div>Cargando unidades...</div>
                    </div>
                  ) : unidades && unidades.length > 0 ? (
                    <div className='row'>
                      {unidades.map(unidad => (
                        <div key={unidad.id} className='col-md-6 col-lg-4 mb-3'>
                          <div className='card h-100'>
                            <div className='card-body'>
                              <div className='d-flex justify-content-between align-items-start mb-2'>
                                <h6 className='card-title mb-0'>
                                  {unidad.numero}
                                </h6>
                                <span
                                  className={`badge ${unidad.estado === 'ocupada' ? 'bg-success' : 'bg-secondary'}`}
                                >
                                  {unidad.estado}
                                </span>
                              </div>
                              <p className='text-muted small mb-2'>
                                Torre ID: {unidad.torreId || 'N/A'} | Piso:{' '}
                                {unidad.piso}
                              </p>
                              {unidad.area && (
                                <p className='text-muted small mb-2'>
                                  Área: {unidad.area} m²
                                </p>
                              )}
                              <div className='d-flex justify-content-end'>
                                <Link
                                  href={`/unidades/${unidad.id}`}
                                  className='btn btn-sm btn-outline-primary'
                                >
                                  <i className='material-icons'>visibility</i>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-5'>
                      <i
                        className='material-icons mb-3'
                        style={{ fontSize: '64px', color: '#ddd' }}
                      >
                        apartment
                      </i>
                      <h5>Sin unidades registradas</h5>
                      <p className='text-muted'>
                        Este edificio aún no tiene unidades registradas.
                      </p>
                      <button className='btn btn-primary'>
                        <i className='material-icons me-2'>add</i>
                        Crear Primera Unidad
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pestaña: Servicios */}
            {activeTab === 'servicios' && (
              <div className='row'>
                <div className='col-lg-6'>
                  <div className='content-section'>
                    <div className='content-section-header'>
                      <h5 className='mb-0'>Servicios Disponibles</h5>
                      <Link
                        href={`/edificios/${id}/editar`}
                        className='btn btn-sm btn-outline-primary'
                      >
                        <i className='material-icons me-1'>edit</i>
                        Editar
                      </Link>
                    </div>
                    <div className='content-section-body'>
                      <div className='row'>
                        {SERVICIOS_DISPONIBLES.map(servicio => (
                          <div key={servicio.value} className='col-md-6 mb-2'>
                            <div className='d-flex align-items-center'>
                              <i
                                className={`material-icons me-2 ${
                                  (edificio.servicios || []).includes(
                                    servicio.value,
                                  )
                                    ? 'text-success'
                                    : 'text-muted'
                                }`}
                              >
                                {(edificio.servicios || []).includes(
                                  servicio.value,
                                )
                                  ? 'check_circle'
                                  : 'radio_button_unchecked'}
                              </i>
                              <span
                                className={
                                  (edificio.servicios || []).includes(
                                    servicio.value,
                                  )
                                    ? 'fw-semibold'
                                    : 'text-muted'
                                }
                              >
                                {servicio.label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='col-lg-6'>
                  <div className='content-section'>
                    <div className='content-section-header'>
                      <h5 className='mb-0'>Amenidades</h5>
                      <Link
                        href={`/edificios/${id}/editar`}
                        className='btn btn-sm btn-outline-primary'
                      >
                        <i className='material-icons me-1'>edit</i>
                        Editar
                      </Link>
                    </div>
                    <div className='content-section-body'>
                      <div className='row'>
                        {AMENIDADES_DISPONIBLES.map(amenidad => (
                          <div key={amenidad.value} className='col-md-6 mb-2'>
                            <div className='d-flex align-items-center'>
                              <i
                                className={`material-icons me-2 ${
                                  (edificio.amenidades || []).includes(
                                    amenidad.value,
                                  )
                                    ? 'text-success'
                                    : 'text-muted'
                                }`}
                              >
                                {(edificio.amenidades || []).includes(
                                  amenidad.value,
                                )
                                  ? 'check_circle'
                                  : 'radio_button_unchecked'}
                              </i>
                              <span
                                className={
                                  (edificio.amenidades || []).includes(
                                    amenidad.value,
                                  )
                                    ? 'fw-semibold'
                                    : 'text-muted'
                                }
                              >
                                {amenidad.label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de confirmación para eliminar */}
        {showDeleteModal && (
          <div
            className='modal fade show d-block'
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className='modal-dialog'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title'>Confirmar Eliminación</h5>
                  <button
                    type='button'
                    className='btn-close'
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                </div>
                <div className='modal-body'>
                  <p>
                    ¿Estás seguro de que deseas eliminar el edificio{' '}
                    <strong>{edificio.nombre}</strong>?
                  </p>
                  <p className='text-danger small'>
                    <i className='material-icons me-1'>warning</i>
                    Esta acción no se puede deshacer y eliminará toda la
                    información relacionada.
                  </p>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type='button'
                    className='btn btn-danger'
                    onClick={handleDeleteEdificio}
                  >
                    <i className='material-icons me-1'>delete</i>
                    Eliminar Edificio
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .edificio-cover {
            height: 240px;
            background-size: cover;
            background-position: center;
            position: relative;
            border-radius: 8px;
            overflow: hidden;
          }

          .edificio-cover-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              0deg,
              rgba(3, 14, 39, 0.7) 0%,
              rgba(3, 14, 39, 0.4) 50%,
              rgba(3, 14, 39, 0.2) 100%
            );
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 1.5rem;
          }

          .cover-actions {
            position: absolute;
            top: 1rem;
            right: 1rem;
          }

          .tab-edificio {
            padding: 0.75rem 1.5rem;
            border-bottom: 2px solid transparent;
            font-weight: 600;
            color: #6c757d;
            cursor: pointer;
            display: flex;
            align-items: center;
            transition: all 0.2s ease;
          }

          .tab-edificio:hover {
            color: var(--bs-primary);
          }

          .tab-edificio.active {
            border-bottom: 2px solid var(--bs-primary);
            color: var(--bs-primary);
          }

          .content-section {
            margin-bottom: 2rem;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }

          .content-section-header {
            padding: 1rem 1.5rem;
            background-color: #f8f9fa;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .content-section-body {
            padding: 1.5rem;
          }

          .detail-item {
            margin-bottom: 1.25rem;
          }

          .detail-label {
            font-size: 0.875rem;
            color: #6c757d;
            margin-bottom: 0.25rem;
          }

          .detail-value {
            font-weight: 500;
          }

          .stat-card {
            background-color: #fff;
            border-radius: 8px;
            padding: 1rem;
            display: flex;
            align-items: center;
            height: 100%;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition:
              transform 0.15s ease,
              box-shadow 0.15s ease;
          }

          .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background-color: rgba(13, 110, 253, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;
            color: var(--bs-primary);
          }

          .stat-content {
            flex: 1;
          }

          .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
          }

          .stat-label {
            color: #6c757d;
            font-size: 0.875rem;
          }

          .map-container {
            height: 200px;
            background-color: #f8f9fa;
            border-radius: 8px;
            overflow: hidden;
          }

          .torres-list {
            max-height: 600px;
            overflow-y: auto;
          }

          .torre-item {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          }

          .torre-item:last-child {
            border-bottom: none;
          }

          .edificio-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background-color: var(--bs-primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}
