import React, { useState, useEffect, useRef } from 'react';
import { usePersonas } from '@/hooks/usePersonas';
import { UnidadAutocomplete as UnidadAutocompleteType } from '@/types/personas';

interface UnidadAutocompleteProps {
  value?: UnidadAutocompleteType | null;
  onChange: (unidad: UnidadAutocompleteType | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const UnidadAutocomplete: React.FC<UnidadAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Buscar unidad...',
  disabled = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<UnidadAutocompleteType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { autocompletarUnidades } = usePersonas();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Buscar unidades cuando cambia el término de búsqueda
  useEffect(() => {
    const searchUnits = async () => {
      if (searchTerm.length >= 2) {
        setIsLoading(true);
        try {
          const results = await autocompletarUnidades(searchTerm);
          setSuggestions(results);
          setIsOpen(true);
        } catch (error) {
          console.error('Error buscando unidades:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    };

    const debounceTimer = setTimeout(searchUnits, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, autocompletarUnidades]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Actualizar el input cuando cambia el valor
  useEffect(() => {
    if (value) {
      setSearchTerm(`${value.nombre} - ${value.edificio} (${value.comunidad})`);
    } else {
      setSearchTerm('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    // Si el usuario borra el input, limpiar la selección
    if (!newValue.trim()) {
      onChange(null);
    }
  };

  const handleSelectUnit = (unidad: UnidadAutocompleteType) => {
    onChange(unidad);
    setSearchTerm(`${unidad.nombre} - ${unidad.edificio} (${unidad.comunidad})`);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange(null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`position-relative ${className}`} ref={dropdownRef}>
      <div className='input-group'>
        <input
          ref={inputRef}
          type='text'
          className='form-control'
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
          disabled={disabled}
          autoComplete='off'
        />
        {value && (
          <button
            type='button'
            className='btn btn-outline-secondary'
            onClick={handleClear}
            disabled={disabled}
            title='Limpiar selección'
          >
            <i className='material-icons' style={{ fontSize: '16px' }}>clear</i>
          </button>
        )}
        <button
          type='button'
          className='btn btn-outline-secondary'
          onClick={() => inputRef.current?.focus()}
          disabled={disabled}
          title='Buscar unidades'
        >
          <i className='material-icons' style={{ fontSize: '16px' }}>search</i>
        </button>
      </div>

      {isOpen && (
        <div className='position-absolute top-100 start-0 w-100 bg-white border rounded shadow-sm z-index-1050'
             style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1050 }}>
          {isLoading ? (
            <div className='p-3 text-center'>
              <div className='spinner-border spinner-border-sm text-primary me-2' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              Buscando unidades...
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((unidad) => (
              <div
                key={unidad.id}
                className='p-2 border-bottom cursor-pointer hover-bg-light'
                onClick={() => handleSelectUnit(unidad)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.classList.add('bg-light')}
                onMouseLeave={(e) => e.currentTarget.classList.remove('bg-light')}
              >
                <div className='fw-medium'>{unidad.nombre}</div>
                <div className='small text-muted'>
                  {unidad.edificio} • {unidad.comunidad}
                  {!unidad.disponible && (
                    <span className='badge bg-warning ms-2'>Ocupada</span>
                  )}
                </div>
              </div>
            ))
          ) : searchTerm.length >= 2 ? (
            <div className='p-3 text-center text-muted'>
              No se encontraron unidades
            </div>
          ) : (
            <div className='p-3 text-center text-muted'>
              Escribe al menos 2 caracteres para buscar
            </div>
          )}
        </div>
      )}
    </div>
  );
};