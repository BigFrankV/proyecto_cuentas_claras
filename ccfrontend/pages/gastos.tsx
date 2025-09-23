import React, { useState, useEffect, useMemo } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { toast } from 'react-hot-toast';

// Hooks
import { useAuth } from '../lib/useAuth';
import { useGastos, useGasto, useGastoActions, useGastoEstadisticas } from '../hooks/useGastos';

// Services
import { gastosService } from '../lib/gastosService';

// Types
import type { Gasto, CategoriaGasto } from '../types/gastos';

const GastosPage: NextPage = () => {
  const { user } = useAuth();
  const [comunidadId] = useState(1); // TODO: Obtener de contexto o URL

  // Estados del componente
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Gastos seleccionados
  const [selectedGasto, setSelectedGasto] = useState<Gasto | null>(null);

  // Hooks personalizados
  const {
    gastos,
    loading: gastosLoading,
    error: gastosError,
    pagination,
    filters,
    updateFilters,
    refetch: refetchGastos
  } = useGastos(comunidadId);

  const { 
    estadisticas, 
    loading: statsLoading 
  } = useGastoEstadisticas(comunidadId);

  const {
    loading: actionLoading,
    aprobarGasto,
    rechazarGasto,
    eliminarGasto
  } = useGastoActions();

  // Cargar categorías
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        setCategoriesLoading(true);
        const data = await gastosService.getCategorias(comunidadId);
        setCategorias(data);
      } catch (error: any) {
        console.error('Error loading categories:', error);
        toast.error('Error al cargar categorías');
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategorias();
  }, [comunidadId]);

  // Permisos del usuario
  const userRole = user?.rol || 'residente';
  const canCreate = ['admin', 'contador'].includes(userRole);
  const canApprove = ['admin', 'comite'].includes(userRole);
  const canEdit = ['admin', 'contador'].includes(userRole);

  // Helper para obtener clase de estado
  const getStatusClass = (estado: string) => {
    const statusClasses = {
      borrador: 'status-badge',
      pendiente_aprobacion: 'status-badge status-pending',
      aprobado: 'status-badge status-approved',
      rechazado: 'status-badge status-rejected',
      pagado: 'status-badge status-paid',
      anulado: 'status-badge'
    };
    return statusClasses[estado as keyof typeof statusClasses] || 'status-badge';
  };

  // Helper para obtener clase de categoría
  const getCategoryClass = (categoria: string) => {
    const categoryClasses = {
      mantenimiento: 'category-badge category-mantenimiento',
      servicios: 'category-badge category-servicios',
      personal: 'category-badge category-personal',
      suministros: 'category-badge category-suministros',
      impuestos: 'category-badge category-impuestos',
      seguros: 'category-badge category-seguros'
    };
    return categoryClasses[categoria.toLowerCase() as keyof typeof categoryClasses] || 'category-badge';
  };

  // Helper para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  // Helper para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  // Handlers
  const handleViewGasto = (gasto: Gasto) => {
    window.location.href = `/gasto-detalle?id=${gasto.id}`;
  };

  const handleCreateGasto = () => {
    window.location.href = '/gasto-nuevo';
  };

  return (
    <>
      <Head>
        <title>Listado de Gastos - Cuentas Claras</title>
        <meta name="description" content="Gestiona los gastos de tu comunidad" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <style jsx>{`
          /* Status badges */
          .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 500;
            letter-spacing: 0.01em;
            background-color: #f8f9fa;
            color: #495057;
          }
          
          .status-pending {
            background-color: #FFF8E1;
            color: #F57F17;
          }
          
          .status-approved {
            background-color: #E8F5E9;
            color: #2E7D32;
          }
          
          .status-rejected {
            background-color: #FFEBEE;
            color: #C62828;
          }
          
          .status-paid {
            background-color: #E3F2FD;
            color: #1565C0;
          }
          
          /* Category badges */
          .category-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 500;
            letter-spacing: 0.01em;
            background-color: #f0f0f0;
            color: #444;
          }
          
          .category-mantenimiento {
            background-color: #E8F5E9;
            color: #2E7D32;
          }
          
          .category-servicios {
            background-color: #E3F2FD;
            color: #1565C0;
          }
          
          .category-personal {
            background-color: #F3E5F5;
            color: #7B1FA2;
          }
          
          .category-suministros {
            background-color: #FFF8E1;
            color: #F57F17;
          }
          
          /* Filters panel */
          .filters-panel {
            background-color: #fff;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            margin-bottom: 1rem;
          }
          
          .filter-chip {
            display: inline-flex;
            align-items: center;
            background-color: #f0f0f0;
            border-radius: 16px;
            padding: 0.25rem 0.75rem;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
            font-size: 0.85rem;
          }
          
          .filter-chip .material-icons {
            font-size: 16px;
            margin-left: 0.25rem;
            cursor: pointer;
          }
          
          /* Table and Card styles */
          .data-row { 
            cursor: pointer; 
            transition: all 0.2s; 
          }
          
          .data-row:hover { 
            background-color: rgba(0, 0, 0, 0.03); 
          }
          
          .data-card {
            background-color: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            transition: all 0.2s ease-in-out;
            margin-bottom: 1rem;
            cursor: pointer;
          }
          
          .data-card:hover {
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }
          
          /* Mobile fab */
          .mobile-fab {
            position: fixed;
            bottom: 1.5rem;
            right: 1.5rem;
            z-index: 999;
          }
          
          .mobile-fab .btn {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          }
          
          /* View options */
          .view-options .btn-group .btn { 
            border-radius: 0; 
          }
          
          .view-options .btn-group .btn:first-child { 
            border-top-left-radius: 4px; 
            border-bottom-left-radius: 4px; 
          }
          
          .view-options .btn-group .btn:last-child { 
            border-top-right-radius: 4px; 
            border-bottom-right-radius: 4px; 
          }
        `}</style>
      </Head>

      <div className="container-fluid mb-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Gastos</h4>
          {canCreate && (
            <button 
              onClick={handleCreateGasto}
              className="btn btn-primary d-none d-md-inline-block"
            >
              <span className="material-icons align-middle me-1">add</span>
              <span>Nuevo Gasto</span>
            </button>
          )}
        </div>
        
        {/* Filters and view options */}
        <div className="row g-3 mb-4">
          {/* Search bar */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <span className="material-icons text-muted" style={{fontSize: '20px'}}>search</span>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Buscar gastos..."
                value={filters.busqueda || ''}
                onChange={(e) => updateFilters({ busqueda: e.target.value })}
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="col-12 col-md-6 col-lg-4 d-flex">
            <button 
              type="button" 
              className="btn btn-outline-secondary me-2 flex-grow-1"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span className="material-icons align-middle me-1">filter_list</span>
              <span>Filtros</span>
            </button>
            
            <button type="button" className="btn btn-outline-secondary me-2">
              <span className="material-icons align-middle">date_range</span>
            </button>
            
            <div className="dropdown">
              <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <span className="material-icons align-middle">sort</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><h6 className="dropdown-header">Ordenar por</h6></li>
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={() => updateFilters({ ordenar: 'fecha', direccion: 'DESC' })}
                  >
                    Fecha (más reciente)
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item"
                    onClick={() => updateFilters({ ordenar: 'fecha', direccion: 'ASC' })}
                  >
                    Fecha (más antigua)
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item"
                    onClick={() => updateFilters({ ordenar: 'monto', direccion: 'DESC' })}
                  >
                    Monto (mayor a menor)
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item"
                    onClick={() => updateFilters({ ordenar: 'monto', direccion: 'ASC' })}
                  >
                    Monto (menor a mayor)
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          {/* View options */}
          <div className="col-12 col-lg-4 d-flex justify-content-lg-end">
            <div className="view-options btn-group" role="group">
              <input 
                type="radio" 
                className="btn-check" 
                name="viewOptions" 
                id="viewTable" 
                checked={viewMode === 'table'}
                onChange={() => setViewMode('table')}
              />
              <label className="btn btn-outline-secondary" htmlFor="viewTable">
                <span className="material-icons align-middle">view_list</span>
              </label>
              
              <input 
                type="radio" 
                className="btn-check" 
                name="viewOptions" 
                id="viewGrid"
                checked={viewMode === 'grid'}
                onChange={() => setViewMode('grid')}
              />
              <label className="btn btn-outline-secondary" htmlFor="viewGrid">
                <span className="material-icons align-middle">grid_view</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Active Filters */}
        {showFilters && (
          <div className="filters-panel">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Filtros aplicados</h6>
              <button 
                type="button" 
                className="btn btn-sm btn-link"
                onClick={() => updateFilters({
                  busqueda: '',
                  estado: '',
                  categoria: undefined,
                  fechaDesde: '',
                  fechaHasta: ''
                })}
              >
                Limpiar filtros
              </button>
            </div>
            <div>
              {filters.categoria && (
                <div className="filter-chip">
                  Categoría: {categorias.find(c => c.id === filters.categoria)?.nombre}
                  <span 
                    className="material-icons"
                    onClick={() => updateFilters({ categoria: undefined })}
                  >
                    close
                  </span>
                </div>
              )}
              {filters.estado && (
                <div className="filter-chip">
                  Estado: {filters.estado}
                  <span 
                    className="material-icons"
                    onClick={() => updateFilters({ estado: '' })}
                  >
                    close
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error state */}
        {gastosError && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <span className="material-icons me-2">error</span>
            <div>
              <strong>Error</strong>
              <p className="mb-0">{gastosError}</p>
              <button 
                className="btn btn-link p-0 mt-1"
                onClick={refetchGastos}
              >
                Reintentar
              </button>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {gastosLoading && (
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!gastosLoading && (
          <>
            {/* Table View */}
            {viewMode === 'table' && (
              <div className="mb-4">
                <div className="card">
                  <div className="card-body p-0">
                    {gastos.length === 0 ? (
                      <div className="text-center py-5">
                        <div className="mb-3">
                          <span className="material-icons" style={{fontSize: '4rem', color: '#6c757d'}}>
                            receipt_long
                          </span>
                        </div>
                        <h5 className="text-muted">No hay gastos registrados</h5>
                        <p className="text-muted">Comienza creando tu primer gasto para la comunidad.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th scope="col">Descripción</th>
                              <th scope="col">Categoría</th>
                              <th scope="col">Fecha</th>
                              <th scope="col" className="text-end">Monto</th>
                              <th scope="col">Estado</th>
                              <th scope="col" className="text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gastos.map((gasto) => (
                              <tr 
                                key={gasto.id} 
                                className="data-row"
                                onClick={() => handleViewGasto(gasto)}
                              >
                                <td>
                                  <div className="fw-medium">{gasto.glosa}</div>
                                  <div className="small text-muted">#{gasto.numero}</div>
                                </td>
                                <td>
                                  <span className={getCategoryClass(gasto.categoria_tipo)}>
                                    {gasto.categoria_nombre}
                                  </span>
                                </td>
                                <td>{formatDate(gasto.fecha)}</td>
                                <td className="text-end">
                                  <span className="fw-medium">
                                    {formatCurrency(gasto.monto)}
                                  </span>
                                </td>
                                <td>
                                  <span className={getStatusClass(gasto.estado)}>
                                    {gasto.estado.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="text-center">
                                  <div className="d-flex justify-content-center">
                                    <button 
                                      className="btn btn-sm btn-link p-0 me-2" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewGasto(gasto);
                                      }}
                                    >
                                      <span className="material-icons">visibility</span>
                                    </button>
                                    {canEdit && gasto.estado === 'borrador' && (
                                      <button 
                                        className="btn btn-sm btn-link p-0 me-2"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <span className="material-icons">edit</span>
                                      </button>
                                    )}
                                    {canApprove && (
                                      <button 
                                        className="btn btn-sm btn-link text-danger p-0"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <span className="material-icons">delete</span>
                                      </button>
                                    )}
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
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="mb-4">
                {gastos.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-3">
                      <span className="material-icons" style={{fontSize: '4rem', color: '#6c757d'}}>
                        receipt_long
                      </span>
                    </div>
                    <h5 className="text-muted">No hay gastos registrados</h5>
                    <p className="text-muted">Comienza creando tu primer gasto para la comunidad.</p>
                  </div>
                ) : (
                  <div className="row">
                    {gastos.map((gasto) => (
                      <div key={gasto.id} className="col-12 col-md-6 col-lg-4">
                        <div 
                          className="data-card"
                          onClick={() => handleViewGasto(gasto)}
                        >
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <div className="fw-medium">{gasto.glosa}</div>
                                <div className="small text-muted">#{gasto.numero}</div>
                              </div>
                              <span className={getStatusClass(gasto.estado)}>
                                {gasto.estado.replace('_', ' ')}
                              </span>
                            </div>
                            
                            <div className="d-flex flex-wrap gap-3 mb-3">
                              <div className="d-flex align-items-center">
                                <span className="material-icons me-1 small">category</span>
                                <span className="small">{gasto.categoria_nombre}</span>
                              </div>
                              <div className="d-flex align-items-center">
                                <span className="material-icons me-1 small">today</span>
                                <span className="small">{formatDate(gasto.fecha)}</span>
                              </div>
                              <div className="d-flex align-items-center">
                                <span className="material-icons me-1 small">payments</span>
                                <span className="small fw-medium">{formatCurrency(gasto.monto)}</span>
                              </div>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center border-top pt-3">
                              <div className="d-flex align-items-center">
                                <span className="material-icons me-1 small">account_circle</span>
                                <span className="small">{gasto.creado_por_nombre}</span>
                              </div>
                              <div className="d-flex">
                                {canEdit && gasto.estado === 'borrador' && (
                                  <button 
                                    className="btn btn-outline-secondary btn-sm me-1"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{padding: '0.125rem 0.25rem'}}
                                  >
                                    <span className="material-icons small">edit</span>
                                  </button>
                                )}
                                {canApprove && (
                                  <button 
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{padding: '0.125rem 0.25rem'}}
                                  >
                                    <span className="material-icons small">delete</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        
        {/* Pagination */}
        {!gastosLoading && gastos.length > 0 && (
          <nav aria-label="Paginación de gastos">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => updateFilters({ page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  <span className="material-icons align-middle">chevron_left</span>
                </button>
              </li>
              
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <li key={page} className={`page-item ${pagination.page === page ? 'active' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => updateFilters({ page })}
                    >
                      {page}
                    </button>
                  </li>
                );
              })}
              
              <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => updateFilters({ page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                >
                  <span className="material-icons align-middle">chevron_right</span>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
      
      {/* Mobile floating action button */}
      {canCreate && (
        <div className="mobile-fab d-lg-none">
          <button 
            onClick={handleCreateGasto}
            className="btn btn-primary shadow"
          >
            <span className="material-icons">add</span>
          </button>
        </div>
      )}

      <script 
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
        async
      />
    </>
  );
};

export default GastosPage;