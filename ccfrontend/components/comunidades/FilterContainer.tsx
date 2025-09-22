import React from 'react';
import { ComunidadFiltros, TipoComunidad, EstadoComunidad } from '@/types/comunidades';

interface FilterContainerProps {
  filtros: ComunidadFiltros;
  onFiltrosChange: (filtros: ComunidadFiltros) => void;
  totalResultados: number;
}

const FilterContainer: React.FC<FilterContainerProps> = ({
  filtros,
  onFiltrosChange,
  totalResultados
}) => {
  const handleInputChange = (field: keyof ComunidadFiltros, value: string) => {
    onFiltrosChange({
      ...filtros,
      [field]: value
    });
  };

  const limpiarFiltros = () => {
    onFiltrosChange({
      busqueda: '',
      tipo: '',
      estado: '',
      administrador: '',
      ordenarPor: 'nombre',
      orden: 'asc'
    });
  };

  const tienesFiltrosActivos = Object.values(filtros).some(value => value !== '');

  return (
    <div className="filter-container mb-4">
      <div className="row align-items-center">
        {/* Búsqueda */}
        <div className="col-md-4 mb-3 mb-md-0">
          <div className="search-icon-container">
            <span className="material-icons search-icon">search</span>
            <input
              type="text"
              className="form-control search-input"
              placeholder="Buscar por nombre o dirección..."
              value={filtros.busqueda}
              onChange={(e) => handleInputChange('busqueda', e.target.value)}
            />
          </div>
        </div>
        
        {/* Filtro por tipo */}
        <div className="col-md-2 mb-3 mb-md-0">
          <select
            className="form-select"
            value={filtros.tipo}
            onChange={(e) => handleInputChange('tipo', e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {Object.values(TipoComunidad).map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
        
        {/* Filtro por estado */}
        <div className="col-md-2 mb-3 mb-md-0">
          <select
            className="form-select"
            value={filtros.estado}
            onChange={(e) => handleInputChange('estado', e.target.value)}
          >
            <option value="">Todos los estados</option>
            {Object.values(EstadoComunidad).map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>
        
        {/* Filtro por administrador */}
        <div className="col-md-2 mb-3 mb-md-0">
          <input
            type="text"
            className="form-control"
            placeholder="Administrador..."
            value={filtros.administrador}
            onChange={(e) => handleInputChange('administrador', e.target.value)}
          />
        </div>
        
        {/* Botón limpiar filtros */}
        <div className="col-md-2">
          <div className="d-flex gap-2">
            {tienesFiltrosActivos && (
              <button
                className="btn btn-outline-secondary"
                onClick={limpiarFiltros}
                title="Limpiar filtros"
              >
                <span className="material-icons">clear</span>
              </button>
            )}
            
            {/* Contador de resultados */}
            <div className="d-flex align-items-center">
              <small className="text-muted fw-medium">
                <span className="material-icons me-1" style={{ fontSize: '16px' }}>filter_list</span>
                {totalResultados} {totalResultados === 1 ? 'comunidad' : 'comunidades'}
                {tienesFiltrosActivos ? ' encontradas' : ' totales'}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros activos */}
      {tienesFiltrosActivos && (
        <div className="mt-3">
          <div className="d-flex align-items-center flex-wrap">
            <span className="text-muted me-2 small">Filtros activos:</span>
            
            {filtros.busqueda && (
              <span className="badge bg-light text-dark me-2 mb-1">
                Búsqueda: "{filtros.busqueda}"
                <button 
                  className="btn-close btn-close-sm ms-1"
                  onClick={() => handleInputChange('busqueda', '')}
                  aria-label="Remover filtro de búsqueda"
                ></button>
              </span>
            )}
            
            {filtros.tipo && (
              <span className="badge bg-light text-dark me-2 mb-1">
                Tipo: {filtros.tipo}
                <button 
                  className="btn-close btn-close-sm ms-1"
                  onClick={() => handleInputChange('tipo', '')}
                  aria-label="Remover filtro de tipo"
                ></button>
              </span>
            )}
            
            {filtros.estado && (
              <span className="badge bg-light text-dark me-2 mb-1">
                Estado: {filtros.estado}
                <button 
                  className="btn-close btn-close-sm ms-1"
                  onClick={() => handleInputChange('estado', '')}
                  aria-label="Remover filtro de estado"
                ></button>
              </span>
            )}
            
            {filtros.administrador && (
              <span className="badge bg-light text-dark me-2 mb-1">
                Admin: "{filtros.administrador}"
                <button 
                  className="btn-close btn-close-sm ms-1"
                  onClick={() => handleInputChange('administrador', '')}
                  aria-label="Remover filtro de administrador"
                ></button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterContainer;