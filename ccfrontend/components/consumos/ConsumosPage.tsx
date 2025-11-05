import { Chart, registerables } from 'chart.js';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import Sidebar from '@/components/layout/Sidebar';

Chart.register(...registerables);

// eslint-disable-next-line no-undef
export default function ConsumosPage(): JSX.Element {
  const mainRef = useRef<HTMLCanvasElement | null>(null);
  const monthlyRef = useRef<HTMLCanvasElement | null>(null);
  const weeklyRef = useRef<HTMLCanvasElement | null>(null);
  const [mainChart, setMainChart] = useState<Chart | null>(null);
  const [monthlyChart, setMonthlyChart] = useState<Chart | null>(null);
  const [weeklyChart, setWeeklyChart] = useState<Chart | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);

  // Estados para datos de la API
  interface MensualItem {
    mes: string;
    consumo_total_unidad: number;
    precio_unitario: number;
    cargo_fijo_mensual: number;
    costo_mensual: number;
  }
  interface TrimestralItem {
    trimestre: string;
    consumo_total_trimestral: number;
  }
  interface SemanalItem {
    dia_semana: number;
    promedio_consumo_diario: number;
  }
  interface Estadisticas {
    total_consumo_periodo: number;
    promedio_consumo_mensual: number;
    costo_total_periodo: number;
  }
  interface DetalleItem {
    periodo: string;
    consumo_calculado: number;
    precio_unitario: number;
    cargo_fijo: number;
    costo: number;
  }

  const [mensualData, setMensualData] = useState<MensualItem[]>([]);
  const [trimestralData, setTrimestralData] = useState<TrimestralItem[]>([]);
  const [semanalData, setSemanalData] = useState<SemanalItem[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total_consumo_periodo: 0,
    promedio_consumo_mensual: 0,
    costo_total_periodo: 0,
  });
  const [detalleData, setDetalleData] = useState<DetalleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [medidorId, setMedidorId] = useState(1);
  const [periodoInicio, setPeriodoInicio] = useState('2024-01');
  const [periodoFin, setPeriodoFin] = useState('2025-12');
  const [periodoActual, setPeriodoActual] = useState<
    'month' | 'quarter' | 'year'
  >('month');

  // Función para mapear mes YYYY-MM a abreviatura
  const mapMesToLabel = (mes: string) => {
    const parts = mes.split('-');
    if (parts.length !== 2) {
      return mes;
    }
    const year = parts[0];
    const monthStr = parts[1];
    if (!monthStr) {
      return mes;
    }
    const month = parseInt(monthStr, 10);
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    return `${months[month - 1] || 'Des'} ${year}`;
  };

  // Función para mapear día de semana numérico a nombre
  const mapDiaSemana = (dia: number) => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[dia - 1] || 'Desconocido';
  };

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const baseUrl = 'http://localhost:3000/consumos';
      const params = `medidor_id=${medidorId}&periodo_inicio=${periodoInicio}&periodo_fin=${periodoFin}`;
      const [
        mensualRes,
        trimestralRes,
        semanalRes,
        estadisticasRes,
        detalleRes,
      ] = await Promise.all([
        fetch(`${baseUrl}/mensual?${params}`),
        fetch(`${baseUrl}/trimestral?${params}`),
        fetch(`${baseUrl}/semanal?medidor_id=${medidorId}`),
        fetch(`${baseUrl}/estadisticas?${params}`),
        fetch(`${baseUrl}/detalle?${params}`),
      ]);

      const mensual: MensualItem[] = await mensualRes.json();
      const trimestral: TrimestralItem[] = await trimestralRes.json();
      const semanal: SemanalItem[] = await semanalRes.json();
      const stats: Estadisticas = await estadisticasRes.json();
      const detalle: DetalleItem[] = await detalleRes.json();

      setMensualData(mensual);
      setTrimestralData(trimestral);
      setSemanalData(semanal);
      setEstadisticas(stats);
      setDetalleData(detalle);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [medidorId, periodoInicio, periodoFin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Try to initialize flatpickr if available (optional)
    try {
      const w = window as unknown as { flatpickr?: unknown };
      if (typeof w.flatpickr === 'function') {
        (w.flatpickr as any)('#dateRange', {
          mode: 'range',
          dateFormat: 'd/m/Y',
          locale: (w.flatpickr as any)?.l10ns?.es || undefined,
          defaultDate: ['01/01/2024', '15/09/2024'],
          onChange: (selectedDates: Date[]) => {
            if (
              selectedDates.length === 2 &&
              selectedDates[0] &&
              selectedDates[1]
            ) {
              const start = selectedDates[0];
              const end = selectedDates[1];
              const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
              const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`;
              setPeriodoInicio(startStr);
              setPeriodoFin(endStr);
            }
          },
        });
      }
    } catch {
      // ignore if flatpickr is not present
    }

    // initialize charts after data is loaded
    if (!loading) {
      initializeCharts();
    }

    return () => {
      // cleanup charts
      mainChart?.destroy();
      monthlyChart?.destroy();
      weeklyChart?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, mensualData, trimestralData, semanalData]);

  function initializeCharts() {
    if (mainRef.current) {
      const existingMain = Chart.getChart(
        mainRef.current as unknown as HTMLCanvasElement,
      );
      if (existingMain) {
        existingMain.destroy();
      }
      const ctx = mainRef.current.getContext('2d');
      if (!ctx) {
        return;
      }
      const labels = mensualData.map(item => mapMesToLabel(item.mes));
      const data = mensualData.map(item => item.consumo_total_unidad);
      const c = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Consumo (kWh)',
              data,
              backgroundColor: 'rgba(253, 93, 20, 0.8)',
              borderColor: 'rgb(253, 93, 20)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
      setMainChart(c);
    }

    if (monthlyRef.current) {
      const existingMonthly = Chart.getChart(
        monthlyRef.current as unknown as HTMLCanvasElement,
      );
      if (existingMonthly) {
        existingMonthly.destroy();
      }
      const ctx = monthlyRef.current.getContext('2d');
      if (!ctx) {
        return;
      }
      const labels = trimestralData.map(item => item.trimestre);
      const data = trimestralData.map(item => item.consumo_total_trimestral);
      const c = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: ['#FFB74D', '#4FC3F7', '#CE93D8', '#A5D6A7'],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
      setMonthlyChart(c);
    }

    if (weeklyRef.current) {
      const existingWeekly = Chart.getChart(
        weeklyRef.current as unknown as HTMLCanvasElement,
      );
      if (existingWeekly) {
        existingWeekly.destroy();
      }
      const ctx = weeklyRef.current.getContext('2d');
      if (!ctx) {
        return;
      }
      const labels = semanalData.map(item => mapDiaSemana(item.dia_semana));
      const data = semanalData.map(item => item.promedio_consumo_diario);
      const c = new Chart(ctx, {
        type: 'radar',
        data: {
          labels,
          datasets: [
            {
              label: 'Promedio kWh/día',
              data,
              borderColor: 'rgb(253, 93, 20)',
              backgroundColor: 'rgba(253, 93, 20, 0.2)',
              pointBackgroundColor: 'rgb(253, 93, 20)',
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
      setWeeklyChart(c);
    }
  }

  function changeChartType(type: 'bar' | 'line' | 'area') {
    if (!mainChart) {
      return;
    }
    const chart = mainChart;
    if (type === 'area' || type === 'line') {
      (chart as unknown as { config: { type: string } }).config.type = 'line';
      (chart.data.datasets[0] as unknown as { fill: boolean }).fill =
        type === 'area';
    } else {
      (chart as unknown as { config: { type: string } }).config.type = 'bar';
      (chart.data.datasets[0] as unknown as { fill: boolean }).fill = false;
    }
    chart.update();
  }

  function applyFilters(e?: React.MouseEvent) {
    if (e) {
      e.preventDefault();
    }
    fetchData(); // Refetch data with current filters
  }

  function changePeriodo(periodo: 'month' | 'quarter' | 'year') {
    setPeriodoActual(periodo);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (periodo === 'month') {
      const startMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      const endMonth = startMonth;
      setPeriodoInicio(startMonth);
      setPeriodoFin(endMonth);
    } else if (periodo === 'quarter') {
      const quarter = Math.ceil(currentMonth / 3);
      const startMonth = `${currentYear}-${String((quarter - 1) * 3 + 1).padStart(2, '0')}`;
      const endMonth = `${currentYear}-${String(quarter * 3).padStart(2, '0')}`;
      setPeriodoInicio(startMonth);
      setPeriodoFin(endMonth);
    } else if (periodo === 'year') {
      setPeriodoInicio(`${currentYear}-01`);
      setPeriodoFin(`${currentYear}-12`);
    }
  }

  function exportData(format: 'excel' | 'pdf' | 'csv') {
    const formatNames: Record<string, string> = {
      excel: 'Excel',
      pdf: 'PDF',
      csv: 'CSV',
    };
    // eslint-disable-next-line no-alert
    alert(`Exportando datos en formato ${formatNames[format]}...`);
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `consumos_medidor_${new Date().toISOString().split('T')[0]}.${format}`;
      link.href = '#';
      link.click();
    }, 800);
  }

  function toggleComparison(checked: boolean) {
    setComparisonMode(checked);
    if (checked) {
      // add comparison dataset
      if (mainChart) {
        mainChart.data.datasets.push({
          label: 'Período Anterior',
          data: [145, 134, 178, 145, 123, 156, 167, 134, 156, 178, 156, 134],
          backgroundColor: 'rgba(108, 117, 125, 0.5)',
          borderColor: 'rgb(108, 117, 125)',
          borderWidth: 1,
        });
        (
          mainChart.options.plugins as unknown as {
            legend: { display: boolean };
          }
        ).legend = { display: true };
        mainChart.update();
      }
    } else {
      if (mainChart) {
        mainChart.data.datasets = mainChart.data.datasets.slice(0, 1);
        (
          mainChart.options.plugins as unknown as {
            legend: { display: boolean };
          }
        ).legend = { display: false };
        mainChart.update();
      }
    }
  }

  return (
    <div className='d-flex'>
      <Sidebar />
      <div
        className='main-content flex-grow-1 bg-light'
        style={{ marginLeft: 280 }}
      >
        <header className='bg-white border-bottom shadow-sm p-3'>
          <div className='container-fluid'>
            <div className='row align-items-center'>
              <div className='col-lg-4 d-flex align-items-center'>
                <button
                  className='btn toggle-sidebar d-lg-none me-2'
                  onClick={() => {
                    const sidebar = document.querySelector('.sidebar');
                    const backdrop =
                      document.querySelector('.sidebar-backdrop');
                    sidebar?.classList.toggle('show');
                    backdrop?.classList.toggle('show');
                  }}
                >
                  <span className='material-icons'>menu</span>
                </button>

                <div className='d-flex align-items-center'>
                  <Link
                    href='/medidores'
                    className='btn btn-outline-secondary me-2'
                  >
                    Volver a Medidores
                  </Link>
                  <div>
                    <small className='text-muted'>
                      Medidor seleccionado:{' '}
                      <strong>
                        Medidor {String(medidorId).padStart(3, '0')}
                      </strong>
                    </small>
                  </div>
                </div>
              </div>

              <div className='col-lg-8'>
                <div className='d-flex justify-content-end align-items-center'>
                  <div className='me-3'>
                    <input
                      id='dateRange'
                      className='form-control form-control-sm'
                      placeholder='Rango de fechas'
                      style={{ width: 220 }}
                    />
                  </div>

                  <div className='dropdown'>
                    <button
                      className='btn btn-sm btn-outline-secondary dropdown-toggle'
                      data-bs-toggle='dropdown'
                    >
                      Configuración
                    </button>
                    <ul className='dropdown-menu dropdown-menu-end'>
                      <li>
                        <Link className='dropdown-item' href='/profile'>
                          Mi Perfil
                        </Link>
                      </li>
                      <li>
                        <Link className='dropdown-item' href='/tarifas'>
                          Tarifas de Consumo
                        </Link>
                      </li>
                      <li>
                        <hr className='dropdown-divider' />
                      </li>
                      <li>
                        <Link
                          className='dropdown-item text-danger'
                          href='/login'
                        >
                          Cerrar Sesión
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12 col-lg-3'>
              <div className='filter-panel'>
                <h5 className='mb-3'>
                  <span className='material-icons me-2'>filter_list</span>
                  Filtros
                </h5>
                <div className='mb-3'>
                  <label className='form-label'>Medidor</label>
                  <select
                    id='meterSelect'
                    className='form-select'
                    value={medidorId}
                    onChange={e => setMedidorId(parseInt(e.target.value, 10))}
                  >
                    <option value={1}>Medidor 001</option>
                    <option value={2}>Medidor 002</option>
                    <option value={3}>Medidor 003</option>
                  </select>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Unidad</label>
                  <select id='unitSelect' className='form-select'>
                    <option value='kwh'>kWh</option>
                    <option value='m3'>m3</option>
                  </select>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Período</label>
                  <div className='period-selector'>
                    <button
                      className={`period-btn ${periodoActual === 'month' ? 'active' : ''}`}
                      onClick={() => changePeriodo('month')}
                    >
                      Mes
                    </button>
                    <button
                      className={`period-btn ${periodoActual === 'quarter' ? 'active' : ''}`}
                      onClick={() => changePeriodo('quarter')}
                    >
                      Trimestre
                    </button>
                    <button
                      className={`period-btn ${periodoActual === 'year' ? 'active' : ''}`}
                      onClick={() => changePeriodo('year')}
                    >
                      Año
                    </button>
                  </div>
                </div>
                <div className='d-grid'>
                  <button className='btn btn-primary' onClick={applyFilters}>
                    Aplicar filtros
                  </button>
                </div>
              </div>

              <div className='stats-grid mt-3'>
                <div className='stat-card'>
                  <div className='stat-value'>
                    {estadisticas.total_consumo_periodo}
                  </div>
                  <div className='stat-label'>kWh Total</div>
                  <div className='stat-change positive'>
                    +4.2% vs mes anterior
                  </div>
                </div>

                <div className='stat-card'>
                  <div className='stat-value'>
                    {estadisticas.promedio_consumo_mensual}
                  </div>
                  <div className='stat-label'>kWh Promedio/Mes</div>
                  <div className='stat-change negative'>-1.1% vs periodo</div>
                </div>

                <div className='stat-card'>
                  <div className='stat-value'>
                    ${estadisticas.costo_total_periodo}
                  </div>
                  <div className='stat-label'>Costo Total</div>
                  <div className='stat-change positive'>-2.5% vs periodo</div>
                </div>
              </div>
            </div>

            <div className='col-12 col-lg-9'>
              <div
                className='comparison-mode mb-3'
                style={{ display: comparisonMode ? 'block' : 'none' }}
              >
                <div className='d-flex align-items-center'>
                  <strong>Modo comparación activo</strong>
                </div>
              </div>

              <div className='chart-card'>
                <div className='chart-header d-flex justify-content-between align-items-center'>
                  <h5 className='mb-0'>Tendencia de Consumo</h5>
                  <div>
                    <button
                      className='btn btn-sm btn-outline-secondary me-2'
                      onClick={() => exportData('csv')}
                    >
                      CSV
                    </button>
                    <button
                      className='btn btn-sm btn-primary me-2'
                      onClick={() => exportData('excel')}
                    >
                      Exportar
                    </button>
                    <div
                      className='btn-group'
                      role='group'
                      aria-label='chart types'
                    >
                      <button
                        className='btn btn-sm btn-outline-secondary'
                        onClick={() => changeChartType('bar')}
                      >
                        Bar
                      </button>
                      <button
                        className='btn btn-sm btn-outline-secondary'
                        onClick={() => changeChartType('line')}
                      >
                        Line
                      </button>
                      <button
                        className='btn btn-sm btn-outline-secondary'
                        onClick={() => changeChartType('area')}
                      >
                        Area
                      </button>
                    </div>
                    <div className='form-check form-switch d-inline-block ms-3'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        id='comparisonMode'
                        checked={comparisonMode}
                        onChange={e => toggleComparison(e.target.checked)}
                      />
                      <label
                        className='form-check-label small'
                        htmlFor='comparisonMode'
                      >
                        Comparación
                      </label>
                    </div>
                  </div>
                </div>

                <div className='chart-container' style={{ height: 400 }}>
                  <canvas id='mainChart' ref={mainRef}></canvas>
                </div>
              </div>

              <div className='row mt-3'>
                <div className='col-md-6'>
                  <div className='chart-card'>
                    <div className='chart-header d-flex justify-content-between align-items-center'>
                      <h6 className='mb-0'>Distribución mensual</h6>
                    </div>
                    <div
                      className='chart-container small'
                      style={{ height: 300 }}
                    >
                      <canvas id='monthlyChart' ref={monthlyRef}></canvas>
                    </div>
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='chart-card'>
                    <div className='chart-header d-flex justify-content-between align-items-center'>
                      <h6 className='mb-0'>Promedio semanal</h6>
                    </div>
                    <div
                      className='chart-container small'
                      style={{ height: 300 }}
                    >
                      <canvas id='weeklyChart' ref={weeklyRef}></canvas>
                    </div>
                  </div>
                </div>
              </div>

              <div className='consumption-table mt-3'>
                <div className='d-flex justify-content-between align-items-center p-3 border-bottom'>
                  <h6 className='mb-0'>Detalle de consumos</h6>
                  <div>
                    <button
                      className='btn btn-sm btn-outline-secondary me-2'
                      onClick={() => exportData('pdf')}
                    >
                      PDF
                    </button>
                    <button
                      className='btn btn-sm btn-outline-secondary'
                      onClick={() => exportData('csv')}
                    >
                      CSV
                    </button>
                  </div>
                </div>
                <div className='table-responsive p-3'>
                  <table className='table table-striped mb-0'>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Medidor</th>
                        <th>Consumo</th>
                        <th>Costo</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalleData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.periodo}</td>
                          <td>Medidor {medidorId}</td>
                          <td>{item.consumo_calculado} m³</td>
                          <td>${item.costo.toFixed(2)}</td>
                          <td>
                            <button className='btn btn-sm btn-outline-secondary'>
                              Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
