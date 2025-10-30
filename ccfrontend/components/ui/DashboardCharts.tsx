import React, { useEffect, useState } from 'react';

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
} from '@/lib/dashboardService';

interface DashboardChartsProps {
  comunidadId: number;
}

export default function DashboardCharts({ comunidadId }: DashboardChartsProps) {
  const [loading, setLoading] = useState(true);
  const [gastosData, setGastosData] = useState<GastoPorCategoria[]>([]);
  const [pagosData, setPagosData] = useState<EstadoPago[]>([]);
  const [emisionesData, setEmisionesData] = useState<TendenciaEmision[]>([]);
  const [medidoresData, setMedidoresData] = useState<ConsumoMedidor[]>([]);

  useEffect(() => {
    if (!comunidadId || comunidadId === 0) {
      return undefined;
    }

    let isMounted = true;

    const loadChartData = async () => {
      try {
        setLoading(true);

        // Cargar datos en paralelo
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
      } catch {
        // Error loading chart data
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
  }, [comunidadId]);

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
    </div>
  );
}
