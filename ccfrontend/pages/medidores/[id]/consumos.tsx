import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Row,
  Col,
  Badge,
  Form,
  Dropdown,
  ButtonGroup,
  Alert,
  Modal,
  Table,
} from 'react-bootstrap';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

interface ConsumptionData {
  period: string;
  consumption: number;
  cost: number;
  previous: number;
  variation: number;
  average: number;
  peak: number;
  offPeak?: number;
  temperature?: number;
  pressure?: number;
}

interface Alert {
  id: number;
  type: 'high' | 'low' | 'anomaly' | 'leak' | 'pressure';
  title: string;
  description: string;
  timestamp: Date;
  severity: 'high' | 'medium' | 'low';
  resolved: boolean;
}

interface Meter {
  id: number;
  type: 'electric' | 'water' | 'gas';
  code: string;
  serialNumber: string;
  brand: string;
  model: string;
  unitNumber: string;
  building: string;
  community: string;
  status: string;
  lastReading: number;
  installationDate: string;
}

export default function ConsumosMedidor() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [meter, setMeter] = useState<Meter | null>(null);
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [selectedView, setSelectedView] = useState('chart');
  const [showAnomalyDetails, setShowAnomalyDetails] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Simular carga de datos del medidor
      const meterData: Meter = {
        id: parseInt(id as string),
        type: 'electric',
        code: 'MED-ELC-001',
        serialNumber: 'SE2024001',
        brand: 'Schneider Electric',
        model: 'iEM3155',
        unitNumber: 'Apto 1205',
        building: 'Torre A',
        community: 'Condominio Las Condes',
        status: 'active',
        lastReading: 2847.5,
        installationDate: '2023-01-15',
      };

      // Simular datos de consumo con contexto chileno
      const mockConsumptionData: ConsumptionData[] = generateConsumptionData(
        meterData.type,
        selectedPeriod,
      );

      // Simular alertas
      const mockAlerts: Alert[] = [
        {
          id: 1,
          type: 'high',
          title: 'Consumo Elevado Detectado',
          description:
            'El consumo del último período superó en 25% el promedio histórico',
          timestamp: new Date('2024-01-10T14:30:00'),
          severity: 'high',
          resolved: false,
        },
        {
          id: 2,
          type: 'anomaly',
          title: 'Patrón de Consumo Anómalo',
          description:
            'Detectado consumo fuera de horario habitual durante 3 días consecutivos',
          timestamp: new Date('2024-01-08T02:15:00'),
          severity: 'medium',
          resolved: false,
        },
        {
          id: 3,
          type: 'low',
          title: 'Consumo Bajo',
          description: 'No se ha registrado consumo en las últimas 6 horas',
          timestamp: new Date('2024-01-07T18:45:00'),
          severity: 'low',
          resolved: true,
        },
      ];

      setMeter(meterData);
      setConsumptionData(mockConsumptionData);
      setAlerts(mockAlerts);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading consumption data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateConsumptionData = (
    meterType: string,
    period: string,
  ): ConsumptionData[] => {
    const data: ConsumptionData[] = [];
    const currentDate = new Date();

    // Generar datos según el tipo de medidor y período
    if (period === 'year') {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1,
        );
        const baseConsumption =
          meterType === 'electric' ? 850 : meterType === 'water' ? 15 : 45;

        // Variación estacional para Chile
        const seasonalFactor = getSummerSeasonalFactor(date.getMonth());
        const consumption = Math.round(
          baseConsumption * seasonalFactor + (Math.random() - 0.5) * 100,
        );
        const previous =
          i === 11
            ? consumption
            : data[data.length - 1]?.consumption || consumption;

        const consumptionEntry: ConsumptionData = {
          period: date.toLocaleDateString('es-CL', {
            month: 'short',
            year: 'numeric',
          }),
          consumption,
          cost:
            consumption *
            (meterType === 'electric'
              ? 156.8
              : meterType === 'water'
                ? 890.5
                : 620.3), // Precios chilenos aproximados
          previous,
          variation: Math.round(((consumption - previous) / previous) * 100),
          average: Math.round(baseConsumption * seasonalFactor),
          peak: Math.round(consumption * 1.3),
          ...(meterType === 'electric' && {
            offPeak: Math.round(consumption * 0.4),
          }),
          ...(meterType === 'water' && {
            temperature: Math.round(12 + Math.random() * 8),
          }),
          ...(meterType === 'water' && {
            pressure: Math.round(2.8 + Math.random() * 0.8),
          }),
        };
        data.push(consumptionEntry);
      }
    } else if (period === 'month') {
      const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      ).getDate();
      for (let i = daysInMonth - 1; i >= 0; i--) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - i,
        );
        const baseDaily =
          meterType === 'electric' ? 28 : meterType === 'water' ? 0.5 : 1.5;
        const consumption = Math.round(baseDaily + (Math.random() - 0.5) * 10);

        const consumptionEntry: ConsumptionData = {
          period: date.toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'short',
          }),
          consumption,
          cost:
            consumption *
            (meterType === 'electric'
              ? 156.8
              : meterType === 'water'
                ? 890.5
                : 620.3),
          previous:
            i === daysInMonth - 1
              ? consumption
              : data[data.length - 1]?.consumption || consumption,
          variation: Math.round((Math.random() - 0.5) * 50),
          average: Math.round(baseDaily),
          peak: Math.round(consumption * 1.4),
          ...(meterType === 'electric' && {
            offPeak: Math.round(consumption * 0.3),
          }),
        };
        data.push(consumptionEntry);
      }
    } else if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
        const baseDaily =
          meterType === 'electric' ? 28 : meterType === 'water' ? 0.5 : 1.5;
        const consumption = Math.round(baseDaily + (Math.random() - 0.5) * 5);

        const consumptionEntry: ConsumptionData = {
          period: date.toLocaleDateString('es-CL', {
            weekday: 'short',
            day: 'numeric',
          }),
          consumption,
          cost:
            consumption *
            (meterType === 'electric'
              ? 156.8
              : meterType === 'water'
                ? 890.5
                : 620.3),
          previous:
            i === 6
              ? consumption
              : data[data.length - 1]?.consumption || consumption,
          variation: Math.round((Math.random() - 0.5) * 30),
          average: Math.round(baseDaily),
          peak: Math.round(consumption * 1.2),
        };
        data.push(consumptionEntry);
      }
    }

    return data;
  };

  const getSummerSeasonalFactor = (month: number): number => {
    // Factores estacionales para Chile (verano = dic, ene, feb)
    const factors = [
      1.3, 1.4, 1.3, 1.1, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2,
    ];
    return factors[month] ?? 1.0; // Valor por defecto si el mes está fuera del rango
  };

  const getConsumptionTrend = (): 'up' | 'down' | 'stable' => {
    if (consumptionData.length < 2) {
      return 'stable';
    }

    const recent = consumptionData.slice(-3).map(d => d.consumption);
    const previous = consumptionData.slice(-6, -3).map(d => d.consumption);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;

    const change = ((recentAvg - previousAvg) / previousAvg) * 100;

    if (change > 5) {
      return 'up';
    }
    if (change < -5) {
      return 'down';
    }
    return 'stable';
  };

  const getTotalConsumption = () => {
    return consumptionData.reduce((total, data) => total + data.consumption, 0);
  };

  const getTotalCost = () => {
    return consumptionData.reduce((total, data) => total + data.cost, 0);
  };

  const getAverageConsumption = () => {
    return consumptionData.length > 0
      ? getTotalConsumption() / consumptionData.length
      : 0;
  };

  const getUnit = () => {
    if (!meter) {
      return '';
    }
    return meter.type === 'electric'
      ? 'kWh'
      : meter.type === 'water'
        ? 'm³'
        : 'm³';
  };

  const getCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Configuración de gráficos
  const lineChartData = {
    labels: consumptionData.map(d => d.period),
    datasets: [
      {
        label: `Consumo (${getUnit()})`,
        data: consumptionData.map(d => d.consumption),
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Promedio',
        data: consumptionData.map(d => d.average),
        borderColor: '#95a5a6',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  const barChartData = {
    labels: consumptionData.slice(-12).map(d => d.period),
    datasets: [
      {
        label: `Consumo (${getUnit()})`,
        data: consumptionData.slice(-12).map(d => d.consumption),
        backgroundColor: consumptionData
          .slice(-12)
          .map(d =>
            d.variation > 15
              ? '#e74c3c'
              : d.variation < -15
                ? '#27ae60'
                : '#3498db',
          ),
        borderColor: '#2c3e50',
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: ['Consumo Punta', 'Consumo Valle', 'Otros'],
    datasets: [
      {
        data: meter?.type === 'electric' ? [40, 35, 25] : [60, 25, 15],
        backgroundColor: ['#e74c3c', '#f39c12', '#3498db'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } },
    },
  };

  const exportData = (format: string) => {
    // Simular exportación de datos
    const data = {
      meter,
      period: selectedPeriod,
      consumption: consumptionData,
      totalConsumption: getTotalConsumption(),
      totalCost: getTotalCost(),
      averageConsumption: getAverageConsumption(),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consumo-medidor-${meter?.code}-${selectedPeriod}.${format}`;
    a.click();
    URL.revokeObjectURL(url);

    setShowExportModal(false);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ height: '50vh' }}
          >
            <div className='text-center'>
              <div className='spinner-border text-primary mb-3' />
              <div>Cargando datos de consumo...</div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!meter) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className='text-center py-5'>
            <h3>Medidor no encontrado</h3>
            <Button variant='primary' onClick={() => router.push('/medidores')}>
              Volver a Medidores
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Consumos - {meter.code} — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='medidores-container'>
          <div className='container-fluid px-4'>
            {/* Header */}
            <div className='page-header'>
              <div className='container-fluid'>
                <Row className='align-items-center'>
                  <Col>
                    <h1 className='page-title'>
                      <span
                        className='material-icons me-3'
                        style={{ fontSize: '2.5rem' }}
                      >
                        analytics
                      </span>
                      Análisis de Consumos
                    </h1>
                    <p className='page-subtitle'>
                      {meter.code} - {meter.unitNumber}, {meter.building}
                    </p>
                  </Col>
                  <Col xs='auto'>
                    <div className='d-flex gap-2'>
                      <Button
                        variant='outline-light'
                        onClick={() => setShowExportModal(true)}
                      >
                        <span className='material-icons me-2'>download</span>
                        Exportar
                      </Button>
                      <Button
                        variant='outline-light'
                        onClick={() => router.back()}
                      >
                        <span className='material-icons me-2'>arrow_back</span>
                        Volver
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            {/* Filtros y controles */}
            <Row className='mb-4'>
              <Col md={6}>
                <div className='d-flex gap-2'>
                  <ButtonGroup>
                    {[
                      { key: 'week', label: 'Semana' },
                      { key: 'month', label: 'Mes' },
                      { key: 'year', label: 'Año' },
                    ].map(period => (
                      <Button
                        key={period.key}
                        variant={
                          selectedPeriod === period.key
                            ? 'primary'
                            : 'outline-primary'
                        }
                        size='sm'
                        onClick={() => setSelectedPeriod(period.key)}
                      >
                        {period.label}
                      </Button>
                    ))}
                  </ButtonGroup>
                </div>
              </Col>
              <Col md={6}>
                <div className='d-flex justify-content-end gap-2'>
                  <ButtonGroup>
                    {[
                      { key: 'chart', label: 'Gráficos', icon: 'show_chart' },
                      { key: 'table', label: 'Tabla', icon: 'table_view' },
                    ].map(view => (
                      <Button
                        key={view.key}
                        variant={
                          selectedView === view.key
                            ? 'primary'
                            : 'outline-primary'
                        }
                        size='sm'
                        onClick={() => setSelectedView(view.key)}
                      >
                        <span
                          className='material-icons me-1'
                          style={{ fontSize: '16px' }}
                        >
                          {view.icon}
                        </span>
                        {view.label}
                      </Button>
                    ))}
                  </ButtonGroup>
                </div>
              </Col>
            </Row>

            {/* Estadísticas principales */}
            <Row className='g-4 mb-4'>
              <Col md={3}>
                <div className='stats-card primary'>
                  <div className='stats-card-content'>
                    <div className='stats-card-value'>
                      {Math.round(getTotalConsumption()).toLocaleString(
                        'es-CL',
                      )}
                      <span className='stats-card-unit'>{getUnit()}</span>
                    </div>
                    <div className='stats-card-label'>Consumo Total</div>
                    <div className='stats-card-period'>
                      {selectedPeriod === 'year'
                        ? 'Último año'
                        : selectedPeriod === 'month'
                          ? 'Último mes'
                          : 'Última semana'}
                    </div>
                  </div>
                  <div className='stats-card-icon'>
                    <span className='material-icons'>show_chart</span>
                  </div>
                </div>
              </Col>
              <Col md={3}>
                <div className='stats-card success'>
                  <div className='stats-card-content'>
                    <div className='stats-card-value'>
                      {getCurrency(getTotalCost())}
                    </div>
                    <div className='stats-card-label'>Costo Total</div>
                    <div className='stats-card-period'>En pesos chilenos</div>
                  </div>
                  <div className='stats-card-icon'>
                    <span className='material-icons'>payments</span>
                  </div>
                </div>
              </Col>
              <Col md={3}>
                <div className='stats-card info'>
                  <div className='stats-card-content'>
                    <div className='stats-card-value'>
                      {Math.round(getAverageConsumption()).toLocaleString(
                        'es-CL',
                      )}
                      <span className='stats-card-unit'>{getUnit()}</span>
                    </div>
                    <div className='stats-card-label'>Promedio</div>
                    <div className='stats-card-period'>Por período</div>
                  </div>
                  <div className='stats-card-icon'>
                    <span className='material-icons'>timeline</span>
                  </div>
                </div>
              </Col>
              <Col md={3}>
                <div
                  className={`stats-card ${getConsumptionTrend() === 'up' ? 'warning' : getConsumptionTrend() === 'down' ? 'success' : 'info'}`}
                >
                  <div className='stats-card-content'>
                    <div className='stats-card-value'>
                      <span className='material-icons me-2'>
                        {getConsumptionTrend() === 'up'
                          ? 'trending_up'
                          : getConsumptionTrend() === 'down'
                            ? 'trending_down'
                            : 'trending_flat'}
                      </span>
                      {getConsumptionTrend() === 'up'
                        ? 'Alza'
                        : getConsumptionTrend() === 'down'
                          ? 'Baja'
                          : 'Estable'}
                    </div>
                    <div className='stats-card-label'>Tendencia</div>
                    <div className='stats-card-period'>Últimos períodos</div>
                  </div>
                  <div className='stats-card-icon'>
                    <span className='material-icons'>
                      {getConsumptionTrend() === 'up'
                        ? 'trending_up'
                        : getConsumptionTrend() === 'down'
                          ? 'trending_down'
                          : 'trending_flat'}
                    </span>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Alertas activas */}
            {alerts.filter(alert => !alert.resolved).length > 0 && (
              <Row className='mb-4'>
                <Col>
                  <Alert
                    variant='warning'
                    className='d-flex align-items-center'
                  >
                    <span className='material-icons me-2'>warning</span>
                    <div className='flex-grow-1'>
                      <strong>Alertas Activas:</strong>{' '}
                      {alerts.filter(alert => !alert.resolved).length} alertas
                      requieren atención
                    </div>
                    <Button
                      variant='outline-warning'
                      size='sm'
                      onClick={() => setShowAnomalyDetails(true)}
                    >
                      Ver Detalles
                    </Button>
                  </Alert>
                </Col>
              </Row>
            )}

            {/* Contenido principal */}
            {selectedView === 'chart' ? (
              <Row className='g-4'>
                {/* Gráfico principal */}
                <Col lg={8}>
                  <Card className='chart-card'>
                    <Card.Header className='d-flex justify-content-between align-items-center'>
                      <h5>
                        <span className='material-icons me-2'>show_chart</span>
                        Evolución del Consumo
                      </h5>
                      <div className='chart-controls'>
                        <ButtonGroup size='sm'>
                          <Button variant='outline-primary' active>
                            Línea
                          </Button>
                          <Button variant='outline-primary'>Barras</Button>
                        </ButtonGroup>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <div style={{ height: '400px', position: 'relative' }}>
                        <Line data={lineChartData} options={chartOptions} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Distribución de consumo */}
                <Col lg={4}>
                  <Card className='chart-card'>
                    <Card.Header>
                      <h5>
                        <span className='material-icons me-2'>pie_chart</span>
                        Distribución de Consumo
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div style={{ height: '300px', position: 'relative' }}>
                        <Doughnut
                          data={doughnutData}
                          options={{
                            ...chartOptions,
                            plugins: {
                              ...chartOptions.plugins,
                              legend: { position: 'bottom' },
                            },
                          }}
                        />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Comparativo mensual */}
                <Col lg={12}>
                  <Card className='chart-card'>
                    <Card.Header>
                      <h5>
                        <span className='material-icons me-2'>bar_chart</span>
                        Comparativo por Período
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div style={{ height: '300px', position: 'relative' }}>
                        <Bar data={barChartData} options={chartOptions} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            ) : (
              /* Vista de tabla */
              <Row>
                <Col>
                  <Card className='table-card'>
                    <Card.Header>
                      <h5>
                        <span className='material-icons me-2'>table_view</span>
                        Detalle de Consumos
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <Table responsive hover>
                        <thead>
                          <tr>
                            <th>Período</th>
                            <th>Consumo ({getUnit()})</th>
                            <th>Costo (CLP)</th>
                            <th>Variación</th>
                            <th>vs Promedio</th>
                            {meter.type === 'electric' && <th>Punta/Valle</th>}
                            {meter.type === 'water' && <th>Temperatura</th>}
                            {meter.type === 'water' && <th>Presión</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {consumptionData.map((data, index) => (
                            <tr key={index}>
                              <td>{data.period}</td>
                              <td className='text-end'>
                                <strong>
                                  {data.consumption.toLocaleString('es-CL')}
                                </strong>
                              </td>
                              <td className='text-end'>
                                {getCurrency(data.cost)}
                              </td>
                              <td className='text-center'>
                                <Badge
                                  bg={
                                    data.variation > 15
                                      ? 'danger'
                                      : data.variation < -15
                                        ? 'success'
                                        : 'secondary'
                                  }
                                >
                                  {data.variation > 0 ? '+' : ''}
                                  {data.variation}%
                                </Badge>
                              </td>
                              <td className='text-center'>
                                <Badge
                                  bg={
                                    data.consumption > data.average * 1.1
                                      ? 'warning'
                                      : 'success'
                                  }
                                >
                                  {data.consumption > data.average
                                    ? 'Superior'
                                    : 'Normal'}
                                </Badge>
                              </td>
                              {meter.type === 'electric' && (
                                <td className='text-end'>
                                  <small>
                                    P: {data.peak} / V: {data.offPeak ?? '-'}
                                  </small>
                                </td>
                              )}
                              {meter.type === 'water' && (
                                <td className='text-end'>
                                  {data.temperature ?? '-'}°C
                                </td>
                              )}
                              {meter.type === 'water' && (
                                <td className='text-end'>
                                  {data.pressure ?? '-'} bar
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </div>

          {/* Modal de detalles de alertas */}
          <Modal
            show={showAnomalyDetails}
            onHide={() => setShowAnomalyDetails(false)}
            size='lg'
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <span className='material-icons me-2'>warning</span>
                Alertas y Anomalías
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`alert alert-${alert.severity === 'high' ? 'danger' : alert.severity === 'medium' ? 'warning' : 'info'} d-flex align-items-start`}
                >
                  <span className='material-icons me-3'>
                    {alert.type === 'high'
                      ? 'trending_up'
                      : alert.type === 'low'
                        ? 'trending_down'
                        : alert.type === 'anomaly'
                          ? 'report_problem'
                          : alert.type === 'leak'
                            ? 'water_drop'
                            : 'compress'}
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='alert-heading mb-1'>
                      {alert.title}
                      {alert.resolved && (
                        <Badge bg='success' className='ms-2'>
                          Resuelto
                        </Badge>
                      )}
                    </h6>
                    <p className='mb-1'>{alert.description}</p>
                    <small className='text-muted'>
                      {alert.timestamp.toLocaleString('es-CL')}
                    </small>
                  </div>
                </div>
              ))}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant='outline-secondary'
                onClick={() => setShowAnomalyDetails(false)}
              >
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal de exportación */}
          <Modal
            show={showExportModal}
            onHide={() => setShowExportModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <span className='material-icons me-2'>download</span>
                Exportar Datos de Consumo
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Selecciona el formato para exportar los datos:</p>
              <div className='d-grid gap-2'>
                <Button
                  variant='outline-primary'
                  onClick={() => exportData('json')}
                >
                  <span className='material-icons me-2'>code</span>
                  JSON - Datos completos
                </Button>
                <Button
                  variant='outline-success'
                  onClick={() => exportData('csv')}
                >
                  <span className='material-icons me-2'>table_view</span>
                  CSV - Para Excel
                </Button>
                <Button
                  variant='outline-info'
                  onClick={() => exportData('pdf')}
                >
                  <span className='material-icons me-2'>picture_as_pdf</span>
                  PDF - Reporte visual
                </Button>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
