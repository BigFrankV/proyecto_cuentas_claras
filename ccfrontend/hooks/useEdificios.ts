import { useState, useEffect, useCallback } from 'react';

import {
  Edificio,
  EdificioFormData,
  EdificioFilters,
  EdificioStats,
  Torre,
  Unidad,
} from '@/types/edificios';

// Hook para manejo de edificios
export const useEdificios = () => {
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para importar API dinámicamente
  const getApi = useCallback(async () => {
    const { default: api } = await import('@/lib/api/edificios');
    return api;
  }, []);

  // Cargar todos los edificios
  const fetchEdificios = useCallback(
    async (filters?: EdificioFilters) => {
      if (typeof window === 'undefined') {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const api = await getApi();
        const data = await api.edificios.getAll(filters);
        setEdificios(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar los edificios'
        );
        // eslint-disable-next-line no-console
        console.error('Error fetching edificios:', err);
      } finally {
        setLoading(false);
      }
    },
    [getApi]
  );

  // Crear un nuevo edificio
  const createEdificio = useCallback(
    async (data: EdificioFormData): Promise<boolean> => {
      if (typeof window === 'undefined') {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const api = await getApi();
        const newEdificio = await api.edificios.create(data);
        if (newEdificio) {
          setEdificios(prev => [...prev, newEdificio]);
          return true;
        }
        return false;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al crear el edificio'
        );
        // eslint-disable-next-line no-console
        console.error('Error creating edificio:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getApi]
  );

  // Actualizar un edificio
  const updateEdificio = useCallback(
    async (id: string, data: Partial<EdificioFormData>): Promise<boolean> => {
      if (typeof window === 'undefined') {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const api = await getApi();
        const updatedEdificio = await api.edificios.update(id, data);
        if (updatedEdificio) {
          setEdificios(prev =>
            prev.map(edificio =>
              edificio.id === id ? updatedEdificio : edificio
            )
          );
          return true;
        }
        return false;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al actualizar el edificio'
        );
        // eslint-disable-next-line no-console
        console.error('Error updating edificio:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getApi]
  );

  // Eliminar un edificio
  const deleteEdificio = useCallback(
    async (id: string): Promise<boolean> => {
      if (typeof window === 'undefined') {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const api = await getApi();
        await api.edificios.delete(id);
        setEdificios(prev => prev.filter(edificio => edificio.id !== id));
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al eliminar el edificio'
        );
        // eslint-disable-next-line no-console
        console.error('Error deleting edificio:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getApi]
  );

  // Obtener edificio por ID
  const getEdificioById = useCallback(
    async (id: string): Promise<Edificio | null> => {
      if (typeof window === 'undefined') {
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const api = await getApi();
        const edificio = await api.edificios.getById(id);
        return edificio;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar el edificio'
        );
        // eslint-disable-next-line no-console
        console.error('Error getting edificio by id:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getApi]
  );

  // Verificar dependencias
  const checkDependencies = useCallback(
    async (id: string) => {
      if (typeof window === 'undefined') {
        return {};
      }

      try {
        const api = await getApi();
        return await api.edificios.checkDependencies(id);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error checking dependencies:', err);
        return {};
      }
    },
    [getApi]
  );

  // Obtener estadísticas
  const getStats = useCallback(async (): Promise<EdificioStats | null> => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const api = await getApi();
      return await api.stats.getStats();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error getting stats:', err);
      return null;
    }
  }, [getApi]);

  // Filtrar edificios
  const filterEdificios = useCallback(
    (filters: EdificioFilters) => {
      return edificios.filter(edificio => {
        if (filters.busqueda) {
          const search = filters.busqueda.toLowerCase();
          if (
            !edificio.nombre.toLowerCase().includes(search) &&
            !edificio.codigo?.toLowerCase().includes(search) &&
            !edificio.direccion.toLowerCase().includes(search)
          ) {
            return false;
          }
        }

        if (
          filters.comunidadId &&
          edificio.comunidadId !== filters.comunidadId
        ) {
          return false;
        }

        if (filters.estado && edificio.estado !== filters.estado) {
          return false;
        }

        if (filters.tipo && edificio.tipo !== filters.tipo) {
          return false;
        }

        return true;
      });
    },
    [edificios]
  );

  return {
    edificios,
    loading,
    error,
    fetchEdificios,
    createEdificio,
    updateEdificio,
    deleteEdificio,
    getEdificioById,
    checkDependencies,
    getStats,
    filterEdificios,
  };
};

// Hook para manejo de estadísticas de edificios
export const useEdificiosStats = () => {
  const [stats, setStats] = useState<EdificioStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { default: api } = await import('@/lib/api/edificios');
      const data = await api.stats.getStats();
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar estadísticas'
      );
      // eslint-disable-next-line no-console
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
};

// Hook para manejo de torres
export const useTorres = (edificioId: string) => {
  const [torres, setTorres] = useState<Torre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTorres = useCallback(async () => {
    if (!edificioId || typeof window === 'undefined') {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { default: api } = await import('@/lib/api/edificios');
      const data = await api.torres.getByEdificio(edificioId);
      setTorres(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar torres');
      // eslint-disable-next-line no-console
      console.error('Error fetching torres:', err);
    } finally {
      setLoading(false);
    }
  }, [edificioId]);

  const createTorre = useCallback(
    async (data: any): Promise<boolean> => {
      if (!edificioId || typeof window === 'undefined') {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const { default: api } = await import('@/lib/api/edificios');
        const newTorre = await api.torres.create(edificioId, data);
        if (newTorre) {
          setTorres(prev => [...prev, newTorre]);
          return true;
        }
        return false;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear torre');
        // eslint-disable-next-line no-console
        console.error('Error creating torre:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [edificioId]
  );

  return {
    torres,
    loading,
    error,
    fetchTorres,
    createTorre,
  };
};

// Hook para manejo de unidades
export const useUnidades = (edificioId: string, torreId?: string) => {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnidades = useCallback(async () => {
    if (!edificioId || typeof window === 'undefined') {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { default: api } = await import('@/lib/api/edificios');
      const data = await api.unidades.getByEdificio(edificioId, torreId);
      setUnidades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar unidades');
      // eslint-disable-next-line no-console
      console.error('Error fetching unidades:', err);
    } finally {
      setLoading(false);
    }
  }, [edificioId, torreId]);

  const createUnidad = useCallback(
    async (data: any): Promise<boolean> => {
      if (!edificioId || typeof window === 'undefined') {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const { default: api } = await import('@/lib/api/edificios');
        const newUnidad = await api.unidades.create(edificioId, data);
        if (newUnidad) {
          setUnidades(prev => [...prev, newUnidad]);
          return true;
        }
        return false;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear unidad');
        // eslint-disable-next-line no-console
        console.error('Error creating unidad:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [edificioId]
  );

  return {
    unidades,
    loading,
    error,
    fetchUnidades,
    createUnidad,
  };
};

// Hook para utilidades de edificios
export const useEdificiosUtils = () => {
  const searchEdificios = useCallback(async (query: string, limit = 10) => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const { default: api } = await import('@/lib/api/edificios');
      return await api.utils.search(query, limit);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error searching edificios:', err);
      return [];
    }
  }, []);

  const getComunidadesOpciones = useCallback(async () => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const { default: api } = await import('@/lib/api/edificios');
      return await api.utils.getComunidadesOpciones();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error getting comunidades opciones:', err);
      return [];
    }
  }, []);

  const validarCodigo = useCallback(
    async (
      edificioId: string,
      codigo: string,
      tipo: 'edificio' | 'torre' | 'unidad'
    ) => {
      if (typeof window === 'undefined') {
        return false;
      }

      try {
        const { default: api } = await import('@/lib/api/edificios');
        return await api.utils.validarCodigo(edificioId, codigo, tipo);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error validating codigo:', err);
        return false;
      }
    },
    []
  );

  return {
    searchEdificios,
    getComunidadesOpciones,
    validarCodigo,
  };
};

// Hook para formularios de edificios
export const useEdificioForm = () => {
  const [formData, setFormData] = useState<EdificioFormData>({
    nombre: '',
    direccion: '',
    comunidadId: '',
    tipo: 'residencial',
    numeroTorres: 1,
    pisos: 1,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof EdificioFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof EdificioFormData, boolean>>
  >({});

  const updateField = useCallback(
    (field: keyof EdificioFormData, value: any) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));

      // Limpiar error del campo cuando se actualiza
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: undefined,
        }));
      }
    },
    [errors]
  );

  const touchField = useCallback((field: keyof EdificioFormData) => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));
  }, []);

  const validate = useCallback(() => {
    const newErrors: Partial<Record<keyof EdificioFormData, string>> = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.direccion?.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    }

    if (!formData.comunidadId?.trim()) {
      newErrors.comunidadId = 'La comunidad es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData({
      nombre: '',
      direccion: '',
      comunidadId: '',
      tipo: 'residencial',
      numeroTorres: 1,
      pisos: 1,
    });
    setErrors({});
    setTouched({});
  }, []);

  return {
    formData,
    errors,
    touched,
    updateField,
    touchField,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
};
