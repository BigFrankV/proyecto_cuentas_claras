// =========================================
// TIPOS PARA CATEGORÍAS DE GASTO
// =========================================

export type StatusCategoria = 'active' | 'inactive';

export const STATUS_CATEGORIA = {
  active: { label: 'Activa', color: 'success' },
  inactive: { label: 'Inactiva', color: 'secondary' },
} as const;

export interface CategoriaGasto {
  id: number;
  comunidad_id: number;
  nombre: string;
  tipo: string;
  cta_contable?: string;
  activa: boolean;
  status: StatusCategoria;
  comunidad_nombre?: string;
  created_at: string;
  updated_at: string;
  // Campos adicionales para detalle
  gastos_asociados?: number;
  total_gastado?: number;
  ultimo_uso?: string | null;
}

export interface CategoriaGastoDetalle extends CategoriaGasto {
  gastos_asociados: number;
  total_gastado: number;
  ultimo_uso: string | null;
}

export interface UltimoGasto {
  id: number;
  fecha: string;
  monto: number;
  descripcion: string;
  proveedor: string;
  created_at: string;
}

export interface EstadisticasGenerales {
  total_categorias: number;
  categorias_activas: number;
  categorias_inactivas: number;
  tipos_distintos: number;
}

export interface EstadisticaPorTipo {
  tipo: string;
  cantidad: number;
  activas: number;
  inactivas: number;
}

export interface CategoriaMasUtilizada {
  categoria: string;
  tipo: string;
  cantidad_gastos: number;
  total_monto: number;
  promedio_gasto: number;
  ultimo_gasto: string;
}

export interface CategoriasResponse {
  data: CategoriaGasto[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export interface CategoriasFiltradasRequest {
  nombre_busqueda?: string;
  tipo_filtro?: string;
  activa_filtro?: string;
  limit?: number;
  offset?: number;
}

export interface CrearCategoriaRequest {
  nombre: string;
  tipo: string;
  cta_contable?: string;
  activa?: boolean;
}

export interface ActualizarCategoriaRequest {
  nombre?: string | undefined;
  tipo?: string | undefined;
  cta_contable?: string | undefined;
  activa?: boolean | undefined;
  comunidad_id?: number | undefined;
}

// Interfaces para Dashboard
export interface DashboardResumen {
  total_categorias: number;
  categorias_activas: number;
  categorias_inactivas: number;
  tipos_distintos: number;
  total_gastado_mes_actual: number;
  promedio_gasto_categoria: number;
}

export interface DashboardTopMes {
  categoria_id: number;
  categoria_nombre: string;
  total_gastado: number;
  cantidad_gastos: number;
  porcentaje_del_total: number;
}

export interface DashboardSinUsoReciente {
  categoria_id: number;
  categoria_nombre: string;
  ultimo_uso: string | null;
  dias_sin_uso: number;
}

export interface DashboardDistribucionTipo {
  tipo: string;
  cantidad_categorias: number;
  total_gastado: number;
  porcentaje_del_total: number;
}
