/* eslint-disable max-len */
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import ModernPagination from '@/components/ui/ModernPagination';
import PageHeader from '@/components/ui/PageHeader';
import { ticketsApi } from '@/lib/api/tickets';
import { ProtectedRoute } from '@/lib/useAuth';
import type { Ticket } from '@/types/tickets';

const statusConfig = {
  open: {
    label: 'Abierto',
    class: 'open',
    color: '#1565C0',
    bg: '#E3F2FD',
    border: '#2196F3',
  },
  'in-progress': {
    label: 'En Progreso',
    class: 'in-progress',
    color: '#F57F17',
    bg: '#FFF8E1',
    border: '#FFEB3B',
  },
  resolved: {
    label: 'Resuelto',
    class: 'resolved',
    color: '#2E7D32',
    bg: '#E8F5E9',
    border: '#4CAF50',
  },
  closed: {
    label: 'Cerrado',
    class: 'closed',
    color: '#757575',
    bg: '#F5F5F5',
    border: '#9E9E9E',
  },
  escalated: {
    label: 'Escalado',
    class: 'escalated',
    color: '#C62828',
    bg: '#FFEBEE',
    border: '#F44336',
  },
};

const priorityConfig = {
  low: { label: 'Baja', class: 'low', color: '#2E7D32', bg: '#E8F5E9' },
  medium: { label: 'Media', class: 'medium', color: '#F57F17', bg: '#FFF8E1' },
  high: { label: 'Alta', class: 'high', color: '#C62828', bg: '#FFEBEE' },
  urgent: {
    label: 'Urgente',
    class: 'urgent',
    color: '#FFFFFF',
    bg: '#7B1FA2',
  },
};

// Helper functions for mapping backend values to frontend config
const mapEstadoToFrontend = (estado: string): keyof typeof statusConfig => {
  switch (estado) {
    case 'abierto':
      return 'open';
    case 'en_progreso':
      return 'in-progress';
    case 'resuelto':
      return 'resolved';
    case 'cerrado':
      return 'closed';
    default:
      return 'open';
  }
};

const mapPrioridadToFrontend = (
  prioridad: string,
): keyof typeof priorityConfig => {
  switch (prioridad) {
    case 'baja':
      return 'low';
    case 'media':
      return 'medium';
    case 'alta':
      return 'high';
    default:
      return 'medium';
  }
};

export default function TicketsListado() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [totalFilteredItems, setTotalFilteredItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    assignee: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Obtener la comunidad del usuario autenticado
        // Por ahora usamos una comunidad por defecto
        // const comunidadId = 1; // Esto debería venir del contexto de autenticación
        const ticketsData = await ticketsApi.getTodosCompletos();
        setTickets(ticketsData);
        setFilteredTickets(ticketsData);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError('Error al cargar los tickets');
        setTickets([]);
        setFilteredTickets([]);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(
        ticket =>
          ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.numero
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          ticket.solicitante.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filters.status) {
      const statusMap: Record<string, string> = {
        open: 'abierto',
        'in-progress': 'en_progreso',
        resolved: 'resuelto',
        closed: 'cerrado',
      };
      const backendStatus = statusMap[filters.status] || filters.status;
      filtered = filtered.filter(ticket => ticket.estado === backendStatus);
    }

    if (filters.priority) {
      const priorityMap: Record<string, string> = {
        low: 'baja',
        medium: 'media',
        high: 'alta',
        urgent: 'alta', // Map urgent to alta as well
      };
      const backendPriority = priorityMap[filters.priority] || filters.priority;
      filtered = filtered.filter(
        ticket => ticket.prioridad === backendPriority,
      );
    }

    if (filters.category) {
      filtered = filtered.filter(
        ticket => ticket.categoria === filters.category,
      );
    }

    // Calcular paginación
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(totalPages);
    setTotalFilteredItems(filtered.length);

    // Aplicar paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTickets = filtered.slice(startIndex, endIndex);

    setFilteredTickets(paginatedTickets);
  }, [tickets, searchTerm, filters, currentPage, itemsPerPage]);

  const getStats = () => {
    const open = tickets.filter(t => t.estado === 'abierto').length;
    const inProgress = tickets.filter(t => t.estado === 'en_progreso').length;
    const resolved = tickets.filter(t => t.estado === 'resuelto').length;
    const escalated = tickets.filter(
      t => t.nivel_urgencia === 'critico' || t.nivel_urgencia === 'urgente',
    ).length;

    return { open, inProgress, resolved, escalated };
  };
  const formatDate = (date?: string | number | Date | null): string => {
    if (!date) {
      return '';
    }
    let d: Date;
    if (date instanceof Date) {
      d = date;
    } else if (typeof date === 'number') {
      d = new Date(date);
    } else {
      // coerce other types (including unexpected values) to string to avoid TS errors
      d = new Date(String(date));
    }
    if (isNaN(d.getTime())) {
      return '';
    }
    return d.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map(t => t.id));
    }
  };

  const handleTicketSelect = (ticketId: number) => {
    setSelectedTickets(prev =>
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId],
    );
  };

  const stats = getStats();

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Tickets de Soporte'>
          <div className='container-fluid py-4'>
            <div className='text-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
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
        <title>Tickets de Soporte — Cuentas Claras</title>
      </Head>

      <Layout title='Tickets de Soporte'>
        <div className='container-fluid py-3'>
          <PageHeader
            title="Tickets de Soporte"
            subtitle="Gestión de solicitudes y reportes"
            icon="support"
            primaryAction={{
              href: '/tickets/nuevo',
              label: 'Nuevo Ticket',
              icon: 'add',
            }}
            stats={[
              {
                label: 'Abiertos',
                value: stats.open.toString(),
                icon: 'bug_report',
                color: '#1565C0',
              },
              {
                label: 'En Progreso',
                value: stats.inProgress.toString(),
                icon: 'hourglass_empty',
                color: '#F57F17',
              },
              {
                label: 'Resueltos',
                value: stats.resolved.toString(),
                icon: 'check_circle',
                color: '#2E7D32',
              },
              {
                label: 'Escalados',
                value: stats.escalated.toString(),
                icon: 'warning',
                color: '#C62828',
              },
            ]}
          />

          {/* Statistics Cards */}
          <div className='row mb-4'>
            <div className='col-6 col-md-3 mb-3'>
              <div
                className='stats-card'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  borderLeft: '4px solid #dc3545',
                  height: '100%',
                }}
              >
                <div className='d-flex align-items-center'>
                  <div
                    className='stats-icon danger me-3'
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: 'white',
                      backgroundColor: '#dc3545',
                    }}
                  >
                    <i className='material-icons'>report_problem</i>
                  </div>
                  <div>
                    <div
                      className='stats-number'
                      style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#212529',
                      }}
                    >
                      {stats.open}
                    </div>
                    <div
                      className='stats-label'
                      style={{ color: '#6c757d', fontSize: '0.875rem' }}
                    >
                      Abiertos
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-6 col-md-3 mb-3'>
              <div
                className='stats-card'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  borderLeft: '4px solid #ffc107',
                  height: '100%',
                }}
              >
                <div className='d-flex align-items-center'>
                  <div
                    className='stats-icon warning me-3'
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: 'white',
                      backgroundColor: '#ffc107',
                    }}
                  >
                    <i className='material-icons'>schedule</i>
                  </div>
                  <div>
                    <div
                      className='stats-number'
                      style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#212529',
                      }}
                    >
                      {stats.inProgress}
                    </div>
                    <div
                      className='stats-label'
                      style={{ color: '#6c757d', fontSize: '0.875rem' }}
                    >
                      En Progreso
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-6 col-md-3 mb-3'>
              <div
                className='stats-card'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  borderLeft: '4px solid #28a745',
                  height: '100%',
                }}
              >
                <div className='d-flex align-items-center'>
                  <div
                    className='stats-icon success me-3'
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: 'white',
                      backgroundColor: '#28a745',
                    }}
                  >
                    <i className='material-icons'>check_circle</i>
                  </div>
                  <div>
                    <div
                      className='stats-number'
                      style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#212529',
                      }}
                    >
                      {stats.resolved}
                    </div>
                    <div
                      className='stats-label'
                      style={{ color: '#6c757d', fontSize: '0.875rem' }}
                    >
                      Resueltos
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-6 col-md-3 mb-3'>
              <div
                className='stats-card'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  borderLeft: '4px solid #17a2b8',
                  height: '100%',
                }}
              >
                <div className='d-flex align-items-center'>
                  <div
                    className='stats-icon info me-3'
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: 'white',
                      backgroundColor: '#17a2b8',
                    }}
                  >
                    <i className='material-icons'>priority_high</i>
                  </div>
                  <div>
                    <div
                      className='stats-number'
                      style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#212529',
                      }}
                    >
                      {stats.escalated}
                    </div>
                    <div
                      className='stats-label'
                      style={{ color: '#6c757d', fontSize: '0.875rem' }}
                    >
                      Escalados
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div
            className='filters-card mb-4'
            style={{
              backgroundColor: '#fff',
              borderRadius: 'var(--radius)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid #e9ecef',
            }}
          >
            <div className='row g-3'>
              <div className='col-md-3'>
                <label className='form-label'>Buscar</label>
                <div className='search-box position-relative'>
                  <i
                    className='material-icons position-absolute'
                    style={{
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6c757d',
                      fontSize: '20px',
                    }}
                  >
                    search
                  </i>
                  <input
                    type='text'
                    className='form-control ps-5'
                    placeholder='Buscar tickets...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className='col-md-2'>
                <label className='form-label'>Estado</label>
                <select
                  className='form-select'
                  value={filters.status}
                  onChange={e =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value=''>Todos</option>
                  <option value='open'>Abierto</option>
                  <option value='in-progress'>En Progreso</option>
                  <option value='resolved'>Resuelto</option>
                  <option value='closed'>Cerrado</option>
                  <option value='escalated'>Escalado</option>
                </select>
              </div>

              <div className='col-md-2'>
                <label className='form-label'>Prioridad</label>
                <select
                  className='form-select'
                  value={filters.priority}
                  onChange={e =>
                    setFilters({ ...filters, priority: e.target.value })
                  }
                >
                  <option value=''>Todas</option>
                  <option value='low'>Baja</option>
                  <option value='medium'>Media</option>
                  <option value='high'>Alta</option>
                  <option value='urgent'>Urgente</option>
                </select>
              </div>

              <div className='col-md-2'>
                <label className='form-label'>Categoría</label>
                <select
                  className='form-select'
                  value={filters.category}
                  onChange={e =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                >
                  <option value=''>Todas</option>
                  <option value='Mantenimiento'>Mantenimiento</option>
                  <option value='Seguridad'>Seguridad</option>
                  <option value='Convivencia'>Convivencia</option>
                  <option value='Servicios'>Servicios</option>
                </select>
              </div>

              <div className='col-md-3 d-flex align-items-end gap-2'>
                <button
                  type='button'
                  className='btn btn-outline-secondary'
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({
                      status: '',
                      priority: '',
                      category: '',
                      assignee: '',
                    });
                  }}
                >
                  Limpiar
                </button>
                <div className='btn-group' role='group'>
                  <button
                    type='button'
                    className={`btn btn-outline-primary ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                  >
                    <i className='material-icons'>table_rows</i>
                  </button>
                  <button
                    type='button'
                    className={`btn btn-outline-primary ${viewMode === 'cards' ? 'active' : ''}`}
                    onClick={() => setViewMode('cards')}
                  >
                    <i className='material-icons'>view_module</i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedTickets.length > 0 && (
            <div
              className='bulk-actions mb-3'
              style={{
                backgroundColor: '#fff',
                borderRadius: 'var(--radius)',
                padding: '1rem',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid #e9ecef',
              }}
            >
              <div className='d-flex justify-content-between align-items-center'>
                <span>{selectedTickets.length} ticket(s) seleccionado(s)</span>
                <div className='d-flex gap-2'>
                  <button className='btn btn-sm btn-outline-primary'>
                    Asignar
                  </button>
                  <button className='btn btn-sm btn-outline-success'>
                    Resolver
                  </button>
                  <button className='btn btn-sm btn-outline-secondary'>
                    Cerrar
                  </button>
                  <button className='btn btn-sm btn-outline-info'>
                    Exportar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tickets Table/Cards */}
          <div
            className='ticket-table'
            style={{
              backgroundColor: '#fff',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid #e9ecef',
            }}
          >
            <div
              className='ticket-header'
              style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #e9ecef',
              }}
            >
              <div className='d-flex justify-content-between align-items-center'>
                <h6 className='mb-0'>Tickets ({filteredTickets.length})</h6>
                <div className='ticket-actions d-flex gap-2'>
                  <button className='btn btn-sm btn-outline-secondary'>
                    <i className='material-icons me-1'>file_download</i>
                    Exportar
                  </button>
                  <button className='btn btn-sm btn-outline-primary'>
                    <i className='material-icons me-1'>refresh</i>
                    Actualizar
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'table' ? (
              <div className='table-responsive'>
                <table className='table table-hover mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <div className='form-check'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            checked={
                              selectedTickets.length === filteredTickets.length
                            }
                            onChange={handleSelectAll}
                          />
                        </div>
                      </th>
                      <th>Ticket</th>
                      <th>Asunto</th>
                      <th>Solicitante</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Asignado</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(ticket => {
                      return (
                        <tr key={ticket.id}>
                          <td>
                            <div className='form-check'>
                              <input
                                className='form-check-input'
                                type='checkbox'
                                checked={selectedTickets.includes(ticket.id)}
                                onChange={() => handleTicketSelect(ticket.id)}
                              />
                            </div>
                          </td>
                          <td>
                            <Link
                              href={`/tickets/${ticket.id}`}
                              className='ticket-number fw-bold text-primary text-decoration-none'
                            >
                              T-{ticket.numero}
                            </Link>
                          </td>
                          <td>
                            <div className='ticket-subject fw-semibold'>
                              {ticket.titulo}
                            </div>
                            <div className='small text-muted'>
                              {ticket.categoria}
                            </div>
                          </td>
                          <td>
                            <div>{ticket.solicitante}</div>
                            <div className='small text-muted'>
                              {ticket.unidad}
                            </div>
                          </td>
                          <td>
                            {(() => {
                              const statusKey = mapEstadoToFrontend(
                                ticket.estado,
                              );
                              const status = statusConfig[statusKey];
                              return (
                                <span
                                  className={`ticket-status ${status.class}`}
                                  style={{
                                    backgroundColor: status.bg,
                                    color: status.color,
                                    border: `1px solid ${status.border}`,
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                  }}
                                >
                                  {status.label}
                                </span>
                              );
                            })()}
                          </td>
                          <td>
                            {(() => {
                              const priorityKey = mapPrioridadToFrontend(
                                ticket.prioridad,
                              );
                              const priority = priorityConfig[priorityKey];
                              return (
                                <span
                                  className={`priority-badge ${priority.class}`}
                                  style={{
                                    backgroundColor: priority.bg,
                                    color: priority.color,
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                  }}
                                >
                                  {priority.label}
                                </span>
                              );
                            })()}
                          </td>
                          <td>
                            {ticket.asignado_a ? (
                              <div className='d-flex align-items-center'>
                                <div
                                  className='assignee-avatar me-2'
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                  }}
                                >
                                  {ticket.asignado_a.charAt(0).toUpperCase()}
                                </div>
                                <span className='small'>
                                  {ticket.asignado_a}
                                </span>
                              </div>
                            ) : (
                              <span className='text-muted small'>
                                Sin asignar
                              </span>
                            )}
                          </td>
                          <td>
                            <div className='small'>
                              {formatDate(ticket.fecha_creacion)}
                            </div>
                          </td>
                          <td>
                            <div className='dropdown'>
                              <button
                                className='btn btn-sm btn-outline-secondary dropdown-toggle'
                                type='button'
                                data-bs-toggle='dropdown'
                              >
                                <i className='material-icons'>more_vert</i>
                              </button>
                              <ul className='dropdown-menu'>
                                <li>
                                  <Link
                                    className='dropdown-item'
                                    href={`/tickets/${ticket.id}`}
                                  >
                                    <i className='material-icons me-2'>
                                      visibility
                                    </i>
                                    Ver detalle
                                  </Link>
                                </li>
                                <li>
                                  <button
                                    className='dropdown-item'
                                    type='button'
                                  >
                                    <i className='material-icons me-2'>edit</i>
                                    Editar
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className='dropdown-item'
                                    type='button'
                                  >
                                    <i className='material-icons me-2'>
                                      assignment_ind
                                    </i>
                                    Asignar
                                  </button>
                                </li>
                                <li>
                                  <hr className='dropdown-divider' />
                                </li>
                                <li>
                                  <button
                                    className='dropdown-item text-success'
                                    type='button'
                                  >
                                    <i className='material-icons me-2'>
                                      check_circle
                                    </i>
                                    Resolver
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className='dropdown-item text-secondary'
                                    type='button'
                                  >
                                    <i className='material-icons me-2'>close</i>
                                    Cerrar
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='p-3'>
                <div className='row'>
                  {filteredTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      className='col-12 col-md-6 col-lg-4 mb-3'
                    >
                      <div
                        className='ticket-card'
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: 'var(--radius)',
                          padding: '1rem',
                          boxShadow: 'var(--shadow-sm)',
                          border: '1px solid #e9ecef',
                          cursor: 'pointer',
                        }}
                      >
                        <div className='ticket-card-header d-flex justify-content-between align-items-start mb-3'>
                          <Link
                            href={`/tickets/${ticket.id}`}
                            className='ticket-number fw-bold text-primary text-decoration-none'
                          >
                            {ticket.numero}
                          </Link>
                          <div className='form-check'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              checked={selectedTickets.includes(ticket.id)}
                              onChange={() => handleTicketSelect(ticket.id)}
                            />
                          </div>
                        </div>

                        <h6 className='ticket-subject mb-2'>{ticket.titulo}</h6>

                        <div className='ticket-meta mb-3'>
                          <div className='ticket-meta-item d-flex align-items-center mb-1'>
                            <i
                              className='material-icons me-1'
                              style={{ fontSize: '16px', color: '#6c757d' }}
                            >
                              person
                            </i>
                            <span className='small text-muted'>
                              {ticket.solicitante}
                            </span>
                          </div>
                          {ticket.unidad && (
                            <div className='ticket-meta-item d-flex align-items-center mb-1'>
                              <i
                                className='material-icons me-1'
                                style={{ fontSize: '16px', color: '#6c757d' }}
                              >
                                home
                              </i>
                              <span className='small text-muted'>
                                {ticket.unidad}
                              </span>
                            </div>
                          )}
                          <div className='ticket-meta-item d-flex align-items-center'>
                            <i
                              className='material-icons me-1'
                              style={{ fontSize: '16px', color: '#6c757d' }}
                            >
                              schedule
                            </i>
                            <span className='small text-muted'>
                              {formatDate(ticket.fecha_creacion)}
                            </span>
                          </div>
                        </div>

                        <div className='ticket-badges d-flex flex-wrap gap-2 mb-3'>
                          {(() => {
                            const statusKey = mapEstadoToFrontend(
                              ticket.estado,
                            );
                            const status = statusConfig[statusKey];
                            return (
                              <span
                                className={`ticket-status ${status.class}`}
                                style={{
                                  backgroundColor: status.bg,
                                  color: status.color,
                                  border: `1px solid ${status.border}`,
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '1rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                }}
                              >
                                {status.label}
                              </span>
                            );
                          })()}
                          {(() => {
                            const priorityKey = mapPrioridadToFrontend(
                              ticket.prioridad,
                            );
                            const priority = priorityConfig[priorityKey];
                            return (
                              <span
                                className={`priority-badge ${priority.class}`}
                                style={{
                                  backgroundColor: priority.bg,
                                  color: priority.color,
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                }}
                              >
                                {priority.label}
                              </span>
                            );
                          })()}
                        </div>

                        {ticket.asignado_a && (
                          <div className='ticket-assignee d-flex align-items-center mb-3'>
                            <div
                              className='assignee-avatar me-2'
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                              }}
                            >
                              {ticket.asignado_a.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className='small fw-semibold'>
                                {ticket.asignado_a}
                              </div>
                              <div className='small text-muted'>Asignado</div>
                            </div>
                          </div>
                        )}

                        <div className='d-flex gap-2'>
                          <Link
                            href={`/tickets/${ticket.id}`}
                            className='btn btn-outline-primary btn-sm flex-fill'
                          >
                            Ver detalle
                          </Link>
                          <button className='btn btn-outline-secondary btn-sm'>
                            <i className='material-icons'>more_vert</i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <ModernPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalFilteredItems}
              itemsPerPage={itemsPerPage}
              itemName="tickets"
              onPageChange={goToPage}
            />
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
