import Head from 'next/head';
import { useRouter } from 'next/router';
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  Button,
  Card,
  Form,
  Alert,
  Table,
  Modal,
  Dropdown,
  Badge,
} from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import {
  listGastos,
  getCategorias,
  getCentrosCosto,
  getProveedores,
} from '@/lib/gastosService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { usePermissions } from '@/lib/usePermissions';
import { Expense, mapBackendToExpense } from '@/types/gastos';

export default function GastosListado() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { isSuperUser, currentRole } = usePermissions();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedExpenses, setSelectedExpenses] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const isFetchingRef = useRef(false); // evita reentradas
  const hasLoadedRef = useRef(false); // <-- añadir para controlar carga inicial

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    provider: '',
    dateFrom: '',
    dateTo: '',
    amountFrom: '',
    amountTo: '',
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Memoizar comunidadId para evitar re-ejecuciones del useEffect
  const resolvedComunidadId = useMemo(() => {
    // Siempre usar endpoint global /gastos - el backend filtra por comunidades asignadas
    return undefined;
  }, []); // <-- simplificar, siempre undefined

  const loadExpenses = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }
    isFetchingRef.current = true;

    try {
      setLoading(true);
      const resp = await listGastos(resolvedComunidadId, {
        limit: 100,
        offset: 0,
      });
      // eslint-disable-next-line no-console
      console.log('Respuesta del backend:', resp.data); // Verifica si 'estado' es correcto
      const items = resp.data || [];
      const mapped: Expense[] = (Array.isArray(items) ? items : []).map(
        mapBackendToExpense,
      );
      setExpenses(mapped);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading expenses from API:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [resolvedComunidadId]); // <-- dependencias de la función

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!isAuthenticated) {
      return;
    }

    // Evitar carga inicial duplicada
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;

    loadExpenses();
  }, [authLoading, isAuthenticated, isSuperUser, resolvedComunidadId]); // <-- quitar loadExpenses

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', className: 'status-pending' },
      approved: { label: 'Aprobado', className: 'status-approved' },
      rejected: { label: 'Rechazado', className: 'status-rejected' },
      paid: { label: 'Pagado', className: 'status-paid' },
      completed: { label: 'Completado', className: 'status-completed' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`status-badge ${config.className}`}>{config.label}</span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      mantenimiento: {
        label: 'Mantenimiento',
        className: 'category-mantenimiento',
      },
      servicios: { label: 'Servicios', className: 'category-servicios' },
      personal: { label: 'Personal', className: 'category-personal' },
      suministros: { label: 'Suministros', className: 'category-suministros' },
      impuestos: { label: 'Impuestos', className: 'category-impuestos' },
      seguros: { label: 'Seguros', className: 'category-seguros' },
    };

    const config = categoryConfig[category as keyof typeof categoryConfig] || {
      label: category,
      className: 'category-badge',
    };

    return (
      <span className={`category-badge ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getAmountClass = (amount: number) => {
    if (amount >= 1000000) {
      return 'amount-high';
    }
    if (amount >= 500000) {
      return 'amount-medium';
    }
    return 'amount-low';
  };

  const handleExpenseClick = (expenseId: number) => {
    router.push(`/gastos/${expenseId}`);
  };

  const filteredExpenses = expenses.filter(expense => {
    return (
      expense.description
        .toLowerCase()
        .includes(filters.search.toLowerCase()) &&
      (filters.category === '' ||
        expense.categoryId === Number(filters.category)) &&
      (filters.status === '' || expense.status === filters.status) &&
      (filters.provider === '' ||
        expense.provider.toLowerCase().includes(filters.provider.toLowerCase()))
    );
  });

  // Paginación
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getActiveFiltersCount = () =>
    Object.values(filters).filter(value => value !== '').length;

  // Nuevos estados para categorías, centros de costo y proveedores
  const [categories, setCategories] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    // cargar listas siempre (global si resolvedComunidadId undefined)
    const idToUse = resolvedComunidadId ?? undefined;
    getCategorias(idToUse)
      .then(data => {
        const normalized = (data || []).map((c: any) => ({
          id: c.id,
          nombre: c.nombre ?? c.name ?? c.label,
        }));
        setCategories(
          normalized.sort((a: any, b: any) =>
            String(a.nombre).localeCompare(String(b.nombre)),
          ),
        );
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('Error getCategorias', err);
        setCategories([]);
      });

    getCentrosCosto(idToUse)
      .then(data => {
        const normalized = (data || []).map((c: any) => ({
          id: c.id,
          nombre: c.nombre ?? c.name,
        }));
        setCostCenters(normalized);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('Error getCentrosCosto', err);
        setCostCenters([]);
      });

    getProveedores(idToUse)
      .then(data => {
        const normalized = (data || []).map((p: any) => ({
          id: p.id,
          nombre: p.nombre ?? p.razon_social ?? p.name,
        }));
        setProviders(normalized);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('Error getProveedores', err);
        setProviders([]);
      });
  }, [resolvedComunidadId]);

  return (
    <ProtectedRoute>
      <Head>
        <title>Gastos — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='expenses-container'>
          {/* Header */}
          <div className='expenses-header'>
            <div className='d-flex justify-content-between align-items-start mb-4'>
              <div>
                <h1 className='expenses-title'>
                  <span className='material-icons me-2'>receipt_long</span>
                  Gestión de Gastos
                </h1>
                <p className='expenses-subtitle'>
                  Administra y controla todos los gastos de la comunidad
                </p>
                <div className='header-stats'>
                  <div className='stat-item'>
                    <div className='stat-number'>{expenses.length}</div>
                    <div className='stat-label'>Total Gastos</div>
                  </div>
                  <div className='stat-item'>
                    <div className='stat-number'>
                      {expenses.filter(e => e.status === 'pending').length}
                    </div>
                    <div className='stat-label'>Pendientes</div>
                  </div>
                  <div className='stat-item'>
                    <div className='stat-number'>
                      {expenses.filter(e => e.status === 'approved').length}
                    </div>
                    <div className='stat-label'>Aprobados</div>
                  </div>
                  <div className='stat-item'>
                    <div className='stat-number'>
                      {formatCurrency(
                        expenses.reduce((sum, e) => sum + e.amount, 0),
                      )}
                    </div>
                    <div className='stat-label'>Monto Total</div>
                  </div>
                </div>
              </div>
              <div className='d-flex gap-2'>
                <Button
                  variant='outline-light'
                  onClick={() => setShowFilters(!showFilters)}
                  className='position-relative'
                >
                  <span className='material-icons me-2'>filter_list</span>
                  Filtros
                  {getActiveFiltersCount() > 0 && (
                    <Badge
                      bg='light'
                      text='dark'
                      className='position-absolute top-0 start-100 translate-middle badge rounded-pill'
                    >
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant='light'
                  onClick={() => router.push('/gastos/nuevo')}
                >
                  <span className='material-icons me-2'>add</span>
                  Nuevo Gasto
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className='filters-panel'>
              <div className='filters-header'>
                <h5 className='filters-title'>
                  <span className='material-icons'>tune</span>
                  Filtros Avanzados
                </h5>
                <Button
                  variant='outline-secondary'
                  size='sm'
                  onClick={() =>
                    setFilters({
                      search: '',
                      category: '',
                      status: '',
                      provider: '',
                      dateFrom: '',
                      dateTo: '',
                      amountFrom: '',
                      amountTo: '',
                    })
                  }
                >
                  Limpiar
                </Button>
              </div>
              <div className='row g-3'>
                <div className='col-md-3'>
                  <Form.Group>
                    <Form.Label>Buscar</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Descripción, proveedor...'
                      value={filters.search}
                      onChange={e =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                    />
                  </Form.Group>
                </div>
                <div className='col-md-3'>
                  <Form.Group>
                    <Form.Label>Categoría</Form.Label>
                    <Form.Select
                      value={filters.category}
                      onChange={e =>
                        setFilters({ ...filters, category: e.target.value })
                      }
                    >
                      <option value=''>Todas las categorías</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.nombre ??
                            category.name ??
                            String(category.id)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className='col-md-3'>
                  <Form.Group>
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      value={filters.status}
                      onChange={e =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                    >
                      <option value=''>Todos los estados</option>
                      <option value='pending'>Pendiente</option>
                      <option value='approved'>Aprobado</option>
                      <option value='rejected'>Rechazado</option>
                      <option value='paid'>Pagado</option>
                      <option value='completed'>Completado</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className='col-md-3'>
                  <Form.Group>
                    <Form.Label>Proveedor</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Nombre del proveedor'
                      value={filters.provider}
                      onChange={e =>
                        setFilters({ ...filters, provider: e.target.value })
                      }
                    />
                  </Form.Group>
                </div>
              </div>
            </div>
          )}

          {/* Opciones de vista y resultados */}
          <div className='view-options'>
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <div>
                <span className='text-muted'>
                  Mostrando {startIndex + 1}-
                  {Math.min(startIndex + itemsPerPage, filteredExpenses.length)}{' '}
                  de {filteredExpenses.length} gastos
                </span>
              </div>
              <div className='d-flex align-items-center gap-3'>
                <div className='btn-group' role='group'>
                  <Button
                    variant={
                      viewMode === 'table' ? 'primary' : 'outline-primary'
                    }
                    size='sm'
                    onClick={() => setViewMode('table')}
                  >
                    <span className='material-icons'>view_list</span>
                  </Button>
                  <Button
                    variant={
                      viewMode === 'grid' ? 'primary' : 'outline-primary'
                    }
                    size='sm'
                    onClick={() => setViewMode('grid')}
                  >
                    <span className='material-icons'>view_module</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Vista de tabla */}
          {viewMode === 'table' && (
            <div className='expenses-table'>
              <div className='table-header'>
                <h5 className='table-title'>
                  <span className='material-icons'>receipt_long</span>
                  Lista de Gastos
                </h5>
              </div>
              <div className='table-responsive'>
                <Table hover className='custom-table mb-0'>
                  <thead>
                    <tr>
                      <th>
                        <Form.Check
                          type='checkbox'
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedExpenses(
                                paginatedExpenses.map(exp => exp.id),
                              );
                            } else {
                              setSelectedExpenses([]);
                            }
                          }}
                        />
                      </th>
                      <th>Descripción</th>
                      <th>Categoría</th>
                      <th>Proveedor</th>
                      <th>Monto</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExpenses.map(expense => (
                      <tr
                        key={expense.id}
                        className='data-row'
                        onClick={() => handleExpenseClick(expense.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td onClick={e => e.stopPropagation()}>
                          <Form.Check
                            type='checkbox'
                            checked={selectedExpenses.includes(expense.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedExpenses([
                                  ...selectedExpenses,
                                  expense.id,
                                ]);
                              } else {
                                setSelectedExpenses(
                                  selectedExpenses.filter(
                                    id => id !== expense.id,
                                  ),
                                );
                              }
                            }}
                          />
                        </td>
                        <td>
                          <div className='d-flex align-items-center'>
                            <div>
                              <div className='fw-medium'>
                                {expense.description}
                              </div>
                              <small className='text-muted'>
                                {expense.documentType} {expense.documentNumber}
                              </small>
                            </div>
                            {expense.hasAttachments && (
                              <span className='material-icons text-muted ms-2'>
                                attach_file
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{getCategoryBadge(expense.category)}</td>
                        <td>
                          <div className='fw-medium'>{expense.provider}</div>
                        </td>
                        <td>
                          <span
                            className={`amount fw-bold ${getAmountClass(expense.amount)}`}
                          >
                            {formatCurrency(expense.amount)}
                          </span>
                        </td>
                        <td>
                          {new Date(expense.date).toLocaleDateString('es-CL')}
                        </td>
                        <td>{getStatusBadge(expense.status)}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className='d-flex gap-1'>
                            <Button
                              variant='outline-primary'
                              size='sm'
                              className='action-button'
                              onClick={() =>
                                router.push(`/gastos/${expense.id}`)
                              }
                            >
                              <span className='material-icons'>visibility</span>
                            </Button>
                            <Button
                              variant='outline-secondary'
                              size='sm'
                              className='action-button'
                              onClick={() =>
                                router.push(`/gastos/editar/${expense.id}`)
                              }
                            >
                              <span className='material-icons'>edit</span>
                            </Button>
                            <Dropdown>
                              <Dropdown.Toggle
                                variant='outline-secondary'
                                size='sm'
                                className='action-button dropdown-toggle-no-caret'
                              >
                                <span className='material-icons'>
                                  more_vert
                                </span>
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item>
                                  <span className='material-icons me-2'>
                                    file_download
                                  </span>
                                  Descargar
                                </Dropdown.Item>
                                <Dropdown.Item>
                                  <span className='material-icons me-2'>
                                    share
                                  </span>
                                  Compartir
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item className='text-danger'>
                                  <span className='material-icons me-2'>
                                    delete
                                  </span>
                                  Eliminar
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}

          {/* Vista de tarjetas */}
          {viewMode === 'grid' && (
            <div className='row'>
              {paginatedExpenses.map(expense => (
                <div key={expense.id} className='col-lg-6 col-xl-4 mb-3'>
                  <div
                    className='data-card'
                    onClick={() => handleExpenseClick(expense.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleExpenseClick(expense.id);
                      }
                    }}
                    role='button'
                    tabIndex={0}
                  >
                    <div className='card-body'>
                      <div className='data-card-header'>
                        <div>
                          <h6 className='data-card-title'>
                            {expense.description}
                          </h6>
                          <p className='data-card-subtitle'>
                            {expense.provider}
                          </p>
                        </div>
                        <Form.Check
                          type='checkbox'
                          checked={selectedExpenses.includes(expense.id)}
                          onChange={e => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setSelectedExpenses([
                                ...selectedExpenses,
                                expense.id,
                              ]);
                            } else {
                              setSelectedExpenses(
                                selectedExpenses.filter(id => id !== expense.id),
                              );
                            }
                          }}
                        />
                      </div>

                      <div className='data-card-details mb-3'>
                        <div className='data-card-detail'>
                          <span className='material-icons'>category</span>
                          {getCategoryBadge(expense.category)}
                        </div>
                        <div className='data-card-detail'>
                          <span className='material-icons'>event</span>
                          {new Date(expense.date).toLocaleDateString('es-CL')}
                        </div>
                        <div className='data-card-detail'>
                          <span className='material-icons'>attach_money</span>
                          <span
                            className={`amount fw-bold ${getAmountClass(expense.amount)}`}
                          >
                            {formatCurrency(expense.amount)}
                          </span>
                        </div>
                      </div>

                      <div className='data-card-footer'>
                        <div>
                          {getStatusBadge(expense.status)}
                          {expense.tags.map((tag, index) => (
                            <Badge key={index} bg='secondary' className='ms-1'>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className='data-card-actions'>
                          <Button
                            variant='outline-primary'
                            size='sm'
                            onClick={e => {
                              e.stopPropagation();
                              router.push(`/gastos/${expense.id}`);
                            }}
                          >
                            <span className='material-icons'>visibility</span>
                          </Button>
                          <Button
                            variant='outline-secondary'
                            size='sm'
                            onClick={e => {
                              e.stopPropagation();
                              router.push(`/gastos/editar/${expense.id}`);
                            }}
                          >
                            <span className='material-icons'>edit</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className='d-flex justify-content-center mt-4'>
              <nav>
                <ul className='pagination'>
                  <li
                    className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
                  >
                    <button
                      className='page-link'
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <span className='material-icons'>chevron_left</span>
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <li
                      key={index + 1}
                      className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                      <button
                        className='page-link'
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
                  >
                    <button
                      className='page-link'
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <span className='material-icons'>chevron_right</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          {/* Mobile FAB */}
          <div className='mobile-fab d-lg-none'>
            <Button
              variant='primary'
              className='rounded-circle shadow'
              onClick={() => router.push('/gastos/nuevo')}
              style={{ width: '56px', height: '56px' }}
            >
              <span className='material-icons'>add</span>
            </Button>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
