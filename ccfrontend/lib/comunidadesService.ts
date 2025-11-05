import {
  Comunidad,
  ComunidadDetalle,
  ParametrosCobranza,
  ComunidadFormData,
  ComunidadFiltros,
} from '@/types/comunidades';

import apiClient from './api';

class ComunidadesService {
  private baseUrl = '/comunidades';

  // Métodos CRUD básicos
  async getComunidades(filtros?: ComunidadFiltros): Promise<Comunidad[]> {
    try {
      console.log(
        '📍 [ComunidadesService] getComunidades - Iniciando solicitud',
      );
      console.log('📍 [ComunidadesService] Filtros:', filtros);

      const params = new URLSearchParams();

      if (filtros?.busqueda) {
        params.append('nombre', filtros.busqueda);
      }
      if (filtros?.direccion) {
        params.append('direccion', filtros.direccion);
      }
      if (filtros?.tipo) {
        params.append('rut', filtros.tipo);
      } // Si tipo es RUT

      const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('📍 [ComunidadesService] URL completa:', url);

      const token = localStorage.getItem('auth_token');
      console.log('📍 [ComunidadesService] Token presente:', !!token);

      // ✅ NUEVA VERIFICACIÓN: Si no hay token, no intentar
      if (!token) {
        console.error(
          '❌ [ComunidadesService] SIN TOKEN - No se puede acceder a comunidades',
        );
        throw new Error('No hay autenticación (token ausente)');
      }

      const response = await apiClient.get(url);
      console.log(
        '📍 [ComunidadesService] Respuesta exitosa. Comunidades:',
        response.data.length,
      );

      return response.data.map((comunidad: any) =>
        this.normalizeComunidad(comunidad),
      );
    } catch (error: any) {
      console.error(
        '❌ [ComunidadesService] Error fetching comunidades:',
        error.message,
      );
      console.error('❌ [ComunidadesService] Status:', error.response?.status);
      console.error('❌ [ComunidadesService] Response:', error.response?.data);

      // ✅ NUEVA MANEJO: Si es 401, informar claramente
      if (error.response?.status === 401) {
        console.error(
          '❌ [ComunidadesService] 401 - Sin autorización. Usuario debe hacer login.',
        );
        throw new Error('No autorizado. Por favor, haz login.');
      }

      console.error('❌ [ComunidadesService] Full error:', error);
      throw error; // Propagar error para manejarlo en el componente
    }
  }

