import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useCallback } from 'react';

import Layout from '@/components/layout/Layout';
import ModernPagination from '@/components/ui/ModernPagination';
import PageHeader from '@/components/ui/PageHeader';
import multasService from '@/lib/multasService';
import { useAuth } from '@/lib/useAuth';
import { usePermissions, Permission } from '@/lib/usePermissions';
import { TipoInfraccion } from '@/types/multas';

const MultasListadoPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  // Data states
  const [multas, setMultas] = useState([]);
  const [tiposInfraccion, setTiposInfraccion] = useState<TipoInfraccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filtros, setFiltros] = useState({
    estado: '',
    prioridad: '',
    busqueda: '',
    fechaDesde: '',
    fechaHasta: '',
    tipoInfraccion: '',
    unidad: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Pagination & Selection
  const [selectedFines, setSelectedFines] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    totalPendiente: 0,
    totalVencido: 0,
    countPendientes: 0,
    countVencidas: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load types for filter
      const tipos = await multasService.obtenerTipos(user?.comunidad_id);
      setTiposInfraccion(tipos);

      // Load fines
      const queryParams = {
        ...filtros,
        pagina: currentPage,
        comunidad_id: user?.comunidad_id,
      };
      
      const response = await multasService.getMultas(queryParams);
      const data = response.data || [];
      setMultas(data);
      setTotalPages(response.totalPaginas || 1);
      setTotalItems(data.length); // Ideally backend returns total count

      // Calculate stats (mocked for now, ideally from backend)
      const newStats = data.reduce((acc: any, curr: any) => {
        if (curr.estado === 'pendiente') {
          acc.totalPendiente += curr.monto;
          acc.countPendientes++;
        }
        if (curr.estado === 'vencido') {
          acc.totalVencido += curr.monto;
          acc.countVencidas++;
        }
        return acc;
      }, { totalPendiente: 0, totalVencido: 0, countPendientes: 0, countVencidas: 0 });
      setStats(newStats);

    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error loading data:', err);
      setError('Error al cargar la información. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filtros, user?.comunidad_id]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [loadData, user]);

  const handleFiltroChange = (key: string, value: string) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFiltros({
      estado: '',
      prioridad: '',
      busqueda: '',
      fechaDesde: '',
      fechaHasta: '',
      tipoInfraccion: '',
      unidad: '',
    });
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFines(multas.map((m: any) => m.id));
    } else {
      setSelectedFines([]);
    }
  };

  const handleSelectFine = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedFines(prev => [...prev, id]);
    } else {
      setSelectedFines(prev => prev.filter(f => f !== id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (!window.confirm(`¿Está seguro de realizar esta acción en ${selectedFines.length} elementos?`)) { return; }
    
    try {
      if (action === 'delete') {
        await Promise.all(selectedFines.map(id => multasService.deleteMulta(Number(id))));
      } else if (action === 'cancel') {
        await Promise.all(selectedFines.map(id => multasService.anularMulta(Number(id), 'Anulación masiva')));
      }
      setSelectedFines([]);
      loadData();
    } catch (err) {
      alert('Error al procesar la acción masiva');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pendiente': return 'status-pending';
      case 'pagado': return 'status-paid';
      case 'vencido': return 'status-overdue';
      case 'apelada': return 'status-appealed';
      case 'anulada': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  return (
    <Layout title="Gestión de Multas">
      <div className="multas-page">
        <PageHeader
          title="Gestión de Multas"
          subtitle="Administración y control de infracciones"
          icon="gavel"
          primaryAction={
            (hasPermission(Permission.MANAGE_MULTAS) || hasPermission(Permission.VIEW_MULTA)) ? {
              label: 'Nueva Multa',
              icon: 'add',
              href: '/multas-nueva',
              onClick: () => router.push('/multas-nueva'),
            } : undefined
          }
          stats={[
            {
              label: 'Por Cobrar',
              value: formatCurrency(stats.totalPendiente),
              icon: 'account_balance_wallet',
              color: 'warning',
            },
            {
              label: 'Multas Vencidas',
              value: stats.countVencidas.toString(),
              icon: 'warning',
              color: 'danger',
            },
            {
              label: 'Pendientes',
              value: stats.countPendientes.toString(),
              icon: 'pending_actions',
              color: 'info',
            },
          ]}
        />

        <div className="content-card">
          {/* Toolbar & Search */}
          <div className="toolbar">
            <div className="search-container">
              <span className="material-icons search-icon">search</span>
              <input
                type="text"
                placeholder="Buscar por unidad, residente o número..."
                value={filtros.busqueda}
                onChange={e => handleFiltroChange('busqueda', e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="actions-container">
              <button 
                className={`btn-filter ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="material-icons">filter_list</span>
                Filtros
              </button>
              
              {selectedFines.length > 0 && (
                <div className="bulk-actions">
                  <span className="selected-count">{selectedFines.length} seleccionados</span>
                  <button className="btn-icon" onClick={() => handleBulkAction('cancel')} title="Anular">
                    <span className="material-icons">block</span>
                  </button>
                  <button className="btn-icon delete" onClick={() => handleBulkAction('delete')} title="Eliminar">
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="filters-panel">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Estado</label>
                  <select 
                    className="form-select"
                    value={filtros.estado}
                    onChange={e => handleFiltroChange('estado', e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="pagado">Pagado</option>
                    <option value="vencido">Vencido</option>
                    <option value="apelada">Apelada</option>
                    <option value="anulada">Anulada</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Prioridad</label>
                  <select 
                    className="form-select"
                    value={filtros.prioridad}
                    onChange={e => handleFiltroChange('prioridad', e.target.value)}
                  >
                    <option value="">Todas</option>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Tipo Infracción</label>
                  <select 
                    className="form-select"
                    value={filtros.tipoInfraccion}
                    onChange={e => handleFiltroChange('tipoInfraccion', e.target.value)}
                  >
                    <option value="">Todos</option>
                    {tiposInfraccion.map((tipo: any) => (
                      <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Unidad</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Ej: 101"
                    value={filtros.unidad}
                    onChange={e => handleFiltroChange('unidad', e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Desde</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={filtros.fechaDesde}
                    onChange={e => handleFiltroChange('fechaDesde', e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Hasta</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={filtros.fechaHasta}
                    onChange={e => handleFiltroChange('fechaHasta', e.target.value)}
                  />
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <button className="btn btn-link text-decoration-none p-0" onClick={clearFilters}>
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      className="form-check-input"
                      onChange={e => handleSelectAll(e.target.checked)}
                      checked={multas.length > 0 && selectedFines.length === multas.length}
                    />
                  </th>
                  <th>Multa</th>
                  <th>Unidad</th>
                  <th>Infracción</th>
                  <th>Monto</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </td>
                  </tr>
                ) : multas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-5 text-muted">
                      <div className="d-flex flex-column align-items-center">
                        <span className="material-icons fs-1 mb-2">assignment_late</span>
                        <p className="mb-0">No se encontraron multas con los filtros seleccionados</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  multas.map((multa: any) => (
                    <tr key={multa.id} className={selectedFines.includes(multa.id) ? 'table-active' : ''}>
                      <td>
                        <input 
                          type="checkbox" 
                          className="form-check-input"
                          checked={selectedFines.includes(multa.id)}
                          onChange={e => handleSelectFine(multa.id, e.target.checked)}
                        />
                      </td>
                      <td>
                        <Link href={`/multas/${multa.id}`} className="fw-bold text-decoration-none text-dark">
                          #{multa.numero}
                        </Link>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {multa.unidad_numero}
                        </span>
                      </td>
                      <td>{multa.tipo_infraccion}</td>
                      <td className="fw-medium">{formatCurrency(multa.monto)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="material-icons fs-6 text-muted">event</span>
                          {new Date(multa.fecha_vencimiento).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(multa.estado)}`}>
                          {multa.estado}
                        </span>
                      </td>
                      <td>
                        <span className={`priority-badge priority-${multa.prioridad}`}>
                          {multa.prioridad}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-1">
                          <button 
                            className="btn-icon" 
                            onClick={() => router.push(`/multas/${multa.id}`)}
                            title="Ver detalle"
                          >
                            <span className="material-icons">visibility</span>
                          </button>
                          <button 
                            className="btn-icon" 
                            onClick={() => router.push(`/multas/${multa.id}/editar`)}
                            title="Editar"
                          >
                            <span className="material-icons">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-top">
            <ModernPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={page => setCurrentPage(page)}
              totalItems={totalItems}
              itemsPerPage={10}
              itemName="multas"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .multas-page {
          padding: 1.5rem;
        }

        .content-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e9ecef;
          margin-top: 2rem;
          overflow: hidden;
        }

        .toolbar {
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-container {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #adb5bd;
        }

        .search-input {
          width: 100%;
          padding: 0.6rem 1rem 0.6rem 2.5rem;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #2a5298;
          box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
        }

        .actions-container {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .btn-filter {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          border: 1px solid #dee2e6;
          background: white;
          border-radius: 8px;
          color: #495057;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-filter:hover, .btn-filter.active {
          background: #f8f9fa;
          border-color: #adb5bd;
          color: #212529;
        }

        .filters-panel {
          background: #f8f9fa;
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }

        .bulk-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #e3f2fd;
          padding: 0.25rem 0.5rem 0.25rem 1rem;
          border-radius: 8px;
          color: #0d47a1;
        }

        .selected-count {
          font-size: 0.85rem;
          font-weight: 600;
          margin-right: 0.5rem;
        }

        .table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #495057;
          padding: 1rem;
          border-bottom: 2px solid #e9ecef;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          vertical-align: middle;
        }

        .table td {
          padding: 1rem;
          vertical-align: middle;
          color: #212529;
          border-bottom: 1px solid #e9ecef;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid #dee2e6;
          background: white;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #f8f9fa;
          color: #2a5298;
          border-color: #2a5298;
        }

        .btn-icon.delete:hover {
          background: #fee2e2;
          color: #dc3545;
          border-color: #dc3545;
        }

        .btn-icon .material-icons {
          font-size: 18px;
        }

        /* Badges Styles */
        .status-badge {
          padding: 0.4rem 0.8rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 90px;
          text-transform: capitalize;
        }

        .status-pending {
          background-color: #fffde7;
          color: #0d47a1;
        }

        .status-paid {
          background-color: #4caf50;
          color: white;
        }

        .status-overdue {
          background-color: #ffebee;
          color: #b71c1c;
        }

        .status-appealed {
          background-color: #e3f2fd;
          color: #0d47a1;
        }

        .status-cancelled {
          background-color: #fafafa;
          color: #616161;
        }

        .priority-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .priority-low {
          background-color: #fafafa;
          color: #616161;
        }

        .priority-medium {
          background-color: #fffde7;
          color: #b78103;
        }

        .priority-high {
          background-color: #ffebee;
          color: #b71c1c;
        }
        
        .priority-critica {
          background-color: #ffebee;
          color: #b71c1c;
          border: 1px solid #ffcdd2;
        }
      `}</style>
    </Layout>
  );
};

export default MultasListadoPage;
