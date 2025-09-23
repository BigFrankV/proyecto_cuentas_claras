import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  XMarkIcon, 
  CalendarDaysIcon,
  CurrencyDollarIcon,
  TagIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils';
import GastoEstadoBadge from '../ui/GastoEstadoBadge';
import type { Gasto } from '../../types/gastos';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  gasto: Gasto | null;
  loading?: boolean;
}

const GastoDetalleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  gasto,
  loading = false
}) => {
  if (!gasto) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Detalle del Gasto {gasto.numero}
                    </Dialog.Title>
                    <div className="mt-2 flex items-center gap-4">
                      <GastoEstadoBadge estado={gasto.estado} />
                      {gasto.extraordinario && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Extraordinario
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex">
                  {/* Información principal */}
                  <div className="flex-1 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Información básica */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                          Información Básica
                        </h4>
                        
                        <div className="flex items-center space-x-3">
                          <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Fecha</p>
                            <p className="font-medium">{formatDate(gasto.fecha)}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Monto</p>
                            <p className="font-medium text-lg">{formatCurrency(gasto.monto)}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <TagIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Categoría</p>
                            <p className="font-medium">{gasto.categoria_nombre}</p>
                            <p className="text-sm text-gray-500">{gasto.categoria_tipo}</p>
                          </div>
                        </div>

                        {gasto.centro_costo_nombre && (
                          <div>
                            <p className="text-sm text-gray-500">Centro de Costo</p>
                            <p className="font-medium">{gasto.centro_costo_nombre}</p>
                          </div>
                        )}

                        {gasto.proveedor_nombre && (
                          <div>
                            <p className="text-sm text-gray-500">Proveedor</p>
                            <p className="font-medium">{gasto.proveedor_nombre}</p>
                          </div>
                        )}
                      </div>

                      {/* Información de usuarios */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                          Información de Proceso
                        </h4>

                        <div className="flex items-center space-x-3">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Creado por</p>
                            <p className="font-medium">{gasto.creado_por_nombre}</p>
                          </div>
                        </div>

                        {gasto.aprobado_por_nombre && (
                          <div className="flex items-center space-x-3">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">
                                {gasto.estado === 'aprobado' ? 'Aprobado por' : 'Procesado por'}
                              </p>
                              <p className="font-medium">{gasto.aprobado_por_nombre}</p>
                              {gasto.fecha_aprobacion && (
                                <p className="text-sm text-gray-500">
                                  {formatDateTime(gasto.fecha_aprobacion)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-3">
                          <ClockIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Creado</p>
                            <p className="font-medium">{formatDateTime(gasto.created_at)}</p>
                          </div>
                        </div>

                        {gasto.updated_at !== gasto.created_at && (
                          <div>
                            <p className="text-sm text-gray-500">Última modificación</p>
                            <p className="font-medium">{formatDateTime(gasto.updated_at)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Glosa */}
                    <div className="mt-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                          Descripción
                        </h4>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{gasto.glosa}</p>
                      </div>
                    </div>

                    {/* Observaciones */}
                    {(gasto.observaciones_aprobacion || gasto.observaciones_rechazo) && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">
                          Observaciones
                        </h4>
                        {gasto.observaciones_aprobacion && (
                          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-3">
                            <div className="flex">
                              <div>
                                <h5 className="text-sm font-medium text-green-800">
                                  Observaciones de Aprobación
                                </h5>
                                <p className="mt-1 text-sm text-green-700">
                                  {gasto.observaciones_aprobacion}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        {gasto.observaciones_rechazo && (
                          <div className="bg-red-50 border-l-4 border-red-400 p-4">
                            <div className="flex">
                              <div>
                                <h5 className="text-sm font-medium text-red-800">
                                  Observaciones de Rechazo
                                </h5>
                                <p className="mt-1 text-sm text-red-700">
                                  {gasto.observaciones_rechazo}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Historial */}
                  <div className="w-80 bg-gray-50 border-l">
                    <div className="p-6">
                      <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">
                        Historial de Cambios
                      </h4>
                      
                      {loading ? (
                        <div className="animate-pulse space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          ))}
                        </div>
                      ) : gasto.historial && gasto.historial.length > 0 ? (
                        <div className="space-y-4">
                          {gasto.historial.map((item, index) => (
                            <div key={index} className="relative">
                              {index !== gasto.historial!.length - 1 && (
                                <div className="absolute left-2 top-6 h-full w-0.5 bg-gray-200" />
                              )}
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 capitalize">
                                    {item.accion.replace('_', ' ')}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {item.usuario_nombre}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDateTime(item.fecha)}
                                  </div>
                                  {item.observaciones && (
                                    <div className="mt-1 text-sm text-gray-600 bg-white p-2 rounded border">
                                      {item.observaciones}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No hay historial disponible</p>
                      )}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GastoDetalleModal;