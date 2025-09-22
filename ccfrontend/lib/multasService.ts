import apiClient from './api';
import { 
  Multa, 
  MultaFiltros, 
  CreateMultaData, 
  UpdateMultaData,
  MultasEstadisticas,
  TipoInfraccion
} from '@/types/multas';

class MultasService {
  // ===== OPCIONES PREDEFINIDAS (SIN BD) =====
  
  getTiposInfraccionPredefinidos(): TipoInfraccion[] {
    return [
      { id: 'ruidos_molestos', nombre: 'Ruidos molestos', monto_base: 50000, categoria: 'Convivencia' },
      { id: 'mascotas_sin_correa', nombre: 'Mascotas sin correa', monto_base: 30000, categoria: 'Mascotas' },
      { id: 'estacionamiento_indebido', nombre: 'Estacionamiento indebido', monto_base: 40000, categoria: 'Estacionamiento' },
      { id: 'basura_fuera_horario', nombre: 'Basura fuera de horario', monto_base: 25000, categoria: 'Aseo' },
      { id: 'uso_inadecuado_areas', nombre: 'Uso inadecuado áreas comunes', monto_base: 60000, categoria: 'Áreas Comunes' },
      { id: 'no_recoger_desechos', nombre: 'No recoger desechos mascota', monto_base: 35000, categoria: 'Mascotas' },
      { id: 'fumar_prohibido', nombre: 'Fumar en áreas prohibidas', monto_base: 45000, categoria: 'Salud' },
      { id: 'trabajos_horario', nombre: 'Trabajos en horario no permitido', monto_base: 55000, categoria: 'Convivencia' },
      { id: 'danos_propiedad', nombre: 'Daños menores propiedad común', monto_base: 80000, categoria: 'Daños' },
      { id: 'normas_piscina', nombre: 'Incumplimiento normas piscina', monto_base: 40000, categoria: 'Áreas Comunes' }
    ];
  }

  // ===== CRUD ADAPTADO A TU BACKEND =====

  async getMultas(filtros?: MultaFiltros): Promise<Multa[]> {
    try {
      console.log('🔍 Obteniendo multas con filtros:', filtros);
      
      // ✅ Usar tu endpoint general
      const params = new URLSearchParams();
      
      if (filtros?.comunidad_id) params.append('comunidad_id', filtros.comunidad_id.toString());
      if (filtros?.estado) params.append('estado', filtros.estado);
      if (filtros?.search) params.append('search', filtros.search);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      const response = await apiClient.get(`/multas${queryString}`);
      
      console.log(`📋 ${response.data.length} multas obtenidas`);
      return this.adaptarMultasDelBackend(response.data);
    } catch (error) {
      console.error('❌ Error obteniendo multas:', error);
      throw error;
    }
  }

  async getMulta(id: number): Promise<Multa> {
    try {
      console.log(`🔍 Obteniendo multa ${id}`);
      const response = await apiClient.get(`/multas/${id}`);
      return this.adaptarMultaDelBackend(response.data);
    } catch (error) {
      console.error(`❌ Error obteniendo multa ${id}:`, error);
      throw error;
    }
  }

  async createMulta(data: CreateMultaData): Promise<Multa> {
    try {
      console.log('📝 Creando nueva multa:', data);
      
      // ✅ Adaptar datos para tu backend (estructura que espera)
      const backendData = {
        motivo: data.tipo_infraccion,
        descripcion: data.descripcion,
        monto: data.monto,
        fecha: this.formatearFechaParaBackend(data.fecha_infraccion),
        persona_id: null // Tu backend acepta null
      };
      
      console.log('📤 Enviando al backend:', backendData);
      
      // ✅ Usar tu endpoint POST existente
      const response = await apiClient.post(`/multas/unidad/${data.unidad_id}`, backendData);
      
      console.log('✅ Multa creada exitosamente:', response.data);
      return this.adaptarMultaDelBackend(response.data);
    } catch (error) {
      console.error('❌ Error creando multa:', error);
      throw error;
    }
  }

