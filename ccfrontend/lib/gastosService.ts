/* eslint-disable no-console */
/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GastoBackend,
  GastosListResponse,
  UpdateGastoPayload,
} from '@/types/gastos';

import apiClient from './api';

const ENDPOINT_BASE = '/gastos'; // ajustar si el backend usa otra ruta

// Map para peticiones en vuelo (dedupe)
const inFlightRequests: Map<string, Promise<GastosListResponse>> = new Map();

// Cache simple con TTL
const cacheStore: Map<string, { data: GastosListResponse; expiresAt: number }> =
  new Map();
const CACHE_TTL_MS = 10 * 1000; // 10 segundos

function makeCacheKey(url: string, params: Record<string, any>) {
  // ordenar keys para key estable
  const keys = Object.keys(params || {}).sort();
  const qp = keys.map(k => `${k}=${encodeURIComponent(params[k])}`).join('&');
  return `${url}?${qp}`;
}

export async function listGastos(
  comunidadId?: number | null,
  params: Record<string, any> = {}
) {
  const url =
    typeof comunidadId === 'number'
      ? `${ENDPOINT_BASE}/comunidad/${comunidadId}`
      : `${ENDPOINT_BASE}`;
  const cacheKey = makeCacheKey(url, params);

  // DEBUG: traza el llamador para localizar el iniciador
  if (process.env.NODE_ENV === 'development') {
    console.debug('[gastosService] listGastos called', {
      url,
      params,
      cacheKey,
    });
    console.trace();
  }

  // devolver cache si no expiró
  const cached = cacheStore.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // si ya hay una petición en vuelo para la misma key, devolverla
  const inFlight = inFlightRequests.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const p = (async () => {
    try {
      const res = await apiClient.get(url, { params });
      const body = res.data;
      const result: GastosListResponse = Array.isArray(body)
        ? { data: body }
        : body.data || body;
      // guardar en cache
      cacheStore.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return result;
    } catch (err) {
      // en caso de error limpiar cache y re-lanzar
      cacheStore.delete(cacheKey);
      throw err;
    } finally {
      // limpiar inFlight al terminar (success o error)
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, p);
  return p;
}

export async function getGastoById(id: number): Promise<GastoBackend> {
  const res = await apiClient.get(`/gastos/${id}`);
  return res.data;
}

export async function createGasto(comunidadId: number | null, data) {
  const url = comunidadId ? `/gastos/comunidad/${comunidadId}` : '/gastos';
  // eslint-disable-next-line no-console`n  console.log('[SERVICE] createGasto url:', url, 'data:', data);
  const res = await apiClient.post(url, data);
  return res.data;
}

export async function updateGasto(
  id: number,
  data: UpdateGastoPayload
): Promise<GastoBackend> {
  const res = await apiClient.patch(`/gastos/${id}`, data);
  return res.data;
}

export async function deleteGasto(id: number): Promise<void> {
  await apiClient.delete(`/gastos/${id}`);
}

// Para listas desplegables
export async function getCategorias(comunidadId?: number | null) {
  const url = comunidadId
    ? `/gastos/listas/categorias/${comunidadId}`
    : '/categorias-gasto';
  // eslint-disable-next-line no-console`n  console.log('[SERVICE] getCategorias url:', url);
  try {
    const res = await apiClient.get(url);
    const payload = (res?.data && (res.data.data ?? res.data)) ?? [];
    // eslint-disable-next-line no-console
    console.log(
      '[SERVICE] getCategorias normalized length:',
      Array.isArray(payload) ? payload.length : 'not-array',
      'raw:',
      res?.data
    );
    return payload;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(
      '[SERVICE] getCategorias error:',
      err?.response?.status,
      err?.response?.data || err?.message
    );
    throw err;
  }
}

export async function getCentrosCosto(comunidadId?: number | null) {
  const url = comunidadId
    ? `/centros-costo/comunidad/${comunidadId}/dropdown`
    : '/centros-costo';
  // eslint-disable-next-line no-console`n  console.log('[SERVICE] getCentrosCosto url:', url);
  try {
    const res = await apiClient.get(url);
    const payload = (res?.data && (res.data.data ?? res.data)) ?? [];
    // eslint-disable-next-line no-console
    console.log(
      '[SERVICE] getCentrosCosto normalized length:',
      Array.isArray(payload) ? payload.length : 'not-array',
      'raw:',
      res?.data
    );
    return payload;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(
      '[SERVICE] getCentrosCosto error:',
      err?.response?.status,
      err?.response?.data || err?.message
    );
    throw err;
  }
}

export async function getProveedores(comunidadId?: number | null) {
  const url = comunidadId
    ? `/proveedores/comunidad/${comunidadId}/dropdown`
    : '/proveedores';
  // eslint-disable-next-line no-console`n  console.log('[SERVICE] getProveedores url:', url);
  try {
    const res = await apiClient.get(url);
    const payload = (res?.data && (res.data.data ?? res.data)) ?? [];
    // eslint-disable-next-line no-console
    console.log(
      '[SERVICE] getProveedores normalized length:',
      Array.isArray(payload) ? payload.length : 'not-array',
      'raw:',
      res?.data
    );
    return payload;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(
      '[SERVICE] getProveedores error:',
      err?.response?.status,
      err?.response?.data || err?.message
    );
    throw err;
  }
}

// Aprobaciones
export async function getAprobaciones(gastoId: number): Promise<any[]> {
  try {
    const res = await apiClient.get(`/gastos/${gastoId}/aprobaciones`);
    return res.data;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(
      'getAprobaciones error:',
      err?.response?.status,
      err?.response?.data || err.message
    );
    return []; // tolerancia: devolver vacío para no romper la UI
  }
}

export async function createAprobacion(
  gastoId: number,
  data: { accion: 'aprobar' | 'rechazar'; observaciones?: string }
) {
  const res = await apiClient.post(`/gastos/${gastoId}/aprobaciones`, data);
  return res.data;
}

export async function getComunidades() {
  return apiClient.get('/comunidades');
}

export default {
  listGastos,
  getGastoById,
  createGasto,
  updateGasto,
  deleteGasto,
  getCategorias,
  getCentrosCosto,
  getProveedores,
  getAprobaciones,
  createAprobacion,
  getComunidades,
};
