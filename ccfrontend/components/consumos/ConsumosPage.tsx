import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function ConsumosPage(): JSX.Element {
  const mainRef = useRef<HTMLCanvasElement | null>(null);
  const monthlyRef = useRef<HTMLCanvasElement | null>(null);
  const weeklyRef = useRef<HTMLCanvasElement | null>(null);
  const [mainChart, setMainChart] = useState<Chart | null>(null);
  const [monthlyChart, setMonthlyChart] = useState<Chart | null>(null);
  const [weeklyChart, setWeeklyChart] = useState<Chart | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);

  useEffect(() => {
    // Try to initialize flatpickr if available (optional)
    // Initialize flatpickr if available globally (e.g. via CDN). We avoid importing the package
    // because it's not included in dependencies by default in this project.
    try {
      const w = window as any;
      if (typeof w.flatpickr === 'function') {
        w.flatpickr('#dateRange', {
          mode: 'range',
          dateFormat: 'd/m/Y',
          locale: w.flatpickr?.l10ns?.es || undefined,
          defaultDate: ['01/01/2024', '15/09/2024'],
        });
      }
    } catch (err) {
      // ignore if flatpickr is not present
    }

    // initialize charts
    initializeCharts();

    return () => {
      // cleanup charts
      mainChart?.destroy();
      monthlyChart?.destroy();
      weeklyChart?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initializeCharts() {
    if (mainRef.current) {
      // If an existing Chart is attached to this canvas, destroy it first to avoid reuse error
      const existingMain = Chart.getChart(mainRef.current as any);
      if (existingMain) {
        existingMain.destroy();
      }
      const ctx = mainRef.current.getContext('2d');
      if (!ctx) return;
      const c = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'],
          datasets: [
            {
              label: 'Consumo (kWh)',
              data: [134, 145, 167, 156, 98, 145, 156, 142, 168, 189, 142, 125],
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
      const existingMonthly = Chart.getChart(monthlyRef.current as any);
      if (existingMonthly) existingMonthly.destroy();
      const ctx = monthlyRef.current.getContext('2d');
      if (!ctx) return;
      const c = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              data: [450, 466, 456, 475],
              backgroundColor: ['#FFB74D', '#4FC3F7', '#CE93D8', '#A5D6A7'],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
      setMonthlyChart(c);
    }

    if (weeklyRef.current) {
      const existingWeekly = Chart.getChart(weeklyRef.current as any);
      if (existingWeekly) existingWeekly.destroy();
      const ctx = weeklyRef.current.getContext('2d');
      if (!ctx) return;
      const c = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          datasets: [
            {
              label: 'Promedio kWh/día',
              data: [5.2, 5.8, 5.1, 5.9, 6.2, 4.8, 3.2],
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
    if (!mainChart) return;
    const chart = mainChart;
    if (type === 'area' || type === 'line') {
      // Chart.js types are strict — cast to any for runtime mutation
      (chart as any).config.type = 'line';
      // @ts-ignore
      chart.data.datasets[0].fill = type === 'area';
    } else {
      (chart as any).config.type = 'bar';
      // @ts-ignore
      chart.data.datasets[0].fill = false;
    }
    chart.update();
  }

  function applyFilters(e?: React.MouseEvent) {
    if (e) e.preventDefault();
    // Simulate filter application
    const btn = (e?.currentTarget as HTMLButtonElement) || null;
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Aplicando...';
      btn.setAttribute('disabled', 'true');
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.removeAttribute('disabled');
        if (mainChart) {
          const newData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 200) + 50);
          // @ts-ignore
          mainChart.data.datasets[0].data = newData;
          mainChart.update();
        }
        // eslint-disable-next-line no-alert
        alert('Filtros aplicados correctamente');
      }, 1200);
    } else {
      if (mainChart) {
        const newData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 200) + 50);
        // @ts-ignore
        mainChart.data.datasets[0].data = newData;
        mainChart.update();
      }
    }
  }

  function exportData(format: 'excel' | 'pdf' | 'csv') {
    const formatNames: any = { excel: 'Excel', pdf: 'PDF', csv: 'CSV' };
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
          // @ts-ignore
          data: [145, 134, 178, 145, 123, 156, 167, 134, 156, 178, 156, 134],
          backgroundColor: 'rgba(108, 117, 125, 0.5)',
          borderColor: 'rgb(108, 117, 125)',
          borderWidth: 1,
        } as any);
        // @ts-ignore
        mainChart.options.plugins = mainChart.options.plugins || {};
        // @ts-ignore
        mainChart.options.plugins.legend = { display: true };
        mainChart.update();
      }
    } else {
      if (mainChart) {
        // remove comparison dataset
        // @ts-ignore
        mainChart.data.datasets = mainChart.data.datasets.slice(0, 1);
        // @ts-ignore
        mainChart.options.plugins = mainChart.options.plugins || {};
        // @ts-ignore
        mainChart.options.plugins.legend = { display: false };
        mainChart.update();
      }
    }
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content flex-grow-1 bg-light" style={{ marginLeft: 280 }}>
        <header className="bg-white border-bottom shadow-sm p-3">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-lg-4 d-flex align-items-center">
                <button className="btn toggle-sidebar d-lg-none me-2" onClick={() => {
                  const sidebar = document.querySelector('.sidebar');
                  const backdrop = document.querySelector('.sidebar-backdrop');
                  sidebar?.classList.toggle('show');
                  backdrop?.classList.toggle('show');
                }}>
                  <span className="material-icons">menu</span>
                </button>

                <div className="d-flex align-items-center">
                  <a href="/medidores" className="btn btn-outline-secondary me-2">Volver a Medidores</a>
                  <div>
                    <small className="text-muted">Medidor seleccionado: <strong>Medidor 001</strong></small>
                  </div>
                </div>
              </div>

              <div className="col-lg-8">
                <div className="d-flex justify-content-end align-items-center">
                  <div className="me-3">
                    <input id="dateRange" className="form-control form-control-sm" placeholder="Rango de fechas" style={{ width: 220 }} />
                  </div>

                  <div className="dropdown">
                    <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Configuración</button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><a className="dropdown-item" href="/profile">Mi Perfil</a></li>
                      <li><a className="dropdown-item" href="/tarifas">Tarifas de Consumo</a></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><a className="dropdown-item text-danger" href="/login">Cerrar Sesión</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container-fluid p-4">
          <div className="row">
            <div className="col-12 col-lg-3">
              <div className="filter-panel">
                <h5 className="mb-3"><span className="material-icons me-2">filter_list</span>Filtros</h5>
                <div className="mb-3">
                  <label className="form-label">Medidor</label>
                  <select id="meterSelect" className="form-select">
                    <option value="all">Todos</option>
                    <option value="001">Medidor 001</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Unidad</label>
                  <select id="unitSelect" className="form-select">
                    <option value="kwh">kWh</option>
                    <option value="m3">m3</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Período</label>
                  <div className="period-selector">
                    <button className="period-btn" data-period="month" onClick={(e) => { document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active')); (e.currentTarget as HTMLElement).classList.add('active'); }}>Mes</button>
                    <button className="period-btn" data-period="quarter" onClick={(e) => { document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active')); (e.currentTarget as HTMLElement).classList.add('active'); }}>Trimestre</button>
                    <button className="period-btn" data-period="year" onClick={(e) => { document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active')); (e.currentTarget as HTMLElement).classList.add('active'); }}>Año</button>
                  </div>
                </div>
                <div className="d-grid">
                  <button className="btn btn-primary" onClick={applyFilters}>Aplicar filtros</button>
                </div>
              </div>

              <div className="stats-grid mt-3">
                <div className="stat-card">
                  <div className="stat-value">1,847</div>
                  <div className="stat-label">kWh Total</div>
                  <div className="stat-change positive">+4.2% vs mes anterior</div>
                </div>

                <div className="stat-card">
                  <div className="stat-value">154</div>
                  <div className="stat-label">kWh Promedio/Mes</div>
                  <div className="stat-change negative">-1.1% vs periodo</div>
                </div>

                <div className="stat-card">
                  <div className="stat-value">$567,230</div>
                  <div className="stat-label">Costo Total</div>
                  <div className="stat-change positive">-2.5% vs periodo</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-9">
              <div className="comparison-mode mb-3" style={{ display: comparisonMode ? 'block' : 'none' }}>
                <div className="d-flex align-items-center">
                  <strong>Modo comparación activo</strong>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Tendencia de Consumo</h5>
                  <div>
                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => exportData('csv')}>CSV</button>
                    <button className="btn btn-sm btn-primary me-2" onClick={() => exportData('excel')}>Exportar</button>
                    <div className="btn-group" role="group" aria-label="chart types">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => changeChartType('bar')}>Bar</button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => changeChartType('line')}>Line</button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => changeChartType('area')}>Area</button>
                    </div>
                    <div className="form-check form-switch d-inline-block ms-3">
                      <input className="form-check-input" type="checkbox" id="comparisonMode" checked={comparisonMode} onChange={(e) => toggleComparison(e.target.checked)} />
                      <label className="form-check-label small" htmlFor="comparisonMode">Comparación</label>
                    </div>
                  </div>
                </div>

                <div className="chart-container" style={{ height: 400 }}>
                  <canvas id="mainChart" ref={mainRef}></canvas>
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-md-6">
                  <div className="chart-card">
                    <div className="chart-header d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">Distribución mensual</h6>
                    </div>
                    <div className="chart-container small" style={{ height: 300 }}>
                      <canvas id="monthlyChart" ref={monthlyRef}></canvas>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="chart-card">
                    <div className="chart-header d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">Promedio semanal</h6>
                    </div>
                    <div className="chart-container small" style={{ height: 300 }}>
                      <canvas id="weeklyChart" ref={weeklyRef}></canvas>
                    </div>
                  </div>
                </div>
              </div>

              <div className="consumption-table mt-3">
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                  <h6 className="mb-0">Detalle de consumos</h6>
                  <div>
                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => exportData('pdf')}>PDF</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => exportData('csv')}>CSV</button>
                  </div>
                </div>
                <div className="table-responsive p-3">
                  <table className="table table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Medidor</th>
                        <th>Consumo</th>
                        <th>Período</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>01/09/2025</td>
                        <td>Medidor 001</td>
                        <td>34 m3</td>
                        <td>Mensual</td>
                        <td><button className="btn btn-sm btn-outline-secondary">Ver</button></td>
                      </tr>
                      <tr>
                        <td>01/08/2025</td>
                        <td>Medidor 001</td>
                        <td>28 m3</td>
                        <td>Mensual</td>
                        <td><button className="btn btn-sm btn-outline-secondary">Ver</button></td>
                      </tr>
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
