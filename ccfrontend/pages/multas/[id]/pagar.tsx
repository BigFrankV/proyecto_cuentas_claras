import Image from 'next/image';
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
    if (!multa) {
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
      setError(err.response?.data?.error || 'Error al iniciar el pago');
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
      <Layout title="Cargando...">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!multa || error) {
    return (
      <Layout title="Error">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Error
              </h2>
              <p className="text-red-700 mb-4">
                {error || 'No se pudo cargar la multa'}
              </p>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout title={`Pagar Multa #${multa.numero}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-3xl mx-auto">
            {/* Encabezado */}
            <div className="mb-6">
              <button
                onClick={handleCancelar}
                className="text-gray-600 hover:text-gray-900 mb-3 flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Pagar Multa #{multa.numero}
              </h1>
              <p className="text-sm text-gray-600">
                Complete el pago de forma segura con Webpay
              </p>
            </div>

            {/* Resumen de la multa */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Resumen de la Multa
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Número:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {multa.numero}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-t">
                  <span className="text-sm text-gray-600">Motivo:</span>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-xs">
                    {multa.motivo}
                  </span>
                </div>

                {multa.descripcion && (
                  <div className="py-2 border-t">
                    <span className="text-sm text-gray-600 block mb-1">Descripción:</span>
                    <p className="text-sm text-gray-900">{multa.descripcion}</p>
                  </div>
                )}

                {multa.comunidad_nombre && (
                  <div className="flex justify-between py-2 border-t">
                    <span className="text-sm text-gray-600">Comunidad:</span>
                    <span className="text-sm text-gray-900">{multa.comunidad_nombre}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-gray-300">
                  <span className="text-base font-semibold text-gray-900">
                    Total a Pagar:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatMonto(multa.monto)}
                  </span>
                </div>
              </div>
            </div>

            {/* Formulario de pago */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Método de Pago
              </h2>

              {/* Email opcional */}
              <div className="mb-4">
                <label htmlFor="payerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email para confirmación (opcional)
                </label>
                <input
                  type="email"
                  id="payerEmail"
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={processing}
                />
              </div>

              {/* Botón de pago Webpay */}
              <div className="border border-blue-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Webpay Plus</h3>
                    <p className="text-xs text-gray-600">
                      Tarjetas de débito y crédito
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="h-8 w-20 relative flex items-center justify-end">
                      <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                        WEBPAY
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handlePagarConWebpay}
                  disabled={processing}
                  className="w-full py-3 px-4 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {processing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Redirigiendo a Webpay...
                    </span>
                  ) : (
                    `Pagar ${formatMonto(multa.monto)}`
                  )}
                </button>
              </div>

              {/* Info de seguridad */}
              <div className="mt-4 text-xs text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="flex items-start">
                  
                  <span className="leading-relaxed">
                    Pago 100% seguro. Serás redirigido a la plataforma de Webpay de Transbank para completar tu transacción de forma segura.
                  </span>
                </div>
              </div>
            </div>

            {/* Botón cancelar */}
            <div className="flex justify-center">
              <button
                onClick={handleCancelar}
                disabled={processing}
                className="px-6 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default PagarMultaPage;
