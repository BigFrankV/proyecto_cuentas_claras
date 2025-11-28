import { useComunidad } from '@/lib/useComunidad';

interface ComunidadFilterProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

export default function ComunidadFilter({
  value = '',
  onChange,
  placeholder = 'Seleccionar comunidad',
  className = 'form-select',
  disabled = false,
  showAllOption = true,
  allOptionLabel = 'Todas las comunidades',
}: ComunidadFilterProps) {
  const { comunidades, loading, comunidadSeleccionada } = useComunidad();

  // Si no hay value local pero hay comunidad global, mostrar hint
  const isUsingGlobalFilter = !value && comunidadSeleccionada;

  return (
    <div className="position-relative">
      <select
        className={`${className} ${isUsingGlobalFilter ? 'border-warning' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        title={isUsingGlobalFilter ? `Filtrado por: ${comunidadSeleccionada.nombre} (filtro global)` : ''}
      >
        {showAllOption && (
          <option value="">
            {isUsingGlobalFilter 
              ? `${allOptionLabel} (usando filtro global: ${comunidadSeleccionada.nombre})` 
              : allOptionLabel
            }
          </option>
        )}
        {comunidades.map((comunidad) => (
          <option key={comunidad.id} value={comunidad.id}>
            {comunidad.nombre}
          </option>
        ))}
      </select>
      {isUsingGlobalFilter && (
        <small className="text-warning d-block mt-1">
          <i className="material-icons" style={{ fontSize: '14px', verticalAlign: 'middle' }}>info</i>
          {' '}Filtrando por: <strong>{comunidadSeleccionada.nombre}</strong> (desde filtro global)
        </small>
      )}
    </div>
  );
}