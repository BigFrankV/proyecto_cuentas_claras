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
  ProgressBar,
} from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { conciliacionesApi } from '@/lib/api/conciliaciones';
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

export default function NuevaConciliacion() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    bank: '',
    bankAccount: '',
    period: '',
    startDate: '',
    endDate: '',
    uploadedFile: null,
  });

  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    {
      number: 1,
      title: 'Configuración Inicial',
      description: 'Selecciona banco, cuenta y período',
      status: 'active',
    },
    {
      number: 2,
      title: 'Carga de Archivos',
      description: 'Sube el estado bancario en formato Excel/CSV',
      status: 'pending',
    },
    {
      number: 3,
      title: 'Procesamiento',
      description: 'Análisis automático de transacciones',
      status: 'pending',
    },
    {
      number: 4,
      title: 'Revisión y Ajustes',
      description: 'Verificar coincidencias y resolver diferencias',
      status: 'pending',
    },
  ]);

  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(
    [],
  );
  const [matchingSummary, setMatchingSummary] = useState({
    totalTransactions: 0,
    matchedTransactions: 0,
    unmatchedTransactions: 0,
    manualMatches: 0,
    totalAmount: 0,
    difference: 0,
  });

  const [bankAccounts, setBankAccounts] = useState<
    Record<string, Array<{ value: string; label: string }>>
  >({});
  const [loadingBanks, setLoadingBanks] = useState(true);

  // Load bank accounts on component mount
  useEffect(() => {
    const loadBankAccounts = async () => {
      try {
        setLoadingBanks(true);
        const accounts = await conciliacionesApi.getCuentasBancarias();
        setBankAccounts(accounts);
      } catch (error) {
        console.error('Error loading bank accounts:', error);
        // Fallback to hardcoded data if API fails
        setBankAccounts({
          'banco-chile': [
            { value: '12345678-9', label: 'Cuenta Corriente 12345678-9' },
            { value: '87654321-0', label: 'Cuenta Corriente 87654321-0' },
          ],
          'banco-santander': [
            { value: '11223344-5', label: 'Cuenta Corriente 11223344-5' },
            { value: '99887766-3', label: 'Cuenta Vista 99887766-3' },
          ],
          'banco-estado': [
            { value: '55667788-1', label: 'CuentaRUT 55667788-1' },
          ],
        });
      } finally {
        setLoadingBanks(false);
      }
    };

    loadBankAccounts();
  }, []);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleInputChange('uploadedFile', file);
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleInputChange('uploadedFile', file);
    }
  };

  const updateStepStatus = (
    stepNumber: number,
    status: 'pending' | 'active' | 'completed',
  ) => {
    setProcessSteps(prev =>
      prev.map(step =>
        step.number === stepNumber ? { ...step, status } : step,
      ),
    );
  };

  const nextStep = () => {
    if (currentStep < processSteps.length) {
      updateStepStatus(currentStep, 'completed');
      updateStepStatus(currentStep + 1, 'active');
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      updateStepStatus(currentStep, 'pending');
      updateStepStatus(currentStep - 1, 'active');
      setCurrentStep(currentStep - 1);
    }
  };

  const processFiles = async () => {
    setProcessing(true);
    setLoading(true);

    // Simulate file processing
    setTimeout(() => {
      // Mock transaction data
      const mockTransactions: BankTransaction[] = [
        {
          id: 1,
          date: '2024-03-01',
          description: 'Transferencia recibida - Gastos Comunes Unidad 301',
          reference: 'TRF001234',
          amount: 145000,
          type: 'credit',
          matched: true,
          matchStatus: 'matched',
        },
        {
          id: 2,
          date: '2024-03-02',
          description: 'Pago proveedor - Mantención Ascensores',
          reference: 'PAG005678',
          amount: -85000,
          type: 'debit',
          matched: true,
          matchStatus: 'matched',
        },
        {
          id: 3,
          date: '2024-03-03',
          description: 'Transferencia recibida - Gastos Comunes Unidad 302',
          reference: 'TRF001235',
          amount: 145000,
          type: 'credit',
          matched: false,
          matchStatus: 'unmatched',
        },
        {
          id: 4,
          date: '2024-03-05',
          description: 'Comisión bancaria',
          reference: 'COM001',
          amount: -2500,
          type: 'debit',
          matched: false,
          matchStatus: 'manual',
        },
      ];

      setBankTransactions(mockTransactions);

      const matched = mockTransactions.filter(t => t.matched).length;
      const total = mockTransactions.length;
      const totalAmount = mockTransactions.reduce(
        (sum, t) => sum + t.amount,
        0,
      );

      setMatchingSummary({
        totalTransactions: total,
        matchedTransactions: matched,
        unmatchedTransactions: total - matched,
        manualMatches: mockTransactions.filter(t => t.matchStatus === 'manual')
          .length,
        totalAmount,
        difference: 0,
      });

      setProcessing(false);
      setLoading(false);
      setShowResults(true);
      nextStep();
    }, 3000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {return '0 Bytes';}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getStepIcon = (step: ProcessStep) => {
    switch (step.status) {
      case 'completed':
        return 'check_circle';
      case 'active':
        return 'radio_button_checked';
      default:
        return 'radio_button_unchecked';
    }
  };

  const getStepIconClass = (step: ProcessStep) => {
    switch (step.status) {
      case 'completed':
        return 'step-icon completed';
      case 'active':
        return 'step-icon active';
      default:
        return 'step-icon pending';
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.bank &&
          formData.bankAccount &&
          formData.period &&
          formData.startDate &&
          formData.endDate
        );
      case 2:
        return formData.uploadedFile !== null;
      case 3:
        return showResults;
      default:
        return false;
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nueva Conciliación — Cuentas Claras</title>
      </Head>

      <Layout title='Nueva Conciliación Bancaria'>
        <div className='container-fluid p-4'>
          {/* Header */}
          <div className='form-header'>
            <div className='d-flex justify-content-between align-items-start'>
              <div>
                <h1 className='form-title'>Nueva Conciliación Bancaria</h1>
                <p className='form-subtitle'>
                  Crea una nueva conciliación bancaria paso a paso
                </p>
              </div>
              <Button variant='outline-light' onClick={() => router.back()}>
                <span className='material-icons me-2'>arrow_back</span>
                Volver
              </Button>
            </div>
          </div>

          <Row>
            {/* Progress Steps */}
            <Col lg={3}>
              <Card className='progress-section'>
                <Card.Body>
                  <h6 className='progress-title'>
                    <span className='material-icons'>timeline</span>
                    Progreso
                  </h6>
                  {processSteps.map(step => (
                    <div
                      key={step.number}
                      className={`progress-step ${step.status}`}
                    >
                      <div className={getStepIconClass(step)}>
                        <span className='material-icons'>
                          {getStepIcon(step)}
                        </span>
                      </div>
                      <div className='step-text'>
                        <div className='step-title'>{step.title}</div>
                        <div className='step-description'>
                          {step.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={9}>
              {/* Step 1: Initial Configuration */}
              {currentStep === 1 && (
                <Card className='form-section'>
                  <div className='form-section-header'>
                    <h5 className='form-section-title'>
                      <span className='material-icons'>settings</span>
                      Configuración Inicial
                    </h5>
                  </div>
                  <div className='form-section-body'>
                    <Row className='g-4'>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='fw-semibold'>
                            Banco *
                          </Form.Label>
                          <Form.Select
                            value={formData.bank}
                            onChange={e => {
                              handleInputChange('bank', e.target.value);
                              handleInputChange('bankAccount', ''); // Reset account when bank changes
                            }}
                            className={formData.bank ? 'is-valid' : ''}
                          >
                            <option value=''>Selecciona un banco</option>
                            <option value='banco-chile'>Banco de Chile</option>
                            <option value='banco-santander'>
                              Banco Santander
                            </option>
                            <option value='banco-estado'>Banco Estado</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='fw-semibold'>
                            Cuenta Bancaria *
                          </Form.Label>
                          <Form.Select
                            value={formData.bankAccount}
                            onChange={e =>
                              handleInputChange('bankAccount', e.target.value)
                            }
                            disabled={!formData.bank}
                            className={formData.bankAccount ? 'is-valid' : ''}
                          >
                            <option value=''>Selecciona una cuenta</option>
                            {formData.bank &&
                              bankAccounts[
                                formData.bank as keyof typeof bankAccounts
                              ]?.map(account => (
                                <option
                                  key={account.value}
                                  value={account.value}
                                >
                                  {account.label}
                                </option>
                              ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className='fw-semibold'>
                            Período *
                          </Form.Label>
                          <Form.Control
                            type='month'
                            value={formData.period}
                            onChange={e =>
                              handleInputChange('period', e.target.value)
                            }
                            className={formData.period ? 'is-valid' : ''}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className='fw-semibold'>
                            Fecha Inicio *
                          </Form.Label>
                          <Form.Control
                            type='date'
                            value={formData.startDate}
                            onChange={e =>
                              handleInputChange('startDate', e.target.value)
                            }
                            className={formData.startDate ? 'is-valid' : ''}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className='fw-semibold'>
                            Fecha Fin *
                          </Form.Label>
                          <Form.Control
                            type='date'
                            value={formData.endDate}
                            onChange={e =>
                              handleInputChange('endDate', e.target.value)
                            }
                            className={formData.endDate ? 'is-valid' : ''}
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
                      <span className='material-icons'>cloud_upload</span>
                      Carga de Estado Bancario
                    </h5>
                  </div>
                  <div className='form-section-body'>
                    {!formData.uploadedFile ? (
                      <div
                        className='file-upload-area'
                        onDrop={handleFileDrop}
                        onDragOver={e => e.preventDefault()}
                        onClick={() =>
                          document.getElementById('fileInput')?.click()
                        }
                      >
                        <div className='file-upload-icon'>
                          <span className='material-icons'>cloud_upload</span>
                        </div>
                        <div className='file-upload-text'>
                          Arrastra y suelta tu archivo aquí
                        </div>
                        <div className='file-upload-hint'>
                          o haz clic para seleccionar (Excel, CSV - máx. 5MB)
                        </div>
                        <input
                          id='fileInput'
                          type='file'
                          accept='.xlsx,.xls,.csv'
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                      </div>
                    ) : (
                      <div className='uploaded-files'>
                        <div className='file-item'>
                          <div className='file-info'>
                            <div className='file-icon'>
                              <span className='material-icons'>
                                description
                              </span>
                            </div>
                            <div className='file-details'>
                              <div className='file-name'>
                                {formData.uploadedFile.name}
                              </div>
                              <div className='file-size'>
                                {formatFileSize(formData.uploadedFile.size)}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant='outline-danger'
                            size='sm'
                            onClick={() =>
                              handleInputChange('uploadedFile', null)
                            }
                          >
                            <span className='material-icons'>delete</span>
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className='mt-4'>
                      <Alert
                        variant='info'
                        className='d-flex align-items-center'
                      >
                        <span className='material-icons me-2'>info</span>
                        <div>
                          <strong>Formato requerido:</strong> El archivo debe
                          contener columnas para Fecha, Descripción, Referencia
                          y Monto.
                          <div className='mt-2'>
                            <Button variant='link' size='sm' className='p-0'>
                              <span className='material-icons me-1'>
                                download
                              </span>
                              Descargar plantilla de ejemplo
                            </Button>
                          </div>
                        </div>
                      </Alert>
                    </div>
                  </div>
                </Card>
              )}

              {/* Step 3: Processing */}
              {currentStep === 3 && (
                <Card className='form-section'>
                  <div className='form-section-header'>
                    <h5 className='form-section-title'>
                      <span className='material-icons'>analytics</span>
                      Procesamiento de Datos
                    </h5>
                  </div>
                  <div className='form-section-body'>
                    {!processing && !showResults && (
                      <div className='text-center p-5'>
                        <div className='mb-4'>
                          <span
                            className='material-icons text-primary'
                            style={{ fontSize: '4rem' }}
                          >
                            play_circle
                          </span>
                        </div>
                        <h5>Listo para procesar</h5>
                        <p className='text-muted'>
                          Se analizarán las transacciones del archivo cargado y
                          se buscarán coincidencias automáticamente.
                        </p>
                        <Button
                          variant='primary'
                          size='lg'
                          onClick={processFiles}
                        >
                          <span className='material-icons me-2'>
                            play_arrow
                          </span>
                          Iniciar Procesamiento
                        </Button>
                      </div>
                    )}

                    {processing && (
                      <div className='text-center p-5'>
                        <Spinner
                          animation='border'
                          variant='primary'
                          size='sm'
                          className='mb-3'
                        />
                        <h5>Procesando archivo...</h5>
                        <p className='text-muted'>
                          Analizando transacciones y buscando coincidencias
                          automáticas
                        </p>
                        <ProgressBar
                          animated
                          variant='primary'
                          now={75}
                          className='mt-3'
                          style={{ height: '8px' }}
                        />
                      </div>
                    )}

                    {showResults && (
                      <div>
                        <Alert
                          variant='success'
                          className='d-flex align-items-center mb-4'
                        >
                          <span className='material-icons me-2'>
                            check_circle
                          </span>
                          <div>
                            <strong>Procesamiento completado</strong>
                            <br />
                            Se encontraron {
                              matchingSummary.matchedTransactions
                            }{' '}
                            coincidencias automáticas de{' '}
                            {matchingSummary.totalTransactions} transacciones.
                          </div>
                        </Alert>

                        <div className='summary-cards mb-4'>
                          <div className='summary-card'>
                            <div className='summary-card-icon'>
                              <span className='material-icons'>list</span>
                            </div>
                            <div className='summary-card-number'>
                              {matchingSummary.totalTransactions}
                            </div>
                            <div className='summary-card-label'>
                              Total Transacciones
                            </div>
                            <div className='summary-card-description'>
                              Procesadas del archivo
                            </div>
                          </div>
                          <div className='summary-card'>
                            <div className='summary-card-icon'>
                              <span className='material-icons'>
                                check_circle
                              </span>
                            </div>
                            <div className='summary-card-number'>
                              {matchingSummary.matchedTransactions}
                            </div>
                            <div className='summary-card-label'>
                              Coincidencias
                            </div>
                            <div className='summary-card-description'>
                              Automáticas encontradas
                            </div>
                          </div>
                          <div className='summary-card'>
                            <div className='summary-card-icon'>
                              <span className='material-icons'>error</span>
                            </div>
                            <div className='summary-card-number'>
                              {matchingSummary.unmatchedTransactions}
                            </div>
                            <div className='summary-card-label'>
                              Sin Coincidencias
                            </div>
                            <div className='summary-card-description'>
                              Requieren revisión manual
                            </div>
                          </div>
                          <div className='summary-card'>
                            <div className='summary-card-icon'>
                              <span className='material-icons'>savings</span>
                            </div>
                            <div className='summary-card-number'>
                              {formatCurrency(matchingSummary.totalAmount)}
                            </div>
                            <div className='summary-card-label'>
                              Monto Total
                            </div>
                            <div className='summary-card-description'>
                              Suma de transacciones
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Step 4: Review and Adjustments */}
              {currentStep === 4 && (
                <Card className='form-section'>
                  <div className='form-section-header'>
                    <h5 className='form-section-title'>
                      <span className='material-icons'>fact_check</span>
                      Revisión y Ajustes
                    </h5>
                  </div>
                  <div className='form-section-body'>
                    <div className='matching-results'>
                      <div className='conciliations-table'>
                        <div className='table-header'>
                          <h5 className='table-title'>
                            <span className='material-icons'>view_list</span>
                            Transacciones Procesadas ({bankTransactions.length})
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
                <div className='d-flex gap-2'>
                  {currentStep < processSteps.length ? (
                    <Button
                      variant='primary'
                      onClick={nextStep}
                      disabled={!canProceedToNextStep()}
                    >
                      Siguiente
                      <span className='material-icons ms-2'>arrow_forward</span>
                    </Button>
                  ) : (
                    <>
                      <Button variant='outline-secondary'>
                        <span className='material-icons me-2'>save</span>
                        Guardar Borrador
                      </Button>
                      <Button variant='success'>
                        <span className='material-icons me-2'>
                          check_circle
                        </span>
                        Completar Conciliación
                      </Button>
                    </>
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
