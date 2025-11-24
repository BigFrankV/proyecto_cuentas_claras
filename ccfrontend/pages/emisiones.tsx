import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
import emisionesService from '@/lib/emisionesService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { Permission, usePermissions } from '@/lib/usePermissions';

export default function EmisionesListado() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [filteredEmissions, setFilteredEmissions] = useState<Emission[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'table' | 'cards'>('table');
  const [selectedEmissions, setSelectedEmissions] = useState<string[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estado para comunidad (obtenido del usuario autenticado)
  const [comunidadId, setComunidadId] = useState<number | null>(null);

  // Verificar permisos de acceso
  useEffect(() => {
    if (user) {
      // Verificar si el usuario tiene permisos para ver emisiones
      const canViewEmissions = hasPermission(Permission.VIEW_EMISION) || 
                               hasPermission(Permission.CREATE_EMISION) ||
                               hasPermission(Permission.EDIT_EMISION);
      
      if (!canViewEmissions) {
        setAccessDenied(true);
        return;
      }

      // Obtener comunidad ID del usuario
      // Superadmin puede no tener comunidad_id (ve todas)
      if (user.is_superadmin) {
        // Superadmin: obtener primera comunidad disponible o usar selección
        // Por ahora, usar comunidad_id si existe, si no usar 1 por defecto
        const defaultComunidadId = user.comunidad_id || 
                                    (user.memberships?.[0]?.comunidadId) || 
                                    1; // Comunidad por defecto para testing
        setComunidadId(defaultComunidadId);
      } else {
        const userComunidadId = user.comunidad_id || 
                                 (user.memberships?.[0]?.comunidadId);
        
        if (userComunidadId) {
          setComunidadId(userComunidadId);
        } else {
          setAccessDenied(true);
        }
      }
    }
  }, [user, hasPermission]);

  // Cargar datos reales de la API
  const loadEmissions = async () => {
    if (accessDenied) {
      setLoading(false);
      return;
    }

    // Si no hay comunidadId y no es superadmin, no cargar
    if (!comunidadId && !user?.is_superadmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      let result;
      // Si es superadmin, obtener TODAS las emisiones
      if (user?.is_superadmin) {
        result = await emisionesService.getTodasEmisionesResumen();
        // Convertir el formato de respuesta
        result = { emisiones: result };
      } else {
        // Si no es superadmin, obtener resumen de su comunidad
        const emisiones = await emisionesService.getEmisionesComunidadResumen(comunidadId!);
        result = { emisiones };
      }

      // Mapear los datos de la API al formato del frontend
      const mappedEmissions: Emission[] = result.emisiones.map(
        (emision: any) => ({
          id: emision.id?.toString() || emision.emision_id?.toString(),
          period: emision.periodo,
          type: 'gastos_comunes',
          status: mapEstadoToStatus(emision.estado),
          issueDate: emision.created_at || emision.fecha_emision,
          dueDate: emision.fecha_vencimiento,
          totalAmount: Number(emision.monto_total || emision.monto_total_liquidado) || 0,
          paidAmount: Number(emision.monto_pagado || emision.monto_pagado_aplicado) || 0,
          unitCount: Number(emision.total_unidades || emision.total_unidades_impactadas) || 0,
          description: emision.observaciones || '',
          communityName: emision.nombre_comunidad || 'Comunidad Actual',
        }),
      );

      setEmissions(mappedEmissions);
      setFilteredEmissions(mappedEmissions);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading emissions:', error);
      // Mostrar estado vacío si falla la API
      setEmissions([]);
      setFilteredEmissions([]);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para mapear estados del backend al frontend
  const mapEstadoToStatus = (estado: string): Emission['status'] => {
    // Limpiar espacios y convertir a minúsculas
    const estadoLimpio = estado?.trim().toLowerCase();
    
    // eslint-disable-next-line no-console
    console.log('Estado recibido:', estado, '-> limpio:', estadoLimpio);
    
    switch (estadoLimpio) {
      case 'borrador':
        return 'draft';
      case 'emitida':
        return 'sent';
      case 'cerrada':
        return 'paid';
      case 'anulado':
        return 'cancelled';
      default:
        // eslint-disable-next-line no-console
        console.warn('Estado desconocido:', estadoLimpio, 'usando draft por defecto');
        return 'draft';
    }
  };

  useEffect(() => {
    // Cargar emisiones si no está denegado el acceso
    // Y si es superadmin O tiene comunidadId
    if (!accessDenied && (user?.is_superadmin || comunidadId)) {
      loadEmissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comunidadId, currentPage, accessDenied, user?.is_superadmin]);

  // Renderizar mensaje de acceso denegado
  if (accessDenied) {
    return (
      <ProtectedRoute>
        <Head>
          <title>Emisiones — Cuentas Claras</title>
        </Head>

        <Layout title='Emisiones de Gastos Comunes'>
          <div className='container-fluid py-5'>
            <div className='row justify-content-center'>
              <div className='col-md-8 col-lg-6'>
                <div className='card shadow-sm'>
                  <div className='card-body text-center py-5'>
                    <div className='mb-4'>
                      <i 
                        className='material-icons text-warning' 
                        style={{ fontSize: '64px' }}
                      >
                        lock
                      </i>
                    </div>
                    <h3 className='mb-3'>Acceso Restringido</h3>
                    <p className='text-muted mb-4'>
                      Esta sección está disponible solo para administradores, tesoreros 
                      y miembros del comité. Si necesitas información sobre tus gastos comunes, 
                      puedes consultar la sección de <strong>Cargos</strong>.
                    </p>
                    <div className='d-flex gap-3 justify-content-center'>
                      <Link href='/cargos' className='btn btn-primary'>
                        <i className='material-icons me-2'>receipt</i>
                        Ver Mis Cargos
                      </Link>
                      <Link href='/dashboard' className='btn btn-outline-secondary'>
                        <i className='material-icons me-2'>dashboard</i>
                        Ir al Dashboard
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

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
    // eslint-disable-next-line no-console
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
        {/* Header Profesional */}
        <div className='container-fluid p-0'>
          <div
            className='text-white'
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className='p-4'>
            <div
              style={{
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '200px',
                height: '200px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-5%',
                width: '150px',
                height: '150px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '50%',
              }}
            />
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex align-items-center'>
                <div
                  className='me-4'
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i
                    className='material-icons'
                    style={{ fontSize: '32px', color: 'white' }}
                  >
                    receipt_long
                  </i>
                </div>
                <div>
                  <h1 className='h2 mb-1 text-white'>
                    Emisiones
                  </h1>
                  <p className='mb-0 opacity-75'>
                    Gestión de emisiones de gastos comunes de la comunidad
                  </p>
                </div>
              </div>
              <div className='text-end'>
                {hasPermission(Permission.CREATE_EMISION) && (
                  <Link
                    href='/emisiones/nueva'
                    className='btn btn-light btn-lg'
                  >
                    <i className='material-icons me-2'>add</i>
                    Nueva Emisión
                  </Link>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            <div className='row mt-4'>
              <div className='col-md-3 mb-3'>
                <div
                  className='p-3 rounded-3 text-white'
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-3'
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i className='material-icons'>receipt_long</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>{filteredEmissions.length}</div>
                      <div className='text-white-50'>Total Emisiones</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-3 mb-3'>
                <div
                  className='p-3 rounded-3 text-white'
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-3'
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-success)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i className='material-icons'>send</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>{filteredEmissions.filter(e => e.status === 'sent').length}</div>
                      <div className='text-white-50'>Emitidas</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-3 mb-3'>
                <div
                  className='p-3 rounded-3 text-white'
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-3'
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-warning)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i className='material-icons'>edit</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>{filteredEmissions.filter(e => e.status === 'draft').length}</div>
                      <div className='text-white-50'>Borradores</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-3 mb-3'>
                <div
                  className='p-3 rounded-3 text-white'
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-3'
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-info)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i className='material-icons'>check_circle</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>{filteredEmissions.filter(e => e.status === 'paid').length}</div>
                      <div className='text-white-50'>Pagadas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className='container-fluid pt-4 pb-4'>

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
              {hasPermission(Permission.CREATE_EMISION) && (
                <Link href='/emisiones/nueva' className='btn btn-primary'>
                  <i className='material-icons me-2'>add</i>
                  Crear Primera Emisión
                </Link>
              )}
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
