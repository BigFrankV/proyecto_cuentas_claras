import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { GASTO_ESTADOS, CATEGORIA_TIPOS, type CategoriaGasto } from '../../types/gastos';
import type { GastoFilters } from '../../lib/gastosService';

interface Props {
  filters: GastoFilters;
  onFiltersChange: (filters: Partial<GastoFilters>) => void;
  categorias: CategoriaGasto[];
  loading?: boolean;
}

const GastosFiltros: React.FC<Props> = ({ 
  filters, 
  onFiltersChange, 
  categorias, 
  loading = false 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Sincronizar filtros locales con los props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof GastoFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange({ [key]: value });
  };

  const clearFilters = () => {
    const clearedFilters = {
      busqueda: '',
      estado: '',
      categoria: undefined,
      fechaDesde: '',
      fechaHasta: '',
      ordenar: 'fecha',
      direccion: 'DESC' as const
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = !!(
    localFilters.busqueda ||
    localFilters.estado ||
    localFilters.categoria ||
    localFilters.fechaDesde ||
    localFilters.fechaHasta
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
      {/* Búsqueda principal */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por número, glosa o categoría..."
            value={localFilters.busqueda || ''}
            onChange={(e) => handleFilterChange('busqueda', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`
            flex items-center gap-2 px-4 py-2 border rounded-md transition-colors
            ${showAdvanced 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }
          `}
          disabled={loading}
        >
          <FunnelIcon className="h-5 w-5" />
          Filtros
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="h-5 w-5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={localFilters.estado || ''}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Todos los estados</option>
              {Object.entries(GASTO_ESTADOS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={localFilters.categoria || ''}
              onChange={(e) => handleFilterChange('categoria', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha desde
            </label>
            <input
              type="date"
              value={localFilters.fechaDesde || ''}
              onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Fecha hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha hasta
            </label>
            <input
              type="date"
              value={localFilters.fechaHasta || ''}
              onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* Ordenamiento */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-600">Ordenar por:</span>
        <select
          value={localFilters.ordenar || 'fecha'}
          onChange={(e) => handleFilterChange('ordenar', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        >
          <option value="fecha">Fecha</option>
          <option value="monto">Monto</option>
          <option value="numero">Número</option>
          <option value="created_at">Fecha de creación</option>
        </select>
        
        <select
          value={localFilters.direccion || 'DESC'}
          onChange={(e) => handleFilterChange('direccion', e.target.value as 'ASC' | 'DESC')}
          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        >
          <option value="DESC">Descendente</option>
          <option value="ASC">Ascendente</option>
        </select>
      </div>
    </div>
  );
};

export default GastosFiltros;