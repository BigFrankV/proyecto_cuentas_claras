import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import './layout.css'

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
    <header className="topbar">
      <button
        type="button"
        className="menu-toggle"
        aria-label="Alternar menú"
        onClick={onToggleSidebar}
      >
        ☰
      </button>

    </header>
  )
}
