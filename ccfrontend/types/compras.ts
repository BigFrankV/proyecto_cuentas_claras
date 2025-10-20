export interface Compra {
  id: number;
  comunidad_id?: number;
  comunidad_nombre?: string;
  proveedor_id?: number;
  proveedor_nombre?: string;
  tipo_doc?: 'factura' | 'boleta' | 'nota_credito' | string;
  folio?: string;
  fecha_emision?: string;
  neto?: number;
  iva?: number;
  exento?: number;
  total?: number;
  glosa?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ComprasResponse {
  data: Compra[];
  pagination?: { total: number; page: number; limit: number; pages: number; };
}