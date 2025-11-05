import {
  EdificioFilters,
  ESTADOS_EDIFICIO,
  TIPOS_EDIFICIO,
} from '@/types/edificios';

interface EdificioFiltersProps {
  filters: EdificioFilters;
  onFilterChange: (key: keyof EdificioFilters, value: string) => void;
  onClear: () => void;
  loading?: boolean;
}

export default function EdificiosFilters({
  filters,
  onFilterChange,
  onClear,
  loading = false,
}: EdificioFiltersProps) {
  return (
    <div className='filter-container'>
      <div className='row g-3'>
        <div className='col-md-4'>
          <div className='search-icon-container'>
            <i className='material-icons search-icon'>search</i>
            <input
              type='text'
              className='form-control search-input'
              placeholder='Buscar edificios...'
              value={filters.busqueda || ''}
              onChange={e => onFilterChange('busqueda', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <div className='col-md-2'>
          <select
            className='form-select'
            value={filters.estado || ''}
            onChange={e => onFilterChange('estado', e.target.value)}
            disabled={loading}
          >
            <option value=''>Todos los estados</option>
            {ESTADOS_EDIFICIO.map(estado => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>
        <div className='col-md-2'>
          <select
            className='form-select'
            value={filters.tipo || ''}
            onChange={e => onFilterChange('tipo', e.target.value)}
            disabled={loading}
          >
            <option value=''>Todos los tipos</option>
            {TIPOS_EDIFICIO.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
        <div className='col-md-2'>
          <input
            type='date'
            className='form-control'
            placeholder='Fecha desde'
            value={filters.fechaDesde || ''}
            onChange={e => onFilterChange('fechaDesde', e.target.value)}
            disabled={loading}
          />
        </div>
        <div className='col-md-2'>
          <button
            className='btn btn-outline-secondary w-100'
            onClick={onClear}
            disabled={loading}
          >
            {loading ? (
              <div className='spinner-border spinner-border-sm' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            ) : (
              <>
                <i className='material-icons me-1'>clear</i>
                Limpiar
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .filter-container {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 1rem;
        }

        .search-icon-container {
          position: relative;
        }

        .search-icon {
          position: absolute;
          top: 50%;
          left: 10px;
          transform: translateY(-50%);
          color: #6c757d;
          font-size: 20px;
          z-index: 10;
        }

        .search-input {
          padding-left: 40px;
        }
      `}</style>
    </div>
  );
}
