// ...existing code...
import { api } from '@/http/axios'

export const login = (data) => api.post('/auth/login', data).then(r => r.data)
export const me = () => api.get('/auth/me').then(r => r.data)
export const logout = () => api.post('/auth/logout').then(r => r.data)

// Opcional: si el backend tiene endpoint de registro
export const register = (data) => api.post('/auth/register', data).then(r => r.data)

// Si tienes endpoints 2FA, ajusta la ruta según tu backend:
// export const verify2fa = (data) => api.post('/auth/2fa/verify', data).then(r => r.data)
// export const setup2fa = () => api.post('/auth/2fa/setup').then(r => r.data)
// ...existing code...