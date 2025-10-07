import { api } from './api';
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

  async getMultas(filtros?: any): Promise<any[]> {
    try {
      const params: any = {};
      if (filtros?.comunidad_id) params.comunidad_id = filtros.comunidad_id;
      if (filtros?.estado) params.estado = filtros.estado;
      if (filtros?.search) params.search = filtros.search;
      const response = await api.get('/multas', { params });
      const rows = response.data?.data ?? response.data;
      return (rows || []).map(r => this.adaptMultaFromBackend(r));
    } catch (err) {
      console.error('❌ Error obteniendo multas:', err);
      throw err;
    }
  }

  // Helper: adaptar objeto que viene del backend a la forma que espera la UI
  private adaptMultaFromBackend(raw: any): any {
    if (!raw) return raw;
    return {
      id: raw.id,
      numero: raw.numero,
      comunidad_id: raw.comunidad_id,
      comunidad_nombre: raw.comunidad_nombre || raw.comunidadName,
      unidad_id: raw.unidad_id,
      unidad_numero: raw.unidad_numero,
      torre_nombre: raw.torre_nombre,
      edificio_nombre: raw.edificio_nombre,
      persona_id: raw.persona_id,
      propietario_nombre: raw.propietario_nombre,
      propietario_email: raw.propietario_email,
      tipo_infraccion: raw.motivo,         // backend usa 'motivo'
      motivo: raw.motivo,
      descripcion: raw.descripcion,
      monto: Number(raw.monto),
      estado: raw.estado,
      prioridad: raw.prioridad,
      fecha: raw.fecha,                     // backend usa 'fecha'
      fecha_infraccion: raw.fecha,          // alias para UI
      fecha_vencimiento: raw.fecha_vencimiento,
      fecha_pago: raw.fecha_pago,
      fecha_anulacion: raw.fecha_anulacion,
      motivo_anulacion: raw.motivo_anulacion,
      anulado_por: raw.anulado_por,
      anulado_por_username: raw.anulado_por_username,
      created_at: raw.created_at,
      updated_at: raw.updated_at
    };
  }

  async getMulta(id: number): Promise<any> {
    const response = await api.get(`/multas/${id}`);
    const raw = response.data?.data ?? response.data;
    return this.adaptMultaFromBackend(raw);
  }

  async createMulta(data: any): Promise<any> {
    const payload = {
      unidad_id: data.unidad_id,
      comunidad_id: data.comunidad_id,
      tipo_infraccion: data.tipo_infraccion || data.motivo,
      motivo: data.tipo_infraccion || data.motivo, // backend expects tipo_infraccion but stores motivo
      descripcion: data.descripcion,
      monto: data.monto,
      prioridad: data.prioridad,
      fecha_infraccion: data.fecha || data.fecha_infraccion,
      fecha_vencimiento: data.fecha_vencimiento
    };
    const response = await api.post('/multas', payload);
    const raw = response.data?.data ?? response.data;
    return this.adaptMultaFromBackend(raw);
  }

  async updateMulta(id: number, data: UpdateMultaData): Promise<Multa> {
    try {
      console.log(`📝 Actualizando multa ${id}:`, data);

      // ✅ Adaptar para tu endpoint PATCH
      const backendData: any = {};

      if (data.tipo_infraccion) backendData.motivo = data.tipo_infraccion;
      if (data.descripcion) backendData.descripcion = data.descripcion;
      if (data.monto) backendData.monto = data.monto;
      if (data.estado) {
        // 🔧 MAPEAR estados largos a valores cortos que acepta la DB
        const estadoMap: { [key: string]: string } = {
          'pendiente': 'pendiente',  // Mantener si es corto
          'pagado': 'pagado',        // Mantener si es corto  
          'vencido': 'vencido',      // Mantener si es corto
          'apelada': 'apelada',      // Mantener si es corto
          'anulada': 'anulada'       // Mantener si es corto
        };
        
        backendData.estado = estadoMap[data.estado] || data.estado.substring(0, 10); // Truncar a 10 chars max
        console.log(`🔄 Estado mapeado: '${data.estado}' -> '${backendData.estado}'`);
      }
      if (data.fecha_pago) backendData.fecha_pago = data.fecha_pago;

      console.log('📤 Datos a enviar al backend:', backendData);

      // � Volver al endpoint normal - el problema era el tamaño del estado
      const response = await api.patch(`/multas/${id}`, backendData);
      const raw = response.data?.data ?? response.data;
      console.log('✅ Multa actualizada exitosamente');
      return this.adaptarMultaDelBackend(raw);
      
    } catch (error) {
      console.error(`❌ Error actualizando multa ${id}:`, error);
      throw error;
    }
  }

  async deleteMulta(id: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando multa ${id}`);
      await api.delete(`/multas/${id}`);
      console.log('✅ Multa eliminada exitosamente');
    } catch (error) {
      console.error(`❌ Error eliminando multa ${id}:`, error);
      throw error;
    }
  }

  async anularMulta(id: number, motivo?: string): Promise<Multa> {
    try {
      console.log(`🚫 Anulando multa ${id}`);
      
      const backendData: any = {
        estado: 'anulada'  // Usar valor corto
      };
      
      // Si se proporciona un motivo, agregarlo a la descripción
      if (motivo) {
        const multaActual = await this.getMulta(id);
        backendData.descripcion = multaActual.descripcion + 
          `\n\n[ANULADA] ${new Date().toLocaleDateString('es-CL')}: ${motivo}`;
      }
      
      console.log('📤 Datos para anular:', backendData);
      
      const response = await api.patch(`/multas/${id}`, backendData);
      const raw = response.data?.data ?? response.data;
      console.log('✅ Multa anulada exitosamente');
      return this.adaptarMultaDelBackend(raw);
    } catch (error) {
      console.error(`❌ Error anulando multa ${id}:`, error);
      throw error;
    }
  }

  // ✅ USAR tu endpoint de estadísticas
  async getEstadisticas(comunidadId?: number): Promise<any> {
    const params = comunidadId ? { comunidad_id: comunidadId } : undefined;
    const response = await api.get('/multas/estadisticas', { params });
    return response.data?.data ?? response.data;
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

  // ✅ Agregar método faltante para la página de detalle
  async getMultaById(id: number): Promise<Multa> {
    return this.getMulta(id);
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

  getEstadoLabel(estado: Multa['estado']): string {
    const labels = {
      'pendiente': 'Pendiente de Pago',
      'pagado': 'Pagado',
      'vencido': 'Vencido',
      'apelada': 'En Apelación',
      'anulada': 'Anulada'
    };
    return labels[estado] || estado;
  }

  // ===== API HELPERS (aliases usados por las páginas actuales) =====

  // Obtener historial de una multa
  async obtenerHistorial(id: number): Promise<any> {
    const response = await api.get(`/multas/${id}/historial`);
    return response.data?.data ?? response.data;
  }

  // Registrar pago (wrapper). Backend esperado: POST /multas/:id/registrar-pago
  async registrarPago(id: number, pagoData: { fecha_pago: string; metodo_pago?: string; referencia?: string; monto?: number; }): Promise<Multa> {
    const response = await api.post(`/multas/${id}/registrar-pago`, pagoData);
    const raw = response.data?.data ?? response.data;
    return this.adaptarMultaDelBackend(raw);
  }

  // Crear apelación (wrapper). Backend esperado: POST /multas/:id/apelacion
  async crearApelacion(id: number, body: { motivo: string; documentos_json?: any[]; }): Promise<any> {
    const response = await api.post(`/multas/${id}/apelacion`, body);
    return response.data?.data ?? response.data;
  }

  // Eliminar multa (alias en español)
  async eliminarMulta(id: number): Promise<void> {
    await api.delete(`/multas/${id}`);
  }
}

// ✅ CREAR LA INSTANCIA Y EXPORTARLA
const multasService = new MultasService();

export default multasService;
export const getMultaById = (id: number) => multasService.getMulta(id);
export const createMulta = (data: any) => multasService.createMulta(data);