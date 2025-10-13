import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDate } from '../../lib/utils';
import GastoEstadoBadge from '../ui/GastoEstadoBadge';
import type { Gasto } from '../../types/gastos';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAprobar: (gastoId: number, observaciones?: string) => Promise<boolean>;
  onRechazar: (gastoId: number, observaciones: string) => Promise<boolean>;
  gasto: Gasto | null;
  loading?: boolean;
}

const GastoAprobacionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAprobar,
  onRechazar,
  gasto,
  loading = false
}) => {
  const [accion, setAccion] = useState<'aprobar' | 'rechazar' | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gasto || !accion) return;

    if (accion === 'rechazar' && !observaciones.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      let success = false;
      
      if (accion === 'aprobar') {
        success = await onAprobar(gasto.id, observaciones.trim() || undefined);
      } else {
        success = await onRechazar(gasto.id, observaciones.trim());
      }

      if (success) {
        handleClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setAccion(null);
    setObservaciones('');
    onClose();
  };

  if (!gasto) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Aprobar o Rechazar Gasto
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={submitting}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Información del gasto */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{gasto.numero}</h4>
                      <p className="text-sm text-gray-600">{formatDate(gasto.fecha)}</p>
                    </div>
                    <GastoEstadoBadge estado={gasto.estado} size="sm" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monto:</span>
                      <span className="font-medium">{formatCurrency(gasto.monto)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Categoría:</span>
                      <span className="text-sm">{gasto.categoria_nombre}</span>
                    </div>
                    {gasto.extraordinario && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tipo:</span>
                        <span className="text-sm text-orange-600 font-medium">Extraordinario</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700">{gasto.glosa}</p>
                  </div>
                </div>

                {/* Selección de acción */}
                {!accion && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      ¿Qué acción deseas realizar con este gasto?
                    </p>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setAccion('aprobar')}
                        disabled={submitting || loading}
                        className="flex-1 flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Aprobar
                      </button>
                      
                      <button
                        onClick={() => setAccion('rechazar')}
                        disabled={submitting || loading}
                        className="flex-1 flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        <XMarkIcon className="h-5 w-5 mr-2" />
                        Rechazar
                      </button>
                    </div>
                  </div>
                )}

                {/* Formulario de observaciones */}
                {accion && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observaciones {accion === 'rechazar' && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        required={accion === 'rechazar'}
                        rows={4}
                        maxLength={500}
                        disabled={submitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder={
                          accion === 'aprobar' 
                            ? 'Observaciones adicionales (opcional)...'
                            : 'Explica el motivo del rechazo...'
                        }
                      />
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {observaciones.length}/500
                      </div>
                      
                      {accion === 'rechazar' && (
                        <p className="text-xs text-red-600 mt-1">
                          Las observaciones son obligatorias para rechazar un gasto
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setAccion(null)}
                        disabled={submitting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        Volver
                      </button>
                      
                      <button
                        type="submit"
                        disabled={
                          submitting || 
                          (accion === 'rechazar' && !observaciones.trim())
                        }
                        className={`
                          px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                          ${accion === 'aprobar'
                            ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                            : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                          }
                        `}
                      >
                        {submitting 
                          ? 'Procesando...' 
                          : accion === 'aprobar' 
                            ? 'Confirmar Aprobación' 
                            : 'Confirmar Rechazo'
                        }
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GastoAprobacionModal;