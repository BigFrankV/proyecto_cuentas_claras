/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chart, registerables } from 'chart.js';
import React, { useEffect, useRef, useState, useCallback } from 'react';

import ModernPagination from '@/components/ui/ModernPagination';
import PageHeader from '@/components/ui/PageHeader';
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

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Lógica de paginación
  const totalPages = Math.ceil(amenidades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAmenidades = amenidades.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
    <PageHeader
      title="Lista de Amenidades"
      subtitle="Gestión completa de amenidades y espacios comunes"
      icon="pool"
      primaryAction={{
        href: '#',
        label: 'Nueva Amenidad',
        icon: 'add',
      }}
      stats={[
        {
          label: 'Total Amenidades',
          value: stats.total_amenidades.toString(),
          icon: 'pool',
          color: 'primary',
        },
        {
          label: 'Amenidades Activas',
          value: stats.amenidades_activas.toString(),
          icon: 'check_circle',
          color: 'success',
        },
        {
          label: 'Reservas del Mes',
          value: stats.reservas_mes_actual.toString(),
          icon: 'event_available',
          color: 'info',
        },
      ]}
    />

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
                        {paginatedAmenidades.map(amenidad => (
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
                <div className='card-footer d-flex justify-content-center'>
                  {totalPages > 1 && (
                    <ModernPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={amenidades.length}
                      itemsPerPage={itemsPerPage}
                      itemName="amenidades"
                      onPageChange={goToPage}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

      <style jsx>{`
        /* Mobile Styles */
        @media (max-width: 991.98px) {
          .container-fluid {
            padding: 1rem !important;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
            gap: 1rem !important;
          }

          .amenity-card {
            margin-bottom: 1rem;
          }
        }

        @media (max-width: 767.98px) {
          .container-fluid {
            padding: 1rem !important;
          }

          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }

          .amenity-card {
            margin-bottom: 0.75rem;
          }

          .chart-container {
            margin-bottom: 1.5rem;
          }

          .chart-container canvas {
            max-height: 250px !important;
          }
        }

        @media (max-width: 575.98px) {
          .container-fluid {
            padding: 0.75rem !important;
          }

          .stats-grid {
            gap: 0.5rem !important;
          }

          .amenity-card {
            padding: 1rem !important;
          }

          .chart-container canvas {
            max-height: 200px !important;
          }
        }

        /* Enhanced Styles */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stats-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
          transition: transform 0.2s ease;
        }

        .stats-card:hover {
          transform: translateY(-2px);
        }

        .stats-card h3 {
          color: #007bff;
          margin-bottom: 0.5rem;
          font-size: 1.5rem;
        }

        .stats-card p {
          color: #6c757d;
          margin: 0;
          font-weight: 500;
        }

        .amenity-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 1rem;
          transition: transform 0.2s ease;
        }

        .amenity-card:hover {
          transform: translateY(-2px);
        }

        .chart-container {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .btn {
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </>
  );
}
