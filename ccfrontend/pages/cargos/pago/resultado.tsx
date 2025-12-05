import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import cargosService from '@/lib/cargosService';

const ResultadoPagoCargoPage: React.FC = () => {
  const router = useRouter();
  const { token_ws } = router.query;

  const [loading, setLoading] = useState(true);
  const [resultado, setResultado] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    data?: any;
  } | null>(null);

  useEffect(() => {
    if (!token_ws || typeof token_ws !== 'string') {
      return;
    }

    const confirmarPago = async () => {
      try {
        setLoading(true);
        const response = await cargosService.confirmarPagoCargo(token_ws);
        setResultado(response);
      } catch (err: any) {
        const errMsg = err.response?.data?.error || 'Error al confirmar el pago';
        setResultado({
          success: false,
          error: errMsg,
        });
      } finally {
        setLoading(false);
      }
    };

    confirmarPago();
  }, [token_ws]);

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(monto);
  };

  if (loading) {
    return (
      <Layout title="Procesando pago...">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Procesando pago...
              </h2>
              <p className="text-gray-600">
                Por favor espera mientras confirmamos tu transacción.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!resultado) {
    return (
      <Layout title="Error">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-red-800 mb-2">
                No se pudo procesar el pago
              </h2>
              <p className="text-red-700 mb-6">
                No se recibió información de la transacción.
              </p>
              <Link href="/cargos">
                <span className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700">
                  Ver Cargos
                </span>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Pago exitoso
  if (resultado.success) {
    return (
      <Layout title="Pago Exitoso">
        <div className="container-fluid p-4">
          <div className="result-container">
            <div className="result-card success">
              <div className="result-icon success-icon">
                <i className="material-icons">check_circle</i>
              </div>
              <h1 className="result-title">
                ¡Pago Exitoso!
              </h1>
              <p className="result-subtitle">
                {resultado.message || 'Tu pago ha sido procesado correctamente'}
              </p>

              {resultado.data && (
                <div className="details-card">
                  <h3 className="details-title">
                    Detalles de la Transacción
                  </h3>
                  <div className="details-list">
                    {resultado.data.orderId && (
                      <div className="detail-item">
                        <span className="detail-label">Orden</span>
                        <span className="detail-value">
                          {resultado.data.orderId}
                        </span>
                      </div>
                    )}
                    {resultado.data.authorizationCode && (
                      <div className="detail-item">
                        <span className="detail-label">Código de Autorización</span>
                        <span className="detail-value">
                          {resultado.data.authorizationCode}
                        </span>
                      </div>
                    )}
                    {resultado.data.amount && (
                      <div className="detail-item">
                        <span className="detail-label">Monto Pagado</span>
                        <span className="detail-value amount-success">
                          {formatMonto(resultado.data.amount)}
                        </span>
                      </div>
                    )}
                    {resultado.data.cargoId && (
                      <div className="detail-item">
                        <span className="detail-label">ID Cargo</span>
                        <span className="detail-value">#{resultado.data.cargoId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="action-buttons">
                {resultado.data?.cargoId && (
                  <Link href={`/cargos/${resultado.data.cargoId}`}>
                    <span className="btn-primary">
                      Ver Detalle de Cargo
                    </span>
                  </Link>
                )}
                <Link href="/cargos">
                  <span className="btn-secondary">
                    Ver Todos los Cargos
                  </span>
                </Link>
              </div>

              <div className="info-box">
                <i className="material-icons">mail_outline</i>
                <span>
                  Se ha enviado la confirmación de pago a tu correo electrónico.
                </span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Pago fallido
  return (
    <Layout title="Pago Rechazado">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <div className="text-red-600 mb-4">
              <i className="material-icons result-icon-large error-icon">cancel</i>
            </div>
            <h1 className="result-title-large">
              Pago Rechazado
            </h1>
            <p className="result-subtitle-large">
              {resultado.error || 'No se pudo completar tu pago'}
            </p>

            {resultado.data && (
              <div className="bg-white rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4 text-center">
                  Información de la Transacción
                </h3>
                <div className="space-y-3">
                  {resultado.data.orderId && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Orden:</span>
                      <span className="font-mono text-sm text-gray-900">
                        {resultado.data.orderId}
                      </span>
                    </div>
                  )}
                  {resultado.data.responseCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Código de Respuesta:</span>
                      <span className="font-mono text-sm text-gray-900">
                        {resultado.data.responseCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {resultado.data?.cargoId && (
                <Link href={`/cargos/${resultado.data.cargoId}/pagar`}>
                  <span className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700">
                    Intentar Nuevamente
                  </span>
                </Link>
              )}
              <Link href="/cargos">
                <span className="inline-block px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded hover:bg-gray-300">
                  Ver Cargos
                </span>
              </Link>
            </div>

            <div className="mt-6 text-sm text-gray-600 bg-white p-4 rounded">
              <p className="mb-2">
                <strong>Posibles causas del rechazo:</strong>
              </p>
              <ul className="text-left space-y-1 ml-6">
                <li>• Fondos insuficientes en la tarjeta</li>
                <li>• Tarjeta bloqueada o vencida</li>
                <li>• Datos incorrectos ingresados</li>
                <li>• Límite de compra excedido</li>
              </ul>
              <p className="mt-3">
                Si el problema persiste, contacta con tu banco.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .result-container {
          max-width: 650px;
          margin: 0 auto;
        }

        .result-card {
          background: white;
          border-radius: 20px;
          padding: 48px 32px;
          text-center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
        }

        .result-card.success {
          border-top: 4px solid #10b981;
        }

        .result-card.error {
          border-top: 4px solid #ef4444;
        }

        .result-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .success-icon {
          background: linear-gradient(135deg, #10b98115 0%, #059669 15 100%);
        }

        .success-icon .material-icons {
          font-size: 48px;
          color: #10b981;
        }

        .error-icon {
          background: linear-gradient(135deg, #ef444415 0%, #dc262615 100%);
        }

        .error-icon .material-icons {
          font-size: 48px;
          color: #ef4444;
        }

        .result-title {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 12px 0;
          letter-spacing: -0.5px;
        }

        .result-subtitle {
          font-size: 16px;
          color: #666;
          margin: 0 0 32px 0;
          line-height: 1.5;
        }

        .result-icon-large {
          font-size: 64px !important;
          margin-bottom: 16px;
        }

        .result-title-large {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .result-subtitle-large {
          font-size: 16px;
          margin-bottom: 24px;
        }

        .details-card {
          background: #fafafa;
          border-radius: 12px;
          padding: 24px;
          margin: 32px 0;
          border: 1px solid #e0e0e0;
        }

        .details-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0 0 20px 0;
          text-align: center;
        }

        .details-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e5e5e5;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-size: 14px;
          color: #666;
        }

        .detail-value {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          font-family: 'Courier New', monospace;
        }

        .amount-success {
          color: #10b981 !important;
          font-weight: 600 !important;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin: 24px 0;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: inline-block;
          padding: 14px 28px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
        }

        .btn-secondary {
          display: inline-block;
          padding: 14px 28px;
          background: white;
          color: #666;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-weight: 500;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .btn-secondary:hover {
          border-color: #999;
          color: #333;
        }

        .info-box {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px;
          background: #f0f9ff;
          border-radius: 10px;
          margin-top: 24px;
        }

        .info-box .material-icons {
          font-size: 20px;
          color: #0369a1;
        }

        .info-box span {
          font-size: 14px;
          color: #0369a1;
        }

        @media (max-width: 640px) {
          .result-card {
            padding: 32px 24px;
          }

          .result-title {
            font-size: 24px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </Layout>
  );
};

export default ResultadoPagoCargoPage;

