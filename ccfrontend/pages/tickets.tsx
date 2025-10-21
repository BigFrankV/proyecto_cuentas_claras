import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface TicketData {
  id: string;
  number: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  requester: {
    name: string;
    email: string;
    type: 'resident' | 'admin';
    unit?: string;
  };
  assignee?: {
    name: string;
    email: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags: string[];
}

const statusConfig = {
  open: { label: 'Abierto', class: 'open', color: '#1565C0', bg: '#E3F2FD', border: '#2196F3' },
  'in-progress': { label: 'En Progreso', class: 'in-progress', color: '#F57F17', bg: '#FFF8E1', border: '#FFEB3B' },
  resolved: { label: 'Resuelto', class: 'resolved', color: '#2E7D32', bg: '#E8F5E9', border: '#4CAF50' },
  closed: { label: 'Cerrado', class: 'closed', color: '#757575', bg: '#F5F5F5', border: '#9E9E9E' },
  escalated: { label: 'Escalado', class: 'escalated', color: '#C62828', bg: '#FFEBEE', border: '#F44336' }
};

const priorityConfig = {
  low: { label: 'Baja', class: 'low', color: '#2E7D32', bg: '#E8F5E9' },
  medium: { label: 'Media', class: 'medium', color: '#F57F17', bg: '#FFF8E1' },
  high: { label: 'Alta', class: 'high', color: '#C62828', bg: '#FFEBEE' },
  urgent: { label: 'Urgente', class: 'urgent', color: '#FFFFFF', bg: '#7B1FA2' }
};

export default function TicketsListado() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    assignee: ''
  });

  useEffect(() => {
    // Mock data - reemplazar con API call
    setTimeout(() => {
      const mockTickets: TicketData[] = [
        {
          id: '1',
          number: 'T-2024-089',
          subject: 'Problema con ascensor principal',
          description: 'El ascensor principal no funciona desde esta mañana',
          status: 'open',
          priority: 'high',
          category: 'Mantenimiento',
          requester: {
            name: 'María González',
            email: 'maria.gonzalez@email.com',
            type: 'resident',
            unit: 'Edificio A - Depto 301'
          },
          assignee: {
            name: 'Carlos Técnico',
            email: 'carlos@mantenimiento.com',
            avatar: 'CT'
          },
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T14:20:00Z',
          dueDate: '2024-01-16T18:00:00Z',
          tags: ['urgente', 'ascensor']
        },
        {
          id: '2',
          number: 'T-2024-088',
          subject: 'Solicitud de cambio de cerradura',
          description: 'Necesito cambiar la cerradura de mi departamento',
          status: 'resolved',
          priority: 'medium',
          category: 'Seguridad',
          requester: {
            name: 'Juan Pérez',
            email: 'juan.perez@email.com',
            type: 'resident',
            unit: 'Edificio B - Depto 205'
          },
          createdAt: '2024-01-14T09:15:00Z',
          updatedAt: '2024-01-15T11:30:00Z',
          tags: ['cerradura', 'seguridad']
        },
        {
          id: '3',
          number: 'T-2024-087',
          subject: 'Ruido excesivo en las noches',
          description: 'Los vecinos del departamento de arriba hacen mucho ruido por las noches',
          status: 'in-progress',
          priority: 'low',
          category: 'Convivencia',
          requester: {
            name: 'Ana Rodríguez',
            email: 'ana.rodriguez@email.com',
            type: 'resident',
            unit: 'Edificio A - Depto 102'
          },
          assignee: {
            name: 'Patricia Contreras',
            email: 'patricia@admin.com',
            avatar: 'PC'
          },
          createdAt: '2024-01-13T20:45:00Z',
          updatedAt: '2024-01-15T08:10:00Z',
          tags: ['ruido', 'convivencia']
        }
      ];
      setTickets(mockTickets);
      setFilteredTickets(mockTickets);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.requester.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority);
    }

    if (filters.category) {
      filtered = filtered.filter(ticket => ticket.category === filters.category);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, filters]);

  const getStats = () => {
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in-progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    const escalated = tickets.filter(t => t.status === 'escalated').length;
    
    return { open, inProgress, resolved, escalated };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map(t => t.id));
    }
  };

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTickets(prev =>
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
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
          {/* Header */}
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div>
              <h1 className='h3 mb-1'>Tickets de Soporte</h1>
              <p className='text-muted mb-0'>Gestión de solicitudes y reportes</p>
            </div>
            <Link href='/tickets/nuevo' className='btn btn-primary'>
              <i className='material-icons me-2'>add</i>
              Nuevo Ticket
            </Link>
          </div>

          {/* Statistics Cards */}
          <div className='row mb-4'>
            <div className='col-6 col-md-3 mb-3'>
              <div className='stats-card' style={{
                backgroundColor: '#fff',
                borderRadius: 'var(--radius)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                borderLeft: '4px solid #dc3545',
                height: '100%'
              }}>
                <div className='d-flex align-items-center'>
                  <div className='stats-icon danger me-3' style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: 'white',
                    backgroundColor: '#dc3545'
                  }}>
                    <i className='material-icons'>report_problem</i>
                  </div>
                  <div>
                    <div className='stats-number' style={{ fontSize: '2rem', fontWeight: 'bold', color: '#212529' }}>
                      {stats.open}
                    </div>
                    <div className='stats-label' style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                      Abiertos
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-6 col-md-3 mb-3'>
              <div className='stats-card' style={{
                backgroundColor: '#fff',
                borderRadius: 'var(--radius)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                borderLeft: '4px solid #ffc107',
                height: '100%'
              }}>
                <div className='d-flex align-items-center'>
                  <div className='stats-icon warning me-3' style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: 'white',
                    backgroundColor: '#ffc107'
                  }}>
                    <i className='material-icons'>schedule</i>
                  </div>
                  <div>
                    <div className='stats-number' style={{ fontSize: '2rem', fontWeight: 'bold', color: '#212529' }}>
                      {stats.inProgress}
                    </div>
                    <div className='stats-label' style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                      En Progreso
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-6 col-md-3 mb-3'>
              <div className='stats-card' style={{
                backgroundColor: '#fff',
                borderRadius: 'var(--radius)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                borderLeft: '4px solid #28a745',
                height: '100%'
              }}>
                <div className='d-flex align-items-center'>
                  <div className='stats-icon success me-3' style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: 'white',
                    backgroundColor: '#28a745'
                  }}>
                    <i className='material-icons'>check_circle</i>
                  </div>
                  <div>
                    <div className='stats-number' style={{ fontSize: '2rem', fontWeight: 'bold', color: '#212529' }}>
                      {stats.resolved}
                    </div>
                    <div className='stats-label' style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                      Resueltos
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-6 col-md-3 mb-3'>
              <div className='stats-card' style={{
                backgroundColor: '#fff',
                borderRadius: 'var(--radius)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                borderLeft: '4px solid #17a2b8',
                height: '100%'
              }}>
                <div className='d-flex align-items-center'>
                  <div className='stats-icon info me-3' style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: 'white',
                    backgroundColor: '#17a2b8'
                  }}>
                    <i className='material-icons'>priority_high</i>
                  </div>
                  <div>
                    <div className='stats-number' style={{ fontSize: '2rem', fontWeight: 'bold', color: '#212529' }}>
                      {stats.escalated}
                    </div>
                    <div className='stats-label' style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                      Escalados
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className='filters-card mb-4' style={{
            backgroundColor: '#fff',
            borderRadius: 'var(--radius)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid #e9ecef'
          }}>
            <div className='row g-3'>
              <div className='col-md-3'>
                <label className='form-label'>Buscar</label>
                <div className='search-box position-relative'>
                  <i className='material-icons position-absolute' style={{
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6c757d',
                    fontSize: '20px'
                  }}>search</i>
                  <input
                    type='text'
                    className='form-control ps-5'
                    placeholder='Buscar tickets...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className='col-md-2'>
                <label className='form-label'>Estado</label>
                <select
                  className='form-select'
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
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
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
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
                    setFilters({ status: '', priority: '', category: '', assignee: '' });
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
            <div className='bulk-actions mb-3' style={{
              backgroundColor: '#fff',
              borderRadius: 'var(--radius)',
              padding: '1rem',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid #e9ecef'
            }}>
              <div className='d-flex justify-content-between align-items-center'>
                <span>{selectedTickets.length} ticket(s) seleccionado(s)</span>
                <div className='d-flex gap-2'>
                  <button className='btn btn-sm btn-outline-primary'>Asignar</button>
                  <button className='btn btn-sm btn-outline-success'>Resolver</button>
                  <button className='btn btn-sm btn-outline-secondary'>Cerrar</button>
                  <button className='btn btn-sm btn-outline-info'>Exportar</button>
                </div>
              </div>
            </div>
          )}

          {/* Tickets Table/Cards */}
          <div className='ticket-table' style={{
            backgroundColor: '#fff',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid #e9ecef'
          }}>
            <div className='ticket-header' style={{
              backgroundColor: '#f8f9fa',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e9ecef'
            }}>
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
                            checked={selectedTickets.length === filteredTickets.length}
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
                    {filteredTickets.map((ticket) => (
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
                          <Link href={`/tickets/${ticket.id}`} className='ticket-number fw-bold text-primary text-decoration-none'>
                            {ticket.number}
                          </Link>
                        </td>
                        <td>
                          <div className='ticket-subject fw-semibold'>{ticket.subject}</div>
                          <div className='small text-muted'>{ticket.category}</div>
                        </td>
                        <td>
                          <div>{ticket.requester.name}</div>
                          <div className='small text-muted'>{ticket.requester.unit}</div>
                        </td>
                        <td>
                          <span
                            className={`ticket-status ${statusConfig[ticket.status].class}`}
                            style={{
                              backgroundColor: statusConfig[ticket.status].bg,
                              color: statusConfig[ticket.status].color,
                              border: `1px solid ${statusConfig[ticket.status].border}`,
                              padding: '0.25rem 0.75rem',
                              borderRadius: '1rem',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}
                          >
                            {statusConfig[ticket.status].label}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`priority-badge ${priorityConfig[ticket.priority].class}`}
                            style={{
                              backgroundColor: priorityConfig[ticket.priority].bg,
                              color: priorityConfig[ticket.priority].color,
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}
                          >
                            {priorityConfig[ticket.priority].label}
                          </span>
                        </td>
                        <td>
                          {ticket.assignee ? (
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
                                  fontWeight: '600'
                                }}
                              >
                                {ticket.assignee.avatar}
                              </div>
                              <span className='small'>{ticket.assignee.name}</span>
                            </div>
                          ) : (
                            <span className='text-muted small'>Sin asignar</span>
                          )}
                        </td>
                        <td>
                          <div className='small'>{formatDate(ticket.createdAt)}</div>
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
                                <Link className='dropdown-item' href={`/tickets/${ticket.id}`}>
                                  <i className='material-icons me-2'>visibility</i>
                                  Ver detalle
                                </Link>
                              </li>
                              <li>
                                <a className='dropdown-item' href='#'>
                                  <i className='material-icons me-2'>edit</i>
                                  Editar
                                </a>
                              </li>
                              <li>
                                <a className='dropdown-item' href='#'>
                                  <i className='material-icons me-2'>assignment_ind</i>
                                  Asignar
                                </a>
                              </li>
                              <li><hr className='dropdown-divider' /></li>
                              <li>
                                <a className='dropdown-item text-success' href='#'>
                                  <i className='material-icons me-2'>check_circle</i>
                                  Resolver
                                </a>
                              </li>
                              <li>
                                <a className='dropdown-item text-secondary' href='#'>
                                  <i className='material-icons me-2'>close</i>
                                  Cerrar
                                </a>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='p-3'>
                <div className='row'>
                  {filteredTickets.map((ticket) => (
                    <div key={ticket.id} className='col-12 col-md-6 col-lg-4 mb-3'>
                      <div className='ticket-card' style={{
                        backgroundColor: '#fff',
                        borderRadius: 'var(--radius)',
                        padding: '1rem',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid #e9ecef',
                        cursor: 'pointer'
                      }}>
                        <div className='ticket-card-header d-flex justify-content-between align-items-start mb-3'>
                          <Link href={`/tickets/${ticket.id}`} className='ticket-number fw-bold text-primary text-decoration-none'>
                            {ticket.number}
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

                        <h6 className='ticket-subject mb-2'>{ticket.subject}</h6>

                        <div className='ticket-meta mb-3'>
                          <div className='ticket-meta-item d-flex align-items-center mb-1'>
                            <i className='material-icons me-1' style={{ fontSize: '16px', color: '#6c757d' }}>person</i>
                            <span className='small text-muted'>{ticket.requester.name}</span>
                          </div>
                          {ticket.requester.unit && (
                            <div className='ticket-meta-item d-flex align-items-center mb-1'>
                              <i className='material-icons me-1' style={{ fontSize: '16px', color: '#6c757d' }}>home</i>
                              <span className='small text-muted'>{ticket.requester.unit}</span>
                            </div>
                          )}
                          <div className='ticket-meta-item d-flex align-items-center'>
                            <i className='material-icons me-1' style={{ fontSize: '16px', color: '#6c757d' }}>schedule</i>
                            <span className='small text-muted'>{formatDate(ticket.createdAt)}</span>
                          </div>
                        </div>

                        <div className='ticket-badges d-flex flex-wrap gap-2 mb-3'>
                          <span
                            className={`ticket-status ${statusConfig[ticket.status].class}`}
                            style={{
                              backgroundColor: statusConfig[ticket.status].bg,
                              color: statusConfig[ticket.status].color,
                              border: `1px solid ${statusConfig[ticket.status].border}`,
                              padding: '0.25rem 0.75rem',
                              borderRadius: '1rem',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}
                          >
                            {statusConfig[ticket.status].label}
                          </span>
                          <span
                            className={`priority-badge ${priorityConfig[ticket.priority].class}`}
                            style={{
                              backgroundColor: priorityConfig[ticket.priority].bg,
                              color: priorityConfig[ticket.priority].color,
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}
                          >
                            {priorityConfig[ticket.priority].label}
                          </span>
                        </div>

                        {ticket.assignee && (
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
                                fontWeight: '600'
                              }}
                            >
                              {ticket.assignee.avatar}
                            </div>
                            <div>
                              <div className='small fw-semibold'>{ticket.assignee.name}</div>
                              <div className='small text-muted'>Asignado</div>
                            </div>
                          </div>
                        )}

                        <div className='d-flex gap-2'>
                          <Link href={`/tickets/${ticket.id}`} className='btn btn-outline-primary btn-sm flex-fill'>
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
          <div className='d-flex justify-content-between align-items-center mt-4'>
            <div className='text-muted small'>
              Mostrando {filteredTickets.length} de {tickets.length} tickets
            </div>
            <nav>
              <ul className='pagination mb-0'>
                <li className='page-item disabled'>
                  <a className='page-link' href='#'>Anterior</a>
                </li>
                <li className='page-item active'>
                  <a className='page-link' href='#'>1</a>
                </li>
                <li className='page-item'>
                  <a className='page-link' href='#'>2</a>
                </li>
                <li className='page-item'>
                  <a className='page-link' href='#'>3</a>
                </li>
                <li className='page-item'>
                  <a className='page-link' href='#'>Siguiente</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
