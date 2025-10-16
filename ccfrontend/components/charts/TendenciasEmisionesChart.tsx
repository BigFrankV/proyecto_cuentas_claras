import React from 'react';
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
import { Line } from 'react-chartjs-2';
import { TendenciaEmision } from '@/lib/dashboardService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TendenciasEmisionesChartProps {
  data: TendenciaEmision[];
  loading?: boolean;
}

export default function TendenciasEmisionesChart({
  data,
  loading,
}: TendenciasEmisionesChartProps) {
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
            trending_up
          </i>
          <p>No hay datos de emisiones disponibles</p>
        </div>
      </div>
    );
  }

  // Formatear fechas para mostrar
  const formatearFecha = (fecha: string) => {
    if (!fecha || typeof fecha !== 'string') {
      return 'Fecha desconocida';
    }
    const [year, month] = fecha.split('-');
    const date = new Date(parseInt(year || '2024'), parseInt(month || '1') - 1);
    return date.toLocaleDateString('es-CL', {
      month: 'short',
      year: '2-digit',
    });
  };

  const chartData = {
    labels: data.map(item => formatearFecha(item.fecha)),
    datasets: [
      {
        label: 'Monto Total ($)',
        data: data.map(item => item.monto),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Cantidad de Emisiones',
        data: data.map(item => item.cantidad * 10000), // Escalar para visualización
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
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
            if (context.datasetIndex === 0) {
              const value = new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
              }).format(context.parsed.y);
              return `${context.dataset.label}: ${value}`;
            } else {
              const cantidad = Math.round(context.parsed.y / 10000);
              return `Cantidad de Emisiones: ${cantidad}`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function (value: any) {
            return new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              notation: 'compact',
            }).format(value);
          },
          font: {
            size: 12,
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function (value: any) {
            return Math.round(value / 10000);
          },
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className='chart-container' style={{ height: '350px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
