import apiClient from './api';
import { GastoBackend, GastosListResponse } from '@/types/gastos';

const ENDPOINT_BASE = '/gastos'; // ajustar si el backend usa otra ruta

// Map para peticiones en vuelo (dedupe)
const inFlightRequests: Map<string, Promise<GastosListResponse>> = new Map();

// Cache simple con TTL
const cacheStore: Map<
  string,
  { data: GastosListResponse; expiresAt: number }
> = new Map();
const CACHE_TTL_MS = 10 * 1000; // 10 segundos

function makeCacheKey(url: string, params: Record<string, any>) {
  // ordenar keys para key estable
  const keys = Object.keys(params || {}).sort();
  const qp = keys.map(k => `${k}=${encodeURIComponent(params[k])}`).join('&');
  return `${url}?${qp}`;
}

export async function listGastos(comunidadId?: number | null, params: Record<string, any> = {}) {
  const url = typeof comunidadId === 'number' ? `${ENDPOINT_BASE}/comunidad/${comunidadId}` : `${ENDPOINT_BASE}`;
  const cacheKey = makeCacheKey(url, params);

  // DEBUG: traza el llamador para localizar el iniciador
  if (process.env.NODE_ENV === 'development') {
    console.debug('[gastosService] listGastos called', { url, params, cacheKey });
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
      const result: GastosListResponse = Array.isArray(body) ? { data: body } : (body.data || body);
      // guardar en cache
      cacheStore.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
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

export async function getGasto(id: number) {
  const url = `${ENDPOINT_BASE}/${id}`;
  const cacheKey = makeCacheKey(url, {});
  // comprobar cache simple para detalle
  const cached = cacheStore.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data.data[0] as GastoBackend;
  }
  const res = await apiClient.get(url);
  const body = res.data;
  const result = Array.isArray(body) ? { data: body } : (body.data || body);
  cacheStore.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result as unknown as GastoBackend;
}

export default { listGastos, getGasto };