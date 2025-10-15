import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { EmissionStatusBadge, EmissionTypeBadge } from '@/components/emisiones';

interface EmissionDetail {
  id: string;
  period: string;
  type: 'gastos_comunes' | 'extraordinaria' | 'multa' | 'interes';
  status: 'draft' | 'ready' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  unitCount: number;
  description: string;
  communityName: string;
}

interface UnitDistribution {
  id: string;
  unitNumber: string;
  unitType: string;
  owner: string;
  participation: number;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid';
  details: ConceptDistribution[];
}

interface ConceptDistribution {
  conceptId: string;
  conceptName: string;
  totalAmount: number;
  unitAmount: number;
  distributionType: 'proportional' | 'equal' | 'custom';
}

interface DistributionChart {
  labels: string[];
  amounts: number[];
  colors: string[];
}

export default function EmisionProrrateo() {
  const router = useRouter();
  const { id } = router.query;

  const [emission, setEmission] = useState<EmissionDetail | null>(null);
  const [units, setUnits] = useState<UnitDistribution[]>([]);
  const [chartData, setChartData] = useState<DistributionChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  useEffect(() => {
    if (id) {
      loadProrrateoData();
    }
  }, [id]);

  const loadProrrateoData = () => {
    // Mock data
    setTimeout(() => {
      const mockEmission: EmissionDetail = {
        id: id as string,
        period: 'Septiembre 2025',
        type: 'gastos_comunes',
        status: 'sent',
        issueDate: '2025-09-01',
        dueDate: '2025-09-15',
        totalAmount: 2500000,
        paidAmount: 1800000,
        unitCount: 45,
        description: 'Gastos comunes del mes de septiembre',
        communityName: 'Edificio Central'
      };

      const mockUnits: UnitDistribution[] = [
        {
          id: '1',
          unitNumber: '101',
          unitType: 'Departamento',
          owner: 'Juan Pérez',
          participation: 2.5,
          totalAmount: 62500,
          paidAmount: 62500,
          status: 'paid',
          details: [
            {
              conceptId: '1',
              conceptName: 'Administración',
              totalAmount: 450000,
              unitAmount: 11250,
              distributionType: 'proportional'
            },
            {
              conceptId: '2',
              conceptName: 'Servicios Básicos',
              totalAmount: 730000,
              unitAmount: 18250,
              distributionType: 'proportional'
            },
            {
              conceptId: '3',
              conceptName: 'Fondo de Reserva',
              totalAmount: 900000,
              unitAmount: 20000,
              distributionType: 'equal'
            }
          ]
        },
        {
          id: '2',
          unitNumber: '102',
          unitType: 'Departamento',
          owner: 'María González',
          participation: 2.2,
          totalAmount: 55000,
          paidAmount: 30000,
          status: 'partial',
          details: [
            {
              conceptId: '1',
              conceptName: 'Administración',
              totalAmount: 450000,
              unitAmount: 9900,
              distributionType: 'proportional'
            },
            {
              conceptId: '2',
              conceptName: 'Servicios Básicos',
              totalAmount: 730000,
              unitAmount: 16060,
              distributionType: 'proportional'
            },
            {
              conceptId: '3',
              conceptName: 'Fondo de Reserva',
              totalAmount: 900000,
              unitAmount: 20000,
              distributionType: 'equal'
            }
          ]
        },
        {
          id: '3',
          unitNumber: '201',
          unitType: 'Departamento',
          owner: 'Carlos Rodríguez',
          participation: 2.8,
          totalAmount: 70000,
          paidAmount: 0,
          status: 'pending',
          details: [
            {
              conceptId: '1',
              conceptName: 'Administración',
              totalAmount: 450000,
              unitAmount: 12600,
              distributionType: 'proportional'
            },
            {
              conceptId: '2',
              conceptName: 'Servicios Básicos',
              totalAmount: 730000,
              unitAmount: 20440,
              distributionType: 'proportional'
            },
            {
              conceptId: '3',
              conceptName: 'Fondo de Reserva',
              totalAmount: 900000,
              unitAmount: 20000,
              distributionType: 'equal'
            }
          ]
        }
      ];

      const mockChartData: DistributionChart = {
        labels: ['Administración', 'Servicios Básicos', 'Fondo de Reserva', 'Mantención', 'Seguros'],
        amounts: [450000, 730000, 900000, 320000, 100000],
        colors: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1']
      };

      setEmission(mockEmission);
      setUnits(mockUnits);
      setChartData(mockChartData);
      setLoading(false);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success';
      case 'partial': return 'bg-warning';
      case 'pending': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'partial': return 'Parcial';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  };

  const getDistributionTypeText = (type: string) => {
    switch (type) {
      case 'proportional': return 'Proporcional';
      case 'equal': return 'Igualitario';
      case 'custom': return 'Personalizado';
      default: return 'Sin definir';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Prorrateo de Emisión'>
          <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '400px' }}>
            <div className='text-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='mt-2 text-muted'>Cargando prorrateo...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!emission) {
    return (
      <ProtectedRoute>
        <Layout title='Emisión no encontrada'>
          <div className='text-center py-5'>
            <h3>Emisión no encontrada</h3>
            <p className='text-muted'>La emisión solicitada no existe o no tienes permisos para verla.</p>
            <Link href='/emisiones' className='btn btn-primary'>
              Volver a Emisiones
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Prorrateo - {emission.period} — Cuentas Claras</title>
      </Head>

      <Layout title='Prorrateo de Emisión'>
        <div className='container-fluid p-4'>
          {/* Header */}
          <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3'>
            <div>
              <h1 className='h2 mb-1'>
                <i className='fa-solid fa-chart-pie me-2'></i>
                Prorrateo - {emission.period}
              </h1>
              <p className='text-muted mb-0'>{emission.description}</p>
            </div>
            <div className='d-flex gap-2'>
              <div className='btn-group'>
                <button className='btn btn-outline-secondary'>
                  <i className='material-icons me-2'>print</i>
                  Imprimir
                </button>
                <button className='btn btn-outline-secondary'>
                  <i className='material-icons me-2'>file_download</i>
                  Exportar
                </button>
              </div>
              <button
                className='btn btn-secondary'
                onClick={() => router.push(`/emisiones/${id}`)}
              >
                <i className='fa-solid fa-arrow-left me-2'></i>
                Volver al Detalle
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className='row mb-4'>
            <div className='col-md-3'>
              <div className='summary-card total'>
                <div className='card-body text-center'>
                  <i className='fa-solid fa-calculator fa-2x mb-2'></i>
                  <h3 className='mb-0'>{formatCurrency(emission.totalAmount)}</h3>
                  <p className='text-muted mb-0'>Total Emisión</p>
                </div>
              </div>
            </div>
            <div className='col-md-3'>
              <div className='summary-card paid'>
                <div className='card-body text-center'>
                  <i className='fa-solid fa-check-circle fa-2x mb-2'></i>
                  <h3 className='mb-0'>{formatCurrency(emission.paidAmount)}</h3>
                  <p className='text-muted mb-0'>Total Pagado</p>
                </div>
              </div>
            </div>
            <div className='col-md-3'>
              <div className='summary-card pending'>
                <div className='card-body text-center'>
                  <i className='fa-solid fa-clock fa-2x mb-2'></i>
                  <h3 className='mb-0'>{formatCurrency(emission.totalAmount - emission.paidAmount)}</h3>
                  <p className='text-muted mb-0'>Pendiente</p>
                </div>
              </div>
            </div>
            <div className='col-md-3'>
              <div className='summary-card units'>
                <div className='card-body text-center'>
                  <i className='fa-solid fa-home fa-2x mb-2'></i>
                  <h3 className='mb-0'>{emission.unitCount}</h3>
                  <p className='text-muted mb-0'>Unidades</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className='row mb-4'>
            <div className='col-lg-8'>
              <div className='chart-card'>
                <div className='card-header'>
                  <h5 className='mb-0'>
                    <i className='fa-solid fa-chart-pie me-2'></i>
                    Distribución por Conceptos
                  </h5>
                </div>
                <div className='card-body'>
                  <div className='chart-placeholder'>
                    <div className='mock-chart'>
                      {chartData && chartData.labels.map((label, index) => (
                        <div key={index} className='chart-segment' style={{
                          width: `${((chartData.amounts[index] ?? 0) / chartData.amounts.reduce((a, b) => a + b, 0)) * 100}%`,
                          backgroundColor: chartData.colors[index] ?? '#ccc'
                        }}>
                          <span className='chart-label'>{label}</span>
                        </div>
                      ))}
                    </div>
                    <div className='chart-legend'>
                      {chartData && chartData.labels.map((label, index) => (
                        <div key={index} className='legend-item'>
                          <span 
                            className='legend-color'
                            style={{ backgroundColor: chartData.colors[index] ?? '#ccc' }}
                          ></span>
                          <span className='legend-text'>{label}</span>
                          <span className='legend-amount'>{formatCurrency(chartData.amounts[index] ?? 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='payment-status-card'>
                <div className='card-header'>
                  <h5 className='mb-0'>
                    <i className='fa-solid fa-chart-bar me-2'></i>
                    Estado de Pagos
                  </h5>
                </div>
                <div className='card-body'>
                  <div className='status-item'>
                    <div className='status-info'>
                      <span className='badge bg-success me-2'>Pagado</span>
                      <span>1 unidad</span>
                    </div>
                    <div className='status-amount text-success'>
                      {formatCurrency(62500)}
                    </div>
                  </div>
                  <div className='status-item'>
                    <div className='status-info'>
                      <span className='badge bg-warning me-2'>Parcial</span>
                      <span>1 unidad</span>
                    </div>
                    <div className='status-amount text-warning'>
                      {formatCurrency(30000)}
                    </div>
                  </div>
                  <div className='status-item'>
                    <div className='status-info'>
                      <span className='badge bg-secondary me-2'>Pendiente</span>
                      <span>1 unidad</span>
                    </div>
                    <div className='status-amount text-secondary'>
                      {formatCurrency(0)}
                    </div>
                  </div>
                  
                  <div className='progress-section mt-3'>
                    <div className='progress-header'>
                      <span>Progreso total</span>
                      <span>{Math.round((emission.paidAmount / emission.totalAmount) * 100)}%</span>
                    </div>
                    <div className='progress'>
                      <div
                        className='progress-bar bg-success'
                        style={{ width: `${(emission.paidAmount / emission.totalAmount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* View Controls */}
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <h5 className='mb-0'>
              <i className='fa-solid fa-table me-2'></i>
              Detalle por Unidades
            </h5>
            <div className='btn-group' role='group'>
              <button
                type='button'
                className={`btn ${viewMode === 'summary' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('summary')}
              >
                <i className='material-icons me-1'>view_list</i>
                Resumen
              </button>
              <button
                type='button'
                className={`btn ${viewMode === 'detailed' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('detailed')}
              >
                <i className='material-icons me-1'>view_module</i>
                Detallado
              </button>
            </div>
          </div>

          {/* Units Table */}
          <div className='distribution-card'>
            <div className='card-body'>
              {viewMode === 'summary' ? (
                <div className='table-responsive'>
                  <table className='table table-hover'>
                    <thead>
                      <tr>
                        <th>Unidad</th>
                        <th>Tipo</th>
                        <th>Propietario</th>
                        <th>Participación</th>
                        <th>Monto Total</th>
                        <th>Monto Pagado</th>
                        <th>Saldo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map((unit) => (
                        <tr key={unit.id}>
                          <td><strong>{unit.unitNumber}</strong></td>
                          <td>{unit.unitType}</td>
                          <td>{unit.owner}</td>
                          <td>{unit.participation}%</td>
                          <td><strong>{formatCurrency(unit.totalAmount)}</strong></td>
                          <td className='text-success'>{formatCurrency(unit.paidAmount)}</td>
                          <td className='text-warning'>
                            {formatCurrency(unit.totalAmount - unit.paidAmount)}
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(unit.status)}`}>
                              {getStatusText(unit.status)}
                            </span>
                          </td>
                          <td>
                            <button
                              className='btn btn-sm btn-outline-primary'
                              onClick={() => setSelectedUnit(selectedUnit === unit.id ? null : unit.id)}
                            >
                              {selectedUnit === unit.id ? 'Ocultar' : 'Ver'} Detalle
                            </button>
                          </td>
                        </tr>
                      ))}
                      {units.map((unit) => (
                        selectedUnit === unit.id && (
                          <tr key={`${unit.id}-detail`} className='unit-detail-row'>
                            <td colSpan={9}>
                              <div className='unit-detail-content'>
                                <h6>Detalle de Conceptos - Unidad {unit.unitNumber}</h6>
                                <div className='table-responsive'>
                                  <table className='table table-sm'>
                                    <thead>
                                      <tr>
                                        <th>Concepto</th>
                                        <th>Monto Total Concepto</th>
                                        <th>Distribución</th>
                                        <th>Monto Unidad</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {unit.details.map((detail) => (
                                        <tr key={detail.conceptId}>
                                          <td>{detail.conceptName}</td>
                                          <td>{formatCurrency(detail.totalAmount)}</td>
                                          <td>
                                            <span className='badge bg-secondary'>
                                              {getDistributionTypeText(detail.distributionType)}
                                            </span>
                                          </td>
                                          <td><strong>{formatCurrency(detail.unitAmount)}</strong></td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr className='table-primary'>
                                        <th>Total Unidad:</th>
                                        <th></th>
                                        <th></th>
                                        <th>{formatCurrency(unit.totalAmount)}</th>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )
                      ))}
                    </tbody>
                    <tfoot className='table-light'>
                      <tr>
                        <th colSpan={4}>Totales:</th>
                        <th>{formatCurrency(units.reduce((sum, unit) => sum + unit.totalAmount, 0))}</th>
                        <th className='text-success'>
                          {formatCurrency(units.reduce((sum, unit) => sum + unit.paidAmount, 0))}
                        </th>
                        <th className='text-warning'>
                          {formatCurrency(units.reduce((sum, unit) => sum + (unit.totalAmount - unit.paidAmount), 0))}
                        </th>
                        <th colSpan={2}></th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className='row'>
                  {units.map((unit) => (
                    <div key={unit.id} className='col-lg-6 mb-4'>
                      <div className='unit-card'>
                        <div className='card-header d-flex justify-content-between align-items-center'>
                          <div>
                            <h6 className='mb-0'>Unidad {unit.unitNumber}</h6>
                            <small className='text-muted'>{unit.owner}</small>
                          </div>
                          <span className={`badge ${getStatusBadgeClass(unit.status)}`}>
                            {getStatusText(unit.status)}
                          </span>
                        </div>
                        <div className='card-body'>
                          <div className='unit-info'>
                            <div className='info-item'>
                              <span className='label'>Participación:</span>
                              <span className='value'>{unit.participation}%</span>
                            </div>
                            <div className='info-item'>
                              <span className='label'>Total:</span>
                              <span className='value total'>{formatCurrency(unit.totalAmount)}</span>
                            </div>
                            <div className='info-item'>
                              <span className='label'>Pagado:</span>
                              <span className='value paid'>{formatCurrency(unit.paidAmount)}</span>
                            </div>
                            <div className='info-item'>
                              <span className='label'>Saldo:</span>
                              <span className='value pending'>
                                {formatCurrency(unit.totalAmount - unit.paidAmount)}
                              </span>
                            </div>
                          </div>
                          
                          <div className='concepts-breakdown'>
                            <h6>Conceptos:</h6>
                            {unit.details.map((detail) => (
                              <div key={detail.conceptId} className='concept-item'>
                                <div className='concept-info'>
                                  <span className='concept-name'>{detail.conceptName}</span>
                                  <span className='concept-amount'>{formatCurrency(detail.unitAmount)}</span>
                                </div>
                                <small className='text-muted'>
                                  {getDistributionTypeText(detail.distributionType)}
                                </small>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
          .summary-card {
            background: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            border: 1px solid #e9ecef;
            margin-bottom: 1rem;
          }

          .summary-card.total {
            border-left: 4px solid #0d6efd;
          }

          .summary-card.paid {
            border-left: 4px solid #198754;
          }

          .summary-card.pending {
            border-left: 4px solid #ffc107;
          }

          .summary-card.units {
            border-left: 4px solid #6f42c1;
          }

          .chart-card,
          .payment-status-card,
          .distribution-card {
            background: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            border: 1px solid #e9ecef;
          }

          .card-header {
            background-color: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            padding: 1rem 1.5rem;
          }

          .chart-placeholder {
            min-height: 300px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .mock-chart {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 2rem;
          }

          .chart-segment {
            height: 40px;
            display: flex;
            align-items: center;
            padding: 0 1rem;
            border-radius: 0.25rem;
            color: white;
            font-weight: 500;
          }

          .chart-legend {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.75rem;
          }

          .legend-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 3px;
          }

          .legend-text {
            flex: 1;
            font-weight: 500;
          }

          .legend-amount {
            font-weight: 600;
            color: #6c757d;
          }

          .status-item {
            display: flex;
            justify-content: between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid #f8f9fa;
          }

          .status-item:last-child {
            border-bottom: none;
          }

          .status-info {
            flex: 1;
            display: flex;
            align-items: center;
          }

          .status-amount {
            font-weight: 600;
          }

          .progress-section {
            padding-top: 1rem;
            border-top: 1px solid #e9ecef;
          }

          .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }

          .unit-detail-row {
            background-color: #f8f9fa;
          }

          .unit-detail-content {
            padding: 1rem;
          }

          .unit-card {
            background: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            border: 1px solid #e9ecef;
          }

          .unit-info {
            margin-bottom: 1rem;
          }

          .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f8f9fa;
          }

          .info-item:last-child {
            border-bottom: none;
          }

          .info-item .label {
            color: #6c757d;
            font-weight: 500;
          }

          .info-item .value {
            font-weight: 600;
          }

          .info-item .value.total {
            color: #212529;
          }

          .info-item .value.paid {
            color: #198754;
          }

          .info-item .value.pending {
            color: #ffc107;
          }

          .concepts-breakdown {
            border-top: 1px solid #e9ecef;
            padding-top: 1rem;
          }

          .concept-item {
            margin-bottom: 0.5rem;
          }

          .concept-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .concept-name {
            font-weight: 500;
          }

          .concept-amount {
            font-weight: 600;
            color: #0d6efd;
          }

          @media (max-width: 768px) {
            .chart-legend {
              grid-template-columns: 1fr;
            }

            .mock-chart {
              margin-bottom: 1rem;
            }

            .chart-segment {
              height: 30px;
              font-size: 0.875rem;
            }
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}
