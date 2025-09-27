import api from './api';

export interface Proveedor {
  id: number;
  razon_social: string;
  rut: string;
  dv: string;
  giro?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo: boolean;
  calificacion?: number;
  categorias?: string[];
  comunidad_id: number;
  created_at: string;
  updated_at?: string;
}

export interface ProveedorCreateRequest {
  razon_social: string;
  rut: string;
  dv: string;
  giro?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  categorias?: string[];
}

export interface ProveedorEstadisticas {
  total: number;
  activos: number;
  inactivos: number;
  nuevos_mes: number;
  calificacion_promedio: number;
}

class ProveedoresService {
  
  /**
   * Obtener proveedores de una comunidad
   */
  async getProveedores(comunidadId: number): Promise<{ success: boolean; data: Proveedor[]; estadisticas: ProveedorEstadisticas }> {
    const response = await api.get(`/proveedores/comunidad/${comunidadId}`);
    return response.data;
  }

  /**
   * Obtener proveedor por ID
   */
  async getProveedorById(id: number): Promise<{ success: boolean; data: Proveedor }> {
    const response = await api.get(`/proveedores/${id}`);
    return response.data;
  }

  /**
   * Crear nuevo proveedor
   */
  async createProveedor(comunidadId: number, proveedorData: ProveedorCreateRequest): Promise<{ success: boolean; data: Proveedor }> {
    const response = await api.post(`/proveedores/comunidad/${comunidadId}`, proveedorData);
    return response.data;
  }

  /**
   * Actualizar proveedor
   */
  async updateProveedor(id: number, proveedorData: Partial<ProveedorCreateRequest>): Promise<{ success: boolean; data: Proveedor }> {
    const response = await api.put(`/proveedores/${id}`, proveedorData);
    return response.data;
  }

  /**
   * Eliminar proveedor
   */
  async deleteProveedor(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/proveedores/${id}`);
    return response.data;
  }

  /**
   * Cambiar estado del proveedor
   */
  async toggleEstado(id: number): Promise<{ success: boolean; data: { id: number; activo: boolean } }> {
    const response = await api.patch(`/proveedores/${id}/toggle`);
    return response.data;
  }

  /**
   * Buscar proveedores
   */
  async searchProveedores(comunidadId: number, busqueda: string): Promise<{ success: boolean; data: Proveedor[] }> {
    const response = await api.get(`/proveedores/comunidad/${comunidadId}/search?q=${encodeURIComponent(busqueda)}`);
    return response.data;
  }

  /**
   * Obtener estadísticas
   */
  async getEstadisticas(comunidadId: number): Promise<{ success: boolean; data: ProveedorEstadisticas }> {
    const response = await api.get(`/proveedores/comunidad/${comunidadId}/estadisticas`);
    return response.data;
  }

  /**
   * Formatear RUT
   */
  formatRut(rut: string, dv: string): string {
    if (!rut || !dv) return '';
    
    // Limpiar RUT
    const rutLimpio = rut.toString().replace(/\D/g, '');
    
    // Formatear con puntos
    const rutFormateado = rutLimpio.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    
    return `${rutFormateado}-${dv.toUpperCase()}`;
  }

  /**
   * Validar RUT
   */
  validateRut(rut: string, dv: string): boolean {
    const rutLimpio = rut.toString().replace(/\D/g, '');
    
    if (rutLimpio.length < 7) return false;
    
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = rutLimpio.length - 1; i >= 0; i--) {
      suma += parseInt(rutLimpio[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const resto = suma % 11;
    const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'K' : (11 - resto).toString();
    
    return dvCalculado === dv.toUpperCase();
  }
}

export const proveedoresService = new ProveedoresService();