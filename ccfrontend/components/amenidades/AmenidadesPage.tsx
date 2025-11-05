/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chart, registerables } from 'chart.js';
import React, { useEffect, useRef, useState, useCallback } from 'react';

import Sidebar from '@/components/layout/Sidebar';
import { useAmenidades, useReservasAmenidades } from '@/hooks/useAmenidades';
import { AmenidadStats } from '@/types/amenidades';

Chart.register(...registerables);

// eslint-disable-next-line no-undef
export default function AmenidadesPage(): JSX.Element {
  const amenityTypeRef = useRef<HTMLCanvasElement | null>(null);
  const trendRef = useRef<HTMLCanvasElement | null>(null);

  // Usar hooks de API
  const {
    amenidades,
    loading: loadingAmenidades,
    fetchAmenidades,
  } = useAmenidades();

  const {
    reservas,
    loading: loadingReservas,
    fetchReservas,
  } = useReservasAmenidades();

  const isLoading = loadingAmenidades || loadingReservas;

  const [stats, setStats] = useState<AmenidadStats>({
    total_amenidades: 0,
    amenidades_activas: 0,
    reservas_mes_actual: 0,
    ingresos_mes_actual: 0,
    ocupacion_promedio: 0,
    amenidades_mas_utilizadas: [],
  });

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
        if (chart) {
          chart.destroy();
        }
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: amenityTypeData.labels,
            datasets: [
              {
                data: amenityTypeData.data,
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

    if (trendRef.current && trendData.data.length > 0) {
      const ctx = trendRef.current.getContext('2d');
      if (ctx) {
        const chart = Chart.getChart(trendRef.current as any);
        if (chart) {
          chart.destroy();
        }
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: trendData.labels,
            datasets: [
              {
                data: trendData.data,
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
  }, [amenityTypeData, trendData]);

  // Calcular estadísticas basadas en datos reales
  const calculateStats = useCallback(() => {
    const totalAmenidades = amenidades.length;
    const amenidadesActivas = amenidades.filter(
      a => a.requiere_aprobacion,
    ).length;
    const reservasMesActual = reservas.filter(
      r =>
        new Date(r.inicio).getMonth() === new Date().getMonth() &&
        new Date(r.inicio).getFullYear() === new Date().getFullYear(),
    ).length;

    const ingresosMesActual = amenidades.reduce((total, amenidad) => {
      return total + (amenidad.estadisticas_uso?.ingresos_mes_actual || 0);
    }, 0);

    const ocupacionPromedio =
      amenidades.length > 0
        ? amenidades.reduce((total, amenidad) => {
            // Calcular ocupación basada en reservas vs capacidad
            const reservasAmenidad = reservas.filter(
              r => r.amenidad_id === amenidad.id,
            ).length;
            const ocupacion = amenidad.capacidad
              ? (reservasAmenidad / amenidad.capacidad) * 100
              : 0;
            return total + ocupacion;
          }, 0) / amenidades.length
        : 0;

    // Amenidades más utilizadas (top 5 por reservas)
    const amenidadesMasUtilizadas = amenidades
      .map(amenidad => ({
        amenidad: amenidad.nombre,
        reservas: reservas.filter(r => r.amenidad_id === amenidad.id).length,
        ingresos: amenidad.estadisticas_uso?.ingresos_mes_actual || 0,
      }))
      .sort((a, b) => b.reservas - a.reservas)
      .slice(0, 5);

    setStats({
      total_amenidades: totalAmenidades,
      amenidades_activas: amenidadesActivas,
      reservas_mes_actual: reservasMesActual,
      ingresos_mes_actual: ingresosMesActual,
      ocupacion_promedio: Math.round(ocupacionPromedio),
      amenidades_mas_utilizadas: amenidadesMasUtilizadas,
    });
  }, [amenidades, reservas]);

  // Actualizar gráficas cuando cambian los datos
  useEffect(() => {
    if (amenidades.length > 0) {
      // Datos para gráfica de tipos de amenidades
      const tiposAmenidades = new Map<string, number>();
      amenidades.forEach(amenidad => {
        const tipo = amenidad.nombre?.split(' ')[0] || 'Sin tipo';
        const current = tiposAmenidades.get(tipo) || 0;
        tiposAmenidades.set(tipo, current + 1);
      });

      setAmenityTypeData({
        labels: Array.from(tiposAmenidades.keys()),
        data: Array.from(tiposAmenidades.values()),
      });

      // Datos para gráfica de tendencia (últimos 6 meses)
      const meses = [];
      const datosReservas = [];
      for (let i = 5; i >= 0; i--) {
        const fecha = new Date();
        fecha.setMonth(fecha.getMonth() - i);
        const mes = fecha.toLocaleDateString('es-ES', {
          month: 'short',
          year: '2-digit',
        });
        const reservasMes = reservas.filter(r => {
          const fechaReserva = new Date(r.inicio);
          return (
            fechaReserva.getMonth() === fecha.getMonth() &&
            fechaReserva.getFullYear() === fecha.getFullYear()
          );
        }).length;
        meses.push(mes);
        datosReservas.push(reservasMes);
      }

      setTrendData({
        labels: meses,
        data: datosReservas,
      });
    }
  }, [amenidades, reservas]);

  // Cargar datos de amenidades y reservas
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchAmenidades(), fetchReservas()]);
    };

    loadData();
  }, [fetchAmenidades, fetchReservas]);

  // Calcular estadísticas cuando cambian los datos
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

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
                <span className='material-icons me-1'>add</span>
                Nueva Amenidad
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
                  <div className='summary-number'>{stats.total_amenidades}</div>
                  <div className='summary-label'>Amenidades</div>
                  <div className='summary-detail'>
                    {stats.ocupacion_promedio}% ocupación promedio
                  </div>
                </div>

                <div className='summary-card'>
                  <div className='summary-icon'>
                    <span className='material-icons'>event_available</span>
                  </div>
                  <div className='summary-number'>
                    {stats.reservas_mes_actual}
                  </div>
                  <div className='summary-label'>Reservas</div>
                  <div className='summary-detail'>Este mes</div>
                </div>

                <div className='summary-card'>
                  <div className='summary-icon'>
                    <span className='material-icons'>attach_money</span>
                  </div>
                  <div className='summary-number'>
                    ${stats.ingresos_mes_actual}
                  </div>
                  <div className='summary-label'>Ingresos</div>
                  <div className='summary-detail'>Este mes</div>
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
                        {amenidades.map(amenidad => (
                          <tr key={amenidad.id}>
                            <td>{amenidad.nombre}</td>
                            <td>{amenidad.comunidad || 'N/A'}</td>
                            <td>
                              {amenidad.requiere_aprobacion
                                ? 'Requiere aprobación'
                                : 'Libre'}
                            </td>
                            <td>{amenidad.capacidad || 'N/A'}</td>
                            <td>
                              {amenidad.estadisticas_uso?.reservas_mes_actual ||
                                0}
                            </td>
                            <td>
                              {amenidad.tarifa
                                ? `$${amenidad.tarifa}`
                                : 'Gratis'}
                            </td>
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
                    Mostrando {amenidades.length} amenidades
                  </small>
                  <nav>
                    <ul className='pagination mb-0'>
                      <li className='page-item disabled'>
                        <button className='page-link' disabled>
                          «
                        </button>
                      </li>
                      <li className='page-item active'>
                        <button className='page-link' disabled>
                          1
                        </button>
                      </li>
                      <li className='page-item'>
                        <button className='page-link'>2</button>
                      </li>
                      <li className='page-item'>
                        <button className='page-link'>3</button>
                      </li>
                      <li className='page-item'>
                        <button className='page-link'>»</button>
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
