import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

import Layout from '@/components/layout/Layout';
import SyncControlPanel from '@/components/ui/SyncControlPanel';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
);

// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// =================== INTERFACES ===================

interface UtmValor {
  fecha: string;
  valor: number;
  mes?: number;
  ano?: number;
  periodo?: string;
  periodo_formato?: string;
  periodo_corto?: string;
  mes_nombre?: string;
}

interface DashboardData {
  kpis: {
    meses_registrados: number;
    valor_minimo: number;
    valor_maximo: number;
    valor_promedio: number;
    rango: number;
    variacion_porcentual: number;
    periodo_desde: string;
    periodo_hasta: string;
  };
  ultimos_valores: Array<{
    fecha: string;
    valor: number;
    periodo: string;
    variacion: number;
    variacion_porcentual: number;
  }>;
}

interface VariacionMensual {
  fecha: string;
  valor_actual: number;
  periodo: string;
  valor_anterior: number;
  periodo_anterior: string;
  variacion_absoluta: number;
  variacion_porcentual: number;
}

interface ComparacionAnos {
  mes: number;
  mes_nombre: string;
  [year: string]: any;
}

interface TopValores {
  mayores: UtmValor[];
  menores: UtmValor[];
}

interface ConversionData {
  monto_pesos?: number;
  cantidad_utm?: number;
  valor_utm: number;
  fecha: string;
  periodo: string;
  equivalente_utm?: number;
  equivalente_pesos?: number;
}

// =================== COMPONENTE PRINCIPAL ===================