  async getComunidadById(id: number): Promise<ComunidadDetalle> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return this.normalizeComunidad(response.data) as ComunidadDetalle;
    } catch (error) {
      console.error(`Error fetching comunidad ${id}:`, error);
      throw error;
    }
  }

  // Nuevos métodos para endpoints específicos
  async getAmenidadesByComunidad(id: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/amenidades`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching amenidades for comunidad ${id}:`, error);
      return [];
    }
  }

  async getEdificiosByComunidad(id: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/edificios`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching edificios for comunidad ${id}:`, error);
      return [];
    }
  }

  async getContactosByComunidad(id: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/contactos`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contactos for comunidad ${id}:`, error);
      return [];
    }
  }

  async getDocumentosByComunidad(id: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/documentos`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching documentos for comunidad ${id}:`, error);
      return [];
    }
  }

  async getResidentesByComunidad(id: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/residentes`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching residentes for comunidad ${id}:`, error);
      return [];
    }
  }

  async getParametrosByComunidad(id: number): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/parametros`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching parametros for comunidad ${id}:`, error);
      return null;
    }
  }

  async getEstadisticasByComunidad(id: number): Promise<any> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/${id}/estadisticas`,
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching estadisticas for comunidad ${id}:`, error);
      return {
        totalIngresos: 0,
        ingresosPagados: 0,
        ingresosPendientes: 0,
        serviciosBasicos: 0,
        mantenimiento: 0,
        administracion: 0,
      };
    }
  }

  async getFlujoCajaByComunidad(id: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/flujo-caja`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching flujo-caja for comunidad ${id}:`, error);
      return [];
    }
  }

  async createComunidad(data: ComunidadFormData): Promise<Comunidad> {
    try {
      // Mapear campos del frontend al backend
      const payload = {
        razon_social: data.nombre,
        rut: data.rut || '',
        dv: data.dv || '',
        giro: data.descripcion || '',
        direccion: data.direccion,
        email_contacto: data.email,
        telefono_contacto: data.telefono,
      };

      const response = await apiClient.post(this.baseUrl, payload);
      return this.normalizeComunidad(response.data);
    } catch (error) {
      console.error('Error creating comunidad:', error);
      throw error;
    }
  }

  async updateComunidad(
    id: number,
    data: Partial<ComunidadFormData>,
  ): Promise<Comunidad> {
    try {
      // Mapear campos del frontend al backend
      const payload: any = {};

      if (data.nombre) {
        payload.razon_social = data.nombre;
      }
      if (data.rut) {
        payload.rut = data.rut;
      }
      if (data.dv) {
        payload.dv = data.dv;
      }
      if (data.descripcion) {
        payload.giro = data.descripcion;
      }
      if (data.direccion) {
        payload.direccion = data.direccion;
      }
      if (data.email) {
        payload.email_contacto = data.email;
      }
      if (data.telefono) {
        payload.telefono_contacto = data.telefono;
      }

      const response = await apiClient.patch(`${this.baseUrl}/${id}`, payload);
      return this.normalizeComunidad(response.data);
    } catch (error) {
      console.error(`Error updating comunidad ${id}:`, error);
      throw error;
    }
  }

  async deleteComunidad(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting comunidad ${id}:`, error);
      throw error;
    }
  }

  // Métodos para parámetros de cobranza
  async getParametrosCobranza(
    comunidadId: number,
  ): Promise<ParametrosCobranza> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/${comunidadId}/parametros`,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching parametros for comunidad ${comunidadId}:`,
        error,
      );
      throw error;
    }
  }

  async updateParametrosCobranza(
    comunidadId: number,
    parametros: Partial<ParametrosCobranza>,
  ): Promise<ParametrosCobranza> {
    try {
      const response = await apiClient.patch(
        `${this.baseUrl}/${comunidadId}/parametros`,
        parametros,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating parametros for comunidad ${comunidadId}:`,
        error,
      );
      throw error;
    }
  }

  // Métodos para estadísticas
  async getEstadisticasComunidad(comunidadId: number): Promise<any> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/${comunidadId}/estadisticas`,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching estadisticas for comunidad ${comunidadId}:`,
        error,
      );
      throw error;
    }
  }

  // Métodos nuevos basados en los endpoints de la API
  async verificarAcceso(
    comunidadId: number,
  ): Promise<{ tieneAcceso: boolean; esSuperadmin: boolean }> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/verificar-acceso/${comunidadId}`,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error verificando acceso a comunidad ${comunidadId}:`,
        error,
      );
      return { tieneAcceso: false, esSuperadmin: false };
    }
  }

  async getMisMembresias(): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/mis-membresias`);
      return response.data;
    } catch (error) {
      console.error('Error fetching membresías:', error);
      return [];
    }
  }

  // Métodos auxiliares
  formatCurrency(amount: number | undefined | null): string {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0';
    }
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  formatPercentage(value: number | undefined | null): string {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.0%';
    }
    return `${value.toFixed(1)}%`;
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'Activa':
        return 'bg-success';
      case 'Inactiva':
        return 'bg-secondary';
      case 'Suspendida':
        return 'bg-warning';
      default:
        return 'bg-primary';
    }
  }

  getTipoComunidadIcon(tipo: string): string {
    switch (tipo) {
      case 'Condominio':
        return 'domain';
      case 'Edificio':
        return 'apartment';
      case 'Conjunto Residencial':
        return 'location_city';
      default:
        return 'business';
    }
  }

  // Función para normalizar datos de comunidad desde backend (snake_case) a frontend (camelCase)
  private normalizeComunidad(comunidad: any): Comunidad {
    return {
      id: comunidad.id,
      nombre: comunidad.razon_social || comunidad.nombre || '',
      direccion: comunidad.direccion || '',
      tipo: comunidad.tipo || 'Edificio',
      estado: comunidad.estado || 'Activa',
      rut: comunidad.rut || '',
      dv: comunidad.dv || '',
      telefono: comunidad.telefono_contacto || comunidad.telefono || '',
      email: comunidad.email_contacto || comunidad.email || '',
      descripcion: comunidad.giro || comunidad.descripcion || '',
      administrador: comunidad.administrador || '',
      imagen: comunidad.imagen || '',
      fechaCreacion: comunidad.fecha_creacion || comunidad.fechaCreacion || '',
      fechaActualizacion:
        comunidad.fecha_actualizacion || comunidad.fechaActualizacion || '',
      totalUnidades:
        comunidad.cantidad_unidades || comunidad.totalUnidades || 0,
      unidadesOcupadas:
        comunidad.unidades_ocupadas || comunidad.unidadesOcupadas || 0,
      totalResidentes:
        comunidad.cantidad_residentes || comunidad.totalResidentes || 0,
      saldoPendiente: comunidad.deuda_total || comunidad.saldoPendiente || 0,
      ingresosMensuales:
        comunidad.ingresos_mensuales || comunidad.ingresosMensuales || 0,
      gastosMensuales:
        comunidad.gastos_comunes_mes || comunidad.gastosMensuales || 0,
      morosidad: comunidad.morosidad || 0,
    };
  }
}

const comunidadesService = new ComunidadesService();
export default comunidadesService;
