import React, { useState} from 'react';
import {
  Alert,
  Card,
  Form,
  Button,
  Modal,
  Spinner,
  Badge,
} from 'react-bootstrap';

interface PaymentGateway {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  processingTime: string;
}

interface PaymentComponentProps {
  communityId: number;
  unitId?: number;
  amount: number;
  description: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({
  communityId,
  unitId,
  amount,
  description,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [payerEmail, setPayerEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState<string>('');
  const [transactionStatus, setTransactionStatus] = useState<
    'pending' | 'success' | 'error' | null
  >(null);

  const gateways: PaymentGateway[] = [
    {
      id: 'webpay',
      name: 'Webpay Plus',
      description: 'Tarjetas de crédito y débito (Transbank)',
      icon: <i className='material-icons'>credit_card</i>,
      enabled: true,
      processingTime: 'Inmediato',
    },
    {
      id: 'khipu',
      name: 'Khipu',
      description: 'Transferencia bancaria',
      icon: <i className='material-icons'>account_balance</i>,
      enabled: true,
      processingTime: '1-2 días hábiles',
    },
    {
      id: 'mercadopago',
      name: 'MercadoPago',
      description: 'Múltiples métodos de pago',
      icon: <i className='material-icons'>payment</i>,
      enabled: true,
      processingTime: 'Inmediato',
    },
  ];

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const validateForm = (): boolean => {
    if (!selectedGateway) {
      setError('Debe seleccionar un método de pago');
      return false;
    }

    if (payerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail)) {
      setError('Email no válido');
      return false;
    }

    if (amount < 100) {
      setError('Monto mínimo es $100');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/gateway/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          communityId,
          unitId,
          amount,
          gateway: selectedGateway,
          description,
          payerEmail: payerEmail || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el pago');
      }

      // Redirigir a la pasarela de pago
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        // Para métodos que no requieren redirección inmediata
        setTransactionStatus('pending');
        pollTransactionStatus(data.orderId);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setProcessing(false);
      onError?.(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const pollTransactionStatus = async (orderId: string) => {
    const maxAttempts = 30; // 5 minutos con polling cada 10 segundos
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/gateway/transaction/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await response.json();

        if (data.success && data.transaction) {
          const status = data.transaction.status;

          if (status === 'approved') {
            setTransactionStatus('success');
            setProcessing(false);
            onSuccess?.(data.transaction.orderId);
            return;
          } else if (
            status === 'rejected' ||
            status === 'cancelled' ||
            status === 'expired'
          ) {
            setTransactionStatus('error');
            setProcessing(false);
            setError('El pago fue rechazado o cancelado');
            onError?.('El pago fue rechazado o cancelado');
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Verificar cada 10 segundos
        } else {
          setTransactionStatus('error');
          setProcessing(false);
          setError('Tiempo de espera agotado');
          onError?.('Tiempo de espera agotado');
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error polling transaction status:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        }
      }
    };

    poll();
  };

  const getStatusBadge = () => {
    switch (transactionStatus) {
      case 'pending':
        return (
          <Badge bg='warning'>
            <i className='material-icons me-1' style={{ fontSize: '14px' }}>
              schedule
            </i>
            Procesando...
          </Badge>
        );
      case 'success':
        return (
          <Badge bg='success'>
            <i className='material-icons me-1' style={{ fontSize: '14px' }}>
              check_circle
            </i>
            Exitoso
          </Badge>
        );
      case 'error':
        return (
          <Badge bg='danger'>
            <i className='material-icons me-1' style={{ fontSize: '14px' }}>
              error
            </i>
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  if (processing) {
    return (
      <Card>
        <Card.Body className='text-center p-5'>
          <Spinner animation='border' variant='primary' className='mb-3' />
          <h5>Procesando pago...</h5>
          <p className='text-muted'>
            {transactionStatus === 'pending'
              ? 'Verificando el estado de la transacción...'
              : 'Redirigiendo a la pasarela de pago...'}
          </p>
          {getStatusBadge()}
        </Card.Body>
      </Card>
    );
  }

  if (transactionStatus === 'success') {
    return (
      <Card className='border-success'>
        <Card.Body className='text-center p-5'>
          <i
            className='material-icons text-success mb-3'
            style={{ fontSize: '64px' }}
          >
            check_circle
          </i>
          <h4 className='text-success'>¡Pago exitoso!</h4>
          <p className='text-muted'>Su pago ha sido procesado correctamente.</p>
          <p>
            <strong>{formatCurrency(amount)}</strong>
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Card.Header>
          <h5 className='mb-0'>Realizar Pago</h5>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant='danger' dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <div className='mb-4'>
            <h6>Resumen del pago</h6>
            <div className='bg-light p-3 rounded'>
              <div className='d-flex justify-content-between'>
                <span>Descripción:</span>
                <strong>{description}</strong>
              </div>
              <div className='d-flex justify-content-between'>
                <span>Monto:</span>
                <strong className='text-primary'>
                  {formatCurrency(amount)}
                </strong>
              </div>
            </div>
          </div>

          <Form>
            <Form.Group className='mb-4'>
              <Form.Label>Método de pago</Form.Label>
              {gateways.map(gateway => (
                <div key={gateway.id} className='mb-2'>
                  <Form.Check
                    type='radio'
                    id={gateway.id}
                    name='gateway'
                    value={gateway.id}
                    disabled={!gateway.enabled}
                    checked={selectedGateway === gateway.id}
                    onChange={e => setSelectedGateway(e.target.value)}
                    label={
                      <div className='d-flex align-items-center'>
                        <div className='me-3'>{gateway.icon}</div>
                        <div className='flex-grow-1'>
                          <div className='fw-semibold'>{gateway.name}</div>
                          <small className='text-muted'>
                            {gateway.description}
                          </small>
                        </div>
                        <div className='text-end'>
                          <small className='text-muted'>
                            {gateway.processingTime}
                          </small>
                        </div>
                      </div>
                    }
                  />
                </div>
              ))}
            </Form.Group>

            <Form.Group className='mb-4'>
              <Form.Label>Email (opcional)</Form.Label>
              <Form.Control
                type='email'
                placeholder='su@email.com'
                value={payerEmail}
                onChange={e => setPayerEmail(e.target.value)}
              />
              <Form.Text className='text-muted'>
                Para recibir confirmación del pago
              </Form.Text>
            </Form.Group>

            <div className='d-grid gap-2'>
              <Button
                variant='primary'
                size='lg'
                disabled={!selectedGateway || loading}
                onClick={() => setShowConfirmModal(true)}
              >
                {loading ? (
                  <>
                    <Spinner animation='border' size='sm' className='me-2' />
                    Procesando...
                  </>
                ) : (
                  `Pagar ${formatCurrency(amount)}`
                )}
              </Button>

              {onCancel && (
                <Button variant='outline-secondary' onClick={onCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Modal de confirmación */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='text-center'>
            <h5>¿Confirma el pago de {formatCurrency(amount)}?</h5>
            <p className='text-muted mt-3'>{description}</p>

            {selectedGateway && (
              <div className='mt-3'>
                <p>
                  <strong>Método de pago:</strong>{' '}
                  {gateways.find(g => g.id === selectedGateway)?.name}
                </p>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='secondary'
            onClick={() => setShowConfirmModal(false)}
          >
            Cancelar
          </Button>
          <Button
            variant='primary'
            onClick={() => {
              setShowConfirmModal(false);
              handlePayment();
            }}
          >
            Confirmar Pago
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PaymentComponent;
