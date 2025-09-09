import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'

export default function Topbar() {
  const { isAuthenticated, logout } = useAuth()
  const [openUser, setOpenUser] = useState(false)
  const userRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!userRef.current) return
      if (!userRef.current.contains(e.target as Node)) setOpenUser(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const initials = 'CC'

  return (
    <header className="kk-topbar">
      <div className="kk-topbar-left d-flex align-items-center">
        <button className="kk-menu-btn" aria-label="toggle menu">☰</button>
        <div className="kk-logo d-flex align-items-center">
          <span className="kk-logo-mark material-icons">payments</span>
          <div className="kk-brand-block">
            <div className="kk-brand">Cuentas Claras</div>
            <small className="kk-brand-sub">Admin</small>
          </div>
        </div>
      </div>

      <div className="kk-topbar-center">
        <div className="kk-search-wrapper">
          <span className="material-icons kk-search-icon">search</span>
          <input className="kk-search" placeholder="Buscar personas, unidades, documentos..." />
        </div>
      </div>

      <div className="kk-topbar-right d-flex align-items-center gap-2">
        <button className="kk-icon-btn kk-notif" title="Notificaciones">
          <span className="material-icons">notifications</span>
          <span className="kk-badge">3</span>
        </button>

        <div className="kk-user-wrap" ref={userRef}>
          <button className="kk-user-btn" onClick={() => setOpenUser(v => !v)} aria-expanded={openUser}>
            <div className="kk-avatar">{initials}</div>
            <span className="kk-username">Admin</span>
            <span className="material-icons">expand_more</span>
          </button>

          {openUser && (
            <div className="kk-user-menu card p-2">
              <a className="d-block py-1 px-2" href="/profile">Mi perfil</a>
              <button className="d-block py-1 px-2 btn btn-link" onClick={logout}>Cerrar sesión</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
