/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

function authHeaders(token?: string) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchJson(path: string, opts: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, opts);
  const text = await res.text();
  let data: any = text;
  try {
    data = JSON.parse(text);
  } catch (_) {
    /* plain text */
  }

  if (!res.ok) {
    const err: any = new Error(data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function listApelaciones(
  params: Record<string, any> = {},
  token?: string
) {
  const qs = new URLSearchParams(params).toString();
  return await fetchJson(`/apelaciones${qs ? `?${qs}` : ''}`, {
    headers: authHeaders(token),
  });
}

export async function getApelacion(id: number, token?: string) {
  return await fetchJson(`/apelaciones/${id}`, { headers: authHeaders(token) });
}

/**
 * createApelacion: si payload.multa_id existe usa la ruta /multas/:id/apelacion
 * si no, usa POST /apelaciones (backend ya soporta /apelaciones)
 */
export async function createApelacion(payload: any, token?: string) {
  const headers = authHeaders(token);
  if (payload && payload.multa_id) {
    return await fetchJson(`/multas/${payload.multa_id}/apelacion`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } else {
    return await fetchJson('/apelaciones', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  }
}

export async function updateApelacion(
  id: number,
  payload: any,
  token?: string
) {
  return await fetchJson(`/apelaciones/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function resolveApelacion(
  id: number,
  actionPayload: {
    accion: 'aceptar' | 'rechazar' | 'aceptada' | 'rechazada';
    resolucion?: string;
  },
  token?: string
) {
  return await fetchJson(`/apelaciones/${id}/resolver`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(actionPayload),
  });
}

export default {
  listApelaciones,
  getApelacion,
  createApelacion,
  updateApelacion,
  resolveApelacion,
};
