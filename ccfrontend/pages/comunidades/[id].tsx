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
  const [activeTab, setActiveTab] = useState<string>('resumen');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadComunidad();
    }
  }, [id]);

  const loadComunidad = async () => {
    setIsLoading(true);
    try {
      const data = await comunidadesService.getComunidadById(Number(id));
      setComunidad(data);
    } catch (error) {
      console.error('Error loading comunidad:', error);
    } finally {
      setIsLoading(false);
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

          {/* Contenido de las pestañas - Solo mostraremos Resumen por ahora */}
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
                  <div className="stat-icon">
                    <span className="material-icons">account_balance_wallet</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{comunidadesService.formatCurrency(comunidad.saldoPendiente)}</div>
                    <div className="stat-label">Saldo Pendiente</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 mb-4">
                <div className="stat-card">
                  <div className="stat-icon">
                    <span className="material-icons">warning</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{comunidadesService.formatPercentage(comunidad.morosidad)}</div>
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
                <div className="content-section">
                  <div className="content-section-header">
                    <h6 className="mb-0">Amenidades</h6>
                  </div>
                  <div className="content-section-body p-0">
                    {comunidad.amenidades.map((amenidad) => (
                      <div key={amenidad.id} className="d-flex justify-content-between align-items-center p-3 border-bottom">
                        <div>
                          <div className="fw-medium">{amenidad.nombre}</div>
                          {amenidad.requiereReserva && (
                            <small className="text-muted">
                              Requiere reserva {amenidad.costoReserva && `- ${comunidadesService.formatCurrency(amenidad.costoReserva)}`}
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
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Otras pestañas - placeholder */}
          {activeTab !== 'resumen' && (
            <div className="text-center py-5">
              <span className="material-icons text-muted mb-3" style={{ fontSize: '64px' }}>construction</span>
              <h5 className="text-muted">Sección en desarrollo</h5>
              <p className="text-muted">Esta funcionalidad se implementará próximamente.</p>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
