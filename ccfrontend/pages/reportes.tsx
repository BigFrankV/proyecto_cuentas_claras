/* eslint-disable @next/next/no-css-tags */
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
import { useAuth } from '@/lib/useAuth';

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
  month: string; // '2024-01', '2024-02', etc.
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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('financiero');
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(
    null,
  );
  const [dateRange] = useState({
    start: moment().subtract(3, 'month').format('YYYY-MM-DD'),
    end: moment().format('YYYY-MM-DD'),
  });
  const [selectedPeriod, setSelectedPeriod] = useState<
    'monthly' | 'quarterly' | 'yearly'
  >('quarterly');
  const [isLoading, setIsLoading] = useState(false);

  // Estados para UI mejorada
  const [searchComunidad, setSearchComunidad] = useState('');
  const [showComunidadDropdown, setShowComunidadDropdown] = useState(false);
  const [exportMessage, setExportMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Estados para datos
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [gastos, setGastos] = useState<GastoData[]>([]);
  const [, setPagos] = useState<PagoData[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketsSummary, setTicketsSummary] = useState<{
    open: number;
    closed: number;
  } | null>(null);
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
  const [estadisticasMorosidad, setEstadisticasMorosidad] = useState<
    any | null
  >(null);
  // Gastos extras
  const [centrosCostoResumen, setCentrosCostoResumen] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);

  // Cargar datos iniciales
  const loadCommunities = useCallback(async () => {
    try {
      const response = await apiClient.get('/comunidades');
      setCommunities(response.data);
      if (response.data.length > 0 && !selectedCommunity) {
        setSelectedCommunity(response.data[0].id);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
          console.warn('No se pudieron cargar KPIs financieros:', err);
        }

        // Tendencias mensuales (ya agrupadas en backend)
        try {
          const meses = 6; // default range; could be parameterized by UI
          const resumenUrl = `/api/reportes/comunidad/${selectedCommunity}/resumen-financiero`;
          const tendenciasRes = await apiClient.get(resumenUrl, {
            params: { meses },
          });
          // eslint-disable-next-line no-console
          console.log('Tendencias financieras response:', tendenciasRes.data);
          // Expecting an array like [{ month: '2025-08', ingresos: 123, gastos: 45, saldo: 78 }, ...]
          setReportData(tendenciasRes.data || []);
        } catch (err) {
          // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
          console.log('Tickets soporte response:', ticketsRes.data);
          setTickets(ticketsRes.data || []);
          // derive simple summary
          const open = (ticketsRes.data || []).filter(
            (t: any) => t.estado !== 'cerrado',
          ).length;
          const closed = (ticketsRes.data || []).filter(
            (t: any) => t.estado === 'cerrado',
          ).length;
          setTicketsSummary({ open, closed });

          // reservas amenidades
          const reservasUrl = `/api/reportes/comunidad/${selectedCommunity}/reservas-amenidades`;
          const reservasRes = await apiClient.get(reservasUrl, { params });
          // eslint-disable-next-line no-console
          console.log('Reservas amenidades response:', reservasRes.data);
          setReservas(reservasRes.data || []);

          // bitacora conserjeria
          const bitacoraUrl = `/api/reportes/comunidad/${selectedCommunity}/bitacora-conserjeria`;
          const bitacoraRes = await apiClient.get(bitacoraUrl, { params });
          // eslint-disable-next-line no-console
          console.log('Bitacora conserjeria response:', bitacoraRes.data);
          setBitacora(bitacoraRes.data || []);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn(
            'No hay datos operacionales o el endpoint no respondió:',
            err,
          );
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
          // eslint-disable-next-line no-console
          console.log('Consumos resumen response:', resumenRes.data);
          setConsumosResumen(resumenRes.data || null);

          const servicioUrl = `/api/reportes/comunidad/${selectedCommunity}/consumo-servicios`;
          const servicioRes = await apiClient.get(servicioUrl, { params });
          // eslint-disable-next-line no-console
          console.log('Consumo servicios response:', servicioRes.data);
          setConsumoServicios(servicioRes.data || []);

          const lecturasUrl = `/api/consumos/comunidad/${selectedCommunity}/lecturas-recientes`;
          const lecturasRes = await apiClient.get(lecturasUrl, { params });
          // eslint-disable-next-line no-console
          console.log('Lecturas recientes response:', lecturasRes.data);
          setLecturasRecientes(lecturasRes.data || []);
        } catch (err) {
          // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
          console.log('Accesos visitas response:', accesosRes.data);
          setAccesosVisitas(accesosRes.data || []);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error cargando accesos:', err);
        }
      }
      // Additional cross-tab endpoints (financiero, morosidad, gastos) — non-blocking:
      try {
        const flujoUrl = `/api/reportes/comunidad/${selectedCommunity}/flujo-caja`;
        const flujoRes = await apiClient.get(flujoUrl);
        // eslint-disable-next-line no-console
        console.log('Flujo caja response:', flujoRes.data);
        setFlujoCaja(flujoRes.data || []);
      } catch (err) {
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.log('Ingresos detallados response:', ingresosRes.data);
        setIngresosDetallados(ingresosRes.data || []);
      } catch (err) {
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.log('Estadísticas morosidad response:', morosRes.data);
        setEstadisticasMorosidad(morosRes.data || null);
      } catch (err) {
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.log('Centros costo response:', centrosRes.data);
        setCentrosCostoResumen(centrosRes.data || []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('No se pudieron cargar centros de costo:', err);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
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
    if (!selectedCommunity) {
      return;
    }
    // Request backend to generate and return the file (CSV/Excel) as blob
    apiClient
      .get(`/api/reportes/comunidad/${selectedCommunity}/reporte-completo`, {
        params: { tipo: 'financial' },
        responseType: 'blob',
      })
      .then(res => {
        const blob = new Blob([res.data], {
          type: res.headers['content-type'] || 'application/octet-stream',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `reporte_financiero_${selectedCommunity}.xlsx`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setExportMessage({
          type: 'success',
          text: 'Reporte financiero descargado',
        });
        setTimeout(() => setExportMessage(null), 3000);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('Error exportando reporte financiero:', err);
        setExportMessage({
          type: 'error',
          text: 'Error al exportar reporte financiero',
        });
        setTimeout(() => setExportMessage(null), 3000);
      });
  };

  const handleExportGastos = () => {
    if (!selectedCommunity) {
      return;
    }
    apiClient
      .get(`/api/reportes/comunidad/${selectedCommunity}/reporte-completo`, {
        params: { tipo: 'gastos' },
        responseType: 'blob',
      })
      .then(res => {
        const blob = new Blob([res.data], {
          type: res.headers['content-type'] || 'application/octet-stream',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `reporte_gastos_${selectedCommunity}.xlsx`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setExportMessage({
          type: 'success',
          text: 'Detalle de gastos descargado',
        });
        setTimeout(() => setExportMessage(null), 3000);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('Error exportando gastos:', err);
        setExportMessage({
          type: 'error',
          text: 'Error al exportar detalle de gastos',
        });
        setTimeout(() => setExportMessage(null), 3000);
      });
  };

  const handleExportAll = async () => {
    if (!selectedCommunity) {
      return;
    }
    // Request a combined report from backend
    apiClient
      .get(`/api/reportes/comunidad/${selectedCommunity}/reporte-completo`, {
        params: { tipo: 'all' },
        responseType: 'blob',
      })
      .then(res => {
        const blob = new Blob([res.data], {
          type: res.headers['content-type'] || 'application/octet-stream',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `reporte_completo_${selectedCommunity}.zip`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setExportMessage({
          type: 'success',
          text: 'Exportación completa iniciada',
        });
        setTimeout(() => setExportMessage(null), 3000);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('Error exportando todos los reportes:', err);
        setExportMessage({ type: 'error', text: 'Error al exportar reportes' });
        setTimeout(() => setExportMessage(null), 3000);
      });
  };

  const handleRefresh = async () => {
    if (selectedCommunity) {
      setIsLoading(true);
      await loadReportData();
      setIsLoading(false);
    }
  };

  // Funciones de renderizado de reportes
  const renderFinancialReport = () => {
    const flujoData = flujoCaja || [];
    const flujoTrendData = {
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

    return (
      <div id='reporteFinanciero' className='mb-5'>
        {/* Indicadores principales */}
        <div className='row g-4 mb-4'>
          <div className='col-md-6 col-xl-3'>
            <div className='card app-card shadow-sm h-100'>
              <div className='card-body'>
                <div className='d-flex align-items-center'>
                  <div className='me-3'>
                    <span
                      className='material-icons text-success'
                      style={{ fontSize: '2rem' }}
                    >
                      trending_up
                    </span>
                  </div>
                  <div>
                    <h6 className='card-subtitle mb-0 text-muted'>
                      Ingresos del Mes
                    </h6>
                    <h4 className='mb-0 text-success'>
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                      }).format(
                        flujoData[flujoData.length - 1]?.entradas ||
                          flujoData[flujoData.length - 1]?.ingresos ||
                          0,
                      )}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='col-md-6 col-xl-3'>
            <div className='card app-card shadow-sm h-100'>
              <div className='card-body'>
                <div className='d-flex align-items-center'>
                  <div className='me-3'>
                    <span
                      className='material-icons text-danger'
                      style={{ fontSize: '2rem' }}
                    >
                      trending_down
                    </span>
                  </div>
                  <div>
                    <h6 className='card-subtitle mb-0 text-muted'>
                      Gastos del Mes
                    </h6>
                    <h4 className='mb-0 text-danger'>
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                      }).format(
                        flujoData[flujoData.length - 1]?.salidas ||
                          flujoData[flujoData.length - 1]?.gastos ||
                          0,
                      )}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='col-md-6 col-xl-3'>
            <div className='card app-card shadow-sm h-100'>
              <div className='card-body'>
                <div className='d-flex align-items-center'>
                  <div className='me-3'>
                    <span
                      className='material-icons text-primary'
                      style={{ fontSize: '2rem' }}
                    >
                      account_balance
                    </span>
                  </div>
                  <div>
                    <h6 className='card-subtitle mb-0 text-muted'>
                      Saldo Actual
                    </h6>
                    <h4 className='mb-0 text-primary'>
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

          <div className='col-md-6 col-xl-3'>
            <div className='card app-card shadow-sm h-100'>
              <div className='card-body'>
                <div className='d-flex align-items-center'>
                  <div className='me-3'>
                    <span
                      className='material-icons text-warning'
                      style={{ fontSize: '2rem' }}
                    >
                      warning
                    </span>
                  </div>
                  <div>
                    <h6 className='card-subtitle mb-0 text-muted'>Morosidad</h6>
                    <h4 className='mb-0 text-warning'>
                      {(
                        reportData[reportData.length - 1]?.morosidad || 0
                      ).toFixed(1)}
                      %
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico principal */}
        <div className='card app-card shadow-sm mb-4'>
          <div className='card-header bg-white d-flex justify-content-between align-items-center'>
            <h5 className='card-title mb-0'>Flujo de Caja</h5>
            <div className='btn-group' role='group'>
              <button
                type='button'
                className='btn btn-sm btn-outline-primary active'
              >
                3M
              </button>
              <button type='button' className='btn btn-sm btn-outline-primary'>
                6M
              </button>
              <button type='button' className='btn btn-sm btn-outline-primary'>
                1A
              </button>
            </div>
          </div>
          <div className='card-body'>
            <div style={{ position: 'relative', height: '350px' }}>
              <Line data={flujoTrendData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Análisis detallado financiero */}
        <div className='row g-4 mb-4'>
          <div className='col-lg-8'>
            <div className='card app-card shadow-sm'>
              <div className='card-header bg-white'>
                <h5 className='card-title mb-0'>Presupuesto vs Real</h5>
              </div>
              <div className='card-body'>
                <div style={{ position: 'relative', height: '300px' }}>
                  <Bar
                    data={{
                      labels: reportData.map(d => moment(d.month).format('MMM YYYY')),
                      datasets: [
                        {
                          label: 'Presupuesto',
                          data: reportData.map(d => d.ingresos * 0.9), // Simulado
                          backgroundColor: 'rgba(13,110,253,0.5)',
                        },
                        {
                          label: 'Real',
                          data: reportData.map(d => d.ingresos),
                          backgroundColor: 'rgba(25,135,84,0.5)',
                        },
                      ],
                    }}
                    options={{
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
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className='col-lg-4'>
            <div className='card app-card shadow-sm'>
              <div className='card-header bg-white'>
                <h5 className='card-title mb-0'>Distribución de Ingresos</h5>
              </div>
              <div className='card-body'>
                <div style={{ position: 'relative', height: '250px' }}>
                  <Doughnut
                    data={{
                      labels: ['Cuotas', 'Multas', 'Intereses', 'Otros'],
                      datasets: [{
                        data: [70, 15, 10, 5],
                        backgroundColor: ['#198754', '#dc3545', '#ffc107', '#6c757d'],
                      }],
                    }}
                    options={{ maintainAspectRatio: false }}
                  />
                </div>
                <div className='mt-3'>
                  <div className='d-flex justify-content-between small mb-1'>
                    <span>Cuotas</span>
                    <span>70%</span>
                  </div>
                  <div className='d-flex justify-content-between small mb-1'>
                    <span>Multas</span>
                    <span>15%</span>
                  </div>
                  <div className='d-flex justify-content-between small mb-1'>
                    <span>Intereses</span>
                    <span>10%</span>
                  </div>
                  <div className='d-flex justify-content-between small'>
                    <span>Otros</span>
                    <span>5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
            return `${context.dataset.label}: ${new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
            }).format(context.parsed.y)}`;
          },
        },
      },
    },
  };

  const renderMorosidadReport = () => {
    const agingData = estadisticasMorosidad
      ? {
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
        }
      : null;

    return (
      <div id='reporteMorosidad' className='mb-5'>
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h2 className='h4 mb-0'>Análisis de Morosidad</h2>
          <div className='text-muted'>
            <span className='material-icons align-middle me-1'>update</span>
            Última actualización: {moment().format('DD/MM/YYYY')}
          </div>
        </div>

        {agingData && (
          <div className='card app-card shadow-sm mb-4'>
            <div className='card-header bg-white'>
              <h5 className='card-title mb-0'>Aging Report de Deudas</h5>
            </div>
            <div className='card-body'>
              <div style={{ position: 'relative', height: '300px' }}>
                <Bar
                  data={agingData}
                  options={{
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
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className='alert alert-info'>
          <span className='material-icons me-2'>info</span>
          Lista de morosos por unidad (desarrollo pendiente)
        </div>

        {/* Tabla detallada de morosos */}
        <div className='card app-card shadow-sm'>
          <div className='card-header bg-white d-flex justify-content-between align-items-center'>
            <h5 className='card-title mb-0'>Morosos por Unidad</h5>
            <button className='btn btn-sm btn-outline-primary'>
              <span className='material-icons align-middle me-1'>download</span>
              Exportar
            </button>
          </div>
          <div className='table-responsive'>
            <table className='table table-hover'>
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Propietario</th>
                  <th>Días de Mora</th>
                  <th>Monto Adeudado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {/* Simular datos de morosos */}
                <tr>
                  <td>101</td>
                  <td>Juan Pérez</td>
                  <td>45</td>
                  <td className='text-end'>$150.000</td>
                  <td><span className='badge bg-warning'>Pendiente</span></td>
                </tr>
                <tr>
                  <td>205</td>
                  <td>María González</td>
                  <td>78</td>
                  <td className='text-end'>$280.000</td>
                  <td><span className='badge bg-danger'>Crítico</span></td>
                </tr>
                <tr>
                  <td>312</td>
                  <td>Carlos Rodríguez</td>
                  <td>23</td>
                  <td className='text-end'>$95.000</td>
                  <td><span className='badge bg-warning'>Pendiente</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderGastosReport = () => {
    const centrosData =
      centrosCostoResumen && centrosCostoResumen.length > 0
        ? {
            labels: centrosCostoResumen.map((c: any) => c.nombre || c.centro),
            datasets: [
              {
                label: 'Gastos por Centro de Costo',
                data: centrosCostoResumen.map(
                  (c: any) => c.total || c.monto || 0,
                ),
                backgroundColor: [
                  '#198754',
                  '#dc3545',
                  '#ffc107',
                  '#0d6efd',
                  '#6c757d',
                ],
              },
            ],
          }
        : null;

    return (
      <div id='reporteGastos' className='mb-5'>
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h2 className='h4 mb-0'>Análisis de Gastos</h2>
          <div className='text-muted'>
            <span className='material-icons align-middle me-1'>update</span>
            Última actualización: {moment().format('DD/MM/YYYY')}
          </div>
        </div>

        {/* Gráficos de Gastos */}
        <div className='row g-4 mb-4'>
          <div className='col-lg-6'>
            <div className='card app-card shadow-sm'>
              <div className='card-header bg-white'>
                <h5 className='card-title mb-0'>Categorías de Gastos</h5>
              </div>
              <div className='card-body'>
                <div style={{ position: 'relative', height: '300px' }}>
                  <Doughnut
                    data={{
                      labels: ['Servicios básicos', 'Seguridad', 'Mantención', 'Limpieza', 'Administración', 'Extraordinarios', 'Otros'],
                      datasets: [{
                        data: [25, 20, 18, 11, 8, 12, 6],
                        backgroundColor: [
                          '#198754',
                          '#dc3545',
                          '#ffc107',
                          '#0d6efd',
                          '#6c757d',
                          '#fd7e14',
                          '#20c997',
                        ],
                      }],
                    }}
                    options={{ maintainAspectRatio: false }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className='col-lg-6'>
            <div className='card app-card shadow-sm'>
              <div className='card-header bg-white'>
                <h5 className='card-title mb-0'>Tendencia de Gastos</h5>
              </div>
              <div className='card-body'>
                <div style={{ position: 'relative', height: '300px' }}>
                  <Bar
                    data={{
                      labels: ['Julio', 'Agosto', 'Septiembre'],
                      datasets: [
                        {
                          label: 'Servicios Básicos',
                          data: [150000, 160000, 155000],
                          backgroundColor: '#198754',
                        },
                        {
                          label: 'Seguridad',
                          data: [120000, 125000, 130000],
                          backgroundColor: '#dc3545',
                        },
                        {
                          label: 'Mantención',
                          data: [100000, 95000, 110000],
                          backgroundColor: '#ffc107',
                        },
                        {
                          label: 'Otros',
                          data: [80000, 85000, 90000],
                          backgroundColor: '#6c757d',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: { stacked: true },
                        y: {
                          stacked: true,
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
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de gastos */}
        <div className='card app-card shadow-sm'>
          <div className='card-header bg-white d-flex justify-content-between align-items-center'>
            <h5 className='card-title mb-0'>Gastos Recientes</h5>
            <button className='btn btn-sm btn-outline-primary'>
              <span className='material-icons align-middle me-1'>download</span>
              Exportar
            </button>
          </div>
          <div className='table-responsive'>
            <table className='table table-hover'>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {gastos.slice(0, 10).map(gasto => (
                  <tr key={gasto.id}>
                    <td>{moment(gasto.fecha).format('DD/MM/YYYY')}</td>
                    <td>
                      <span className='badge bg-primary'>
                        Categoría {gasto.categoria_id}
                      </span>
                    </td>
                    <td>{gasto.glosa}</td>
                    <td className='text-end'>
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
    const ticketsByCategory =
      tickets && tickets.length > 0
        ? (Object.entries(
            (tickets || []).reduce((acc: any, t: any) => {
              acc[t.categoria || 'Sin categoría'] =
                (acc[t.categoria || 'Sin categoría'] || 0) + 1;
              return acc;
            }, {}),
          ) as [string, any][])
        : [];

    const ticketsBarData =
      ticketsByCategory.length > 0
        ? {
            labels: ticketsByCategory.map(([cat]) => cat),
            datasets: [
              {
                label: 'Tickets por Categoría',
                data: ticketsByCategory.map(([, count]) => count),
                backgroundColor: [
                  '#198754',
                  '#dc3545',
                  '#ffc107',
                  '#0d6efd',
                  '#6c757d',
                ],
              },
            ],
          }
        : null;

    return (
      <div id='reporteOperacional' className='mb-5'>
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h2 className='h4 mb-0'>Operaciones y Gestión</h2>
          <div className='text-muted'>
            Última actualización: {moment().format('DD/MM/YYYY')}
          </div>
        </div>

        {/* Tickets resumen */}
        <div className='row g-4 mb-4'>
          <div className='col-md-6'>
            <div className='card app-card shadow-sm h-100'>
              <div className='card-body'>
                <h5 className='card-title'>Tickets de Soporte</h5>
                {ticketsSummary ? (
                  <div className='d-flex align-items-center'>
                    <div style={{ width: 140, height: 140 }}>
                      <Doughnut
                        data={{
                          labels: ['Abiertos', 'Cerrados'],
                          datasets: [
                            {
                              data: [
                                ticketsSummary.open,
                                ticketsSummary.closed,
                              ],
                              backgroundColor: ['#ffc107', '#198754'],
                            },
                          ],
                        }}
                        options={{ maintainAspectRatio: false }}
                      />
                    </div>
                    <div className='ms-3'>
                      <div>
                        Abiertos: <strong>{ticketsSummary.open}</strong>
                      </div>
                      <div>
                        Cerrados: <strong>{ticketsSummary.closed}</strong>
                      </div>
                      <div>
                        Total: <strong>{(tickets || []).length}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='text-muted'>No hay datos de tickets</div>
                )}
              </div>
            </div>
          </div>

          <div className='col-md-6'>
            <div className='card app-card shadow-sm h-100'>
              <div className='card-body'>
                <h5 className='card-title'>Reservas de Amenidades</h5>
                {reservas && reservas.length > 0 ? (
                  <div>
                    <ul className='list-unstyled mb-0'>
                      {(
                        Object.entries(
                          (reservas || []).reduce((acc: any, r: any) => {
                            acc[r.amenidad_nombre] =
                              (acc[r.amenidad_nombre] || 0) + 1;
                            return acc;
                          }, {}),
                        ) as [string, any][]
                      )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([name, count]) => (
                          <li key={name} className='mb-1'>
                            {name} <span className='text-muted'>({count})</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : (
                  <div className='text-muted'>Sin reservas registradas</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {ticketsBarData && (
          <div className='card app-card shadow-sm mb-4'>
            <div className='card-header bg-white'>
              <h5 className='card-title mb-0'>Tickets por Categoría</h5>
            </div>
            <div className='card-body'>
              <div style={{ position: 'relative', height: '300px' }}>
                <Bar
                  data={ticketsBarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bitácora */}
        <div className='card app-card shadow-sm mb-4'>
          <div className='card-body'>
            <h5 className='card-title'>Bitácora Conserjería (reciente)</h5>
            {bitacora && bitacora.length > 0 ? (
              <ul className='list-group list-group-flush'>
                {bitacora.slice(0, 10).map((ev: any) => (
                  <li key={ev.id || ev.fecha} className='list-group-item'>
                    <div className='small text-muted'>
                      {moment(ev.fecha).format('DD/MM/YYYY HH:mm')}
                    </div>
                    <div>
                      {ev.texto || ev.descripcion || JSON.stringify(ev)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className='text-muted'>No hay eventos recientes</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderConsumosReport = () => (
    <div id='reporteConsumos' className='mb-5'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h2 className='h4 mb-0'>Consumos y Medidores</h2>
        <div className='text-muted'>
          Última actualización: {moment().format('DD/MM/YYYY')}
        </div>
      </div>

      {/* KPIs de Consumos */}
      <div className='row g-4 mb-4'>
        <div className='col-md-6 col-xl-3'>
          <div className='card app-card shadow-sm h-100'>
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='me-3'>
                  <span className='material-icons text-info' style={{ fontSize: '2rem' }}>
                    water_drop
                  </span>
                </div>
                <div>
                  <h6 className='card-subtitle mb-0 text-muted'>Agua (m³)</h6>
                  <h4 className='mb-0 text-info'>1,245</h4>
                  <small className='text-success'>+5.2% vs mes anterior</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='col-md-6 col-xl-3'>
          <div className='card app-card shadow-sm h-100'>
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='me-3'>
                  <span className='material-icons text-warning' style={{ fontSize: '2rem' }}>
                    flash_on
                  </span>
                </div>
                <div>
                  <h6 className='card-subtitle mb-0 text-muted'>Electricidad (kWh)</h6>
                  <h4 className='mb-0 text-warning'>8,650</h4>
                  <small className='text-danger'>+12.1% vs mes anterior</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='col-md-6 col-xl-3'>
          <div className='card app-card shadow-sm h-100'>
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='me-3'>
                  <span className='material-icons text-success' style={{ fontSize: '2rem' }}>
                    local_fire_department
                  </span>
                </div>
                <div>
                  <h6 className='card-subtitle mb-0 text-muted'>Gas (m³)</h6>
                  <h4 className='mb-0 text-success'>450</h4>
                  <small className='text-success'>-2.3% vs mes anterior</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='col-md-6 col-xl-3'>
          <div className='card app-card shadow-sm h-100'>
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='me-3'>
                  <span className='material-icons text-primary' style={{ fontSize: '2rem' }}>
                    speed
                    </span>
                </div>
                <div>
                  <h6 className='card-subtitle mb-0 text-muted'>Lecturas Pendientes</h6>
                  <h4 className='mb-0 text-primary'>12</h4>
                  <small className='text-muted'>Medidores sin leer</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de tendencias de consumo */}
      <div className='card app-card shadow-sm mb-4'>
        <div className='card-header bg-white'>
          <h5 className='card-title mb-0'>Tendencias de Consumo</h5>
        </div>
        <div className='card-body'>
          <div style={{ position: 'relative', height: '350px' }}>
            <Line
              data={{
                labels: ['Julio', 'Agosto', 'Septiembre', 'Octubre'],
                datasets: [
                  {
                    label: 'Agua (m³)',
                    data: [1150, 1200, 1180, 1245],
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13,110,253,0.1)',
                    tension: 0.3,
                  },
                  {
                    label: 'Electricidad (kWh)',
                    data: [7800, 8200, 8100, 8650],
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255,193,7,0.1)',
                    tension: 0.3,
                  },
                  {
                    label: 'Gas (m³)',
                    data: [480, 460, 455, 450],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220,53,69,0.1)',
                    tension: 0.3,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className='card app-card shadow-sm'>
        <div className='card-body'>
          <h5 className='card-title'>Lecturas recientes</h5>
          {lecturasRecientes && lecturasRecientes.length > 0 ? (
            <div className='table-responsive'>
              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Medidor</th>
                    <th>Servicio</th>
                    <th>Lectura Anterior</th>
                    <th>Lectura Actual</th>
                    <th>Consumo</th>
                  </tr>
                </thead>
                <tbody>
                  {lecturasRecientes.map((l: any) => (
                    <tr key={l.id || l.fecha}>
                      <td>{moment(l.fecha).format('DD/MM/YYYY')}</td>
                      <td>{l.medidor || l.tipo}</td>
                      <td>{l.servicio || 'Agua'}</td>
                      <td>{l.lectura_anterior || l.anterior || '-'}</td>
                      <td>{l.lectura_actual || l.actual || l.valor}</td>
                      <td>{l.consumo || l.diferencia || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='text-muted'>No hay lecturas recientes</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAccesosReport = () => (
    <div id='reporteAccesos' className='mb-5'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h2 className='h4 mb-0'>Accesos y Seguridad</h2>
        <div className='text-muted'>
          Última actualización: {moment().format('DD/MM/YYYY')}
        </div>
      </div>

      {/* KPIs de Accesos */}
      <div className='row g-4 mb-4'>
        <div className='col-md-6 col-xl-3'>
          <div className='card app-card shadow-sm h-100'>
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='me-3'>
                  <span className='material-icons text-success' style={{ fontSize: '2rem' }}>
                    group
                  </span>
                </div>
                <div>
                  <h6 className='card-subtitle mb-0 text-muted'>Visitas del Mes</h6>
                  <h4 className='mb-0 text-success'>247</h4>
                  <small className='text-success'>+8.3% vs mes anterior</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='col-md-6 col-xl-3'>
          <div className='card app-card shadow-sm h-100'>
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='me-3'>
                  <span className='material-icons text-primary' style={{ fontSize: '2rem' }}>
                    schedule
                  </span>
                </div>
                <div>
                  <h6 className='card-subtitle mb-0 text-muted'>Accesos Promedio/Día</h6>
                  <h4 className='mb-0 text-primary'>8.2</h4>
                  <small className='text-muted'>Últimos 30 días</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='col-md-6 col-xl-3'>
          <div className='card app-card shadow-sm h-100'>
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='me-3'>
                  <span className='material-icons text-warning' style={{ fontSize: '2rem' }}>
                    warning
                  </span>
                </div>
                <div>
                  <h6 className='card-subtitle mb-0 text-muted'>Incidentes</h6>
                  <h4 className='mb-0 text-warning'>3</h4>
                  <small className='text-danger'>Requiere atención</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='col-md-6 col-xl-3'>
          <div className='card app-card shadow-sm h-100'>
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='me-3'>
                  <span className='material-icons text-info' style={{ fontSize: '2rem' }}>
                    security
                  </span>
                </div>
                <div>
                  <h6 className='card-subtitle mb-0 text-muted'>Cámaras Activas</h6>
                  <h4 className='mb-0 text-info'>12</h4>
                  <small className='text-success'>100% operativo</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de accesos por hora */}
      <div className='card app-card shadow-sm mb-4'>
        <div className='card-header bg-white'>
          <h5 className='card-title mb-0'>Accesos por Hora del Día</h5>
        </div>
        <div className='card-body'>
          <div style={{ position: 'relative', height: '300px' }}>
            <Bar
              data={{
                labels: ['6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
                datasets: [{
                  label: 'Accesos',
                  data: [2, 15, 8, 12, 6, 18, 25, 22, 5],
                  backgroundColor: '#0d6efd',
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className='card app-card shadow-sm'>
        <div className='card-body'>
          <h5 className='card-title'>Registro de Visitas Recientes</h5>
          {accesosVisitas && accesosVisitas.length > 0 ? (
            <div className='table-responsive'>
              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th>Fecha/Hora</th>
                    <th>Visitante</th>
                    <th>Destino</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {accesosVisitas.slice(0, 15).map((a: any) => (
                    <tr key={a.id || a.fecha}>
                      <td>{moment(a.fecha).format('DD/MM/YYYY HH:mm')}</td>
                      <td>{a.visitante || a.nombre || 'Visitante'}</td>
                      <td>{a.destino || a.unidad || 'Unidad'}</td>
                      <td>
                        <span className='badge bg-primary'>{a.tipo || 'Visita'}</span>
                      </td>
                      <td>
                        <span className={`badge ${a.estado === 'autorizado' ? 'bg-success' : 'bg-warning'}`}>
                          {a.estado || 'Autorizado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='text-muted'>No hay registros de accesos recientes</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <Head>
        <title>Reportes — Cuentas Claras</title>
        <link rel='stylesheet' href='/styles/reportes.css' />
      </Head>

      <Layout title='Reportes y Analítica'>
        {/* Header mejorado del dashboard */}
        <div className='container-fluid p-0'>
          <header className='text-white shadow-lg' style={{ background: 'var(--gradient-dashboard-header)' }}>
            <div className='p-4'>
              <div className='row align-items-center'>
                {/* Información principal */}
                <div className='col-lg-6'>
                  <div className='d-flex align-items-center mb-3'>
                    <div className='icon-box bg-warning bg-opacity-20 rounded-circle p-3 me-3'>
                      <span className='material-icons' style={{ fontSize: '32px', color: 'white' }}>
                        analytics
                      </span>
                    </div>
                    <div>
                      <h1 className='h3 mb-1 fw-bold'>Reportes y Analítica</h1>
                      <p className='mb-0 opacity-75'>Informes detallados y métricas de rendimiento</p>
                    </div>
                  </div>

                  {/* Información de la comunidad seleccionada */}
                  {selectedCommunity && (
                    <div className='bg-white bg-opacity-10 rounded p-3'>
                      <div className='d-flex align-items-center'>
                        <span className='material-icons me-2'>business</span>
                        <div>
                          <small className='text-white-50'>Comunidad activa</small>
                          <div className='fw-semibold'>
                            {communities.find(c => c.id === selectedCommunity)?.nombre || 'Cargando...'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Panel de información y acciones */}
                <div className='col-lg-6'>
                  <div className='row g-3'>
                    {/* Información del usuario */}
                    <div className='col-md-6'>
                      <div className='bg-white bg-opacity-10 rounded p-3'>
                        <div className='d-flex align-items-center'>
                          <span className='material-icons me-2'>person</span>
                          <div>
                            <small className='text-white-50'>Usuario</small>
                            <div className='fw-semibold'>{user?.username || 'Cargando...'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Última actualización */}
                    <div className='col-md-6'>
                      <div className='bg-white bg-opacity-10 rounded p-3'>
                        <div className='d-flex align-items-center'>
                          <span className='material-icons me-2'>update</span>
                          <div>
                            <small className='text-white-50'>Última actualización</small>
                            <div className='fw-semibold'>{moment().format('DD/MM/YYYY')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barra de búsqueda y acciones */}
                  <div className='d-flex justify-content-end align-items-center mt-3'>
                    {/* Información de notificaciones (placeholder) */}
                    <div className='me-3'>
                      <span className='badge bg-white bg-opacity-20 text-white px-3 py-2'>
                        <span className='material-icons align-middle me-1' style={{ fontSize: '16px' }}>
                          notifications
                        </span>
                        Reportes listos
                      </span>
                    </div>

                    {/* Acciones rápidas */}
                    <div className='dropdown'>
                      <button
                        className='btn btn-light dropdown-toggle d-flex align-items-center'
                        type='button'
                        id='accionesDropdown'
                        data-bs-toggle='dropdown'
                      >
                        <span className='material-icons me-1'>settings</span>
                        <span>Acciones</span>
                      </button>
                      <ul className='dropdown-menu dropdown-menu-end' aria-labelledby='accionesDropdown'>
                        <li>
                          <button className='dropdown-item' onClick={handleExportAll}>
                            <span className='material-icons me-2'>download</span>
                            Exportar todo
                          </button>
                        </li>
                        <li><hr className='dropdown-divider' /></li>
                        <li>
                          <button className='dropdown-item'>
                            <span className='material-icons me-2'>schedule</span>
                            Programar reportes
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
        </div>



        <div className='container-fluid fade-in'>
          {/* Filtros y selección de comunidad */}
          <div className='row mb-4'>
            <div className='col-12'>
              <div className='card shadow-sm'>
                <div className='card-body'>
                  <div className='row align-items-end'>
                    {/* Selector de comunidad */}
                    <div className='col-lg-4 col-md-6 mb-3'>
                      <label className='form-label fw-semibold'>
                        <span className='material-icons align-middle me-1' style={{ fontSize: '18px' }}>
                          business
                        </span>
                        Comunidad
                      </label>
                      <div className='position-relative'>
                        <div className='input-group'>
                          <span className='input-group-text bg-primary text-white border-end-0'>
                            <span className='material-icons'>domain</span>
                          </span>
                          <input
                            type='text'
                            className='form-control border-start-0 fw-semibold'
                            placeholder='Seleccionar comunidad...'
                            value={
                              showComunidadDropdown
                                ? searchComunidad
                                : communities.find(c => c.id === selectedCommunity)
                                    ?.nombre || 'Seleccionar Comunidad'
                            }
                            onChange={e => {
                              setSearchComunidad(e.target.value);
                              setShowComunidadDropdown(true);
                            }}
                            onFocus={() => setShowComunidadDropdown(true)}
                            onBlur={() =>
                              setTimeout(() => setShowComunidadDropdown(false), 200)
                            }
                          />
                          <button
                            className='btn btn-outline-secondary border-start-0'
                            type='button'
                            onClick={() => setShowComunidadDropdown(!showComunidadDropdown)}
                          >
                            <span className='material-icons'>
                              {showComunidadDropdown ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                        </div>

                        {/* Dropdown con resultados de búsqueda */}
                        {showComunidadDropdown && (
                          <div
                            className='position-absolute w-100 mt-1 bg-white border rounded shadow-lg'
                            style={{
                              zIndex: 1000,
                              maxHeight: '300px',
                              overflowY: 'auto',
                            }}
                          >
                            {communities
                              .filter(c =>
                                c.nombre
                                  .toLowerCase()
                                  .includes(searchComunidad.toLowerCase()),
                              )
                              .map(comunidad => (
                                <button
                                  key={comunidad.id}
                                  className={`d-block w-100 text-start px-3 py-2 border-0 bg-white hover-bg-light ${
                                    comunidad.id === selectedCommunity ? 'bg-primary bg-opacity-10 fw-semibold' : ''
                                  }`}
                                  style={{ cursor: 'pointer' }}
                                  onMouseDown={() => {
                                    setSelectedCommunity(comunidad.id);
                                    setSearchComunidad('');
                                    setShowComunidadDropdown(false);
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
                                      <div className='fw-medium'>{comunidad.nombre}</div>
                                      <small className='text-muted'>
                                        {comunidad.direccion}
                                      </small>
                                    </div>
                                    {comunidad.id === selectedCommunity && (
                                      <span className='material-icons ms-auto text-primary'>
                                        check
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selector de período */}
                    <div className='col-lg-3 col-md-6 mb-3'>
                      <label htmlFor='periodSelect' className='form-label fw-semibold'>
                        <span className='material-icons align-middle me-1' style={{ fontSize: '18px' }}>
                          date_range
                        </span>
                        Período
                      </label>
                      <select
                        id='periodSelect'
                        className='form-select'
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value as 'monthly' | 'quarterly' | 'yearly')}
                      >
                        <option value='month'>Este mes</option>
                        <option value='quarter'>Este trimestre</option>
                        <option value='year'>Este año</option>
                        <option value='custom'>Personalizado</option>
                      </select>
                    </div>

                    {/* Botones de acción */}
                    <div className='col-lg-5 col-md-12 mb-3'>
                      <div className='d-flex gap-2 justify-content-end'>
                        <button
                          className='btn btn-outline-primary'
                          onClick={handleRefresh}
                          disabled={isLoading}
                        >
                          <span className='material-icons me-1'>refresh</span>
                          Actualizar
                        </button>
                        <button
                          className='btn btn-primary'
                          onClick={handleExportAll}
                          disabled={isLoading}
                        >
                          <span className='material-icons me-1'>download</span>
                          Exportar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pestañas de reportes */}
          <div className='row'>
            <div className='col-12'>
              <div className='card shadow-sm'>
                <div className='card-header bg-white'>
                  <ul className='nav nav-tabs card-header-tabs' id='reportTabs' role='tablist'>
                    <li className='nav-item' role='presentation'>
                      <button
                        className={`nav-link ${activeTab === 'financiero' ? 'active' : ''}`}
                        id='financiero-tab'
                        type='button'
                        role='tab'
                        onClick={() => setActiveTab('financiero')}
                      >
                        <span className='material-icons me-1'>account_balance</span>
                        Financiero
                      </button>
                    </li>
                    <li className='nav-item' role='presentation'>
                      <button
                        className={`nav-link ${activeTab === 'gastos' ? 'active' : ''}`}
                        id='gastos-tab'
                        type='button'
                        role='tab'
                        onClick={() => setActiveTab('gastos')}
                      >
                        <span className='material-icons me-1'>receipt</span>
                        Gastos
                      </button>
                    </li>
                    <li className='nav-item' role='presentation'>
                      <button
                        className={`nav-link ${activeTab === 'morosidad' ? 'active' : ''}`}
                        id='morosidad-tab'
                        type='button'
                        role='tab'
                        onClick={() => setActiveTab('morosidad')}
                      >
                        <span className='material-icons me-1'>warning</span>
                        Morosidad
                      </button>
                    </li>
                    <li className='nav-item' role='presentation'>
                      <button
                        className={`nav-link ${activeTab === 'operacional' ? 'active' : ''}`}
                        id='operacional-tab'
                        type='button'
                        role='tab'
                        onClick={() => setActiveTab('operacional')}
                      >
                        <span className='material-icons me-1'>settings</span>
                        Operacional
                      </button>
                    </li>
                    <li className='nav-item' role='presentation'>
                      <button
                        className={`nav-link ${activeTab === 'consumos' ? 'active' : ''}`}
                        id='consumos-tab'
                        type='button'
                        role='tab'
                        onClick={() => setActiveTab('consumos')}
                      >
                        <span className='material-icons me-1'>water_drop</span>
                        Consumos
                      </button>
                    </li>
                    <li className='nav-item' role='presentation'>
                      <button
                        className={`nav-link ${activeTab === 'accesos' ? 'active' : ''}`}
                        id='accesos-tab'
                        type='button'
                        role='tab'
                        onClick={() => setActiveTab('accesos')}
                      >
                        <span className='material-icons me-1'>security</span>
                        Accesos
                      </button>
                    </li>
                  </ul>
                </div>

                <div className='card-body'>
                  {/* Contenido de las pestañas irá aquí */}
                  {isLoading && (
                    <div className='text-center py-5'>
                      <div className='spinner-border' role='status'>
                        <span className='visually-hidden'>Cargando...</span>
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
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className='mt-5 pt-3 border-top no-print'>
            <div className='d-flex justify-content-between'>
              <div>
                <small className='text-muted'>
                  Reporte generado el {moment().format('DD/MM/YYYY HH:mm')}
                </small>
              </div>
              <div>
                <small className='text-muted'>
                  Sistema Cuentas Claras v2.1
                </small>
              </div>
            </div>
          </footer>

        </div>
      </Layout>
    </ProtectedRoute>
  );
}
