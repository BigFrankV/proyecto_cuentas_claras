// ...existing code...
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from './auth.api'
import { api, setAccessToken, getAccessToken, clearAccessToken } from '@/http/axios'

const Ctx = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        // Si hay token en storage, fijarlo primero para que axios lo use en las llamadas posteriores
        const token = getAccessToken()
        if (token) {
          setAccessToken(token)
        } else {
          // Intentar refresh por cookie (si el backend lo soporta).
          // Forzar withCredentials aquí para enviar cookie aunque axios default no lo tenga.
          try {
            await api.post('/auth/refresh', null, { withCredentials: true })
          } catch (e) {
            // Si refresh devuelve 401 (no hay sesión) simplemente continuar sin token.
            if (e?.response?.status !== 401) {
              // otros errores limpiamos token por seguridad
              clearAccessToken()
            }
            // no lanzar para que el proceso continue y bootstrapping finalice
          }
        }

        // Intentar obtener usuario; si falla se captura abajo
        const userData = await authApi.me()
        setUser(userData)
      } catch (err) {
        // En caso de error (me falla o no hay sesión) asegurar estado limpio
        clearAccessToken()
        setUser(null)
      } finally {
        setBootstrapped(true)
      }
    })()
  }, [])

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    bootstrapped,
    async login(creds) {
      const res = await authApi.login(creds)
      // normalizar posibles nombres de token en distintas respuestas
      const token = res?.accessToken || res?.token || res?.data?.accessToken || res?.data?.token
      if (token) {
        setAccessToken(token)
        try {
          const userData = await authApi.me()
          setUser(userData)
        } catch (e) {
          // si me() falla, limpiar token para evitar estado inconsistente
          clearAccessToken()
          setUser(null)
        }
      }
      return res
    },
    async logout() {
      try { await authApi.logout() } catch (e) {}
      clearAccessToken()
      setUser(null)
    }
  }), [user, bootstrapped])

  if (!bootstrapped) return <div className="container py-5">Cargando sesión…</div>

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
// ...existing code...