import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import cargosService from '@/lib/cargosService';
import { ProtectedRoute } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';

interface CargoData {
  id: number;
  concepto: string;
  descripcion?: string;
  tipo: string;
  monto: number;
  saldo: number;
  estado: string;
  fechaVencimiento: Date;
  unidad: string;
  nombreComunidad?: string;
  periodo?: string;
}

const PagarCargoPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [cargo, setCargo] = useState<CargoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payerEmail, setPayerEmail] = useState('');

  const { comunidadSeleccionada } = useComunidad();

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadCargo = async () => {
      try {
        setLoading(true);
        const res = await cargosService.getCargoById(Number(id));
        setCargo(res);
        
        // Validar que el cargo tenga saldo pendiente
        if (res.saldo <= 0) {
          setError('Este cargo no tiene saldo pendiente de pago.');
        } else if (res.estado === 'pagado') {
          setError('Este cargo ya está pagado.');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al cargar el cargo');
      } finally {
        setLoading(false);
      }
    };

    // limpiar errores y recargar cuando cambia la comunidad seleccionada
    setError(null);
    loadCargo();
  }, [id, comunidadSeleccionada]);

  const handlePagarConWebpay = async () => {
    if (!cargo || processing) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Llamar al endpoint de iniciar pago
      const response = await cargosService.iniciarPagoCargo(cargo.id, {
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
          'Ya existe un pago en progreso para este cargo. Por favor, espera o contacta al soporte.',
        );
      } else {
        setError(errorMsg);
      }
      
      setProcessing(false);
    }
  };

  const handleCancelar = () => {
    router.push(`/cargos/${id}`);
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
              <p className="mt-2">Cargando cargo...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!cargo || error) {
    return (
      <ProtectedRoute>
        <Layout title="Error">
          <div className="container-fluid p-4">
            <div className="max-width-container">
              <div className="alert alert-danger" role="alert">
                <h5 className="alert-heading">Error</h5>
                <p className="mb-0">
                  {error || 'No se pudo cargar el cargo'}
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
      <Layout title={`Pagar Cargo - ${cargo.concepto}`}>
        <div className="container-fluid p-4">
          <div className="max-width-container">
            {/* Encabezado elegante */}
            <div className="payment-header mb-4">
              <button
                onClick={handleCancelar}
                className="btn-back"
              >
                <i className="material-icons">arrow_back</i>
              </button>
              <div className="header-content">
                <div className="header-icon">
                  <i className="material-icons">account_balance_wallet</i>
                </div>
                <div>
                  <h1 className="header-title">Confirmación de Pago</h1>
                  <p className="header-subtitle">
                    Revisa los detalles antes de continuar
                  </p>
                </div>
              </div>
            </div>

            {/* Resumen del cargo */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <h5 className="card-title mb-0">Resumen del Cargo</h5>
              </div>
              <div className="card-body">
                <dl className="row">
                  <dt className="col-sm-3">Concepto:</dt>
                  <dd className="col-sm-9 fw-bold">{cargo.concepto}</dd>

                  {cargo.descripcion && (
                    <>
                      <dt className="col-sm-3 border-top pt-2">Descripción:</dt>
                      <dd className="col-sm-9 border-top pt-2">
                        {cargo.descripcion}
                      </dd>
                    </>
                  )}

                  <dt className="col-sm-3 border-top pt-2">Tipo:</dt>
                  <dd className="col-sm-9 border-top pt-2">
                    {cargo.tipo === 'gastos_comunes' ? 'Gastos Comunes' : 
                     cargo.tipo === 'fondo_reserva' ? 'Fondo de Reserva' :
                     cargo.tipo === 'cuota_extraordinaria' ? 'Cuota Extraordinaria' :
                     cargo.tipo}
                  </dd>

                  {cargo.periodo && (
                    <>
                      <dt className="col-sm-3 border-top pt-2">Período:</dt>
                      <dd className="col-sm-9 border-top pt-2">
                        {cargo.periodo}
                      </dd>
                    </>
                  )}

                  <dt className="col-sm-3 border-top pt-2">Unidad:</dt>
                  <dd className="col-sm-9 border-top pt-2">{cargo.unidad}</dd>

                  {cargo.nombreComunidad && (
                    <>
                      <dt className="col-sm-3 border-top pt-2">Comunidad:</dt>
                      <dd className="col-sm-9 border-top pt-2">
                        {cargo.nombreComunidad}
                      </dd>
                    </>
                  )}

                  <dt className="col-sm-3 border-top pt-2">Fecha Vencimiento:</dt>
                  <dd className="col-sm-9 border-top pt-2">
                    {new Date(cargo.fechaVencimiento).toLocaleDateString('es-CL')}
                  </dd>

                  <dt className="col-sm-3 border-top pt-2">Monto Total:</dt>
                  <dd className="col-sm-9 border-top pt-2">
                    {formatMonto(cargo.monto)}
                  </dd>

                  {cargo.saldo < cargo.monto && (
                    <>
                      <dt className="col-sm-3 border-top pt-2">Pagado:</dt>
                      <dd className="col-sm-9 border-top pt-2 text-success">
                        {formatMonto(cargo.monto - cargo.saldo)}
                      </dd>
                    </>
                  )}
                </dl>

                <div className="border-top pt-3 mt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Saldo Pendiente:</span>
                    <span className="h4 text-primary mb-0">
                      {formatMonto(cargo.saldo)}
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
                        Pagar {formatMonto(cargo.saldo)}
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

export default PagarCargoPage;
