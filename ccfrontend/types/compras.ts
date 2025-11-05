// Tipos para el módulo de Compras

export interface CompraBackend {
  id: number;
  folio: string;
  tipo_doc: string;
  fecha_emision: string;
  proveedor_id: number;
  proveedor_nombre: string;
  centro_costo_id?: number;
  centro_costo_nombre?: string;
  categoria_gasto?: string;
  glosa: string;
  total: number;
  comunidad_id: number;
  comunidad_nombre?: string;
  created_at: string;
  updated_at: string;
}

export interface ComprasResponse {
  data: CompraBackend[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CompraFilters {
  search?: string;
  tipo_doc?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  comunidad_id?: number;
  limit?: number;
  offset?: number;
}

// Tipos para el frontend (mapeados desde backend)
export interface Compra {
  id: number;
  folio: string;
  tipo_doc: string;
  fecha_emision: string;
  proveedor_id: number;
  proveedor_nombre: string;
  centro_costo_id?: number;
  centro_costo_nombre?: string;
  categoria_gasto?: string;
  glosa: string;
  total: number;
  comunidad_id: number;
  comunidad_nombre?: string;
  created_at: string;
  updated_at: string;
}

export interface ComprasEstadisticas {
  total_compras: number;
  total_monto: number;
  promedio_monto: number;
  compras_mes_actual: number;
  monto_mes_actual: number;
  proveedores_distintos: number;
  tipos_documentos: Record<string, number>;
}
