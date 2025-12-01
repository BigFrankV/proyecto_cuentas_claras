// =========================================
// TIPOS PARA PROVEEDORES
// =========================================

import { ReactNode } from 'react';

export type EstadoProveedor = 0 | 1;

export const ESTADOS_PROVEEDOR = {
  0: { label: 'Inactivo', color: 'secondary' },
  1: { label: 'Activo', color: 'success' },
} as const;

export interface Proveedor {
  id: number;
  comunidad_id: number;
  comunidad_nombre?: string;
  rut: string;
  dv: string;
  rut_completo?: string; // campo combinado rut-dv
  razon_social: string;
  giro?: string;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  activo: EstadoProveedor; // 1 | 0
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
