import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import { ProtectedRoute, useAuth } from '../lib/useAuth';
import multasService from '../lib/multasService';
import { Multa, MultaFiltros, MultasEstadisticas } from '../types/multas';
import Head from 'next/head';
import Link from 'next/link';
import ActionsDropdown from '../components/ActionsDropdown';
import { hasPermission } from '../lib/usePermissions';

export default function MultasListado() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Estados
  const [multas, setMultas] = useState<Multa[]>([]);
  const [estadisticas, setEstadisticas] = useState<MultasEstadisticas | null>(null);
  const [filtroActivo, setFiltroActivo] = useState('all');
  const [multasSeleccionadas, setMultasSeleccionadas] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [prioridadFiltro, setPrioridadFiltro] = useState<string>('all');

  // Cargar datos
  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [multasData, statsData] = await Promise.all([
        multasService.getMultas(),
        multasService.getEstadisticas()
      ]);
      
      setMultas(multasData);
      setEstadisticas(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar multas
  const multasFiltradas = multas.filter(multa => {
    const matchesFilter = filtroActivo === 'all' || multa.estado === filtroActivo;
    const matchesPrioridad = prioridadFiltro === 'all' || multa.prioridad === prioridadFiltro;
    const matchesSearch = !searchTerm || 
      multa.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      multa.tipo_infraccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      multa.motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      multa.unidad_numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      multa.propietario_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesPrioridad && matchesSearch;
  });

  // Manejar selección
  const handleSelectMulta = (multaId: number) => {
    setMultasSeleccionadas(prev => 
      prev.includes(multaId) 
        ? prev.filter(id => id !== multaId)
        : [...prev, multaId]
    );
  };

  const handleSelectAll = () => {
    if (multasSeleccionadas.length === multasFiltradas.length) {
      setMultasSeleccionadas([]);
    } else {
      setMultasSeleccionadas(multasFiltradas.map(m => m.id));
    }
  };

  // Obtener label del filtro
  const getFiltroLabel = (filtro: string): string => {
    const labels: Record<string, string> = {
      all: 'Todas',
      pendiente: 'Pendientes',
      pagado: 'Pagadas',
      vencido: 'Vencidas',
      apelada: 'Apeladas',
      anulada: 'Anuladas'
    };
    return labels[filtro] || filtro;
  };

  const getFiltroCount = (filtro: string): number => {
    if (filtro === 'all') return multas.length;
    return multas.filter(m => m.estado === filtro).length;
  };

  const getPrioridadLabel = (prioridad: string): string => {
    const labels: Record<string, string> = {
      all: 'Todas',
      baja: 'Baja',
      media: 'Media',
      alta: 'Alta',
      critica: 'Crítica'
    };
    return labels[prioridad] || prioridad;
  };

  // Handlers para las acciones
  const handleRegistrarPago = (multaId: number) => {
    router.push(`/multas/${multaId}?action=pagar`);
  };

  const handleEditar = (multaId: number) => {
    router.push(`/multas/${multaId}/editar`);
  };

  const handleVerDetalle = (multaId: number) => {
    router.push(`/multas/${multaId}`);
  };

  const handleEnviarRecordatorio = async (multaId: number) => {
    const multa = multas.find(m => m.id === multaId);
    if (!multa) return;
    
    if (!confirm(`¿Enviar recordatorio de pago para la multa ${multa.numero}?`)) {
      return;
    }
    
    try {
      console.log(`📧 Enviando recordatorio para multa ${multaId}...`);
      
      // TODO: Implementar endpoint de recordatorio en el backend
      alert(`✅ Recordatorio enviado para multa ${multa.numero}`);
      
    } catch (error) {
      console.error('Error enviando recordatorio:', error);
      alert('❌ Error al enviar el recordatorio. Intente nuevamente.');
    }
  };

  const handleAnular = async (multaId: number) => {
    const multa = multas.find(m => m.id === multaId);
    if (!multa) return;
    
    const motivo = window.prompt(
      `¿Está seguro que desea anular la multa ${multa.numero}?\n\nIngrese el motivo de anulación:`,
      ''
    );
    
    if (motivo === null) return;
    
    if (!motivo || motivo.length < 10) {
      alert('❌ El motivo debe tener al menos 10 caracteres.');
      return;
    }
    
    try {
      console.log(`🚫 Anulando multa ${multaId} con motivo:`, motivo);
      
      await multasService.anularMulta(multaId, { motivo_anulacion: motivo });
      
      alert(`✅ Multa ${multa.numero} anulada exitosamente`);
      
      // Recargar los datos
      await loadData();
      
    } catch (error) {
      console.error('Error anulando multa:', error);
      alert('❌ Error al anular la multa. Intente nuevamente.');
    }
  };

  // ==== NUEVO: helper para decidir si se puede editar una multa ====
  const canEditMulta = (m: Multa) => {
    if (!m) return false;
    // no editar si ya está pagada o anulada
    if (['pagado', 'anulada'].includes(m.estado)) return false;
    // superadmin siempre puede
    if (user?.is_superadmin) return true;
    // comprobar permiso y pertenencia a comunidad
    return hasPermission(user, 'multas.edit', m.comunidad_id);
  };
  // ==============================================================

  // ==== HELPERS: permisos por multa ====
  const canAnularMulta = (m: Multa) => {
    if (!m) return false;
    if (m.estado === 'anulada') return false;
    // superadmin o permiso de comunidad
    if (user?.is_superadmin) return true;
    return hasPermission(user, 'multas.anular', m.comunidad_id);
  };

  const canApelarMulta = (m: Multa) => {
    if (!m) return false;
    // sólo propietario/inquilino/residente pueden apelar su propia multa y solo si no está anulada
    if (m.estado === 'anulada') return false;
    if (!user?.persona_id) return false;
    if (m.persona_id !== user.persona_id) return false;
    return hasPermission(user, 'multas.apelar', m.comunidad_id) || user?.is_superadmin;
  };
  // ==============================================================

  const handleExportar = async () => {
    try {
      console.log('📥 Exportando multas...');
      
      // TODO: Implementar exportación
      alert('Función de exportación en desarrollo');
      
    } catch (error) {
      console.error('Error exportando:', error);
      alert('❌ Error al exportar. Intente nuevamente.');
    }
  };

  const handleAccionesMultiples = () => {
    if (multasSeleccionadas.length === 0) return;
    
    const accion = window.prompt(
      `Acciones disponibles para ${multasSeleccionadas.length} multas seleccionadas:\n\n` +
      `1. Anular\n` +
      `2. Enviar recordatorios\n` +
      `3. Exportar selección\n\n` +
      `Ingrese el número de la acción:`,
      ''
    );
    
    if (!accion) return;
    
    switch (accion) {
      case '1':
        // Anular múltiples
        if (confirm(`¿Anular ${multasSeleccionadas.length} multas?`)) {
          alert('Función en desarrollo');
        }
        break;
      case '2':
        // Enviar recordatorios
        if (confirm(`¿Enviar recordatorios a ${multasSeleccionadas.length} multas?`)) {
          alert('Función en desarrollo');
        }
        break;
      case '3':
        // Exportar selección
        alert('Función en desarrollo');
        break;
      default:
        alert('Opción no válida');
    }
  };

  // Formateo de valores
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="Multas">
          <div className="container-fluid py-4">
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando multas...</span>
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
        <title>Multas — Cuentas Claras</title>
      </Head>

      <Layout title="Multas">
        <div className="container-fluid py-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">Gestión de Multas</h1>
              <p className="text-muted mb-0">Administración de multas por infracciones</p>
            </div>
            <div className="d-flex gap-2">
              {multasSeleccionadas.length > 0 && (
                <button 
                  className="btn btn-outline-primary"
                  onClick={handleAccionesMultiples}
                >
                  <span className="material-icons me-1">checklist</span>
                  Acciones ({multasSeleccionadas.length})
                </button>
              )}
              <button 
                className="btn btn-outline-secondary"
                onClick={handleExportar}
              >
                <span className="material-icons me-1">file_download</span>
                Exportar
              </button>
              { (hasPermission(user, 'multas.create') || user?.is_superadmin) && (
                <Link href="/multas/nueva" className="btn btn-primary">
                  <span className="material-icons me-1">add</span>
                  Nueva Multa
                </Link>
              )}
            </div>
          </div>

          {/* Filtros */}
          <div className="filters-panel mb-4">
            <div className="d-flex flex-column gap-3">
              {/* Filtros de estado */}
              <div className="d-flex flex-wrap align-items-center gap-2">
                <span className="text-muted small me-2">Estado:</span>
                {['all', 'pendiente', 'pagado', 'vencido', 'apelada', 'anulada'].map(filtro => (
                  <div 
                    key={filtro}
                    className={`filter-chip ${filtroActivo === filtro ? 'active' : ''}`}
                    onClick={() => setFiltroActivo(filtro)}
                  >
                    <span>{getFiltroLabel(filtro)}</span>
                    <span className="ms-1">({getFiltroCount(filtro)})</span>
                  </div>
                ))}
              </div>

              {/* Filtros de prioridad */}
              <div className="d-flex flex-wrap align-items-center gap-2">
                <span className="text-muted small me-2">Prioridad:</span>
                {['all', 'baja', 'media', 'alta', 'critica'].map(prioridad => (
                  <div 
                    key={prioridad}
                    className={`filter-chip priority-${prioridad} ${prioridadFiltro === prioridad ? 'active' : ''}`}
                    onClick={() => setPrioridadFiltro(prioridad)}
                  >
                    <span>{getPrioridadLabel(prioridad)}</span>
                  </div>
                ))}
              </div>

              {/* Buscador */}
              <div className="d-flex gap-2">
                <div className="flex-grow-1">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por número, tipo de infracción, unidad o propietario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {(searchTerm || filtroActivo !== 'all' || prioridadFiltro !== 'all') && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setFiltroActivo('all');
                      setPrioridadFiltro('all');
                    }}
                  >
                    <span className="material-icons">clear</span>
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats cards */}
          {estadisticas && (
            <div className="row mb-4">
              <div className="col-6 col-lg-3">
                <div className="card border-0">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="p-2 rounded" style={{backgroundColor: '#E3F2FD'}}>
                          <span className="material-icons text-primary">gavel</span>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <div className="text-muted small">Total</div>
                        <div className="h4 mb-0">{estadisticas.total}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="card border-0">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="p-2 rounded" style={{backgroundColor: '#FFF8E1'}}>
                          <span className="material-icons text-warning">schedule</span>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <div className="text-muted small">Pendientes</div>
                        <div className="h4 mb-0">{estadisticas.pendientes}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="card border-0">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="p-2 rounded" style={{backgroundColor: '#E8F5E9'}}>
                          <span className="material-icons text-success">check_circle</span>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <div className="text-muted small">Pagadas</div>
                        <div className="h4 mb-0">{estadisticas.pagadas}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="card border-0">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="p-2 rounded" style={{backgroundColor: '#FFEBEE'}}>
                          <span className="material-icons text-danger">error</span>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <div className="text-muted small">Vencidas</div>
                        <div className="h4 mb-0">{estadisticas.vencidas}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Montos totales */}
          {estadisticas?.montos && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0">
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-6 col-md-3">
                        <div className="text-muted small mb-1">Total en Multas</div>
                        <div className="h5 mb-0 text-primary">
                          {formatCurrency(estadisticas.montos.total)}
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="text-muted small mb-1">Pendiente de Pago</div>
                        <div className="h5 mb-0 text-warning">
                          {formatCurrency(estadisticas.montos.pendiente)}
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="text-muted small mb-1">Recaudado</div>
                        <div className="h5 mb-0 text-success">
                          {formatCurrency(estadisticas.montos.recaudado)}
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="text-muted small mb-1">Vencido</div>
                        <div className="h5 mb-0 text-danger">
                          {formatCurrency(estadisticas.montos.vencido)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile cards */}
          <div className="mobile-cards d-lg-none">
            {multasFiltradas.map(multa => (
              <div key={multa.id} className={`fine-card ${multa.estado}`}>
                <div className="fine-header">
                  <div className="flex-grow-1">
                    <div className="fine-number">#{multa.numero}</div>
                    <div className="fine-unit">Unidad {multa.unidad_numero}</div>
                    {multa.propietario_nombre && (
                      <div className="fine-owner text-muted small">
                        {multa.propietario_nombre}
                      </div>
                    )}
                    <div className="fine-violation">{multa.tipo_infraccion || multa.motivo}</div>
                    <div className="mb-2">
                      <span className={`status-badge status-${multa.estado} me-2`}>
                        {multa.estado}
                      </span>
                      <span className={`priority-badge priority-${multa.prioridad}`}>
                        {multa.prioridad}
                      </span>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fine-amount">{formatCurrency(multa.monto)}</div>
                    <small className="text-muted">
                      Vence: {formatDate(multa.fecha_vencimiento)}
                    </small>
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleVerDetalle(multa.id)}
                  >
                    Ver Detalle
                  </button>
                  {multa.estado === 'pendiente' && (
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => handleRegistrarPago(multa.id)}
                    >
                      Pagar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="desktop-table d-none d-lg-block">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>
                      <input 
                        type="checkbox" 
                        className="form-check-input"
                        checked={multasSeleccionadas.length === multasFiltradas.length && multasFiltradas.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Número</th>
                    <th>Unidad</th>
                    <th>Infracción</th>
                    <th>Monto</th>
                    <th>Emisión</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                    <th>Prioridad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {multasFiltradas.map(multa => (
                    <tr key={multa.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          className="form-check-input"
                          checked={multasSeleccionadas.includes(multa.id)}
                          onChange={() => handleSelectMulta(multa.id)}
                        />
                      </td>
                      <td>
                        <div className="fw-bold">{multa.numero}</div>
                        <small className="text-muted">ID: {multa.id}</small>
                      </td>
                      <td>
                        <div className="fw-bold">Unidad {multa.unidad_numero}</div>
                        <small className="text-muted">
                          {multa.propietario_nombre || 'Sin propietario'}
                        </small>
                      </td>
                      <td>
                        <div>{multa.tipo_infraccion || multa.motivo}</div>
                        {multa.descripcion && (
                          <small className="text-muted d-block text-truncate" style={{ maxWidth: '200px' }}>
                            {multa.descripcion}
                          </small>
                        )}
                      </td>
                      <td className="fw-bold">{formatCurrency(multa.monto)}</td>
                      <td>{formatDate(multa.fecha_infraccion || multa.fecha)}</td>
                      <td>
                        {formatDate(multa.fecha_vencimiento)}
                        {multasService.estaVencida && multasService.estaVencida(multa.fecha_vencimiento) && (
                          <small className="text-danger d-block">¡Vencida!</small>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge status-${multa.estado}`}>
                          {multa.estado}
                        </span>
                      </td>
                      <td>
                        <span className={`priority-badge priority-${multa.prioridad}`}>
                          {multa.prioridad}
                        </span>
                      </td>
                      <td>
                        <ActionsDropdown
                          trigger={<button className="btn btn-sm btn-outline-secondary">Acciones ▾</button>}
                          menu={
                            <ul style={{ margin: 0, padding: 8, listStyle: 'none', minWidth: 180 }}>
                              <li>
                                <button className="dropdown-item" onClick={() => handleVerDetalle(multa.id)}>
                                  <span className="material-icons me-2">visibility</span>
                                  Ver Detalle
                                </button>
                              </li>
                              { hasPermission(user, 'multas.register_payment') && ['pendiente','vencido'].includes(multa.estado) && (
                                <li>
                                  <button className="dropdown-item text-success" onClick={() => handleRegistrarPago(multa.id)}>
                                    <span className="material-icons me-2">payment</span>
                                    Registrar Pago
                                  </button>
                                </li>
                              )}
                              { canEditMulta(multa) && (
                                <li>
                                  <button className="dropdown-item" onClick={() => handleEditar(multa.id)}>
                                    <span className="material-icons me-2">edit</span>
                                    Editar
                                  </button>
                                </li>
                              )}
                              <li><hr className="dropdown-divider" /></li>
                              <li>
                                <button className="dropdown-item" onClick={() => handleEnviarRecordatorio(multa.id)}>
                                  <span className="material-icons me-2">email</span>
                                  Enviar Recordatorio
                                </button>
                              </li>
                              { canAnularMulta(multa) && (
                                <>
                                  <li><hr className="dropdown-divider" /></li>
                                  <li>
                                    <button className="dropdown-item text-danger" onClick={() => handleAnular(multa.id)}>
                                      <span className="material-icons me-2">cancel</span>
                                      Anular Multa
                                    </button>
                                  </li>
                                </>
                              )}
                              { canApelarMulta(multa) && (
                                <>
                                  <li><hr className="dropdown-divider" /></li>
                                  <li>
                                    <button className="dropdown-item text-info" onClick={() => handleApelar(multa.id)}>
                                      <span className="material-icons me-2">gavel</span>
                                      Apelar
                                    </button>
                                  </li>
                                </>
                              )}
                            </ul>
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty state */}
          {multasFiltradas.length === 0 && (
            <div className="text-center py-5">
              <span className="material-icons display-1 text-muted">gavel</span>
              <h4 className="mt-3">No hay multas</h4>
              <p className="text-muted">
                {searchTerm 
                  ? `No se encontraron multas con "${searchTerm}"`
                  : filtroActivo === 'all' && prioridadFiltro === 'all'
                    ? 'No hay multas creadas aún'
                    : `No hay multas con los filtros seleccionados`
                }
              </p>
              {filtroActivo === 'all' && prioridadFiltro === 'all' && !searchTerm && (
                <Link href="/multas/nueva" className="btn btn-primary">
                  <span className="material-icons me-2">add</span>
                  Crear Primera Multa
                </Link>
              )}
            </div>
          )}
        </div>

        <style jsx>{`
          .filters-panel {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .filter-chip {
            display: inline-flex;
            align-items: center;
            padding: 0.5rem 1rem;
            border: 2px solid #e9ecef;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            background: white;
            font-size: 0.875rem;
          }

          .filter-chip:hover {
            border-color: #007bff;
            background: #f8f9fa;
          }

          .filter-chip.active {
            border-color: #007bff;
            background: #007bff;
            color: white;
          }

          .filter-chip.priority-baja.active {
            background: #28a745;
            border-color: #28a745;
          }

          .filter-chip.priority-media.active {
            background: #ffc107;
            border-color: #ffc107;
            color: #212529;
          }

          .filter-chip.priority-alta.active {
            background: #ff5722;
            border-color: #ff5722;
          }

          .filter-chip.priority-critica.active {
            background: #dc3545;
            border-color: #dc3545;
          }

          .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: capitalize;
          }

          .status-badge.status-pendiente {
            background: #fff3cd;
            color: #856404;
          }

          .status-badge.status-pagado {
            background: #d4edda;
            color: #155724;
          }

          .status-badge.status-vencido {
            background: #f8d7da;
            color: #721c24;
          }

          .status-badge.status-apelada {
            background: #d1ecf1;
            color: #0c5460;
          }

          .status-badge.status-anulada {
            background: #e2e3e5;
            color: #383d41;
          }

          .priority-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: capitalize;
          }

          .priority-badge.priority-baja {
            background: #28a745;
            color: white;
          }

          .priority-badge.priority-media {
            background: #ffc107;
            color: #212529;
          }

          .priority-badge.priority-alta {
            background: #ff5722;
            color: white;
          }

          .priority-badge.priority-critica {
            background: #dc3545;
            color: white;
          }

          .fine-card {
            background: white;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .fine-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1rem;
          }

          .fine-number {
            font-weight: 700;
            font-size: 1.1rem;
            color: #212529;
          }

          .fine-unit {
            font-weight: 600;
            color: #6c757d;
          }

          .fine-owner {
            margin-top: 0.25rem;
          }

          .fine-violation {
            color: #495057;
            margin: 0.5rem 0;
          }

          .fine-amount {
            font-weight: 700;
            font-size: 1.25rem;
            color: #28a745;
          }

          @media (max-width: 768px) {
            .filter-chip {
              font-size: 0.75rem;
              padding: 0.4rem 0.8rem;
            }
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}