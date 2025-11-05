import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import React from 'react';
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
    labels: data.map(item => item.tipo),
    datasets: [
      {
        label: 'Cantidad',
        data: data.map(item => item.cantidad),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
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
          generateLabels (chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const item = chart.data.datasets[0];
                const cantidad = item.data[i];
                const porcentaje = Math.round(
                  (cantidad /
                    item.data.reduce((a: number, b: number) => a + b, 0)) *
                    100,
                );

                return {
                  text: `${label}: ${cantidad} (${porcentaje}%)`,
                  fillStyle: item.backgroundColor[i],
                  strokeStyle: item.borderColor[i],
                  lineWidth: item.borderWidth,
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
          label (context: any) {
            const item = data.find(d => d.tipo === context.label);
            return `${context.label}: ${context.parsed} (${item?.porcentaje}%)`;
          },
        },
      },
    },
  };

  // Calcular totales para mostrar en el centro
  const totalCantidad = data.reduce((sum, item) => sum + item.cantidad, 0);

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
        <div className='fw-bold fs-4 text-primary'>{totalCantidad}</div>
        <div className='small text-muted'>Total</div>
      </div>
    </div>
  );
}

