import { useState, useEffect } from 'react';

interface UnidadFiltersProps {
  filters: {
    comunidad: string;
    edificio: string;
    torre: string;
    estado: string;
    tipo: string;
  };
  onFilterChange: (filterName: string, value: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
}

interface Comunidad {
  id: string;
  nombre: string;
}

interface Edificio {
  id: string;
  nombre: string;
  comunidadId: string;
}

interface Torre {
  id: string;
  nombre: string;
  edificioId: string;
}

const comunidades: Comunidad[] = [
  { id: '1', nombre: 'Las Palmas' },
  { id: '2', nombre: 'Edificio Central' },
  { id: '3', nombre: 'Jardines del Este' }
];

const edificios: Edificio[] = [
  { id: '1', nombre: 'Torre Central', comunidadId: '2' },
  { id: '2', nombre: 'Edificio Norte', comunidadId: '1' },
  { id: '3', nombre: 'Jardines del Este', comunidadId: '3' }
];

const torres: Torre[] = [
  { id: '1', nombre: 'Torre A', edificioId: '2' },
  { id: '2', nombre: 'Torre B', edificioId: '1' },
  { id: '3', nombre: 'Torre C', edificioId: '3' }
];

const UnidadFilters: React.FC<UnidadFiltersProps> = ({
  filters,
  onFilterChange,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange
}) => {
  // Filtrar edificios según comunidad seleccionada
  const availableEdificios = edificios.filter(edificio => 
    !filters.comunidad || edificio.comunidadId === filters.comunidad
  );

  // Filtrar torres según edificio seleccionado
  const availableTorres = torres.filter(torre => 
    !filters.edificio || torre.edificioId === filters.edificio
  );

  return (
    <div 
      className='p-3 mb-4'
      style={{ 
        backgroundColor: '#f8f9fa', 
        borderRadius: 'var(--radius)'
      }}
    >
      <div className='row g-3'>
        <div className='col-md-3'>
          <label htmlFor='comunidadFilter' className='form-label small'>Comunidad</label>
          <select 
            className='form-select form-select-sm' 
            id='comunidadFilter'
            value={filters.comunidad}
            onChange={(e) => onFilterChange('comunidad', e.target.value)}
          >
            <option value=''>Todas las comunidades</option>
            {comunidades.map(comunidad => (
              <option key={comunidad.id} value={comunidad.id}>{comunidad.nombre}</option>
            ))}
          </select>
        </div>
        <div className='col-md-3'>
          <label htmlFor='edificioFilter' className='form-label small'>Edificio</label>
          <select 
            className='form-select form-select-sm' 
            id='edificioFilter'
            value={filters.edificio}
            onChange={(e) => onFilterChange('edificio', e.target.value)}
            disabled={!filters.comunidad}
          >
            <option value=''>Todos los edificios</option>
            {availableEdificios.map(edificio => (
              <option key={edificio.id} value={edificio.id}>{edificio.nombre}</option>
            ))}
          </select>
        </div>
        <div className='col-md-2'>
          <label htmlFor='torreFilter' className='form-label small'>Torre</label>
          <select 
            className='form-select form-select-sm' 
            id='torreFilter'
            value={filters.torre}
            onChange={(e) => onFilterChange('torre', e.target.value)}
            disabled={!filters.edificio}
          >
            <option value=''>Todas las torres</option>
            {availableTorres.map(torre => (
              <option key={torre.id} value={torre.id}>{torre.nombre}</option>
            ))}
          </select>
        </div>
        <div className='col-md-2'>
          <label htmlFor='estadoFilter' className='form-label small'>Estado</label>
          <select 
            className='form-select form-select-sm' 
            id='estadoFilter'
            value={filters.estado}
            onChange={(e) => onFilterChange('estado', e.target.value)}
          >
            <option value=''>Todos los estados</option>
            <option value='Activa'>Activa</option>
            <option value='Inactiva'>Inactiva</option>
            <option value='Mantenimiento'>Mantenimiento</option>
          </select>
        </div>
        <div className='col-md-2'>
          <label htmlFor='tipoFilter' className='form-label small'>Tipo</label>
          <select 
            className='form-select form-select-sm' 
            id='tipoFilter'
            value={filters.tipo}
            onChange={(e) => onFilterChange('tipo', e.target.value)}
          >
            <option value=''>Todos los tipos</option>
            <option value='Departamento'>Departamento</option>
            <option value='Casa'>Casa</option>
            <option value='Local'>Local</option>
            <option value='Oficina'>Oficina</option>
          </select>
        </div>
      </div>
      
      <div className='row g-3 mt-2'>
        <div className='col-md-6'>
          <div className='position-relative'>
            <i 
              className='material-icons position-absolute' 
              style={{ 
                top: '50%', 
                left: '10px', 
                transform: 'translateY(-50%)', 
                color: '#6c757d',
                fontSize: '20px'
              }}
            >
              search
            </i>
            <input 
              type='text' 
              className='form-control form-control-sm' 
              placeholder='Buscar por número, propietario o residente...' 
              style={{ paddingLeft: '35px' }}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <div className='col-md-6 d-flex justify-content-end align-items-end'>
          <div className='btn-group' role='group'>
            <button 
              type='button' 
              className={`btn btn-outline-secondary btn-sm ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewModeChange('table')}
            >
              <i className='material-icons'>view_list</i>
            </button>
            <button 
              type='button' 
              className={`btn btn-outline-secondary btn-sm ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => onViewModeChange('cards')}
            >
              <i className='material-icons'>view_module</i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnidadFilters;