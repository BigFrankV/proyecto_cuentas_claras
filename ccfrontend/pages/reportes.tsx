import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import moment from 'moment';
import apiClient from '@/lib/api';
import exportService from '@/lib/exportService';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Interfaces para tipos de datos
interface ReportData {
  month: string;
  ingresos: number;
  gastos: number;
  saldo: number;
  morosidad: number;
}

interface GastoData {
  id: number;
  categoria_id: number;
  fecha: string;
  monto: number;
  glosa: string;
}

interface PagoData {
  id: number;
  unidad_id: number;
  emision_id: number;
  fecha: string;
  monto: number;
  estado: string;
}

export default function ReportesDashboard() {
  const [activeTab, setActiveTab] = useState<string>('financiero');
  const [dateRange, setDateRange] = useState({
    start: moment().subtract(3, 'month').format('YYYY-MM-DD'),
    end: moment().format('YYYY-MM-DD')
  });
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para datos
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [gastos, setGastos] = useState<GastoData[]>([]);
  const [pagos, setPagos] = useState<PagoData[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadCommunities();
  }, []);

  useEffect(() => {
    if (selectedCommunity) {
      loadReportData();
    }
  }, [selectedCommunity, dateRange]);

  const loadCommunities = async () => {
    try {
      const response = await apiClient.get('/comunidades');
      setCommunities(response.data);
      if (response.data.length > 0 && !selectedCommunity) {
        setSelectedCommunity(response.data[0].id);
      }
    } catch (error) {
      console.error('Error loading communities:', error);
    }
  };

  const loadReportData = async () => {
    if (!selectedCommunity) return;
    
    setIsLoading(true);
    try {
      // Cargar gastos
      const gastosResponse = await apiClient.get(`/gastos/comunidad/${selectedCommunity}`);
      setGastos(gastosResponse.data);

      // Cargar pagos
      const pagosResponse = await apiClient.get(`/pagos/comunidad/${selectedCommunity}`);
      setPagos(pagosResponse.data);

      // Procesar datos para reportes
      processReportData(gastosResponse.data, pagosResponse.data);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processReportData = (gastosData: GastoData[], pagosData: PagoData[]) => {
    // Agrupar por mes
    const monthlyData: { [key: string]: Omit<ReportData, 'month'> } = {};
    
    // Procesar gastos
    gastosData.forEach(gasto => {
      const month = moment(gasto.fecha).format('YYYY-MM');
      if (!monthlyData[month]) {
        monthlyData[month] = { ingresos: 0, gastos: 0, saldo: 0, morosidad: 0 };
      }
      monthlyData[month].gastos += gasto.monto;
    });

    // Procesar pagos
    pagosData.forEach(pago => {
      const month = moment(pago.fecha).format('YYYY-MM');
      if (!monthlyData[month]) {
        monthlyData[month] = { ingresos: 0, gastos: 0, saldo: 0, morosidad: 0 };
      }
      monthlyData[month].ingresos += pago.monto;
    });

    // Calcular saldo y convertir a array
    const processedData: ReportData[] = Object.keys(monthlyData)
      .sort()
      .map(month => {
        const data = monthlyData[month];
        if (!data) {
          return {
            month,
            ingresos: 0,
            gastos: 0,
            saldo: 0,
            morosidad: 0
          };
        }
        return {
          month,
          ingresos: data.ingresos,
          gastos: data.gastos,
          saldo: data.ingresos - data.gastos,
          morosidad: data.morosidad
        };
      });

    setReportData(processedData);
  };

  // Funciones de exportación
  const handleExportFinancial = () => {
    const communityName = communities.find(c => c.id === selectedCommunity)?.nombre || 'comunidad';
    const result = exportService.exportFinancialReport(reportData, communityName);
    
    setExportMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setExportMessage(null), 3000);
  };

  const handleExportGastos = () => {
    const communityName = communities.find(c => c.id === selectedCommunity)?.nombre || 'comunidad';
    const result = exportService.exportGastosReport(gastos, communityName);
    
    setExportMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
    
    setTimeout(() => setExportMessage(null), 3000);
  };

  const handleExportAll = async () => {
    try {
      const communityName = communities.find(c => c.id === selectedCommunity)?.nombre || 'comunidad';
      
      // Exportar reporte financiero
      exportService.exportFinancialReport(reportData, communityName);
      
      // Esperar un poco y exportar gastos
      setTimeout(() => {
        exportService.exportGastosReport(gastos, communityName);
      }, 500);
      
      setExportMessage({
        type: 'success',
        text: 'Reportes exportados exitosamente'
      });
    } catch (error) {
      setExportMessage({
        type: 'error',
        text: 'Error al exportar reportes'
      });
    }
    
    setTimeout(() => setExportMessage(null), 3000);
  };

  // Configuraciones de gráficos
  const financialTrendData = {
    labels: reportData.map(d => moment(d.month).format('MMM YYYY')),
    datasets: [
      {
        label: 'Ingresos',
        data: reportData.map(d => d.ingresos),
        borderColor: '#198754',
        backgroundColor: 'rgba(25,135,84,0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Gastos',
        data: reportData.map(d => d.gastos),
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220,53,69,0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP'
            }).format(value);
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + 
              new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP'
              }).format(context.parsed.y);
          }
        }
      }
    }
  };

  const renderFinancialReport = () => (
    <div id="reporteFinanciero" className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Resumen Financiero</h2>
        <div className="text-muted">
          <span className="material-icons align-middle me-1">update</span>
          Última actualización: {moment().format('DD/MM/YYYY')}
        </div>
      </div>
      
      {/* KPIs */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card app-card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <span className="material-icons text-success" style={{fontSize: '2rem'}}>trending_up</span>
                </div>
                <div>
                  <h6 className="card-subtitle mb-0 text-muted">Ingresos del Mes</h6>
                  <h4 className="mb-0 text-success">
                    {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP'
                    }).format(reportData[reportData.length - 1]?.ingresos || 0)}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-xl-3">
          <div className="card app-card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <span className="material-icons text-danger" style={{fontSize: '2rem'}}>trending_down</span>
                </div>
                <div>
                  <h6 className="card-subtitle mb-0 text-muted">Gastos del Mes</h6>
                  <h4 className="mb-0 text-danger">
                    {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP'
                    }).format(reportData[reportData.length - 1]?.gastos || 0)}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-xl-3">
          <div className="card app-card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <span className="material-icons text-primary" style={{fontSize: '2rem'}}>account_balance</span>
                </div>
                <div>
                  <h6 className="card-subtitle mb-0 text-muted">Saldo Actual</h6>
                  <h4 className="mb-0 text-primary">
                    {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP'
                    }).format(reportData[reportData.length - 1]?.saldo || 0)}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-xl-3">
          <div className="card app-card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <span className="material-icons text-warning" style={{fontSize: '2rem'}}>warning</span>
                </div>
                <div>
                  <h6 className="card-subtitle mb-0 text-muted">Morosidad</h6>
                  <h4 className="mb-0 text-warning">8.5%</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gráfico principal */}
      <div className="card app-card shadow-sm mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Tendencia Financiera</h5>
          <div className="btn-group" role="group">
            <button type="button" className="btn btn-sm btn-outline-primary active">3M</button>
            <button type="button" className="btn btn-sm btn-outline-primary">6M</button>
            <button type="button" className="btn btn-sm btn-outline-primary">1A</button>
          </div>
        </div>
        <div className="card-body">
          <div style={{ position: 'relative', height: '350px' }}>
            <Line data={financialTrendData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderMorosidadReport = () => (
    <div id="reporteMorosidad" className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Análisis de Morosidad</h2>
        <div className="text-muted">
          <span className="material-icons align-middle me-1">update</span>
          Última actualización: {moment().format('DD/MM/YYYY')}
        </div>
      </div>
      
      <div className="alert alert-info">
        <span className="material-icons me-2">info</span>
        Funcionalidad de morosidad en desarrollo
      </div>
    </div>
  );

  const renderGastosReport = () => (
    <div id="reporteGastos" className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Análisis de Gastos</h2>
        <div className="text-muted">
          <span className="material-icons align-middle me-1">update</span>
          Última actualización: {moment().format('DD/MM/YYYY')}
        </div>
      </div>
      
      {/* Tabla de gastos */}
      <div className="card app-card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Gastos Recientes</h5>
          <button className="btn btn-sm btn-outline-primary">
            <span className="material-icons align-middle me-1">download</span>
            Exportar
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {gastos.slice(0, 10).map((gasto) => (
                <tr key={gasto.id}>
                  <td>{moment(gasto.fecha).format('DD/MM/YYYY')}</td>
                  <td>
                    <span className="badge bg-primary">
                      Categoría {gasto.categoria_id}
                    </span>
                  </td>
                  <td>{gasto.glosa}</td>
                  <td className="text-end">
                    {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP'
                    }).format(gasto.monto)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <Head>
        <title>Reportes — Cuentas Claras</title>
        <link rel="stylesheet" href="/styles/reportes.css" />
      </Head>

      <Layout title='Reportes y Analítica'>
        <div className='container-fluid fade-in'>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">Reportes y Analítica</h1>
              <p className="text-muted mb-0">Monitoreo detallado y análisis de datos</p>
            </div>
            
            {/* Filtros */}
            <div className="d-flex">
              <div className="dropdown me-2">
                <button 
                  className="btn btn-outline-secondary dropdown-toggle" 
                  type="button" 
                  id="comunidadDropdown" 
                  data-bs-toggle="dropdown"
                >
                  <span className="material-icons align-middle me-1">domain</span>
                  {communities.find(c => c.id === selectedCommunity)?.nombre || 'Seleccionar Comunidad'}
                </button>
                <ul className="dropdown-menu" aria-labelledby="comunidadDropdown">
                  {communities.map(community => (
                    <li key={community.id}>
                      <button 
                        className="dropdown-item" 
                        onClick={() => setSelectedCommunity(community.id)}
                      >
                        {community.nombre}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="dropdown me-2">
                <button className="btn btn-outline-secondary" type="button">
                  <span className="material-icons align-middle me-1">date_range</span>
                  {moment(dateRange.start).format('DD/MM')} - {moment(dateRange.end).format('DD/MM/YYYY')}
                </button>
              </div>
              
              <button className="btn btn-primary" onClick={() => window.print()}>
                <span className="material-icons align-middle me-1">print</span>
                Imprimir
              </button>
              
              <div className="dropdown ms-2">
                <button 
                  className="btn btn-success dropdown-toggle" 
                  type="button" 
                  id="exportDropdown" 
                  data-bs-toggle="dropdown"
                >
                  <span className="material-icons align-middle me-1">download</span>
                  Exportar CSV
                </button>
                <ul className="dropdown-menu" aria-labelledby="exportDropdown">
                  <li>
                    <button className="dropdown-item" onClick={handleExportFinancial}>
                      📊 Reporte Financiero
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleExportGastos}>
                      💰 Detalle de Gastos
                    </button>
                  </li>
                  <li><hr className="dropdown-divider"/></li>
                  <li>
                    <button className="dropdown-item" onClick={handleExportAll}>
                      📋 Exportar Todo
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Filtros activos */}
          <div className="mb-4">
            <div className="d-flex align-items-center">
              <span className="text-muted me-2">Filtros:</span>
              {selectedCommunity && (
                <div className="filter-badge me-2">
                  {communities.find(c => c.id === selectedCommunity)?.nombre}
                  <span className="material-icons ms-1 cursor-pointer" onClick={() => setSelectedCommunity(null)}>close</span>
                </div>
              )}
              <div className="filter-badge">
                {moment(dateRange.start).format('MMM YYYY')} - {moment(dateRange.end).format('MMM YYYY')}
              </div>
            </div>
          </div>

          {/* Mensaje de exportación */}
          {exportMessage && (
            <div className={`alert ${exportMessage.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-4`}>
              <span className="material-icons align-middle me-2">
                {exportMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              {exportMessage.text}
            </div>
          )}
          
          {/* Tabs */}
          <div className="mb-4">
            <div className="d-flex border-bottom">
              {[
                { key: 'financiero', label: 'Financiero' },
                { key: 'morosidad', label: 'Morosidad' },
                { key: 'gastos', label: 'Gastos' },
                { key: 'operacional', label: 'Operacional' }
              ].map(tab => (
                <div 
                  key={tab.key}
                  className={`tab-report me-4 ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    borderBottom: activeTab === tab.key ? '2px solid var(--color-accent)' : '2px solid transparent',
                    paddingBottom: '0.5rem',
                    fontWeight: 600,
                    color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Contenido de reportes */}
          {isLoading && (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          )}
          
          {!isLoading && activeTab === 'financiero' && renderFinancialReport()}
          {!isLoading && activeTab === 'morosidad' && renderMorosidadReport()}
          {!isLoading && activeTab === 'gastos' && renderGastosReport()}
          {!isLoading && activeTab === 'operacional' && (
            <div className="alert alert-info">
              <span className="material-icons me-2">info</span>
              Reporte operacional en desarrollo
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
