/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

import Layout from '@/components/layout/Layout';
import Breadcrumb, { BreadcrumbItem } from '@/components/ui/Breadcrumb';
import SyncControlPanel from '@/components/ui/SyncControlPanel';
import { ProtectedRoute } from '@/lib/useAuth';

import {
  UfConsultaResult,
  UfCalculatorInputs,
  UfCalculatorResult,
  UfHistoryItem,
  UfChartData,
} from '../types/utilidades';

// Registrar Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// API functions for mindicador.cl
const fetchCurrentIndicators = async () => {
  const response = await fetch('https://mindicador.cl/api');
  if (!response.ok) {
    throw new Error('Error al consultar la API de mindicador.cl');
  }
  return await response.json();
};

const fetchUFHistory = async (year: number) => {
  const response = await fetch(`https://mindicador.cl/api/uf/${year}`);
  if (!response.ok) {
    throw new Error('Error al consultar el histórico UF');
  }
  return await response.json();
};

const ConsultorUF: React.FC = () => {
  // Estados principales
  const [currentUF, setCurrentUF] = useState<any>(null);
  const [calculatorInputs, setCalculatorInputs] = useState<UfCalculatorInputs>({
    pesos: 0,
    uf: 0,
    valorUfActual: 0,
  });
  const [calculatorResult, setCalculatorResult] =
    useState<UfCalculatorResult | null>(null);
  const [historialUf, setHistorialUf] = useState<UfHistoryItem[]>([]);
  const [chartData, setChartData] = useState<UfChartData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<
    '7d' | '30d' | '90d' | '1y'
  >('30d');
  const [loading, setLoading] = useState<boolean>(false);
  const [calculatorLoading, setCalculatorLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'consulta' | 'calculadora' | 'historico'
  >('consulta');
  const [error, setError] = useState<string | null>(null);

  // Función para consultar UF actual
  const consultarUFActual = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCurrentIndicators();
      setCurrentUF(data.uf);
      // Actualizar calculadora con el nuevo valor
      setCalculatorInputs(prev => ({
        ...prev,
        valorUfActual: data.uf.valor,
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para calcular conversiones
  const calcularConversion = (type: 'toPesos' | 'toUf') => {
    setCalculatorLoading(true);

    setTimeout(() => {
      const valorUf = currentUF?.valor || calculatorInputs.valorUfActual || 39643.59;

      let result: UfCalculatorResult;

      if (type === 'toPesos') {
        const pesos = calculatorInputs.uf * valorUf;
        result = {
          fromPesos: 0,
          fromUf: calculatorInputs.uf,
          toPesos: Math.round(pesos * 100) / 100,
          toUf: 0,
          valorUfUsado: valorUf,
          fechaConsulta: currentUF?.fecha || new Date().toISOString().split('T')[0],
        };
      } else {
        const uf = calculatorInputs.pesos / valorUf;
        result = {
          fromPesos: calculatorInputs.pesos,
          fromUf: 0,
          toPesos: 0,
          toUf: Math.round(uf * 10000) / 10000,
          valorUfUsado: valorUf,
          fechaConsulta: currentUF?.fecha || new Date().toISOString().split('T')[0],
        };
      }

      setCalculatorResult(result);
      setCalculatorLoading(false);
    }, 300);
  };

  // Función para cargar datos históricos
  const cargarHistorico = async (period: '7d' | '30d' | '90d' | '1y') => {
    setSelectedPeriod(period);
    setLoading(true);
    setError(null);

    try {
      const currentYear = new Date().getFullYear();
      const data = await fetchUFHistory(currentYear);

      // Filtrar según el período
      const now = new Date();
      let daysBack: number;
      switch (period) {
        case '7d':
          daysBack = 7;
          break;
        case '30d':
          daysBack = 30;
          break;
        case '90d':
          daysBack = 90;
          break;
        case '1y':
          daysBack = 365;
          break;
        default:
          daysBack = 30;
      }

      const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      const filteredData = data.filter((item: any) => new Date(item.fecha) >= cutoffDate);

      // Convertir datos al formato esperado
      const historyItems: UfHistoryItem[] = filteredData.map((item: any, index: number) => {
        const prevItem = index > 0 ? filteredData[index - 1] : null;
        const prevValue = prevItem ? prevItem.valor : item.valor;
        const variacionAbsoluta = item.valor - prevValue;
        const variacionPorcentaje =
          prevValue > 0 ? (variacionAbsoluta / prevValue) * 100 : 0;

        return {
          fecha: item.fecha,
          valor: Math.round(item.valor * 100) / 100,
          variacion: Math.round(variacionAbsoluta * 100) / 100,
          variacionPorcentaje: Math.round(variacionPorcentaje * 10000) / 10000,
        };
      });

      setHistorialUf(historyItems);

      const chartData: UfChartData = {
        labels: historyItems.map(item => item.fecha),
        values: historyItems.map(item => item.valor),
        period,
      };

      setChartData(chartData);
    } catch (err: any) {
      setError(err.message);
      setHistorialUf([]);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  // Crear configuración del gráfico para react-chartjs-2
  const createChartConfig = () => {
    if (!chartData) {
      return null;
    }

    return {
      labels: chartData.labels.map(label => {
        const date = new Date(label);
        return date.toLocaleDateString('es-CL', {
          day: '2-digit',
          month: '2-digit',
        });
      }),
      datasets: [
        {
          label: 'Valor UF (CLP)',
          data: chartData.values,
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#0d6efd',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  // Opciones del gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback(value: any) {
            return `$${Number(value).toLocaleString('es-CL')}`;
          },
        },
      },
      x: {
        ticks: {
          maxTicksLimit: 10,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          label(context: any) {
            return `UF: $${Number(context.parsed.y).toLocaleString('es-CL')}`;
          },
        },
      },
    },
  };

  // Efectos
  useEffect(() => {
    const initializeData = async () => {
      // Cargar UF actual y datos históricos en paralelo
      await Promise.all([consultarUFActual(), cargarHistorico('30d')]);
    };

    initializeData();
  }, []);

  // Funciones de formato
  const formatPesos = (value: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatUF = (value: number): string => {
    return `${value.toFixed(2)} UF`;
  };

  return (
    <ProtectedRoute>
      <Layout title='Consultor UF - Cuentas Claras'>
        <div className='container-fluid px-4 py-4'>
        {/* Header */}
        <div className='row mb-4'>
          <div className='col-12'>
            <Breadcrumb
              items={[
                { label: 'Dashboard', href: '/dashboard', icon: 'home' },
                { label: 'Consultor UF', icon: 'attach_money' },
              ]}
            />

            <div className='d-flex justify-content-between align-items-center mb-4'>
              <div>
                <h1 className='h3 mb-1'>
                  <i className='material-icons me-2'>attach_money</i>
                  Consultor de UF
                </h1>
                <p className='text-muted mb-0'>
                  Consulta valores de Unidad de Fomento y realiza conversiones
                </p>
              </div>

              <div className='btn-group'>
                <Link href='/util-rut' className='btn btn-outline-primary'>
                  <i className='material-icons me-1'>badge</i>
                  Validar RUT
                </Link>
                <Link href='/util-utm' className='btn btn-outline-primary'>
                  <i className='material-icons me-1'>calculate</i>
                  Consultar UTM
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className='row mb-4'>
          <div className='col-12'>
            <ul className='nav nav-tabs'>
              <li className='nav-item'>
                <button
                  className={`nav-link ${activeTab === 'consulta' ? 'active' : ''}`}
                  onClick={() => setActiveTab('consulta')}
                >
                  <i className='material-icons me-1'>search</i>
                  Consultar UF
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
                  <i className='material-icons me-1'>timeline</i>
                  Histórico
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab: Consultar UF */}
        {activeTab === 'consulta' && (
          <div className='row'>
            <div className='col-lg-8'>
              <div className='card shadow-sm'>
                <div className='card-header bg-primary text-white d-flex justify-content-between align-items-center'>
                  <h5 className='card-title mb-0'>
                    <i className='material-icons me-2'>search</i>
                    Valor UF Actual
                  </h5>
                  <button
                    className='btn btn-light btn-sm'
                    onClick={consultarUFActual}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-2'></span>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <i className='material-icons me-1'>refresh</i>
                        Actualizar
                      </>
                    )}
                  </button>
                </div>
                <div className='card-body'>
                  {currentUF ? (
                    <div className='text-center py-4'>
                      <div className='mb-4'>
                        <h2 className='display-4 text-primary font-weight-bold'>
                          {formatPesos(currentUF.valor)}
                        </h2>
                        <p className='text-muted mb-2'>Valor UF al {new Date(currentUF.fecha).toLocaleDateString('es-CL')}</p>
                        <small className='text-muted'>
                          Última actualización: {new Date(currentUF.fecha).toLocaleString('es-CL')}
                        </small>
                      </div>
                      <div className='row text-center'>
                        <div className='col-md-4'>
                          <div className='p-3 bg-light rounded'>
                            <h6 className='text-muted'>Código</h6>
                            <p className='mb-0 font-weight-bold'>{currentUF.codigo.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className='col-md-4'>
                          <div className='p-3 bg-light rounded'>
                            <h6 className='text-muted'>Nombre</h6>
                            <p className='mb-0 font-weight-bold'>{currentUF.nombre}</p>
                          </div>
                        </div>
                        <div className='col-md-4'>
                          <div className='p-3 bg-light rounded'>
                            <h6 className='text-muted'>Unidad</h6>
                            <p className='mb-0 font-weight-bold'>{currentUF.unidad_medida}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center py-5'>
                      <i className='material-icons text-muted' style={{ fontSize: '4rem' }}>schedule</i>
                      <p className='text-muted mt-3'>Cargando valor UF...</p>
                    </div>
                  )}
                  {error && (
                    <div className='alert alert-danger mt-3'>
                      <i className='material-icons me-2'>error</i>
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='col-lg-4'>
              <div className='card shadow-sm'>
                <div className='card-header'>
                  <h6 className='card-title mb-0'>
                    <i className='material-icons me-1'>info</i>
                    Información UF
                  </h6>
                </div>
                <div className='card-body'>
                  <p className='text-muted small mb-3'>
                    La Unidad de Fomento (UF) es una unidad de cuenta reajustable de acuerdo con la inflación, establecida en Chile.
                  </p>
                  <div className='list-group list-group-flush'>
                    <div className='list-group-item px-0'>
                      <i className='material-icons me-2 text-primary'>update</i>
                      <small>Se actualiza diariamente</small>
                    </div>
                    <div className='list-group-item px-0'>
                      <i className='material-icons me-2 text-success'>trending_up</i>
                      <small>Basada en la variación del IPC</small>
                    </div>
                    <div className='list-group-item px-0'>
                      <i className='material-icons me-2 text-warning'>account_balance</i>
                      <small>Utilizada en créditos hipotecarios</small>
                    </div>
                    <div className='list-group-item px-0'>
                      <i className='material-icons me-2 text-info'>attach_money</i>
                      <small>Valor expresado en pesos chilenos</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel de Control de Sincronización */}
              <div className='mt-3'>
                <SyncControlPanel showTitle={true} />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Calculadora */}
        {activeTab === 'calculadora' && (
          <div className='row'>
            <div className='col-lg-6'>
              <div className='card'>
                <div className='card-header bg-success text-white'>
                  <h5 className='card-title mb-0'>
                    <i className='material-icons me-2'>calculate</i>
                    Pesos a UF
                  </h5>
                </div>
                <div className='card-body'>
                  <div className='mb-3'>
                    <label htmlFor='pesosInput' className='form-label'>
                      Cantidad en pesos chilenos:
                    </label>
                    <div className='input-group'>
                      <span className='input-group-text'>$</span>
                      <input
                        type='number'
                        className='form-control'
                        id='pesosInput'
                        value={calculatorInputs.pesos || ''}
                        onChange={e =>
                          setCalculatorInputs(prev => ({
                            ...prev,
                            pesos: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder='Ej: 1000000'
                      />
                    </div>
                  </div>

                  <button
                    className='btn btn-success w-100'
                    onClick={() => calcularConversion('toUf')}
                    disabled={calculatorLoading || calculatorInputs.pesos <= 0}
                  >
                    {calculatorLoading ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-2'></span>
                        Calculando...
                      </>
                    ) : (
                      <>
                        <i className='material-icons me-2'>arrow_forward</i>
                        Convertir a UF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className='col-lg-6'>
              <div className='card'>
                <div className='card-header bg-info text-white'>
                  <h5 className='card-title mb-0'>
                    <i className='material-icons me-2'>calculate</i>
                    UF a Pesos
                  </h5>
                </div>
                <div className='card-body'>
                  <div className='mb-3'>
                    <label htmlFor='ufInput' className='form-label'>
                      Cantidad en UF:
                    </label>
                    <div className='input-group'>
                      <span className='input-group-text'>UF</span>
                      <input
                        type='number'
                        className='form-control'
                        id='ufInput'
                        value={calculatorInputs.uf || ''}
                        onChange={e =>
                          setCalculatorInputs(prev => ({
                            ...prev,
                            uf: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder='Ej: 100.5'
                        step='0.0001'
                      />
                    </div>
                  </div>

                  <button
                    className='btn btn-info w-100'
                    onClick={() => calcularConversion('toPesos')}
                    disabled={calculatorLoading || calculatorInputs.uf <= 0}
                  >
                    {calculatorLoading ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-2'></span>
                        Calculando...
                      </>
                    ) : (
                      <>
                        <i className='material-icons me-2'>arrow_forward</i>
                        Convertir a Pesos
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Resultado de calculadora */}
            {calculatorResult && (
              <div className='col-12 mt-4'>
                <div className='card'>
                  <div className='card-header'>
                    <h6 className='card-title mb-0'>
                      <i className='material-icons me-1'>analytics</i>
                      Resultado de Conversión
                    </h6>
                  </div>
                  <div className='card-body'>
                    <div className='row text-center'>
                      <div className='col-md-3'>
                        <div className='mb-2'>
                          <small className='text-muted'>Valor ingresado</small>
                        </div>
                        <div className='h5'>
                          {calculatorResult.fromPesos > 0
                            ? formatPesos(calculatorResult.fromPesos)
                            : formatUF(calculatorResult.fromUf)}
                        </div>
                      </div>

                      <div className='col-md-2 d-flex align-items-center justify-content-center'>
                        <i className='material-icons text-primary h3'>
                          arrow_forward
                        </i>
                      </div>

                      <div className='col-md-3'>
                        <div className='mb-2'>
                          <small className='text-muted'>Resultado</small>
                        </div>
                        <div className='h5 text-primary'>
                          {calculatorResult.toPesos > 0
                            ? formatPesos(calculatorResult.toPesos)
                            : formatUF(calculatorResult.toUf)}
                        </div>
                      </div>

                      <div className='col-md-4'>
                        <div className='mb-2'>
                          <small className='text-muted'>Valor UF usado</small>
                        </div>
                        <div>{formatPesos(calculatorResult.valorUfUsado)}</div>
                        <small className='text-muted'>
                          {calculatorResult.fechaConsulta}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Histórico */}
        {activeTab === 'historico' && (
          <div className='row'>
            <div className='col-12'>
              <div className='card'>
                <div className='card-header'>
                  <div className='d-flex justify-content-between align-items-center'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>timeline</i>
                      Histórico de Valores UF
                    </h5>

                    <div className='btn-group'>
                      {[
                        { key: '7d', label: '7 días' },
                        { key: '30d', label: '30 días' },
                        { key: '90d', label: '90 días' },
                        { key: '1y', label: '1 año' },
                      ].map(period => (
                        <button
                          key={period.key}
                          className={`btn ${selectedPeriod === period.key ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() =>
                            cargarHistorico(
                              period.key as '7d' | '30d' | '90d' | '1y',
                            )
                          }
                        >
                          {period.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='card-body'>
                  {/* Gráfico */}
                  <div className='mb-4' style={{ height: '400px' }}>
                    {chartData && createChartConfig() && (
                      <Line
                        data={createChartConfig()!}
                        options={chartOptions}
                      />
                    )}
                  </div>

                  {/* Tabla de datos */}
                  {historialUf.length > 0 && (
                    <div className='table-responsive'>
                      <table className='table table-striped'>
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Valor UF</th>
                            <th>Variación</th>
                            <th>% Variación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historialUf
                            .slice(-10)
                            .reverse()
                            .map((item, index) => (
                              <tr key={index}>
                                <td>
                                  {new Date(item.fecha).toLocaleDateString(
                                    'es-CL',
                                  )}
                                </td>
                                <td>{formatPesos(item.valor)}</td>
                                <td
                                  className={
                                    item.variacion >= 0
                                      ? 'text-success'
                                      : 'text-danger'
                                  }
                                >
                                  <i
                                    className={`material-icons me-1 ${item.variacion >= 0 ? 'text-success' : 'text-danger'}`}
                                  >
                                    {item.variacion >= 0
                                      ? 'trending_up'
                                      : 'trending_down'}
                                  </i>
                                  {formatPesos(Math.abs(item.variacion))}
                                </td>
                                <td
                                  className={
                                    item.variacionPorcentaje >= 0
                                      ? 'text-success'
                                      : 'text-danger'
                                  }
                                >
                                  {item.variacionPorcentaje.toFixed(4)}%
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default ConsultorUF;
