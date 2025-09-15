import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'

export default function Topbar({ onToggleSidebar }) {
  const { isAuthenticated, logout, user } = useAuth()
  const [openUser, setOpenUser] = useState(false)
  const userRef = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (!userRef.current) return
      if (!userRef.current.contains(e.target)) setOpenUser(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <header className="kk-topbar d-flex align-items-center p-2">
      <button className="btn btn-ghost me-2" onClick={onToggleSidebar} aria-label="Toggle menu">
        <span className="material-icons">menu</span>
      </button>

      <div className="flex-grow-1" />

      <div className="d-flex align-items-center gap-2" ref={userRef}>
        <div className="small text-muted">{user?.username}</div>
        {isAuthenticated && <button className="btn btn-sm btn-outline-danger" onClick={logout}>Salir</button>}
      </div>
    </header>
  )
}
