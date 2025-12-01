import Link from 'next/link';

interface PersonaFiltersProps {
  searchTerm: string;
  tipoFilter: string;
  estadoFilter: string;
  onSearchChange: (value: string) => void;
  onTipoChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
}

export default function PersonaFilters({
  searchTerm,
  tipoFilter,
  estadoFilter,
  onSearchChange,
  onTipoChange,
  onEstadoChange,
}: PersonaFiltersProps) {
  return (
    <div className='row mb-4'>
      <div className='col-12'>
        <div
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 'var(--radius)',
            padding: '1rem',
          }}
        >
          <div className='row g-2'>
            <div className='col-12 col-md-4 col-lg-3'>
              <div style={{ position: 'relative' }}>
                <i
                  className='material-icons'
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '10px',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-muted)',
                    fontSize: '20px',
                  }}
                >
                  search
                </i>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Buscar persona...'
                  style={{ paddingLeft: '35px' }}
                  value={searchTerm}
                  onChange={e => onSearchChange(e.target.value)}
                />
              </div>
            </div>
            <div className='col-12 col-md-3 col-lg-2'>
              <select
                className='form-select'
                value={tipoFilter}
                onChange={e => onTipoChange(e.target.value)}
              >
                <option value='todos'>Todos los tipos</option>
                <option value='propietarios'>Propietarios</option>
                <option value='inquilinos'>Inquilinos</option>
                <option value='administradores'>Administradores</option>
              </select>
            </div>
            <div className='col-12 col-md-3 col-lg-2'>
              <select
                className='form-select'
                value={estadoFilter}
                onChange={e => onEstadoChange(e.target.value)}
              >
                <option value='todos'>Todos los estados</option>
                <option value='activos'>Activos</option>
                <option value='inactivos'>Inactivos</option>
              </select>
            </div>
            {/* Botón de 'Nueva Persona' movido al header; se elimina aquí para evitar duplicado */}
          </div>
        </div>
      </div>
    </div>
  );
}
