import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import Head from 'next/head';
import Link from 'next/link';

// Tipos y servicios
import { Multa, MultaFiltros, MultasEstadisticas } from '@/types/multas';
import multasService from '@/lib/multasService';

export default function MultasListado() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Estados principales
  const [multas, setMultas] = useState<Multa[]>([]);
  const [multasFiltradas, setMultasFiltradas] = useState<Multa[]>([]);
  const [estadisticas, setEstadisticas] = useState<MultasEstadisticas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState<MultaFiltros>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const [selectedPrioridad, setSelectedPrioridad] = useState<string>('');
  
  // Estados de vista
  const [vistaActual, setVistaActual] = useState<'cards' | 'table'>('cards');
  const [multasSeleccionadas, setMultasSeleccionadas] = useState<number[]>([]);

  // ✅ Cargar multas según el rol del usuario
  const loadMultas = async () => {
    setIsLoading(true);
    try {
      console.log('👤 Usuario actual:', user);
      console.log('👑 Es superadmin:', user?.is_superadmin);
      console.log('🏢 Membresías:', user?.memberships);

      let filtrosCompletos: MultaFiltros = { ...filtros };

      // 🔒 APLICAR FILTROS POR ROL
      if (!user?.is_superadmin && user?.memberships) {
        // Admin de comunidad: solo ve multas de sus comunidades
        const comunidadIds = user.memberships.map(m => m.comunidadId);
        if (comunidadIds.length === 1) {
          filtrosCompletos.comunidad_id = comunidadIds[0];
        }
        // Si tiene múltiples comunidades, el backend debe filtrar por todas
      }

      console.log('🔍 Filtros aplicados:', filtrosCompletos);
      const data = await multasService.getMultas(filtrosCompletos);
      
      setMultas(data);
      console.log(`📋 ${data.length} multas cargadas`);

      // Cargar estadísticas
      const statsData = await multasService.getEstadisticas(
        filtrosCompletos.comunidad_id
      );
      setEstadisticas(statsData);
      
    } catch (error) {
      console.error('❌ Error cargando multas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos cuando el usuario esté disponible
  useEffect(() => {
    if (user) {
      loadMultas();
    }
  }, [user, filtros]);

  // Filtrar multas localmente
  useEffect(() => {
    let multasFiltradas = [...multas];

    // Filtro por búsqueda
    if (searchTerm) {
      multasFiltradas = multasFiltradas.filter(multa => 
        multa.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        multa.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        multa.tipo_infraccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        multa.unidad_numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        multa.propietario_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (selectedEstado) {
      multasFiltradas = multasFiltradas.filter(multa => multa.estado === selectedEstado);
    }

    // Filtro por prioridad
    if (selectedPrioridad) {
      multasFiltradas = multasFiltradas.filter(multa => multa.prioridad === selectedPrioridad);
    }

    setMultasFiltradas(multasFiltradas);
  }, [multas, searchTerm, selectedEstado, selectedPrioridad]);

  // Render de estadísticas
  const renderEstadisticas = () => {
    if (!estadisticas) return null;

    return (
      <div className="row mb-4">
        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">receipt_long</span>
                <div>
                  <div className="fs-4 fw-bold">{estadisticas.total}</div>
                  <div className="small">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-warning text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">pending</span>
                <div>
                  <div className="fs-4 fw-bold">{estadisticas.pendientes}</div>
                  <div className="small">Pendientes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-danger text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">event_busy</span>
                <div>
                  <div className="fs-4 fw-bold">{estadisticas.vencidas}</div>
                  <div className="small">Vencidas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">paid</span>
                <div>
                  <div className="fs-4 fw-bold">{estadisticas.pagadas}</div>
                  <div className="small">Pagadas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">gavel</span>
                <div>
                  <div className="fs-4 fw-bold">{estadisticas.apeladas}</div>
                  <div className="small">Apeladas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">attach_money</span>
                <div>
                  <div className="fs-4 fw-bold">
                    {multasService.formatearMonto(estadisticas.monto_recaudado)}
                  </div>
                  <div className="small">Recaudado</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render de información de debug
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="alert alert-info mb-4">
        <h6>🔍 Debug Info - Multas:</h6>
        <p><strong>Usuario:</strong> {user?.username}</p>
        <p><strong>Es superadmin:</strong> {user?.is_superadmin ? '✅ Sí' : '❌ No'}</p>
        <p><strong>Membresías:</strong> {user?.memberships?.length || 0}</p>
        {user?.memberships && (
          <ul>
            {user.memberships.map((m, idx) => (
              <li key={idx}>Comunidad ID: {m.comunidadId}, Rol: {m.rol}</li>
            ))}
          </ul>
        )}
        <p><strong>Multas visibles:</strong> {multasFiltradas.length}</p>
        <p><strong>Filtros aplicados:</strong> {JSON.stringify(filtros)}</p>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Multas — Cuentas Claras</title>
      </Head>

      <Layout title='Multas'>
        <div className='container-fluid py-4'>
          {/* Debug info */}
          {renderDebugInfo()}
          
          {/* Header */}
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div>
              <h1 className='h3 mb-0'>Multas</h1>
              <p className='text-muted mb-0'>
                {user?.is_superadmin 
                  ? 'Gestión de multas de todas las comunidades' 
                  : 'Gestión de multas de mis comunidades'
                }
              </p>
            </div>
            
            <div className="d-flex gap-2">
              {/* Botón exportar */}
              <button className="btn btn-outline-primary">
                <span className="material-icons me-2">download</span>
                Exportar
              </button>
              
              {/* Botón nueva multa */}
              <Link href="/multas/nueva" className='btn btn-primary'>
                <span className='material-icons me-2'>add</span>
                Nueva Multa
              </Link>
            </div>
          </div>

          {/* Estadísticas */}
          {renderEstadisticas()}

          {/* Filtros */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                {/* Búsqueda */}
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text">
                      <span className="material-icons">search</span>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar multas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filtro por estado */}
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={selectedEstado}
                    onChange={(e) => setSelectedEstado(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="pagada">Pagadas</option>
                    <option value="vencida">Vencidas</option>
                    <option value="apelada">Apeladas</option>
                    <option value="anulada">Anuladas</option>
                  </select>
                </div>

                {/* Filtro por prioridad */}
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={selectedPrioridad}
                    onChange={(e) => setSelectedPrioridad(e.target.value)}
                  >
                    <option value="">Todas las prioridades</option>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>

                {/* Toggle de vista */}
                <div className="col-md-2">
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className={`btn ${vistaActual === 'cards' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setVistaActual('cards')}
                    >
                      <span className="material-icons">view_module</span>
                    </button>
                    <button
                      type="button"
                      className={`btn ${vistaActual === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setVistaActual('table')}
                    >
                      <span className="material-icons">view_list</span>
                    </button>
                  </div>
                </div>

                {/* Limpiar filtros */}
                <div className="col-md-2">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedEstado('');
                      setSelectedPrioridad('');
                      setFiltros({});
                    }}
                  >
                    <span className="material-icons me-2">clear</span>
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido */}
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3">Cargando multas...</p>
            </div>
          ) : multasFiltradas.length === 0 ? (
            <div className="text-center py-5">
              <span className="material-icons display-1 text-muted">receipt_long</span>
              <h5 className="mt-3">No se encontraron multas</h5>
              <p className="text-muted">
                {searchTerm || selectedEstado || selectedPrioridad
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay multas registradas aún'
                }
              </p>
            </div>
          ) : (
            <div className="row">
              {multasFiltradas.map((multa) => (
                <div key={multa.id} className={vistaActual === 'cards' ? 'col-md-6 col-lg-4 mb-3' : 'col-12 mb-2'}>
                  {vistaActual === 'cards' ? (
                    /* Card View */
                    <div className="card h-100">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="card-title mb-0">Multa #{multa.numero}</h6>
                          <small className="text-muted">{multa.unidad_numero}</small>
                        </div>
                        <div className="d-flex gap-1">
                          <span className={`badge bg-${multasService.getEstadoColor(multa.estado)}`}>
                            {multa.estado}
                          </span>
                          <span className={`badge bg-${multasService.getPrioridadColor(multa.prioridad)}`}>
                            {multa.prioridad}
                          </span>
                        </div>
                      </div>
                      <div className="card-body">
                        <h6 className="text-primary">{multa.tipo_infraccion}</h6>
                        <p className="card-text small text-muted mb-2">
                          {multa.descripcion?.substring(0, 100)}
                          {multa.descripcion && multa.descripcion.length > 100 && '...'}
                        </p>
                        <div className="row text-sm">
                          <div className="col-6">
                            <strong>Monto:</strong><br/>
                            <span className="text-danger fw-bold">
                              {multasService.formatearMonto(multa.monto)}
                            </span>
                          </div>
                          <div className="col-6">
                            <strong>Vence:</strong><br/>
                            <span className={multasService.estaVencida(multa.fecha_vencimiento) ? 'text-danger' : 'text-muted'}>
                              {new Date(multa.fecha_vencimiento).toLocaleDateString('es-CL')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer">
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {multa.propietario_nombre || 'Sin propietario'}
                          </small>
                          <Link
                            href={`/multas/${multa.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Ver detalle
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Table Row */
                    <div className="card">
                      <div className="card-body py-2">
                        <div className="row align-items-center">
                          <div className="col-1">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={multasSeleccionadas.includes(multa.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setMultasSeleccionadas([...multasSeleccionadas, multa.id]);
                                } else {
                                  setMultasSeleccionadas(multasSeleccionadas.filter(id => id !== multa.id));
                                }
                              }}
                            />
                          </div>
                          <div className="col-2">
                            <strong>#{multa.numero}</strong><br/>
                            <small className="text-muted">{multa.unidad_numero}</small>
                          </div>
                          <div className="col-3">
                            <div className="fw-bold text-primary">{multa.tipo_infraccion}</div>
                            <small className="text-muted">{multa.propietario_nombre}</small>
                          </div>
                          <div className="col-2 text-center">
                            <div className="fw-bold text-danger">{multasService.formatearMonto(multa.monto)}</div>
                            <small className="text-muted">{new Date(multa.fecha_vencimiento).toLocaleDateString('es-CL')}</small>
                          </div>
                          <div className="col-2 text-center">
                            <span className={`badge bg-${multasService.getEstadoColor(multa.estado)}`}>
                              {multa.estado}
                            </span>
                          </div>
                          <div className="col-2 text-end">
                            <Link
                              href={`/multas/${multa.id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <span className="material-icons">visibility</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Acciones masivas */}
          {multasSeleccionadas.length > 0 && (
            <div className="card mt-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <span>{multasSeleccionadas.length} multas seleccionadas</span>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary">
                      <span className="material-icons me-2">email</span>
                      Enviar recordatorio
                    </button>
                    <button className="btn btn-sm btn-outline-success">
                      <span className="material-icons me-2">download</span>
                      Exportar seleccionadas
                    </button>
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