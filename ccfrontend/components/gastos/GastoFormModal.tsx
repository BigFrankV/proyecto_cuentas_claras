import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { gastosService } from '../../lib/gastosService';
import type { Gasto, CategoriaGasto, GastoCreateRequest, GastoUpdateRequest } from '../../types/gastos';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gasto?: Gasto | null;
  comunidadId: number;
  categorias: CategoriaGasto[];
}

const GastoFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  gasto,
  comunidadId,
  categorias
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GastoCreateRequest>({
    categoria_id: 0,
    fecha: new Date().toISOString().split('T')[0],
    monto: 0,
    glosa: '',
    extraordinario: false
  });

  const isEdit = !!gasto;
  const title = isEdit ? 'Editar Gasto' : 'Crear Nuevo Gasto';

  // Inicializar formulario
  useEffect(() => {
    if (isEdit && gasto) {
      setFormData({
        categoria_id: gasto.categoria_id,
        centro_costo_id: gasto.centro_costo_id,
        proveedor_id: gasto.proveedor_id,
        documento_compra_id: gasto.documento_compra_id,
        fecha: gasto.fecha,
        monto: gasto.monto,
        glosa: gasto.glosa,
        extraordinario: gasto.extraordinario
      });
    } else {
      setFormData({
        categoria_id: 0,
        fecha: new Date().toISOString().split('T')[0],
        monto: 0,
        glosa: '',
        extraordinario: false
      });
    }
  }, [isEdit, gasto, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoria_id || !formData.glosa || !formData.monto) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      if (isEdit && gasto) {
        await gastosService.updateGasto(gasto.id, formData as GastoUpdateRequest);
        toast.success('Gasto actualizado exitosamente');
      } else {
        await gastosService.createGasto(comunidadId, formData);
        toast.success('Gasto creado exitosamente');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Error al guardar gasto';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof GastoCreateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Categoría */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.categoria_id}
                        onChange={(e) => handleChange('categoria_id', Number(e.target.value))}
                        required
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      >
                        <option value={0}>Selecciona una categoría</option>
                        {categorias.filter(c => c.activa).map(categoria => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.nombre} ({categoria.tipo})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fecha */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => handleChange('fecha', e.target.value)}
                        required
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    {/* Monto */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monto (CLP) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.monto || ''}
                        onChange={(e) => handleChange('monto', Number(e.target.value))}
                        required
                        min="1"
                        step="1"
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder="0"
                      />
                    </div>

                    {/* Glosa */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Glosa/Descripción <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.glosa}
                        onChange={(e) => handleChange('glosa', e.target.value)}
                        required
                        rows={3}
                        maxLength={500}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder="Describe el gasto..."
                      />
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {formData.glosa.length}/500
                      </div>
                    </div>

                    {/* Extraordinario */}
                    <div className="md:col-span-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="extraordinario"
                          checked={formData.extraordinario}
                          onChange={(e) => handleChange('extraordinario', e.target.checked)}
                          disabled={loading}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="extraordinario" className="ml-2 block text-sm text-gray-700">
                          Gasto extraordinario
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Los gastos extraordinarios requieren aprobación especial
                      </p>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !formData.categoria_id || !formData.glosa || !formData.monto}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Gasto'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GastoFormModal;