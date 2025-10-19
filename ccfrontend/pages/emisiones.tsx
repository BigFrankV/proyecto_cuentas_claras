import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import {
  EmissionFilters,
  ViewControls,
  EmissionCard,
  EmissionRow,
  Emission,
  EmissionFiltersType,
} from '@/components/emisiones';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

export default function EmisionesListado() {
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [filteredEmissions, setFilteredEmissions] = useState<Emission[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'table' | 'cards'>('table');
  const [selectedEmissions, setSelectedEmissions] = useState<string[]>([]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Generar datos mock
  const generateMockEmissions = (): Emission[] => {
    const mockEmissions: Emission[] = [
      {
        id: '1',
        period: 'Septiembre 2025',
        type: 'gastos_comunes',
        status: 'sent',
        issueDate: '2025-09-01',
        dueDate: '2025-09-15',
        totalAmount: 2500000,
        paidAmount: 1800000,
        unitCount: 45,
        description: 'Gastos comunes del mes de septiembre',
        communityName: 'Edificio Central',
      },
      {
        id: '2',
        period: 'Agosto 2025',
        type: 'gastos_comunes',
        status: 'paid',
        issueDate: '2025-08-01',
        dueDate: '2025-08-15',
        totalAmount: 2400000,
        paidAmount: 2400000,
        unitCount: 45,
        description: 'Gastos comunes del mes de agosto',
        communityName: 'Edificio Central',
      },
      {
        id: '3',
        period: 'Extraordinaria - Ascensor',
        type: 'extraordinaria',
        status: 'ready',
        issueDate: '2025-09-10',
        dueDate: '2025-09-30',
        totalAmount: 800000,
        paidAmount: 0,
        unitCount: 45,
        description: 'Reparación ascensor principal',
        communityName: 'Edificio Central',
      },
      {
        id: '4',
        period: 'Julio 2025',
        type: 'gastos_comunes',
        status: 'overdue',
        issueDate: '2025-07-01',
        dueDate: '2025-07-15',
        totalAmount: 2300000,
        paidAmount: 1200000,
        unitCount: 45,
        description: 'Gastos comunes del mes de julio',
        communityName: 'Edificio Central',
      },
      {
        id: '5',
        period: 'Multa - Ruidos molestos',
        type: 'multa',
        status: 'draft',
        issueDate: '2025-09-15',
        dueDate: '2025-10-01',
        totalAmount: 50000,
        paidAmount: 0,
        unitCount: 1,
        description: 'Multa por ruidos molestos - Unidad 302',
        communityName: 'Edificio Central',
      },
      {
        id: '6',
        period: 'Junio 2025',
        type: 'gastos_comunes',
        status: 'partial',
        issueDate: '2025-06-01',
        dueDate: '2025-06-15',
        totalAmount: 2200000,
        paidAmount: 1500000,
        unitCount: 45,
        description: 'Gastos comunes del mes de junio',
        communityName: 'Edificio Central',
      },
    ];

    return mockEmissions;
  };

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      const mockData = generateMockEmissions();
      setEmissions(mockData);
      setFilteredEmissions(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // Manejar filtros
  const handleFilterChange = (filters: EmissionFiltersType) => {
    let filtered = emissions;

    // Búsqueda por texto
    if (filters.search) {
      filtered = filtered.filter(
        emission =>
          emission.period
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          (emission.description &&
            emission.description
              .toLowerCase()
              .includes(filters.search.toLowerCase())) ||
          (emission.communityName &&
            emission.communityName
              .toLowerCase()
              .includes(filters.search.toLowerCase())),
      );
    }

    // Filtro por estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(
        emission => emission.status === filters.status,
      );
    }

    // Filtro por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(emission => emission.type === filters.type);
    }

    // Filtro por período
    if (filters.period !== 'all') {
      filtered = filtered.filter(emission =>
        emission.period.includes(filters.period),
      );
    }

    // Filtro por fechas
    if (filters.dateFrom) {
      filtered = filtered.filter(
        emission => new Date(emission.issueDate) >= new Date(filters.dateFrom),
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        emission => new Date(emission.issueDate) <= new Date(filters.dateTo),
      );
    }

    setFilteredEmissions(filtered);
    setCurrentPage(1); // Reset página
  };

  const handleClearFilters = () => {
    setFilteredEmissions(emissions);
    setCurrentPage(1);
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
    const currentPageEmissions = getCurrentPageEmissions();
    const allSelected = currentPageEmissions.every(emission =>
      selectedEmissions.includes(emission.id),
    );

    if (allSelected) {
      // Deseleccionar todos de la página actual
      const newSelected = selectedEmissions.filter(
        id => !currentPageEmissions.some(emission => emission.id === id),
      );
      setSelectedEmissions(newSelected);
    } else {
      // Seleccionar todos de la página actual
      const pageIds = currentPageEmissions.map(emission => emission.id);
      const newSelected = [...new Set([...selectedEmissions, ...pageIds])];
      setSelectedEmissions(newSelected);
    }
  };

  const handleDeselectAll = () => {
    setSelectedEmissions([]);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Acción masiva: ${action}`, selectedEmissions);
    // Implementar acciones masivas aquí
    alert(
      `Acción "${action}" aplicada a ${selectedEmissions.length} emisiones`,
    );
  };

  // Paginación
  const getCurrentPageEmissions = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEmissions.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredEmissions.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render paginación
  const renderPagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

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
                <button
                  className='page-link'
                  onClick={() => handlePageChange(1)}
                >
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
            <li
              key={page}
              className={`page-item ${currentPage === page ? 'active' : ''}`}
            >
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
                <button
                  className='page-link'
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </button>
              </li>
            </>
          )}

          <li
            className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
          >
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
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ minHeight: '400px' }}
          >
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
              <p className='text-muted mb-0'>
                Gestión de emisiones de gastos comunes y extraordinarias
              </p>
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
            totalItems={filteredEmissions.length}
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
                            checked={
                              getCurrentPageEmissions().length > 0 &&
                              getCurrentPageEmissions().every(emission =>
                                selectedEmissions.includes(emission.id),
                              )
                            }
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
                    {getCurrentPageEmissions().map(emission => (
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
                {getCurrentPageEmissions().map(emission => (
                  <div key={emission.id} className='col'>
                    <EmissionCard emission={emission} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {filteredEmissions.length === 0 && (
            <div className='empty-state text-center py-5'>
              <i
                className='fa-solid fa-file-invoice-dollar text-muted mb-3'
                style={{ fontSize: '4rem' }}
              ></i>
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
