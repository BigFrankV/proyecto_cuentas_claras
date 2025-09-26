import { api } from './api';

export interface Proveedor {
  id: number;
  rut: string;
  dv: string;
  razon_social: string;
  giro?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  calificacion?: number;
  contactos?: ContactoProveedor[];
  categorias?: string[];
  comunidad_id: number;
  created_at: string;
  updated_at: string;
}

export interface ContactoProveedor {
  id?: number;
  nombre: string;
  cargo: string;
  email?: string;
  telefono?: string;
}

export interface ProveedorCreateRequest {
  rut: string;
  dv: string;
  razon_social: string;
  giro?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  contactos?: ContactoProveedor[];
  categorias?: string[];
  calificacion?: number;
}

export interface ProveedorUpdateRequest extends Partial<ProveedorCreateRequest> {
  activo?: boolean;
}

export interface ProveedoresEstadisticas {
  total: number;
  activos: number;
  inactivos: number;
  nuevos_mes: number;
  calificacion_promedio: number;
  categorias: { [key: string]: number };
}

export interface ProveedorFilters {
  search?: string;
  categoria?: string;
  activo?: boolean;
  calificacion_min?: number;
  page?: number;
  limit?: number;
}

class ProveedoresService {
  /**
   * Obtiene todos los proveedores de una comunidad con filtros
   */
  async getProveedores(comunidadId: number, filters: ProveedorFilters = {}): Promise<Proveedor[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.categoria) queryParams.append('categoria', filters.categoria);
      if (filters.activo !== undefined) queryParams.append('activo', filters.activo.toString());
      if (filters.calificacion_min) queryParams.append('calificacion_min', filters.calificacion_min.toString());
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const response = await api.get(`/proveedores/comunidad/${comunidadId}?${queryParams}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo proveedores:', error);
      throw new Error(error?.response?.data?.error || 'Error al obtener los proveedores');
    }
  }

  /**
   * Obtiene un proveedor por ID
   */
  async getProveedor(id: number): Promise<Proveedor> {
    try {
      const response = await api.get(`/proveedores/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo proveedor:', error);
      throw new Error(error?.response?.data?.error || 'Error al obtener el proveedor');
    }
  }

  /**
   * Crea un nuevo proveedor
   */
  async createProveedor(comunidadId: number, data: ProveedorCreateRequest): Promise<Proveedor> {
    try {
      const response = await api.post(`/proveedores/comunidad/${comunidadId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creando proveedor:', error);
      throw new Error(error?.response?.data?.error || 'Error al crear el proveedor');
    }
  }

  /**
   * Actualiza un proveedor
   */
  async updateProveedor(id: number, data: ProveedorUpdateRequest): Promise<Proveedor> {
    try {
      const response = await api.patch(`/proveedores/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error actualizando proveedor:', error);
      throw new Error(error?.response?.data?.error || 'Error al actualizar el proveedor');
    }
  }

  /**
   * Elimina un proveedor
   */
  async deleteProveedor(id: number): Promise<void> {
    try {
      await api.delete(`/proveedores/${id}`);
    } catch (error: any) {
      console.error('Error eliminando proveedor:', error);
      throw new Error(error?.response?.data?.error || 'Error al eliminar el proveedor');
    }
  }

  /**
   * Obtiene estadísticas de proveedores
   */
  async getEstadisticas(comunidadId: number): Promise<ProveedoresEstadisticas> {
    try {
      const response = await api.get(`/proveedores/comunidad/${comunidadId}/estadisticas`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo estadísticas de proveedores:', error);
      // Fallback: retornar estadísticas por defecto
      return {
        total: 0,
        activos: 0,
        inactivos: 0,
        nuevos_mes: 0,
        calificacion_promedio: 0,
        categorias: {}
      };
    }
  }

  /**
   * Cambia el estado activo/inactivo de un proveedor
   */
  async toggleEstado(id: number, activo: boolean): Promise<Proveedor> {
    return this.updateProveedor(id, { activo });
  }

  /**
   * Califica un proveedor
   */
  async calificarProveedor(id: number, calificacion: number): Promise<Proveedor> {
    return this.updateProveedor(id, { calificacion });
  }

  /**
   * Valida RUT chileno
   */
  validateRut(rut: string): { isValid: boolean; rut: string; dv: string } {
    // Limpiar el RUT
    const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    
    if (cleanRut.length < 2) {
      return { isValid: false, rut: '', dv: '' };
    }

    const rutNumber = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    // Calcular DV
    let suma = 0;
    let multiplicador = 2;

    for (let i = rutNumber.length - 1; i >= 0; i--) {
      const digit = rutNumber[i];
      if (digit) {
        suma += parseInt(digit) * multiplicador;
      }
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = suma % 11;
    const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'K' : (11 - resto).toString();

    return {
      isValid: dv === dvCalculado,
      rut: rutNumber,
      dv: dvCalculado
    };
  }

  /**
   * Formatea RUT para mostrar
   */
  formatRut(rut: string, dv: string): string {
    const cleanRut = rut.replace(/[^0-9]/g, '');
    if (cleanRut.length === 0) return '';
    
    // Agregar puntos al RUT
    const rutConPuntos = cleanRut.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${rutConPuntos}-${dv}`;
  }
}

export const proveedoresService = new ProveedoresService();
export default proveedoresService;