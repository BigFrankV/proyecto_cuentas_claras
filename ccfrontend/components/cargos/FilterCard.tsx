import React, { useState } from 'react';

export interface FilterOptions {
  searchTerm: string;
  status: string;
  type: string;
  dateFrom: string;
  dateTo: string;
  unitNumber: string;
  amountMin: string;
  amountMax: string;
}

export interface FilterCardProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  className?: string;
}

export default function FilterCard({ 
  filters, 
  onFiltersChange, 
  onApplyFilters, 
  onClearFilters,
  className = '' 
}: FilterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (field: keyof FilterOptions, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <div className={`filters-card ${className}`}>
      <div className="filters-header">
        <h5 className="filters-title">
          <i className="material-icons">filter_list</i>
          Filtros de Búsqueda
        </h5>
        <button 
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <i className="material-icons">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </i>
        </button>
      </div>
      
      <div className={`filters-content ${isExpanded ? 'show' : ''}`}>
        {/* Search Bar */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="position-relative search-bar">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Buscar por concepto, unidad o descripción..."
                value={filters.searchTerm}
                onChange={(e) => handleInputChange('searchTerm', e.target.value)}
              />
              <i className="material-icons search-icon">search</i>
            </div>
          </div>
        </div>

        <div className="filters-grid">
          {/* Status Filter */}
          <div className="mb-3">
            <label className="form-label">Estado</label>
            <select 
              className="form-select"
              value={filters.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
              <option value="paid">Pagado</option>
              <option value="partial">Parcial</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="mb-3">
            <label className="form-label">Tipo</label>
            <select 
              className="form-select"
              value={filters.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="administration">Administración</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="service">Servicios</option>
              <option value="insurance">Seguros</option>
              <option value="other">Otros</option>
            </select>
          </div>

          {/* Unit Number */}
          <div className="mb-3">
            <label className="form-label">Unidad</label>
            <input
              type="text"
              className="form-control"
              placeholder="Número de unidad"
              value={filters.unitNumber}
              onChange={(e) => handleInputChange('unitNumber', e.target.value)}
            />
          </div>

          {/* Date From */}
          <div className="mb-3">
            <label className="form-label">Fecha Desde</label>
            <input
              type="date"
              className="form-control"
              value={filters.dateFrom}
              onChange={(e) => handleInputChange('dateFrom', e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="mb-3">
            <label className="form-label">Fecha Hasta</label>
            <input
              type="date"
              className="form-control"
              value={filters.dateTo}
              onChange={(e) => handleInputChange('dateTo', e.target.value)}
            />
          </div>

          {/* Amount Min */}
          <div className="mb-3">
            <label className="form-label">Monto Mínimo</label>
            <input
              type="number"
              className="form-control"
              placeholder="$ 0"
              value={filters.amountMin}
              onChange={(e) => handleInputChange('amountMin', e.target.value)}
            />
          </div>

          {/* Amount Max */}
          <div className="mb-3">
            <label className="form-label">Monto Máximo</label>
            <input
              type="number"
              className="form-control"
              placeholder="$ 999,999,999"
              value={filters.amountMax}
              onChange={(e) => handleInputChange('amountMax', e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-3">
          <button 
            className="btn btn-primary"
            onClick={onApplyFilters}
          >
            <i className="material-icons me-2">search</i>
            Aplicar Filtros
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={onClearFilters}
          >
            <i className="material-icons me-2">clear</i>
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}