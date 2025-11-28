import { useState, useEffect, useCallback } from 'react';

import apiClient from '@/lib/api';
import {
  Persona,
  PersonaConUsuario,
  PersonaListado,
  PersonaStats,
  UnidadAsociada,
  PagoRealizado,
  ActividadAuditoria,
  DocumentoAsociado,
  NotaAsociada,
  RolComunidad,
  ResumenFinanciero,
  UnidadAutocomplete,
  PersonaFilters,
  ValidacionCampo,
} from '@/types/personas';

export const usePersonas = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limpiar error
  const clearError = useCallback(() => setError(null), []);

  // Listar personas con filtros
  const listarPersonas = useCallback(
    async (filters: PersonaFilters = {}): Promise<Persona[]> => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });

        const response = await apiClient.get(`/personas?${params.toString()}`);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al listar personas';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Obtener persona por ID
  const obtenerPersona = useCallback(
    async (id: number): Promise<PersonaConUsuario> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/personas/${id}`);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al obtener persona';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Crear persona
  const crearPersona = useCallback(async (data: Partial<Persona>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/personas', data);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Error al crear persona';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar persona
  const actualizarPersona = useCallback(
    async (id: number, data: Partial<Persona>) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.patch(`/personas/${id}`, data);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al actualizar persona';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Reemplazar persona completamente
  const reemplazarPersona = useCallback(async (id: number, data: Persona) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put(`/personas/${id}`, data);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Error al reemplazar persona';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar persona
  const eliminarPersona = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/personas/${id}`);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Error al eliminar persona';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas
  const obtenerEstadisticas = useCallback(async (filters: any = {}): Promise<PersonaStats> => {
    setLoading(true);
    setError(null);
    try {
      // Primero intentamos con el endpoint
      try {
        const params = new URLSearchParams();
        if (filters.comunidad_id) {
          params.append('comunidad_id', filters.comunidad_id.toString());
        }
        
        const response = await apiClient.get(`/personas/estadisticas${params.toString() ? `?${params.toString()}` : ''}`);
        return response.data;
      } catch (err: any) {
        // Si el endpoint no existe (404), calculamos las estadísticas localmente
        if (err.response?.status === 404) {
          // Obtener todas las personas sin paginación para calcular estadísticas
          const response = await apiClient.get('/personas?limit=1000&offset=0');
          const personas: Persona[] = response.data;

          const administradores = personas.filter(p => p.usuario).length;
          const propietarios = personas.filter(p => !p.usuario).length;
          const activos = personas.filter(
            p => p.usuario?.estado === 'Activo' || !p.usuario,
          ).length;
          const inactivos = personas.length - activos;

          return {
            total_personas: personas.length,
            administradores,
            inquilinos: 0,
            propietarios,
            activos,
            inactivos,
          };
        }
        throw err;
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Error al obtener estadísticas';
      setError(errorMessage);
      // No lanzar error, devolver estadísticas vacías
      return {
        total_personas: 0,
        administradores: 0,
        inquilinos: 0,
        propietarios: 0,
        activos: 0,
        inactivos: 0,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener unidades asociadas
  const obtenerUnidadesAsociadas = useCallback(
    async (personaId: number): Promise<UnidadAsociada[]> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/personas/${personaId}/unidades`);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al obtener unidades asociadas';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Obtener pagos realizados
  const obtenerPagosRealizados = useCallback(
    async (personaId: number): Promise<PagoRealizado[]> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/personas/${personaId}/pagos`);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al obtener pagos realizados';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Obtener actividad/auditoría
  const obtenerActividad = useCallback(
    async (personaId: number): Promise<ActividadAuditoria[]> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(
          `/personas/${personaId}/actividad`,
        );
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al obtener actividad';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Obtener documentos asociados
  const obtenerDocumentos = useCallback(
    async (personaId: number): Promise<DocumentoAsociado[]> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(
          `/personas/${personaId}/documentos`,
        );
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al obtener documentos';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Obtener notas asociadas
  const obtenerNotas = useCallback(
    async (personaId: number): Promise<NotaAsociada[]> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/personas/${personaId}/notas`);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al obtener notas';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Obtener roles y comunidades
  const obtenerRolesComunidades = useCallback(
    async (personaId: number): Promise<RolComunidad[]> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/personas/${personaId}/roles`);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al obtener roles y comunidades';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Obtener resumen financiero
  const obtenerResumenFinanciero = useCallback(
    async (personaId: number): Promise<ResumenFinanciero[]> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(
          `/personas/${personaId}/resumen-financiero`,
        );
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al obtener resumen financiero';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Validar campo
  const validarCampo = useCallback(
    async (
      field: 'rut' | 'username' | 'email',
      value: string,
      exclude?: number,
    ): Promise<ValidacionCampo> => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ field, value });
        if (exclude) {
          params.append('exclude', exclude.toString());
        }

        const response = await apiClient.get(
          `/personas/validar?${params.toString()}`,
        );
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al validar campo';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Autocompletar unidades
  const autocompletarUnidades = useCallback(
    async (search?: string): Promise<UnidadAutocomplete[]> => {
      setLoading(true);
      setError(null);
      try {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        const response = await apiClient.get(
          `/personas/unidades/autocompletar${params}`,
        );
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al autocompletar unidades';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    clearError,
    listarPersonas,
    obtenerPersona,
    crearPersona,
    actualizarPersona,
    reemplazarPersona,
    eliminarPersona,
    obtenerEstadisticas,
    obtenerUnidadesAsociadas,
    obtenerPagosRealizados,
    obtenerActividad,
    obtenerDocumentos,
    obtenerNotas,
    obtenerRolesComunidades,
    obtenerResumenFinanciero,
    validarCampo,
    autocompletarUnidades,
  };
};
