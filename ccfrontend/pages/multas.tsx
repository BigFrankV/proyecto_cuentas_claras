import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import { ProtectedRoute, useAuth } from '../lib/useAuth';
import multasService from '../lib/multasService';
import { Multa, MultaFiltros, MultasEstadisticas } from '../types/multas';
import Head from 'next/head';
import Link from 'next/link';

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
    const matchesSearch = !searchTerm || 
      multa.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      multa.tipo_infraccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      multa.unidad_numero?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
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
    const labels = {
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

  // Handlers para las acciones
  const handleRegistrarPago = (multaId: number) => {
    // Por ahora solo mostrar alert, después se puede implementar modal
    alert(`Función de registrar pago para multa ${multaId} - En desarrollo`);
    // TODO: Implementar modal o página para registrar pago
  };

  const handleEditar = (multaId: number) => {
    router.push(`/multas/${multaId}/editar`);
  };

  const handleEnviarRecordatorio = (multaId: number) => {
    // Por ahora solo mostrar alert, después se puede implementar
    alert(`Enviando recordatorio para multa ${multaId} - En desarrollo`);
    // TODO: Implementar envío de notificación
  };

  const handleAnular = async (multaId: number) => {
    const multa = multas.find(m => m.id === multaId);
    if (!multa) return;
    
    const motivo = window.prompt(
      `¿Está seguro que desea anular la multa ${multa.numero}?\n\nIngrese el motivo de anulación (opcional):`,
      ''
    );
    
    if (motivo === null) return;
    
    try {
      console.log(`🚫 Anulando multa ${multaId} con motivo:`, motivo);
      
      await multasService.anularMulta(multaId, motivo || undefined);
      
      alert(`✅ Multa ${multa.numero} anulada exitosamente`);
      
      // Recargar los datos
      await loadData();
      
    } catch (error) {
      console.error('Error anulando multa:', error);
      alert('❌ Error al anular la multa. Intente nuevamente.');
    }
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
                <button className="btn btn-outline-primary">
                  <span className="material-icons me-1">checklist</span>
                  Acciones ({multasSeleccionadas.length})
                </button>
              )}
              <button className="btn btn-outline-secondary">
                <span className="material-icons me-1">file_download</span>
                Exportar
              </button>
              <Link href="/multas/nueva" className="btn btn-primary">
                <span className="material-icons me-1">add</span>
                Nueva Multa
              </Link>
            </div>
          </div>

          {/* Filtros */}
          <div className="filters-panel">
            <div className="d-flex flex-wrap align-items-center justify-content-between">
              <div className="d-flex flex-wrap">
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
              
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar multas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '250px' }}
                />
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

          {/* Mobile cards */}
          <div className="mobile-cards d-lg-none">
            {multasFiltradas.map(multa => (
              <div key={multa.id} className={`fine-card ${multa.estado}`}>
                <div className="fine-header">
                  <div className="flex-grow-1">
                    <div className="fine-number">#{multa.numero}</div>
                    <div className="fine-unit">{multa.unidad_numero}</div>
                    <div className="fine-violation">{multa.tipo_infraccion}</div>
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
                    <div className="fine-amount">{multasService.formatearMonto(multa.monto)}</div>
                    <small className="text-muted">
                      Vence: {new Date(multa.fecha_vencimiento).toLocaleDateString('es-CL')}
                    </small>
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => router.push(`/multas/${multa.id}`)}
                  >
                    Ver Detalle
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleRegistrarPago(multa.id)}
                  >
                    Registrar Pago
                  </button>
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
                    <th>
                      <input 
                        type="checkbox" 
                        className="form-check-input"
                        checked={multasSeleccionadas.length === multasFiltradas.length && multasFiltradas.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Multa</th>
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
                        <div className="fw-bold">#{multa.numero}</div>
                        <small className="text-muted">ID: {multa.id}</small>
                      </td>
                      <td>
                        <div className="fw-bold">{multa.unidad_numero}</div>
                        <small className="text-muted">{multa.propietario_nombre || 'Sin propietario'}</small>
                      </td>
                      <td>{multa.tipo_infraccion}</td>
                      <td className="fw-bold">{multasService.formatearMonto(multa.monto)}</td>
                      <td>{new Date(multa.fecha_infraccion).toLocaleDateString('es-CL')}</td>
                      <td>
                        {new Date(multa.fecha_vencimiento).toLocaleDateString('es-CL')}
                        {multasService.estaVencida(multa.fecha_vencimiento) && (
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
                        <div className="dropdown">
                          <button 
                            className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                            data-bs-toggle="dropdown"
                          >
                            Acciones
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button 
                                className="dropdown-item"
                                onClick={() => router.push(`/multas/${multa.id}`)}
                              >
                                <span className="material-icons me-2">visibility</span>
                                Ver Detalle
                              </button>
                            </li>
                            <li>
                              <button 
                                className="dropdown-item"
                                onClick={() => handleRegistrarPago(multa.id)}
                              >
                                <span className="material-icons me-2">payment</span>
                                Registrar Pago
                              </button>
                            </li>
                            <li>
                              <button 
                                className="dropdown-item"
                                onClick={() => handleEditar(multa.id)}
                                disabled={multa.estado === 'anulada'}
                              >
                                <span className="material-icons me-2">edit</span>
                                Editar
                              </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button 
                                className="dropdown-item"
                                onClick={() => handleEnviarRecordatorio(multa.id)}
                              >
                                <span className="material-icons me-2">email</span>
                                Enviar Recordatorio
                              </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button 
                                className="dropdown-item text-danger"
                                onClick={() => handleAnular(multa.id)}
                                disabled={multa.estado === 'anulada'}
                              >
                                <span className="material-icons me-2">cancel</span>
                                Anular Multa
                              </button>
                            </li>
                          </ul>
                        </div>
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
                {filtroActivo === 'all' ? 'No hay multas creadas aún' : `No hay multas con estado "${getFiltroLabel(filtroActivo)}"`}
              </p>
              {filtroActivo === 'all' && (
                <Link href="/multas/nueva" className="btn btn-primary">
                  <span className="material-icons me-2">add</span>
                  Crear Primera Multa
                </Link>
              )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}