  async updateMulta(id: number, data: UpdateMultaData): Promise<Multa> {
    try {
      console.log(`📝 Actualizando multa ${id}:`, data);
      
      // ✅ Adaptar para tu endpoint PATCH
      const backendData: any = {};
      
      if (data.tipo_infraccion) backendData.motivo = data.tipo_infraccion;
      if (data.descripcion) backendData.descripcion = data.descripcion;
      if (data.monto) backendData.monto = data.monto;
      if (data.estado) backendData.estado = data.estado;
      if (data.fecha_pago) backendData.fecha_pago = data.fecha_pago;
      
      const response = await apiClient.patch(`/multas/${id}`, backendData);
      console.log('✅ Multa actualizada exitosamente');
      return this.adaptarMultaDelBackend(response.data);
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

  // ✅ USAR tu endpoint de estadísticas
  async getEstadisticas(comunidadId?: number): Promise<MultasEstadisticas> {
    try {
      console.log('📊 Obteniendo estadísticas');
      
      const params = comunidadId ? `?comunidad_id=${comunidadId}` : '';
      const response = await apiClient.get(`/multas/estadisticas${params}`);
      
      console.log('✅ Estadísticas obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      // Fallback con datos vacíos
      return {
        total: 0,
        pendientes: 0,
        pagadas: 0,
        vencidas: 0,
        apeladas: 0,
        anuladas: 0,
        monto_total: 0,
        monto_pendiente: 0,
        monto_recaudado: 0,
        monto_vencido: 0
      };
    }
  }

  // ===== ADAPTADORES PARA TU ESTRUCTURA DE BD =====
  
  private adaptarMultaDelBackend(multaBackend: any): Multa {
    console.log('🔄 Adaptando multa del backend:', multaBackend);
    
    return {
      // IDs
      id: multaBackend.id,
      numero: `M-${String(multaBackend.id).padStart(4, '0')}`,
      
      // Datos principales
      tipo_infraccion: multaBackend.motivo,
      descripcion: multaBackend.descripcion || '',
      monto: parseFloat(multaBackend.monto || 0),
      
      // Fechas
      fecha_infraccion: this.normalizarFechaFromDB(multaBackend.fecha),
      fecha_vencimiento: this.calcularFechaVencimiento(multaBackend.fecha),
      
      // ✅ Estados - usar tal como vienen de BD
      estado: multaBackend.estado || 'pendiente', // Tu BD usa 'pagado'/'vencido' 
      prioridad: 'media',
      
      // ✅ Relaciones (según tu BD)
      unidad_id: multaBackend.unidad_id,
      unidad_numero: multaBackend.unidad_numero || `Unidad ${multaBackend.unidad_id}`,
      comunidad_id: multaBackend.comunidad_id,
      comunidad_nombre: multaBackend.comunidad_nombre || `Comunidad ${multaBackend.comunidad_id}`,
      
      // ✅ Propietario (tu BD)
      propietario_id: multaBackend.persona_id,
      propietario_nombre: '',
      
      // Gestión (campos que tu BD no tiene - valores por defecto)
      created_by_user_id: 1,
      
      // ✅ Pagos (según tu BD)
      monto_pagado: parseFloat(multaBackend.monto_pagado || 0),
      fecha_pago: multaBackend.fecha_pago ? this.normalizarFechaFromDB(multaBackend.fecha_pago) : undefined,
      
      // Notificaciones (tu BD no tiene - valores por defecto)
      notificado_email: false,
      notificado_sms: false,
      
      // ✅ Timestamps (según tu BD)
      created_at: this.normalizarTimestampFromDB(multaBackend.created_at),
      updated_at: this.normalizarTimestampFromDB(multaBackend.updated_at)
    };
  }

  private adaptarMultasDelBackend(multasBackend: any[]): Multa[] {
    return multasBackend.map(multa => this.adaptarMultaDelBackend(multa));
  }

  // ✅ Formatear fecha para tu backend (DATE field)
  private formatearFechaParaBackend(fechaISO: string): string {
    try {
      if (!fechaISO) return new Date().toISOString().split('T')[0];
      
      // Si viene como '2024-12-22T14:30:00' del datetime-local
      if (fechaISO.includes('T')) {
        return fechaISO.split('T')[0]; // 'YYYY-MM-DD'
      }
      
      // Si ya está en formato DATE
      if (/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) {
        return fechaISO;
      }
      
      // Convertir otros formatos
      const fecha = new Date(fechaISO);
      return fecha.toISOString().split('T')[0];
    } catch (error) {
      console.error('❌ Error formateando fecha para backend:', error);
      return new Date().toISOString().split('T')[0];
    }
  }

  // ✅ Normalizar fecha DATE de MySQL
  private normalizarFechaFromDB(fecha: any): string {
    try {
      if (!fecha) return new Date().toISOString().split('T')[0];
      
      // Si viene como '2025-09-22' de MySQL DATE
      if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return fecha;
      }
      
      // Si viene como timestamp
      if (typeof fecha === 'string' && fecha.includes(' ')) {
        return fecha.split(' ')[0];
      }
      
      return new Date(fecha).toISOString().split('T')[0];
    } catch (error) {
      console.error('❌ Error normalizando fecha:', error);
      return new Date().toISOString().split('T')[0];
    }
  }

  // ✅ Normalizar timestamp DATETIME de MySQL
  private normalizarTimestampFromDB(timestamp: any): string {
    try {
      if (!timestamp) return new Date().toISOString();
      
      if (typeof timestamp === 'string') {
        const fechaObj = new Date(timestamp);
        if (!isNaN(fechaObj.getTime())) {
          return fechaObj.toISOString();
        }
      }
      
      return new Date().toISOString();
    } catch (error) {
      console.error('❌ Error normalizando timestamp:', error);
      return new Date().toISOString();
    }
  }

  // ✅ Calcular vencimiento (30 días)
  private calcularFechaVencimiento(fechaInfraccion: string): string {
    try {
      let fecha: Date;
      
      if (!fechaInfraccion) {
        fecha = new Date();
      } else if (typeof fechaInfraccion === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fechaInfraccion)) {
        fecha = new Date(fechaInfraccion + 'T00:00:00');
      } else {
        fecha = new Date(fechaInfraccion);
      }
      
      if (isNaN(fecha.getTime())) {
        fecha = new Date();
      }
      
      fecha.setDate(fecha.getDate() + 30);
      return fecha.toISOString().split('T')[0];
    } catch (error) {
      console.error('❌ Error calculando vencimiento:', error);
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 30);
      return fallback.toISOString().split('T')[0];
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
      'pagado': 'success',    // ✅ Tu BD usa 'pagado'
      'vencido': 'danger',    // ✅ Tu BD usa 'vencido' 
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

const multasService = new MultasService();
export default multasService;