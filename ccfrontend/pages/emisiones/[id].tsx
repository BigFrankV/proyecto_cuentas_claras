import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { EmissionStatusBadge, EmissionTypeBadge } from '@/components/emisiones';
import {
  EmissionDetail,
  Concept,
  ExpenseDetail,
  UnitDistribution,
  Payment
} from '@/types/emisiones';
import emisionesService from '@/lib/emisionesService';

export default function EmisionDetalle() {
  const router = useRouter();
  const { id } = router.query;

  const [emission, setEmission] = useState<EmissionDetail | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [expenses, setExpenses] = useState<ExpenseDetail[]>([]);
  const [units, setUnits] = useState<UnitDistribution[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('detalles');

  useEffect(() => {
    if (id) {
      loadEmissionData();
    }
  }, [id]);

  const loadEmissionData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Cargar datos en paralelo
      const [emissionData, conceptsData, expensesData, unitsData, paymentsData] = await Promise.all([
        emisionesService.getEmissionById(id as string),
        emisionesService.getEmissionConcepts(id as string),
        emisionesService.getEmissionExpenses(id as string),
        emisionesService.getEmissionUnits(id as string),
        emisionesService.getEmissionPayments(id as string)
      ]);

      setEmission(emissionData);
      setConcepts(conceptsData);
      setExpenses(expensesData);
      setUnits(unitsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading emission data:', error);
      // En caso de error, mostrar mensaje
      setEmission(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const getPaymentProgress = () => {
    if (!emission || emission.totalAmount === 0) return 0;
    return (emission.paidAmount / emission.totalAmount) * 100;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Detalle de Emisión'>
          <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '400px' }}>
            <div className='text-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='mt-2 text-muted'>Cargando detalle de emisión...</p>
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
        <title>Detalle de Emisión - {emission.period} — Cuentas Claras</title>
      </Head>

      <Layout title='Detalle de Emisión'>
        <div className='container-fluid p-4'>
          {/* Header */}
          <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3'>
            <div>
              <h1 className='h2 mb-1'>
                <i className='fa-solid fa-file-invoice-dollar me-2'></i>
                Detalle de Emisión - {emission.period}
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
                <Link href={`/emisiones/${id}/prorrateo`} className='btn btn-outline-primary'>
                  <i className='material-icons me-2'>pie_chart</i>
                  Prorrateo
                </Link>
              </div>
              <button
                className='btn btn-secondary'
                onClick={() => router.push('/emisiones')}
              >
                <i className='fa-solid fa-arrow-left me-2'></i>
                Volver
              </button>
            </div>
          </div>

          {/* Estado y detalles generales */}
          <div className='row mb-4'>
            <div className='col-md-8'>
              <div className='info-card'>
                <div className='card-body'>
                  <div className='row'>
                    <div className='col-md-6'>
                      <div className='info-item'>
                        <label>Estado:</label>
                        <div>
                          <EmissionStatusBadge status={emission.status} />
                        </div>
                      </div>
                      <div className='info-item'>
                        <label>Tipo:</label>
                        <div>
                          <EmissionTypeBadge type={emission.type} />
                        </div>
                      </div>
                      <div className='info-item'>
                        <label>Comunidad:</label>
                        <div>{emission.communityName}</div>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='info-item'>
                        <label>Fecha de emisión:</label>
                        <div>{formatDate(emission.issueDate)}</div>
                      </div>
                      <div className='info-item'>
                        <label>Fecha de vencimiento:</label>
                        <div>{formatDate(emission.dueDate)}</div>
                      </div>
                      <div className='info-item'>
                        <label>Unidades:</label>
                        <div>{emission.unitCount}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-md-4'>
              <div className='amount-card'>
                <div className='card-body'>
                  <div className='amount-item total'>
                    <label>Total emisión:</label>
                    <div className='amount'>{formatCurrency(emission.totalAmount)}</div>
                  </div>
                  <div className='amount-item paid'>
                    <label>Monto pagado:</label>
                    <div className='amount'>{formatCurrency(emission.paidAmount)}</div>
                  </div>
                  <div className='amount-item pending'>
                    <label>Pendiente:</label>
                    <div className='amount'>
                      {formatCurrency(emission.totalAmount - emission.paidAmount)}
                    </div>
                  </div>
                  
                  <div className='progress-section'>
                    <div className='progress-header'>
                      <span>Progreso de pago</span>
                      <span>{Math.round(getPaymentProgress())}%</span>
                    </div>
                    <div className='progress'>
                      <div
                        className='progress-bar'
                        style={{ width: `${getPaymentProgress()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <ul className='nav nav-tabs mb-3'>
            <li className='nav-item'>
              <button
                className={`nav-link ${activeTab === 'detalles' ? 'active' : ''}`}
                onClick={() => setActiveTab('detalles')}
              >
                <i className='material-icons me-2'>info</i>
                Detalles
              </button>
            </li>
            <li className='nav-item'>
              <button
                className={`nav-link ${activeTab === 'conceptos' ? 'active' : ''}`}
                onClick={() => setActiveTab('conceptos')}
              >
                <i className='material-icons me-2'>receipt_long</i>
                Conceptos
              </button>
            </li>
            <li className='nav-item'>
              <button
                className={`nav-link ${activeTab === 'gastos' ? 'active' : ''}`}
                onClick={() => setActiveTab('gastos')}
              >
                <i className='material-icons me-2'>receipt</i>
                Gastos incluidos
              </button>
            </li>
            <li className='nav-item'>
              <button
                className={`nav-link ${activeTab === 'unidades' ? 'active' : ''}`}
                onClick={() => setActiveTab('unidades')}
              >
                <i className='material-icons me-2'>home</i>
                Unidades ({units.length})
              </button>
            </li>
            <li className='nav-item'>
              <button
                className={`nav-link ${activeTab === 'pagos' ? 'active' : ''}`}
                onClick={() => setActiveTab('pagos')}
              >
                <i className='material-icons me-2'>payment</i>
                Pagos ({payments.length})
              </button>
            </li>
            <li className='nav-item'>
            </li>
          </ul>

          {/* Tab Content */}
          <div className='tab-content'>
            {/* Tab Detalles */}
            {activeTab === 'detalles' && (
              <div className='tab-pane active'>
                <div className='content-card'>
                  <div className='card-body'>
                    <div className='row'>
                      <div className='col-md-6'>
                        <h5>Información General</h5>
                        <div className='detail-group'>
                          <div className='detail-item'>
                            <strong>Período:</strong> {emission.period}
                          </div>
                          <div className='detail-item'>
                            <strong>Descripción:</strong> {emission.description}
                          </div>
                          <div className='detail-item'>
                            <strong>Comunidad:</strong> {emission.communityName}
                          </div>
                          <div className='detail-item'>
                            <strong>Cantidad de unidades:</strong> {emission.unitCount}
                          </div>
                        </div>
                      </div>
                      <div className='col-md-6'>
                        <h5>Configuración de Intereses</h5>
                        <div className='detail-group'>
                          <div className='detail-item'>
                            <strong>Aplica interés:</strong> {emission.hasInterest ? 'Sí' : 'No'}
                          </div>
                          {emission.hasInterest && (
                            <>
                              <div className='detail-item'>
                                <strong>Tasa de interés:</strong> {emission.interestRate}% mensual
                              </div>
                              <div className='detail-item'>
                                <strong>Período de gracia:</strong> {emission.gracePeriod} días
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Conceptos */}
            {activeTab === 'conceptos' && (
              <div className='tab-pane active'>
                <div className='content-card'>
                  <div className='card-body'>
                    <div className='table-responsive'>
                      <table className='table table-hover'>
                        <thead>
                          <tr>
                            <th>Concepto</th>
                            <th>Descripción</th>
                            <th>Categoría</th>
                            <th>Distribución</th>
                            <th>Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {concepts.map((concept) => (
                            <tr key={concept.id}>
                              <td><strong>{concept.name}</strong></td>
                              <td>{concept.description}</td>
                              <td>
                                <span className='badge bg-light text-dark'>
                                  {concept.category}
                                </span>
                              </td>
                              <td>
                                <span className='badge bg-secondary'>
                                  {concept.distributionType === 'proportional' ? 'Proporcional' :
                                   concept.distributionType === 'equal' ? 'Igualitario' : 'Personalizado'}
                                </span>
                              </td>
                              <td><strong>{formatCurrency(concept.amount)}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className='table-light'>
                          <tr>
                            <th colSpan={4}>Total Conceptos:</th>
                            <th>
                              {formatCurrency(concepts.reduce((sum, concept) => sum + concept.amount, 0))}
                            </th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Gastos incluidos */}
            {activeTab === 'gastos' && (
              <div className='tab-pane active'>
                <div className='content-card'>
                  <div className='card-body'>
                    <div className='table-responsive'>
                      <table className='table table-hover'>
                        <thead>
                          <tr>
                            <th>Descripción</th>
                            <th>Categoría</th>
                            <th>Proveedor</th>
                            <th>Fecha</th>
                            <th>Documento</th>
                            <th>Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenses.map((expense) => (
                            <tr key={expense.id}>
                              <td><strong>{expense.description}</strong></td>
                              <td>
                                <span className='badge bg-light text-dark'>
                                  {expense.category}
                                </span>
                              </td>
                              <td>{expense.supplier}</td>
                              <td>{formatDate(expense.date)}</td>
                              <td>{expense.document}</td>
                              <td><strong>{formatCurrency(expense.amount)}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className='table-light'>
                          <tr>
                            <th colSpan={5}>Total Gastos:</th>
                            <th>
                              {formatCurrency(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
                            </th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Unidades */}
            {activeTab === 'unidades' && (
              <div className='tab-pane active'>
                <div className='content-card'>
                  <div className='card-body'>
                    <div className='table-responsive'>
                      <table className='table table-hover'>
                        <thead>
                          <tr>
                            <th>Unidad</th>
                            <th>Tipo</th>
                            <th>Propietario</th>
                            <th>Contacto</th>
                            <th>Participación</th>
                            <th>Monto Total</th>
                            <th>Monto Pagado</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {units.map((unit) => (
                            <tr key={unit.id}>
                              <td><strong>{unit.unitNumber}</strong></td>
                              <td>{unit.unitType}</td>
                              <td>{unit.owner}</td>
                              <td>{unit.contact}</td>
                              <td>{unit.participation}%</td>
                              <td>{formatCurrency(unit.totalAmount)}</td>
                              <td className='text-success'>{formatCurrency(unit.paidAmount)}</td>
                              <td>
                                <span className={`badge ${
                                  unit.status === 'paid' ? 'bg-success' :
                                  unit.status === 'partial' ? 'bg-warning' : 'bg-secondary'
                                }`}>
                                  {unit.status === 'paid' ? 'Pagado' :
                                   unit.status === 'partial' ? 'Parcial' : 'Pendiente'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Pagos */}
            {activeTab === 'pagos' && (
              <div className='tab-pane active'>
                <div className='content-card'>
                  <div className='card-body'>
                    <div className='table-responsive'>
                      <table className='table table-hover'>
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Unidad</th>
                            <th>Monto</th>
                            <th>Método</th>
                            <th>Referencia</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment.id}>
                              <td>{formatDate(payment.date)}</td>
                              <td><strong>{payment.unit}</strong></td>
                              <td><strong>{formatCurrency(payment.amount)}</strong></td>
                              <td>{payment.method}</td>
                              <td>{payment.reference}</td>
                              <td>
                                <span className={`badge ${
                                  payment.status === 'confirmed' ? 'bg-success' :
                                  payment.status === 'pending' ? 'bg-warning' : 'bg-danger'
                                }`}>
                                  {payment.status === 'confirmed' ? 'Confirmado' :
                                   payment.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className='table-light'>
                          <tr>
                            <th colSpan={2}>Total Pagos:</th>
                            <th>
                              {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
                            </th>
                            <th colSpan={3}></th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        <style jsx>{`
          .info-card,
          .amount-card,
          .content-card {
            background: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            border: 1px solid #e9ecef;
          }

          .info-item {
            margin-bottom: 1rem;
          }

          .info-item label {
            font-weight: 600;
            color: #6c757d;
            margin-bottom: 0.25rem;
            display: block;
          }

          .amount-card .card-body {
            padding: 1.5rem;
          }

          .amount-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
          }

          .amount-item.total {
            border-bottom: 2px solid #e9ecef;
            margin-bottom: 1.5rem;
          }

          .amount-item label {
            font-weight: 500;
            color: #6c757d;
          }

          .amount-item .amount {
            font-weight: 600;
            font-size: 1.1rem;
          }

          .amount-item.total .amount {
            font-size: 1.25rem;
            color: #212529;
          }

          .amount-item.paid .amount {
            color: #198754;
          }

          .amount-item.pending .amount {
            color: #ffc107;
          }

          .progress-section {
            margin-top: 1.5rem;
          }

          .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
          }

          .progress {
            height: 0.75rem;
            background-color: #e9ecef;
            border-radius: 0.375rem;
          }

          .progress-bar {
            background: linear-gradient(90deg, #198754 0%, #20c997 100%);
            border-radius: 0.375rem;
          }

          .nav-tabs .nav-link {
            color: #6c757d;
            border: none;
            padding: 1rem 1.5rem;
          }

          .nav-tabs .nav-link.active {
            color: #0d6efd;
            background: linear-gradient(135deg, rgba(13, 110, 253, 0.1) 0%, rgba(13, 110, 253, 0.05) 100%);
            border-bottom: 2px solid #0d6efd;
          }

          .nav-tabs .nav-link:hover {
            color: #0d6efd;
            background: rgba(13, 110, 253, 0.05);
          }

          .detail-group {
            margin-bottom: 2rem;
          }

          .detail-item {
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #f8f9fa;
          }

          .detail-item:last-child {
            border-bottom: none;
          }

          .timeline {
            position: relative;
            padding-left: 2rem;
          }

          .timeline::before {
            content: '';
            position: absolute;
            left: 0.75rem;
            top: 0;
            bottom: 0;
            width: 2px;
            background-color: #e9ecef;
          }

          .timeline-item {
            position: relative;
            margin-bottom: 2rem;
          }

          .timeline-item::before {
            content: '';
            position: absolute;
            left: -2.25rem;
            top: 0.5rem;
            width: 0.75rem;
            height: 0.75rem;
            border-radius: 50%;
            background-color: #0d6efd;
          }

          .timeline-date {
            font-size: 0.875rem;
            color: #6c757d;
            font-weight: 500;
            margin-bottom: 0.5rem;
          }

          .timeline-content h6 {
            color: #212529;
            margin-bottom: 0.5rem;
          }

          .timeline-content p {
            margin-bottom: 0.25rem;
            line-height: 1.4;
          }

          @media (max-width: 768px) {
            .nav-tabs .nav-link {
              padding: 0.75rem 1rem;
              font-size: 0.875rem;
            }

            .timeline {
              padding-left: 1.5rem;
            }

            .timeline-item::before {
              left: -1.75rem;
            }
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}