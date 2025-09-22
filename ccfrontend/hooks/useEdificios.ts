import { useState, useEffect, useCallback } from 'react';
import { 
  Edificio, 
  EdificioFormData, 
  EdificioFilters, 
  EdificioStats,
  Torre,
  Unidad 
} from '@/types/edificios';
import api from '@/lib/api/edificios';

// Hook para manejo de edificios
export const useEdificios = () => {
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los edificios
  const fetchEdificios = useCallback(async (filters?: EdificioFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.edificios.getAll(filters);
      setEdificios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los edificios');
      console.error('Error fetching edificios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear un nuevo edificio
  const createEdificio = useCallback(async (data: EdificioFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const newEdificio = await api.edificios.create(data);
      if (newEdificio) {
        setEdificios(prev => [...prev, newEdificio]);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el edificio');
      console.error('Error creating edificio:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar un edificio
  const updateEdificio = useCallback(async (id: string, data: Partial<EdificioFormData>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
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
      setError(err instanceof Error ? err.message : 'Error al actualizar el edificio');
      console.error('Error updating edificio:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar un edificio
  const deleteEdificio = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.edificios.delete(id);
      setEdificios(prev => prev.filter(edificio => edificio.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el edificio');
      console.error('Error deleting edificio:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener un edificio por ID
  const getEdificioById = useCallback(async (id: string): Promise<Edificio | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const edificio = await api.edificios.getById(id);
      return edificio;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el edificio');
      console.error('Error fetching edificio by id:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar dependencias antes de eliminar
  const checkDependencies = useCallback(async (id: string) => {
    try {
      return await api.edificios.checkDependencies(id);
    } catch (err) {
      console.error('Error checking dependencies:', err);
      return null;
    }
  }, []);

  // Calcular estadísticas locales (fallback)
  const getStats = useCallback((): EdificioStats => {
    const totalEdificios = edificios.length;
    const edificiosActivos = edificios.filter(e => e.estado === 'activo').length;
    const totalUnidades = edificios.reduce((sum, e) => sum + e.totalUnidades, 0);
    const unidadesOcupadas = edificios.reduce((sum, e) => sum + e.totalUnidadesOcupadas, 0);
    const ocupacion = totalUnidades > 0 ? (unidadesOcupadas / totalUnidades) * 100 : 0;

    return {
      totalEdificios,
      edificiosActivos,
      totalUnidades,
      unidadesOcupadas,
      ocupacion
    };
  }, [edificios]);

  // Filtrar edificios localmente (usado cuando los filtros se manejan en frontend)
  const filterEdificios = useCallback((filters: EdificioFilters): Edificio[] => {
    let filtered = [...edificios];

    if (filters.busqueda) {
      const searchTerm = filters.busqueda.toLowerCase();
      filtered = filtered.filter(edificio => 
        edificio.nombre.toLowerCase().includes(searchTerm) ||
        edificio.direccion.toLowerCase().includes(searchTerm) ||
        edificio.codigo?.toLowerCase().includes(searchTerm) ||
        edificio.comunidadNombre?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.estado) {
      filtered = filtered.filter(edificio => edificio.estado === filters.estado);
    }

    if (filters.tipo) {
      filtered = filtered.filter(edificio => edificio.tipo === filters.tipo);
    }

    if (filters.comunidadId) {
      filtered = filtered.filter(edificio => edificio.comunidadId === filters.comunidadId);
    }

    if (filters.fechaDesde) {
      filtered = filtered.filter(edificio => edificio.fechaCreacion >= filters.fechaDesde!);
    }

    if (filters.fechaHasta) {
      filtered = filtered.filter(edificio => edificio.fechaCreacion <= filters.fechaHasta!);
    }

    return filtered;
  }, [edificios]);

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
    filterEdificios
  };
};

// Hook para manejo de estadísticas de edificios
export const useEdificiosStats = () => {
  const [stats, setStats] = useState<EdificioStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.stats.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las estadísticas');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats
  };
};

// Hook para manejo de torres
export const useTorres = (edificioId: string) => {
  const [torres, setTorres] = useState<Torre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar torres de un edificio
  const fetchTorres = useCallback(async () => {
    if (!edificioId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.torres.getByEdificio(edificioId);
      setTorres(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las torres');
      console.error('Error fetching torres:', err);
    } finally {
      setLoading(false);
    }
  }, [edificioId]);

  // Crear una nueva torre
  const createTorre = useCallback(async (data: { nombre: string; codigo?: string; pisos: number; unidadesPorPiso: number; observaciones?: string }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const newTorre = await api.torres.create(edificioId, data);
      if (newTorre) {
        setTorres(prev => [...prev, newTorre]);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la torre');
      console.error('Error creating torre:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [edificioId]);

  useEffect(() => {
    fetchTorres();
  }, [fetchTorres]);

  return {
    torres,
    loading,
    error,
    fetchTorres,
    createTorre
  };
};

// Hook para manejo de unidades
export const useUnidades = (edificioId?: string, torreId?: string) => {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar unidades
  const fetchUnidades = useCallback(async () => {
    if (!edificioId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.unidades.getByEdificio(edificioId, torreId);
      setUnidades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las unidades');
      console.error('Error fetching unidades:', err);
    } finally {
      setLoading(false);
    }
  }, [edificioId, torreId]);

  // Crear una nueva unidad
  const createUnidad = useCallback(async (data: { numero: string; piso: number; torreId?: string; tipo: 'apartamento' | 'casa' | 'local' | 'oficina' | 'deposito' | 'parqueadero'; area: number; balcon?: boolean; parqueadero?: boolean; deposito?: boolean }): Promise<boolean> => {
    if (!edificioId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const newUnidad = await api.unidades.create(edificioId, data);
      if (newUnidad) {
        setUnidades(prev => [...prev, newUnidad]);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la unidad');
      console.error('Error creating unidad:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [edificioId]);

  useEffect(() => {
    fetchUnidades();
  }, [fetchUnidades]);

  return {
    unidades,
    loading,
    error,
    fetchUnidades,
    createUnidad
  };
};

// Hook para utilidades de edificios
export const useEdificiosUtils = () => {
  const [loading, setLoading] = useState(false);

  const searchEdificios = useCallback(async (query: string, limit = 10) => {
    setLoading(true);
    try {
      return await api.utils.search(query, limit);
    } catch (err) {
      console.error('Error searching edificios:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getComunidadesOpciones = useCallback(async () => {
    setLoading(true);
    try {
      return await api.utils.getComunidadesOpciones();
    } catch (err) {
      console.error('Error fetching comunidades:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const validarCodigo = useCallback(async (edificioId: string, codigo: string, tipo: 'edificio' | 'torre' | 'unidad') => {
    try {
      return await api.utils.validarCodigo(edificioId, codigo, tipo);
    } catch (err) {
      console.error('Error validating codigo:', err);
      return { disponible: false };
    }
  }, []);

  return {
    loading,
    searchEdificios,
    getComunidadesOpciones,
    validarCodigo
  };
};

// Hook para manejo de formularios de edificios
export const useEdificioForm = (initialData?: Partial<EdificioFormData>) => {
  const [formData, setFormData] = useState<EdificioFormData>({
    nombre: '',
    direccion: '',
    comunidadId: '',
    tipo: 'residencial',
    numeroTorres: 1,
    pisos: 1,
    servicios: [],
    amenidades: [],
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Actualizar un campo del formulario
  const updateField = useCallback((field: keyof EdificioFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error si existe
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Marcar un campo como tocado
  const touchField = useCallback((field: keyof EdificioFormData) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  }, []);

  // Validar el formulario
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    if (!formData.comunidadId) {
      newErrors.comunidadId = 'Debe seleccionar una comunidad';
    }

    if (formData.numeroTorres < 1) {
      newErrors.numeroTorres = 'Debe tener al menos 1 torre';
    }

    if (formData.pisos < 1) {
      newErrors.pisos = 'Debe tener al menos 1 piso';
    }

    if (formData.emailAdministrador && !isValidEmail(formData.emailAdministrador)) {
      newErrors.emailAdministrador = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Resetear el formulario
  const reset = useCallback(() => {
    setFormData({
      nombre: '',
      direccion: '',
      comunidadId: '',
      tipo: 'residencial',
      numeroTorres: 1,
      pisos: 1,
      servicios: [],
      amenidades: [],
      ...initialData
    });
    setErrors({});
    setTouched({});
  }, [initialData]);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return {
    formData,
    errors,
    touched,
    updateField,
    touchField,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};