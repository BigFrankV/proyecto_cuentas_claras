import apiClient from './api';
import { Comunidad, ComunidadDetalle, ParametrosCobranza, ComunidadFormData, ComunidadFiltros } from '@/types/comunidades';

class ComunidadesService {
  private baseUrl = '/comunidades';

  // Métodos CRUD básicos
  async getComunidades(filtros?: ComunidadFiltros): Promise<Comunidad[]> {
    try {
      const params = new URLSearchParams();
      
      if (filtros?.busqueda) params.append('nombre', filtros.busqueda);
      if (filtros?.direccion) params.append('direccion', filtros.direccion);

      const response = await apiClient.get(`${this.baseUrl}${params.toString() ? `?${params.toString()}` : ''}`);
      return response.data.map((comunidad: any) => this.normalizeComunidad(comunidad));
    } catch (error) {
      console.error('Error fetching comunidades:', error);
      // Retornar datos de prueba mientras no existe el backend
      return this.getMockComunidades(filtros);
    }
  }

  async getComunidadById(id: number): Promise<ComunidadDetalle> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return this.normalizeComunidad(response.data) as ComunidadDetalle;
    } catch (error) {
      console.error(`Error fetching comunidad ${id}:`, error);
      return this.getMockComunidadDetalle(id);
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
      const response = await apiClient.get(`${this.baseUrl}/${id}/estadisticas`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching estadisticas for comunidad ${id}:`, error);
      return {
        totalIngresos: 0,
        ingresosPagados: 0,
        ingresosPendientes: 0,
        serviciosBasicos: 0,
        mantenimiento: 0,
        administracion: 0
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
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'imagen' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.post(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating comunidad:', error);
      throw error;
    }
  }

  async updateComunidad(id: number, data: Partial<ComunidadFormData>): Promise<Comunidad> {
    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'imagen' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.put(`${this.baseUrl}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
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
  async getParametrosCobranza(comunidadId: number): Promise<ParametrosCobranza> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${comunidadId}/parametros`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching parametros for comunidad ${comunidadId}:`, error);
      return this.getMockParametrosCobranza(comunidadId);
    }
  }

  async updateParametrosCobranza(comunidadId: number, parametros: Partial<ParametrosCobranza>): Promise<ParametrosCobranza> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${comunidadId}/parametros`, parametros);
      return response.data;
    } catch (error) {
      console.error(`Error updating parametros for comunidad ${comunidadId}:`, error);
      throw error;
    }
  }

  // Métodos para estadísticas
  async getEstadisticasComunidad(comunidadId: number): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${comunidadId}/estadisticas`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching estadisticas for comunidad ${comunidadId}:`, error);
      return this.getMockEstadisticas(comunidadId);
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
      minimumFractionDigits: 0
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

  // Función para normalizar datos de comunidad
  private normalizeComunidad(comunidad: any): Comunidad {
    return {
      ...comunidad,
      totalUnidades: comunidad.totalUnidades || 0,
      unidadesOcupadas: comunidad.unidadesOcupadas || 0,
      totalResidentes: comunidad.totalResidentes || 0,
      saldoPendiente: comunidad.saldoPendiente || 0,
      ingresosMensuales: comunidad.ingresosMensuales || 0,
      gastosMensuales: comunidad.gastosMensuales || 0,
      morosidad: comunidad.morosidad || 0
    };
  }

  // Datos de prueba para desarrollo
  private getMockComunidades(filtros?: ComunidadFiltros): Comunidad[] {
    const comunidades: Comunidad[] = [
      {
        id: 1,
        nombre: 'Condominio Las Palmas',
        direccion: 'Av. Las Condes 1234, Las Condes, Santiago',
        tipo: 'Condominio',
        estado: 'Activa',
        administrador: 'Patricia Contreras',
        telefono: '+56 9 8765 4321',
        email: 'admin@laspalmas.cl',
        imagen: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        fechaCreacion: '2023-01-15',
        fechaActualizacion: '2024-09-15',
        totalUnidades: 45,
        unidadesOcupadas: 42,
        totalResidentes: 158,
        saldoPendiente: 2450000,
        ingresosMensuales: 15800000,
        gastosMensuales: 12300000,
        morosidad: 8.5
      },
      {
        id: 2,
        nombre: 'Edificio Torre Norte',
        direccion: 'Calle Providencia 567, Providencia, Santiago',
        tipo: 'Edificio',
        estado: 'Activa',
        administrador: 'Carlos Mendoza',
        telefono: '+56 2 2345 6789',
        email: 'admin@torrenorte.cl',
        imagen: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        fechaCreacion: '2023-03-20',
        fechaActualizacion: '2024-09-10',
        totalUnidades: 28,
        unidadesOcupadas: 26,
        totalResidentes: 89,
        saldoPendiente: 890000,
        ingresosMensuales: 8400000,
        gastosMensuales: 7200000,
        morosidad: 3.2
      },
      {
        id: 3,
        nombre: 'Conjunto Villa Verde',
        direccion: 'Pasaje Los Robles 890, Ñuñoa, Santiago',
        tipo: 'Conjunto Residencial',
        estado: 'Activa',
        administrador: 'María González',
        telefono: '+56 9 1234 5678',
        email: 'contacto@villaverde.cl',
        imagen: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        fechaCreacion: '2023-06-10',
        fechaActualizacion: '2024-09-12',
        totalUnidades: 32,
        unidadesOcupadas: 30,
        totalResidentes: 112,
        saldoPendiente: 1250000,
        ingresosMensuales: 9600000,
        gastosMensuales: 8100000,
        morosidad: 5.8
      }
    ];

    // Aplicar filtros si existen
    if (!filtros) return comunidades.map(c => this.normalizeComunidad(c));

    return comunidades
      .filter(comunidad => {
        const matchBusqueda = !filtros.busqueda || 
          comunidad.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
          comunidad.direccion.toLowerCase().includes(filtros.busqueda.toLowerCase());
        
        const matchTipo = !filtros.tipo || comunidad.tipo === filtros.tipo;
        const matchEstado = !filtros.estado || comunidad.estado === filtros.estado;
        const matchAdministrador = !filtros.administrador || 
          comunidad.administrador.toLowerCase().includes(filtros.administrador.toLowerCase());

        return matchBusqueda && matchTipo && matchEstado && matchAdministrador;
      })
      .map(c => this.normalizeComunidad(c));
  }

  private getMockComunidadDetalle(id: number): ComunidadDetalle {
    const comunidad = this.getMockComunidades().find(c => c.id === id);
    if (!comunidad) throw new Error('Comunidad no encontrada');

    return {
      ...comunidad,
      descripcion: 'Condominio residencial con excelente ubicación y amenidades completas.',
      horarioAtencion: 'Lunes a Viernes: 9:00 - 18:00, Sábados: 9:00 - 13:00',
      reglamento: 'Reglamento interno disponible en administración.',
      amenidades: [
        { id: 1, nombre: 'Piscina', estado: 'Disponible', requiereReserva: false },
        { id: 2, nombre: 'Gimnasio', estado: 'Disponible', requiereReserva: true, costoReserva: 5000 },
        { id: 3, nombre: 'Salón de eventos', estado: 'Disponible', requiereReserva: true, costoReserva: 25000 }
      ],
      edificios: [
        { id: 1, nombre: 'Torre A', pisos: 12, unidadesPorPiso: 2, totalUnidades: 24, estado: 'Activo' },
        { id: 2, nombre: 'Torre B', pisos: 10, unidadesPorPiso: 2, totalUnidades: 20, estado: 'Activo' }
      ],
      contactos: [
        { id: 1, nombre: 'Patricia Contreras', cargo: 'Administradora', telefono: '+56 9 8765 4321', email: 'patricia@laspalmas.cl', esContactoPrincipal: true },
        { id: 2, nombre: 'Juan Pérez', cargo: 'Conserje', telefono: '+56 9 1111 2222', email: 'conserje@laspalmas.cl', esContactoPrincipal: false }
      ],
      documentos: [
        { id: 1, nombre: 'Reglamento Interno 2024', tipo: 'Reglamento', url: '/docs/reglamento.pdf', fechaSubida: '2024-01-15', tamano: 2048576 },
        { id: 2, nombre: 'Acta Asamblea Marzo 2024', tipo: 'Acta', url: '/docs/acta-marzo-2024.pdf', fechaSubida: '2024-03-20', tamano: 1024768 }
      ]
    };
  }

  private getMockParametrosCobranza(comunidadId: number): ParametrosCobranza {
    return {
      id: 1,
      comunidadId,
      diasGracia: 5,
      tasaMora: 2.5,
      calculoInteres: 'diario',
      interesMaximo: 5.0,
      aplicacionInteres: 'capital',
      tipoRedondeo: 'normal',
      politicaPago: 'antiguos',
      ordenAplicacion: 'interes-capital',
      diaEmision: 1,
      diaVencimiento: 10,
      notificacionesAuto: true,
      notificacion3Dias: true,
      notificacion1Dia: true,
      notificacionVencido: true,
      pagoTransferencia: true,
      pagoWebpay: true,
      pagoKhipu: false,
      pagoEfectivo: true,
      cuentaBancaria: {
        banco: 'banco-estado',
        tipoCuenta: 'corriente',
        numeroCuenta: '000123456789',
        rutTitular: '76.123.456-7',
        emailConfirmacion: 'pagos@laspalmas.cl'
      },
      multasPredefinidas: [
        {
          id: 1,
          descripcion: 'Ruidos molestos',
          monto: 50000,
          activa: true,
          fechaCreacion: '2023-01-15'
        },
        {
          id: 2,
          descripcion: 'Estacionamiento en lugar no asignado',
          monto: 30000,
          activa: true,
          fechaCreacion: '2023-01-15'
        },
        {
          id: 3,
          descripcion: 'Incumplimiento reglamento interno',
          monto: 40000,
          activa: false,
          fechaCreacion: '2023-01-15'
        }
      ],
      fechaCreacion: '2023-01-15T10:00:00Z',
      fechaActualizacion: '2023-08-12T15:30:00Z',
      creadoPor: 'Patricia Contreras',
      actualizadoPor: 'Patricia Contreras'
    };
  }

  private getMockEstadisticas(comunidadId: number): any {
    return {
      unidadesOcupadas: 42,
      totalUnidades: 45,
      ocupacion: 93.3,
      ingresosTotales: 15800000,
      gastosTotales: 12300000,
      saldoActual: 3500000,
      morosidad: 8.5,
      pagosAlDia: 38,
      pagosMorosos: 4,
      proximosVencimientos: 12
    };
  }
}

export default new ComunidadesService();