import apiClient from './api';
import { 
  Multa, 
  MultaFiltros, 
  CreateMultaData, 
  UpdateMultaData,
  MultasEstadisticas,
  MultasResumen,
  MultaActividad,
  TipoInfraccion
} from '@/types/multas';

class MultasService {
  // ===== CRUD BÁSICO =====

  async getMultas(filtros?: MultaFiltros): Promise<Multa[]> {
    try {
      const params = new URLSearchParams();
      
      if (filtros?.search) params.append('search', filtros.search);
      if (filtros?.comunidad_id) params.append('comunidad_id', filtros.comunidad_id.toString());
      if (filtros?.unidad_id) params.append('unidad_id', filtros.unidad_id.toString());
      if (filtros?.torre_id) params.append('torre_id', filtros.torre_id.toString());
      if (filtros?.edificio_id) params.append('edificio_id', filtros.edificio_id.toString());
      if (filtros?.estado) params.append('estado', filtros.estado);
      if (filtros?.prioridad) params.append('prioridad', filtros.prioridad);
      if (filtros?.tipo_infraccion) params.append('tipo_infraccion', filtros.tipo_infraccion);
      if (filtros?.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros?.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros?.monto_min) params.append('monto_min', filtros.monto_min.toString());
      if (filtros?.monto_max) params.append('monto_max', filtros.monto_max.toString());
      if (filtros?.propietario_id) params.append('propietario_id', filtros.propietario_id.toString());
      if (filtros?.created_by_user_id) params.append('created_by', filtros.created_by_user_id.toString());
      if (filtros?.assigned_to_user_id) params.append('assigned_to', filtros.assigned_to_user_id.toString());
      if (filtros?.vencidas) params.append('vencidas', 'true');
      if (filtros?.sin_notificar) params.append('sin_notificar', 'true');

      const queryString = params.toString();
      const url = queryString ? `/multas?${queryString}` : '/multas';
      
      console.log('🔍 Obteniendo multas con filtros:', filtros);
      const response = await apiClient.get(url);
      
      console.log(`📋 ${response.data.length} multas obtenidas`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo multas:', error);
      throw error;
    }
  }

  async getMulta(id: number): Promise<Multa> {
    try {
      console.log(`🔍 Obteniendo multa ${id}`);
      const response = await apiClient.get(`/multas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error obteniendo multa ${id}:`, error);
      throw error;
    }
  }

  async createMulta(data: CreateMultaData): Promise<Multa> {
    try {
      console.log('📝 Creando nueva multa:', data);
      const response = await apiClient.post('/multas', data);
      console.log('✅ Multa creada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando multa:', error);
      throw error;
    }
  }

  async updateMulta(id: number, data: UpdateMultaData): Promise<Multa> {
    try {
      console.log(`📝 Actualizando multa ${id}:`, data);
      const response = await apiClient.put(`/multas/${id}`, data);
      console.log('✅ Multa actualizada exitosamente');
      return response.data;
    } catch (error) {
      console.error(`❌ Error actualizando multa ${id}:`, error);
      throw error;
    }
  }

  async deleteMulta(id: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando multa ${id}`);
      await apiClient.delete(`/multas/${id}`);
      console.log('✅ Multa eliminada exitosamente');
    } catch (error) {
      console.error(`❌ Error eliminando multa ${id}:`, error);
      throw error;
    }
  }

  // ===== ESTADÍSTICAS =====

  async getEstadisticas(comunidadId?: number): Promise<MultasEstadisticas> {
    try {
      const url = comunidadId 
        ? `/multas/estadisticas?comunidad_id=${comunidadId}`
        : '/multas/estadisticas';
      
      console.log('📊 Obteniendo estadísticas de multas');
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  async getResumen(comunidadId?: number): Promise<MultasResumen> {
    try {
      const url = comunidadId 
        ? `/multas/resumen?comunidad_id=${comunidadId}`
        : '/multas/resumen';
      
      console.log('📈 Obteniendo resumen de multas');
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo resumen:', error);
      throw error;
    }
  }

  // ===== GESTIÓN ESPECÍFICA =====

  async pagarMulta(id: number, datos: {
    monto_pagado: number;
    fecha_pago: string;
    metodo_pago: string;
    referencia_pago?: string;
    observaciones?: string;
  }): Promise<Multa> {
    try {
      console.log(`💳 Registrando pago de multa ${id}:`, datos);
      const response = await apiClient.post(`/multas/${id}/pagar`, datos);
      console.log('✅ Pago registrado exitosamente');
      return response.data;
    } catch (error) {
      console.error(`❌ Error registrando pago de multa ${id}:`, error);
      throw error;
    }
  }

  async apelarMulta(id: number, datos: {
    motivo_apelacion: string;
    evidencia_urls?: string[];
  }): Promise<Multa> {
    try {
      console.log(`⚖️ Registrando apelación de multa ${id}:`, datos);
      const response = await apiClient.post(`/multas/${id}/apelar`, datos);
      console.log('✅ Apelación registrada exitosamente');
      return response.data;
    } catch (error) {
      console.error(`❌ Error registrando apelación de multa ${id}:`, error);
      throw error;
    }
  }

  async resolverApelacion(id: number, datos: {
    estado_apelacion: 'aprobada' | 'rechazada';
    respuesta_apelacion: string;
  }): Promise<Multa> {
    try {
      console.log(`⚖️ Resolviendo apelación de multa ${id}:`, datos);
      const response = await apiClient.post(`/multas/${id}/resolver-apelacion`, datos);
      console.log('✅ Apelación resuelta exitosamente');
      return response.data;
    } catch (error) {
      console.error(`❌ Error resolviendo apelación de multa ${id}:`, error);
      throw error;
    }
  }

  async anularMulta(id: number, motivo: string): Promise<Multa> {
    try {
      console.log(`🚫 Anulando multa ${id}:`, motivo);
      const response = await apiClient.post(`/multas/${id}/anular`, { motivo });
      console.log('✅ Multa anulada exitosamente');
      return response.data;
    } catch (error) {
      console.error(`❌ Error anulando multa ${id}:`, error);
      throw error;
    }
  }

  // ===== NOTIFICACIONES =====

  async enviarNotificacion(id: number, tipo: 'email' | 'sms' | 'ambos'): Promise<void> {
    try {
      console.log(`📧 Enviando notificación ${tipo} para multa ${id}`);
      await apiClient.post(`/multas/${id}/notificar`, { tipo });
      console.log('✅ Notificación enviada exitosamente');
    } catch (error) {
      console.error(`❌ Error enviando notificación de multa ${id}:`, error);
      throw error;
    }
  }

  async enviarRecordatorio(ids: number[], tipo: 'email' | 'sms' | 'ambos'): Promise<void> {
    try {
      console.log(`📧 Enviando recordatorios ${tipo} para ${ids.length} multas`);
      await apiClient.post('/multas/recordatorio-masivo', { ids, tipo });
      console.log('✅ Recordatorios enviados exitosamente');
    } catch (error) {
      console.error('❌ Error enviando recordatorios:', error);
      throw error;
    }
  }

  // ===== ACTIVIDAD Y HISTORIAL =====

  async getActividades(multaId: number): Promise<MultaActividad[]> {
    try {
      console.log(`📋 Obteniendo actividades de multa ${multaId}`);
      const response = await apiClient.get(`/multas/${multaId}/actividades`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error obteniendo actividades de multa ${multaId}:`, error);
      throw error;
    }
  }

  // ===== TIPOS DE INFRACCIONES =====

  async getTiposInfraccion(): Promise<TipoInfraccion[]> {
    try {
      console.log('📋 Obteniendo tipos de infracciones');
      const response = await apiClient.get('/tipos-infraccion');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo tipos de infracciones:', error);
      throw error;
    }
  }

  // ===== EXPORTACIÓN =====

  async exportarMultas(filtros?: MultaFiltros, formato: 'excel' | 'pdf' = 'excel'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (filtros?.comunidad_id) params.append('comunidad_id', filtros.comunidad_id.toString());
      if (filtros?.estado) params.append('estado', filtros.estado);
      if (filtros?.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros?.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      
      params.append('formato', formato);
      
      console.log(`📄 Exportando multas en formato ${formato}`);
      const response = await apiClient.get(`/multas/exportar?${params.toString()}`, {
        responseType: 'blob'
      });
      
      console.log('✅ Exportación completada');
      return response.data;
    } catch (error) {
      console.error('❌ Error exportando multas:', error);
      throw error;
    }
  }

  // ===== UTILIDADES =====

  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(monto);
  }

  getEstadoColor(estado: Multa['estado']): string {
    const colores = {
      'pendiente': 'warning',
      'pagada': 'success',
      'vencida': 'danger',
      'apelada': 'info',
      'anulada': 'secondary'
    };
    return colores[estado] || 'primary';
  }

  getPrioridadColor(prioridad: Multa['prioridad']): string {
    const colores = {
      'baja': 'success',
      'media': 'warning',
      'alta': 'danger',
      'critica': 'dark'
    };
    return colores[prioridad] || 'primary';
  }

  calcularDiasVencimiento(fechaVencimiento: string): number {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  estaVencida(fechaVencimiento: string): boolean {
    return this.calcularDiasVencimiento(fechaVencimiento) < 0;
  }
}

// Exportar instancia única del servicio
const multasService = new MultasService();
export default multasService;