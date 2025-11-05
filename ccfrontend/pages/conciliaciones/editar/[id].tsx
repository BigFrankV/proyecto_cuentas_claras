import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Row,
  Col,
  Form,
  Alert,
  Spinner,
  Table,
  Modal,
  ProgressBar,
} from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

interface FormData {
  bank: string;
  bankAccount: string;
  period: string;
  startDate: string;
  endDate: string;
  uploadedFile: File | null;
}

interface ProcessStep {
  number: number;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

interface BankTransaction {
  id: number;
  date: string;
  description: string;
  reference: string;
  amount: number;
  type: 'debit' | 'credit';
  matched: boolean;
  matchStatus: 'matched' | 'unmatched' | 'manual';
}

interface ConciliationData {
  id: number;
  bank: string;
  bankAccount: string;
  period: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  totalTransactions: number;
  matchedTransactions: number;
  unMatchedTransactions: number;
  totalAmount: number;
}

export default function EditarConciliacion() {
  const router = useRouter();
  const { id } = router.query;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [conciliationData, setConciliationData] =
    useState<ConciliationData | null>(null);

  const [formData, setFormData] = useState<FormData>({
    bank: '',
    bankAccount: '',
    period: '',
    startDate: '',
    endDate: '',
    uploadedFile: null,
  });

  const [alert, setAlert] = useState({
    show: false,
    message: '',
    variant: 'success',
  });
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(
    [],
  );
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    {
      number: 1,
      title: 'Información Básica',
      description: 'Datos de la conciliación',
      status: 'active',
    },
    {
      number: 2,
      title: 'Archivo Bancario',
      description: 'Subir archivo de transacciones',
      status: 'pending',
    },
    {
      number: 3,
      title: 'Procesamiento',
      description: 'Análisis automático',
      status: 'pending',
    },
    {
      number: 4,
      title: 'Revisión',
      description: 'Validar coincidencias',
      status: 'pending',
    },
  ]);

  // Cargar datos de la conciliación existente
  useEffect(() => {
    if (id) {
      loadConciliationData();
    }
  }, [id]);

  const loadConciliationData = async () => {
    try {
      setLoading(true);

      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Por ahora, usar datos mock hasta que la API esté implementada
      const mockData: ConciliationData = {
        id: Number(id),
        bank: 'Banco de Chile',
        bankAccount: '12345-67890',
        period: '2024-03',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        status: 'completed',
        createdAt: '2024-03-15T10:30:00Z',
        totalTransactions: 25,
        matchedTransactions: 20,
        unMatchedTransactions: 5,
        totalAmount: 1800000,
      };

      setConciliationData(mockData);
      setFormData({
        bank: mockData.bank,
        bankAccount: mockData.bankAccount,
        period: mockData.period,
        startDate: mockData.startDate,
        endDate: mockData.endDate,
        uploadedFile: null,
      });

      // Si la conciliación ya está procesada, mostrar los resultados
      if (mockData.status === 'completed') {
        setShowResults(true);
        setCurrentStep(4);
        loadBankTransactions();
        updateProcessSteps(4);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading conciliation data:', error);
      setAlert({
        show: true,
        message: 'Error al cargar los datos de la conciliación',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBankTransactions = async () => {
    // Mock data para transacciones bancarias
    const mockTransactions: BankTransaction[] = [
      {
        id: 1,
        date: '2024-03-05',
        description: 'Pago Gastos Comunes - Torre A',
        reference: 'REF001',
        amount: 150000,
        type: 'credit',
        matched: true,
        matchStatus: 'matched',
      },
      {
        id: 2,
        date: '2024-03-10',
        description: 'Transferencia Mantenimiento',
        reference: 'REF002',
        amount: -75000,
        type: 'debit',
        matched: true,
        matchStatus: 'matched',
      },
      {
        id: 3,
        date: '2024-03-15',
        description: 'Pago Servicios Básicos',
        reference: 'REF003',
        amount: -25000,
        type: 'debit',
        matched: false,
        matchStatus: 'unmatched',
      },
      {
        id: 4,
        date: '2024-03-20',
        description: 'Ingreso Cuotas Extraordinarias',
        reference: 'REF004',
        amount: 80000,
        type: 'credit',
        matched: true,
        matchStatus: 'matched',
      },
    ];
    setBankTransactions(mockTransactions);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      uploadedFile: file,
    }));
  };

  const updateProcessSteps = (activeStep: number) => {
    setProcessSteps(prev =>
      prev.map(step => ({
        ...step,
        status:
          step.number < activeStep
            ? 'completed'
            : step.number === activeStep
              ? 'active'
              : 'pending',
      })),
    );
  };

  const nextStep = () => {
    if (currentStep < 4) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      updateProcessSteps(newStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      updateProcessSteps(newStep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 1) {
      // Validar campos básicos
      if (!formData.bank || !formData.bankAccount || !formData.period) {
        setAlert({
          show: true,
          message: 'Por favor complete todos los campos requeridos',
          variant: 'danger',
        });
        return;
      }
      nextStep();
    } else if (currentStep === 2) {
      // Validar archivo
      if (!formData.uploadedFile) {
        setAlert({
          show: true,
          message: 'Por favor seleccione un archivo para procesar',
          variant: 'danger',
        });
        return;
      }
      nextStep();
    } else if (currentStep === 3) {
      // Procesar archivo
      setProcessing(true);
      try {
        // Simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simular actualización de datos básicos
        // eslint-disable-next-line no-console
        console.log('Actualizando conciliación con datos:', {
          bank: formData.bank,
          bankAccount: formData.bankAccount,
          period: formData.period,
          startDate: formData.startDate,
          endDate: formData.endDate,
        });

        // Cargar o recargar transacciones
        if (formData.uploadedFile) {
          // Simular procesamiento de archivo nuevo
          // eslint-disable-next-line no-console
          console.log('Procesando archivo:', formData.uploadedFile.name);

          // Generar transacciones mock con datos más variados
          const mockProcessedTransactions: BankTransaction[] = [
            {
              id: 1,
              date: '2024-03-15',
              description: 'Pago Gastos Comunes - Torre A',
              reference: 'REF001',
              amount: 150000,
              type: 'credit',
              matched: true,
              matchStatus: 'matched',
            },
            {
              id: 2,
              date: '2024-03-16',
              description: 'Transferencia Mantenimiento',
              reference: 'REF002',
              amount: -75000,
              type: 'debit',
              matched: true,
              matchStatus: 'matched',
            },
            {
              id: 3,
              date: '2024-03-17',
              description: 'Pago Servicios Básicos',
              reference: 'REF003',
              amount: -25000,
              type: 'debit',
              matched: false,
              matchStatus: 'unmatched',
            },
            {
              id: 4,
              date: '2024-03-18',
              description: 'Ingreso Multas',
              reference: 'REF004',
              amount: 50000,
              type: 'credit',
              matched: true,
              matchStatus: 'matched',
            },
            {
              id: 5,
              date: '2024-03-19',
              description: 'Gasto Mantenimiento Ascensor',
              reference: 'REF005',
              amount: -120000,
              type: 'debit',
              matched: false,
              matchStatus: 'unmatched',
            },
          ];
          setBankTransactions(mockProcessedTransactions);
        } else {
          // Si no hay archivo nuevo, cargar transacciones existentes
          loadBankTransactions();
        }

        setShowResults(true);
        nextStep();
        setAlert({
          show: true,
          message: 'Conciliación actualizada exitosamente',
          variant: 'success',
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error updating conciliation:', error);
        setAlert({
          show: true,
          message: 'Error al procesar la actualización',
          variant: 'danger',
        });
      } finally {
        setProcessing(false);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check_circle';
      case 'active':
        return 'radio_button_checked';
      default:
        return 'radio_button_unchecked';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div
          className='d-flex justify-content-center align-items-center'
          style={{ minHeight: '400px' }}
        >
          <Spinner animation='border' variant='primary' />
          <span className='ms-3'>Cargando datos de la conciliación...</span>
        </div>
      </Layout>
    );
  }

  if (!conciliationData) {
    return (
      <Layout>
        <div className='text-center'>
          <Alert variant='danger'>
            No se pudo cargar la información de la conciliación
          </Alert>
          <Button
            variant='primary'
            onClick={() => router.push('/conciliaciones')}
          >
            Volver a Conciliaciones
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Editar Conciliación - Cuentas Claras</title>
        </Head>

        <div className='conciliations-container'>
          {/* Header */}
          <div className='page-header'>
            <div className='header-content'>
              <div className='header-main'>
                <div className='header-info'>
                  <span className='material-icons header-icon'>edit</span>
                  <div>
                    <h1 className='page-title'>Editar Conciliación</h1>
                    <p className='page-subtitle'>
                      Modificar conciliación #{conciliationData.id} -{' '}
                      {conciliationData.bank}
                    </p>
                  </div>
                </div>
                <div className='header-actions'>
                  <button
                    className='btn-secondary'
                    onClick={() => router.push(`/conciliaciones/${id}`)}
                  >
                    <span className='material-icons'>arrow_back</span>
                    Ver Detalle
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Alert */}
          {alert.show && (
            <Alert
              variant={alert.variant}
              onClose={() => setAlert({ ...alert, show: false })}
              dismissible
            >
              {alert.message}
            </Alert>
          )}

          {/* Progress Section */}
          <Row>
            <Col lg={3}>
              <Card className='progress-section'>
                <Card.Body>
                  <h6 className='fw-bold mb-3'>Progreso de Edición</h6>
                  <div className='step-list'>
                    {processSteps.map((step, index) => (
                      <div
                        key={step.number}
                        className={`step-item ${step.status}`}
                      >
                        <div className='step-icon'>
                          <span className='material-icons'>
                            {getStatusIcon(step.status)}
                          </span>
                        </div>
                        <div className='step-content'>
                          <div className='step-title'>{step.title}</div>
                          <div className='step-description'>
                            {step.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={9}>
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <Card className='form-section'>
                  <div className='form-section-header'>
                    <h5 className='form-section-title'>
                      <span className='material-icons'>info</span>
                      Información Básica
                    </h5>
                    <p className='form-section-subtitle'>
                      Modifique los datos básicos de la conciliación
                    </p>
                  </div>

                  <div className='form-section-body'>
                    <Row className='g-4'>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='form-label'>
                            <span className='material-icons'>
                              account_balance
                            </span>
                            Banco
                          </Form.Label>
                          <Form.Select
                            name='bank'
                            value={formData.bank}
                            onChange={handleInputChange}
                            className='form-control'
                          >
                            <option value=''>Seleccionar banco</option>
                            <option value='Banco de Chile'>
                              Banco de Chile
                            </option>
                            <option value='BancoEstado'>BancoEstado</option>
                            <option value='Santander'>Santander</option>
                            <option value='BCI'>BCI</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='form-label'>
                            <span className='material-icons'>credit_card</span>
                            Cuenta Bancaria
                          </Form.Label>
                          <Form.Control
                            type='text'
                            name='bankAccount'
                            value={formData.bankAccount}
                            onChange={handleInputChange}
                            placeholder='Número de cuenta'
                            className='form-control'
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className='form-label'>
                            <span className='material-icons'>
                              calendar_month
                            </span>
                            Período
                          </Form.Label>
                          <Form.Control
                            type='month'
                            name='period'
                            value={formData.period}
                            onChange={handleInputChange}
                            className='form-control'
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className='form-label'>
                            <span className='material-icons'>event</span>
                            Fecha Inicio
                          </Form.Label>
                          <Form.Control
                            type='date'
                            name='startDate'
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className='form-control'
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className='form-label'>
                            <span className='material-icons'>event</span>
                            Fecha Fin
                          </Form.Label>
                          <Form.Control
                            type='date'
                            name='endDate'
                            value={formData.endDate}
                            onChange={handleInputChange}
                            className='form-control'
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </Card>
              )}

              {/* Step 2: File Upload */}
              {currentStep === 2 && (
                <Card className='form-section'>
                  <div className='form-section-header'>
                    <h5 className='form-section-title'>
                      <span className='material-icons'>upload_file</span>
                      Archivo Bancario
                    </h5>
                    <p className='form-section-subtitle'>
                      Subir nuevo archivo de transacciones bancarias
                    </p>
                  </div>

                  <div className='form-section-body'>
                    <div className='upload-area'>
                      <div className='upload-content'>
                        <span className='material-icons upload-icon'>
                          cloud_upload
                        </span>
                        <h6>Seleccionar archivo de transacciones</h6>
                        <p className='text-muted'>
                          Formatos soportados: CSV, Excel (.xlsx)
                        </p>
                        <Form.Control
                          type='file'
                          accept='.csv,.xlsx,.xls'
                          onChange={handleFileChange}
                          className='file-input'
                        />
                        {formData.uploadedFile && (
                          <div className='selected-file'>
                            <span className='material-icons'>description</span>
                            <span>{formData.uploadedFile.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Alert variant='info' className='mt-3'>
                      <span className='material-icons me-2'>info</span>
                      <strong>Nota:</strong> Al subir un nuevo archivo, se
                      reprocesarán todas las transacciones y se actualizarán las
                      coincidencias existentes.
                    </Alert>
                  </div>
                </Card>
              )}

              {/* Step 3: Processing */}
              {currentStep === 3 && (
                <Card className='form-section'>
                  <div className='form-section-header'>
                    <h5 className='form-section-title'>
                      <span className='material-icons'>autorenew</span>
                      Procesamiento
                    </h5>
                    <p className='form-section-subtitle'>
                      Actualizando análisis de transacciones
                    </p>
                  </div>

                  <div className='form-section-body text-center'>
                    {processing ? (
                      <div className='processing-content'>
                        <Spinner
                          animation='border'
                          variant='primary'
                          style={{ width: '3rem', height: '3rem' }}
                        />
                        <h6 className='mt-3'>Procesando archivo...</h6>
                        <p className='text-muted'>
                          Analizando transacciones y actualizando coincidencias
                        </p>
                        <ProgressBar animated now={75} className='mt-3' />
                      </div>
                    ) : (
                      <div className='ready-content'>
                        <span className='material-icons ready-icon'>
                          check_circle
                        </span>
                        <h6>Listo para procesar</h6>
                        <p className='text-muted'>
                          Haga clic en &quot;Actualizar&quot; para procesar el
                          nuevo archivo
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Step 4: Review Results */}
              {currentStep === 4 && showResults && (
                <Card className='form-section'>
                  <div className='form-section-header'>
                    <h5 className='form-section-title'>
                      <span className='material-icons'>fact_check</span>
                      Revisión de Resultados
                    </h5>
                    <p className='form-section-subtitle'>
                      Validar las transacciones actualizadas
                    </p>
                  </div>

                  <div className='form-section-body'>
                    {/* Summary Cards */}
                    <div className='summary-cards'>
                      <div className='summary-card'>
                        <div className='summary-icon transactions'>
                          <span className='material-icons'>receipt_long</span>
                        </div>
                        <div className='summary-content'>
                          <div className='summary-value'>
                            {bankTransactions.length}
                          </div>
                          <div className='summary-label'>
                            Total Transacciones
                          </div>
                        </div>
                      </div>
                      <div className='summary-card'>
                        <div className='summary-icon matched'>
                          <span className='material-icons'>check_circle</span>
                        </div>
                        <div className='summary-content'>
                          <div className='summary-value'>
                            {
                              bankTransactions.filter(
                                t => t.matchStatus === 'matched',
                              ).length
                            }
                          </div>
                          <div className='summary-label'>Coincidentes</div>
                        </div>
                      </div>
                      <div className='summary-card'>
                        <div className='summary-icon pending'>
                          <span className='material-icons'>error</span>
                        </div>
                        <div className='summary-content'>
                          <div className='summary-value'>
                            {
                              bankTransactions.filter(
                                t => t.matchStatus === 'unmatched',
                              ).length
                            }
                          </div>
                          <div className='summary-label'>Sin Coincidencia</div>
                        </div>
                      </div>
                      <div className='summary-card'>
                        <div className='summary-icon amount'>
                          <span className='material-icons'>attach_money</span>
                        </div>
                        <div className='summary-content'>
                          <div className='summary-value'>
                            {formatCurrency(
                              bankTransactions.reduce(
                                (sum, t) => sum + t.amount,
                                0,
                              ),
                            )}
                          </div>
                          <div className='summary-label'>Monto Total</div>
                        </div>
                      </div>
                    </div>

                    {/* Transactions Table */}
                    <div className='conciliations-table'>
                      <div className='table-header'>
                        <h5 className='table-title'>
                          <span className='material-icons'>view_list</span>
                          Transacciones Actualizadas ({bankTransactions.length})
                        </h5>
                      </div>
                      <div className='table-responsive'>
                        <Table hover className='custom-table mb-0'>
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Descripción</th>
                              <th>Referencia</th>
                              <th>Monto</th>
                              <th>Estado</th>
                              <th className='text-center'>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bankTransactions.map(transaction => (
                              <tr key={transaction.id}>
                                <td>
                                  {new Date(
                                    transaction.date,
                                  ).toLocaleDateString('es-CL')}
                                </td>
                                <td>
                                  <div className='fw-medium'>
                                    {transaction.description}
                                  </div>
                                </td>
                                <td>
                                  <small className='text-muted'>
                                    {transaction.reference}
                                  </small>
                                </td>
                                <td>
                                  <span
                                    className={`amount-cell ${transaction.amount >= 0 ? 'positive' : 'negative'}`}
                                  >
                                    {formatCurrency(transaction.amount)}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`match-status ${transaction.matchStatus}`}
                                  >
                                    <span className='material-icons'>
                                      {transaction.matchStatus === 'matched'
                                        ? 'check_circle'
                                        : transaction.matchStatus === 'manual'
                                          ? 'build'
                                          : 'error'}
                                    </span>
                                    {transaction.matchStatus === 'matched'
                                      ? 'Coincidente'
                                      : transaction.matchStatus === 'manual'
                                        ? 'Manual'
                                        : 'Sin Coincidencia'}
                                  </span>
                                </td>
                                <td className='text-center'>
                                  <div className='action-buttons'>
                                    {transaction.matchStatus ===
                                      'unmatched' && (
                                      <button className='btn-action link'>
                                        <span className='material-icons'>
                                          link
                                        </span>
                                      </button>
                                    )}
                                    <button className='btn-action view'>
                                      <span className='material-icons'>
                                        visibility
                                      </span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className='d-flex justify-content-between mt-4'>
                <div>
                  {currentStep > 1 && (
                    <Button variant='outline-secondary' onClick={prevStep}>
                      <span className='material-icons me-2'>arrow_back</span>
                      Anterior
                    </Button>
                  )}
                </div>
                <div>
                  {currentStep < 4 ? (
                    <Button variant='primary' onClick={handleSubmit}>
                      {currentStep === 3 ? (
                        processing ? (
                          <>
                            <Spinner
                              animation='border'
                              size='sm'
                              className='me-2'
                            />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <span className='material-icons me-2'>refresh</span>
                            Actualizar
                          </>
                        )
                      ) : (
                        <>
                          Siguiente
                          <span className='material-icons ms-2'>
                            arrow_forward
                          </span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className='d-flex gap-2'>
                      <Button
                        variant='outline-primary'
                        onClick={() => router.push(`/conciliaciones/${id}`)}
                      >
                        <span className='material-icons me-2'>visibility</span>
                        Ver Detalle
                      </Button>
                      <Button
                        variant='primary'
                        onClick={() => router.push('/conciliaciones')}
                      >
                        <span className='material-icons me-2'>check</span>
                        Finalizar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
