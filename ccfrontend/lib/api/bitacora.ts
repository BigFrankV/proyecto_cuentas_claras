import apiClient from '../api';

// Interfaces para las respuestas del backend
interface ActivityBackend {
  id: string;
  type: 'system' | 'user' | 'security' | 'maintenance' | 'admin' | 'financial';
  priority: 'low' | 'normal' | 'high' | 'critical';
  title: string;
  description: string;
  user: string;
  date: string;
  tags: string[];
  attachments: number;
  ip?: string;
  location?: string;
}

interface ActivityStatsBackend {
  total: number;
  today: number;
  high: number;
  critical: number;
}

interface ActivityFilters {
  search?: string;
  type?:
    | 'system'
    | 'user'
    | 'security'
    | 'maintenance'
    | 'admin'
    | 'financial'
    | 'all';
  priority?: 'low' | 'normal' | 'high' | 'critical' | 'all';
  dateRange?: 'today' | 'week' | 'month' | 'all';
  page?: number;
  limit?: number;
}

interface CreateActivityData {
  type: 'system' | 'user' | 'security' | 'maintenance' | 'admin' | 'financial';
  priority?: 'low' | 'normal' | 'high' | 'critical';
  title: string;
  description?: string;
  tags?: string[];
  attachments?: File[];
}

interface ActivityResponse {
  activities: ActivityBackend[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export type {
  ActivityFilters,
  ActivityResponse,
  ActivityStatsBackend,
  CreateActivityData,
};

class BitacoraService {
  private baseUrl = '/bitacora';

  // Obtener actividades de una comunidad
  async getActivities(
    comunidadId: number,
    filters?: ActivityFilters,
  ): Promise<ActivityResponse> {
    try {
      const params = new URLSearchParams();

      if (filters?.page) {
        params.append('page', filters.page.toString());
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters?.priority && filters.priority !== 'all') {
        params.append('priority', filters.priority);
      }
      if (filters?.dateRange && filters.dateRange !== 'all') {
        params.append('dateRange', filters.dateRange);
      }

      const queryString = params.toString();
      const url = `${this.baseUrl}/comunidad/${comunidadId}${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch {
      throw new Error('Error al obtener actividades');
    }
  }

  // Obtener estadísticas de la bitácora
  async getStats(comunidadId: number): Promise<ActivityStatsBackend> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/stats/${comunidadId}`,
      );
      return response.data;
    } catch {
      throw new Error('Error al obtener estadísticas');
    }
  }

  // Crear nueva entrada de bitácora
  async createActivity(
    comunidadId: number,
    data: CreateActivityData,
  ): Promise<ActivityBackend> {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/comunidad/${comunidadId}`,
        data,
      );
      return response.data;
    } catch {
      throw new Error('Error al crear actividad');
    }
  }

  // Exportar datos de bitácora
  async exportData(
    comunidadId: number,
    format: 'csv' | 'excel' | 'pdf',
    filters?: ActivityFilters,
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('comunidadId', comunidadId.toString());
      params.append('format', format);

      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters?.priority && filters.priority !== 'all') {
        params.append('priority', filters.priority);
      }
      if (filters?.dateRange && filters.dateRange !== 'all') {
        params.append('dateRange', filters.dateRange);
      }

      const response = await apiClient.get(
        `${this.baseUrl}/export?${params.toString()}`,
        {
          responseType: 'blob',
        },
      );
      return response.data;
    } catch {
      throw new Error('Error al exportar datos');
    }
  }
}

const bitacoraService = new BitacoraService();
export default bitacoraService;

