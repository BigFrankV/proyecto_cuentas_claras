import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import Head from 'next/head';

import { useMedidores } from '@/hooks/useMedidores';
import { medidoresService, Medidor } from '@/lib/medidoresService';

interface ConsumoCalculado {
  medidor_id: number;
  medidor_codigo: string;
  medidor_tipo: string;
  unidad_id?: number;
  periodo: string;
  lectura_actual: number;
  lectura_anterior: number;
  consumo: number;
  tarifa_precio?: number;
  monto_calculado?: number;
  fecha_inicio: string;
  fecha_fin: string;
}

interface TarifaConsumo {
  id: number;
  tipo_medidor: string;
  precio_unitario: number;
  moneda: string;
  vigente_desde: string;
  vigente_hasta?: string;
  activa: boolean;
}

export default function ConsumosPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Estados
  const [comunidadId, setComunidadId] = useState<number | null>(null);
  const [consumos, setConsumos] = useState<ConsumoCalculado[]>([]);
  const [tarifas, setTarifas] = useState<TarifaConsumo[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [unidadFiltro, setUnidadFiltro] = useState<string>('todas');

  // Modal states
  const [showTarifasModal, setShowTarifasModal] = useState(false);
  const [showResumenModal, setShowResumenModal] = useState(false);

  // Usar hook de medidores
  const { medidores } = useMedidores(comunidadId);

  // Obtener comunidad del usuario
  useEffect(() => {
    if (user) {
      const membresias = user?.membresias || user?.memberships || [];
      if (membresias.length > 0) {
        const comunidadId = membresias[0].comunidad_id || membresias[0].comunidadId;
        setComunidadId(comunidadId);
      }
    }
  }, [user]);

  // Cargar datos cuando cambia el período o comunidad
  useEffect(() => {
    if (comunidadId && periodoSeleccionado) {
      Promise.all([
        loadConsumos(),
        loadTarifas()
      ]);
    }
  }, [comunidadId, periodoSeleccionado]);

  // Cargar consumos del período
  const loadConsumos = async () => {
    if (!comunidadId || !periodoSeleccionado) return;

    try {
      setLoading(true);
      
      // Por ahora simulamos la respuesta hasta crear el endpoint
      const consumosSimulados: ConsumoCalculado[] = medidores.map((medidor, index) => ({
        medidor_id: medidor.id,
        medidor_codigo: medidor.codigo,
        medidor_tipo: medidor.tipo,
        unidad_id: medidor.unidad_id,
        periodo: periodoSeleccionado,
        lectura_actual: 1000 + Math.floor(Math.random() * 500),
        lectura_anterior: 800 + Math.floor(Math.random() * 400),
        consumo: 0,
        fecha_inicio: `${periodoSeleccionado}-01`,
        fecha_fin: `${periodoSeleccionado}-30`
      })).map(item => ({
        ...item,
        consumo: item.lectura_actual - item.lectura_anterior
      }));

      setConsumos(consumosSimulados);
    } catch (error) {
      console.error('Error loading consumos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar tarifas activas
  const loadTarifas = async () => {
    try {
      // Simulamos tarifas hasta crear el endpoint
      const tarifasSimuladas: TarifaConsumo[] = [
        { id: 1, tipo_medidor: 'agua', precio_unitario: 1200, moneda: 'CLP', vigente_desde: '2024-01-01', activa: true },
        { id: 2, tipo_medidor: 'luz', precio_unitario: 150, moneda: 'CLP', vigente_desde: '2024-01-01', activa: true },
        { id: 3, tipo_medidor: 'gas', precio_unitario: 800, moneda: 'CLP', vigente_desde: '2024-01-01', activa: true },
        { id: 4, tipo_medidor: 'calefaccion', precio_unitario: 2000, moneda: 'CLP', vigente_desde: '2024-01-01', activa: true }
      ];
      
      setTarifas(tarifasSimuladas);
    } catch (error) {
      console.error('Error loading tarifas:', error);
    }
  };

  // Calcular monto con tarifa
  const calcularMonto = (consumo: ConsumoCalculado): number => {
    const tarifa = tarifas.find(t => t.tipo_medidor === consumo.medidor_tipo && t.activa);
    if (!tarifa) return 0;
    return consumo.consumo * tarifa.precio_unitario;
  };

  // Obtener tarifa por tipo
  const getTarifa = (tipo: string): TarifaConsumo | undefined => {
    return tarifas.find(t => t.tipo_medidor === tipo && t.activa);
  };

  // Filtrar consumos
  const consumosFiltrados = consumos.filter(consumo => {
    if (tipoFiltro !== 'todos' && consumo.medidor_tipo !== tipoFiltro) return false;
    if (unidadFiltro !== 'todas' && consumo.unidad_id?.toString() !== unidadFiltro) return false;
    return true;
  });

  // Estadísticas
  const estadisticas = {
    totalConsumos: consumosFiltrados.length,
    totalMonto: consumosFiltrados.reduce((sum, c) => sum + calcularMonto(c), 0),
    promedioConsumo: consumosFiltrados.length > 0 ? 
      consumosFiltrados.reduce((sum, c) => sum + c.consumo, 0) / consumosFiltrados.length : 0,
    porTipo: ['agua', 'luz', 'gas', 'calefaccion'].map(tipo => ({
      tipo,
      cantidad: consumosFiltrados.filter(c => c.medidor_tipo === tipo).length,
      consumo: consumosFiltrados.filter(c => c.medidor_tipo === tipo).reduce((sum, c) => sum + c.consumo, 0),
      monto: consumosFiltrados.filter(c => c.medidor_tipo === tipo).reduce((sum, c) => sum + calcularMonto(c), 0)
    })).filter(item => item.cantidad > 0)
  };

  // Obtener unidades únicas
  const unidadesUnicas = [...new Set(consumos.map(c => c.unidad_id).filter(Boolean))].sort((a, b) => a! - b!);

  if (!comunidadId) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="alert alert-warning">
            <span className="material-icons align-middle me-2">warning</span>
            Sin acceso a comunidad
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Consumos y Facturación — Cuentas Claras</title>
      </Head>

      <Layout title='Consumos y Facturación'>
        <div className='container-fluid p-4'>
          
          {/* Header */}
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div>
              <h1 className='h3 mb-0'>
                <span className="material-icons align-middle me-2">analytics</span>
                Consumos y Facturación
              </h1>
              <p className="text-muted mb-0">
                Período: {periodoSeleccionado} • {estadisticas.totalConsumos} medidores
              </p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className='btn btn-outline-primary'
                onClick={() => setShowTarifasModal(true)}
              >
                <span className="material-icons align-middle me-1">price_change</span>
                Ver Tarifas
              </button>
              <button 
                className='btn btn-success'
                onClick={() => setShowResumenModal(true)}
              >
                <span className="material-icons align-middle me-1">summarize</span>
                Resumen
              </button>
            </div>
          </div>

          {/* Filtros y Controles */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-end">
                
                {/* Período */}
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-semibold">Período</label>
                  <input 
                    type="month" 
                    className="form-control"
                    value={periodoSeleccionado}
                    onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                  />
                </div>

                {/* Tipo de Medidor */}
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-semibold">Tipo</label>
                  <select 
                    className="form-select"
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                  >
                    <option value="todos">Todos los tipos</option>
                    <option value="agua">💧 Agua</option>
                    <option value="luz">⚡ Electricidad</option>
                    <option value="gas">🔥 Gas</option>
                    <option value="calefaccion">🌡️ Calefacción</option>
                  </select>
                </div>

                {/* Unidad */}
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-semibold">Unidad</label>
                  <select 
                    className="form-select"
                    value={unidadFiltro}
                    onChange={(e) => setUnidadFiltro(e.target.value)}
                  >
                    <option value="todas">Todas las unidades</option>
                    {unidadesUnicas.map(unidad => (
                      <option key={unidad} value={unidad?.toString()}>
                        Unidad {unidad}
                      </option>
                    ))}
                    <option value="undefined">Medidores comunes</option>
                  </select>
                </div>

                {/* Acciones */}
                <div className="col-md-3 mb-3">
                  <button 
                    className="btn btn-primary w-100"
                    onClick={loadConsumos}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm align-middle me-1" role="status"></span>
                    ) : (
                      <span className="material-icons align-middle me-1">refresh</span>
                    )}
                    Actualizar
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Estadísticas Rápidas */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card border-primary">
                <div className="card-body text-center">
                  <span className="material-icons mb-2 text-primary" style={{fontSize: '32px'}}>sensors</span>
                  <h4 className="text-primary mb-0">{estadisticas.totalConsumos}</h4>
                  <small className="text-muted">Medidores</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-success">
                <div className="card-body text-center">
                  <span className="material-icons mb-2 text-success" style={{fontSize: '32px'}}>attach_money</span>
                  <h4 className="text-success mb-0">${estadisticas.totalMonto.toLocaleString()}</h4>
                  <small className="text-muted">Monto Total</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-info">
                <div className="card-body text-center">
                  <span className="material-icons mb-2 text-info" style={{fontSize: '32px'}}>trending_up</span>
                  <h4 className="text-info mb-0">{estadisticas.promedioConsumo.toFixed(1)}</h4>
                  <small className="text-muted">Promedio Consumo</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-warning">
                <div className="card-body text-center">
                  <span className="material-icons mb-2 text-warning" style={{fontSize: '32px'}}>category</span>
                  <h4 className="text-warning mb-0">{estadisticas.porTipo.length}</h4>
                  <small className="text-muted">Tipos Activos</small>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Consumos */}
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <span className="material-icons align-middle me-2">list</span>
                Detalle de Consumos ({consumosFiltrados.length})
              </h6>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Calculando consumos...</span>
                  </div>
                </div>
              ) : consumosFiltrados.length === 0 ? (
                <div className="text-center py-5">
                  <span className="material-icons mb-3" style={{fontSize: '48px', color: '#6c757d'}}>
                    analytics
                  </span>
                  <h5 className="text-muted">No hay consumos para mostrar</h5>
                  <p className="text-muted">Ajusta los filtros o verifica que haya lecturas registradas</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Medidor</th>
                        <th className="text-center">Unidad</th>
                        <th className="text-end">Lectura Anterior</th>
                        <th className="text-end">Lectura Actual</th>
                        <th className="text-end">Consumo</th>
                        <th className="text-end">Tarifa</th>
                        <th className="text-end">Monto</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consumosFiltrados.map((consumo) => {
                        const tarifa = getTarifa(consumo.medidor_tipo);
                        const monto = calcularMonto(consumo);
                        
                        return (
                          <tr key={`${consumo.medidor_id}-${consumo.periodo}`}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className={`p-1 rounded me-2`} style={{
                                  backgroundColor: consumo.medidor_tipo === 'agua' ? '#e3f2fd' : 
                                                 consumo.medidor_tipo === 'luz' ? '#fff3e0' : '#f3e5f5',
                                  color: consumo.medidor_tipo === 'agua' ? '#1565c0' : 
                                         consumo.medidor_tipo === 'luz' ? '#ef6c00' : '#6a1b9a'
                                }}>
                                  <span className="material-icons" style={{fontSize: '16px'}}>
                                    {consumo.medidor_tipo === 'agua' ? 'water_drop' : 
                                     consumo.medidor_tipo === 'luz' ? 'flash_on' : 
                                     consumo.medidor_tipo === 'gas' ? 'local_gas_station' : 'sensors'}
                                  </span>
                                </div>
                                <div>
                                  <div className="fw-semibold">{consumo.medidor_codigo}</div>
                                  <small className="text-muted text-capitalize">{consumo.medidor_tipo}</small>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              {consumo.unidad_id ? (
                                <span className="badge bg-info">{consumo.unidad_id}</span>
                              ) : (
                                <span className="badge bg-secondary">Común</span>
                              )}
                            </td>
                            <td className="text-end font-monospace">{consumo.lectura_anterior}</td>
                            <td className="text-end font-monospace">{consumo.lectura_actual}</td>
                            <td className="text-end">
                              <span className={`badge ${consumo.consumo >= 0 ? 'bg-success' : 'bg-warning'}`}>
                                {consumo.consumo.toFixed(1)}
                              </span>
                            </td>
                            <td className="text-end">
                              {tarifa ? (
                                <div>
                                  <span className="fw-semibold">${tarifa.precio_unitario.toLocaleString()}</span>
                                  <small className="text-muted d-block">
                                    {consumo.medidor_tipo === 'agua' ? '/m³' : 
                                     consumo.medidor_tipo === 'luz' ? '/kWh' : '/unidad'}
                                  </small>
                                </div>
                              ) : (
                                <span className="text-danger">Sin tarifa</span>
                              )}
                            </td>
                            <td className="text-end">
                              <strong className="text-success">${monto.toLocaleString()}</strong>
                            </td>
                            <td className="text-center">
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-primary btn-sm" title="Ver detalles">
                                  <span className="material-icons" style={{fontSize: '14px'}}>visibility</span>
                                </button>
                                <button className="btn btn-outline-success btn-sm" title="Generar factura">
                                  <span className="material-icons" style={{fontSize: '14px'}}>receipt</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Footer con totales */}
            {consumosFiltrados.length > 0 && (
              <div className="card-footer bg-light">
                <div className="row text-center">
                  <div className="col">
                    <div className="fw-semibold text-primary">
                      {consumosFiltrados.reduce((sum, c) => sum + c.consumo, 0).toFixed(1)}
                    </div>
                    <small className="text-muted">Consumo Total</small>
                  </div>
                  <div className="col">
                    <div className="fw-semibold text-success">
                      ${consumosFiltrados.reduce((sum, c) => sum + calcularMonto(c), 0).toLocaleString()}
                    </div>
                    <small className="text-muted">Monto Total</small>
                  </div>
                  <div className="col">
                    <div className="fw-semibold text-info">
                      ${(consumosFiltrados.reduce((sum, c) => sum + calcularMonto(c), 0) / Math.max(1, consumosFiltrados.length)).toLocaleString()}
                    </div>
                    <small className="text-muted">Promedio</small>
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </div>

        {/* Modal Tarifas */}
        {showTarifasModal && (
          <div className="modal fade show" style={{display: 'block'}} tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <span className="material-icons align-middle me-2">price_change</span>
                    Tarifas Vigentes
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowTarifasModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Tipo</th>
                          <th className="text-end">Precio Unitario</th>
                          <th>Vigente Desde</th>
                          <th className="text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tarifas.map((tarifa) => (
                          <tr key={tarifa.id}>
                            <td>
                              <span className="text-capitalize fw-semibold">
                                {tarifa.tipo_medidor === 'agua' ? '💧' : 
                                 tarifa.tipo_medidor === 'luz' ? '⚡' : 
                                 tarifa.tipo_medidor === 'gas' ? '🔥' : '🌡️'} {tarifa.tipo_medidor}
                              </span>
                            </td>
                            <td className="text-end">
                              <strong>${tarifa.precio_unitario.toLocaleString()}</strong>
                              <small className="text-muted d-block">
                                {tarifa.tipo_medidor === 'agua' ? '/m³' : 
                                 tarifa.tipo_medidor === 'luz' ? '/kWh' : '/unidad'}
                              </small>
                            </td>
                            <td>{new Date(tarifa.vigente_desde).toLocaleDateString()}</td>
                            <td className="text-center">
                              <span className={`badge ${tarifa.activa ? 'bg-success' : 'bg-secondary'}`}>
                                {tarifa.activa ? 'Activa' : 'Inactiva'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowTarifasModal(false)}
                  >
                    Cerrar
                  </button>
                  <button type="button" className="btn btn-primary">
                    <span className="material-icons align-middle me-1">edit</span>
                    Gestionar Tarifas
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Resumen */}
        {showResumenModal && (
          <div className="modal fade show" style={{display: 'block'}} tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <span className="material-icons align-middle me-2">summarize</span>
                    Resumen del Período
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowResumenModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <h6 className="fw-semibold mb-3">Período: {periodoSeleccionado}</h6>
                  
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Tipo</th>
                          <th className="text-center">Medidores</th>
                          <th className="text-end">Consumo</th>
                          <th className="text-end">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estadisticas.porTipo.map((item) => (
                          <tr key={item.tipo}>
                            <td>
                              <span className="text-capitalize">
                                {item.tipo === 'agua' ? '💧' : 
                                 item.tipo === 'luz' ? '⚡' : 
                                 item.tipo === 'gas' ? '🔥' : '🌡️'} {item.tipo}
                              </span>
                            </td>
                            <td className="text-center">{item.cantidad}</td>
                            <td className="text-end">{item.consumo.toFixed(1)}</td>
                            <td className="text-end fw-semibold">${item.monto.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-primary">
                          <th>TOTAL</th>
                          <th className="text-center">{estadisticas.totalConsumos}</th>
                          <th className="text-end">
                            {consumosFiltrados.reduce((sum, c) => sum + c.consumo, 0).toFixed(1)}
                          </th>
                          <th className="text-end">${estadisticas.totalMonto.toLocaleString()}</th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowResumenModal(false)}
                  >
                    Cerrar
                  </button>
                  <button type="button" className="btn btn-success">
                    <span className="material-icons align-middle me-1">download</span>
                    Exportar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backdrop */}
        {(showTarifasModal || showResumenModal) && (
          <div className="modal-backdrop fade show"></div>
        )}

      </Layout>
    </ProtectedRoute>
  );
}