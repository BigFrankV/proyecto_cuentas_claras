/* eslint-disable @typescript-eslint/no-explicit-any */
// Servicio completo para unidades, basado en el backend de unidades.js
import api from './api';

class UnidadesService {
  // ===== LISTADOS Y FILTROS =====
  async getUnidades(
    params?: any,
  ): Promise<{ data: any[]; totalPaginas?: number }> {
    // eslint-disable-next-line no-console
    // eslint-disable-next-line no-console`n    console.log('Frontend: Llamando getUnidades con params:', params);
    try {
      const response = await api.get('/unidades', { params });
      // eslint-disable-next-line no-console
      console.log(
        'Frontend: Respuesta getUnidades:',
        response.status,
        response.data,
      );
      const data = response.data?.data ?? response.data;
      const totalPaginas = response.data?.totalPaginas ?? 1;
      return {
        data: (data || []).map(r => this.adaptUnidadFromBackend(r)),
        totalPaginas,
      };
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(
        'Frontend: Error en getUnidades:',
        err.response?.status,
        err.message,
      );
      throw err;
    }
  }

  async getUnidadesPorComunidad(
    comunidadId: number,
    params?: any,
  ): Promise<any[]> {
    const response = await api.get(`/unidades/comunidad/${comunidadId}`, {
      params,
    });
    return response.data?.data ?? response.data ?? [];
  }

  async buscarUnidades(q: string): Promise<any[]> {
    const response = await api.get('/unidades/search', { params: { q } });
    return response.data?.data ?? response.data ?? [];
  }

  async validarBodega(comunidadId: number, nroBodega: string): Promise<any> {
    const response = await api.get('/unidades/validate/bodega', {
      params: { comunidad_id: comunidadId, nro_bodega: nroBodega },
    });
    return response.data;
  }

  async validarEstacionamiento(
    comunidadId: number,
    nroEstacionamiento: string,
  ): Promise<any> {
    const response = await api.get('/unidades/validate/estacionamiento', {
      params: {
        comunidad_id: comunidadId,
        nro_estacionamiento: nroEstacionamiento,
      },
    });
    return response.data;
  }

  // ===== VISTAS DETALLADAS =====
  async getUnidad(id: number): Promise<any> {
    const response = await api.get(`/unidades/${id}`);
    const raw = response.data?.data ?? response.data;
    return this.adaptUnidadFromBackend(raw);
  }

  async getUnidadSummary(id: number): Promise<any> {
    const response = await api.get(`/unidades/${id}/summary`);
    return response.data?.data ?? response.data;
  }

  async getUnidadCuentas(id: number): Promise<any[]> {
    const response = await api.get(`/unidades/${id}/cuentas`);
    return response.data?.data ?? response.data ?? [];
  }

  async getUnidadPagos(id: number): Promise<any[]> {
    const response = await api.get(`/unidades/${id}/pagos`);
    return response.data?.data ?? response.data ?? [];
  }

  async getUnidadMedidores(id: number): Promise<any[]> {
    const response = await api.get(`/unidades/${id}/medidores`);
    return response.data?.data ?? response.data ?? [];
  }

  async getUnidadResidentes(id: number, activo?: boolean): Promise<any[]> {
    const params = activo ? { activo: '1' } : {};
    const response = await api.get(`/unidades/${id}/residentes`, { params });
    return response.data?.data ?? response.data ?? [];
  }

  async getUnidadTickets(id: number): Promise<any[]> {
    const response = await api.get(`/unidades/${id}/tickets`);
    return response.data?.data ?? response.data ?? [];
  }

  async getUnidadMultas(id: number): Promise<any[]> {
    const response = await api.get(`/unidades/${id}/multas`);
    return response.data?.data ?? response.data ?? [];
  }

  async getUnidadReservas(id: number): Promise<any[]> {
    const response = await api.get(`/unidades/${id}/reservas`);
    return response.data?.data ?? response.data ?? [];
  }

  // ===== CRUD BÁSICO =====
  async createUnidad(comunidadId: number, data: any): Promise<any> {
    const payload = {
      edificio_id: data.edificio_id,
      torre_id: data.torre_id,
      codigo: data.numero,
      alicuota: data.alicuota,
      m2_utiles: data.superficie,
      m2_terrazas: data.m2_terrazas,
      nro_bodega: data.nro_bodega,
      nro_estacionamiento: data.nro_estacionamiento,
      activa: data.activa,
    };
    const response = await api.post(
      `/unidades/comunidad/${comunidadId}`,
      payload,
    );
    return response.data?.data ?? response.data;
  }

