import { api } from '@/http/axios'

export async function login(data: { username?: string; email?: string; password: string }) {
  const res = await api.post('/auth/login', data)
  return res.data
}
export async function register(data: any) {
  const res = await api.post('/auth/register', data)
  return res.data
}
export async function me() {
  const res = await api.get('/auth/me')
  return res.data
}
export async function refresh() {
  const res = await api.post('/auth/refresh')
  return res.data
}
export async function logout() {
  const res = await api.post('/auth/logout')
  return res.data
}
