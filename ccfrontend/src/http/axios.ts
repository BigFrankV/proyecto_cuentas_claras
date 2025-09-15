import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // importante para enviar/recibir cookies de refresh
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

// Helpers para token en localStorage + header default
export const setAccessToken = (token) => {
  try { localStorage.setItem('access_token', token) } catch (e) {}
  api.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : undefined
}

export const getAccessToken = () => {
  try { return localStorage.getItem('access_token') } catch (e) { return null }
}

export const clearAccessToken = () => {
  try { localStorage.removeItem('access_token') } catch (e) {}
  delete api.defaults.headers.common['Authorization']
}

// Interceptor simple: si 401 intentar refresh una vez y reintentar request
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (!original || original._retry) return Promise.reject(err)

    if (err.response && err.response.status === 401) {
      original._retry = true
      try {
        // Llama al endpoint de refresh; withCredentials ya está true en la instancia
        const r = await api.post('/auth/refresh', null, { withCredentials: true })
        // Si el backend devuelve token en body, guárdalo y reintenta
        const newToken = r?.data?.accessToken || r?.data?.token
        if (newToken) {
          setAccessToken(newToken)
          original.headers['Authorization'] = `Bearer ${newToken}`
          return api(original)
        }
      } catch (e) {
        // no pudo refrescar -> borrar token y propagar 401
        clearAccessToken()
        return Promise.reject(e)
      }
    }
    return Promise.reject(err)
  }
)
