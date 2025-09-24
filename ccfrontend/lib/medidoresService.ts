import apiClient from './api';

// ✅ Types
export interface Medidor {
  id: number;
  tipo: 'agua' | 'luz' | 'gas' | 'calefaccion';
  codigo: string;
  es_compartido: boolean;
  unidad_id?: number;
  comunidad_id: number;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LecturaMedidor {
  id: number;
  medidor_id: number;
  fecha: string;
  lectura: number;
  periodo: string;
  consumo?: number;
  consumo_anterior?: number;
  created_at?: string;
  created_by?: number;
}

export interface ConsumoCalculado {
  medidor_id: number;
  periodo: string;
  lectura_actual: number;
  lectura_anterior: number;
  consumo: number;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface CreateMedidorRequest {
  tipo: 'agua' | 'luz' | 'gas' | 'calefaccion';
  codigo: string;
  es_compartido: boolean;
  unidad_id?: number | null;
}

export interface CreateLecturaRequest {
  fecha: string;
  lectura: number;
  periodo: string;
}

export interface UpdateMedidorRequest extends Partial<CreateMedidorRequest> {
  activo?: boolean;
}

// ✅ Service Class
class MedidoresService {
  
  // 📋 MEDIDORES - CRUD
  
  async getMedidores(comunidadId: number): Promise<Medidor[]> {
    const response = await apiClient.get(`/medidores/comunidad/${comunidadId}`);
    return response.data;
  }

  async getMedidor(medidorId: number): Promise<Medidor> {
    const response = await apiClient.get(`/medidores/${medidorId}`);
    return response.data;
  }

  async createMedidor(comunidadId: number, data: CreateMedidorRequest): Promise<Medidor> {
    const response = await apiClient.post(`/medidores/comunidad/${comunidadId}`, data);
    return response.data;
  }

  async updateMedidor(medidorId: number, data: UpdateMedidorRequest): Promise<Medidor> {
    const response = await apiClient.put(`/medidores/${medidorId}`, data);
    return response.data;
  }

  async deleteMedidor(medidorId: number): Promise<void> {
    await apiClient.delete(`/medidores/${medidorId}`);
  }

  // 📊 LECTURAS - CRUD
  
  async getLecturas(medidorId: number, limit?: number): Promise<LecturaMedidor[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get(`/medidores/${medidorId}/lecturas${params}`);
    return response.data;
  }

  async createLectura(medidorId: number, data: CreateLecturaRequest): Promise<LecturaMedidor> {
    const response = await apiClient.post(`/medidores/${medidorId}/lecturas`, data);
    return response.data;
  }

  async updateLectura(lecturaId: number, data: Partial<CreateLecturaRequest>): Promise<LecturaMedidor> {
    const response = await apiClient.put(`/medidores/lecturas/${lecturaId}`, data);
    return response.data;
  }

  async deleteLectura(lecturaId: number): Promise<void> {
    await apiClient.delete(`/medidores/lecturas/${lecturaId}`);
  }

  // 📈 CONSUMOS Y ANÁLISIS
  
  async getConsumos(medidorId: number, desde?: string, hasta?: string): Promise<ConsumoCalculado[]> {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    
    const response = await apiClient.get(`/medidores/${medidorId}/consumos?${params.toString()}`);
    return response.data;
  }

  async getConsumosPorComunidad(comunidadId: number, periodo: string): Promise<ConsumoCalculado[]> {
    const response = await apiClient.get(`/medidores/comunidad/${comunidadId}/consumos/${periodo}`);
    return response.data;
  }

  // 📋 UTILIDADES
  
  async getMedidoresPorTipo(comunidadId: number, tipo: string): Promise<Medidor[]> {
    const response = await apiClient.get(`/medidores/comunidad/${comunidadId}?tipo=${tipo}`);
    return response.data;
  }

  async getUltimasLecturas(comunidadId: number): Promise<LecturaMedidor[]> {
    const response = await apiClient.get(`/medidores/comunidad/${comunidadId}/ultimas-lecturas`);
    return response.data;
  }
}

export const medidoresService = new MedidoresService();