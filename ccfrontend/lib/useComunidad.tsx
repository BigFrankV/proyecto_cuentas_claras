import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import api from './api';
import comunidadesService from './comunidadesService';
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
    const cargarComunidades = async () => {
      if (!user) {
        setComunidades([]);
        setComunidadSeleccionada(null);
        setInitialized(false);
        return;
      }

      const comunidadesSet = new Map<string, ComunidadSeleccionada>();

      // 1. Cargar comunidades desde memberships (roles admin)
      if (user.memberships && Array.isArray(user.memberships) && user.memberships.length > 0) {
        user.memberships.forEach((membership: any) => {
          const id = membership.comunidadId?.toString() || membership.comunidad_id?.toString();
          if (id) {
            comunidadesSet.set(id, {
              id,
              nombre: membership.comunidad?.razon_social || membership.nombre || 'Sin nombre',
              rol: membership.rol || 'miembro',
            });
          }
        });
      }

      // 2. Cargar comunidades desde titulares_unidad (propietarios/inquilinos) O todas si es superadmin
      try {
        setLoading(true);
        
        // eslint-disable-next-line no-console
        console.log('🔍 [useComunidad] Cargando comunidades...');
        // eslint-disable-next-line no-console
        console.log('🔍 [useComunidad] user.is_superadmin:', user.is_superadmin);
        
        if (user.is_superadmin) {
          // Superadmin: cargar TODAS las comunidades del sistema
          // eslint-disable-next-line no-console
          console.log('👑 [useComunidad] Superadmin detectado, cargando TODAS las comunidades...');
          
          const comunidadesData = await comunidadesService.getComunidades();
          // eslint-disable-next-line no-console
          console.log('✅ [useComunidad] Comunidades recibidas:', comunidadesData);
          // eslint-disable-next-line no-console
          console.log('📊 [useComunidad] Total comunidades:', comunidadesData.length);
          
          comunidadesData.forEach((com: any) => {
            const id = com.id?.toString();
            if (id) {
              comunidadesSet.set(id, {
                id,
                nombre: com.nombre || com.razon_social || 'Sin nombre',
                rol: 'superadmin',
              });
            }
          });
        } else {
          // Usuario normal: cargar solo sus unidades
          // eslint-disable-next-line no-console
          console.log('👤 [useComunidad] Usuario normal, cargando sus unidades...');
          const response = await api.get('/cargos/mis-unidades');
          const unidades = response.data;
          
          // eslint-disable-next-line no-console
          console.log('✅ [useComunidad] Unidades recibidas:', unidades.length);
          
          // Agrupar por comunidad_id
          unidades.forEach((unidad: any) => {
            const id = unidad.comunidad_id?.toString();
            if (id && !comunidadesSet.has(id)) {
              comunidadesSet.set(id, {
                id,
                nombre: unidad.nombre_comunidad || 'Sin nombre',
                rol: unidad.tipo || 'propietario', // propietario, arrendatario, residente
              });
            }
          });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('❌ [useComunidad] Error cargando comunidades:', err);
      } finally {
        setLoading(false);
      }

      const userComunidades = Array.from(comunidadesSet.values());
      // eslint-disable-next-line no-console
      console.log('🏘️ [useComunidad] Comunidades finales del usuario:', userComunidades);
      setComunidades(userComunidades);

      // Solo al inicializar: intentar cargar desde localStorage
      if (!initialized) {
        const saved = localStorage.getItem('comunidadSeleccionada');
        if (saved && saved !== 'null') {
          try {
            const parsed = JSON.parse(saved);
            // Verificar que la comunidad guardada existe en las comunidades del usuario
            if (userComunidades.some(c => c.id === parsed.id)) {
              setComunidadSeleccionada(parsed);
            } else {
              // Si no existe, decidir según el tipo de usuario
              if (user.is_superadmin) {
                // Superadmin: iniciar con "Todas las comunidades" (null)
                setComunidadSeleccionada(null);
              } else {
                // Usuario normal: seleccionar la primera comunidad disponible
                setComunidadSeleccionada(userComunidades.length > 0 ? userComunidades[0] : null);
              }
            }
          } catch (err) {
            // En caso de error de parsing
            if (user.is_superadmin) {
              setComunidadSeleccionada(null);
            } else {
              setComunidadSeleccionada(userComunidades.length > 0 ? userComunidades[0] : null);
            }
          }
        } else {
          // Si no hay nada guardado o es 'null'
          if (user.is_superadmin) {
            // Superadmin: iniciar con "Todas las comunidades" (null)
            setComunidadSeleccionada(null);
          } else {
            // Usuario normal: seleccionar la primera comunidad disponible
            setComunidadSeleccionada(userComunidades.length > 0 ? userComunidades[0] : null);
          }
        }
        setInitialized(true);
      }
    };

    cargarComunidades();
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