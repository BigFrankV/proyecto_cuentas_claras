import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interfaces para las respuestas de la API
export interface UfApiResponse {
  fecha: string;
  valor: number;
  success: boolean;
  error?: string;
}

export interface UtmApiResponse {
  mes: number;
  ano: number;
  valor: number;
  success: boolean;
  error?: string;
}

export interface IndicadorGenerico {
  fecha: string;
  valor: number;
  codigo: string;
  nombre: string;
  unidad_medida: string;
}

export interface IndicadoresResponse {
  indicadores: IndicadorGenerico[];
  success: boolean;
  error?: string;
}

export interface HistoricoUfResponse {
  data: Array<{
    fecha: string;
    valor: number;
  }>;
  success: boolean;
  error?: string;
}

export interface HistoricoUtmResponse {
  data: Array<{
    mes: number;
    ano: number;
    valor: number;
  }>;
  success: boolean;
  error?: string;
}

export interface SyncStatusResponse {
  lastSync: string | null;
  isRunning: boolean;
  stats: {
    uf_records: number;
    utm_records: number;
    otros_records: number;
    last_update: string | null;
  };
  success: boolean;
  error?: string;
}

// =================== SERVICIOS DE UF ===================

/**
 * Obtiene el valor de UF para una fecha específica
 */
export const getUfByDate = async (fecha: string): Promise<UfApiResponse> => {
  try {
    const response = await api.get(`/util/uf/${fecha}`);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener UF por fecha:', error);
    return {
      fecha,
      valor: 0,
      success: false,
      error: error.response?.data?.error || error.message || 'Error de conexión'
    };
  }
};

/**
 * Obtiene el valor actual de UF (último disponible)
 */
export const getCurrentUf = async (): Promise<UfApiResponse> => {
  try {
    const response = await api.get('/util/uf/current');
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener UF actual:', error);
    return {
      fecha: '',
      valor: 0,
      success: false,
      error: error.response?.data?.error || error.message || 'Error de conexión'
    };
  }
};

/**
 * Obtiene histórico de UF para un rango de fechas
 */
export const getUfHistorico = async (
  fechaInicio: string, 
  fechaFin: string
): Promise<HistoricoUfResponse> => {
  try {
    const response = await api.get('/util/uf/historico', {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener histórico UF:', error);
    return {
      data: [],
      success: false,
      error: error.response?.data?.error || error.message || 'Error de conexión'
    };
  }
};

// =================== SERVICIOS DE UTM ===================

/**
 * Obtiene el valor de UTM para un mes y año específicos
 */
export const getUtmByPeriod = async (mes: number, ano: number): Promise<UtmApiResponse> => {
  try {
    const response = await api.get(`/util/utm/${ano}/${mes}`);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener UTM por período:', error);
    return {
      mes,
      ano,
      valor: 0,
      success: false,
      error: error.response?.data?.error || error.message || 'Error de conexión'
    };
  }
};

/**
 * Obtiene el valor actual de UTM (mes actual)
 */
export const getCurrentUtm = async (): Promise<UtmApiResponse> => {
  try {
    const response = await api.get('/util/utm/current');
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener UTM actual:', error);
    return {
      mes: 0,
      ano: 0,
      valor: 0,
      success: false,
      error: error.response?.data?.error || error.message || 'Error de conexión'
    };
  }
};

/**
 * Obtiene histórico de UTM para un año específico
 */
export const getUtmHistorico = async (ano: number): Promise<HistoricoUtmResponse> => {
  try {
    const response = await api.get(`/util/utm/historico/${ano}`);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener histórico UTM:', error);
    return {
      data: [],
      success: false,
      error: error.response?.data?.error || error.message || 'Error de conexión'
    };
  }
};

// =================== SERVICIOS GENERALES ===================

/**
 * Obtiene todos los indicadores económicos disponibles
 */
export const getAllIndicadores = async (): Promise<IndicadoresResponse> => {
  try {
    const response = await api.get('/util/indicadores');
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener indicadores:', error);
    return {
      indicadores: [],
      success: false,
      error: error.response?.data?.error || error.message || 'Error de conexión'
    };
  }
};

/**
 * Obtiene un indicador específico por su código
 */
export const getIndicadorByCodigo = async (codigo: string): Promise<IndicadoresResponse> => {
  try {
    const response = await api.get(`/util/indicadores/${codigo}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error al obtener indicador ${codigo}:`, error);
    return {
      indicadores: [],
      success: false,
      error: error.response?.data?.error || error.message || 'Error de conexión'
    };
  }
};

// =================== SERVICIOS DE SINCRONIZACIÓN ===================

/**
 * Obtiene el estado de la sincronización
 */
export const getSyncStatus = async (): Promise<SyncStatusResponse> => {
  try {
    const response = await api.get('/util/sync/status');
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener estado de sincronización:', error);
    return {
      lastSync: null,
      isRunning: false,
      stats: {
        uf_records: 0,
        utm_records: 0,
        otros_records: 0,
        last_update: null
      },
      success: false,
      error: error.response?.data?.error || error.message || 'Error de conexión'
    };
  }
};

/**
 * Inicia una sincronización manual
 */
export const startManualSync = async (): Promise<{ success: boolean; message: string; error?: string }> => {
  try {
    const response = await api.post('/util/sync/manual');
    return response.data;
  } catch (error: any) {
    console.error('Error al iniciar sincronización manual:', error);
    return {
      success: false,
      message: '',
      error: error.response?.data?.error || error.message || 'Error de conexión'
    };
  }
};

/**
 * Inicializa la base de datos con datos históricos
 */
export const initializeHistoricalData = async (): Promise<{ success: boolean; message: string; error?: string }> => {
  try {
    const response = await api.post('/util/sync/init');
    return response.data;
  } catch (error: any) {
    console.error('Error al inicializar datos históricos:', error);
    return {
      success: false,
      message: '',
      error: error.response?.data?.error || error.message || 'Error de conexión'
    };
  }
};

// =================== UTILIDADES ===================

/**
 * Formatea un valor en pesos chilenos
 */
export const formatPesos = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Formatea un valor UF
 */
export const formatUF = (amount: number): string => {
  return amount.toLocaleString('es-CL', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  }) + ' UF';
};

/**
 * Formatea un valor UTM
 */
export const formatUTM = (amount: number): string => {
  return amount.toLocaleString('es-CL', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  }) + ' UTM';
};

/**
 * Calcula la diferencia de días entre dos fechas
 */
export const calculateDateDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Obtiene el rango de fechas para períodos predefinidos
 */
export const getDateRange = (period: '7d' | '30d' | '90d' | '1y'): { start: string; end: string } => {
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case '7d':
      start.setDate(end.getDate() - 7);
      break;
    case '30d':
      start.setDate(end.getDate() - 30);
      break;
    case '90d':
      start.setDate(end.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(end.getFullYear() - 1);
      break;
  }
  
  return {
    start: start.toISOString().split('T')[0] as string,
    end: end.toISOString().split('T')[0] as string
  };
};

export default {
  // UF Services
  getUfByDate,
  getCurrentUf,
  getUfHistorico,
  
  // UTM Services
  getUtmByPeriod,
  getCurrentUtm,
  getUtmHistorico,
  
  // General Services
  getAllIndicadores,
  getIndicadorByCodigo,
  
  // Sync Services
  getSyncStatus,
  startManualSync,
  initializeHistoricalData,
  
  // Utils
  formatPesos,
  formatUF,
  formatUTM,
  calculateDateDifference,
  getDateRange
};