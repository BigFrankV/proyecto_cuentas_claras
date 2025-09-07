import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setAccessToken, clearAccessToken, getAccessToken } from '@/http/axios'
import * as authApi from './auth.api'

type User = { id: number; username?: string; email?: string; roles?: string[] } | null

type AuthCtx = {
  user: User
  isAuthenticated: boolean
  login: (creds: {username?: string; email?: string; password: string}) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  me: () => Promise<void>
}

const Ctx = createContext<AuthCtx>(null as any)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null)
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      authApi.me().then(u => setUser(u)).finally(() => setBootstrapped(true))
    } else {
      setBootstrapped(true)
    }
  }, [])

  const value = useMemo<AuthCtx>(() => ({
    user,
    isAuthenticated: !!user,
    async login(creds) {
      const data = await authApi.login(creds)
      // backend may return { token } or { accessToken }
      const token = data?.token ?? data?.accessToken
      if (!token) throw new Error('No token returned from login')
      setAccessToken(token)
      const u = await authApi.me()
      setUser(u)
    },
    async register(data) { await authApi.register(data) },
    async me() { const u = await authApi.me(); setUser(u) },
    logout() { authApi.logout().catch(() => {}); clearAccessToken(); setUser(null) }
  }), [user])

  if (!bootstrapped) return <div className="container py-5">Cargando sesión…</div>

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
