/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chart, registerables } from 'chart.js';
import React, { useEffect, useRef, useState } from 'react';

import Sidebar from '@/components/layout/Sidebar';


Chart.register(...registerables);

// eslint-disable-next-line no-undef
export default function AmenidadesPage(): JSX.Element {
  const amenityTypeRef = useRef<HTMLCanvasElement | null>(null);
  const trendRef = useRef<HTMLCanvasElement | null>(null);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [amenityTypeData, setAmenityTypeData] = useState({
    labels: [] as string[],
    data: [] as number[],
  });
  const [trendData, setTrendData] = useState({
    labels: [] as string[],
    data: [] as number[],
  });

  useEffect(() => {
    if (amenityTypeRef.current && amenityTypeData.data.length > 0) {
      const ctx = amenityTypeRef.current.getContext('2d');
      if (ctx) {
        const chart = Chart.getChart(amenityTypeRef.current as any);
        if (chart) {chart.destroy();}
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: amenityTypeData.labels,
            datasets: [{ data: amenityTypeData.data, backgroundColor: ['#4FC3F7', '#FFB74D', '#CE93D8', '#A5D6A7', '#6c757d'] }],
          },
          options: { responsive: true, maintainAspectRatio: false },
        });
      }
    }

    if (trendRef.current && trendData.data.length > 0) {
      const ctx = trendRef.current.getContext('2d');
      if (ctx) {
        const chart = Chart.getChart(trendRef.current as any);
        if (chart) {chart.destroy();}
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: trendData.labels,
            datasets: [{ data: trendData.data, borderColor: '#667eea', backgroundColor: 'rgba(102,126,234,0.15)', tension: 0.4 }],
          },
          options: { responsive: true, maintainAspectRatio: false },
        });
      }
    }
  }, [amenityTypeData, trendData]);

  // Cargar datos de amenidades
  useEffect(() => {
    const loadAmenities = async () => {
      try {
        // TODO: Load amenities from API
        // Example: const response = await fetchAmenities();
        // setAmenities(response.data);

        // For now, set empty arrays and update chart data accordingly
        setAmenities([]);

        // Update chart data based on amenities (empty for now)
        setAmenityTypeData({
          labels: [],
          data: [],
        });

        setTrendData({
          labels: [],
          data: [],
        });

      } catch (error) {
        console.error('Error loading amenities:', error);
        setAmenities([]);
        setAmenityTypeData({
          labels: [],
          data: [],
        });
        setTrendData({
          labels: [],
          data: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAmenities();
  }, []);

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content flex-grow-1 bg-light" style={{ marginLeft: 280 }}>
        <header className="bg-white border-bottom shadow-sm p-3">
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Lista de Amenidades</h4>
            <div>
              <button className="btn btn-primary me-2"><span className="material-icons me-1">add</span>Nueva Amenidad</button>
            </div>
          </div>
        </header>

        <main className="container-fluid p-4">
          <div className="row">
            <div className="col-12">
              <div className="stats-grid">
                <div className="summary-card">
                  <div className="summary-icon"><span className="material-icons">pool</span></div>
                  <div className="summary-number">8</div>
                  <div className="summary-label">Piscinas</div>
                  <div className="summary-detail">75% ocupación promedio</div>
                </div>

                <div className="summary-card">
                  <div className="summary-icon"><span className="material-icons">event_available</span></div>
                  <div className="summary-number">6</div>
                  <div className="summary-label">Reservas</div>
                  <div className="summary-detail">Próxima: 2025-09-16</div>
                </div>

                <div className="summary-card">
                  <div className="summary-icon"><span className="material-icons">calendar_month</span></div>
                  <div className="summary-number">4</div>
                  <div className="summary-label">Calendario</div>
                  <div className="summary-detail">Eventos activos</div>
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-12 col-lg-6">
                  <div className="card chart-card p-3">
                    <h6>Tipeo de Amenidades</h6>
                    <div style={{ height: 240 }}>
                      <canvas ref={amenityTypeRef}></canvas>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <div className="card chart-card p-3">
                    <h6>Tendencia de Reservas</h6>
                    <div style={{ height: 240 }}>
                      <canvas ref={trendRef}></canvas>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mt-3">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table mb-0">
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
                        {amenities.map((a: any) => (
                          <tr key={a.id}>
                            <td>{a.name}</td>
                            <td>{a.community}</td>
                            <td>{a.type}</td>
                            <td>{a.capacity}</td>
                            <td>{a.occupancy}%</td>
                            <td>{a.nextReservation}</td>
                            <td>
                              <button className="btn btn-sm btn-outline-secondary me-1">Ver</button>
                              <button className="btn btn-sm btn-outline-primary">Reservar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center">
                  <small className="text-muted">Mostrando {amenities.length} amenidades</small>
                  <nav>
                    <ul className="pagination mb-0">
                      <li className="page-item disabled"><a className="page-link" href="#">«</a></li>
                      <li className="page-item active"><a className="page-link" href="#">1</a></li>
                      <li className="page-item"><a className="page-link" href="#">2</a></li>
                      <li className="page-item"><a className="page-link" href="#">3</a></li>
                      <li className="page-item"><a className="page-link" href="#">»</a></li>
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
