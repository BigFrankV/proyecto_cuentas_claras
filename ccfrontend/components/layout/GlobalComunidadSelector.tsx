import { useComunidad } from '@/lib/useComunidad';

export default function GlobalComunidadSelector() {
  const { comunidadSeleccionada, seleccionarComunidad, comunidades, loading } = useComunidad();

  if (loading) {
    return (
      <div className="global-comunidad-selector mb-3">
        <div className="selector-container">
          <span className="material-icons selector-icon">location_on</span>
          <div className="selector-loading">
            <div className="spinner-border spinner-border-sm text-light" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay comunidades, no mostrar nada
  if (!comunidades || comunidades.length === 0) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    // eslint-disable-next-line no-console
    console.log('🔄 Cambiando comunidad a:', value);
    
    if (value === 'todas') {
      // eslint-disable-next-line no-console
      console.log('✅ Seleccionando TODAS las comunidades (null)');
      seleccionarComunidad(null);
    } else {
      const comunidad = comunidades.find(c => c.id === value);
      if (comunidad) {
        // eslint-disable-next-line no-console
        console.log('✅ Seleccionando comunidad:', comunidad);
        seleccionarComunidad(comunidad);
      } else {
        // eslint-disable-next-line no-console
        console.warn('⚠️ Comunidad no encontrada:', value);
      }
    }
  };

  return (
    <>
      <div className="global-comunidad-selector mb-3">
        <div className="selector-container">
          <span className="material-icons selector-icon">location_on</span>
          <select
            className="form-select selector-input"
            value={comunidadSeleccionada?.id || 'todas'}
            onChange={handleChange}
            aria-label="Seleccionar comunidad"
          >
            <option value="todas">📍 Todas mis comunidades</option>
            {comunidades.map(comunidad => (
              <option key={comunidad.id} value={comunidad.id}>
                {comunidad.nombre}
                {comunidad.rol && ` (${comunidad.rol})`}
              </option>
            ))}
          </select>
        </div>

        {/* Indicador visual de comunidad activa */}
        {comunidadSeleccionada && (
          <div className="comunidad-badge mt-2">
            <span className="badge bg-light text-dark w-100 text-start">
              <span className="material-icons" style={{ fontSize: '14px', verticalAlign: 'middle' }}>
                check_circle
              </span>
              {' '}
              <small>{comunidadSeleccionada.nombre}</small>
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        .global-comunidad-selector {
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .selector-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .selector-icon {
          color: var(--color-accent, #fd5d14);
          font-size: 20px;
          flex-shrink: 0;
        }

        .selector-input {
          flex: 1;
          font-size: 0.875rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .selector-input:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .selector-input:focus {
          background: rgba(255, 255, 255, 0.2);
          border-color: var(--color-accent, #fd5d14);
          outline: none;
          box-shadow: 0 0 0 2px rgba(253, 93, 20, 0.2);
          color: #fff;
        }

        .selector-input option {
          background: #1a1a1a;
          color: #fff;
          padding: 0.5rem;
        }

        .selector-loading {
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 0.375rem;
        }

        .comunidad-badge {
          padding-left: 26px; /* Alinear con el texto del select */
        }

        .comunidad-badge .badge {
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .comunidad-badge .material-icons {
          color: var(--color-success, #28a745);
        }

        /* Responsive */
        @media (max-width: 991.98px) {
          .global-comunidad-selector {
            margin: 0.5rem;
          }
        }
      `}</style>
    </>
  );
}
