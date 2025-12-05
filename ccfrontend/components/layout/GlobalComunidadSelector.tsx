import { useAuth } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';

export default function GlobalComunidadSelector() {
  const { comunidadSeleccionada, seleccionarComunidad, comunidades, loading } = useComunidad();
  const { user } = useAuth();

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

  // Si no hay comunidades Y no es superadmin, no mostrar nada
  if ((!comunidades || comunidades.length === 0) && !user?.is_superadmin) {
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

  // Debug logs
  console.log('🎯 [GlobalComunidadSelector] Renderizando...');
  console.log('🎯 [GlobalComunidadSelector] user?.is_superadmin:', user?.is_superadmin);
  console.log('🎯 [GlobalComunidadSelector] comunidades:', comunidades);
  console.log('🎯 [GlobalComunidadSelector] comunidades.length:', comunidades?.length);
  console.log('🎯 [GlobalComunidadSelector] comunidadSeleccionada:', comunidadSeleccionada);

  return (
    <>
      <div className="global-comunidad-selector mb-2">
        <div className="selector-container">
          <span className="material-icons selector-icon">location_on</span>
          <select
            className="form-select selector-input"
            value={comunidadSeleccionada?.id || 'todas'}
            onChange={handleChange}
            aria-label="Seleccionar comunidad"
          >
            <option value="todas">📍 Todas las comunidades</option>
            {comunidades.map(comunidad => (
              <option key={comunidad.id} value={comunidad.id}>
                {comunidad.nombre}
                {comunidad.rol && ` (${comunidad.rol})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <style jsx>{`
        .global-comunidad-selector {
          padding: 0.4rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .selector-container {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .selector-icon {
          color: var(--color-accent, #fd5d14);
          font-size: 18px;
          flex-shrink: 0;
        }

        .selector-input {
          flex: 1;
          font-size: 0.8rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
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
          padding: 0.3rem;
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
