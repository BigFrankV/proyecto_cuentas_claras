import api from './api';
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
  async getMultas(filtros?: any): Promise<{ data: any[]; totalPaginas: number }> {
    try {
      const params: any = {};
      if (filtros?.comunidad_id) params.comunidad_id = filtros.comunidad_id;
      if (filtros?.estado) params.estado = filtros.estado;
      if (filtros?.search) params.search = filtros.search;
      if (filtros?.pagina) params.page = filtros.pagina;  // ✅ Agrega página
      const response = await api.get('/multas', { params });
      const data = response.data?.data ?? response.data;
      const totalPaginas = response.data?.totalPaginas ?? 1;
      return {
        data: (data || []).map(r => this.adaptMultaFromBackend(r)),
        totalPaginas
      };
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
      fecha_infraccion: this.formatearFechaParaBackend(data.fecha || data.fecha_infraccion),
      fecha_vencimiento: data.fecha_vencimiento
    };
    const response = await api.post('/multas', payload);
    const raw = response.data?.data ?? response.data;
    return this.adaptMultaFromBackend(raw);
  }

  async updateMulta(id: number, data: any): Promise<any> {
    try {
      // Usar la ruta plural /multas para que coincida con la mayoría de llamadas del frontend
      const response = await api.patch(`/multas/${id}`, data);
      // Normalizar distintos formatos de respuesta
      const raw = response.data?.data ?? response.data;
      return this.adaptMultaFromBackend(raw);
    } catch (error) {
      console.error(`❌ Error updating multa ${id}:`, error);
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

      // Usar endpoint específico si existe en backend
      const payload: any = {};
      if (motivo) payload.motivo_anulacion = motivo;
      const response = await api.patch(`/multas/${id}/anular`, payload);
      const raw = response.data?.data ?? response.data;
      console.log('✅ Multa anulada exitosamente');
      return this.adaptMultaFromBackend(raw);
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

  // Compatibilidad: delegar en adaptMultaFromBackend para evitar duplicación
  private adaptarMultaDelBackend(multaBackend: any): Multa {
    return this.adaptMultaFromBackend(multaBackend);
  }

  private adaptarMultasDelBackend(multasBackend: any[]): Multa[] {
    return (multasBackend || []).map(m => this.adaptMultaFromBackend(m));
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

  // Obtener historial de una multa (alias en español e inglés)
  async obtenerHistorial(id: number): Promise<any[]> {
    const response = await api.get(`/multas/${id}/historial`);
    return response.data?.data ?? response.data;
  }

  // Alias en inglés usado por el componente
  async getHistorial(id: number): Promise<any[]> {
    return this.obtenerHistorial(id);
  }

  // Obtener documentos/evidencias
  async getDocumentos(id: number): Promise<any[]> {
    const response = await api.get(`/multas/${id}/documentos`);
    return response.data?.data ?? response.data;
  }

  // Obtener apelaciones (lista)
  async getApelaciones(id: number): Promise<any[]> {
    const response = await api.get(`/multas/${id}/apelaciones`);
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