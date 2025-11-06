import apiClient from './api';

export interface Amenidad {
  id: number;
  comunidad_id: number;
  nombre: string;
  descripcion: string;
  capacidad: number;
  ubicacion: string;
  estado: 'disponible' | 'mantenimiento' | 'deshabilitada';
  costo_reserva: number;
  activo: number;
  created_at: string;
  updated_at: string;
}

export async function listAmenidades(filters?: any) {
  return apiClient.get('/amenidades', { params: filters });
}

export async function getAmenidad(id: number) {
  return apiClient.get(`/amenidades/${id}`);
}

export async function createAmenidad(payload: any) {
  return apiClient.post('/amenidades', payload);
}

export async function updateAmenidad(id: number, payload: any) {
  return apiClient.patch(`/amenidades/${id}`, payload);
}

export async function deleteAmenidad(id: number) {
  return apiClient.delete(`/amenidades/${id}`);
}

export async function agregarFoto(id: number, formData: FormData) {
  return apiClient.post(`/amenidades/${id}/fotos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function agregarDisponibilidad(id: number, payload: any) {
  return apiClient.post(`/amenidades/${id}/disponibilidad`, payload);
}

export async function actualizarDisponibilidad(id: number, disponibilidadId: number, payload: any) {
  return apiClient.put(`/amenidades/${id}/disponibilidad/${disponibilidadId}`, payload);
}

export async function eliminarDisponibilidad(id: number, disponibilidadId: number) {
  return apiClient.delete(`/amenidades/${id}/disponibilidad/${disponibilidadId}`);
}
