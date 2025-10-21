import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import GastosPorCategoriaChart from '@/components/charts/GastosPorCategoriaChart';
import EstadoPagosChart from '@/components/charts/EstadoPagosChart';
import TendenciasEmisionesChart from '@/components/charts/TendenciasEmisionesChart';
import ConsumosMedidores from '@/components/charts/ConsumosMedidores';

// Datos de ejemplo para demostración visual
const datosMockGastos = [
  { categoria: 'Mantención', total: 2500000, color: '#FF6384' },
  { categoria: 'Servicios Básicos', total: 1800000, color: '#36A2EB' },
  { categoria: 'Seguridad', total: 1200000, color: '#FFCE56' },
  { categoria: 'Limpieza', total: 800000, color: '#4BC0C0' },
  { categoria: 'Administración', total: 600000, color: '#9966FF' },
  { categoria: 'Jardines', total: 400000, color: '#FF9F40' },
];

const datosMockPagos = [
  { tipo: 'Pagos al Día', cantidad: 45, porcentaje: 75, color: '#28a745' },
  {
    tipo: 'Atrasados 1-30 días',
    cantidad: 12,
    porcentaje: 20,
    color: '#ffc107',
  },
  { tipo: 'Morosos +30 días', cantidad: 3, porcentaje: 5, color: '#dc3545' },
];

const datosMockEmisiones = [
  { fecha: '2025-04', monto: 5200000, cantidad: 58 },
  { fecha: '2025-05', monto: 4800000, cantidad: 58 },
  { fecha: '2025-06', monto: 5100000, cantidad: 58 },
  { fecha: '2025-07', monto: 5400000, cantidad: 58 },
  { fecha: '2025-08', monto: 5600000, cantidad: 58 },
  { fecha: '2025-09', monto: 5300000, cantidad: 56 },
];

const datosMockMedidores = [
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

export default function DashboardCharts() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
              data={datosMockEmisiones}
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
            <EstadoPagosChart data={datosMockPagos} loading={loading} />
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
            <GastosPorCategoriaChart data={datosMockGastos} loading={loading} />
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
            <ConsumosMedidores data={datosMockMedidores} loading={loading} />
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
