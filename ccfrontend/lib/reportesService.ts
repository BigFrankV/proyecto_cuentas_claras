import apiClient from './api';

export interface Reporte {
  id: number;
  nombre_reporte: string;
  tipo_reporte: string;
  descripcion: string;
  parametros: string;
  formato: string;
  fecha_generacion: string;
  usuario_id: number;
  activo: number;
}

export async function listReportes(filters?: any) {
  return apiClient.get('/reportes', { params: filters });
}

export async function getReporte(id: number) {
  return apiClient.get(`/reportes/${id}`);
}

export async function generarReporte(tipo: string, payload: any) {
  return apiClient.post('/reportes', { tipo, ...payload });
}

export async function exportarReporte(id: number, formato: string) {
  return apiClient.get(`/reportes/${id}/export?formato=${formato}`, {
    responseType: 'blob',
  });
}
