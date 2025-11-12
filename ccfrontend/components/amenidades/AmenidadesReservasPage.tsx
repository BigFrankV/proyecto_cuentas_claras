/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import { useState, useEffect, useCallback } from 'react';

import Sidebar from '@/components/layout/Sidebar';
import ModernPagination from '@/components/ui/ModernPagination';
import PageHeader from '@/components/ui/PageHeader';
import { useAmenidades, useReservasAmenidades } from '@/hooks/useAmenidades';
import unidadesService from '@/lib/unidadesService';
import { useAuth } from '@/lib/useAuth';
import { ReservaAmenidadFormData } from '@/types/amenidades';

const AmenidadesReservasPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedAmenity, setSelectedAmenity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Usar hooks de API
  const { fetchAmenidades } = useAmenidades();

  const { reservas, fetchReservas, createReserva } = useReservasAmenidades();

  // Cargar datos iniciales
  useEffect(() => {
    fetchAmenidades();
    fetchReservas();
  }, [fetchAmenidades, fetchReservas]);

  const [summaryData] = useState({
    todayReservations: 0,
    pendingConfirmations: 0,
    nextHours: 0,
    cancellations: 0,
    attendanceRate: 0,
  });

  // Cargar datos iniciales
  useEffect(() => {
    fetchAmenidades();
    fetchReservas();
  }, [fetchAmenidades, fetchReservas]);

  const generateTimeSlots = useCallback(() => {
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

    // TODO: Load occupied slots from API
    const occupiedSlots: string[] = [];
    setAvailableTimeSlots(
      timeSlots.filter(slot => !occupiedSlots.includes(slot)),
    );
  }, []);

  // Generar slots de tiempo cuando cambian amenidad o fecha
  useEffect(() => {
    if (selectedAmenity && selectedDate) {
      generateTimeSlots();
    }
  }, [selectedAmenity, selectedDate, generateTimeSlots]);

  // Función para obtener la unidad del usuario actual
  const getUserUnidad = useCallback(async (): Promise<number | null> => {
    if (!user?.persona_id || !user?.memberships) {
      return null;
    }

    try {
      // Obtener la primera membresía activa
      const activeMembership = user.memberships.find(m => m.activo);
      if (!activeMembership) {
        return null;
      }

      // Obtener unidades de la comunidad del usuario
      const unidades = await unidadesService.getUnidadesPorComunidad(
        activeMembership.comunidadId,
      );

      // Buscar la unidad que pertenece a la persona del usuario
      // TODO: Implementar lógica para encontrar la unidad correcta del usuario
      // Por ahora, devolver la primera unidad disponible
      if (unidades.length > 0) {
        return unidades[0].id;
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error obteniendo unidad del usuario:', error);
      return null;
    }
  }, [user]);

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

  const createReservation = async () => {
    if (!selectedAmenity || !selectedDate || !startTime || !endTime) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (!user?.persona_id) {
      alert(
        'Error: No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.',
      );
      return;
    }

    // Obtener la unidad del usuario (por ahora usar primera membresía activa)
    const activeMembership = user.memberships?.find(m => m.activo);
    if (!activeMembership) {
      alert('Error: No se encontró una membresía activa para el usuario.');
      return;
    }

    // Obtener la unidad del usuario
    const unidadId = await getUserUnidad();
    if (!unidadId) {
      alert(
        'Error: No se pudo determinar la unidad del usuario. Verifique que tenga una membresía activa.',
      );
      return;
    }

    const reservationData: ReservaAmenidadFormData = {
      unidad_id: unidadId,
      persona_id: user.persona_id,
      inicio: `${selectedDate}T${startTime}:00`,
      fin: `${selectedDate}T${endTime}:00`,
      ...(purpose && { proposito: purpose }),
      ...(numberOfPeople && { numero_personas: parseInt(numberOfPeople) }),
    };

    // Crear la reserva
    await createReserva(selectedAmenity, reservationData);

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
      case 'aprobada':
        return 'bg-success';
      case 'solicitada':
        return 'bg-warning';
      case 'rechazada':
        return 'bg-danger';
      case 'cumplida':
        return 'bg-info';
      case 'cancelada':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aprobada':
        return 'Aprobada';
      case 'solicitada':
        return 'Solicitada';
      case 'rechazada':
        return 'Rechazada';
      case 'cumplida':
        return 'Cumplida';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  // Lógica de paginación
  const totalPages = Math.ceil(reservas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservas = reservas.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
                  <a className='dropdown-item' href='/mi-perfil'>
                    Perfil
                  </a>
                </li>
                <li>
                  <button className='dropdown-item'>Configuración</button>
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
          <PageHeader
            title="Reservas de Amenidades"
            subtitle="Gestión completa de reservas de espacios comunes"
            icon="event_available"
            primaryAction={{
              href: '#',
              label: 'Nueva Reserva',
              icon: 'add',
            }}
            stats={[
              {
                label: 'Reservas Hoy',
                value: summaryData.todayReservations.toString(),
                icon: 'event_available',
                color: 'primary',
              },
              {
                label: 'Pendientes',
                value: summaryData.pendingConfirmations.toString(),
                icon: 'schedule',
                color: 'warning',
              },
              {
                label: 'Próximas Horas',
                value: summaryData.nextHours.toString(),
                icon: 'access_time',
                color: 'info',
              },
            ]}
          >
            <button
              className='btn btn-primary'
              onClick={() => setShowModal(true)}
            >
              <span className='material-icons me-2'>add</span>
              Nueva Reserva
            </button>
          </PageHeader>

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

            {paginatedReservas.map(reservation => (
              <div
                key={reservation.id}
                className={`reservation-card ${reservation.estado}`}
              >
                <div className='row align-items-center'>
                  <div className='col-md-3'>
                    <div className='d-flex align-items-center'>
                      <div className='reservation-icon me-3'>
                        <span className='material-icons'>pool</span>
                      </div>
                      <div>
                        <h6 className='mb-0'>
                          {reservation.amenidad?.nombre || 'Amenidad'}
                        </h6>
                        <small className='text-muted'>
                          Comunidad: {reservation.comunidad_id}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className='col-md-2'>
                    <div className='reservation-date'>
                      <span className='material-icons me-1'>
                        calendar_today
                      </span>
                      {new Date(reservation.inicio).toLocaleDateString(
                        'es-ES',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        },
                      )}
                    </div>
                    <div className='reservation-time'>
                      <span className='material-icons me-1'>schedule</span>
                      {new Date(reservation.inicio).toLocaleTimeString(
                        'es-ES',
                        { hour: '2-digit', minute: '2-digit' },
                      )}{' '}
                      -
                      {new Date(reservation.fin).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className='col-md-2'>
                    <div className='reservation-user'>
                      <span className='material-icons me-1'>person</span>
                      {reservation.persona?.nombre}{' '}
                      {reservation.persona?.apellido}
                    </div>
                    <div className='reservation-unit'>
                      <span className='material-icons me-1'>apartment</span>
                      {reservation.unidad?.numero}
                    </div>
                  </div>
                  <div className='col-md-2'>
                    <span
                      className={`status-badge ${getStatusBadgeClass(reservation.estado)}`}
                    >
                      {getStatusText(reservation.estado)}
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
                      {reservation.estado === 'solicitada' && (
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
          {totalPages > 1 && (
            <ModernPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={reservas.length}
              itemsPerPage={itemsPerPage}
              itemName="reservas"
              onPageChange={goToPage}
            />
          )}
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
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                selectTimeSlot(slot);
                              }
                            }}
                            role='button'
                            tabIndex={0}
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
