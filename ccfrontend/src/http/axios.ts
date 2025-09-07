import axios from 'axios'
import type { AxiosRequestHeaders } from 'axios'
import * as authApi from '@/auth/auth.api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

let accessToken: string | null = localStorage.getItem('accessToken')

export const getAccessToken = () => accessToken
export const setAccessToken = (t?: string) => {
  accessToken = t || null
  if (t) localStorage.setItem('accessToken', t)
  else localStorage.removeItem('accessToken')
}
export const clearAccessToken = () => setAccessToken(undefined)

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
})

let isRefreshing = false
let queue: Array<() => void> = []

api.interceptors.request.use((cfg) => {
  if (accessToken) {
    // Some Axios types differ between Axios versions; keep this assignment simple
    // to avoid build-time type incompatibilities inside the Docker build image.
    const h = cfg.headers || {}
    // assign Authorization header while preserving other headers
    ;(h as any).Authorization = `Bearer ${accessToken}`
  cfg.headers = h as unknown as AxiosRequestHeaders
  }
  return cfg
})

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const { config, response } = error
    if (!response) throw error
    if (response.status === 401 && !config.__isRetry) {
      if (isRefreshing) {
        await new Promise<void>((res) => queue.push(res))
      }
      config.__isRetry = true
      try {
        isRefreshing = true
  const data = await authApi.refresh()
  const newToken = data?.accessToken ?? data?.token
  if (newToken) setAccessToken(newToken)
        queue.forEach((fn) => fn()); queue = []
        return api(config)
      } catch (e) {
        clearAccessToken()
        throw e
      } finally {
        isRefreshing = false
      }
    }
    throw error
  }
)