  async updateUnidad(id: number, data: any): Promise<any> {
    const response = await api.patch(`/unidades/${id}`, data);
    const raw = response.data?.data ?? response.data;
    return this.adaptUnidadFromBackend(raw);
  }

  async deleteUnidad(id: number): Promise<void> {
    await api.delete(`/unidades/${id}`);
  }

  // ===== CRUD TENENCIAS =====
  async getUnidadTenencias(id: number, activo?: boolean): Promise<any[]> {
    const params = activo ? { activo: '1' } : {};
    const response = await api.get(`/unidades/${id}/tenencias`, { params });
    return response.data?.data ?? response.data ?? [];
  }

  async createTenencia(id: number, data: any): Promise<any> {
    const response = await api.post(`/unidades/${id}/tenencias`, data);
    return response.data?.data ?? response.data;
  }

  async updateTenencia(tenenciaId: number, data: any): Promise<any> {
    const response = await api.patch(`/unidades/tenencias/${tenenciaId}`, data);
    return response.data?.data ?? response.data;
  }

  async deleteTenencia(tenenciaId: number): Promise<void> {
    await api.delete(`/unidades/tenencias/${tenenciaId}`);
  }

  // ===== CRUD PAGOS =====
  async createPago(id: number, data: any): Promise<any> {
    const response = await api.post(`/unidades/${id}/pagos`, data);
    return response.data?.data ?? response.data;
  }

  async updatePago(pagoId: number, data: any): Promise<any> {
    const response = await api.patch(`/unidades/pagos/${pagoId}`, data);
    return response.data?.data ?? response.data;
  }

  async deletePago(pagoId: number): Promise<void> {
    await api.delete(`/unidades/pagos/${pagoId}`);
  }

  async createPagoAplicacion(pagoId: number, data: any): Promise<any> {
    const response = await api.post(
      `/unidades/pagos/${pagoId}/aplicaciones`,
      data,
    );
    return response.data?.data ?? response.data;
  }

  async deletePagoAplicacion(id: number): Promise<void> {
    await api.delete(`/unidades/pago_aplicaciones/${id}`);
  }

  // ===== CRUD MEDIDORES =====
  async createMedidor(id: number, data: any): Promise<any> {
    const response = await api.post(`/unidades/${id}/medidores`, data);
    return response.data?.data ?? response.data;
  }

  async updateMedidor(medidorId: number, data: any): Promise<any> {
    const response = await api.patch(`/unidades/medidores/${medidorId}`, data);
    return response.data?.data ?? response.data;
  }

  async deleteMedidor(medidorId: number): Promise<void> {
    await api.delete(`/unidades/medidores/${medidorId}`);
  }

  async createLecturaMedidor(medidorId: number, data: any): Promise<any> {
    const response = await api.post(
      `/unidades/medidores/${medidorId}/lecturas`,
      data,
    );
    return response.data?.data ?? response.data;
  }

  // ===== CRUD MULTAS =====
  async createMulta(id: number, data: any): Promise<any> {
    const response = await api.post(`/unidades/${id}/multas`, data);
    return response.data?.data ?? response.data;
  }

  async updateMulta(multaId: number, data: any): Promise<any> {
    const response = await api.patch(`/unidades/multas/${multaId}`, data);
    return response.data?.data ?? response.data;
  }

  async deleteMulta(multaId: number): Promise<void> {
    await api.delete(`/unidades/multas/${multaId}`);
  }

  // ===== CRUD RESERVAS =====
  async createReserva(id: number, data: any): Promise<any> {
    const response = await api.post(`/unidades/${id}/reservas`, data);
    return response.data?.data ?? response.data;
  }

  async updateReserva(reservaId: number, data: any): Promise<any> {
    const response = await api.patch(`/unidades/reservas/${reservaId}`, data);
    return response.data?.data ?? response.data;
  }

  async deleteReserva(reservaId: number): Promise<void> {
    await api.delete(`/unidades/reservas/${reservaId}`);
  }

