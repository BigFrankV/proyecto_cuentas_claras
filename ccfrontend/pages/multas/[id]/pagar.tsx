import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import multasService from '@/lib/multasService';
import { ProtectedRoute } from '@/lib/useAuth';

interface MultaData {
  id: number;
  numero: string;
  motivo: string;
  descripcion?: string;
  monto: number;
  estado: string;
  fecha: string;
  comunidad_nombre?: string;
  unidad_nombre?: string;
}

const PagarMultaPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [multa, setMulta] = useState<MultaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payerEmail, setPayerEmail] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }
    
    const loadMulta = async () => {
      try {
        setLoading(true);
        const res = await multasService.getMulta(Number(id));
        setMulta(res);
        
        // Validar que la multa esté pendiente
        if (res.estado !== 'pendiente') {
          const estadoMsg = res.estado;
          setError(`Esta multa está en estado ${estadoMsg}. Solo se pueden pagar multas pendientes.`);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al cargar la multa');
      } finally {
        setLoading(false);
      }
    };

    loadMulta();
  }, [id]);

  const handlePagarConWebpay = async () => {
    if (!multa || processing) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Llamar al endpoint de iniciar pago
      const response = await multasService.iniciarPago(multa.id, {
        gateway: 'webpay',
        payerEmail: payerEmail || undefined,
      });

      // Crear formulario para enviar POST a Webpay con el token
      if (response.paymentUrl && response.token) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = response.paymentUrl;

        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'token_ws';
        tokenInput.value = response.token;

        form.appendChild(tokenInput);
        document.body.appendChild(form);
        form.submit();
      } else {
        throw new Error('No se recibió URL de pago o token');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al iniciar el pago';
      
      // Detectar error de transacción duplicada
      if (errorMsg.includes('Duplicate entry') || errorMsg.includes('uk_order_id')) {
        setError(
          'Ya existe un pago en progreso para esta multa. Por favor, espera o contacta al soporte.',
        );
      } else {
        setError(errorMsg);
      }
      
      setProcessing(false);
    }
  };

  const handleCancelar = () => {
    router.push(`/multas/${id}`);
  };

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(monto);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="Cargando...">
          <div className="container-fluid p-4">
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando multa...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!multa || error) {
    return (
      <ProtectedRoute>
        <Layout title="Error">
          <div className="container-fluid p-4">
            <div className="max-width-container">
              <div className="alert alert-danger" role="alert">
                <h5 className="alert-heading">Error</h5>
                <p className="mb-0">
                  {error || 'No se pudo cargar la multa'}
                </p>
              </div>
              <button
                onClick={() => router.back()}
                className="btn btn-outline-secondary"
              >
                <i className="material-icons me-2">arrow_back</i>
                Volver
              </button>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout title={`Pagar Multa #${multa.numero}`}>
        <div className="container-fluid p-4">
          <div className="max-width-container">
            {/* Encabezado */}
            <div className="d-flex align-items-center mb-4">
              <button
                onClick={handleCancelar}
                className="btn btn-link text-decoration-none me-3"
              >
                <i className="material-icons">arrow_back</i>
              </button>
              <div>
                <h1 className="h4 mb-1">Pagar Multa #{multa.numero}</h1>
                <p className="text-muted small mb-0">
                  Complete el pago de forma segura con Webpay
                </p>
              </div>
            </div>

            {/* Resumen de la multa */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <h5 className="card-title mb-0">Resumen de la Multa</h5>
              </div>
              <div className="card-body">
                <dl className="row">
                  <dt className="col-sm-3">Número:</dt>
                  <dd className="col-sm-9 fw-bold">{multa.numero}</dd>

                  <dt className="col-sm-3 border-top pt-2">Motivo:</dt>
                  <dd className="col-sm-9 border-top pt-2">{multa.motivo}</dd>

                  {multa.descripcion && (
                    <>
                      <dt className="col-sm-3 border-top pt-2">Descripción:</dt>
                      <dd className="col-sm-9 border-top pt-2">
                        {multa.descripcion}
                      </dd>
                    </>
                  )}

                  {multa.comunidad_nombre && (
                    <>
                      <dt className="col-sm-3 border-top pt-2">Comunidad:</dt>
                      <dd className="col-sm-9 border-top pt-2">
                        {multa.comunidad_nombre}
                      </dd>
                    </>
                  )}

                  {multa.unidad_nombre && (
                    <>
                      <dt className="col-sm-3 border-top pt-2">Unidad:</dt>
                      <dd className="col-sm-9 border-top pt-2">
                        {multa.unidad_nombre}
                      </dd>
                    </>
                  )}
                </dl>

                <div className="border-top pt-3 mt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Total a Pagar:</span>
                    <span className="h4 text-primary mb-0">
                      {formatMonto(multa.monto)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de pago */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <h5 className="card-title mb-0">Método de Pago</h5>
              </div>
              <div className="card-body">
                {/* Email opcional */}
                <div className="mb-3">
                  <label htmlFor="payerEmail" className="form-label">
                    Email para confirmación (opcional)
                  </label>
                  <input
                    type="email"
                    id="payerEmail"
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="form-control"
                    disabled={processing}
                  />
                  <small className="text-muted">
                    Te enviaremos un comprobante del pago a este correo
                  </small>
                </div>

                {/* Opción de pago Webpay */}
                <div className="border rounded-3 p-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 className="mb-1">Webpay Plus</h6>
                      <small className="text-muted">
                        Tarjetas de débito y crédito
                      </small>
                    </div>
                    <span className="badge bg-info">WEBPAY</span>
                  </div>
                  <button
                    onClick={handlePagarConWebpay}
                    disabled={processing}
                    className="btn btn-primary w-100"
                  >
                    {processing ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Redirigiendo a Webpay...
                      </>
                    ) : (
                      <>
                        <i className="material-icons me-2">payment</i>
                        Pagar {formatMonto(multa.monto)}
                      </>
                    )}
                  </button>
                </div>

                {/* Info de seguridad */}
                <div className="alert alert-info mt-3 mb-0" role="alert">
                  <div className="d-flex">
                    <i className="material-icons me-2 flex-shrink-0">
                      security
                    </i>
                    <div className="small">
                      Pago 100% seguro. Serás redirigido a la plataforma de
                      Webpay de Transbank para completar tu transacción de forma
                      segura.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="d-flex gap-2 justify-content-center">
              <button
                onClick={handleCancelar}
                disabled={processing}
                className="btn btn-outline-secondary"
              >
                <i className="material-icons me-2">close</i>
                Cancelar
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .max-width-container {
            max-width: 800px;
            margin: 0 auto;
          }

          .card {
            border: 1px solid #e0e0e0;
          }

          .card-header {
            background-color: #f8f9fa !important;
          }

          dl {
            margin-bottom: 0;
          }

          dd {
            margin-bottom: 0;
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
};

export default PagarMultaPage;
