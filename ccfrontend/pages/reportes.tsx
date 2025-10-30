/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import moment from 'moment';
import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

import Layout from '@/components/layout/Layout';
import apiClient from '@/lib/api';
import { ProtectedRoute } from '@/lib/useAuth';


// Allow console.* in this file for debug/info from API calls
/* eslint-disable no-console */

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// Interfaces para tipos de datos
interface ReportData {
  period: string; // '2024-Q1', '2024-10', etc.
  ingresos: number;
  gastos: number;
  saldo: number;
  morosidad: number;
  consumoAgua?: number;
  consumoLuz?: number;
  ticketsAbiertos?: number;
  visitasTotal?: number;
}

interface PeriodOption {
  value: 'monthly' | 'quarterly' | 'yearly';
  label: string;
}

interface GastoData {
  id: number;
  categoria_id: number;
  fecha: string;
  monto: number;
  glosa: string;
}

interface PagoData {
  id: number;
  unidad_id: number;
  emision_id: number;
  fecha: string;
  monto: number;
  estado: string;
}

export default function ReportesDashboard() {
  const [activeTab, setActiveTab] = useState<string>('financiero');
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  const [dateRange] = useState({
    start: moment().subtract(3, 'month').format('YYYY-MM-DD'),
    end: moment().format('YYYY-MM-DD'),
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('quarterly');
  const [isLoading, setIsLoading] = useState(false);
  

  // Estados para datos
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [gastos, setGastos] = useState<GastoData[]>([]);
  const [, setPagos] = useState<PagoData[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketsSummary, setTicketsSummary] = useState<{open: number; closed: number} | null>(null);
  const [reservas, setReservas] = useState<any[]>([]);
  const [bitacora, setBitacora] = useState<any[]>([]);
  // Consumos / Medidores
  const [consumosResumen, setConsumosResumen] = useState<any | null>(null);
  const [consumoServicios, setConsumoServicios] = useState<any[]>([]);
  const [lecturasRecientes, setLecturasRecientes] = useState<any[]>([]);
  // Accesos y Seguridad
  const [accesosVisitas, setAccesosVisitas] = useState<any[]>([]);
  // Financial extras
  const [flujoCaja, setFlujoCaja] = useState<any[]>([]);
  const [ingresosDetallados, setIngresosDetallados] = useState<any[]>([]);
  const [ufHistorico, setUfHistorico] = useState<any[]>([]);
  const [utmHistorico, setUtmHistorico] = useState<any[]>([]);
  // Morosidad extras
  const [estadisticasMorosidad, setEstadisticasMorosidad] = useState<any | null>(null);
  // Gastos extras
  const [centrosCostoResumen, setCentrosCostoResumen] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [searchCommunity, setSearchCommunity] = useState<string>('');
  const [showCommunityList, setShowCommunityList] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cargar datos iniciales
  const loadCommunities = useCallback(async () => {
    try {
      const response = await apiClient.get('/comunidades');
      setCommunities(response.data);
      if (response.data.length > 0 && !selectedCommunity) {
        setSelectedCommunity(response.data[0].id);
      }
    } catch (error) {
      console.error('Error loading communities:', error);
    }
  }, [selectedCommunity]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  const loadReportData = useCallback(async () => {
    if (!selectedCommunity) {
      return;
    }

    setIsLoading(true);
    try {
      // Use specialized report endpoints depending on the active tab to avoid
      // fetching all raw gastos/pagos and re-processing in the frontend.
      if (activeTab === 'financiero') {
        // KPIs
        try {
          const kpisUrl = `/api/reportes/comunidad/${selectedCommunity}/kpis-financieros`;
          const kpisRes = await apiClient.get(kpisUrl);
          const kpis = kpisRes.data;
          // Map KPIs into the reportData last row values used by the UI cards
          setReportData(prev => {
            // keep existing monthly series if present, but update latest KPI values
            const copy = [...prev];
            if (copy.length === 0) {
              // If no monthly data, create a simple last-month entry from KPIs
              const month = moment().format('YYYY-MM');
              copy.push({
                month,
                ingresos: kpis.ingresos_mes || 0,
                gastos: kpis.gastos_mes || 0,
                saldo: kpis.saldo_actual || 0,
                morosidad: kpis.morosidad || 0,
              });
            } else {
              const last = copy[copy.length - 1];
              last.ingresos = kpis.ingresos_mes ?? last.ingresos;
              last.gastos = kpis.gastos_mes ?? last.gastos;
              last.saldo = kpis.saldo_actual ?? last.saldo;
              last.morosidad = kpis.morosidad ?? last.morosidad;
            }
            return copy;
          });
        } catch (err) {
          console.warn('No se pudieron cargar KPIs financieros:', err);
        }

        // Tendencias mensuales (ya agrupadas en backend)
        try {
          const meses = 6; // default range; could be parameterized by UI
          const resumenUrl = `/api/reportes/comunidad/${selectedCommunity}/resumen-financiero`;
          const tendenciasRes = await apiClient.get(resumenUrl, { params: { meses } });
          console.log('Tendencias financieras response:', tendenciasRes.data);
          // Expecting an array like [{ month: '2025-08', ingresos: 123, gastos: 45, saldo: 78 }, ...]
          setReportData(tendenciasRes.data || []);
        } catch (err) {
          console.warn('No se pudieron cargar tendencias financieras:', err);
        }
      } else if (activeTab === 'gastos') {
        // Gastos detallados optimizado para listados/reporte
        try {
          const gastosUrl = `/api/reportes/comunidad/${selectedCommunity}/gastos-detallados`;
          const params = {
            desde: dateRange.start,
            hasta: dateRange.end,
            periodo: selectedPeriod,
          };
          const gastosRes = await apiClient.get(gastosUrl, { params });
          setGastos(gastosRes.data || []);
        } catch (err) {
          console.error('Error cargando gastos detallados:', err);
        }
      } else if (activeTab === 'morosidad') {
        // Morosidad detallada por unidad
        try {
          const morosUrl = `/api/reportes/comunidad/${selectedCommunity}/morosidad-unidades`;
          const params = {
            desde: dateRange.start,
            hasta: dateRange.end,
            periodo: selectedPeriod,
          };
          const morosRes = await apiClient.get(morosUrl, { params });
          // you may want to render this in a dedicated state; we'll place into pagos for now
          setPagos(morosRes.data || []);
        } catch (err) {
          console.error('Error cargando morosidad:', err);
        }
      } else if (activeTab === 'operacional') {
        // Optionally prefetch operational report summaries
        try {
          const params = {
            desde: dateRange.start,
            hasta: dateRange.end,
            periodo: selectedPeriod,
          };
          // Example: tickets soporte
          const ticketsUrl = `/api/reportes/comunidad/${selectedCommunity}/tickets-soporte`;
          const ticketsRes = await apiClient.get(ticketsUrl, { params });
          console.log('Tickets soporte response:', ticketsRes.data);
          setTickets(ticketsRes.data || []);
          // derive simple summary
          const open = (ticketsRes.data || []).filter((t: any) => t.estado !== 'cerrado').length;
          const closed = (ticketsRes.data || []).filter((t: any) => t.estado === 'cerrado').length;
          setTicketsSummary({ open, closed });

          // reservas amenidades
          const reservasUrl = `/api/reportes/comunidad/${selectedCommunity}/reservas-amenidades`;
          const reservasRes = await apiClient.get(reservasUrl, { params });
          console.log('Reservas amenidades response:', reservasRes.data);
          setReservas(reservasRes.data || []);

          // bitacora conserjeria
          const bitacoraUrl = `/api/reportes/comunidad/${selectedCommunity}/bitacora-conserjeria`;
          const bitacoraRes = await apiClient.get(bitacoraUrl, { params });
          console.log('Bitacora conserjeria response:', bitacoraRes.data);
          setBitacora(bitacoraRes.data || []);
        } catch (err) {
          console.warn('No hay datos operacionales o el endpoint no respondió:', err);
        }
      } else if (activeTab === 'consumos') {
        try {
          const params = {
            desde: dateRange.start,
            hasta: dateRange.end,
            periodo: selectedPeriod,
          };
          const resumenUrl = `/api/consumos/comunidad/${selectedCommunity}/resumen`;
          const resumenRes = await apiClient.get(resumenUrl, { params });
          console.log('Consumos resumen response:', resumenRes.data);
          setConsumosResumen(resumenRes.data || null);

          const servicioUrl = `/api/reportes/comunidad/${selectedCommunity}/consumo-servicios`;
          const servicioRes = await apiClient.get(servicioUrl, { params });
          console.log('Consumo servicios response:', servicioRes.data);
          setConsumoServicios(servicioRes.data || []);

          const lecturasUrl = `/api/consumos/comunidad/${selectedCommunity}/lecturas-recientes`;
          const lecturasRes = await apiClient.get(lecturasUrl, { params });
          console.log('Lecturas recientes response:', lecturasRes.data);
          setLecturasRecientes(lecturasRes.data || []);
        } catch (err) {
          console.error('Error cargando consumos/lecturas:', err);
        }
      } else if (activeTab === 'accesos') {
        try {
          const params = {
            desde: dateRange.start,
            hasta: dateRange.end,
            periodo: selectedPeriod,
          };
          const accesosUrl = `/api/reportes/comunidad/${selectedCommunity}/accesos-visitas`;
          const accesosRes = await apiClient.get(accesosUrl, { params });
          console.log('Accesos visitas response:', accesosRes.data);
          setAccesosVisitas(accesosRes.data || []);
        } catch (err) {
          console.error('Error cargando accesos:', err);
        }
      }
      // Additional cross-tab endpoints (financiero, morosidad, gastos) — non-blocking:
      try {
        const flujoUrl = `/comunidades/${selectedCommunity}/flujo-caja`;
        const flujoRes = await apiClient.get(flujoUrl);
        console.log('Flujo caja response:', flujoRes.data);
        setFlujoCaja(flujoRes.data || []);
      } catch (err) {
        console.warn('No se pudieron cargar flujo de caja:', err);
      }
      try {
        const ingresosUrl = `/api/reportes/comunidad/${selectedCommunity}/ingresos-detallados`;
        const ingresosRes = await apiClient.get(ingresosUrl, {
          params: {
            desde: dateRange.start,
            hasta: dateRange.end,
            periodo: selectedPeriod,
          },
        });
        console.log('Ingresos detallados response:', ingresosRes.data);
        setIngresosDetallados(ingresosRes.data || []);
      } catch (err) {
        console.warn('No se pudieron cargar ingresos detallados:', err);
      }
      try {
        const morosUrl = `/api/reportes/comunidad/${selectedCommunity}/estadisticas-morosidad`;
        const morosRes = await apiClient.get(morosUrl, {
          params: {
            desde: dateRange.start,
            hasta: dateRange.end,
            periodo: selectedPeriod,
          },
        });
        console.log('Estadísticas morosidad response:', morosRes.data);
        setEstadisticasMorosidad(morosRes.data || null);
      } catch (err) {
        console.warn('No se pudieron cargar estadísticas de morosidad:', err);
      }
      try {
        const centrosUrl = `/centros-costo/comunidad/${selectedCommunity}/dashboard/resumen`;
        const centrosRes = await apiClient.get(centrosUrl, {
          params: {
            desde: dateRange.start,
            hasta: dateRange.end,
            periodo: selectedPeriod,
          },
        });
        console.log('Centros costo response:', centrosRes.data);
        setCentrosCostoResumen(centrosRes.data || []);
      } catch (err) {
        console.warn('No se pudieron cargar centros de costo:', err);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCommunity, dateRange, activeTab, selectedPeriod]);

  useEffect(() => {
    if (selectedCommunity) {
      loadReportData();
    }
  }, [selectedCommunity, dateRange, activeTab, loadReportData]);

  // NOTE: Data aggregation is now performed in the backend report endpoints.
  // The old `processReportData` logic was removed in favor of using `/api/reportes/...`.

  // Funciones de exportación
  const handleExportFinancial = () => {
    if (!selectedCommunity) {return;}
    // Request backend to generate and return the file (CSV/Excel) as blob
    apiClient.get(`/api/reportes/comunidad/${selectedCommunity}/reporte-completo`, { params: { tipo: 'financial' }, responseType: 'blob' })
      .then(res => {
        const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `reporte_financiero_${selectedCommunity}.xlsx`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setExportMessage({ type: 'success', text: 'Reporte financiero descargado' });
        setTimeout(() => setExportMessage(null), 3000);
      })
      .catch(err => {
        console.error('Error exportando reporte financiero:', err);
        setExportMessage({ type: 'error', text: 'Error al exportar reporte financiero' });
        setTimeout(() => setExportMessage(null), 3000);
      });
  };

  const handleExportGastos = () => {
    if (!selectedCommunity) {return;}
    apiClient.get(`/api/reportes/comunidad/${selectedCommunity}/reporte-completo`, { params: { tipo: 'gastos' }, responseType: 'blob' })
      .then(res => {
        const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `reporte_gastos_${selectedCommunity}.xlsx`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setExportMessage({ type: 'success', text: 'Detalle de gastos descargado' });
        setTimeout(() => setExportMessage(null), 3000);
      })
      .catch(err => {
        console.error('Error exportando gastos:', err);
        setExportMessage({ type: 'error', text: 'Error al exportar detalle de gastos' });
        setTimeout(() => setExportMessage(null), 3000);
      });
  };

  const handleExportAll = async () => {
    if (!selectedCommunity) {return;}
    // Request a combined report from backend
    apiClient.get(`/api/reportes/comunidad/${selectedCommunity}/reporte-completo`, { params: { tipo: 'all' }, responseType: 'blob' })
      .then(res => {
        const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `reporte_completo_${selectedCommunity}.zip`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setExportMessage({ type: 'success', text: 'Exportación completa iniciada' });
        setTimeout(() => setExportMessage(null), 3000);
      })
      .catch(err => {
        console.error('Error exportando todos los reportes:', err);
        setExportMessage({ type: 'error', text: 'Error al exportar reportes' });
        setTimeout(() => setExportMessage(null), 3000);
      });
  };

  // Configuraciones de gráficos
  const financialTrendData = {
    labels: reportData.map(d => moment(d.month).format('MMM YYYY')),
    datasets: [
      {
        label: 'Ingresos',
        data: reportData.map(d => d.ingresos),
        borderColor: '#198754',
        backgroundColor: 'rgba(25,135,84,0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Gastos',
        data: reportData.map(d => d.gastos),
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220,53,69,0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback(value: any) {
            return new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
            }).format(value);
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label(context: any) {
            return `${context.dataset.label}: ${  
              new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
              }).format(context.parsed.y)}`;
          },
        },
      },
    },
  };

  const renderFinancialReport = () => {
    // Use flujo-caja if available, else fallback to resumen-financiero
    const flujoData = flujoCaja && flujoCaja.length > 0 ? flujoCaja : reportData;
    const flujoTrendData = {
      labels: flujoData.map(d => moment(d.month || d.fecha).format('MMM YYYY')),
      datasets: [
        {
          label: 'Entradas',
          data: flujoData.map(d => d.entradas || d.ingresos || 0),
          borderColor: '#198754',
          backgroundColor: 'rgba(25,135,84,0.1)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Salidas',
          data: flujoData.map(d => d.salidas || d.gastos || 0),
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220,53,69,0.1)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Saldo',
          data: flujoData.map(d => d.saldo || 0),
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13,110,253,0.1)',
          fill: false,
          tension: 0.3,
        },
      ],
    };

    return (
      <div id="reporteFinanciero" className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0">Resumen Financiero</h2>
          <div className="text-muted">
            <span className="material-icons align-middle me-1">update</span>
            Última actualización: {moment().format('DD/MM/YYYY')}
          </div>
        </div>

        {/* KPIs */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-xl-3">
            <div className="card app-card shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <span className="material-icons text-success" style={{fontSize: '2rem'}}>trending_up</span>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-0 text-muted">Ingresos del Mes</h6>
                    <h4 className="mb-0 text-success">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                      }).format(flujoData[flujoData.length - 1]?.entradas || flujoData[flujoData.length - 1]?.ingresos || 0)}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card app-card shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <span className="material-icons text-danger" style={{fontSize: '2rem'}}>trending_down</span>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-0 text-muted">Gastos del Mes</h6>
                    <h4 className="mb-0 text-danger">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                      }).format(flujoData[flujoData.length - 1]?.salidas || flujoData[flujoData.length - 1]?.gastos || 0)}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card app-card shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <span className="material-icons text-primary" style={{fontSize: '2rem'}}>account_balance</span>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-0 text-muted">Saldo Actual</h6>
                    <h4 className="mb-0 text-primary">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                      }).format(flujoData[flujoData.length - 1]?.saldo || 0)}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card app-card shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <span className="material-icons text-warning" style={{fontSize: '2rem'}}>warning</span>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-0 text-muted">Morosidad</h6>
                    <h4 className="mb-0 text-warning">{(reportData[reportData.length - 1]?.morosidad || 0).toFixed(1)}%</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico principal */}
        <div className="card app-card shadow-sm mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Flujo de Caja</h5>
            <div className="btn-group" role="group">
              <button type="button" className="btn btn-sm btn-outline-primary active">3M</button>
              <button type="button" className="btn btn-sm btn-outline-primary">6M</button>
              <button type="button" className="btn btn-sm btn-outline-primary">1A</button>
            </div>
          </div>
          <div className="card-body">
            <div style={{ position: 'relative', height: '350px' }}>
              <Line data={flujoTrendData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Tabla de ingresos detallados */}
        {ingresosDetallados && ingresosDetallados.length > 0 && (
          <div className="card app-card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Ingresos Detallados</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Concepto</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {ingresosDetallados.slice(0, 10).map((ing: any) => (
                    <tr key={ing.id}>
                      <td>{moment(ing.fecha).format('DD/MM/YYYY')}</td>
                      <td>{ing.concepto || ing.descripcion}</td>
                      <td className="text-end">
                        {new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                        }).format(ing.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMorosidadReport = () => {
    const agingData = estadisticasMorosidad ? {
      labels: ['0-30 días', '31-60 días', '61-90 días', '+90 días'],
      datasets: [
        {
          label: 'Monto Moroso',
          data: [
            estadisticasMorosidad['0-30'] || 0,
            estadisticasMorosidad['31-60'] || 0,
            estadisticasMorosidad['61-90'] || 0,
            estadisticasMorosidad['90+'] || 0,
          ],
          backgroundColor: ['#ffc107', '#fd7e14', '#dc3545', '#6c757d'],
        },
      ],
    } : null;

    return (
      <div id="reporteMorosidad" className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0">Análisis de Morosidad</h2>
          <div className="text-muted">
            <span className="material-icons align-middle me-1">update</span>
            Última actualización: {moment().format('DD/MM/YYYY')}
          </div>
        </div>

        {agingData && (
          <div className="card app-card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Aging Report de Deudas</h5>
            </div>
            <div className="card-body">
              <div style={{ position: 'relative', height: '300px' }}>
                <Bar data={agingData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback(value: any) {
                          return new Intl.NumberFormat('es-CL', {
                            style: 'currency',
                            currency: 'CLP',
                          }).format(value);
                        },
                      },
                    },
                  },
                }} />
              </div>
            </div>
          </div>
        )}

        <div className="alert alert-info">
          <span className="material-icons me-2">info</span>
          Lista de morosos por unidad (desarrollo pendiente)
        </div>
      </div>
    );
  };

  const renderGastosReport = () => {
    const centrosData = centrosCostoResumen && centrosCostoResumen.length > 0 ? {
      labels: centrosCostoResumen.map((c: any) => c.nombre || c.centro),
      datasets: [
        {
          label: 'Gastos por Centro de Costo',
          data: centrosCostoResumen.map((c: any) => c.total || c.monto || 0),
          backgroundColor: ['#198754', '#dc3545', '#ffc107', '#0d6efd', '#6c757d'],
        },
      ],
    } : null;

    return (
      <div id="reporteGastos" className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0">Análisis de Gastos</h2>
          <div className="text-muted">
            <span className="material-icons align-middle me-1">update</span>
            Última actualización: {moment().format('DD/MM/YYYY')}
          </div>
        </div>

        {centrosData && (
          <div className="card app-card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Gastos por Centro de Costo</h5>
            </div>
            <div className="card-body">
              <div style={{ position: 'relative', height: '300px' }}>
                <Bar data={centrosData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback(value: any) {
                          return new Intl.NumberFormat('es-CL', {
                            style: 'currency',
                            currency: 'CLP',
                          }).format(value);
                        },
                      },
                    },
                  },
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Tabla de gastos */}
        <div className="card app-card shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Gastos Recientes</h5>
            <button className="btn btn-sm btn-outline-primary">
              <span className="material-icons align-middle me-1">download</span>
              Exportar
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {gastos.slice(0, 10).map((gasto) => (
                  <tr key={gasto.id}>
                    <td>{moment(gasto.fecha).format('DD/MM/YYYY')}</td>
                    <td>
                      <span className="badge bg-primary">
                        Categoría {gasto.categoria_id}
                      </span>
                    </td>
                    <td>{gasto.glosa}</td>
                    <td className="text-end">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                      }).format(gasto.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderOperationalReport = () => {
    const ticketsByCategory = tickets && tickets.length > 0
      ? (Object.entries((tickets || []).reduce((acc: any, t: any) => {
        acc[t.categoria || 'Sin categoría'] = (acc[t.categoria || 'Sin categoría'] || 0) + 1;
        return acc;
      }, {})) as [string, any][])
      : [];

    const ticketsBarData = ticketsByCategory.length > 0 ? {
      labels: ticketsByCategory.map(([cat]) => cat),
      datasets: [
        {
          label: 'Tickets por Categoría',
          data: ticketsByCategory.map(([, count]) => count),
          backgroundColor: ['#198754', '#dc3545', '#ffc107', '#0d6efd', '#6c757d'],
        },
      ],
    } : null;

    return (
      <div id="reporteOperacional" className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0">Operaciones y Gestión</h2>
          <div className="text-muted">Última actualización: {moment().format('DD/MM/YYYY')}</div>
        </div>

        {/* Tickets resumen */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="card app-card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Tickets de Soporte</h5>
                {ticketsSummary ? (
                  <div className="d-flex align-items-center">
                    <div style={{ width: 140, height: 140 }}>
                      <Doughnut
                        data={{
                          labels: ['Abiertos', 'Cerrados'],
                          datasets: [{
                            data: [ticketsSummary.open, ticketsSummary.closed],
                            backgroundColor: ['#ffc107', '#198754'],
                          }],
                        }}
                        options={{ maintainAspectRatio: false }}
                      />
                    </div>
                    <div className="ms-3">
                      <div>Abiertos: <strong>{ticketsSummary.open}</strong></div>
                      <div>Cerrados: <strong>{ticketsSummary.closed}</strong></div>
                      <div>Total: <strong>{(tickets || []).length}</strong></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted">No hay datos de tickets</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card app-card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Reservas de Amenidades</h5>
                {reservas && reservas.length > 0 ? (
                  <div>
                    <ul className="list-unstyled mb-0">
                      {(Object.entries((reservas || []).reduce((acc: any, r: any) => {
                        acc[r.amenidad_nombre] = (acc[r.amenidad_nombre] || 0) + 1;
                        return acc;
                      }, {})) as [string, any][])
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([name, count]) => (
                          <li key={name} className="mb-1">
                            {name} <span className="text-muted">({count})</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-muted">Sin reservas registradas</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {ticketsBarData && (
          <div className="card app-card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Tickets por Categoría</h5>
            </div>
            <div className="card-body">
              <div style={{ position: 'relative', height: '300px' }}>
                <Bar data={ticketsBarData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Bitácora */}
        <div className="card app-card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title">Bitácora Conserjería (reciente)</h5>
            {bitacora && bitacora.length > 0 ? (
              <ul className="list-group list-group-flush">
                {bitacora.slice(0, 10).map((ev: any) => (
                  <li key={ev.id || ev.fecha} className="list-group-item">
                    <div className="small text-muted">
                      {moment(ev.fecha).format('DD/MM/YYYY HH:mm')}
                    </div>
                    <div>{ev.texto || ev.descripcion || JSON.stringify(ev)}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted">No hay eventos recientes</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderConsumosReport = () => (
    <div id="reporteConsumos" className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Consumos y Medidores</h2>
        <div className="text-muted">Última actualización: {moment().format('DD/MM/YYYY')}</div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card app-card shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">Consumo total (mes)</small>
              <div className="h4 mb-0">{consumosResumen?.total ? consumosResumen.total : '—'}</div>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card app-card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Tendencias de Consumo</h5>
              {consumoServicios && consumoServicios.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr><th>Medidor/Servicio</th><th>Periodo</th><th>Consumo</th></tr>
                    </thead>
                    <tbody>
                      {consumoServicios.map((c: any, i: number) => (
                        <tr key={i}>
                          <td>{c.servicio || c.nombre || 'Servicio'}</td>
                          <td>{c.periodo || c.mes || ''}</td>
                          <td>{c.consumo || c.valor || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-muted">No hay datos de consumo</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card app-card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Lecturas recientes</h5>
          {lecturasRecientes && lecturasRecientes.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead><tr><th>Fecha</th><th>Medidor</th><th>Valor</th></tr></thead>
                <tbody>
                  {lecturasRecientes.map((l: any) => (
                    <tr key={l.id || l.fecha}>
                      <td>{moment(l.fecha).format('DD/MM/YYYY')}</td>
                      <td>{l.medidor || l.tipo}</td>
                      <td>{l.valor || l.lectura}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted">No hay lecturas recientes</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAccesosReport = () => (
    <div id="reporteAccesos" className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Accesos y Seguridad</h2>
        <div className="text-muted">Última actualización: {moment().format('DD/MM/YYYY')}</div>
      </div>

      <div className="card app-card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Visitas y Accesos</h5>
          {accesosVisitas && accesosVisitas.length > 0 ? (
            <div>
              <div className="small text-muted mb-2">Total visitas: {accesosVisitas.length}</div>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead><tr><th>Fecha</th><th>Visitante</th><th>Destino</th></tr></thead>
                  <tbody>
                    {accesosVisitas.slice(0, 10).map((a: any) => (
                      <tr key={a.id || a.fecha}>
                        <td>{moment(a.fecha).format('DD/MM/YYYY HH:mm')}</td>
                        <td>{a.visitante || a.nombre}</td>
                        <td>{a.destino || a.unidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-muted">No hay registros de accesos</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <Head>
        <title>Reportes — Cuentas Claras</title>
        <link rel="stylesheet" href="/styles/reportes.css" />
      </Head>

      <Layout title='Reportes y Analítica'>
        <div className='container-fluid fade-in'>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">Reportes y Analítica</h1>
              <p className="text-muted mb-0">Monitoreo detallado y análisis de datos</p>
            </div>
            
            {/* Filtros */}
            <div className="d-flex">
              <div className='position-relative' style={{ minWidth: '280px' }}>
                <div className='input-group'>
                  <span className='input-group-text bg-white border-end-0'>
                    <span className='material-icons'>domain</span>
                  </span>
                  <input
                    type='text'
                    className='form-control border-start-0'
                    placeholder='Buscar comunidad...'
                    value={
                      showCommunityList
                        ? searchCommunity
                        : communities.find(
                          (c) => c.id === selectedCommunity,
                        )?.nombre || 'Seleccionar Comunidad'
                    }
                    onChange={(e) => {
                      setSearchCommunity(e.target.value);
                      setShowCommunityList(true);
                    }}
                    onFocus={() => setShowCommunityList(true)}
                    onBlur={() => setTimeout(() => setShowCommunityList(false), 200)}
                  />
                </div>

                {/* Dropdown con resultados de búsqueda (misma UX que en Dashboard) */}
                {showCommunityList && (
                  <div
                    className='position-absolute w-100 mt-1 bg-white border rounded shadow-sm'
                    style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}
                  >
                    {communities
                      .filter((c) =>
                        c.nombre
                          .toLowerCase()
                          .includes(searchCommunity.toLowerCase()),
                      )
                      .map((comunidad) => (
                        <button
                          key={comunidad.id}
                          className={`d-block w-100 text-start px-3 py-2 border-0 bg-white ${
                            comunidad.id === selectedCommunity ? 'bg-light' : ''
                          }`}
                          style={{ cursor: 'pointer' }}
                          onMouseDown={() => {
                            setSelectedCommunity(comunidad.id);
                            setSearchCommunity('');
                            setShowCommunityList(false);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              comunidad.id === selectedCommunity
                                ? '#f8f9fa'
                                : 'white';
                          }}
                        >
                          <div className='d-flex align-items-center'>
                            <span
                              className='material-icons me-2 text-muted'
                              style={{ fontSize: '18px' }}
                            >
                              apartment
                            </span>
                            <div>
                              <div className='fw-500'>{comunidad.nombre}</div>
                              <small className='text-muted'>
                                {comunidad.direccion}
                              </small>
                            </div>
                          </div>
                        </button>
                      ))}
                    {communities.filter((c) =>
                      c.nombre
                        .toLowerCase()
                        .includes(searchCommunity.toLowerCase()),
                    ).length === 0 && (
                      <div className='px-3 py-2 text-muted text-center'>
                        No se encontraron comunidades
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="dropdown me-2">
                <button className="btn btn-outline-secondary" type="button">
                  <span className="material-icons align-middle me-1">date_range</span>
                  {moment(dateRange.start).format('DD/MM')} -
                  {moment(dateRange.end).format('DD/MM/YYYY')}
                </button>
              </div>
              
              <button className="btn btn-primary" onClick={() => window.print()}>
                <span className="material-icons align-middle me-1">print</span>
                Imprimir
              </button>
              
              <div className="dropdown ms-2">
                <button 
                  className="btn btn-success dropdown-toggle" 
                  type="button" 
                  id="exportDropdown" 
                  data-bs-toggle="dropdown"
                >
                  <span className="material-icons align-middle me-1">download</span>
                  Exportar CSV
                </button>
                <ul className="dropdown-menu" aria-labelledby="exportDropdown">
                  <li>
                    <button className="dropdown-item" onClick={handleExportFinancial}>
                      📊 Reporte Financiero
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleExportGastos}>
                      💰 Detalle de Gastos
                    </button>
                  </li>
                  <li><hr className="dropdown-divider"/></li>
                  <li>
                    <button className="dropdown-item" onClick={handleExportAll}>
                      📋 Exportar Todo
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Filtros activos */}
          <div className="mb-4">
            <div className="d-flex align-items-center">
              <span className="text-muted me-2">Filtros:</span>
              {selectedCommunity && (
                <div className="filter-badge me-2">
                  {communities.find(c => c.id === selectedCommunity)?.nombre}
                  <span
                    className="material-icons ms-1 cursor-pointer"
                    onClick={() => setSelectedCommunity(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedCommunity(null)}
                    role="button"
                    tabIndex={0}
                  >
                    close
                  </span>
                </div>
              )}
              <div className="filter-badge">
                {moment(dateRange.start).format('MMM YYYY')} -
                {moment(dateRange.end).format('MMM YYYY')}
              </div>
              <div className="filter-badge">
                <select
                  className="form-select form-select-sm"
                  value={selectedPeriod}
                  onChange={(e) =>
                    setSelectedPeriod(e.target.value as 'monthly' | 'quarterly' | 'yearly')
                  }
                >
                  <option value="monthly">Mensual</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mensaje de exportación */}
          {exportMessage && (
            <div
              className={`alert ${
                exportMessage.type === 'success'
                  ? 'alert-success'
                  : 'alert-danger'
              } alert-dismissible fade show mb-4`}
            >
              <span className="material-icons align-middle me-2">
                {exportMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              {exportMessage.text}
            </div>
          )}

          {/* Resumen de la comunidad seleccionada */}
          {selectedCommunity && (() => {
            const comunidad = communities.find(c => c.id === selectedCommunity);
            if (!comunidad) {return null;}

            const disponibles = Math.max(
              0,
              (comunidad.totalUnidades || 0) - (comunidad.unidadesOcupadas || 0),
            );

            const doughnutData = {
              labels: ['Ocupadas', 'Disponibles'],
              datasets: [
                {
                  data: [comunidad.unidadesOcupadas || 0, disponibles],
                  backgroundColor: ['#198754', '#6c757d'],
                },
              ],
            };

            return (
              <div className="card app-card shadow-sm mb-4">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h5 className="card-title">{comunidad.nombre}</h5>
                      <p className="text-muted mb-2">{comunidad.direccion}</p>

                      <div className="d-flex g-3 mb-3">
                        <div className="me-4">
                          <small className="text-muted">Unidades</small>
                          <div className="h5 mb-0">{comunidad.totalUnidades ?? 0}</div>
                        </div>
                        <div className="me-4">
                          <small className="text-muted">Ocupadas</small>
                          <div className="h5 mb-0">{comunidad.unidadesOcupadas ?? 0}</div>
                        </div>
                        <div className="me-4">
                          <small className="text-muted">Residentes</small>
                          <div className="h5 mb-0">{comunidad.totalResidentes ?? 0}</div>
                        </div>
                        <div className="me-4">
                          <small className="text-muted">Saldo pendiente</small>
                          <div className="h5 mb-0">
                            {new Intl.NumberFormat('es-CL', {
                              style: 'currency',
                              currency: 'CLP',
                            }).format(comunidad.saldoPendiente ?? 0)}
                          </div>
                        </div>
                        <div>
                          <small className="text-muted">Morosidad</small>
                          <div className="h5 mb-0">
                            {(comunidad.morosidad ?? 0).toFixed
                              ? `${(comunidad.morosidad as number).toFixed(1)}%`
                              : `${comunidad.morosidad}%`}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4" style={{ maxWidth: 220 }}>
                      <div style={{ width: 180, height: 180 }}>
                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* Tabs */}
          <div className="mb-4">
            <div className="d-flex border-bottom">
              {[
                { key: 'financiero', label: 'Financiero' },
                { key: 'morosidad', label: 'Morosidad' },
                { key: 'gastos', label: 'Gastos' },
                { key: 'operacional', label: 'Operacional' },
                { key: 'consumos', label: 'Consumos y Medidores' },
                { key: 'accesos', label: 'Accesos y Seguridad' },
              ].map(tab => (
                <div
                  key={tab.key}
                  className={`tab-report me-4 ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveTab(tab.key)}
                  role="button"
                  tabIndex={0}
                  style={{
                    borderBottom: activeTab === tab.key
                      ? '2px solid var(--color-accent)'
                      : '2px solid transparent',
                    paddingBottom: '0.5rem',
                    fontWeight: 600,
                    color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Contenido de reportes */}
          {isLoading && (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          )}
          
          {!isLoading && activeTab === 'financiero' && renderFinancialReport()}
          {!isLoading && activeTab === 'morosidad' && renderMorosidadReport()}
          {!isLoading && activeTab === 'gastos' && renderGastosReport()}
          {!isLoading && activeTab === 'operacional' && renderOperationalReport()}
          {!isLoading && activeTab === 'consumos' && renderConsumosReport()}
          {!isLoading && activeTab === 'accesos' && renderAccesosReport()}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
