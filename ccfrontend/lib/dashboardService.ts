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
          0,
        ) || 0;
      const totalCargos =
        cargos.data?.reduce(
          (sum: number, cargo: any) => sum + (cargo.monto || 0),
          0,
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
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Obtener gastos por categoría para gráfico de barras
  async getGastosPorCategoria(
    comunidadId: number,
  ): Promise<GastoPorCategoria[]> {
    try {
      const [gastos, categorias] = await Promise.all([
        apiClient.get(`/gastos/comunidad/${comunidadId}`),
        apiClient.get(`/categorias-gasto/comunidad/${comunidadId}`),
      ]);

      // Agrupar gastos por categoría
      const gastosPorCategoria = new Map<string, number>();

      gastos.data?.forEach((gasto: any) => {
        const categoria = gasto.categoria || 'Sin categoría';
        const current = gastosPorCategoria.get(categoria) || 0;
        gastosPorCategoria.set(categoria, current + (gasto.monto || 0));
      });

      // Convertir a array con colores
      const colores = [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384',
        '#C9CBCF',
      ];

      return Array.from(gastosPorCategoria.entries()).map(
        ([categoria, total], index) => ({
          categoria,
          total,
          color: colores[index % colores.length] || '#8E8E8E',
        }),
      );
    } catch (error) {
      console.error('Error fetching gastos por categoria:', error);
      return [];
    }
  },

  // Obtener estado de pagos para gráfico circular
  async getEstadoPagos(comunidadId: number): Promise<EstadoPago[]> {
    try {
      const [pagos, cargos] = await Promise.all([
        apiClient.get(`/pagos/comunidad/${comunidadId}`),
        apiClient.get(`/cargos/comunidad/${comunidadId}`),
      ]);

      const pagosAplicados =
        pagos.data?.filter((pago: any) => pago.estado === 'aplicado')?.length ||
        0;
      const cargosPendientes =
        cargos.data?.filter((cargo: any) => cargo.estado === 'pendiente')
          ?.length || 0;
      const cargosVencidos =
        cargos.data?.filter((cargo: any) => cargo.estado === 'vencido')
          ?.length || 0;

      const total = pagosAplicados + cargosPendientes + cargosVencidos;

      if (total === 0) {
        return [];
      }

      return [
        {
          tipo: 'Pagos Aplicados',
          cantidad: pagosAplicados,
          porcentaje: Math.round((pagosAplicados / total) * 100),
          color: '#28a745',
        },
        {
          tipo: 'Cargos Pendientes',
          cantidad: cargosPendientes,
          porcentaje: Math.round((cargosPendientes / total) * 100),
          color: '#ffc107',
        },
        {
          tipo: 'Cargos Vencidos',
          cantidad: cargosVencidos,
          porcentaje: Math.round((cargosVencidos / total) * 100),
          color: '#dc3545',
        },
      ];
    } catch (error) {
      console.error('Error fetching estado pagos:', error);
      return [];
    }
  },

  // Obtener tendencias de emisiones para gráfico de líneas
  async getTendenciasEmisiones(
    comunidadId: number,
  ): Promise<TendenciaEmision[]> {
    try {
      const response = await apiClient.get(
        `/emisiones/comunidad/${comunidadId}`,
      );
      const emisiones = response.data || [];

      // Agrupar por mes y calcular totales
      const tendenciasPorMes = new Map<
        string,
        { monto: number; cantidad: number }
      >();

      emisiones.forEach((emision: any) => {
        const fecha = new Date(emision.fecha);
        const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

        const current = tendenciasPorMes.get(mesKey) || {
          monto: 0,
          cantidad: 0,
        };
        tendenciasPorMes.set(mesKey, {
          monto: current.monto + (emision.monto_total || 0),
          cantidad: current.cantidad + 1,
        });
      });

      // Convertir a array ordenado por fecha
      return Array.from(tendenciasPorMes.entries())
        .map(([fecha, datos]) => ({
          fecha,
          monto: datos.monto,
          cantidad: datos.cantidad,
        }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .slice(-6); // Últimos 6 meses
    } catch (error) {
      console.error('Error fetching tendencias emisiones:', error);
      return [];
    }
  },

  // Obtener consumos de medidores para métricas
  async getConsumosMedidores(comunidadId: number): Promise<ConsumoMedidor[]> {
    try {
      const medidores = await apiClient.get(
        `/medidores/comunidad/${comunidadId}`,
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
              `/medidores/${medidor.id}/consumos`,
            );
            const ultimoConsumo = consumos.data?.[0] || {};

            return {
              medidor: `${medidor.tipo} - ${medidor.ubicacion}`,
              consumo: ultimoConsumo.consumo || 0,
              periodo: ultimoConsumo.periodo || 'N/A',
              unidad: medidor.unidad_medida || 'L',
            };
          } catch (error) {
            return {
              medidor: `${medidor.tipo} - ${medidor.ubicacion}`,
              consumo: 0,
              periodo: 'N/A',
              unidad: medidor.unidad_medida || 'L',
            };
          }
        });

      return await Promise.all(consumosPromises);
    } catch (error) {
      console.error('Error fetching consumos medidores:', error);
      return [];
    }
  },

  // Obtener resumen completo del dashboard
  async getResumenCompleto(comunidadId: number): Promise<DashboardResumenCompleto> {
    try {
      const response = await apiClient.get(`/api/dashboard/comunidad/${comunidadId}/resumen-completo`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard resumen completo:', error);
      throw error;
    }
  },
};