const ConsultorUTMRenovado: React.FC = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'consulta'
    | 'calculadora'
    | 'historico'
    | 'analisis'
    | 'comparacion'
  >('dashboard');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para datos
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [graficoData, setGraficoData] = useState<UtmValor[]>([]);
  const [variacionMensual, setVariacionMensual] = useState<VariacionMensual[]>(
    [],
  );
  const [comparacionAnos, setComparacionAnos] = useState<ComparacionAnos[]>([]);
  const [topValores, setTopValores] = useState<TopValores | null>(null);
  const [historicoAno, setHistoricoAno] = useState<UtmValor[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

  // Estados para consultas y calculadora
  const [mesConsulta, setMesConsulta] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [anoConsulta, setAnoConsulta] = useState<number>(
    new Date().getFullYear(),
  );
  const [consultaResult, setConsultaResult] = useState<UtmValor | null>(null);
  const [montoPesos, setMontoPesos] = useState<number>(0);
  const [montoUtm, setMontoUtm] = useState<number>(0);
  const [conversionResult, setConversionResult] =
    useState<ConversionData | null>(null);

  // Estados para análisis avanzado
  const [trimestralData, setTrimestralData] = useState<any[]>([]);
  const [semestralData, setSemestralData] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState<any[]>([]);
  const [resumenAnos, setResumenAnos] = useState<any[]>([]);

  // Referencias para gráficos
  const chartRef = useRef<any>(null);

  // =================== FUNCIONES API ===================

  const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  const apiRequest = async (endpoint: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  };

  // =================== CARGAR DATOS ===================

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest('/api/valor-utm/dashboard?meses=12');
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message);
      // eslint-disable-next-line no-console
      console.error('Error al cargar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarGrafico = async (meses: number = 24) => {
    try {
      const data = await apiRequest(`/api/valor-utm/grafico?meses=${meses}`);
      setGraficoData(data.data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar gráfico:', err);
    }
  };

  const cargarVariacionMensual = async (meses: number = 12) => {
    try {
      const data = await apiRequest(
        `/api/valor-utm/variacion-mensual?meses=${meses}`,
      );
      setVariacionMensual(data.data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar variación mensual:', err);
    }
  };

  const cargarComparacionAnos = async (anos?: string) => {
    try {
      const endpoint = anos
        ? `/api/valor-utm/comparacion-anos?anos=${anos}`
        : '/api/valor-utm/comparacion-anos';
      const data = await apiRequest(endpoint);
      setComparacionAnos(data.data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar comparación de años:', err);
    }
  };

  const cargarTopValores = async (limit: number = 10) => {
    try {
      const data = await apiRequest(
        `/api/valor-utm/top-valores?limit=${limit}`,
      );
      setTopValores(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar top valores:', err);
    }
  };

  const cargarHistoricoAno = async (ano: number) => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/valor-utm/historico/${ano}`);
      setHistoricoAno(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarTrimestral = async (meses: number = 24) => {
    try {
      const data = await apiRequest(`/api/valor-utm/trimestral?meses=${meses}`);
      setTrimestralData(data.data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar datos trimestrales:', err);
    }
  };

  const cargarSemestral = async (desde?: number) => {
    try {
      const endpoint = desde
        ? `/api/valor-utm/semestral?desde=${desde}`
        : '/api/valor-utm/semestral';
      const data = await apiRequest(endpoint);
      setSemestralData(data.data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar datos semestrales:', err);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const data = await apiRequest('/api/valor-utm/estadisticas');
      setEstadisticas(data.data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const cargarResumenAnos = async () => {
    try {
      const data = await apiRequest('/api/valor-utm/resumen-anos');
      setResumenAnos(data.data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar resumen de años:', err);
    }
  };

  // =================== CONSULTAS Y CONVERSIONES ===================

  const consultarUTM = async (mes: number, ano: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest(`/api/valor-utm/periodo/${mes}/${ano}`);
      setConsultaResult(data.data);
    } catch (err: any) {
      setError(err.message);
      setConsultaResult(null);
    } finally {
      setLoading(false);
    }
  };

  const convertirPesosAUtm = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(
        `/api/valor-utm/conversion/pesos-a-utm?pesos=${montoPesos}`,
      );
      setConversionResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const convertirUtmAPesos = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(
        `/api/valor-utm/conversion/utm-a-pesos?utm=${montoUtm}`,
      );
      setConversionResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =================== EFECTOS ===================

  useEffect(() => {
    cargarDashboard();
    cargarGrafico(24);
    cargarVariacionMensual(12);
    cargarTopValores(10);
    cargarResumenAnos();
  }, []);

  useEffect(() => {
    if (activeTab === 'historico') {
      cargarHistoricoAno(selectedYear);
    } else if (activeTab === 'analisis') {
      cargarTrimestral(24);
      cargarSemestral();
      cargarEstadisticas();
    } else if (activeTab === 'comparacion') {
      cargarComparacionAnos();
    }
  }, [activeTab, selectedYear]);

  // =================== FUNCIONES DE FORMATO ===================

  const formatPesos = (value: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatUTM = (value: number): string => {
    return `${value.toFixed(4)} UTM`;
  };

  const formatPercent = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // =================== CONFIGURACIONES DE GRÁFICOS ===================

  const graficoLineaConfig = {
    data: {
      labels: graficoData.map(d => d.periodo_formato || d.periodo || d.fecha),
      datasets: [
        {
          label: 'Valor UTM',
          data: graficoData.map(d => d.valor),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Evolución del Valor UTM',
          font: {
            size: 16,
          },
        },
        tooltip: {
          callbacks: {
            label (context: any) {
              return `${context.dataset.label}: ${formatPesos(context.parsed.y)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback (value: any) {
              return formatPesos(value);
            },
          },
        },
      },
    },
  };

  const variacionMensualConfig = {
    data: {
      labels: variacionMensual.map(v => v.periodo),
      datasets: [
        {
          label: 'Variación Absoluta',
          data: variacionMensual.map(v => v.variacion_absoluta || 0),
          backgroundColor: variacionMensual.map(v =>
            (v.variacion_absoluta || 0) >= 0
              ? 'rgba(75, 192, 192, 0.6)'
              : 'rgba(255, 99, 132, 0.6)',
          ),
          borderColor: variacionMensual.map(v =>
            (v.variacion_absoluta || 0) >= 0
              ? 'rgb(75, 192, 192)'
              : 'rgb(255, 99, 132)',
          ),
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'Variación Mensual del Valor UTM',
          font: {
            size: 16,
          },
        },
        tooltip: {
          callbacks: {
            label (context: any) {
              return `Variación: ${formatPesos(context.parsed.y)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback (value: any) {
              return formatPesos(value);
            },
          },
        },
      },
    },
  };

  const topValoresConfig = {
    data: {
      labels: ['Mayores Valores', 'Menores Valores'],
      datasets: [
        {
          data: [
            topValores?.mayores[0]?.valor || 0,
            topValores?.menores[0]?.valor || 0,
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
          ],
          borderColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
        title: {
          display: true,
          text: 'Valores Extremos UTM',
          font: {
            size: 16,
          },
        },
        tooltip: {
          callbacks: {
            label (context: any) {
              return `${context.label}: ${formatPesos(context.parsed)}`;
            },
          },
        },
      },
    },
  };

  // =================== RENDER ===================

  return (
    <Layout title='Consultor UTM Avanzado - Cuentas Claras'>
      <div className='container-fluid px-4 py-4'>
        {/* Header */}
        <div className='row mb-4'>
          <div className='col-12'>
            <nav aria-label='breadcrumb'>
              <ol className='breadcrumb'>
                <li className='breadcrumb-item'>
                  <Link href='/dashboard'>
                    <i className='material-icons me-1'>home</i>
                    Dashboard
                  </Link>
                </li>
                <li className='breadcrumb-item active'>
                  <i className='material-icons me-1'>calculate</i>
                  Consultor UTM Avanzado
                </li>
              </ol>
            </nav>

            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <h1 className='h3 mb-1'>
                  <i className='material-icons me-2'>calculate</i>
                  Consultor de UTM - Análisis Completo
                </h1>
                <p className='text-muted mb-0'>
                  Dashboard avanzado con gráficos, análisis histórico y
                  conversiones
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de error global */}
        {error && (
          <div
            className='alert alert-danger alert-dismissible fade show'
            role='alert'
          >
            <i className='material-icons me-2'>error</i>
            {error}
            <button
              type='button'
              className='btn-close'
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        {/* Navegación por tabs */}
        <div className='row mb-4'>
          <div className='col-12'>
            <ul className='nav nav-tabs nav-fill'>
              <li className='nav-item'>
                <button
                  className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <i className='material-icons me-1'>dashboard</i>
                  Dashboard
                </button>
              </li>
              <li className='nav-item'>
                <button
                  className={`nav-link ${activeTab === 'consulta' ? 'active' : ''}`}
                  onClick={() => setActiveTab('consulta')}
                >
                  <i className='material-icons me-1'>search</i>
                  Consultar
                </button>
              </li>
              <li className='nav-item'>
                <button
                  className={`nav-link ${activeTab === 'calculadora' ? 'active' : ''}`}
                  onClick={() => setActiveTab('calculadora')}
                >
                  <i className='material-icons me-1'>calculate</i>
                  Calculadora
                </button>
              </li>
              <li className='nav-item'>
                <button
                  className={`nav-link ${activeTab === 'historico' ? 'active' : ''}`}
                  onClick={() => setActiveTab('historico')}
                >
                  <i className='material-icons me-1'>table_chart</i>
                  Histórico
                </button>
              </li>
              <li className='nav-item'>
                <button
                  className={`nav-link ${activeTab === 'analisis' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analisis')}
                >
                  <i className='material-icons me-1'>analytics</i>
                  Análisis
                </button>
              </li>
              <li className='nav-item'>
                <button
                  className={`nav-link ${activeTab === 'comparacion' ? 'active' : ''}`}
                  onClick={() => setActiveTab('comparacion')}
                >
                  <i className='material-icons me-1'>compare_arrows</i>
                  Comparación
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            {/* KPIs principales */}
            {dashboardData && (
              <div className='row mb-4'>
                <div className='col-md-3'>
                  <div className='card text-white bg-primary mb-3'>
                    <div className='card-body'>
                      <div className='d-flex justify-content-between align-items-center'>
                        <div>
                          <h6 className='card-title mb-1'>Valor Promedio</h6>
                          <h4 className='mb-0'>
                            {formatPesos(dashboardData.kpis.valor_promedio)}
                          </h4>
                          <small>
                            Últimos {dashboardData.kpis.meses_registrados} meses
                          </small>
                        </div>
                        <i
                          className='material-icons'
                          style={{ fontSize: '3rem', opacity: 0.5 }}
                        >
                          trending_up
                        </i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-md-3'>
                  <div className='card text-white bg-success mb-3'>
                    <div className='card-body'>
                      <div className='d-flex justify-content-between align-items-center'>
                        <div>
                          <h6 className='card-title mb-1'>Valor Mínimo</h6>
                          <h4 className='mb-0'>
                            {formatPesos(dashboardData.kpis.valor_minimo)}
                          </h4>
                          <small>{dashboardData.kpis.periodo_desde}</small>
                        </div>
                        <i
                          className='material-icons'
                          style={{ fontSize: '3rem', opacity: 0.5 }}
                        >
                          arrow_downward
                        </i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-md-3'>
                  <div className='card text-white bg-danger mb-3'>
                    <div className='card-body'>
                      <div className='d-flex justify-content-between align-items-center'>
                        <div>
                          <h6 className='card-title mb-1'>Valor Máximo</h6>
                          <h4 className='mb-0'>
                            {formatPesos(dashboardData.kpis.valor_maximo)}
                          </h4>
                          <small>{dashboardData.kpis.periodo_hasta}</small>
                        </div>
                        <i
                          className='material-icons'
                          style={{ fontSize: '3rem', opacity: 0.5 }}
                        >
                          arrow_upward
                        </i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-md-3'>
                  <div className='card text-white bg-info mb-3'>
                    <div className='card-body'>
                      <div className='d-flex justify-content-between align-items-center'>
                        <div>
                          <h6 className='card-title mb-1'>Variación Total</h6>
                          <h4 className='mb-0'>
                            {formatPercent(
                              dashboardData.kpis.variacion_porcentual,
                            )}
                          </h4>
                          <small>
                            Rango: {formatPesos(dashboardData.kpis.rango)}
                          </small>
                        </div>
                        <i
                          className='material-icons'
                          style={{ fontSize: '3rem', opacity: 0.5 }}
                        >
                          show_chart
                        </i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gráficos principales */}
            <div className='row mb-4'>
              <div className='col-lg-8'>
                <div className='card'>
                  <div className='card-header'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>show_chart</i>
                      Evolución del Valor UTM
                    </h5>
                  </div>
                  <div className='card-body' style={{ height: '400px' }}>
                    {graficoData.length > 0 && (
                      <Line
                        data={graficoLineaConfig.data}
                        options={graficoLineaConfig.options}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className='col-lg-4'>
                <div className='card'>
                  <div className='card-header'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>pie_chart</i>
                      Valores Extremos
                    </h5>
                  </div>
                  <div className='card-body' style={{ height: '400px' }}>
                    {topValores && (
                      <Doughnut
                        data={topValoresConfig.data}
                        options={topValoresConfig.options}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Variación mensual */}
            <div className='row mb-4'>
              <div className='col-12'>
                <div className='card'>
                  <div className='card-header'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>bar_chart</i>
                      Variación Mensual
                    </h5>
                  </div>
                  <div className='card-body' style={{ height: '350px' }}>
                    {variacionMensual.length > 0 && (
                      <Bar
                        data={variacionMensualConfig.data}
                        options={variacionMensualConfig.options}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Últimos valores */}
            {dashboardData && dashboardData.ultimos_valores && (
              <div className='row'>
                <div className='col-12'>
                  <div className='card'>
                    <div className='card-header'>
                      <h5 className='card-title mb-0'>
                        <i className='material-icons me-2'>history</i>
                        Últimos 5 Valores
                      </h5>
                    </div>
                    <div className='card-body'>
                      <div className='table-responsive'>
                        <table className='table table-hover'>
                          <thead className='table-light'>
                            <tr>
                              <th>Período</th>
                              <th>Valor UTM</th>
                              <th>Variación</th>
                              <th>Variación %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.ultimos_valores.map((valor, idx) => (
                              <tr key={idx}>
                                <td>
                                  <strong>{valor.periodo}</strong>
                                </td>
                                <td className='text-primary'>
                                  {formatPesos(valor.valor)}
                                </td>
                                <td
                                  className={
                                    valor.variacion >= 0
                                      ? 'text-success'
                                      : 'text-danger'
                                  }
                                >
                                  <i className='material-icons me-1'>
                                    {valor.variacion >= 0
                                      ? 'trending_up'
                                      : 'trending_down'}
                                  </i>
                                  {formatPesos(Math.abs(valor.variacion || 0))}
                                </td>
                                <td
                                  className={
                                    valor.variacion_porcentual >= 0
                                      ? 'text-success'
                                      : 'text-danger'
                                  }
                                >
                                  {formatPercent(
                                    valor.variacion_porcentual || 0,
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top valores */}
            {topValores && (
              <div className='row mt-4'>
                <div className='col-md-6'>
                  <div className='card border-danger'>
                    <div className='card-header bg-danger text-white'>
                      <h6 className='card-title mb-0'>
                        <i className='material-icons me-2'>trending_up</i>
                        Top 10 Valores Más Altos
                      </h6>
                    </div>
                    <div className='card-body'>
                      <div className='list-group list-group-flush'>
                        {topValores.mayores.map((valor, idx) => (
                          <div
                            key={idx}
                            className='list-group-item d-flex justify-content-between align-items-center'
                          >
                            <div>
                              <strong>#{idx + 1}</strong>
                              <span className='ms-2'>{valor.periodo}</span>
                            </div>
                            <span className='badge bg-danger rounded-pill'>
                              {formatPesos(valor.valor)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='card border-success'>
                    <div className='card-header bg-success text-white'>
                      <h6 className='card-title mb-0'>
                        <i className='material-icons me-2'>trending_down</i>
                        Top 10 Valores Más Bajos
                      </h6>
                    </div>
                    <div className='card-body'>
                      <div className='list-group list-group-flush'>
                        {topValores.menores.map((valor, idx) => (
                          <div
                            key={idx}
                            className='list-group-item d-flex justify-content-between align-items-center'
                          >
                            <div>
                              <strong>#{idx + 1}</strong>
                              <span className='ms-2'>{valor.periodo}</span>
                            </div>
                            <span className='badge bg-success rounded-pill'>
                              {formatPesos(valor.valor)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB: CONSULTA */}
        {activeTab === 'consulta' && (
          <div className='row'>
            <div className='col-lg-8'>
              <div className='card'>
                <div className='card-header bg-primary text-white'>
                  <h5 className='card-title mb-0'>
                    <i className='material-icons me-2'>search</i>
                    Consultar Valor UTM por Período
                  </h5>
                </div>
                <div className='card-body'>
                  <div className='row g-3'>
                    <div className='col-md-4'>
                      <label className='form-label'>Mes:</label>
                      <select
                        className='form-select'
                        value={mesConsulta}
                        onChange={e => setMesConsulta(parseInt(e.target.value))}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          mes => (
                            <option key={mes} value={mes}>
                              {new Date(2000, mes - 1).toLocaleString('es-CL', {
                                month: 'long',
                              })}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                    <div className='col-md-4'>
                      <label className='form-label'>Año:</label>
                      <select
                        className='form-select'
                        value={anoConsulta}
                        onChange={e => setAnoConsulta(parseInt(e.target.value))}
                      >
                        {Array.from(
                          { length: 10 },
                          (_, i) => new Date().getFullYear() - i,
                        ).map(ano => (
                          <option key={ano} value={ano}>
                            {ano}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='col-md-4 d-flex align-items-end'>
                      <button
                        className='btn btn-primary w-100'
                        onClick={() => consultarUTM(mesConsulta, anoConsulta)}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className='spinner-border spinner-border-sm me-2'></span>
                            Consultando...
                          </>
                        ) : (
                          <>
                            <i className='material-icons me-2'>search</i>
                            Consultar
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Resultado */}
                  {consultaResult && (
                    <div className='mt-4'>
                      <div className='alert alert-success'>
                        <div className='row'>
                          <div className='col-md-6'>
                            <h6>Período Consultado:</h6>
                            <p className='mb-0'>
                              <strong>{consultaResult.periodo}</strong>
                            </p>
                          </div>
                          <div className='col-md-6 text-end'>
                            <h6>Valor UTM:</h6>
                            <h3 className='text-primary mb-0'>
                              {formatPesos(consultaResult.valor)}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='card'>
                <div className='card-header'>
                  <h6 className='card-title mb-0'>
                    <i className='material-icons me-1'>info</i>
                    Información UTM
                  </h6>
                </div>
                <div className='card-body'>
                  <p className='small text-muted'>
                    La Unidad Tributaria Mensual (UTM) es una unidad de cuenta
                    usada en Chile con fines tributarios y de multas.
                  </p>
                  <ul className='small'>
                    <li>Actualización mensual</li>
                    <li>Basada en el IPC</li>
                    <li>Publicada en el Diario Oficial</li>
                    <li>Vigente todo el mes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CALCULADORA */}
        {activeTab === 'calculadora' && (
          <>
            <div className='row'>
              <div className='col-md-6'>
                <div className='card'>
                  <div className='card-header bg-success text-white'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>arrow_forward</i>
                      Pesos → UTM
                    </h5>
                  </div>
                  <div className='card-body'>
                    <div className='mb-3'>
                      <label className='form-label'>
                        Monto en Pesos Chilenos (CLP):
                      </label>
                      <div className='input-group input-group-lg'>
                        <span className='input-group-text'>$</span>
                        <input
                          type='number'
                          className='form-control'
                          value={montoPesos || ''}
                          onChange={e =>
                            setMontoPesos(parseFloat(e.target.value) || 0)
                          }
                          placeholder='Ej: 5000000'
                        />
                      </div>
                    </div>
                    <button
                      className='btn btn-success btn-lg w-100'
                      onClick={convertirPesosAUtm}
                      disabled={loading || montoPesos <= 0}
                    >
                      <i className='material-icons me-2'>calculate</i>
                      Convertir a UTM
                    </button>
                  </div>
                </div>
              </div>
              <div className='col-md-6'>
                <div className='card'>
                  <div className='card-header bg-info text-white'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>arrow_back</i>
                      UTM → Pesos
                    </h5>
                  </div>
                  <div className='card-body'>
                    <div className='mb-3'>
                      <label className='form-label'>Cantidad en UTM:</label>
                      <div className='input-group input-group-lg'>
                        <span className='input-group-text'>UTM</span>
                        <input
                          type='number'
                          className='form-control'
                          value={montoUtm || ''}
                          onChange={e =>
                            setMontoUtm(parseFloat(e.target.value) || 0)
                          }
                          placeholder='Ej: 50.5'
                          step='0.0001'
                        />
                      </div>
                    </div>
                    <button
                      className='btn btn-info btn-lg w-100'
                      onClick={convertirUtmAPesos}
                      disabled={loading || montoUtm <= 0}
                    >
                      <i className='material-icons me-2'>calculate</i>
                      Convertir a Pesos
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado de conversión */}
            {conversionResult && (
              <div className='row mt-4'>
                <div className='col-12'>
                  <div className='card border-primary'>
                    <div className='card-header bg-primary text-white'>
                      <h5 className='card-title mb-0'>
                        <i className='material-icons me-2'>check_circle</i>
                        Resultado de Conversión
                      </h5>
                    </div>
                    <div className='card-body'>
                      <div className='row text-center'>
                        <div className='col-md-3'>
                          <small className='text-muted d-block mb-2'>
                            Valor Ingresado
                          </small>
                          <h4 className='text-dark'>
                            {conversionResult.monto_pesos
                              ? formatPesos(conversionResult.monto_pesos)
                              : formatUTM(conversionResult.cantidad_utm || 0)}
                          </h4>
                        </div>
                        <div className='col-md-2 d-flex align-items-center justify-content-center'>
                          <i
                            className='material-icons text-primary'
                            style={{ fontSize: '3rem' }}
                          >
                            arrow_forward
                          </i>
                        </div>
                        <div className='col-md-3'>
                          <small className='text-muted d-block mb-2'>
                            Equivalencia
                          </small>
                          <h4 className='text-primary'>
                            {conversionResult.equivalente_pesos
                              ? formatPesos(conversionResult.equivalente_pesos)
                              : formatUTM(
                                  conversionResult.equivalente_utm || 0,
                                )}
                          </h4>
                        </div>
                        <div className='col-md-4'>
                          <small className='text-muted d-block mb-2'>
                            Valor UTM Usado
                          </small>
                          <h5 className='text-info'>
                            {formatPesos(conversionResult.valor_utm)}
                          </h5>
                          <small className='text-muted'>
                            {conversionResult.periodo}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB: HISTÓRICO */}
        {activeTab === 'historico' && (
          <div className='row'>
            <div className='col-12'>
              <div className='card'>
                <div className='card-header'>
                  <div className='d-flex justify-content-between align-items-center'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>table_chart</i>
                      Histórico Anual de Valores UTM
                    </h5>
                    <div>
                      <label className='me-2'>Año:</label>
                      <select
                        className='form-select d-inline-block'
                        style={{ width: 'auto' }}
                        value={selectedYear}
                        onChange={e =>
                          setSelectedYear(parseInt(e.target.value))
                        }
                      >
                        {resumenAnos.map(resumen => (
                          <option key={resumen.ano} value={resumen.ano}>
                            {resumen.ano}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className='card-body'>
                  {loading ? (
                    <div className='text-center py-5'>
                      <div
                        className='spinner-border text-primary'
                        role='status'
                      >
                        <span className='visually-hidden'>Cargando...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className='table-responsive'>
                        <table className='table table-striped table-hover'>
                          <thead className='table-dark'>
                            <tr>
                              <th>Mes</th>
                              <th>Fecha</th>
                              <th>Valor UTM</th>
                              <th>Variación</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historicoAno.map((valor, idx) => {
                              const valorAnterior =
                                idx > 0 ? historicoAno[idx - 1] : null;
                              const variacion = valorAnterior
                                ? valor.valor - valorAnterior.valor
                                : 0;
                              const variacionPct = valorAnterior
                                ? (variacion / valorAnterior.valor) * 100
                                : 0;

                              return (
                                <tr key={idx}>
                                  <td>
                                    <strong>
                                      {valor.mes_nombre ||
                                        new Date(valor.fecha).toLocaleString(
                                          'es-CL',
                                          { month: 'long' },
                                        )}
                                    </strong>
                                  </td>
                                  <td>
                                    {new Date(valor.fecha).toLocaleDateString(
                                      'es-CL',
                                    )}
                                  </td>
                                  <td className='text-primary'>
                                    <h6 className='mb-0'>
                                      {formatPesos(valor.valor)}
                                    </h6>
                                  </td>
                                  <td>
                                    {valorAnterior ? (
                                      <span
                                        className={
                                          variacion >= 0
                                            ? 'text-success'
                                            : 'text-danger'
                                        }
                                      >
                                        <i className='material-icons me-1'>
                                          {variacion >= 0
                                            ? 'trending_up'
                                            : 'trending_down'}
                                        </i>
                                        {formatPesos(Math.abs(variacion))} (
                                        {formatPercent(variacionPct)})
                                      </span>
                                    ) : (
                                      <span className='text-muted'>-</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Estadísticas del año */}
                      {historicoAno.length > 0 && (
                        <div className='row mt-4'>
                          <div className='col-md-3'>
                            <div className='card bg-light'>
                              <div className='card-body text-center'>
                                <small className='text-muted'>
                                  Valor Mínimo
                                </small>
                                <h5 className='text-success'>
                                  {formatPesos(
                                    Math.min(...historicoAno.map(v => v.valor)),
                                  )}
                                </h5>
                              </div>
                            </div>
                          </div>
                          <div className='col-md-3'>
                            <div className='card bg-light'>
                              <div className='card-body text-center'>
                                <small className='text-muted'>
                                  Valor Máximo
                                </small>
                                <h5 className='text-danger'>
                                  {formatPesos(
                                    Math.max(...historicoAno.map(v => v.valor)),
                                  )}
                                </h5>
                              </div>
                            </div>
                          </div>
                          <div className='col-md-3'>
                            <div className='card bg-light'>
                              <div className='card-body text-center'>
                                <small className='text-muted'>Promedio</small>
                                <h5 className='text-primary'>
                                  {formatPesos(
                                    historicoAno.reduce(
                                      (sum, v) => sum + v.valor,
                                      0,
                                    ) / historicoAno.length,
                                  )}
                                </h5>
                              </div>
                            </div>
                          </div>
                          <div className='col-md-3'>
                            <div className='card bg-light'>
                              <div className='card-body text-center'>
                                <small className='text-muted'>
                                  Meses Disponibles
                                </small>
                                <h5 className='text-info'>
                                  {historicoAno.length} de 12
                                </h5>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ANÁLISIS */}
        {activeTab === 'analisis' && (
          <>
            {/* Análisis Trimestral */}
            <div className='row mb-4'>
              <div className='col-12'>
                <div className='card'>
                  <div className='card-header bg-primary text-white'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>calendar_view_month</i>
                      Análisis Trimestral
                    </h5>
                  </div>
                  <div className='card-body'>
                    <div className='table-responsive'>
                      <table className='table table-hover'>
                        <thead className='table-light'>
                          <tr>
                            <th>Período</th>
                            <th>Registros</th>
                            <th>Valor Mínimo</th>
                            <th>Valor Máximo</th>
                            <th>Promedio</th>
                            <th>Variación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trimestralData.map((trim, idx) => (
                            <tr key={idx}>
                              <td>
                                <strong>{trim.periodo}</strong>
                              </td>
                              <td>
                                <span className='badge bg-secondary'>
                                  {trim.registros}
                                </span>
                              </td>
                              <td className='text-success'>
                                {formatPesos(trim.valor_minimo)}
                              </td>
                              <td className='text-danger'>
                                {formatPesos(trim.valor_maximo)}
                              </td>
                              <td className='text-primary'>
                                {formatPesos(trim.valor_promedio)}
                              </td>
                              <td>{formatPesos(trim.variacion_trimestre)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Análisis Semestral */}
            <div className='row mb-4'>
              <div className='col-12'>
                <div className='card'>
                  <div className='card-header bg-success text-white'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>calendar_today</i>
                      Análisis Semestral
                    </h5>
                  </div>
                  <div className='card-body'>
                    <div className='table-responsive'>
                      <table className='table table-hover'>
                        <thead className='table-light'>
                          <tr>
                            <th>Año</th>
                            <th>Semestre</th>
                            <th>Registros</th>
                            <th>Valor Mínimo</th>
                            <th>Valor Máximo</th>
                            <th>Promedio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {semestralData.map((sem, idx) => (
                            <tr key={idx}>
                              <td>
                                <strong>{sem.ano}</strong>
                              </td>
                              <td>{sem.semestre_nombre}</td>
                              <td>
                                <span className='badge bg-secondary'>
                                  {sem.registros}
                                </span>
                              </td>
                              <td className='text-success'>
                                {formatPesos(sem.valor_minimo)}
                              </td>
                              <td className='text-danger'>
                                {formatPesos(sem.valor_maximo)}
                              </td>
                              <td className='text-primary'>
                                {formatPesos(sem.valor_promedio)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas Avanzadas */}
            <div className='row'>
              <div className='col-12'>
                <div className='card'>
                  <div className='card-header bg-info text-white'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>analytics</i>
                      Estadísticas Avanzadas por Año
                    </h5>
                  </div>
                  <div className='card-body'>
                    <div className='table-responsive'>
                      <table className='table table-hover'>
                        <thead className='table-light'>
                          <tr>
                            <th>Año</th>
                            <th>Registros</th>
                            <th>Promedio</th>
                            <th>Mínimo</th>
                            <th>Máximo</th>
                            <th>Desv. Estándar</th>
                            <th>Coef. Variación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {estadisticas.map((est, idx) => (
                            <tr key={idx}>
                              <td>
                                <strong>{est.ano}</strong>
                              </td>
                              <td>
                                <span className='badge bg-secondary'>
                                  {est.registros}
                                </span>
                              </td>
                              <td className='text-primary'>
                                {formatPesos(est.promedio)}
                              </td>
                              <td className='text-success'>
                                {formatPesos(est.minimo)}
                              </td>
                              <td className='text-danger'>
                                {formatPesos(est.maximo)}
                              </td>
                              <td>{formatPesos(est.desviacion_estandar)}</td>
                              <td>{est.coeficiente_variacion?.toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB: COMPARACIÓN */}
        {activeTab === 'comparacion' && (
          <div className='row'>
            <div className='col-12'>
              <div className='card'>
                <div className='card-header bg-warning'>
                  <h5 className='card-title mb-0'>
                    <i className='material-icons me-2'>compare_arrows</i>
                    Comparación entre Años
                  </h5>
                </div>
                <div className='card-body'>
                  {comparacionAnos.length > 0 && comparacionAnos[0] ? (
                    <div className='table-responsive'>
                      <table className='table table-bordered table-hover'>
                        <thead className='table-dark'>
                          <tr>
                            <th>Mes</th>
                            {Object.keys(comparacionAnos[0] || {})
                              .filter(
                                key => key !== 'mes' && key !== 'mes_nombre',
                              )
                              .map(year => (
                                <th key={year} className='text-center'>
                                  {year}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {comparacionAnos.map((fila, idx) => (
                            <tr key={idx}>
                              <td>
                                <strong>{fila.mes_nombre}</strong>
                              </td>
                              {Object.keys(fila)
                                .filter(
                                  key => key !== 'mes' && key !== 'mes_nombre',
                                )
                                .map(year => (
                                  <td key={year} className='text-center'>
                                    {fila[year] ? formatPesos(fila[year]) : '-'}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className='text-center py-5'>
                      <i
                        className='material-icons'
                        style={{ fontSize: '4rem', color: '#ccc' }}
                      >
                        query_stats
                      </i>
                      <p className='text-muted'>
                        Cargando datos de comparación...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ConsultorUTMRenovado;

