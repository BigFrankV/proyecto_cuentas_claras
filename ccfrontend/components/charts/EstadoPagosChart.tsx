import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { EstadoPago } from '@/lib/dashboardService';

ChartJS.register(ArcElement, Tooltip, Legend);

interface EstadoPagosChartProps {
  data: EstadoPago[];
  loading?: boolean;
}

export default function EstadoPagosChart({
  data,
  loading,
}: EstadoPagosChartProps) {
  if (loading) {
    return (
      <div className='d-flex align-items-center justify-content-center h-100'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Cargando...</span>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className='d-flex align-items-center justify-content-center h-100 text-muted'>
        <div className='text-center'>
          <i className='material-icons mb-2' style={{ fontSize: '3rem' }}>
            pie_chart
          </i>
          <p>No hay datos de pagos disponibles</p>
        </div>
      </div>
    );
  }

  const chartData = {
    // Normalizar datos: forzar números y valores por defecto
    labels: data.map(item => item.tipo ?? '—'),
    datasets: [
      {
        label: 'Cantidad',
        data: data.map(item => Number(item.cantidad) || 0),
        backgroundColor: data.map(item => item.color || '#cfcfcf'),
        borderColor: data.map(item => item.color || '#cfcfcf'),
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
          generateLabels: function (chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const ds = data.datasets[0];
              const totals = (ds.data || []).reduce(
                (a: number, b: any) => a + (Number(b) || 0),
                0
              );
              return data.labels.map((label: string, i: number) => {
                const cantidad = Number(ds.data[i]) || 0;
                const porcentaje = totals > 0 ? Math.round((cantidad / totals) * 100) : 0;

                return {
                  text: `${label}: ${cantidad} (${porcentaje}%)`,
                  fillStyle: ds.backgroundColor?.[i],
                  strokeStyle: ds.borderColor?.[i],
                  lineWidth: ds.borderWidth,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            const ds = context.chart.data.datasets[0];
            const cantidad = Number(context.parsed) || 0;
            const totals = (ds.data || []).reduce(
              (a: number, b: any) => a + (Number(b) || 0),
              0
            );
            const porcentaje = totals > 0 ? Math.round((cantidad / totals) * 100) : 0;
            return `${context.label}: ${cantidad} (${porcentaje}%)`;
          },
        },
      },
    },
  };

  // Calcular totales para mostrar en el centro
  const totalCantidad = data.reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0);

  return (
    <div className='position-relative'>
      <div className='chart-container' style={{ height: '300px' }}>
        <Doughnut data={chartData} options={options} />
      </div>

      {/* Centro del gráfico con total */}
      <div
        className='position-absolute top-50 start-50 translate-middle text-center'
        style={{ pointerEvents: 'none' }}
      >
        <div className='fw-bold fs-4 text-primary'>{Number.isFinite(totalCantidad) ? totalCantidad : 0}</div>
        <div className='small text-muted'>Total</div>
      </div>
    </div>
  );
}
