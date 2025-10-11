const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

function authHeaders(token?: string) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function listApelaciones(params: Record<string, any> = {}, token?: string) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/apelaciones${qs ? '?'+qs : ''}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Error listando apelaciones');
  return res.json();
}

export async function getApelacion(id: number, token?: string) {
  const res = await fetch(`${API_BASE}/apelaciones/${id}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Error obteniendo apelación');
  return res.json();
}

export async function createApelacion(payload: any, token?: string) {
  const res = await fetch(`${API_BASE}/apelaciones`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Error creando apelación');
  return res.json();
}

export async function updateApelacion(id: number, payload: any, token?: string) {
  const res = await fetch(`${API_BASE}/apelaciones/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Error actualizando apelación');
  return res.json();
}

export async function resolveApelacion(id: number, actionPayload: { accion: 'aceptar'|'rechazar', resolucion?: string }, token?: string) {
  const res = await fetch(`${API_BASE}/apelaciones/${id}/resolver`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(actionPayload) });
  if (!res.ok) throw new Error('Error resolviendo apelación');
  return res.json();
}