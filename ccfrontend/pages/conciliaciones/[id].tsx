import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { Button, Alert, Spinner, Table, Modal, Form } from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

interface ConciliacionDetail {
  id: string;
  period: string;
  bankAccount: string;
  bank: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'in-progress' | 'completed' | 'with-differences';
  bankBalance: number;
  bookBalance: number;
  difference: number;
  matchedTransactions: number;
  totalTransactions: number;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  notes: string;
  transactions: BankTransaction[];
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
  bookReference?: string;
  notes?: string;
}

export default function ConciliacionDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [conciliacion, setConciliacion] = useState<ConciliacionDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    if (id) {
      // Simulate API call
      setTimeout(() => {
        const mockConciliacion: ConciliacionDetail = {
          id: id as string,
          period: '2024-03',
          bankAccount: '12345678-9',
          bank: 'Banco de Chile',
          startDate: '2024-03-01',
          endDate: '2024-03-31',
          status: 'completed',
          bankBalance: 15750000,
          bookBalance: 15750000,
          difference: 0,
          matchedTransactions: 245,
          totalTransactions: 245,
          createdBy: 'María González',
          createdAt: '2024-04-01T10:30:00Z',
          completedAt: '2024-04-01T16:45:00Z',
          notes:
            'Conciliación completada sin diferencias. Todas las transacciones fueron procesadas correctamente.',
          transactions: [
            {
              id: 1,
              date: '2024-03-01',
              description: 'Transferencia recibida - Gastos Comunes Unidad 301',
              reference: 'TRF001234',
              amount: 145000,
              type: 'credit',
              matched: true,
              matchStatus: 'matched',
              bookReference: 'REC-2024-001',
              notes: 'Pago mensual gastos comunes',
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
              bookReference: 'PAG-2024-045',
              notes: 'Mantención mensual ascensores',
            },
            {
              id: 3,
              date: '2024-03-03',
              description: 'Transferencia recibida - Gastos Comunes Unidad 302',
              reference: 'TRF001235',
              amount: 145000,
              type: 'credit',
              matched: true,
              matchStatus: 'matched',
              bookReference: 'REC-2024-002',
            },
            {
              id: 4,
              date: '2024-03-05',
              description: 'Comisión bancaria',
              reference: 'COM001',
              amount: -2500,
              type: 'debit',
              matched: true,
              matchStatus: 'manual',
              bookReference: 'GAS-2024-012',
              notes: 'Comisión por mantención de cuenta',
            },
          ],
        };
        setConciliacion(mockConciliacion);
        setLoading(false);
      }, 1000);
    }
  }, [id]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { class: 'status-badge draft', text: 'Borrador', icon: 'edit' },
      'in-progress': {
        class: 'status-badge in-progress',
        text: 'En Proceso',
        icon: 'schedule',
      },
      completed: {
        class: 'status-badge completed',
        text: 'Completada',
        icon: 'check_circle',
      },
      'with-differences': {
        class: 'status-badge with-differences',
        text: 'Con Diferencias',
        icon: 'error',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={config.class}>
        <span className='material-icons'>{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const formatPeriod = (period: string) => {
    const [year = '', month = '1'] = period.split('-');
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const monthIndex = parseInt(month, 10) - 1;
    const monthName = monthNames[monthIndex] || 'Mes inválido';

    return `${monthName} ${year}`;
  };

  const getDifferenceClass = (difference: number) => {
    if (difference === 0) {
      return 'text-success';
    }
    if (difference > 0) {
      return 'text-primary';
    }
    return 'text-danger';
  };

  const getProgressPercentage = (matched: number, total: number) => {
    return total > 0 ? Math.round((matched / total) * 100) : 0;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Cargando...'>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ minHeight: '400px' }}
          >
            <div className='text-center'>
              <Spinner animation='border' variant='primary' />
              <div className='mt-3'>Cargando conciliación...</div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!conciliacion) {
    return (
      <ProtectedRoute>
        <Layout title='Conciliación no encontrada'>
          <div className='text-center py-5'>
            <span
              className='material-icons text-muted'
              style={{ fontSize: '4rem' }}
            >
              error
            </span>
            <h4 className='mt-3'>Conciliación no encontrada</h4>
            <Button
              variant='primary'
              onClick={() => router.push('/conciliaciones')}
            >
              Volver al listado
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>
          Conciliación {formatPeriod(conciliacion.period)} — Cuentas Claras
        </title>
      </Head>

      <Layout title={`Conciliación ${formatPeriod(conciliacion.period)}`}>
        <div className='container-fluid p-4'>
          {/* Header */}
          <div className='conciliations-header'>
            <div className='d-flex justify-content-between align-items-start'>
              <div>
                <h1 className='conciliations-title'>
                  Conciliación {formatPeriod(conciliacion.period)}
                </h1>
                <p className='conciliations-subtitle'>
                  {conciliacion.bank} - Cuenta {conciliacion.bankAccount}
                </p>
                <div className='header-stats'>
                  <div className='stat-item'>
                    <div className='stat-number'>
                      {conciliacion.totalTransactions}
                    </div>
                    <div className='stat-label'>Transacciones</div>
                  </div>
                  <div className='stat-item'>
                    <div className='stat-number'>
                      {conciliacion.matchedTransactions}
                    </div>
                    <div className='stat-label'>Coincidencias</div>
                  </div>
                  <div className='stat-item'>
                    <div className='stat-number'>
                      {getProgressPercentage(
                        conciliacion.matchedTransactions,
                        conciliacion.totalTransactions,
                      )}
                      %
                    </div>
                    <div className='stat-label'>Progreso</div>
                  </div>
                  <div className='stat-item'>
                    <div className='stat-number'>
                      {formatCurrency(Math.abs(conciliacion.difference))}
                    </div>
                    <div className='stat-label'>Diferencia</div>
                  </div>
                </div>
              </div>
              <div className='d-flex gap-2'>
                <Button variant='outline-light' onClick={() => router.back()}>
                  <span className='material-icons me-2'>arrow_back</span>
                  Volver
                </Button>
                <Button
                  variant='light'
                  onClick={() => router.push(`/conciliaciones/editar/${id}`)}
                >
                  <span className='material-icons me-2'>edit</span>
                  Editar
                </Button>
                <Button variant='outline-light'>
                  <span className='material-icons me-2'>download</span>
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          {/* Status Alert */}
          {conciliacion.status === 'with-differences' && (
            <Alert variant='warning' className='d-flex align-items-center mb-4'>
              <span className='material-icons me-2'>warning</span>
              <div>
                <strong>Atención:</strong> Esta conciliación tiene diferencias
                que requieren revisión.
                <div className='mt-1'>
                  <Button variant='link' size='sm' className='p-0'>
                    Ver diferencias no resueltas
                  </Button>
                </div>
              </div>
            </Alert>
          )}

          {/* Summary Cards */}
          <div className='summary-cards'>
            <div className='summary-card'>
              <div className='summary-card-icon'>
                <span className='material-icons'>account_balance</span>
              </div>
              <div className='summary-card-number'>
                {formatCurrency(conciliacion.bankBalance)}
              </div>
              <div className='summary-card-label'>Saldo Bancario</div>
              <div className='summary-card-description'>
                Al {new Date(conciliacion.endDate).toLocaleDateString('es-CL')}
              </div>
            </div>
            <div className='summary-card'>
              <div className='summary-card-icon'>
                <span className='material-icons'>book</span>
              </div>
              <div className='summary-card-number'>
                {formatCurrency(conciliacion.bookBalance)}
              </div>
              <div className='summary-card-label'>Saldo Contable</div>
              <div className='summary-card-description'>
                Según registros internos
              </div>
            </div>
            <div className='summary-card'>
              <div className='summary-card-icon'>
                <span className='material-icons'>
                  {conciliacion.difference === 0 ? 'check_circle' : 'error'}
                </span>
              </div>
              <div
                className={`summary-card-number ${conciliacion.difference === 0 ? 'zero' : conciliacion.difference > 0 ? 'positive' : 'negative'}`}
              >
                {conciliacion.difference === 0
                  ? '$ 0'
                  : formatCurrency(conciliacion.difference)}
              </div>
              <div className='summary-card-label'>Diferencia</div>
              <div className='summary-card-description'>
                {conciliacion.difference === 0
                  ? 'Conciliación exacta'
                  : 'Requiere ajuste'}
              </div>
            </div>
            <div className='summary-card'>
              <div className='summary-card-icon'>
                <span className='material-icons'>timeline</span>
              </div>
              <div className='summary-card-number'>
                {getStatusBadge(conciliacion.status)}
              </div>
              <div className='summary-card-label'>Estado Actual</div>
              <div className='summary-card-description'>
                {conciliacion.completedAt
                  ? `Completada ${new Date(conciliacion.completedAt).toLocaleDateString('es-CL')}`
                  : `Creada ${new Date(conciliacion.createdAt).toLocaleDateString('es-CL')}`}
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className='conciliations-table'>
            <div className='table-header'>
              <nav className='nav nav-tabs'>
                <button
                  className={`nav-link ${activeTab === 'resumen' ? 'active' : ''}`}
                  onClick={() => setActiveTab('resumen')}
                >
                  <span className='material-icons me-2'>summarize</span>
                  Resumen
                </button>
                <button
                  className={`nav-link ${activeTab === 'transacciones' ? 'active' : ''}`}
                  onClick={() => setActiveTab('transacciones')}
                >
                  <span className='material-icons me-2'>list</span>
                  Transacciones ({conciliacion.totalTransactions})
                </button>
                <button
                  className={`nav-link ${activeTab === 'diferencias' ? 'active' : ''}`}
                  onClick={() => setActiveTab('diferencias')}
                >
                  <span className='material-icons me-2'>error</span>
                  Diferencias
                </button>
                <button
                  className={`nav-link ${activeTab === 'historial' ? 'active' : ''}`}
                  onClick={() => setActiveTab('historial')}
                >
                  <span className='material-icons me-2'>history</span>
                  Historial
                </button>
              </nav>
            </div>
            <div className='p-4'>
              {/* Tab Resumen */}
              {activeTab === 'resumen' && (
                <div className='row'>
                  <div className='col-lg-8'>
                    <h5 className='mb-3'>Información General</h5>
                    <Table borderless>
                      <tbody>
                        <tr>
                          <td
                            className='fw-semibold'
                            style={{ width: '150px' }}
                          >
                            Período:
                          </td>
                          <td>{formatPeriod(conciliacion.period)}</td>
                        </tr>
                        <tr>
                          <td className='fw-semibold'>Banco:</td>
                          <td>{conciliacion.bank}</td>
                        </tr>
                        <tr>
                          <td className='fw-semibold'>Cuenta:</td>
                          <td>{conciliacion.bankAccount}</td>
                        </tr>
                        <tr>
                          <td className='fw-semibold'>Fecha Inicio:</td>
                          <td>
                            {new Date(
                              conciliacion.startDate,
                            ).toLocaleDateString('es-CL')}
                          </td>
                        </tr>
                        <tr>
                          <td className='fw-semibold'>Fecha Fin:</td>
                          <td>
                            {new Date(conciliacion.endDate).toLocaleDateString(
                              'es-CL',
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className='fw-semibold'>Creado por:</td>
                          <td>{conciliacion.createdBy}</td>
                        </tr>
                        <tr>
                          <td className='fw-semibold'>Fecha Creación:</td>
                          <td>
                            {new Date(conciliacion.createdAt).toLocaleString(
                              'es-CL',
                            )}
                          </td>
                        </tr>
                        {conciliacion.completedAt && (
                          <tr>
                            <td className='fw-semibold'>Fecha Finalización:</td>
                            <td>
                              {new Date(
                                conciliacion.completedAt,
                              ).toLocaleString('es-CL')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                  <div className='col-lg-4'>
                    <h5 className='mb-3'>Notas</h5>
                    <div className='bg-light p-3 rounded'>
                      <p className='mb-2'>{conciliacion.notes}</p>
                      <Button
                        variant='outline-primary'
                        size='sm'
                        onClick={() => setShowNotesModal(true)}
                      >
                        <span className='material-icons me-1'>edit</span>
                        Editar Notas
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Transacciones */}
              {activeTab === 'transacciones' && (
                <div>
                  <div className='d-flex justify-content-between align-items-center mb-3'>
                    <h5>Transacciones Procesadas</h5>
                    <div className='d-flex gap-2'>
                      <Form.Select size='sm' style={{ width: 'auto' }}>
                        <option value=''>Todos los estados</option>
                        <option value='matched'>Coincidentes</option>
                        <option value='unmatched'>Sin coincidencia</option>
                        <option value='manual'>Manuales</option>
                      </Form.Select>
                      <Button variant='outline-secondary' size='sm'>
                        <span className='material-icons me-1'>filter_list</span>
                        Filtros
                      </Button>
                    </div>
                  </div>

                  <div className='conciliations-table'>
                    <div className='table-responsive'>
                      <Table hover className='custom-table mb-0'>
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Descripción</th>
                            <th>Referencia</th>
                            <th>Monto</th>
                            <th>Estado</th>
                            <th>Ref. Contable</th>
                            <th>Notas</th>
                            <th className='text-center'>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {conciliacion.transactions.map(transaction => (
                            <tr key={transaction.id}>
                              <td>
                                {new Date(transaction.date).toLocaleDateString(
                                  'es-CL',
                                )}
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
                                  className={`fw-bold ${transaction.amount >= 0 ? 'text-success' : 'text-danger'}`}
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
                              <td>
                                <small className='text-muted'>
                                  {transaction.bookReference || '-'}
                                </small>
                              </td>
                              <td>
                                <small className='text-muted'>
                                  {transaction.notes || '-'}
                                </small>
                              </td>
                              <td className='text-center'>
                                <Button variant='outline-secondary' size='sm'>
                                  <span className='material-icons'>
                                    visibility
                                  </span>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Diferencias */}
              {activeTab === 'diferencias' && (
                <div>
                  {conciliacion.difference === 0 ? (
                    <div className='text-center py-5'>
                      <span
                        className='material-icons text-success'
                        style={{ fontSize: '4rem' }}
                      >
                        check_circle
                      </span>
                      <h4 className='mt-3 text-success'>
                        ¡Conciliación Exacta!
                      </h4>
                      <p className='text-muted'>
                        No se encontraron diferencias entre el saldo bancario y
                        contable.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Alert
                        variant='warning'
                        className='d-flex align-items-center'
                      >
                        <span className='material-icons me-2'>warning</span>
                        <div>
                          <strong>Diferencia encontrada:</strong>{' '}
                          {formatCurrency(conciliacion.difference)}
                          <div className='mt-1'>
                            Esta diferencia debe ser investigada y resuelta.
                          </div>
                        </div>
                      </Alert>
                      {/* Aquí irían las transacciones no coincidentes */}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Historial */}
              {activeTab === 'historial' && (
                <div>
                  <h5 className='mb-3'>Historial de Cambios</h5>
                  <div className='timeline'>
                    <div className='timeline-item'>
                      <div className='timeline-icon bg-success'>
                        <span className='material-icons'>check_circle</span>
                      </div>
                      <div className='timeline-content'>
                        <div className='fw-semibold'>
                          Conciliación completada
                        </div>
                        <div className='text-muted small'>
                          {conciliacion.completedAt &&
                            new Date(conciliacion.completedAt).toLocaleString(
                              'es-CL',
                            )}{' '}
                          por {conciliacion.createdBy}
                        </div>
                      </div>
                    </div>
                    <div className='timeline-item'>
                      <div className='timeline-icon bg-primary'>
                        <span className='material-icons'>upload</span>
                      </div>
                      <div className='timeline-content'>
                        <div className='fw-semibold'>Archivo procesado</div>
                        <div className='text-muted small'>
                          Se procesaron {conciliacion.totalTransactions}{' '}
                          transacciones
                        </div>
                      </div>
                    </div>
                    <div className='timeline-item'>
                      <div className='timeline-icon bg-info'>
                        <span className='material-icons'>add</span>
                      </div>
                      <div className='timeline-content'>
                        <div className='fw-semibold'>Conciliación creada</div>
                        <div className='text-muted small'>
                          {new Date(conciliacion.createdAt).toLocaleString(
                            'es-CL',
                          )}{' '}
                          por {conciliacion.createdBy}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          size='lg'
        >
          <Modal.Header closeButton>
            <Modal.Title>Editar Conciliación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Funcionalidad de edición en desarrollo...</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button variant='primary'>Guardar Cambios</Button>
          </Modal.Footer>
        </Modal>

        {/* Notes Modal */}
        <Modal show={showNotesModal} onHide={() => setShowNotesModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Notas</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Notas de la conciliación</Form.Label>
              <Form.Control
                as='textarea'
                rows={4}
                defaultValue={conciliacion.notes}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='secondary'
              onClick={() => setShowNotesModal(false)}
            >
              Cancelar
            </Button>
            <Button variant='primary'>Guardar Notas</Button>
          </Modal.Footer>
        </Modal>
      </Layout>
    </ProtectedRoute>
  );
}
