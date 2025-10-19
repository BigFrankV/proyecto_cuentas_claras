import { Chart, registerables } from 'chart.js';
import React, { useEffect, useRef } from 'react';

import Sidebar from '@/components/layout/Sidebar';

Chart.register(...registerables);

const sampleAmenities = [
  {
    id: 1,
    name: 'Piscina Principal',
    type: 'Piscina',
    community: 'Torres del Sol',
    occupancy: 85,
    capacity: 50,
    nextReservation: '2025-09-16 10:00',
  },
  {
    id: 2,
    name: 'Gimnasio Torre A',
    type: 'Gimnasio',
    community: 'Torres del Sol',
    occupancy: 92,
    capacity: 25,
    nextReservation: '2025-09-15 18:00',
  },
  {
    id: 3,
    name: 'Salón de Eventos',
    type: 'Salón',
    community: 'Vista Hermosa',
    occupancy: 45,
    capacity: 100,
    nextReservation: '2025-09-18 19:00',
  },
  {
    id: 4,
    name: 'Cancha de Tenis',
    type: 'Cancha',
    community: 'Parque Central',
    occupancy: 70,
    capacity: 4,
    nextReservation: '2025-09-20 09:00',
  },
  {
    id: 5,
    name: 'Área de Juegos',
    type: 'Juegos',
    community: 'Vista Hermosa',
    occupancy: 60,
    capacity: 20,
    nextReservation: '2025-09-16 15:00',
  },
  {
    id: 6,
    name: 'Quincho Familiar',
    type: 'Quincho',
    community: 'Alameda Norte',
    occupancy: 78,
    capacity: 15,
    nextReservation: '2025-09-15 12:00',
  },
  {
    id: 7,
    name: 'Sala de Reuniones',
    type: 'Sala',
    community: 'Torres del Sol',
    occupancy: 55,
    capacity: 12,
    nextReservation: '2025-09-17 14:00',
  },
  {
    id: 8,
    name: 'Piscina Infantil',
    type: 'Piscina',
    community: 'Parque Central',
    occupancy: 40,
    capacity: 15,
    nextReservation: '2025-09-16 11:00',
  },
];

export default function AmenidadesPage(): JSX.Element {
  const amenityTypeRef = useRef<HTMLCanvasElement | null>(null);
  const trendRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (amenityTypeRef.current) {
      const ctx = amenityTypeRef.current.getContext('2d');
      if (ctx) {
        const chart = Chart.getChart(amenityTypeRef.current as any);
        if (chart) {
          chart.destroy();
        }
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Piscinas', 'Gimnasios', 'Salones', 'Canchas', 'Otros'],
            datasets: [
              {
                data: [2, 1, 1, 1, 3],
                backgroundColor: [
                  '#4FC3F7',
                  '#FFB74D',
                  '#CE93D8',
                  '#A5D6A7',
                  '#6c757d',
                ],
              },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false },
        });
      }
    }

    if (trendRef.current) {
      const ctx = trendRef.current.getContext('2d');
      if (ctx) {
        const chart = Chart.getChart(trendRef.current as any);
        if (chart) {
          chart.destroy();
        }
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'],
            datasets: [
              {
                data: [12, 18, 22, 25, 28, 30],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102,126,234,0.15)',
                tension: 0.4,
              },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false },
        });
      }
    }
  }, []);

  return (
    <div className='d-flex'>
      <Sidebar />
      <div
        className='main-content flex-grow-1 bg-light'
        style={{ marginLeft: 280 }}
      >
        <header className='bg-white border-bottom shadow-sm p-3'>
          <div className='container-fluid d-flex justify-content-between align-items-center'>
            <h4 className='mb-0'>Lista de Amenidades</h4>
            <div>
              <button className='btn btn-primary me-2'>
                <span className='material-icons me-1'>add</span>Nueva Amenidad
              </button>
            </div>
          </div>
        </header>

        <main className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <div className='stats-grid'>
                <div className='summary-card'>
                  <div className='summary-icon'>
                    <span className='material-icons'>pool</span>
                  </div>
                  <div className='summary-number'>8</div>
                  <div className='summary-label'>Piscinas</div>
                  <div className='summary-detail'>75% ocupación promedio</div>
                </div>

                <div className='summary-card'>
                  <div className='summary-icon'>
                    <span className='material-icons'>event_available</span>
                  </div>
                  <div className='summary-number'>6</div>
                  <div className='summary-label'>Reservas</div>
                  <div className='summary-detail'>Próxima: 2025-09-16</div>
                </div>

                <div className='summary-card'>
                  <div className='summary-icon'>
                    <span className='material-icons'>calendar_month</span>
                  </div>
                  <div className='summary-number'>4</div>
                  <div className='summary-label'>Calendario</div>
                  <div className='summary-detail'>Eventos activos</div>
                </div>
              </div>

              <div className='row mt-3'>
                <div className='col-12 col-lg-6'>
                  <div className='card chart-card p-3'>
                    <h6>Tipeo de Amenidades</h6>
                    <div style={{ height: 240 }}>
                      <canvas ref={amenityTypeRef}></canvas>
                    </div>
                  </div>
                </div>
                <div className='col-12 col-lg-6'>
                  <div className='card chart-card p-3'>
                    <h6>Tendencia de Reservas</h6>
                    <div style={{ height: 240 }}>
                      <canvas ref={trendRef}></canvas>
                    </div>
                  </div>
                </div>
              </div>

              <div className='card mt-3'>
                <div className='card-body p-0'>
                  <div className='table-responsive'>
                    <table className='table mb-0'>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Comunidad</th>
                          <th>Tipo</th>
                          <th>Capacidad</th>
                          <th>Ocupación %</th>
                          <th>Próxima Reserva</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sampleAmenities.map(a => (
                          <tr key={a.id}>
                            <td>{a.name}</td>
                            <td>{a.community}</td>
                            <td>{a.type}</td>
                            <td>{a.capacity}</td>
                            <td>{a.occupancy}%</td>
                            <td>{a.nextReservation}</td>
                            <td>
                              <button className='btn btn-sm btn-outline-secondary me-1'>
                                Ver
                              </button>
                              <button className='btn btn-sm btn-outline-primary'>
                                Reservar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className='card-footer d-flex justify-content-between align-items-center'>
                  <small className='text-muted'>
                    Mostrando {sampleAmenities.length} amenidades
                  </small>
                  <nav>
                    <ul className='pagination mb-0'>
                      <li className='page-item disabled'>
                        <a className='page-link' href='#'>
                          «
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
                          »
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
