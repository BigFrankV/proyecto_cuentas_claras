'use client';

import { useState, useEffect } from 'react';

import Sidebar from '../layout/Sidebar';

interface Reservation {
  id: number;
  amenity: {
    name: string;
    icon: string;
    community: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  user: string;
  unit: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  purpose?: string;
  numberOfPeople?: number;
}

const AmenidadesReservasPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Mock data for reservations
  const [reservations] = useState<Reservation[]>([
    {
      id: 1,
      amenity: {
        name: 'Piscina Principal',
        icon: 'pool',
        community: 'Torres del Sol',
      },
      date: '2025-09-29',
      startTime: '10:00',
      endTime: '12:00',
      user: 'María González',
      unit: 'Unidad 5A',
      status: 'confirmed',
    },
    {
      id: 2,
      amenity: {
        name: 'Gimnasio Torre A',
        icon: 'fitness_center',
        community: 'Torres del Sol',
      },
      date: '2025-09-30',
      startTime: '18:00',
      endTime: '19:30',
      user: 'Carlos Rodríguez',
      unit: 'Unidad 12B',
      status: 'pending',
    },
    {
      id: 3,
      amenity: {
        name: 'Salón de Eventos',
        icon: 'celebration',
        community: 'Vista Hermosa',
      },
      date: '2025-10-01',
      startTime: '19:00',
      endTime: '23:00',
      user: 'Ana López',
      unit: 'Unidad 8C',
      status: 'confirmed',
    },
  ]);

  // Mock data for summary cards
  const summaryData = {
    todayReservations: 12,
    pendingConfirmations: 3,
    nextHours: 8,
    cancellations: 3,
    attendanceRate: 95,
  };

  useEffect(() => {
    if (selectedAmenity && selectedDate) {
      generateTimeSlots();
    }
  }, [selectedAmenity, selectedDate]);

  const generateTimeSlots = () => {
    const timeSlots = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
      '21:00',
      '22:00',
    ];

    // Mock occupied slots
    const occupiedSlots = ['10:00', '14:00', '18:00'];
    setAvailableTimeSlots(
      timeSlots.filter(slot => !occupiedSlots.includes(slot)),
    );
  };

  const selectTimeSlot = (time: string) => {
    setSelectedTimeSlot(time);
    setStartTime(time);

    // Set end time (1 hour later by default)
    const [hours, minutes] = time.split(':');
    if (hours && minutes) {
      const endHour = (parseInt(hours) + 1) % 24;
      setEndTime(`${endHour.toString().padStart(2, '0')}:${minutes}`);
    }
  };

  const createReservation = () => {
    if (!selectedAmenity || !selectedDate || !startTime || !endTime) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    // Mock reservation creation
    const reservationData = {
      amenity: selectedAmenity,
      date: selectedDate,
      startTime,
      endTime,
      purpose,
      numberOfPeople: numberOfPeople ? parseInt(numberOfPeople) : undefined,
    };

    console.log('Creating reservation:', reservationData);

    // Reset form
    setSelectedAmenity('');
    setSelectedDate('');
    setStartTime('');
    setEndTime('');
    setPurpose('');
    setNumberOfPeople('');
    setSelectedTimeSlot('');
    setShowModal(false);

    alert(
      'Reserva creada exitosamente. Pendiente de confirmación por el administrador.',
    );
  };

  const viewReservation = (id: number) => {
    alert(`Ver detalles de la reserva ${id}`);
  };

  const editReservation = (id: number) => {
    alert(`Editar reserva ${id}`);
  };

  const confirmReservation = (id: number) => {
    if (confirm('¿Confirmar esta reserva?')) {
      alert(`Reserva ${id} confirmada`);
    }
  };

  const cancelReservation = (id: number) => {
    if (confirm('¿Cancelar esta reserva?')) {
      alert(`Reserva ${id} cancelada`);
    }
  };

  const clearFilters = () => {
    // Reset all filters
    const amenityFilter = document.getElementById(
      'amenityFilter',
    ) as HTMLSelectElement;
    const statusFilter = document.getElementById(
      'statusFilter',
    ) as HTMLSelectElement;
    const dateFromFilter = document.getElementById(
      'dateFromFilter',
    ) as HTMLInputElement;
    const dateToFilter = document.getElementById(
      'dateToFilter',
    ) as HTMLInputElement;

    if (amenityFilter) {
      amenityFilter.value = '';
    }
    if (statusFilter) {
      statusFilter.value = '';
    }
    if (dateFromFilter) {
      dateFromFilter.value = '';
    }
    if (dateToFilter) {
      dateToFilter.value = '';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'cancelled':
        return 'bg-danger';
      case 'completed':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  return (
    <div className='d-flex'>
      <Sidebar />
      <div className='main-content flex-grow-1 bg-light'>
        {/* Mobile Navigation Bar */}
        <nav className='navbar navbar-dark bg-primary d-flex d-lg-none'>
          <div className='container-fluid'>
            <button
              className='navbar-toggler border-0'
              type='button'
              id='toggle-sidebar'
            >
              <span className='navbar-toggler-icon'></span>
            </button>
            <a className='navbar-brand me-auto' href='/dashboard'>
              <span className='material-icons align-middle me-1'>
                apartment
              </span>
              Cuentas Claras
            </a>
            <div className='dropdown'>
              <button
                className='btn btn-link text-white p-0'
                type='button'
                id='userDropdownMobile'
                data-bs-toggle='dropdown'
                aria-expanded='false'
              >
                <div className='avatar'>PC</div>
              </button>
              <ul className='dropdown-menu dropdown-menu-end'>
                <li>
                  <a className='dropdown-item' href='/profile'>
                    Perfil
                  </a>
                </li>
                <li>
                  <a className='dropdown-item' href='#'>
                    Configuración
                  </a>
                </li>
                <li>
                  <hr className='dropdown-divider' />
                </li>
                <li>
                  <a className='dropdown-item' href='/login'>
                    Cerrar sesión
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className='container-fluid p-4 p-sm-3 p-md-4'>
          {/* Header */}
          <div className='amenities-header'>
            <div className='row align-items-center'>
              <div className='col-lg-8'>
                <h1 className='h2 mb-2'>
                  <span className='material-icons align-middle me-2'>
                    event_available
                  </span>
                  Reservas de Amenidades
                </h1>
                <p className='text-muted mb-0'>
                  Gestiona las reservas de amenidades de la comunidad
                </p>
              </div>
              <div className='col-lg-4 text-lg-end'>
                <button
                  className='btn btn-primary'
                  onClick={() => setShowModal(true)}
                >
                  <span className='material-icons me-2'>add</span>
                  Nueva Reserva
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className='summary-cards'>
            <div className='summary-card'>
              <div className='summary-icon'>
                <span className='material-icons'>event_available</span>
              </div>
              <div className='summary-number'>
                {summaryData.todayReservations}
              </div>
              <div className='summary-label'>Reservas Hoy</div>
              <div className='summary-detail'>
                {summaryData.pendingConfirmations} pendientes de confirmación
              </div>
            </div>

            <div className='summary-card'>
              <div className='summary-icon'>
                <span className='material-icons'>schedule</span>
              </div>
              <div className='summary-number'>{summaryData.nextHours}</div>
              <div className='summary-label'>Próximas Horas</div>
              <div className='summary-detail'>
                Reservas en las próximas 2 horas
              </div>
            </div>

            <div className='summary-card'>
              <div className='summary-icon'>
                <span className='material-icons'>cancel</span>
              </div>
              <div className='summary-number'>{summaryData.cancellations}</div>
              <div className='summary-label'>Cancelaciones</div>
              <div className='summary-detail'>Esta semana</div>
            </div>

            <div className='summary-card'>
              <div className='summary-icon'>
                <span className='material-icons'>check_circle</span>
              </div>
              <div className='summary-number'>
                {summaryData.attendanceRate}%
              </div>
              <div className='summary-label'>Tasa de Asistencia</div>
              <div className='summary-detail'>Promedio mensual</div>
            </div>
          </div>

          {/* Filters Section */}
          <div className='filters-section'>
            <div className='filters-header'>
              <h3 className='filters-title'>
                <span className='material-icons align-middle me-2'>
                  filter_list
                </span>
                Filtros
              </h3>
              <button
                className='action-btn outline small'
                onClick={clearFilters}
              >
                <span className='material-icons me-1'>clear</span>
                Limpiar
              </button>
            </div>
            <div className='filters-body'>
              <div className='row'>
                <div className='col-md-3'>
                  <div className='form-group'>
                    <label className='form-label'>Amenidad</label>
                    <select className='form-select' id='amenityFilter'>
                      <option value=''>Todas las amenidades</option>
                      <option value='pool'>Piscina</option>
                      <option value='gym'>Gimnasio</option>
                      <option value='hall'>Salón de Eventos</option>
                      <option value='court'>Cancha de Tenis</option>
                    </select>
                  </div>
                </div>
                <div className='col-md-3'>
                  <div className='form-group'>
                    <label className='form-label'>Estado</label>
                    <select className='form-select' id='statusFilter'>
                      <option value=''>Todos los estados</option>
                      <option value='pending'>Pendiente</option>
                      <option value='confirmed'>Confirmada</option>
                      <option value='cancelled'>Cancelada</option>
                      <option value='completed'>Completada</option>
                    </select>
                  </div>
                </div>
                <div className='col-md-3'>
                  <div className='form-group'>
                    <label className='form-label'>Fecha Desde</label>
                    <input
                      type='date'
                      className='form-control'
                      id='dateFromFilter'
                    />
                  </div>
                </div>
                <div className='col-md-3'>
                  <div className='form-group'>
                    <label className='form-label'>Fecha Hasta</label>
                    <input
                      type='date'
                      className='form-control'
                      id='dateToFilter'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reservations List */}
          <div className='reservations-list'>
            <div className='list-header'>
              <h3 className='list-title'>
                <span className='material-icons align-middle me-2'>list</span>
                Reservas Recientes
              </h3>
            </div>

            {reservations.map(reservation => (
              <div
                key={reservation.id}
                className={`reservation-card ${reservation.status}`}
              >
                <div className='row align-items-center'>
                  <div className='col-md-3'>
                    <div className='d-flex align-items-center'>
                      <div className='reservation-icon me-3'>
                        <span className='material-icons'>
                          {reservation.amenity.icon}
                        </span>
                      </div>
                      <div>
                        <h6 className='mb-0'>{reservation.amenity.name}</h6>
                        <small className='text-muted'>
                          Comunidad: {reservation.amenity.community}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className='col-md-2'>
                    <div className='reservation-date'>
                      <span className='material-icons me-1'>
                        calendar_today
                      </span>
                      {new Date(reservation.date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className='reservation-time'>
                      <span className='material-icons me-1'>schedule</span>
                      {reservation.startTime} - {reservation.endTime}
                    </div>
                  </div>
                  <div className='col-md-2'>
                    <div className='reservation-user'>
                      <span className='material-icons me-1'>person</span>
                      {reservation.user}
                    </div>
                    <div className='reservation-unit'>
                      <span className='material-icons me-1'>apartment</span>
                      {reservation.unit}
                    </div>
                  </div>
                  <div className='col-md-2'>
                    <span
                      className={`status-badge ${getStatusBadgeClass(reservation.status)}`}
                    >
                      {getStatusText(reservation.status)}
                    </span>
                  </div>
                  <div className='col-md-3'>
                    <div className='btn-group' role='group'>
                      <button
                        className='btn btn-sm btn-outline-primary'
                        onClick={() => viewReservation(reservation.id)}
                      >
                        <span className='material-icons'>visibility</span>
                      </button>
                      <button
                        className='btn btn-sm btn-outline-secondary'
                        onClick={() => editReservation(reservation.id)}
                      >
                        <span className='material-icons'>edit</span>
                      </button>
                      {reservation.status === 'pending' && (
                        <button
                          className='btn btn-sm btn-outline-success'
                          onClick={() => confirmReservation(reservation.id)}
                        >
                          <span className='material-icons'>check</span>
                        </button>
                      )}
                      <button
                        className='btn btn-sm btn-outline-danger'
                        onClick={() => cancelReservation(reservation.id)}
                      >
                        <span className='material-icons'>cancel</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <nav aria-label='Paginación de reservas' className='mt-4'>
            <ul className='pagination justify-content-center'>
              <li className='page-item disabled'>
                <a className='page-link' href='#' tabIndex={-1}>
                  <span className='material-icons'>chevron_left</span>
                </a>
              </li>
              <li className='page-item active'>
                <a className='page-link' href='#'>
                  1
                </a>
              </li>
              <li className='page-item'>
                <a className='page-link' href='#'>
                  2
                </a>
              </li>
              <li className='page-item'>
                <a className='page-link' href='#'>
                  3
                </a>
              </li>
              <li className='page-item'>
                <a className='page-link' href='#'>
                  <span className='material-icons'>chevron_right</span>
                </a>
              </li>
            </ul>
          </nav>
        </main>
      </div>

      {/* New Reservation Modal */}
      {showModal && (
        <div
          className='modal fade show d-block'
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className='modal-dialog modal-lg'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>
                  <span className='material-icons me-2'>add</span>
                  Nueva Reserva
                </h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className='modal-body'>
                <form>
                  <div className='row'>
                    <div className='col-md-6'>
                      <div className='mb-3'>
                        <label className='form-label'>Amenidad</label>
                        <select
                          className='form-select'
                          value={selectedAmenity}
                          onChange={e => setSelectedAmenity(e.target.value)}
                          required
                        >
                          <option value=''>Seleccionar amenidad</option>
                          <option value='pool'>Piscina Principal</option>
                          <option value='gym'>Gimnasio Torre A</option>
                          <option value='hall'>Salón de Eventos</option>
                          <option value='court'>Cancha de Tenis</option>
                        </select>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='mb-3'>
                        <label className='form-label'>Fecha</label>
                        <input
                          type='date'
                          className='form-control'
                          value={selectedDate}
                          onChange={e => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {selectedAmenity && selectedDate && (
                    <div className='mb-3'>
                      <label className='form-label'>Horario Disponible</label>
                      <div className='time-slots'>
                        {availableTimeSlots.map(slot => (
                          <div
                            key={slot}
                            className={`time-slot ${selectedTimeSlot === slot ? 'selected' : ''}`}
                            onClick={() => selectTimeSlot(slot)}
                          >
                            {slot}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className='row'>
                    <div className='col-md-6'>
                      <div className='mb-3'>
                        <label className='form-label'>Hora Inicio</label>
                        <input
                          type='time'
                          className='form-control'
                          value={startTime}
                          onChange={e => setStartTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='mb-3'>
                        <label className='form-label'>Hora Fin</label>
                        <input
                          type='time'
                          className='form-control'
                          value={endTime}
                          onChange={e => setEndTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className='mb-3'>
                    <label className='form-label'>Propósito</label>
                    <textarea
                      className='form-control'
                      rows={3}
                      placeholder='Describa el propósito de la reserva...'
                      value={purpose}
                      onChange={e => setPurpose(e.target.value)}
                    />
                  </div>

                  <div className='mb-3'>
                    <label className='form-label'>Número de Personas</label>
                    <input
                      type='number'
                      className='form-control'
                      min='1'
                      max='100'
                      value={numberOfPeople}
                      onChange={e => setNumberOfPeople(e.target.value)}
                    />
                  </div>
                </form>
              </div>
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={createReservation}
                >
                  Crear Reserva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .main-content {
          margin-left: 250px;
          padding: 20px;
        }

        .amenities-header {
          margin-bottom: 2rem;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .summary-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
        }

        .summary-number {
          font-size: 2rem;
          font-weight: bold;
          color: #333;
          margin: 0;
        }

        .summary-label {
          font-weight: 600;
          color: #666;
          margin: 0.25rem 0;
        }

        .summary-detail {
          font-size: 0.875rem;
          color: #999;
          margin: 0;
        }

        .filters-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .filters-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          background: white;
          color: #666;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
        }

        .action-btn.outline {
          border: 1px solid #dee2e6;
          background: white;
          color: #666;
        }

        .action-btn.small {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
        }

        .reservation-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          margin-bottom: 1rem;
          border-left: 4px solid #667eea;
        }

        .reservation-card.pending {
          border-left-color: #ffc107;
        }

        .reservation-card.confirmed {
          border-left-color: #28a745;
        }

        .reservation-card.cancelled {
          border-left-color: #dc3545;
        }

        .reservation-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .reservation-date,
        .reservation-time,
        .reservation-user,
        .reservation-unit {
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
          display: flex;
          align-items: center;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          display: inline-block;
        }

        .time-slots {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .time-slot {
          padding: 0.5rem;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
        }

        .time-slot:hover {
          background-color: #f8f9fa;
          border-color: #667eea;
        }

        .time-slot.selected {
          background-color: #667eea;
          color: white;
          border-color: #667eea;
        }

        .time-slot.occupied {
          background-color: #f8f9fa;
          color: #6c757d;
          cursor: not-allowed;
        }

        .pagination .page-link {
          border: none;
          color: #666;
          padding: 0.5rem 0.75rem;
        }

        .pagination .page-item.active .page-link {
          background-color: #667eea;
          border-color: #667eea;
        }

        .pagination .page-link:hover {
          background-color: #f8f9fa;
          color: #667eea;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .filters-body .row > div {
            margin-bottom: 1rem;
          }

          .reservation-card .row > div {
            margin-bottom: 0.5rem;
          }

          .reservation-card .btn-group {
            flex-wrap: wrap;
            gap: 0.25rem;
          }

          .reservation-card .btn-group .btn {
            flex: 1;
            min-width: 40px;
          }
        }
      `}</style>
    </div>
  );
};

export default AmenidadesReservasPage;
