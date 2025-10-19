import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/useAuth';
import { usePermissions } from '@/lib/usePermissions';
import GastosPorCategoriaChart from '@/components/charts/GastosPorCategoriaChart';
import EstadoPagosChart from '@/components/charts/EstadoPagosChart';
import TendenciasEmisionesChart from '@/components/charts/TendenciasEmisionesChart';
import ConsumosMedidores from '@/components/charts/ConsumosMedidores';
import {
  getGraficoEmisiones,
  getGraficoEstadoPagos,
  getGraficoGastosPorCategoria,
  ChartDataPoint,
  EstadoPago,
  GastoPorCategoria,
  TendenciaEmision
} from '@/lib/dashboardService';

export default function DashboardCharts() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { isSuperUser, currentRole } = usePermissions();

  // Obtener comunidadId dinámicamente
  const comunidadId = useMemo(() => {
    const id = user?.memberships?.[0]?.comunidadId ??
               currentRole?.comunidadId ??
               1; // fallback solo si nada
    console.log('DashboardCharts comunidadId:', id, 'user.memberships:', user?.memberships, 'currentRole:', currentRole); // debug
    return id;
  }, [user?.memberships, currentRole?.comunidadId]);

  const [loading, setLoading] = useState(true);
  const [emisionesData, setEmisionesData] = useState<TendenciaEmision[]>([]);
  const [pagosData, setPagosData] = useState<EstadoPago[]>([]);
  const [gastosData, setGastosData] = useState<GastoPorCategoria[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No cargar hasta que el auth esté resuelto y el usuario sea realmente autenticado
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      setError('No autenticado');
      return;
    }

    const loadChartData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar datos de gráficos en paralelo
        const [emisiones, pagos, gastos] = await Promise.all([
          getGraficoEmisiones(comunidadId),
          getGraficoEstadoPagos(comunidadId),
          getGraficoGastosPorCategoria(comunidadId)
        ]);

        setEmisionesData(emisiones);
        setPagosData(pagos);
        setGastosData(gastos);
      } catch (err: any) {
        console.error('Error loading chart data:', err);
        setError(err.message || 'Error al cargar datos de gráficos');
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [comunidadId, authLoading, isAuthenticated]);

  // Datos mockeados para medidores (por ahora, hasta que tengamos el endpoint)
  const medidoresData = [
    {
      medidor: 'Agua - Torre A',
      consumo: 2850,
      periodo: 'Sep 2025',
      unidad: 'L',
    },
    {
      medidor: 'Agua - Torre B',
      consumo: 3200,
      periodo: 'Sep 2025',
      unidad: 'L',
    },
    {
      medidor: 'Electricidad - Común',
      consumo: 1250,
      periodo: 'Sep 2025',
      unidad: 'kWh',
    },
    { medidor: 'Gas - Caldera', consumo: 180, periodo: 'Sep 2025', unidad: 'm³' },
    { medidor: 'Agua - Piscina', consumo: 950, periodo: 'Sep 2025', unidad: 'L' },
  ];

  return (
    <div className='row mb-4'>
      {/* Gráfico de tendencias de emisiones */}
      <div className='col-lg-8 mb-4'>
        <div className='chart-wrapper'>
          <div className='chart-header'>
            <h3 className='chart-title'>
              <i className='material-icons'>trending_up</i>
              Tendencia de Emisiones
            </h3>
            <div className='d-flex'>
              <span className='badge bg-primary me-2'>Últimos 6 meses</span>
              <span className='badge bg-success'>$5.3M este mes</span>
            </div>
          </div>
          <div className='chart-container'>
            <TendenciasEmisionesChart
              data={emisionesData}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Gráfico de estado de pagos */}
      <div className='col-lg-4 mb-4'>
        <div className='chart-wrapper'>
          <div className='chart-header'>
            <h3 className='chart-title'>
              <i className='material-icons'>pie_chart</i>
              Estado de Pagos
            </h3>
            <span className='badge bg-info'>60 unidades</span>
          </div>
          <div className='chart-container'>
            <EstadoPagosChart data={pagosData} loading={loading} />
          </div>
        </div>
      </div>

      {/* Gráfico de gastos por categoría */}
      <div className='col-lg-8 mb-4'>
        <div className='chart-wrapper'>
          <div className='chart-header'>
            <h3 className='chart-title'>
              <i className='material-icons'>bar_chart</i>
              Gastos por Categoría
            </h3>
            <div className='d-flex'>
              <span className='badge bg-warning text-dark me-2'>
                Septiembre 2025
              </span>
              <span className='badge bg-danger'>$7.3M total</span>
            </div>
          </div>
          <div className='chart-container'>
            <GastosPorCategoriaChart data={gastosData} loading={loading} />
          </div>
        </div>
      </div>

      {/* Métricas de consumo de medidores */}
      <div className='col-lg-4 mb-4'>
        <div className='chart-wrapper'>
          <div className='chart-header'>
            <h3 className='chart-title'>
              <i className='material-icons'>water_drop</i>
              Consumos Recientes
            </h3>
            <span className='badge bg-secondary'>5 medidores</span>
          </div>
          <div className='chart-container' style={{ minHeight: '300px' }}>
            <ConsumosMedidores data={medidoresData} loading={loading} />
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className='col-12'>
        <div className='row g-3'>
          <div className='col-md-3'>
            <div className='card bg-primary-light border-0'>
              <div className='card-body text-center'>
                <div className='d-flex align-items-center justify-content-center mb-2'>
                  <i className='material-icons text-primary me-2'>
                    trending_up
                  </i>
                  <span className='fw-bold text-primary'>Emisiones</span>
                </div>
                <h4 className='mb-0 text-primary'>+4.2%</h4>
                <small className='text-muted'>vs mes anterior</small>
              </div>
            </div>
          </div>

          <div className='col-md-3'>
            <div className='card bg-success-light border-0'>
              <div className='card-body text-center'>
                <div className='d-flex align-items-center justify-content-center mb-2'>
                  <i className='material-icons text-success me-2'>payment</i>
                  <span className='fw-bold text-success'>Cobranza</span>
                </div>
                <h4 className='mb-0 text-success'>95%</h4>
                <small className='text-muted'>efectividad</small>
              </div>
            </div>
          </div>

          <div className='col-md-3'>
            <div className='card bg-warning-light border-0'>
              <div className='card-body text-center'>
                <div className='d-flex align-items-center justify-content-center mb-2'>
                  <i className='material-icons text-warning me-2'>savings</i>
                  <span className='fw-bold text-warning'>Ahorro</span>
                </div>
                <h4 className='mb-0 text-warning'>$2.1M</h4>
                <small className='text-muted'>este mes</small>
              </div>
            </div>
          </div>

          <div className='col-md-3'>
            <div className='card bg-info-light border-0'>
              <div className='card-body text-center'>
                <div className='d-flex align-items-center justify-content-center mb-2'>
                  <i className='material-icons text-info me-2'>speed</i>
                  <span className='fw-bold text-info'>Consumo</span>
                </div>
                <h4 className='mb-0 text-info'>-8%</h4>
                <small className='text-muted'>vs promedio</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
