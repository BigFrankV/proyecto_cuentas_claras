import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import SyncControlPanel from '@/components/ui/SyncControlPanel';
import { 
  UtmConsultaResult, 
  UtmCalculatorInputs, 
  UtmCalculatorResult,
  UtmAnualData,
  UtmHistoricoData,
  MESES_NOMBRES,
  MESES_ABREV,
  PERIODOS_RAPIDOS_UTM
} from '../types/utilidades';
import * as indicadoresAPI from '../lib/api/indicadores';

const ConsultorUTM: React.FC = () => {
  // Estados principales
  const [mesConsulta, setMesConsulta] = useState<number>(new Date().getMonth() + 1);
  const [anoConsulta, setAnoConsulta] = useState<number>(new Date().getFullYear());
  const [consultaResult, setConsultaResult] = useState<UtmConsultaResult | null>(null);
  const [calculatorInputs, setCalculatorInputs] = useState<UtmCalculatorInputs>({
    pesos: 0,
    utm: 0,
    valorUtmActual: 0
  });
  const [calculatorResult, setCalculatorResult] = useState<UtmCalculatorResult | null>(null);
  const [historicoData, setHistoricoData] = useState<UtmHistoricoData>({});
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);
  const [calculatorLoading, setCalculatorLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'consulta' | 'calculadora' | 'historico'>('consulta');

  // Función para consultar UTM
  const consultarUTM = async (mes: number, ano: number) => {
    setLoading(true);
    
    try {
      const apiResponse = await indicadoresAPI.getUtmByPeriod(mes, ano);
      
      if (apiResponse.success) {
        const result: UtmConsultaResult = {
          mes,
          ano,
          valor: apiResponse.valor,
          mesNombre: MESES_NOMBRES[mes - 1] || 'Mes desconocido',
          periodo: `${MESES_NOMBRES[mes - 1] || 'Mes desconocido'} ${ano}`,
          success: true
        };
        
        setConsultaResult(result);
        
        // Actualizar calculadora con el nuevo valor
        setCalculatorInputs(prev => ({
          ...prev,
          valorUtmActual: result.valor
        }));
      } else {
        setConsultaResult({
          mes,
          ano,
          valor: 0,
          mesNombre: MESES_NOMBRES[mes - 1] || 'Mes desconocido',
          periodo: `${MESES_NOMBRES[mes - 1] || 'Mes desconocido'} ${ano}`,
          success: false,
          errorMessage: apiResponse.error || 'Error al consultar el valor de la UTM'
        });
      }
      
    } catch (error) {
      setConsultaResult({
        mes,
        ano,
        valor: 0,
        mesNombre: MESES_NOMBRES[mes - 1] || 'Mes desconocido',
        periodo: `${MESES_NOMBRES[mes - 1] || 'Mes desconocido'} ${ano}`,
        success: false,
        errorMessage: 'Error de conexión al consultar la UTM'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para usar períodos rápidos
  const usePeriodoRapido = (key: string) => {
    const today = new Date();
    let targetMes = today.getMonth() + 1;
    let targetAno = today.getFullYear();
    
    switch (key) {
      case 'current':
        break;
      case 'previous':
        targetMes = targetMes === 1 ? 12 : targetMes - 1;
        if (targetMes === 12) targetAno--;
        break;
      case 'year_ago':
        targetAno--;
        break;
    }
    
    setMesConsulta(targetMes);
    setAnoConsulta(targetAno);
    consultarUTM(targetMes, targetAno);
  };

  // Función para calcular conversiones
  const calcularConversion = (type: 'toPesos' | 'toUtm') => {
    setCalculatorLoading(true);
    
    setTimeout(() => {
      const valorUtm = calculatorInputs.valorUtmActual || consultaResult?.valor || 60000;
      
      let result: UtmCalculatorResult;
      
      if (type === 'toPesos') {
        const pesos = calculatorInputs.utm * valorUtm;
        result = {
          fromPesos: 0,
          fromUtm: calculatorInputs.utm,
          toPesos: Math.round(pesos),
          toUtm: 0,
          valorUtmUsado: valorUtm,
          periodoConsulta: consultaResult?.periodo || `${MESES_NOMBRES[new Date().getMonth()]} ${new Date().getFullYear()}`
        };
      } else {
        const utm = calculatorInputs.pesos / valorUtm;
        result = {
          fromPesos: calculatorInputs.pesos,
          fromUtm: 0,
          toPesos: 0,
          toUtm: Math.round(utm * 10000) / 10000,
          valorUtmUsado: valorUtm,
          periodoConsulta: consultaResult?.periodo || `${MESES_NOMBRES[new Date().getMonth()]} ${new Date().getFullYear()}`
        };
      }
      
      setCalculatorResult(result);
      setCalculatorLoading(false);
    }, 300);
  };

  // Función para cargar datos de un año específico
  const cargarAnoHistorico = async (year: number) => {
    setSelectedYear(year);
    setLoading(true);
    
    try {
      const apiResponse = await indicadoresAPI.getUtmHistorico(year);
      
      if (apiResponse.success) {
        // Convertir datos de API al formato esperado
        const yearData: UtmAnualData = {};
        
        apiResponse.data.forEach(item => {
          yearData[item.mes] = {
            mes: item.mes,
            ano: item.ano,
            valor: item.valor,
            mesNombre: MESES_NOMBRES[item.mes - 1] || 'Mes desconocido'
          };
        });
        
        // Actualizar solo el año seleccionado en historicoData
        setHistoricoData(prev => ({
          ...prev,
          [year]: yearData
        }));
      } else {
        console.error('Error al cargar UTM histórico:', apiResponse.error);
      }
    } catch (error) {
      console.error('Error al cargar datos históricos UTM:', error);
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    const initializeData = async () => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      
      // Cargar UTM actual y datos históricos del año actual en paralelo
      await Promise.all([
        consultarUTM(currentMonth, currentYear),
        cargarAnoHistorico(currentYear)
      ]);
    };
    
    initializeData();
  }, []);

  // Formatear números usando las funciones del servicio API
  const formatPesos = indicadoresAPI.formatPesos;
  const formatUTM = indicadoresAPI.formatUTM;

  // Obtener años disponibles
  const getAvailableYears = (): number[] => {
    return Object.keys(historicoData).map(year => parseInt(year)).sort((a, b) => b - a);
  };

  return (
    <Layout title="Consultor UTM - Cuentas Claras">
      <div className="container-fluid px-4 py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/dashboard">
                    <i className="material-icons me-1">home</i>
                    Dashboard
                  </Link>
                </li>
                <li className="breadcrumb-item active">
                  <i className="material-icons me-1">calculate</i>
                  Consultor UTM
                </li>
              </ol>
            </nav>
            
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h3 mb-1">
                  <i className="material-icons me-2">calculate</i>
                  Consultor de UTM
                </h1>
                <p className="text-muted mb-0">
                  Consulta valores de Unidad Tributaria Mensual y realiza conversiones
                </p>
              </div>
              
              <div className="btn-group">
                <Link href="/util-rut" className="btn btn-outline-primary">
                  <i className="material-icons me-1">badge</i>
                  Validar RUT
                </Link>
                <Link href="/util-uf" className="btn btn-outline-primary">
                  <i className="material-icons me-1">attach_money</i>
                  Consultar UF
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'consulta' ? 'active' : ''}`}
                  onClick={() => setActiveTab('consulta')}
                >
                  <i className="material-icons me-1">search</i>
                  Consultar UTM
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'calculadora' ? 'active' : ''}`}
                  onClick={() => setActiveTab('calculadora')}
                >
                  <i className="material-icons me-1">calculate</i>
                  Calculadora
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'historico' ? 'active' : ''}`}
                  onClick={() => setActiveTab('historico')}
                >
                  <i className="material-icons me-1">table_chart</i>
                  Histórico
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab: Consultar UTM */}
        {activeTab === 'consulta' && (
          <div className="row">
            <div className="col-lg-8">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">
                    <i className="material-icons me-2">search</i>
                    Consultar Valor UTM
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label htmlFor="mesConsulta" className="form-label">
                        Mes:
                      </label>
                      <select
                        className="form-select"
                        id="mesConsulta"
                        value={mesConsulta}
                        onChange={(e) => setMesConsulta(parseInt(e.target.value))}
                      >
                        {MESES_NOMBRES.map((mes, index) => (
                          <option key={index + 1} value={index + 1}>
                            {mes}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="anoConsulta" className="form-label">
                        Año:
                      </label>
                      <select
                        className="form-select"
                        id="anoConsulta"
                        value={anoConsulta}
                        onChange={(e) => setAnoConsulta(parseInt(e.target.value))}
                      >
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                      <button 
                        className="btn btn-primary w-100"
                        onClick={() => consultarUTM(mesConsulta, anoConsulta)}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Consultando...
                          </>
                        ) : (
                          <>
                            <i className="material-icons me-2">search</i>
                            Consultar
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Períodos rápidos */}
                  <div className="mt-4">
                    <h6 className="mb-3">Consultas rápidas:</h6>
                    <div className="row g-2">
                      {PERIODOS_RAPIDOS_UTM.map((periodo) => (
                        <div key={periodo.key} className="col-md-4">
                          <button 
                            className="btn btn-outline-secondary w-100"
                            onClick={() => usePeriodoRapido(periodo.key)}
                            disabled={loading}
                          >
                            <i className="material-icons me-1">{periodo.icon}</i>
                            <div>
                              <div>{periodo.label}</div>
                              <small className="text-muted">{periodo.description}</small>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resultado de consulta */}
                  {consultaResult && (
                    <div className="mt-4">
                      {consultaResult.success ? (
                        <div className="alert alert-success">
                          <div className="d-flex align-items-center">
                            <i className="material-icons me-2">check_circle</i>
                            <div className="flex-grow-1">
                              <h6 className="mb-1">Valor UTM encontrado</h6>
                              <p className="mb-1">
                                <strong>Período:</strong> {consultaResult.periodo}
                              </p>
                              <p className="mb-0">
                                <strong>Valor:</strong> 
                                <span className="h5 ms-2 text-success">
                                  {formatPesos(consultaResult.valor)}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="alert alert-danger">
                          <i className="material-icons me-2">error</i>
                          {consultaResult.errorMessage}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card">
                <div className="card-header">
                  <h6 className="card-title mb-0">
                    <i className="material-icons me-1">info</i>
                    Información UTM
                  </h6>
                </div>
                <div className="card-body">
                  <p className="text-muted small">
                    La Unidad Tributaria Mensual (UTM) es una unidad de medida reajustable 
                    mensualmente por el Servicio de Impuestos Internos.
                  </p>
                  <ul className="text-muted small">
                    <li>Se actualiza mensualmente</li>
                    <li>Basada en la variación del IPC</li>
                    <li>Utilizada para multas y tributos</li>
                    <li>Publicada en el Diario Oficial</li>
                    <li>Vigente todo el mes calendario</li>
                  </ul>
                </div>
              </div>
              
              {/* Panel de Control de Sincronización */}
              <div className="mt-3">
                <SyncControlPanel showTitle={true} />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Calculadora */}
        {activeTab === 'calculadora' && (
          <div className="row">
            <div className="col-lg-6">
              <div className="card">
                <div className="card-header bg-success text-white">
                  <h5 className="card-title mb-0">
                    <i className="material-icons me-2">calculate</i>
                    Pesos a UTM
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label htmlFor="pesosInputUtm" className="form-label">
                      Cantidad en pesos chilenos:
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        id="pesosInputUtm"
                        value={calculatorInputs.pesos || ''}
                        onChange={(e) => setCalculatorInputs(prev => ({
                          ...prev,
                          pesos: parseFloat(e.target.value) || 0
                        }))}
                        placeholder="Ej: 500000"
                      />
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-success w-100"
                    onClick={() => calcularConversion('toUtm')}
                    disabled={calculatorLoading || calculatorInputs.pesos <= 0}
                  >
                    {calculatorLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Calculando...
                      </>
                    ) : (
                      <>
                        <i className="material-icons me-2">arrow_forward</i>
                        Convertir a UTM
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card">
                <div className="card-header bg-info text-white">
                  <h5 className="card-title mb-0">
                    <i className="material-icons me-2">calculate</i>
                    UTM a Pesos
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label htmlFor="utmInput" className="form-label">
                      Cantidad en UTM:
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">UTM</span>
                      <input
                        type="number"
                        className="form-control"
                        id="utmInput"
                        value={calculatorInputs.utm || ''}
                        onChange={(e) => setCalculatorInputs(prev => ({
                          ...prev,
                          utm: parseFloat(e.target.value) || 0
                        }))}
                        placeholder="Ej: 10.5"
                        step="0.0001"
                      />
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-info w-100"
                    onClick={() => calcularConversion('toPesos')}
                    disabled={calculatorLoading || calculatorInputs.utm <= 0}
                  >
                    {calculatorLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Calculando...
                      </>
                    ) : (
                      <>
                        <i className="material-icons me-2">arrow_forward</i>
                        Convertir a Pesos
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Resultado de calculadora */}
            {calculatorResult && (
              <div className="col-12 mt-4">
                <div className="card">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="material-icons me-1">analytics</i>
                      Resultado de Conversión
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-md-3">
                        <div className="mb-2">
                          <small className="text-muted">Valor ingresado</small>
                        </div>
                        <div className="h5">
                          {calculatorResult.fromPesos > 0 
                            ? formatPesos(calculatorResult.fromPesos)
                            : formatUTM(calculatorResult.fromUtm)
                          }
                        </div>
                      </div>
                      
                      <div className="col-md-2 d-flex align-items-center justify-content-center">
                        <i className="material-icons text-primary h3">arrow_forward</i>
                      </div>
                      
                      <div className="col-md-3">
                        <div className="mb-2">
                          <small className="text-muted">Resultado</small>
                        </div>
                        <div className="h5 text-primary">
                          {calculatorResult.toPesos > 0 
                            ? formatPesos(calculatorResult.toPesos)
                            : formatUTM(calculatorResult.toUtm)
                          }
                        </div>
                      </div>
                      
                      <div className="col-md-4">
                        <div className="mb-2">
                          <small className="text-muted">Valor UTM usado</small>
                        </div>
                        <div>
                          {formatPesos(calculatorResult.valorUtmUsado)}
                        </div>
                        <small className="text-muted">
                          {calculatorResult.periodoConsulta}
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
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                      <i className="material-icons me-2">table_chart</i>
                      Histórico de Valores UTM
                    </h5>
                    
                    <div className="d-flex align-items-center">
                      <label htmlFor="yearSelect" className="form-label me-2 mb-0">
                        Año:
                      </label>
                      <select
                        className="form-select"
                        id="yearSelect"
                        value={selectedYear}
                        onChange={(e) => cargarAnoHistorico(parseInt(e.target.value))}
                        style={{ width: 'auto' }}
                      >
                        {getAvailableYears().map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {/* Tabla anual */}
                  {historicoData[selectedYear] && (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>Mes</th>
                            <th>Valor UTM</th>
                            <th>Variación vs. mes anterior</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(historicoData[selectedYear])
                            .sort(([a], [b]) => parseInt(a) - parseInt(b))
                            .map(([mesNum, data], index) => {
                              const mesAnterior = historicoData[selectedYear]?.[parseInt(mesNum) - 1];
                              const variacion = mesAnterior ? data.valor - mesAnterior.valor : 0;
                              const variacionPorcentaje = mesAnterior ? (variacion / mesAnterior.valor) * 100 : 0;
                              
                              return (
                                <tr key={mesNum}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <strong>{data.mesNombre}</strong>
                                      <small className="text-muted ms-2">{selectedYear}</small>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="h6 text-primary">
                                      {formatPesos(data.valor)}
                                    </span>
                                  </td>
                                  <td>
                                    {mesAnterior ? (
                                      <div className={variacion >= 0 ? 'text-success' : 'text-danger'}>
                                        <i className={`material-icons me-1 ${variacion >= 0 ? 'text-success' : 'text-danger'}`}>
                                          {variacion >= 0 ? 'trending_up' : 'trending_down'}
                                        </i>
                                        {formatPesos(Math.abs(variacion))}
                                        <small className="ms-1">
                                          ({variacionPorcentaje.toFixed(2)}%)
                                        </small>
                                      </div>
                                    ) : (
                                      <span className="text-muted">-</span>
                                    )}
                                  </td>
                                  <td>
                                    <button 
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => {
                                        setMesConsulta(data.mes);
                                        setAnoConsulta(data.ano);
                                        setActiveTab('consulta');
                                        consultarUTM(data.mes, data.ano);
                                      }}
                                    >
                                      <i className="material-icons me-1">search</i>
                                      Consultar
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Resumen del año */}
                  {historicoData[selectedYear] && (
                    <div className="row mt-4">
                      <div className="col-md-3">
                        <div className="text-center">
                          <div className="text-muted">Valor mínimo</div>
                          <div className="h6 text-success">
                            {formatPesos(Math.min(...Object.values(historicoData[selectedYear]).map(v => v.valor)))}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <div className="text-muted">Valor máximo</div>
                          <div className="h6 text-danger">
                            {formatPesos(Math.max(...Object.values(historicoData[selectedYear]).map(v => v.valor)))}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <div className="text-muted">Promedio anual</div>
                          <div className="h6 text-primary">
                            {formatPesos(
                              Object.values(historicoData[selectedYear])
                                .reduce((sum, v) => sum + v.valor, 0) / 
                              Object.values(historicoData[selectedYear]).length
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <div className="text-muted">Meses disponibles</div>
                          <div className="h6 text-info">
                            {Object.keys(historicoData[selectedYear]).length} de 12
                          </div>
                        </div>
                      </div>
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

export default ConsultorUTM;