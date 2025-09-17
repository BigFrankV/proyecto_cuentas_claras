import axios from 'axios'

const STORAGE_KEY = 'access_token'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // enviar cookies (refresh_token) si el backend las usa
  headers: {
    'Content-Type': 'application/json'
  }
})

export function setAccessToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    try { localStorage.setItem(STORAGE_KEY, token) } catch {}
  } else {
    delete api.defaults.headers.common['Authorization']
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }
}

export function getAccessToken() {
  try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
}

export function clearAccessToken() {
  delete api.defaults.headers.common['Authorization']
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

// opcional: si ya tienes interceptor de refresh, asegúrate que capture 400/404 y no repita indefinidamente
