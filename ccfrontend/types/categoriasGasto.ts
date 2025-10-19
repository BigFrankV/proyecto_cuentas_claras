export interface CategoriaGasto {
  id: number;
  nombre: string;
  tipo: string;
  cta_contable?: string;
  status: 'active' | 'inactive';
  comunidad: string;
  created_at: string;
  updated_at: string;
}

export interface CategoriasResponse {
  data: CategoriaGasto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}