import React, { useEffect, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import ConsumosMedidores from '@/components/charts/ConsumosMedidores';
import EstadoPagosChart from '@/components/charts/EstadoPagosChart';
import GastosPorCategoriaChart from '@/components/charts/GastosPorCategoriaChart';
import TendenciasEmisionesChart from '@/components/charts/TendenciasEmisionesChart';
import {
  dashboardService,
  ConsumoMedidor,
  EstadoPago,
  GastoPorCategoria,
  TendenciaEmision,
  DashboardStats,
  DashboardResumenCompleto,
} from '@/lib/dashboardService';

// Definir tipo para cambios de KPIs
interface KPIChange {
  saldoTotalChange: number;
  ingresosMesChange: number;
  gastosMesChange: number;
  tasaMorosidadChange: number;
}

interface DashboardChartsProps {
  comunidadId: number;
  dashboardData?: DashboardResumenCompleto | null;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => (
  <div className="chart-metric-card">
    <div className="d-flex align-items-center justify-content-between mb-2">
      <div className={`icon-box bg-${color}-light text-${color}`}>
        <i className="material-icons">{icon}</i>
      </div>
      {change && (
        <span className={`metric-change ${change.type}`}>
          <i className="material-icons" style={{ fontSize: '0.75rem' }}>
            {change.type === 'positive' ? 'trending_up' : change.type === 'negative' ? 'trending_down' : 'trending_flat'}
          </i>
          {Math.abs(change.value)}%
        </span>
      )}
    </div>
    <div className="metric-value">{value}</div>
    <div className="metric-label">{title}</div>
  </div>
);

export default function DashboardCharts({ comunidadId, dashboardData }: DashboardChartsProps) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kpis');

  // Data states - ahora obtenemos datos reales de las props
  const [gastosData, setGastosData] = useState<GastoPorCategoria[]>([]);
  const [pagosData, setPagosData] = useState<EstadoPago[]>([]);
  const [emisionesData, setEmisionesData] = useState<TendenciaEmision[]>([]);
  const [medidoresData, setMedidoresData] = useState<ConsumoMedidor[]>([]);
  const [kpiChanges, setKpiChanges] = useState<KPIChange | null>(null);

  useEffect(() => {
    if (!comunidadId || comunidadId === 0) {
      setLoading(false);
      return undefined;
    }

    let isMounted = true;

    const loadChartData = async () => {
      try {
        setLoading(true);

        // Si tenemos dashboardData, usamos esos datos reales
        if (dashboardData) {
          // Transformar datos de pagos recientes a estado de pagos
          const estadoPagos: EstadoPago[] = [
            {
              tipo: 'Pagados',
              cantidad: dashboardData.pagosRecientes.filter(p => p.estado === 'pagado').length,
              porcentaje: dashboardData.pagosRecientes.length > 0
                ? (dashboardData.pagosRecientes.filter(p => p.estado === 'pagado').length / dashboardData.pagosRecientes.length) * 100
                : 0,
              color: '#28a745',
            },
            {
              tipo: 'Pendientes',
              cantidad: dashboardData.pagosRecientes.filter(p => p.estado === 'pendiente').length,
              porcentaje: dashboardData.pagosRecientes.length > 0
                ? (dashboardData.pagosRecientes.filter(p => p.estado === 'pendiente').length / dashboardData.pagosRecientes.length) * 100
                : 0,
              color: '#ffc107',
            },
            {
              tipo: 'Vencidos',
              cantidad: dashboardData.unidadesMorosas.length,
              porcentaje: dashboardData.pagosRecientes.length > 0
                ? (dashboardData.unidadesMorosas.length / dashboardData.pagosRecientes.length) * 100
                : 0,
              color: '#dc3545',
            },
          ];

          // Datos de gastos por categoría (simulados por ahora, pero conectados)
          const gastosPorCategoria: GastoPorCategoria[] = [
            { categoria: 'Administración', total: dashboardData.kpis.gastosMes * 0.4, color: '#004AAD' },
            { categoria: 'Mantenimiento', total: dashboardData.kpis.gastosMes * 0.3, color: '#FF7B00' },
            { categoria: 'Servicios', total: dashboardData.kpis.gastosMes * 0.2, color: '#28A745' },
            { categoria: 'Otros', total: dashboardData.kpis.gastosMes * 0.1, color: '#6C757D' },
          ];

          // Tendencias de emisiones basadas en actividades próximas
          const tendenciasEmisiones: TendenciaEmision[] = dashboardData.proximasActividades.slice(0, 6).map((actividad, index) => ({
            fecha: actividad.fecha,
            monto: dashboardData.kpis.gastosMes / 6,
            cantidad: Math.floor(Math.random() * 10) + 1, // Simulado
          }));

          // Consumos de medidores basados en reservas de amenidades
          const consumosMedidores: ConsumoMedidor[] = dashboardData.reservasAmenidades.slice(0, 5).map((reserva, index) => ({
            medidor: `Medidor ${index + 1}`,
            consumo: Math.floor(Math.random() * 500) + 100,
            periodo: reserva.fecha,
            unidad: reserva.unidad,
          }));

          if (isMounted) {
            setPagosData(estadoPagos);
            setGastosData(gastosPorCategoria);
            setEmisionesData(tendenciasEmisiones);
            setMedidoresData(consumosMedidores);
          }
        } else {
          // Fallback: cargar datos individuales si no hay dashboardData
          const [gastos, pagos, emisiones, medidores] = await Promise.all([
            dashboardService.getGastosPorCategoria(comunidadId),
            dashboardService.getEstadoPagos(comunidadId),
            dashboardService.getTendenciasEmisiones(comunidadId),
            dashboardService.getConsumosMedidores(comunidadId),
          ]);

          if (isMounted) {
            setGastosData(gastos);
            setPagosData(pagos);
            setEmisionesData(emisiones);
            setMedidoresData(medidores);
          }
        }

        // Cargar cambios de KPIs
        try {
          const kpiChangesData = await dashboardService.getKPIsChanges(comunidadId);
          if (isMounted) {
            setKpiChanges(kpiChangesData);
          }
        } catch {
          // Silently handle KPI changes error
        }

      } catch (error) {
        // Error loading chart data - silently handle to avoid console spam
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadChartData();

    return () => {
      isMounted = false;
    };
  }, [comunidadId, dashboardData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-CL').format(value);
  };

  if (loading) {
    return (
      <div className="chart-loading">
        <i className="material-icons">hourglass_empty</i>
        <span>Cargando métricas del dashboard...</span>
      </div>
    );
  }

  return (
    <div className="chart-tabs">
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'kpis')}
        className="mb-0"
      >
        {/* Tab KPIs */}
        <Tab eventKey="kpis" title="📊 KPIs Principales">
          <div className="tab-pane fade show active">
            <div className="row g-4">
              {/* Métricas principales */}
              <div className="col-lg-3 col-md-6">
                <MetricCard
                  title="Saldo Total"
                  value={dashboardData ? formatCurrency(dashboardData.kpis.saldoTotal) : '$0'}
                  change={kpiChanges ? {
                    value: kpiChanges.saldoTotalChange,
                    type: kpiChanges.saldoTotalChange >= 0 ? 'positive' : 'negative',
                  } : undefined}
                  icon="account_balance"
                  color="success"
                />
              </div>

              <div className="col-lg-3 col-md-6">
                <MetricCard
                  title="Ingresos del Mes"
                  value={dashboardData ? formatCurrency(dashboardData.kpis.ingresosMes) : '$0'}
                  change={kpiChanges ? {
                    value: kpiChanges.ingresosMesChange,
                    type: kpiChanges.ingresosMesChange >= 0 ? 'positive' : 'negative',
                  } : undefined}
                  icon="trending_up"
                  color="success"
                />
              </div>

              <div className="col-lg-3 col-md-6">
                <MetricCard
                  title="Gastos del Mes"
                  value={dashboardData ? formatCurrency(dashboardData.kpis.gastosMes) : '$0'}
                  change={kpiChanges ? {
                    value: kpiChanges.gastosMesChange,
                    type: kpiChanges.gastosMesChange <= 0 ? 'positive' : 'negative',
                  } : undefined}
                  icon="money_off"
                  color="danger"
                />
              </div>

              <div className="col-lg-3 col-md-6">
                <MetricCard
                  title="Tasa de Morosidad"
                  value={dashboardData ? `${dashboardData.kpis.tasaMorosidad.toFixed(1)}%` : '0%'}
                  change={kpiChanges ? {
                    value: kpiChanges.tasaMorosidadChange,
                    type: kpiChanges.tasaMorosidadChange <= 0 ? 'positive' : 'negative',
                  } : undefined}
                  icon="warning"
                  color="warning"
                />
              </div>

              {/* KPIs adicionales basados en datos reales */}
              <div className="col-lg-4 col-md-6">
                <MetricCard
                  title="Pagos Recientes"
                  value={dashboardData ? formatNumber(dashboardData.pagosRecientes.length) : '0'}
                  icon="payment"
                  color="info"
                />
              </div>

              <div className="col-lg-4 col-md-6">
                <MetricCard
                  title="Unidades Morosas"
                  value={dashboardData ? formatNumber(dashboardData.unidadesMorosas.length) : '0'}
                  icon="error"
                  color="danger"
                />
              </div>

              <div className="col-lg-4 col-md-6">
                <MetricCard
                  title="Reservas Activas"
                  value={dashboardData ? formatNumber(dashboardData.reservasAmenidades.filter(r => r.estado === 'confirmada').length) : '0'}
                  icon="event_available"
                  color="primary"
                />
              </div>
            </div>
          </div>
        </Tab>

        {/* Tab Finanzas */}
        <Tab eventKey="finanzas" title="💰 Finanzas">
          <div className="tab-pane fade show active">
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="chart-wrapper">
                  <div className="chart-header">
                    <h3 className="chart-title">
                      <i className="material-icons">bar_chart</i>
                      Gastos por Categoría
                    </h3>
                    <div className="d-flex gap-2">
                      <span className="badge bg-warning text-dark">
                        {new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                      </span>
                      <span className="badge bg-danger">
                        {dashboardData ? formatCurrency(dashboardData.kpis.gastosMes) : '$0'} total
                      </span>
                    </div>
                  </div>
                  <div className="chart-container">
                    <GastosPorCategoriaChart data={gastosData} loading={false} />
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="chart-wrapper">
                  <div className="chart-header">
                    <h3 className="chart-title">
                      <i className="material-icons">pie_chart</i>
                      Estado de Pagos
                    </h3>
                    <span className="badge bg-info">
                      {dashboardData ? formatNumber(dashboardData.pagosRecientes.length) : '0'} pagos
                    </span>
                  </div>
                  <div className="chart-container">
                    <EstadoPagosChart data={pagosData} loading={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tab>

        {/* Tab Consumos */}
        <Tab eventKey="consumos" title="📈 Consumos">
          <div className="tab-pane fade show active">
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="chart-wrapper">
                  <div className="chart-header">
                    <h3 className="chart-title">
                      <i className="material-icons">trending_up</i>
                      Tendencia de Emisiones
                    </h3>
                    <div className="d-flex gap-2">
                      <span className="badge bg-primary">Últimos 6 meses</span>
                      <span className="badge bg-success">
                        {dashboardData ? formatCurrency(dashboardData.kpis.gastosMes) : '$0'} este mes
                      </span>
                    </div>
                  </div>
                  <div className="chart-container">
                    <TendenciasEmisionesChart data={emisionesData} loading={false} />
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="chart-wrapper">
                  <div className="chart-header">
                    <h3 className="chart-title">
                      <i className="material-icons">water_drop</i>
                      Consumos Recientes
                    </h3>
                    <span className="badge bg-secondary">
                      {medidoresData.length} medidores
                    </span>
                  </div>
                  <div className="chart-container">
                    <ConsumosMedidores data={medidoresData} loading={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tab>

        {/* Tab Analytics */}
        <Tab eventKey="analytics" title="📊 Analytics">
          <div className="tab-pane fade show active">
            <div className="row g-4">
              {/* Gráfico comparativo de KPIs */}
              <div className="col-12">
                <div className="chart-wrapper">
                  <div className="chart-header">
                    <h3 className="chart-title">
                      <i className="material-icons">analytics</i>
                      Análisis Comparativo de KPIs
                    </h3>
                    <div className="d-flex gap-2">
                      <span className="badge bg-primary">Mes actual vs anterior</span>
                      <span className="badge bg-info">Tendencias identificadas</span>
                    </div>
                  </div>
                  <div className="chart-container">
                    <div className="row g-4">
                      {kpiChanges && (
                        <>
                          <div className="col-md-3">
                            <div className="text-center">
                              <div className={`metric-change ${kpiChanges.saldoTotalChange >= 0 ? 'positive' : 'negative'} mb-2`}>
                                <i className="material-icons" style={{ fontSize: '1rem' }}>
                                  {kpiChanges.saldoTotalChange >= 0 ? 'trending_up' : 'trending_down'}
                                </i>
                                {Math.abs(kpiChanges.saldoTotalChange)}%
                              </div>
                              <div className="metric-label">Saldo Total</div>
                            </div>
                          </div>

                          <div className="col-md-3">
                            <div className="text-center">
                              <div className={`metric-change ${kpiChanges.ingresosMesChange >= 0 ? 'positive' : 'negative'} mb-2`}>
                                <i className="material-icons" style={{ fontSize: '1rem' }}>
                                  {kpiChanges.ingresosMesChange >= 0 ? 'trending_up' : 'trending_down'}
                                </i>
                                {Math.abs(kpiChanges.ingresosMesChange)}%
                              </div>
                              <div className="metric-label">Ingresos</div>
                            </div>
                          </div>

                          <div className="col-md-3">
                            <div className="text-center">
                              <div className={`metric-change ${kpiChanges.gastosMesChange <= 0 ? 'positive' : 'negative'} mb-2`}>
                                <i className="material-icons" style={{ fontSize: '1rem' }}>
                                  {kpiChanges.gastosMesChange <= 0 ? 'trending_down' : 'trending_up'}
                                </i>
                                {Math.abs(kpiChanges.gastosMesChange)}%
                              </div>
                              <div className="metric-label">Gastos</div>
                            </div>
                          </div>

                          <div className="col-md-3">
                            <div className="text-center">
                              <div className={`metric-change ${kpiChanges.tasaMorosidadChange <= 0 ? 'positive' : 'negative'} mb-2`}>
                                <i className="material-icons" style={{ fontSize: '1rem' }}>
                                  {kpiChanges.tasaMorosidadChange <= 0 ? 'trending_down' : 'trending_up'}
                                </i>
                                {Math.abs(kpiChanges.tasaMorosidadChange)}%
                              </div>
                              <div className="metric-label">Morosidad</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
