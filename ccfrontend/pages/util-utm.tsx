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
import PageHeader from '@/components/ui/PageHeader';
import SyncControlPanel from '@/components/ui/SyncControlPanel';
import { ProtectedRoute } from '@/lib/useAuth';

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
const API_BASE_URL = 'https://mindicador.cl/api';

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

const ConsultorUTM: React.FC = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState<
    'consulta' | 'calculadora' | 'historico'
  >('consulta');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para datos
  const [currentUTM, setCurrentUTM] = useState<any>(null);
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

  // =================== FUNCIONES API ===================

  const fetchCurrentIndicators = async () => {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) {
      throw new Error('Error al consultar la API de mindicador.cl');
    }
    return await response.json();
  };

  const fetchUTMHistory = async (year: number) => {
    const response = await fetch(`${API_BASE_URL}/utm/${year}`);
    if (!response.ok) {
      throw new Error('Error al consultar el histórico UTM');
    }
    return await response.json();
  };

  // =================== FUNCIONES ===================

  const cargarUTMActual = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCurrentIndicators();
      setCurrentUTM(data.utm);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const consultarUTM = async (mes: number, ano: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUTMHistory(ano);
      // Find the value for the specific month
      const monthData = data.find((item: any) => {
        const itemDate = new Date(item.fecha);
        return itemDate.getMonth() + 1 === mes && itemDate.getFullYear() === ano;
      });
      if (monthData) {
        setConsultaResult({
          fecha: monthData.fecha,
          valor: monthData.valor,
          mes,
          ano,
          periodo: `${mes}/${ano}`,
          periodo_formato: new Date(monthData.fecha).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
        });
      } else {
        setConsultaResult(null);
        setError('No se encontró valor UTM para el período seleccionado');
      }
    } catch (err: any) {
      setError(err.message);
      setConsultaResult(null);
    } finally {
      setLoading(false);
    }
  };

  const convertirPesosAUtm = () => {
    if (!currentUTM || montoPesos <= 0) {
      return;
    }
    const utm = montoPesos / currentUTM.valor;
    setConversionResult({
      monto_pesos: montoPesos,
      valor_utm: currentUTM.valor,
      fecha: currentUTM.fecha,
      periodo: new Date(currentUTM.fecha).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
      equivalente_utm: Math.round(utm * 10000) / 10000,
    });
  };

  const convertirUtmAPesos = () => {
    if (!currentUTM || montoUtm <= 0) {
      return;
    }
    const pesos = montoUtm * currentUTM.valor;
    setConversionResult({
      cantidad_utm: montoUtm,
      valor_utm: currentUTM.valor,
      fecha: currentUTM.fecha,
      periodo: new Date(currentUTM.fecha).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
      equivalente_pesos: Math.round(pesos),
    });
  };

  const cargarHistoricoAno = async (ano: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUTMHistory(ano);
      const formattedData: UtmValor[] = data.map((item: any) => ({
        fecha: item.fecha,
        valor: item.valor,
        mes: new Date(item.fecha).getMonth() + 1,
        ano: new Date(item.fecha).getFullYear(),
        periodo: `${new Date(item.fecha).getMonth() + 1}/${ano}`,
        periodo_formato: new Date(item.fecha).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
        mes_nombre: new Date(item.fecha).toLocaleDateString('es-CL', { month: 'long' }),
      }));
      setHistoricoAno(formattedData);
    } catch (err: any) {
      setError(err.message);
      setHistoricoAno([]);
    } finally {
      setLoading(false);
    }
  };

  // =================== EFECTOS ===================

  useEffect(() => {
    cargarUTMActual();
  }, []);

  useEffect(() => {
    if (activeTab === 'historico') {
      cargarHistoricoAno(selectedYear);
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
    return `${value.toFixed(2)} UTM`;
  };

  const formatPercent = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // =================== RENDER ===================

  return (
    <ProtectedRoute>
      <Layout title='Consultor UTM Avanzado - Cuentas Claras'>
        <div className='container-fluid px-4 py-4'>
          <PageHeader
            title="Consultor de UTM - Análisis Completo"
            subtitle="Dashboard avanzado con gráficos, análisis histórico y conversiones"
            icon="calculate"
          />

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
            </ul>
          </div>
        </div>

        {/* TAB: DASHBOARD - REMOVED FOR SIMPLIFICATION */}

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
                        {Array.from(
                          { length: 5 },
                          (_, i) => new Date().getFullYear() - i,
                        ).map(ano => (
                          <option key={ano} value={ano}>
                            {ano}
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

        {/* TAB: ANÁLISIS - REMOVED FOR SIMPLIFICATION */}

        {/* TAB: COMPARACIÓN - REMOVED FOR SIMPLIFICATION */}
      </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default ConsultorUTM;
