import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import multasService from '@/lib/multasService';

const ResultadoPagoPage: React.FC = () => {
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
        const response = await multasService.confirmarPago(token_ws);
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
              <Link href="/multas">
                <span className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700">
                  Ver Multas
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
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <div className="text-green-600 mb-4">
                <svg className="w-20 h-20 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-green-800 mb-3">
                ¡Pago Exitoso!
              </h1>
              <p className="text-lg text-green-700 mb-6">
                {resultado.message || 'Tu pago ha sido procesado correctamente'}
              </p>

              {resultado.data && (
                <div className="bg-white rounded-lg p-6 mb-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-4 text-center">
                    Detalles de la Transacción
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
                    {resultado.data.authorizationCode && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Código de Autorización:</span>
                        <span className="font-mono text-sm text-gray-900">
                          {resultado.data.authorizationCode}
                        </span>
                      </div>
                    )}
                    {resultado.data.amount && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Monto Pagado:</span>
                        <span className="font-semibold text-green-600">
                          {formatMonto(resultado.data.amount)}
                        </span>
                      </div>
                    )}
                    {resultado.data.multaId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID Multa:</span>
                        <span className="text-gray-900">#{resultado.data.multaId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {resultado.data?.multaId && (
                  <Link href={`/multas/${resultado.data.multaId}`}>
                    <span className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700">
                      Ver Detalle de Multa
                    </span>
                  </Link>
                )}
                <Link href="/multas">
                  <span className="inline-block px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded hover:bg-gray-300">
                    Ver Todas las Multas
                  </span>
                </Link>
              </div>

              <div className="mt-6 text-sm text-gray-600 bg-white p-4 rounded">
                <p className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  Se ha enviado la confirmación de pago a tu correo electrónico.
                </p>
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
              
            </div>
            <h1 className="text-3xl font-bold text-red-800 mb-3">
              Pago Rechazado
            </h1>
            <p className="text-lg text-red-700 mb-6">
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
              {resultado.data?.multaId && (
                <Link href={`/multas/${resultado.data.multaId}/pagar`}>
                  <span className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700">
                    Intentar Nuevamente
                  </span>
                </Link>
              )}
              <Link href="/multas">
                <span className="inline-block px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded hover:bg-gray-300">
                  Ver Multas
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
    </Layout>
  );
};

export default ResultadoPagoPage;
