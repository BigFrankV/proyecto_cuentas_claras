import apiClient from './api';

// Tipos mejorados que coinciden con la API
export interface Persona {
  id: number;
  rut: string;
  dv: string;
  nombres: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fecha_registro: string;
  ultimo_acceso?: string;
  avatar?: string;
  usuario?: {
    id: number;
    username: string;
    estado: 'Activo' | 'Inactivo';
    nivel_acceso: string;
  };
}

export interface PersonaStats {
  total_personas: number;
  administradores: number;
  inquilinos: number;
  propietarios: number;
  activos?: number;
  inactivos?: number;
}

// Listar personas con filtros
export async function listPersonas(filters?: any) {
  return apiClient.get('/personas', { params: filters });
}

// Obtener persona por ID
export async function getPersona(id: number) {
  return apiClient.get(`/personas/${id}`);
}

// Crear persona
export async function createPersona(payload: any) {
  return apiClient.post('/personas', payload);
}

// Actualizar persona (PATCH)
export async function updatePersona(id: number, payload: any) {
  return apiClient.patch(`/personas/${id}`, payload);
}

// Actualizar persona completamente (PUT)
export async function updatePersonaFull(id: number, payload: any) {
  return apiClient.put(`/personas/${id}`, payload);
}

// Eliminar persona
export async function deletePersona(id: number) {
  return apiClient.delete(`/personas/${id}`);
}

// Activar persona
export async function activarPersona(id: number) {
  return apiClient.patch(`/personas/${id}`, { activo: 1 });
}

// Desactivar persona
export async function desactivarPersona(id: number) {
  return apiClient.patch(`/personas/${id}`, { activo: 0 });
}

// Obtener estadísticas - con fallback a cálculo local
export async function getPersonaStats(): Promise<PersonaStats> {
  try {
    // Intenta con el endpoint
    const response = await apiClient.get('/personas/estadisticas');
    return response.data;
  } catch (error: any) {
    // Si el endpoint no existe (404), calcula localmente
    if (error.response?.status === 404) {
      try {
        const response = await apiClient.get('/personas?limit=1000&offset=0');
        const personas: Persona[] = response.data;

        const administradores = personas.filter(p => p.usuario).length;
        const propietarios = personas.filter(p => !p.usuario).length;
        const activos = personas.filter(
          p => p.usuario?.estado === 'Activo' || !p.usuario,
        ).length;

        return {
          total_personas: personas.length,
          administradores,
          inquilinos: 0,
          propietarios,
          activos,
          inactivos: personas.length - activos,
        };
      } catch (localError) {
        // Si aún así falla, devolver valores por defecto
        return {
          total_personas: 0,
          administradores: 0,
          inquilinos: 0,
          propietarios: 0,
          activos: 0,
          inactivos: 0,
        };
      }
    }
    throw error;
  }
}

// Obtener unidades asociadas
export async function getPersonasUnidades(personaId: number) {
  return apiClient.get(`/personas/${personaId}/unidades`);
}

// Obtener pagos realizados
export async function getPersonasPagos(personaId: number) {
  return apiClient.get(`/personas/${personaId}/pagos`);
}

// Obtener actividad/auditoría
export async function getPersonasActividad(personaId: number) {
  return apiClient.get(`/personas/${personaId}/actividad`);
}

// Obtener documentos asociados
export async function getPersonasDocumentos(personaId: number) {
  return apiClient.get(`/personas/${personaId}/documentos`);
}

// Obtener notas asociadas
export async function getPersonasNotas(personaId: number) {
  return apiClient.get(`/personas/${personaId}/notas`);
}

// Obtener roles y comunidades
export async function getPersonasRoles(personaId: number) {
  return apiClient.get(`/personas/${personaId}/roles`);
}

// Obtener resumen financiero
export async function getPersonasResumenFinanciero(personaId: number) {
  return apiClient.get(`/personas/${personaId}/resumen-financiero`);
}
