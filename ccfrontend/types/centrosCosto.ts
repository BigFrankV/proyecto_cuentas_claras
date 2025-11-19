// =========================================
// TIPOS PARA CENTROS DE COSTO
// =========================================

export interface CentroCosto {
  id: number;
  nombre: string;
  comunidad: string;
  created_at: string;
  updated_at: string;
}

export interface CentrosResponse {
  data: CentroCosto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
