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
  comunidad_nombre?: string;
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
  // ✅ MÉTODO PARA SUPERADMIN - TODOS LOS PROVEEDORES:
  async getAllProveedores(): Promise<{ success: boolean; data: Proveedor[]; estadisticas: ProveedorEstadisticas }> {
    console.log('🔍 Obteniendo TODOS los proveedores (superadmin)');

    const response = await api.get('/proveedores/all');

    console.log('✅ Respuesta todos los proveedores:', response.data);
    return response.data;
  }

  // ✅ MANTENER MÉTODO EXISTENTE PARA ADMIN POR COMUNIDAD:
  async getProveedores(comunidadId: number): Promise<{ success: boolean; data: Proveedor[]; estadisticas: ProveedorEstadisticas }> {
    console.log('🔍 Obteniendo proveedores para comunidad:', comunidadId);

    const response = await api.get(`/proveedores/comunidad/${comunidadId}`);

    console.log('✅ Respuesta proveedores por comunidad:', response.data);
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
  async actualizarProveedor(id: number, proveedorData: Partial<ProveedorCreateRequest>): Promise<{ success: boolean; data: Proveedor }> {
    console.log(`🔄 Actualizando proveedor ID: ${id}`, proveedorData);

    try {
      const response = await api.patch(`/proveedores/${id}`, proveedorData);
      console.log('✅ Proveedor actualizado:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('❌ Error actualizando proveedor:', error);
      throw error;
    }
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

export const proveedoresService = {
  ...new ProveedoresService(),

  // ✅ AGREGAR ESTA FUNCIÓN:
  async getProveedor(id: number): Promise<{ success: boolean; data: Proveedor }> {
    console.log(`🔍 Obteniendo proveedor ID: ${id}`);

    try {
      const response = await api.get(`/proveedores/${id}`);
      console.log('✅ Proveedor obtenido:', response.data);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('❌ Error obteniendo proveedor:', error);
      throw error;
    }
  },

  // ✅ AGREGAR FUNCIONES DE CAMBIAR ESTADO Y ELIMINAR:
  async cambiarEstado(id: number, activo: boolean): Promise<{ success: boolean }> {
    console.log(`🔄 Cambiando estado proveedor ID: ${id} a ${activo ? 'activo' : 'inactivo'}`);

    try {
      const response = await api.patch(`/proveedores/${id}/estado`, { activo });
      console.log('✅ Estado cambiado exitosamente');

      return {
        success: true
      };
    } catch (error: any) {
      console.error('❌ Error cambiando estado:', error);
      throw error;
    }
  },

  async eliminarProveedor(id: number): Promise<{ success: boolean }> {
    console.log(`🗑️ Eliminando proveedor ID: ${id}`);

    try {
      const response = await api.delete(`/proveedores/${id}`);
      console.log('✅ Proveedor eliminado exitosamente');

      return {
        success: true
      };
    } catch (error: any) {
      console.error('❌ Error eliminando proveedor:', error);
      throw error;
    }
  },

  // ✅ AGREGAR ESTA FUNCIÓN FALTANTE:
  async getAllProveedores(): Promise<{ success: boolean; data: Proveedor[]; estadisticas?: any }> {
    console.log('🔍 Obteniendo todos los proveedores (Superadmin)');

    try {
      const response = await api.get('/proveedores/all');
      console.log('✅ Todos los proveedores obtenidos:', response.data);

      return {
        success: true,
        data: response.data.data || [],
        estadisticas: response.data.estadisticas || null
      };
    } catch (error: any) {
      console.error('❌ Error obteniendo todos los proveedores:', error);
      throw error;
    }
  },

  // ✅ TAMBIÉN AGREGAR FUNCIÓN PARA PROVEEDORES POR COMUNIDAD:
  async getProveedoresByComunidad(comunidadId?: number): Promise<{ success: boolean; data: Proveedor[]; estadisticas?: any }> {
    console.log('🔍 Obteniendo proveedores por comunidad:', comunidadId);

    try {
      // ✅ CORREGIR: Usar endpoint principal
      const response = await api.get('/proveedores');
      console.log('✅ Proveedores obtenidos:', response.data);

      return {
        success: true,
        data: response.data.data || [],
        estadisticas: response.data.estadisticas || null
      };
    } catch (error: any) {
      console.error('❌ Error obteniendo proveedores por comunidad:', error);
      throw error;
    }
  },
};