  // ===== CRUD TICKETS =====
  async createTicket(id: number, data: any): Promise<any> {
    const response = await api.post(`/unidades/${id}/tickets`, data);
    return response.data?.data ?? response.data;
  }

  async updateTicket(ticketId: number, data: any): Promise<any> {
    const response = await api.patch(`/unidades/tickets/${ticketId}`, data);
    return response.data?.data ?? response.data;
  }

  async deleteTicket(ticketId: number): Promise<void> {
    await api.delete(`/unidades/tickets/${ticketId}`);
  }

  // ===== CRUD CUENTAS =====
  async createCuenta(id: number, data: any): Promise<any> {
    const response = await api.post(`/unidades/${id}/cuentas`, data);
    return response.data?.data ?? response.data;
  }

  async addDetalleCuenta(cuentaId: number, data: any): Promise<any> {
    const response = await api.post(
      `/unidades/cuentas/${cuentaId}/detalle`,
      data,
    );
    return response.data?.data ?? response.data;
  }

  // ===== REPORTES =====
  async getReporteSaldos(comunidadId: number): Promise<any[]> {
    const response = await api.get('/unidades/report/saldos', {
      params: { comunidad_id: comunidadId },
    });
    return response.data?.data ?? response.data ?? [];
  }

  // ===== DROPDOWNS =====
  async getDropdownComunidades(): Promise<any[]> {
    const response = await api.get('/unidades/dropdowns/comunidades');
    return response.data?.data ?? response.data ?? [];
  }

  async getDropdownEdificios(comunidadId?: number): Promise<any[]> {
    const params = comunidadId ? { comunidad_id: comunidadId } : {};
    const response = await api.get('/unidades/dropdowns/edificios', { params });
    return response.data?.data ?? response.data ?? [];
  }

  async getDropdownTorres(edificioId?: number): Promise<any[]> {
    const params = edificioId ? { edificio_id: edificioId } : {};
    const response = await api.get('/unidades/dropdowns/torres', { params });
    return response.data?.data ?? response.data ?? [];
  }

  async getDropdownUnidades(torreId?: number): Promise<any[]> {
    const params = torreId ? { torre_id: torreId } : {};
    const response = await api.get('/unidades/dropdowns/unidades', { params });
    return response.data?.data ?? response.data ?? [];
  }

  // ===== ADAPTADORES =====
  private adaptUnidadFromBackend(raw: any): any {
    if (!raw) {
      return raw;
    }
    return {
      id: raw.id,
      numero: raw.numero || raw.codigo,
      piso: raw.piso || 0,
      torre: raw.torre_nombre || raw.torre,
      edificio: raw.edificio_nombre || raw.edificio,
      comunidad: raw.comunidad_nombre || raw.comunidad,
      tipo: raw.tipo || 'Departamento',
      superficie: raw.m2_utiles || raw.superficie || 0,
      m2_terrazas: raw.m2_terrazas || 0,
      alicuota: raw.alicuota || 0,
      nro_estacionamiento: raw.nro_estacionamiento || 0,
      nro_bodega: raw.nro_bodega || 0,
      estado: raw.activa ? 'Activa' : 'Inactiva',
      propietario: raw.propietario_nombre || undefined,
      residente: raw.residente_nombre || undefined,
      saldoPendiente: raw.saldo_total || 0,
      ultimoPago: raw.ultimo_pago_fecha || undefined,
      fechaCreacion: raw.created_at || undefined,
    };
  }

  // ===== UTILIDADES =====
  formatearSuperficie(m2: number): string {
    return `${m2} m²`;
  }

  getEstadoColor(estado: string): string {
    return estado === 'Activa' ? 'success' : 'danger';
  }
}

// Instancia y export
const unidadesService = new UnidadesService();

export default unidadesService;
export const getUnidadById = (id: number) => unidadesService.getUnidad(id);
export const createUnidad = (comunidadId: number, data: any) =>
  unidadesService.createUnidad(comunidadId, data);
export const updateUnidad = (id: number, data: any) =>
  unidadesService.updateUnidad(id, data);
export const deleteUnidad = (id: number) => unidadesService.deleteUnidad(id);
export const getUnidades = (params?: any) =>
  unidadesService.getUnidades(params);
export const getDropdownComunidades = () =>
  unidadesService.getDropdownComunidades();
// Agrega más exports según necesites

