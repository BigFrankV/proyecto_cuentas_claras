import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  EmissionFilters,
  ViewControls,
  EmissionCard,
  EmissionRow,
  Emission,
  EmissionFilters as EmissionFiltersType
} from '@/components/emisiones';
import emisionesService from '@/lib/emisionesService';
import { EmissionListResponse } from '@/types/emisiones';

export default function EmisionesListado() {
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'table' | 'cards'>('table');
  const [selectedEmissions, setSelectedEmissions] = useState<string[]>([]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Filtros actuales
  const [currentFilters, setCurrentFilters] = useState<EmissionFiltersType>({
    search: '',
    status: 'all',
    type: 'all',
    period: 'all',
    dateFrom: '',
    dateTo: '',
    community: 'all'
  });

  // Cargar datos de la API
  const loadEmissions = async (page: number = 1, filters: EmissionFiltersType = currentFilters) => {
    try {
      setLoading(true);
      const apiFilters: any = {};

      if (filters.search) apiFilters.search = filters.search;
      if (filters.status !== 'all') apiFilters.status = filters.status;
      if (filters.type !== 'all') apiFilters.type = filters.type;
      if (filters.period !== 'all') apiFilters.period = filters.period;
      if (filters.dateFrom) apiFilters.dateFrom = filters.dateFrom;
      if (filters.dateTo) apiFilters.dateTo = filters.dateTo;
      if (filters.community) apiFilters.communityId = parseInt(filters.community);

      const response: EmissionListResponse = await emisionesService.getEmissions(
        apiFilters,
        page,
        itemsPerPage
      );

      setEmissions(response.data);
      setTotalPages(response.pagination.pages);
      setTotalItems(response.pagination.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading emissions:', error);
      // En caso de error, mostrar lista vacía
      setEmissions([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmissions();
  }, []);

  // Manejar filtros
  const handleFilterChange = (filters: EmissionFiltersType) => {
    setCurrentFilters(filters);
    loadEmissions(1, filters);
  };

  const handleClearFilters = () => {
    const defaultFilters: EmissionFiltersType = {
      search: '',
      status: 'all',
      type: 'all',
      period: 'all',
      dateFrom: '',
      dateTo: '',
      community: 'all'
    };
    setCurrentFilters(defaultFilters);
    loadEmissions(1, defaultFilters);
  };

  // Manejar selección
  const handleSelectEmission = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedEmissions([...selectedEmissions, id]);
    } else {
      setSelectedEmissions(selectedEmissions.filter(emId => emId !== id));
    }
  };

  const handleSelectAll = () => {
    const allSelected = emissions.every((emission: Emission) =>
      selectedEmissions.includes(emission.id)
    );

    if (allSelected) {
      // Deseleccionar todos
      setSelectedEmissions([]);
    } else {
      // Seleccionar todos de la página actual
      const pageIds = emissions.map((emission: Emission) => emission.id);
      setSelectedEmissions(pageIds);
    }
  };

  const handleDeselectAll = () => {
    setSelectedEmissions([]);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Acción masiva: ${action}`, selectedEmissions);
    // Implementar acciones masivas aquí
    alert(`Acción "${action}" aplicada a ${selectedEmissions.length} emisiones`);
  };

  // Paginación
  const handlePageChange = (page: number) => {
    loadEmissions(page, currentFilters);
  };

  // Render paginación
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <nav className='d-flex justify-content-center mt-4'>
        <ul className='pagination'>
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className='page-link'
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className='material-icons'>chevron_left</i>
            </button>
          </li>
          
          {startPage > 1 && (
            <>
              <li className='page-item'>
                <button className='page-link' onClick={() => handlePageChange(1)}>
                  1
                </button>
              </li>
              {startPage > 2 && (
                <li className='page-item disabled'>
                  <span className='page-link'>...</span>
                </li>
              )}
            </>
          )}

          {pages.map(page => (
            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
              <button
                className='page-link'
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            </li>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <li className='page-item disabled'>
                  <span className='page-link'>...</span>
                </li>
              )}
              <li className='page-item'>
                <button className='page-link' onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </button>
              </li>
            </>
          )}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className='page-link'
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <i className='material-icons'>chevron_right</i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Emisiones'>
          <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '400px' }}>
            <div className='text-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='mt-2 text-muted'>Cargando emisiones...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Emisiones — Cuentas Claras</title>
      </Head>

      <Layout title='Emisiones'>
        <div className='container-fluid p-4'>
          {/* Header */}
          <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3'>
            <div>
              <h1 className='h2 mb-1'>
                <i className='fa-solid fa-file-invoice-dollar me-2'></i>
                Emisiones
              </h1>
              <p className='text-muted mb-0'>Gestión de emisiones de gastos comunes y extraordinarias</p>
            </div>
            <div className='d-flex gap-2'>
              <div className='btn-group'>
                <button className='btn btn-outline-secondary'>
                  <i className='material-icons me-2'>print</i>
                  Imprimir
                </button>
                <button className='btn btn-outline-secondary'>
                  <i className='material-icons me-2'>file_download</i>
                  Exportar
                </button>
              </div>
              <Link href='/emisiones/nueva' className='btn btn-primary'>
                <i className='material-icons me-2'>add</i>
                Nueva Emisión
              </Link>
            </div>
          </div>

          {/* Filtros */}
          <EmissionFilters
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          {/* Controles de vista */}
          <ViewControls
            currentView={currentView}
            onViewChange={setCurrentView}
            totalItems={totalItems}
            selectedItems={selectedEmissions.length}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onBulkAction={handleBulkAction}
          />

          {/* Vista de tabla */}
          {currentView === 'table' && (
            <div className='table-view'>
              <div className='table-responsive rounded'>
                <table className='table table-striped table-hover table-sm align-middle'>
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>
                        <div className='form-check'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            checked={emissions.length > 0 &&
                              emissions.every((emission: Emission) =>
                                selectedEmissions.includes(emission.id)
                              )}
                            onChange={handleSelectAll}
                          />
                        </div>
                      </th>
                      <th>Período</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                      <th>F. Emisión</th>
                      <th>F. Vencimiento</th>
                      <th>Unidades</th>
                      <th>Monto Total</th>
                      <th>Monto Pagado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emissions.map((emission: Emission) => (
                      <EmissionRow
                        key={emission.id}
                        emission={emission}
                        selected={selectedEmissions.includes(emission.id)}
                        onSelect={handleSelectEmission}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vista de cards */}
          {currentView === 'cards' && (
            <div className='cards-view'>
              <div className='row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4'>
                {emissions.map((emission: Emission) => (
                  <div key={emission.id} className='col'>
                    <EmissionCard emission={emission} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {emissions.length === 0 && !loading && (
            <div className='empty-state text-center py-5'>
              <i className='fa-solid fa-file-invoice-dollar text-muted mb-3' style={{ fontSize: '4rem' }}></i>
              <h5 className='text-muted'>No se encontraron emisiones</h5>
              <p className='text-muted'>
                No hay emisiones que coincidan con los filtros aplicados
              </p>
              <Link href='/emisiones/nueva' className='btn btn-primary'>
                <i className='material-icons me-2'>add</i>
                Crear Primera Emisión
              </Link>
            </div>
          )}

          {/* Paginación */}
          {renderPagination()}
        </div>

        <style jsx>{`
          .table-view {
            background: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            border: 1px solid #e9ecef;
            overflow: hidden;
          }

          .table {
            margin-bottom: 0;
          }

          .table thead th {
            background-color: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
            font-weight: 600;
            color: #495057;
            padding: 1rem 0.75rem;
          }

          .table tbody td {
            padding: 1rem 0.75rem;
            vertical-align: middle;
          }

          .cards-view {
            margin-bottom: 2rem;
          }

          .empty-state {
            background: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            border: 1px solid #e9ecef;
            padding: 3rem;
          }

          .pagination .page-link {
            color: #6c757d;
            border-color: #dee2e6;
          }

          .pagination .page-item.active .page-link {
            background-color: #0d6efd;
            border-color: #0d6efd;
          }

          .pagination .page-link:hover {
            color: #0d6efd;
            background-color: #e9ecef;
            border-color: #dee2e6;
          }

          .pagination .page-link .material-icons {
            font-size: 18px;
          }

          @media (max-width: 768px) {
            .table-responsive {
              font-size: 0.875rem;
            }

            .cards-view .row {
              row-gap: 1rem;
            }
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}
