import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { GastoPorCategoria } from '@/lib/dashboardService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface GastosPorCategoriaChartProps {
  data: GastoPorCategoria[];
  loading?: boolean;
}

export default function GastosPorCategoriaChart({
  data,
  loading,
}: GastosPorCategoriaChartProps) {
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
            bar_chart
          </i>
          <p>No hay datos de gastos disponibles</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.categoria),
    datasets: [
      {
        label: 'Monto ($)',
        data: data.map(item => item.total),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            const value = new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
            }).format(context.parsed.y);
            return `${context.dataset.label}: ${value}`;
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
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 12,
          },
        },
      },
      y: {
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
    },
  };

  return (
    <div className='chart-container' style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
