import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, setAccessToken, getAccessToken, clearAccessToken } from '@/http/axios'
import * as authApi from './auth.api'

const Ctx = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const token = getAccessToken()
        if (token) {
          // Si hay token local, usarlo y pedir /auth/me
          setAccessToken(token)
          const me = await authApi.me()
          setUser(me)
        } else if (import.meta.env.VITE_ENABLE_REFRESH === 'true') {
          // Intentar refresh solo si explícitamente habilitado por env
          try {
            await api.post('/auth/refresh', null, { withCredentials: true })
            const me = await authApi.me()
            setUser(me)
          } catch (e) {
            // manejar 404/400/401 sin romper el bootstrapping
            console.debug('refresh skipped/failed', e?.response?.status)
            clearAccessToken()
            setUser(null)
          }
        } else {
          // no token y refresh deshabilitado -> anónimo
          setUser(null)
        }
      } catch (err) {
        clearAccessToken()
        setUser(null)
      } finally {
        setBootstrapped(true)
      }
    })()
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // intentamos refrescar token (si tu flow lo usa)
        try {
          await api.post('/auth/refresh') // si tu backend necesita body, ajusta
        } catch (e) {
          // refresh falló -> continuar, /auth/me devolverá 401 si no hay token válido
          console.debug('auth refresh failed', e?.response?.status)
        }

        // obtener datos del usuario
        const meRes = await api.get('/auth/me')
        const me = meRes.data || {}

        // cargar membresías si tenemos persona_id
        try {
          const pid = me.persona_id || me.personaId
          if (pid) {
            const mres = await api.get('/membresias', { params: { persona_id: pid } })
            me.membresias = Array.isArray(mres.data) ? mres.data : (mres.data?.items || [])
          } else {
            me.membresias = []
          }
        } catch (e) {
          console.warn('no se pudieron cargar membresías', e?.response?.status)
          me.membresias = me.membresias || []
        }

        if (!mounted) return
        setUser(me)
      } catch (err) {
        // token inválido / no autenticado
        console.debug('/auth/me no autorizado', err?.response?.status)
        setUser(null)
      }
    })()
    return () => { mounted = false }
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