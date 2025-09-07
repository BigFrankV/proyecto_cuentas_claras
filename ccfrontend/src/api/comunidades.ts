import { api } from '@/http/axios'
export async function listComunidades(params?: { q?: string; page?: number; limit?: number }) {
  const res = await api.get('/comunidades', { params })
  return res.data
}
