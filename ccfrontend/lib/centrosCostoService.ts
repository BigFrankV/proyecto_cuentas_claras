import { api } from './api';

export interface CentroCosto {
  id: number;
  nombre: string;
  descripcion?: string;
  departamento?: string;
  responsable?: string;
  presupuesto?: number;
  icono?: string;
  color?: string;
  activo: boolean;
  comunidad_id: number;
  created_at: string;
  updated_at: string;
}

export interface CentroCostoCreateRequest {
  nombre: string;
  descripcion?: string;
  departamento?: string;
  responsable?: string;
  presupuesto?: number;
  icono?: string;
  color?: string;
}

export interface CentroCostoUpdateRequest extends Partial<CentroCostoCreateRequest> {
  activo?: boolean;
}

export interface CentrosCostoEstadisticas {
  total: number;
  activos: number;
  inactivos: number;
  presupuesto_total: number;
  gasto_total: number;
  departamentos: { [key: string]: number };
}

class CentrosCostoService {
  /**
   * Obtiene todos los centros de costo de una comunidad
   */
  async getCentrosCosto(comunidadId: number): Promise<CentroCosto[]> {
    try {
      const response = await api.get(`/centros-costo/comunidad/${comunidadId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo centros de costo:', error);
      throw new Error(error?.response?.data?.error || 'Error al obtener los centros de costo');
    }
  }

  /**
   * Obtiene un centro de costo por ID
   */
  async getCentroCosto(id: number): Promise<CentroCosto> {
    try {
      const response = await api.get(`/centros-costo/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo centro de costo:', error);
      throw new Error(error?.response?.data?.error || 'Error al obtener el centro de costo');
    }
  }

  /**
   * Crea un nuevo centro de costo
   */
  async createCentroCosto(comunidadId: number, data: CentroCostoCreateRequest): Promise<CentroCosto> {
    try {
      const response = await api.post(`/centros-costo/comunidad/${comunidadId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creando centro de costo:', error);
      throw new Error(error?.response?.data?.error || 'Error al crear el centro de costo');
    }
  }

  /**
   * Actualiza un centro de costo
   */
  async updateCentroCosto(id: number, data: CentroCostoUpdateRequest): Promise<CentroCosto> {
    try {
      const response = await api.patch(`/centros-costo/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error actualizando centro de costo:', error);
      throw new Error(error?.response?.data?.error || 'Error al actualizar el centro de costo');
    }
  }

  /**
   * Elimina un centro de costo
   */
  async deleteCentroCosto(id: number): Promise<void> {
    try {
      await api.delete(`/centros-costo/${id}`);
    } catch (error: any) {
      console.error('Error eliminando centro de costo:', error);
      throw new Error(error?.response?.data?.error || 'Error al eliminar el centro de costo');
    }
  }

  /**
   * Obtiene estadísticas de centros de costo
   */
  async getEstadisticas(comunidadId: number): Promise<CentrosCostoEstadisticas> {
    try {
      const response = await api.get(`/centros-costo/comunidad/${comunidadId}/estadisticas`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo estadísticas de centros de costo:', error);
      // Fallback: retornar estadísticas por defecto
      return {
        total: 0,
        activos: 0,
        inactivos: 0,
        presupuesto_total: 0,
        gasto_total: 0,
        departamentos: {}
      };
    }
  }

  /**
   * Cambia el estado activo/inactivo de un centro de costo
   */
  async toggleEstado(id: number, activo: boolean): Promise<CentroCosto> {
    return this.updateCentroCosto(id, { activo });
  }
}

export const centrosCostoService = new CentrosCostoService();
export default centrosCostoService;