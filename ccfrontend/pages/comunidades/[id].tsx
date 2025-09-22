import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import Link from 'next/link';
import { ComunidadDetalle } from '@/types/comunidades';
import comunidadesService from '@/lib/comunidadesService';

export default function ComunidadDetallePage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [comunidad, setComunidad] = useState<ComunidadDetalle | null>(null);
  const [amenidades, setAmenidades] = useState<any[]>([]);
  const [edificios, setEdificios] = useState<any[]>([]);
  const [residentes, setResidentes] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('resumen');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingData, setLoadingData] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (id) {
      loadComunidad();
    }
  }, [id]);

  useEffect(() => {
    if (comunidad && activeTab !== 'resumen') {
      loadTabData(activeTab);
    }
  }, [comunidad, activeTab]);

  const loadComunidad = async () => {
    setIsLoading(true);
    try {
      const data = await comunidadesService.getComunidadById(Number(id));
      console.log('Datos de comunidad cargados:', data);
      setComunidad(data);
      
      // Cargar amenidades para la pestaña resumen por defecto
      await loadAmenidades();
    } catch (error) {
      console.error('Error loading comunidad:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTabData = async (tab: string) => {
    if (!id) return;

    switch (tab) {
      case 'resumen':
        await loadAmenidades();
        break;
      case 'estructura':
        await loadEdificios();
        break;
      case 'residentes':
        await loadResidentes();
        break;
      case 'finanzas':
        await loadEstadisticas();
        break;
      case 'documentos':
        await loadDocumentos();
        break;
    }
  };

  const loadAmenidades = async () => {
    if (!id) return;
    
    setLoadingData(prev => ({ ...prev, amenidades: true }));
    try {
      const data = await comunidadesService.getAmenidadesByComunidad(Number(id));
      console.log('Amenidades cargadas:', data);
      setAmenidades(data);
    } catch (error) {
      console.error('Error loading amenidades:', error);
      setAmenidades([]);
    } finally {
      setLoadingData(prev => ({ ...prev, amenidades: false }));
    }
  };

  const loadEdificios = async () => {
    if (!id) return;
    
    setLoadingData(prev => ({ ...prev, edificios: true }));
    try {
      const data = await comunidadesService.getEdificiosByComunidad(Number(id));
      console.log('Edificios cargados:', data);
      setEdificios(data);
    } catch (error) {
      console.error('Error loading edificios:', error);
      setEdificios([]);
    } finally {
      setLoadingData(prev => ({ ...prev, edificios: false }));
    }
  };

  const loadResidentes = async () => {
    if (!id) return;
    
    setLoadingData(prev => ({ ...prev, residentes: true }));
    try {
      const data = await comunidadesService.getResidentesByComunidad(Number(id));
      console.log('Residentes cargados:', data);
      setResidentes(data);
    } catch (error) {
      console.error('Error loading residentes:', error);
      setResidentes([]);
    } finally {
      setLoadingData(prev => ({ ...prev, residentes: false }));
    }
  };

  const loadEstadisticas = async () => {
    if (!id) return;
    
    setLoadingData(prev => ({ ...prev, estadisticas: true }));
    try {
      const data = await comunidadesService.getEstadisticasByComunidad(Number(id));
      console.log('Estadísticas cargadas:', data);
      setEstadisticas(data);
    } catch (error) {
      console.error('Error loading estadisticas:', error);
      setEstadisticas(null);
    } finally {
      setLoadingData(prev => ({ ...prev, estadisticas: false }));
    }
  };

  const loadDocumentos = async () => {
    if (!id) return;
    
    setLoadingData(prev => ({ ...prev, documentos: true }));
    try {
      const data = await comunidadesService.getDocumentosByComunidad(Number(id));
      console.log('Documentos cargados:', data);
      setDocumentos(data);
    } catch (error) {
      console.error('Error loading documentos:', error);
      setDocumentos([]);
    } finally {
      setLoadingData(prev => ({ ...prev, documentos: false }));
    }
  };

  const handleEditClick = () => {
    router.push(`/comunidades/nueva?id=${id}&edit=true`);
  };

  const handleDeleteClick = () => {
    if (window.confirm('¿Está seguro de que desea eliminar esta comunidad?')) {
      router.push('/comunidades');
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout title="Cargando...">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!comunidad) {
    return (
      <ProtectedRoute>
        <Layout title="Comunidad no encontrada">
          <div className="text-center py-5">
            <h4>Comunidad no encontrada</h4>
            <Link href="/comunidades" className="btn btn-primary">Volver al listado</Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{comunidad.nombre} — Cuentas Claras</title>
      </Head>

      <Layout title={comunidad.nombre}>
        <div className="container-fluid py-4">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/comunidades">Comunidades</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {comunidad.nombre}
              </li>
            </ol>
          </nav>

          {/* Cover de la comunidad */}
          <div 
            className="comunidad-cover mb-4" 
            style={{ 
              backgroundImage: `url(${comunidad.imagen || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'})` 
            }}
          >
            <div className="comunidad-cover-overlay">
              <div className="cover-actions">
                <div className="dropdown">
                  <button
                    className="btn btn-light btn-sm dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <span className="material-icons me-1">more_vert</span>
                    Acciones
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button className="dropdown-item" onClick={handleEditClick}>
                        <span className="material-icons me-2">edit</span>
                        Editar información
                      </button>
                    </li>
                    <li>
                      <Link href={`/comunidades/${id}/parametros`} className="dropdown-item">
                        <span className="material-icons me-2">settings</span>
                        Parámetros de cobranza
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleDeleteClick}>
                        <span className="material-icons me-2">delete</span>
                        Eliminar comunidad
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h1 className="text-white mb-2">{comunidad.nombre}</h1>
                <p className="text-white mb-0">
                  <span className="material-icons me-1">location_on</span>
                  {comunidad.direccion}
                </p>
              </div>
            </div>
          </div>

          {/* Pestañas de navegación */}
          <div className="mb-4">
            <div className="d-flex border-bottom">
              {[
                { key: 'resumen', label: 'Resumen', icon: 'dashboard' },
                { key: 'estructura', label: 'Estructura', icon: 'apartment' },
                { key: 'residentes', label: 'Residentes', icon: 'people' },
                { key: 'finanzas', label: 'Finanzas', icon: 'account_balance' },
                { key: 'documentos', label: 'Documentos', icon: 'folder' }
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`tab-comunidad ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="material-icons me-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido de las pestañas */}
          
          {/* Pestaña Resumen */}
          {activeTab === 'resumen' && (
            <div className="row">
              {/* KPIs principales */}
              <div className="col-md-3 mb-4">
                <div className="stat-card">
                  <div className="stat-icon">
                    <span className="material-icons">apartment</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{comunidad.totalUnidades}</div>
                    <div className="stat-label">Total Unidades</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 mb-4">
                <div className="stat-card">
                  <div className="stat-icon">
                    <span className="material-icons">people</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{comunidad.totalResidentes}</div>
                    <div className="stat-label">Residentes</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 mb-4">
                <div className="stat-card">
                  <div className="stat-icon bg-warning">
                    <span className="material-icons">account_balance_wallet</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value text-warning">{comunidadesService.formatCurrency(comunidad.saldoPendiente)}</div>
                    <div className="stat-label">Saldo Pendiente</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 mb-4">
                <div className="stat-card">
                  <div className="stat-icon bg-danger">
                    <span className="material-icons">warning</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value text-danger">{comunidadesService.formatPercentage(comunidad.morosidad)}</div>
                    <div className="stat-label">Morosidad</div>
                  </div>
                </div>
              </div>

              {/* Información detallada */}
              <div className="col-lg-8">
                <div className="content-section">
                  <div className="content-section-header">
                    <h5 className="mb-0">Información General</h5>
                  </div>
                  <div className="content-section-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="detail-item">
                          <div className="detail-label">Tipo de Comunidad</div>
                          <div className="detail-value">{comunidad.tipo}</div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-label">Estado</div>
                          <div className="detail-value">
                            <span className={`badge ${comunidadesService.getEstadoBadgeClass(comunidad.estado)}`}>
                              {comunidad.estado}
                            </span>
                          </div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-label">Administrador</div>
                          <div className="detail-value">{comunidad.administrador}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="detail-item">
                          <div className="detail-label">Teléfono</div>
                          <div className="detail-value">{comunidad.telefono || 'No especificado'}</div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-label">Email</div>
                          <div className="detail-value">{comunidad.email || 'No especificado'}</div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-label">Horario de Atención</div>
                          <div className="detail-value">{comunidad.horarioAtencion || 'No especificado'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenidades */}
              <div className="col-lg-4">
                <div className="content-section mb-4">
                  <div className="content-section-header">
                    <h6 className="mb-0">Amenidades</h6>
                    {loadingData.amenidades && (
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    )}
                  </div>
                  <div className="content-section-body p-0">
                    {amenidades && amenidades.length > 0 ? (
                      amenidades.map((amenidad) => (
                        <div key={amenidad.id} className="d-flex justify-content-between align-items-center p-3 border-bottom">
                          <div>
                            <div className="fw-medium">{amenidad.nombre}</div>
                            <small className="text-muted">{amenidad.descripcion}</small>
                            {amenidad.requiereReserva && (
                              <small className="text-muted d-block">
                                Requiere reserva {amenidad.costoReserva > 0 && `- ${comunidadesService.formatCurrency(amenidad.costoReserva)}`}
                              </small>
                            )}
                          </div>
                          <span className={`badge ${
                          amenidad.estado === 'Disponible' ? 'bg-success' :
                          amenidad.estado === 'Mantenimiento' ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {amenidad.estado}
                        </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted">
                        <span className="material-icons mb-2 d-block" style={{ fontSize: '48px' }}>
                          spa
                        </span>
                        <p className="mb-0">
                          {loadingData.amenidades ? 'Cargando amenidades...' : 'No hay amenidades registradas'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mapa de ubicación */}
                <div className="content-section">
                  <div className="content-section-header">
                    <h6 className="mb-0">Ubicación</h6>
                    <div className="map-actions">
                      <button className="btn btn-sm btn-outline-primary">
                        <span className="material-icons me-1">directions</span>
                        Ver en Google Maps
                      </button>
                    </div>
                  </div>
                  <div className="content-section-body p-0">
                    <div className="map-container">
                      <div className="map-placeholder">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.0123456789!2d-70.6481256!3d-33.4569397!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDI3JzI1LjAiUyA3MMKwMzgnNTMuMiJX!5e0!3m2!1sen!2scl!4v1234567890123"
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`Mapa de ${comunidad.nombre}`}
                        ></iframe>
                      </div>
                      <div className="map-info">
                        <div className="map-address">
                          <span className="material-icons">location_on</span>
                          <div>
                            <div className="map-address-text">{comunidad.direccion}</div>
                            <p className="map-address-details">
                              <a href={`https://maps.google.com/?q=${encodeURIComponent(comunidad.direccion)}`} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="text-decoration-none">
                                Abrir en Google Maps
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña Estructura */}
          {activeTab === 'estructura' && (
            <div className="row">
              <div className="col-lg-8">
                <div className="content-section">
                  <div className="content-section-header">
                    <h5 className="mb-0">Edificios y Torres</h5>
                    <div className="d-flex align-items-center gap-2">
                      {loadingData.edificios && (
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                      )}
                      <button className="btn btn-sm btn-primary">
                        <span className="material-icons me-1">add</span>
                        Agregar Edificio
                      </button>
                    </div>
                  </div>
                  <div className="content-section-body p-0">
                    {edificios && edificios.length > 0 ? (
                      edificios.map((edificio) => (
                        <div key={edificio.id} className="edificio-item">
                        <div className="d-flex align-items-center">
                          <span className="material-icons me-3 text-primary">apartment</span>
                          <div>
                            <h6 className="mb-1">{edificio.nombre}</h6>
                            <small className="text-muted">
                              {edificio.direccion} • Código: {edificio.codigo}
                              <br />
                              <span className="text-primary">
                                Creado: {new Date(edificio.fechaCreacion).toLocaleDateString()}
                              </span>
                            </small>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <span className="badge bg-success me-2">Activo</span>
                          <div className="dropdown">
                            <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                              <span className="material-icons">more_vert</span>
                            </button>
                            <ul className="dropdown-menu">
                              <li><a className="dropdown-item" href="#">Ver unidades</a></li>
                              <li><a className="dropdown-item" href="#">Editar</a></li>
                              <li><hr className="dropdown-divider" /></li>
                              <li><a className="dropdown-item text-danger" href="#">Eliminar</a></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted">
                        <span className="material-icons mb-2 d-block" style={{ fontSize: '48px' }}>
                          apartment
                        </span>
                        <p className="mb-0">
                          {loadingData.edificios ? 'Cargando edificios...' : 'No hay edificios registrados'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="content-section">
                  <div className="content-section-header">
                    <h6 className="mb-0">Resumen de Estructura</h6>
                  </div>
                  <div className="content-section-body">
                    <div className="d-flex justify-content-between mb-3">
                      <span>Total Edificios:</span>
                      <strong>{edificios?.length || 0}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span>Total Unidades:</span>
                      <strong>{comunidad?.totalUnidades || 0}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span>Unidades Ocupadas:</span>
                      <strong>{comunidad?.unidadesOcupadas || 0}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Tasa de Ocupación:</span>
                      <strong className="text-primary">
                        {comunidad?.totalUnidades ? ((comunidad?.unidadesOcupadas || 0) / comunidad.totalUnidades * 100).toFixed(1) : '0.0'}%
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña Residentes */}
          {activeTab === 'residentes' && (
            <div className="row">
              <div className="col-12">
                <div className="content-section">
                  <div className="content-section-header">
                    <h5 className="mb-0">Residentes Registrados</h5>
                    <div className="d-flex gap-2">
                      {loadingData.residentes && (
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                      )}
                      <button className="btn btn-sm btn-outline-primary">
                        <span className="material-icons me-1">download</span>
                        Exportar
                      </button>
                      <button className="btn btn-sm btn-primary">
                        <span className="material-icons me-1">person_add</span>
                        Agregar Residente
                      </button>
                    </div>
                  </div>
                  <div className="content-section-body p-0">
                    {residentes && residentes.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Nombre</th>
                              <th>Unidad</th>
                              <th>Tipo</th>
                              <th>Teléfono</th>
                              <th>Email</th>
                              <th>Estado</th>
                              <th className="text-end">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {residentes.map((residente) => (
                              <tr key={residente.id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="avatar me-2" style={{ backgroundColor: '#fd5d14', fontSize: '0.8rem' }}>
                                      {residente.nombre?.split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    {residente.nombre}
                                  </div>
                                </td>
                                <td>
                                  <span className="badge bg-light text-dark">
                                    {residente.unidad || 'Sin unidad'}
                                  </span>
                                </td>
                                <td>
                                  <span className="text-capitalize">{residente.tipo}</span>
                                  {residente.tipo_tenencia && residente.tipo_tenencia !== residente.tipo && (
                                    <small className="text-muted d-block">({residente.tipo_tenencia})</small>
                                  )}
                                </td>
                                <td>{residente.telefono || 'No especificado'}</td>
                                <td>{residente.email || 'No especificado'}</td>
                                <td>
                                  <span className={`badge ${residente.estado === 'Activo' ? 'bg-success' : 'bg-secondary'}`}>
                                    {residente.estado}
                                  </span>
                                </td>
                                <td className="text-end">
                                  <div className="dropdown">
                                    <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                                      <span className="material-icons">more_vert</span>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                      <li><a className="dropdown-item" href="#">Ver perfil</a></li>
                                      <li><a className="dropdown-item" href="#">Editar</a></li>
                                      <li><hr className="dropdown-divider" /></li>
                                      <li><a className="dropdown-item text-danger" href="#">Eliminar</a></li>
                                    </ul>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted">
                        <span className="material-icons mb-2 d-block" style={{ fontSize: '48px' }}>
                          people
                        </span>
                        <p className="mb-0">
                          {loadingData.residentes ? 'Cargando residentes...' : 'No hay residentes registrados'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña Finanzas */}
          {activeTab === 'finanzas' && (
            <div className="row">
              {/* KPIs Financieros */}
              <div className="col-md-3 mb-4">
                <div className="stat-card">
                  <div className="stat-icon bg-success">
                    <span className="material-icons text-success">trending_up</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value text-success">
                      {estadisticas ? comunidadesService.formatCurrency(estadisticas.totalIngresos || 0) : 'Cargando...'}
                    </div>
                    <div className="stat-label">Ingresos Totales</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 mb-4">
                <div className="stat-card">
                  <div className="stat-icon bg-primary">
                    <span className="material-icons text-primary">check_circle</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value text-primary">
                      {estadisticas ? comunidadesService.formatCurrency(estadisticas.ingresosPagados || 0) : 'Cargando...'}
                    </div>
                    <div className="stat-label">Ingresos Pagados</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 mb-4">
                <div className="stat-card">
                  <div className="stat-icon bg-warning">
                    <span className="material-icons text-warning">pending</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value text-warning">
                      {estadisticas ? comunidadesService.formatCurrency(estadisticas.ingresosPendientes || 0) : 'Cargando...'}
                    </div>
                    <div className="stat-label">Ingresos Pendientes</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 mb-4">
                <div className="stat-card">
                  <div className="stat-icon bg-danger">
                    <span className="material-icons text-danger">trending_down</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value text-danger">
                      {estadisticas ? 
                        comunidadesService.formatCurrency(
                          (estadisticas.serviciosBasicos || 0) + 
                          (estadisticas.mantenimiento || 0) + 
                          (estadisticas.administracion || 0)
                        ) : 'Cargando...'
                      }
                    </div>
                    <div className="stat-label">Gastos Totales</div>
                  </div>
                </div>
              </div>

              {/* Gráfico de Ingresos vs Gastos */}
              <div className="col-lg-8">
                <div className="content-section">
                  <div className="content-section-header">
                    <h5 className="mb-0">Flujo de Caja - Últimos 6 Meses</h5>
                    {loadingData.estadisticas && (
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    )}
                  </div>
                  <div className="content-section-body">
                    <div className="chart-placeholder text-center py-5">
                      <span className="material-icons text-muted mb-3" style={{ fontSize: '64px' }}>bar_chart</span>
                      <h6 className="text-muted">Gráfico de Flujo de Caja</h6>
                      <p className="text-muted">Implementar con Chart.js o biblioteca similar</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen Financiero */}
              <div className="col-lg-4">
                <div className="content-section">
                  <div className="content-section-header">
                    <h6 className="mb-0">Resumen del Mes</h6>
                  </div>
                  <div className="content-section-body">
                    {estadisticas ? (
                      <>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Ingresos Totales:</span>
                          <strong className="text-success">
                            {comunidadesService.formatCurrency(estadisticas.totalIngresos || 0)}
                          </strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Pagados:</span>
                          <strong className="text-primary">
                            {comunidadesService.formatCurrency(estadisticas.ingresosPagados || 0)}
                          </strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Pendientes:</span>
                          <strong className="text-warning">
                            {comunidadesService.formatCurrency(estadisticas.ingresosPendientes || 0)}
                          </strong>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between mb-2">
                          <span>Servicios Básicos:</span>
                          <strong className="text-danger">
                            {comunidadesService.formatCurrency(estadisticas.serviciosBasicos || 0)}
                          </strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Mantenimiento:</span>
                          <strong className="text-danger">
                            {comunidadesService.formatCurrency(estadisticas.mantenimiento || 0)}
                          </strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Administración:</span>
                          <strong className="text-danger">
                            {comunidadesService.formatCurrency(estadisticas.administracion || 0)}
                          </strong>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <span><strong>Balance:</strong></span>
                          <strong className={
                            (estadisticas.totalIngresos || 0) - 
                            ((estadisticas.serviciosBasicos || 0) + (estadisticas.mantenimiento || 0) + (estadisticas.administracion || 0)) >= 0 
                            ? 'text-success' : 'text-danger'
                          }>
                            {comunidadesService.formatCurrency(
                              (estadisticas.totalIngresos || 0) - 
                              ((estadisticas.serviciosBasicos || 0) + (estadisticas.mantenimiento || 0) + (estadisticas.administracion || 0))
                            )}
                          </strong>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-3">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Cargando estadísticas...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña Documentos */}
          {activeTab === 'documentos' && (
            <div className="row">
              <div className="col-12">
                <div className="content-section">
                  <div className="content-section-header">
                    <h5 className="mb-0">Documentos de la Comunidad</h5>
                    <div className="d-flex align-items-center gap-2">
                      {loadingData.documentos && (
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                      )}
                      <button className="btn btn-sm btn-primary">
                        <span className="material-icons me-1">upload</span>
                        Subir Documento
                      </button>
                    </div>
                  </div>
                  <div className="content-section-body p-0">
                    {documentos && documentos.length > 0 ? (
                      documentos.map((documento) => (
                        <div key={documento.id} className="d-flex align-items-center justify-content-between p-3 border-bottom">
                        <div className="d-flex align-items-center">
                          <span className="material-icons me-3 text-primary">
                            {documento.tipo === 'reglamento' ? 'gavel' :
                             documento.tipo === 'acta' ? 'description' :
                             documento.tipo === 'contrato' ? 'assignment' : 'folder'}
                          </span>
                          <div>
                            <h6 className="mb-1">{documento.nombre}</h6>
                            <small className="text-muted">
                              <span className="text-capitalize">{documento.tipo}</span> • 
                              {documento.periodo && ` ${documento.periodo} • `}
                              <span className="text-capitalize">{documento.visibilidad}</span> • 
                              {new Date(documento.fechaSubida).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => window.open(documento.url, '_blank')}
                            title="Descargar documento"
                          >
                            <span className="material-icons">download</span>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => window.open(documento.url, '_blank')}
                            title="Ver documento"
                          >
                            <span className="material-icons">visibility</span>
                          </button>
                          <div className="dropdown">
                            <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                              <span className="material-icons">more_vert</span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                              <li><a className="dropdown-item" href="#">Editar</a></li>
                              <li><a className="dropdown-item" href="#">Compartir</a></li>
                              <li><hr className="dropdown-divider" /></li>
                              <li><a className="dropdown-item text-danger" href="#">Eliminar</a></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted">
                        <span className="material-icons mb-2 d-block" style={{ fontSize: '48px' }}>
                          folder_open
                        </span>
                        <p className="mb-0">
                          {loadingData.documentos ? 'Cargando documentos...' : 'No hay documentos registrados'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
