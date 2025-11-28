import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { useAuth } from './useAuth';

export interface ComunidadSeleccionada {
  id: string;
  nombre: string;
  rol: string;
}

interface ComunidadContextType {
  comunidades: ComunidadSeleccionada[];
  comunidadSeleccionada: ComunidadSeleccionada | null;
  seleccionarComunidad: (comunidad: ComunidadSeleccionada | null) => void;
  loading: boolean;
  error: string | null;
}

const ComunidadContext = createContext<ComunidadContextType | undefined>(undefined);

interface ComunidadProviderProps {
  children: ReactNode;
}

export function ComunidadProvider({ children }: ComunidadProviderProps) {
  const { user } = useAuth();
  const [comunidades, setComunidades] = useState<ComunidadSeleccionada[]>([]);
  const [comunidadSeleccionada, setComunidadSeleccionada] = useState<ComunidadSeleccionada | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Cargar comunidades del usuario SOLO cuando cambia el usuario
  useEffect(() => {
    if (user?.memberships && Array.isArray(user.memberships) && user.memberships.length > 0) {
      const userComunidades = user.memberships.map((membership: any) => ({
        id: membership.comunidadId?.toString() || membership.id?.toString(),
        nombre: membership.comunidad?.razon_social || membership.nombre || 'Sin nombre',
        rol: membership.rol || 'miembro',
      }));

      setComunidades(userComunidades);

      // Solo al inicializar: intentar cargar desde localStorage o dejar en null (todas)
      if (!initialized) {
        const saved = localStorage.getItem('comunidadSeleccionada');
        if (saved && saved !== 'null') {
          try {
            const parsed = JSON.parse(saved);
            // Verificar que la comunidad guardada existe en las comunidades del usuario
            if (userComunidades.some(c => c.id === parsed.id)) {
              setComunidadSeleccionada(parsed);
            } else {
              // Si no existe, empezar con "todas" (null)
              setComunidadSeleccionada(null);
            }
          } catch (err) {
            // Si hay error al parsear, empezar con "todas"
            setComunidadSeleccionada(null);
          }
        } else {
          // Si no hay nada guardado, empezar con "todas" (null)
          setComunidadSeleccionada(null);
        }
        setInitialized(true);
      }
    } else if (user?.is_superadmin) {
      // Para superadmin, limpiar
      setComunidades([]);
      setComunidadSeleccionada(null);
      setInitialized(true);
    } else if (!user) {
      // Si no hay usuario, limpiar todo
      setComunidades([]);
      setComunidadSeleccionada(null);
      setInitialized(false);
    }
  }, [user, initialized]);

  const seleccionarComunidad = (comunidad: ComunidadSeleccionada | null) => {
    setComunidadSeleccionada(comunidad);
    // Persistir en localStorage
    if (comunidad) {
      localStorage.setItem('comunidadSeleccionada', JSON.stringify(comunidad));
    } else {
      // null significa "todas las comunidades"
      localStorage.setItem('comunidadSeleccionada', 'null');
    }
  };

  const value: ComunidadContextType = {
    comunidades,
    comunidadSeleccionada,
    seleccionarComunidad,
    loading,
    error,
  };

  return (
    <ComunidadContext.Provider value={value}>
      {children}
    </ComunidadContext.Provider>
  );
}

export function useComunidad() {
  const context = useContext(ComunidadContext);
  if (context === undefined) {
    throw new Error('useComunidad must be used within a ComunidadProvider');
  }
  return context;
}