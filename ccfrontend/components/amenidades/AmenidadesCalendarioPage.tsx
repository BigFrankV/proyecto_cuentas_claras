/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

import Sidebar from '../layout/Sidebar';

// Dynamic import for FullCalendar to avoid SSR issues
const FullCalendar = dynamic(() => import('@fullcalendar/react'), {
  ssr: false,
});

interface ReservationEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  className: string;
}

const AmenidadesCalendarioPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [events, setEvents] = useState<ReservationEvent[]>([]);
  const [, setIsLoading] = useState(true);

  const handleEventClick = (info: any) => {
    alert(
      `Reserva: ${info.event.title}\nFecha: ${info.event.start.toLocaleDateString()}`,
    );
  };

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
    setShowModal(true);
  };

  const handleNewReservation = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDate('');
  };

  const handleCreateReservation = () => {
    // Here would go the logic to create a reservation
    alert('Reserva creada exitosamente');
    setShowModal(false);
    // Reload calendar or update events
  };

  // Cargar eventos de reservas
  useEffect(() => {
    const loadEvents = async () => {
      try {
        // Aquí iría la llamada a la API cuando esté disponible
        // Por ahora, dejamos vacío hasta que se implemente el servicio
        setEvents([]);
      } catch (error) {
// eslint-disable-next-line no-console
console.error('Error loading events:', error);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <div className='d-flex'>
      <Sidebar />
      <div className='main-content flex-grow-1'>
        <div className='header bg-white p-3 rounded shadow-sm mb-3'>
          <div className='d-flex justify-content-between align-items-center'>
            <div>
              <h4>
                <i className='material-icons'>calendar_today</i> Calendario de
                Reservas - Amenidades
              </h4>
              <p className='mb-0 text-muted'>
                Vista general de todas las reservas por día
              </p>
            </div>
            <div>
              <button
                className='btn btn-primary'
                onClick={handleNewReservation}
              >
                <i className='material-icons'>add</i> Nueva Reserva
              </button>
            </div>
          </div>
        </div>

        <div className='calendar-container bg-white p-3 rounded shadow-sm'>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView='dayGridMonth'
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            dayMaxEvents={3}
            moreLinkClick='popover'
            height='auto'
          />
        </div>

        {/* Modal for New Reservation */}
        {showModal && (
          <div
            className='modal fade show d-block'
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className='modal-dialog modal-lg'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title'>
                    <i className='material-icons'>add</i> Nueva Reserva
                  </h5>
                  <button
                    type='button'
                    className='btn-close'
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className='modal-body'>
                  <form>
                    <div className='row'>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label className='form-label'>Amenidad *</label>
                          <select className='form-select' required>
                            <option value=''>Seleccionar amenidad</option>
                            <option value='piscina'>Piscina</option>
                            <option value='gimnasio'>Gimnasio</option>
                            <option value='salon'>Salón de Eventos</option>
                            <option value='cancha'>Cancha de Fútbol</option>
                          </select>
                        </div>
                      </div>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label className='form-label'>Fecha *</label>
                          <input
                            type='date'
                            className='form-control'
                            defaultValue={selectedDate}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className='row'>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label className='form-label'>Hora Inicio *</label>
                          <input
                            type='time'
                            className='form-control'
                            required
                          />
                        </div>
                      </div>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label className='form-label'>Hora Fin *</label>
                          <input
                            type='time'
                            className='form-control'
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className='mb-3'>
                      <label className='form-label'>Descripción</label>
                      <textarea className='form-control' rows={3}></textarea>
                    </div>
                  </form>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type='button'
                    className='btn btn-primary'
                    onClick={handleCreateReservation}
                  >
                    Crear Reserva
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .main-content {
          margin-left: 250px;
          padding: 20px;
        }
        .calendar-container {
          min-height: 600px;
        }
        .fc-button {
          background-color: #0d6efd !important;
          border-color: #0d6efd !important;
        }
        .fc-button:hover {
          background-color: #0b5ed7 !important;
          border-color: #0a58ca !important;
        }
        .reservation-event {
          background-color: #28a745;
          border-color: #28a745;
          color: white;
        }
        .maintenance-event {
          background-color: #ffc107;
          border-color: #ffc107;
          color: black;
        }
        .unavailable-event {
          background-color: #dc3545;
          border-color: #dc3545;
          color: white;
        }
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AmenidadesCalendarioPage;

