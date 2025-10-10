import api from './api'; // Cambio: import por defecto
import type {
  Gasto,
  CategoriaGasto,
  GastoEstadisticas,
  GastoCreateRequest,
  GastoUpdateRequest,
  PaginatedResponse
} from '../types/gastos';

export interface GastoFilters {
  estado?: string;
  categoria?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
  ordenar?: string;
  direccion?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

class GastosService {
  private baseUrl = '/gastos';

  /**
   * Obtener gastos con filtros y paginación
   */
  async getGastos(comunidadId: number, filters: GastoFilters = {}): Promise<PaginatedResponse<Gasto>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = `${this.baseUrl}/comunidad/${comunidadId}${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Obtener detalle de un gasto
   */
  async getGasto(id: number): Promise<Gasto> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  // ----------------- Nuevos métodos para aprobaciones -----------------
  /**
   * Obtener aprobaciones de un gasto
   */
  async getAprobaciones(gastoId: number): Promise<any[]> {
    const resp = await api.get(`/gastos/${gastoId}/aprobaciones`);
    // backend devuelve { success: true, data: rows } o { success: true, data: { gasto, aprobaciones, historial } }
    if (resp?.data?.data) {
      return Array.isArray(resp.data.data) ? resp.data.data : (resp.data.data.aprobaciones ?? []);
    }
    return resp?.data ?? [];
  }

  /**
   * Enviar aprobación/rechazo
   */
  async postAprobacion(gastoId: number, body: { decision: 'aprobado' | 'rechazado', observaciones?: string, monto_aprobado?: number }) {
    const resp = await api.post(`/gastos/${gastoId}/aprobaciones`, body);
    return resp.data;
  }
  // ------------------------------------------------------------------

  /**
   * Crear nuevo gasto
   */
  async createGasto(comunidadId: number, gastoData: GastoCreateRequest): Promise<any> {
    const response = await api.post(`/gastos/comunidad/${comunidadId}`, {
      categoria_id: gastoData.categoria_id,
      proveedor_id: gastoData.proveedor_id || null,  // ← AGREGAR ESTA LÍNEA
      centro_costo_id: gastoData.centro_costo_id || null,
      documento_compra_id: gastoData.documento_compra_id || null,
      fecha: gastoData.fecha,
      monto: gastoData.monto,
      glosa: gastoData.glosa,
      extraordinario: gastoData.extraordinario || false,
    });

    return response.data;
  }

  /**
   * Actualizar gasto
   */
  async updateGasto(id: number, gasto: GastoUpdateRequest): Promise<Gasto> {
    const response = await api.put(`${this.baseUrl}/${id}`, gasto);
    return response.data.data;
  }

  /**
   * Aprobar gasto
   */
  async aprobarGasto(id: number, observaciones?: string): Promise<void> {
    await api.put(`${this.baseUrl}/${id}/aprobar`, { observaciones });
  }

  /**
   * Rechazar gasto
   */
  async rechazarGasto(id: number, observaciones_rechazo: string): Promise<void> {
    await api.put(`${this.baseUrl}/${id}/rechazar`, { observaciones_rechazo });
  }

  /**
   * Enviar gasto para aprobación
   */
  async enviarAprobacion(id: number): Promise<void> {
    await api.put(`${this.baseUrl}/${id}/enviar-aprobacion`);
  }

  /**
   * Eliminar gasto (solo borradores)
   */
  async deleteGasto(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtener estadísticas de gastos
   */
  async getEstadisticas(comunidadId: number): Promise<GastoEstadisticas> {
    const response = await api.get(`${this.baseUrl}/comunidad/${comunidadId}/stats`);
    return response.data.data;
  }

  /**
   * Obtener categorías de gasto
   */
  async getCategorias(comunidadId: number): Promise<CategoriaGasto[]> {
    const response = await api.get(`/categorias-gasto/comunidad/${comunidadId}`);
    return response.data.data;
  }

  /**
   * Crear nueva categoría
   */
  async createCategoria(comunidadId: number, categoria: Omit<CategoriaGasto, 'id' | 'created_at' | 'updated_at' | 'total_gastos' | 'monto_total'>): Promise<CategoriaGasto> {
    const response = await api.post(`/categorias-gasto/comunidad/${comunidadId}`, categoria);
    return response.data.data;
  }

  /**
   * Actualizar categoría
   */
  async updateCategoria(id: number, categoria: Partial<CategoriaGasto>): Promise<CategoriaGasto> {
    const response = await api.put(`/categorias-gasto/${id}`, categoria);
    return response.data.data;
  }
}

export const gastosService = new GastosService();