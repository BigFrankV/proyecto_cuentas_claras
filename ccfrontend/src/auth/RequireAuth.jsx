import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

const RequireAuth = ({ children }) => {
  const { isAuthenticated, bootstrapped } = useAuth()
  const location = useLocation()

  // Esperar bootstrapping: si aún no terminó no redirigir ni renderizar contenido protegido
  if (!bootstrapped) {
    return <div className="container py-5">Verificando sesión…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default RequireAuth