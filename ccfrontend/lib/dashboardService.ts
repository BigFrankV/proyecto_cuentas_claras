/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import apiClient from './api';

export interface DashboardStats {
  totalGastos: number;
  totalCargos: number;
  pagosRecibidos: number;
  pagosPendientes: number;
  gastosUltimoMes: number;
  emisionesActivas: number;
}

export interface GastoPorCategoria {
  categoria: string;
  total: number;
  color: string;
}

export interface EstadoPago {
  tipo: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

export interface TendenciaEmision {
  fecha: string;
  monto: number;
  cantidad: number;
}

export interface ConsumoMedidor {
  medidor: string;
  consumo: number;
  periodo: string;
  unidad: string;
}

export interface DashboardKPIs {
  saldoTotal: number;
  saldoTotalChange: number;
  ingresosMes: number;
  ingresosMesChange: number;
  gastosMes: number;
  gastosMesChange: number;
  tasaMorosidad: number;
  tasaMorosidadChange: number;
}

export interface PagoReciente {
  unidad: string;
  monto: number;
  fecha: string;
  estado: string;
}

export interface UnidadMorosa {
  unidad: string;
  propietario: string;
  meses: number;
  deuda: number;
}

export interface ActividadProxima {
  titulo: string;
  descripcion: string;
  fecha: string;
}

export interface ReservaAmenidad {
  amenidad: string;
  unidad: string;
  usuario: string;
  fecha: string;
  estado: string;
}

// Interfaces para respuestas de la API
interface ApiPagoReciente {
  unidad: string;
  monto: number;
  fecha_pago: string;
  estado: string;
}

interface ApiUnidadMorosa {
  codigo_unidad: string;
  deuda_total: number;
  meses_morosos: number;
}

interface ApiActividadProxima {
  titulo: string;
  fecha_formateada: string;
}

interface ApiReservaAmenidad {
  amenidad: string;
  unidad_reserva: string;
  reservado_por: string;
  fecha_inicio: string;
  estado_descripcion: string;
}

export interface DashboardResumenCompleto {
  kpis: DashboardKPIs;
  pagosRecientes: PagoReciente[];
  unidadesMorosas: UnidadMorosa[];
  proximasActividades: ActividadProxima[];
  reservasAmenidades: ReservaAmenidad[];
}

// Servicio para datos del dashboard
export const dashboardService = {
  // Obtener estadísticas generales
  async getStats(comunidadId: number): Promise<DashboardStats> {
    try {
      const [gastos, cargos, pagos, emisiones] = await Promise.all([
        apiClient.get(`/gastos/comunidad/${comunidadId}`),
        apiClient.get(`/cargos/comunidad/${comunidadId}`),
        apiClient.get(`/pagos/comunidad/${comunidadId}`),
        apiClient.get(`/emisiones/comunidad/${comunidadId}`),
      ]);

      // Calcular estadísticas basadas en los datos obtenidos
      const totalGastos =
        gastos.data?.reduce(
          (sum: number, gasto: any) => sum + (gasto.monto || 0),
          0
        ) || 0;
      const totalCargos =
        cargos.data?.reduce(
          (sum: number, cargo: any) => sum + (cargo.monto || 0),
          0
        ) || 0;
      const pagosRecibidos =
        pagos.data?.filter((pago: any) => pago.estado === 'aplicado')?.length ||
        0;
      const pagosPendientes =
        cargos.data?.filter((cargo: any) => cargo.estado === 'pendiente')
          ?.length || 0;
      const gastosUltimoMes =
        gastos.data
          ?.filter((gasto: any) => {
            const fecha = new Date(gasto.fecha);
            const haceUnMes = new Date();
            haceUnMes.setMonth(haceUnMes.getMonth() - 1);
            return fecha >= haceUnMes;
          })
          ?.reduce((sum: number, gasto: any) => sum + (gasto.monto || 0), 0) ||
        0;
      const emisionesActivas =
        emisiones.data?.filter((emision: any) => emision.estado === 'activa')
          ?.length || 0;

      return {
        totalGastos,
        totalCargos,
        pagosRecibidos,
        pagosPendientes,
        gastosUltimoMes,
        emisionesActivas,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Obtener gastos por categoría para gráfico de barras
  async getGastosPorCategoria(
    comunidadId: number
  ): Promise<GastoPorCategoria[]> {
    try {
      const response = await apiClient.get(
        `/dashboard/comunidad/${comunidadId}/grafico-gastos-categoria`
      );

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data.map((item: any) => ({
        categoria: item.categoria || item.nombre || 'N/A',
        total: Number(item.total_gastos || item.total || 0),
        color: item.color || '#3498db',
      }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching gastos por categoría:', error);
      return [];
    }
  },

  // Obtener estado de pagos para gráfico circular
  async getEstadoPagos(comunidadId: number): Promise<EstadoPago[]> {
    try {
      const response = await apiClient.get(
        `/dashboard/comunidad/${comunidadId}/grafico-estado-pagos`
      );

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      const total = response.data.reduce(
        (sum: number, item: any) => sum + Number(item.cantidad_unidades || 0),
        0
      );

      return response.data.map((item: any) => ({
        tipo: item.categoria_pago || 'N/A',
        cantidad: Number(item.cantidad_unidades || 0),
        porcentaje:
          total > 0 ? (Number(item.cantidad_unidades || 0) / total) * 100 : 0,
        color: item.color || '#95a5a6',
      }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching estado de pagos:', error);
      return [];
    }
  },

  // Obtener tendencias de emisiones para gráfico de líneas
  async getTendenciasEmisiones(
    comunidadId: number
  ): Promise<TendenciaEmision[]> {
    try {
      const response = await apiClient.get(
        `/dashboard/comunidad/${comunidadId}/grafico-emisiones`
      );

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data.map((item: any) => ({
        fecha: item.periodo || item.fecha || 'N/A',
        monto: Number(item.monto_total_emisiones || item.monto || 0),
        cantidad: Number(item.cantidad_unidades || item.cantidad || 0),
      }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching tendencias de emisiones:', error);
      return [];
    }
  },

  // Obtener consumos de medidores para métricas
  async getConsumosMedidores(comunidadId: number): Promise<ConsumoMedidor[]> {
    try {
      const medidores = await apiClient.get(
        `/medidores/comunidad/${comunidadId}`
      );

      if (!medidores.data?.length) {
        return [];
      }

      // Obtener consumos de cada medidor (solo primeros 5 para el dashboard)
      const consumosPromises = medidores.data
        .slice(0, 5)
        .map(async (medidor: any) => {
          try {
            const consumos = await apiClient.get(
              `/medidores/${medidor.id}/consumos`
            );
            const ultimoConsumo = consumos.data?.[0] || {};

            return {
              medidor: `${medidor.tipo} - ${medidor.ubicacion}`,
              consumo: ultimoConsumo.consumo || 0,
              periodo: ultimoConsumo.periodo || 'N/A',
              unidad: medidor.unidad_medida || 'L',
            };
          } catch {
            return {
              medidor: `${medidor.tipo} - ${medidor.ubicacion}`,
              consumo: 0,
              periodo: 'N/A',
              unidad: medidor.unidad_medida || 'L',
            };
          }
        });

      return await Promise.all(consumosPromises);
    } catch {
      return [];
    }
  },

  // Obtener resumen completo del dashboard
  async getResumenCompleto(
    comunidadId: number
  ): Promise<DashboardResumenCompleto> {
    try {
      // Llamadas en paralelo para eficiencia
      const [resumenResponse, reservasResponse, kpisChanges] =
        await Promise.all([
          apiClient.get(`/dashboard/comunidad/${comunidadId}/resumen-completo`),
          apiClient.get(
            `/dashboard/comunidad/${comunidadId}/reservas-amenidades?limit=5`
          ),
          this.getKPIsChanges(comunidadId),
        ]);

      const resumen = resumenResponse.data;

      const getSaldoValue = (val: any) => {
        if (typeof val === 'object' && val !== null) {
          return Number(val.saldo_acumulado || val.saldo_total || 0);
        }
        return Number(val || 0);
      };

      const getSaldoChange = (val: any) => {
        if (typeof val === 'object' && val !== null) {
          return Number(val.variacion_porcentual || 0);
        }
        return 0;
      };

      const getIngresosValue = (val: any) => {
        if (typeof val === 'object' && val !== null) {
          return Number(val.ingresos_mes_actual || 0);
        }
        return Number(val || 0);
      };

      const getIngresosChange = (val: any) => {
        if (typeof val === 'object' && val !== null) {
          return Number(val.variacion_porcentual || 0);
        }
        return 0;
      };

      const getGastosValue = (val: any) => {
        if (typeof val === 'object' && val !== null) {
          return Number(val.gastos_mes_actual || 0);
        }
        return Number(val || 0);
      };

      const getGastosChange = (val: any) => {
        if (typeof val === 'object' && val !== null) {
          return Number(val.variacion_porcentual || 0);
        }
        return 0;
      };

      const kpis: DashboardKPIs = {
        saldoTotal: getSaldoValue(resumen.kpis?.saldo_total),
        saldoTotalChange: getSaldoChange(resumen.kpis?.saldo_total),
        ingresosMes: getIngresosValue(resumen.kpis?.ingresos_mes),
        ingresosMesChange: getIngresosChange(resumen.kpis?.ingresos_mes),
        gastosMes: getGastosValue(resumen.kpis?.gastos_mes),
        gastosMesChange: getGastosChange(resumen.kpis?.gastos_mes),
        tasaMorosidad:
          typeof resumen.kpis?.morosidad === 'object'
            ? Number(resumen.kpis.morosidad?.tasa_morosidad_actual || 0)
            : Number(resumen.kpis?.morosidad || 0),
        tasaMorosidadChange: kpisChanges.tasaMorosidadChange,
      };

      // Transformar pagos recientes
      const pagosRecientes: PagoReciente[] =
        resumen.tablas?.pagos_recientes?.map((pago: ApiPagoReciente) => ({
          unidad: pago.unidad || '',
          monto: pago.monto || 0,
          fecha: pago.fecha_pago || '',
          estado: pago.estado || '',
        })) || [];

      // Transformar unidades morosas
      const unidadesMorosas: UnidadMorosa[] =
        resumen.tablas?.unidades_morosas?.map((unidad: ApiUnidadMorosa) => ({
          unidad: unidad.codigo_unidad || '',
          propietario: '', // No disponible en la respuesta actual
          meses: unidad.meses_morosos || 0,
          deuda: unidad.deuda_total || 0,
        })) || [];

      // Transformar próximas actividades
      const proximasActividades: ActividadProxima[] =
        resumen.tablas?.proximas_actividades?.map(
          (actividad: ApiActividadProxima) => ({
            titulo: actividad.titulo || '',
            descripcion: `Vence: ${actividad.fecha_formateada}`,
            fecha: actividad.fecha_formateada || '',
          })
        ) || [];

      // Transformar reservas de amenidades
      const reservasAmenidades: ReservaAmenidad[] =
        reservasResponse.data?.map((reserva: ApiReservaAmenidad) => ({
          amenidad: reserva.amenidad || '',
          unidad: reserva.unidad_reserva || '',
          usuario: reserva.reservado_por || '',
          fecha: reserva.fecha_inicio || '',
          estado: reserva.estado_descripcion || '',
        })) || [];

      return {
        kpis,
        pagosRecientes,
        unidadesMorosas,
        proximasActividades,
        reservasAmenidades,
      };
    } catch {
      throw new Error('Error al obtener el resumen completo del dashboard');
    }
  },

  // Obtener cambios porcentuales de KPIs comparando con el mes anterior
  async getKPIsChanges(comunidadId: number): Promise<{
    saldoTotalChange: number;
    ingresosMesChange: number;
    gastosMesChange: number;
    tasaMorosidadChange: number;
  }> {
    try {
      // Obtener datos del mes actual y anterior
      const currentMonth = new Date();
      const previousMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      );

      const [currentKPIs, previousKPIs] = await Promise.all([
        this.getKPIsForMonth(comunidadId, currentMonth),
        this.getKPIsForMonth(comunidadId, previousMonth),
      ]);

      const calculateChange = (current: number, previous: number): number => {
        if (previous === 0) {
          return 0;
        }
        return Math.round(((current - previous) / Math.abs(previous)) * 100);
      };

      return {
        saldoTotalChange: calculateChange(
          currentKPIs.saldoTotal,
          previousKPIs.saldoTotal
        ),
        ingresosMesChange: calculateChange(
          currentKPIs.ingresosMes,
          previousKPIs.ingresosMes
        ),
        gastosMesChange: calculateChange(
          currentKPIs.gastosMes,
          previousKPIs.gastosMes
        ),
        tasaMorosidadChange: calculateChange(
          currentKPIs.tasaMorosidad,
          previousKPIs.tasaMorosidad
        ),
      };
    } catch {
      // En caso de error, devolver cambios en 0
      return {
        saldoTotalChange: 0,
        ingresosMesChange: 0,
        gastosMesChange: 0,
        tasaMorosidadChange: 0,
      };
    }
  },

  // Método auxiliar para obtener KPIs de un mes específico
  async getKPIsForMonth(
    comunidadId: number,
    date: Date
  ): Promise<{
    saldoTotal: number;
    ingresosMes: number;
    gastosMes: number;
    tasaMorosidad: number;
  }> {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    try {
      const response = await apiClient.get(
        `/dashboard/comunidad/${comunidadId}/kpis?year=${year}&month=${month}`
      );
      return {
        saldoTotal: response.data?.saldo_total || 0,
        ingresosMes: response.data?.ingresos_mes || 0,
        gastosMes: response.data?.gastos_mes || 0,
        tasaMorosidad: response.data?.tasa_morosidad || 0,
      };
    } catch {
      // Si el endpoint específico no existe, devolver valores por defecto
      return {
        saldoTotal: 0,
        ingresosMes: 0,
        gastosMes: 0,
        tasaMorosidad: 0,
      };
    }
  },
};
