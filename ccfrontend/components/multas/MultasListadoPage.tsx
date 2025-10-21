import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';

const MultasListadoPage: React.FC = () => {
  const [selectedFines, setSelectedFines] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');

  // Sample data
  const fines = [
    {
      id: 'M-2024-089',
      violation: 'Ruido excesivo después de las 22:00',
      unit: 'A-101',
      amount: 50000,
      status: 'pending',
      priority: 'medium',
      date: '2024-09-15',
      dueDate: '2024-10-15',
      resident: 'Juan Pérez'
    },
    {
      id: 'M-2024-088',
      violation: 'Estacionamiento indebido',
      unit: 'B-205',
      amount: 30000,
      status: 'paid',
      priority: 'low',
      date: '2024-09-10',
      dueDate: '2024-09-25',
      resident: 'María González'
    },
    {
      id: 'M-2024-087',
      violation: 'Mascotas sin correa',
      unit: 'C-303',
      amount: 25000,
      status: 'overdue',
      priority: 'high',
      date: '2024-08-20',
      dueDate: '2024-09-20',
      resident: 'Carlos Rodríguez'
    }
  ];

  const getStatusBadge = (status: string) => {
    const classes = {
      pending: 'status-pending',
      paid: 'status-paid',
      overdue: 'status-overdue',
      appealed: 'status-appealed',
      cancelled: 'status-cancelled'
    };
    return classes[status as keyof typeof classes] || 'status-pending';
  };

  const getPriorityBadge = (priority: string) => {
    const classes = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high'
    };
    return classes[priority as keyof typeof classes] || 'priority-low';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pendiente',
      paid: 'Pagada',
      overdue: 'Vencida',
      appealed: 'Apelada',
      cancelled: 'Cancelada'
    };
    return texts[status as keyof typeof texts] || 'Pendiente';
  };

  const getPriorityText = (priority: string) => {
    const texts = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta'
    };
    return texts[priority as keyof typeof texts] || 'Baja';
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFines(fines.map(fine => fine.id));
    } else {
      setSelectedFines([]);
    }
  };

  const handleSelectFine = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedFines([...selectedFines, id]);
    } else {
      setSelectedFines(selectedFines.filter(fineId => fineId !== id));
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  return (
    <Layout title='Lista de Multas'>
      <div className='container-fluid p-4'>
        {/* Header con búsqueda y notificaciones */}
        <header className='bg-white border-bottom shadow-sm p-3 mb-4'>
          <div className='d-flex justify-content-between align-items-center'>
            <div className='d-flex align-items-center'>
              <button className='btn btn-link d-lg-none me-3' onClick={() => {/* toggle sidebar */}}>
                <i className='material-icons'>menu</i>
              </button>
              <h1 className='h4 mb-0'>Multas</h1>
            </div>
            <div className='d-flex align-items-center'>
              <div className='input-group me-3' style={{ maxWidth: '300px' }}>
                <span className='input-group-text'><i className='material-icons'>search</i></span>
                <input type='text' className='form-control' placeholder='Buscar multas...' />
              </div>
              <button className='btn btn-outline-secondary me-2'>
                <i className='material-icons'>notifications</i>
              </button>
              <div className='dropdown'>
                <button className='btn btn-outline-secondary dropdown-toggle' type='button' data-bs-toggle='dropdown'>
                  <div className='avatar'>JP</div>
                </button>
                <ul className='dropdown-menu'>
                  <li><a className='dropdown-item' href='#'>Perfil</a></li>
                  <li><a className='dropdown-item' href='#'>Configuración</a></li>
                  <li><hr className='dropdown-divider' /></li>
                  <li><a className='dropdown-item' href='#'>Cerrar sesión</a></li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        {/* Filtros */}
        <div className='filters-panel mb-4'>
          <div className='d-flex flex-wrap align-items-center'>
            <span className='me-3 fw-bold'>Filtros:</span>
            <a href='#' className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              Todas
            </a>
            <a href='#' className={`filter-chip ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
              Pendientes
            </a>
            <a href='#' className={`filter-chip ${filter === 'paid' ? 'active' : ''}`} onClick={() => setFilter('paid')}>
              Pagadas
            </a>
            <a href='#' className={`filter-chip ${filter === 'overdue' ? 'active' : ''}`} onClick={() => setFilter('overdue')}>
              Vencidas
            </a>
            <a href='#' className={`filter-chip ${filter === 'appealed' ? 'active' : ''}`} onClick={() => setFilter('appealed')}>
              Apeladas
            </a>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedFines.length > 0 && (
          <div className='bulk-actions show mb-4'>
            <div className='d-flex justify-content-between align-items-center'>
              <span>{selectedFines.length} multas seleccionadas</span>
              <div>
                <button className='btn btn-light me-2' onClick={() => {/* send reminders */}}>
                  <i className='material-icons me-1'>send</i>
                  Enviar recordatorios
                </button>
                <button className='btn btn-light me-2' onClick={() => {/* mark as paid */}}>
                  <i className='material-icons me-1'>check_circle</i>
                  Marcar como pagadas
                </button>
                <button className='btn btn-light' onClick={() => {/* cancel fines */}}>
                  <i className='material-icons me-1'>cancel</i>
                  Cancelar multas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de multas */}
        <div className='table-responsive d-none d-md-block'>
          <table className='table table-hover'>
            <thead>
              <tr>
                <th>
                  <input
                    type='checkbox'
                    id='selectAll'
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>Número</th>
                <th>Infracción</th>
                <th>Unidad</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Fecha límite</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fines.map((fine) => (
                <tr key={fine.id}>
                  <td>
                    <input
                      type='checkbox'
                      className='fine-checkbox'
                      checked={selectedFines.includes(fine.id)}
                      onChange={(e) => handleSelectFine(fine.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <a href={`/multa-detalle/${fine.id}`} className='text-decoration-none fw-bold'>
                      {fine.id}
                    </a>
                  </td>
                  <td>{fine.violation}</td>
                  <td>{fine.unit}</td>
                  <td>${fine.amount.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(fine.status)}`}>
                      {getStatusText(fine.status)}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-badge ${getPriorityBadge(fine.priority)}`}>
                      {getPriorityText(fine.priority)}
                    </span>
                  </td>
                  <td>
                    <div className='fine-meta'>
                      <div className='fine-date'>{fine.dueDate}</div>
                      <div className={`fine-due-date ${isOverdue(fine.dueDate) ? 'overdue' : isDueSoon(fine.dueDate) ? 'soon' : 'normal'}`}>
                        {isOverdue(fine.dueDate) ? 'Vencida' : isDueSoon(fine.dueDate) ? 'Próxima a vencer' : 'En plazo'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className='btn-group'>
                      <button className='btn btn-sm btn-outline-primary' data-bs-toggle='modal' data-bs-target='#paymentModal'>
                        <i className='material-icons'>payment</i>
                      </button>
                      <button className='btn btn-sm btn-outline-secondary' data-bs-toggle='modal' data-bs-target='#appealModal'>
                        <i className='material-icons'>gavel</i>
                      </button>
                      <button className='btn btn-sm btn-outline-danger'>
                        <i className='material-icons'>cancel</i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className='mobile-cards d-md-none'>
          {fines.map((fine) => (
            <div key={fine.id} className={`fine-card ${fine.status}`}>
              <div className='fine-header'>
                <div>
                  <div className='fine-number'>
                    <a href={`/multa-detalle/${fine.id}`} className='text-decoration-none'>
                      {fine.id}
                    </a>
                  </div>
                  <div className='fine-violation'>{fine.violation}</div>
                  <div className='fine-unit'>{fine.unit}</div>
                </div>
                <div className='text-end'>
                  <div className='fine-amount'>${fine.amount.toLocaleString()}</div>
                  <span className={`status-badge ${getStatusBadge(fine.status)}`}>
                    {getStatusText(fine.status)}
                  </span>
                </div>
              </div>
              <div className='d-flex justify-content-between align-items-center mt-3'>
                <span className={`priority-badge ${getPriorityBadge(fine.priority)}`}>
                  {getPriorityText(fine.priority)}
                </span>
                <div className='btn-group'>
                  <button className='btn btn-sm btn-outline-primary'>
                    <i className='material-icons'>payment</i>
                  </button>
                  <button className='btn btn-sm btn-outline-secondary'>
                    <i className='material-icons'>gavel</i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <nav aria-label='Paginación de multas' className='mt-4'>
          <ul className='pagination justify-content-center'>
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

      {/* Modal para registrar pago */}
      <div className='modal fade' id='paymentModal' tabIndex={-1}>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Registrar Pago</h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal'></button>
            </div>
            <div className='modal-body'>
              <form>
                <div className='mb-3'>
                  <label className='form-label'>Monto</label>
                  <input type='number' className='form-control' placeholder='Ingrese el monto' />
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Fecha de pago</label>
                  <input type='date' className='form-control' />
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Método de pago</label>
                  <select className='form-select'>
                    <option>Efectivo</option>
                    <option>Transferencia</option>
                    <option>Tarjeta de crédito</option>
                  </select>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Referencia</label>
                  <input type='text' className='form-control' placeholder='Número de referencia' />
                </div>
              </form>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>Cancelar</button>
              <button type='button' className='btn btn-primary'>Registrar Pago</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para revisar apelación */}
      <div className='modal fade' id='appealModal' tabIndex={-1}>
        <div className='modal-dialog modal-lg'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Revisar Apelación</h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal'></button>
            </div>
            <div className='modal-body'>
              <div className='mb-3'>
                <label className='form-label'>Motivo de la apelación</label>
                <textarea className='form-control' rows={3} readOnly>
                  El residente solicita reconsideración debido a circunstancias atenuantes...
                </textarea>
              </div>
              <div className='mb-3'>
                <label className='form-label'>Evidencia adjunta</label>
                <div className='d-flex gap-2'>
                  <button className='btn btn-outline-secondary btn-sm'>Ver evidencia 1</button>
                  <button className='btn btn-outline-secondary btn-sm'>Ver evidencia 2</button>
                </div>
              </div>
              <div className='mb-3'>
                <label className='form-label'>Decisión</label>
                <select className='form-select'>
                  <option>Aprobar apelación</option>
                  <option>Rechazar apelación</option>
                  <option>Requerir más información</option>
                </select>
              </div>
              <div className='mb-3'>
                <label className='form-label'>Comentarios</label>
                <textarea className='form-control' rows={3} placeholder='Ingrese sus comentarios...'></textarea>
              </div>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>Cancelar</button>
              <button type='button' className='btn btn-success'>Aprobar</button>
              <button type='button' className='btn btn-danger'>Rechazar</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para acciones masivas */}
      <div className='modal fade' id='bulkActionModal' tabIndex={-1}>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Acciones Masivas</h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal'></button>
            </div>
            <div className='modal-body'>
              <p>¿Qué acción desea realizar con las {selectedFines.length} multas seleccionadas?</p>
              <div className='d-grid gap-2'>
                <button className='btn btn-outline-primary'>Enviar recordatorios</button>
                <button className='btn btn-outline-success'>Marcar como pagadas</button>
                <button className='btn btn-outline-danger'>Cancelar multas</button>
              </div>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MultasListadoPage;