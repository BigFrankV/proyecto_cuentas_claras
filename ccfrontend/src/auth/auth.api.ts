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
export async function verify2fa(data: { tempToken: string; code: string }) {
  const res = await api.post('/auth/2fa/verify', data)
  return res.data
}
export async function setup2fa() {
  const res = await api.get('/auth/2fa/setup')
  return res.data
}
export async function enable2fa(data: { base32: string; code: string }) {
  const res = await api.post('/auth/2fa/enable', data)
  return res.data
}
export async function disable2fa(data: { code: string }) {
  const res = await api.post('/auth/2fa/disable', data)
  return res.data
}
