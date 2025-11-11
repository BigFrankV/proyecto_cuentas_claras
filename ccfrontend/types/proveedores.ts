export interface Proveedor {
  id: number;
  comunidad_id: number;
  comunidad_nombre?: string;
  rut: string;
  dv: string;
  razon_social: string; // razon_social
  giro?: string;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  activo: number; // 1 | 0
  created_at?: string;
  updated_at?: string;
  // campos estadísticos opcionales (si el backend los calcula)
  total_documentos?: number;
  total_gastos?: number;
  monto_total_gastado?: number;
  promedio_gasto?: number;
  ultimo_gasto_fecha?: string | null;
}
export interface ProveedoresResponse {
  data: Proveedor[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
