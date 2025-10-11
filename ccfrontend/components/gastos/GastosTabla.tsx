import React from 'react';
import { 
  EyeIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon, 
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import GastoEstadoBadge from '../ui/GastoEstadoBadge';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { Gasto } from '../../types/gastos';

interface Props {
  gastos: Gasto[];
  loading?: boolean;
  onView: (gasto: Gasto) => void;
  onEdit: (gasto: Gasto) => void;
  onAprobar: (gasto: Gasto) => void;
  onRechazar: (gasto: Gasto) => void;
  onEliminar: (gasto: Gasto) => void;
  userRole?: string;
}

const GastosTabla: React.FC<Props> = ({
  gastos,
  loading = false,
  onView,
  onEdit,
  onAprobar,
  onRechazar,
  onEliminar,
  userRole = 'residente'
}) => {
  const canApprove = ['admin', 'comite'].includes(userRole);
  const canEdit = ['admin', 'contador'].includes(userRole);
  const canDelete = userRole === 'admin';

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="animate-pulse p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!gastos.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z"/>
              <polyline points="13,2 13,9 20,9"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay gastos registrados
          </h3>
          <p className="text-gray-500">
            Comienza creando tu primer gasto para la comunidad.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Glosa
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gastos.map((gasto) => (
              <tr key={gasto.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {gasto.numero}
                    </div>
                    {gasto.extraordinario && (
                      <ArrowUpIcon className="ml-2 h-4 w-4 text-orange-500" title="Extraordinario" />
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(gasto.fecha)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {gasto.categoria_nombre}
                  </div>
                  <div className="text-sm text-gray-500">
                    {gasto.categoria_tipo}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={gasto.glosa}>
                    {gasto.glosa}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(gasto.monto)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <GastoEstadoBadge estado={gasto.estado} />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center space-x-2">
                    {/* Ver */}
                    <button
                      onClick={() => onView(gasto)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>

                    {/* Editar - solo borradores */}
                    {canEdit && gasto.estado === 'borrador' && (
                      <button
                        onClick={() => onEdit(gasto)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}

                    {/* Aprobar */}
                    {canApprove && ['borrador', 'pendiente_aprobacion'].includes(gasto.estado) && (
                      <button
                        onClick={() => onAprobar(gasto)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Aprobar"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}

                    {/* Rechazar */}
                    {canApprove && ['borrador', 'pendiente_aprobacion'].includes(gasto.estado) && (
                      <button
                        onClick={() => onRechazar(gasto)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Rechazar"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}

                    {/* Eliminar - solo borradores */}
                    {canDelete && gasto.estado === 'borrador' && (
                      <button
                        onClick={() => onEliminar(gasto)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GastosTabla;