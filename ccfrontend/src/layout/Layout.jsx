import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './layout.css'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => setSidebarOpen(v => !v)

  // pasar a Sidebar una función que cierre el panel sólo en pantallas pequeñas
  const handleNavigate = () => {
    if (window.innerWidth <= 900) setSidebarOpen(false)
  }

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onNavigate={handleNavigate} />
      <div className="content-wrapper">
        <Topbar onToggleSidebar={toggleSidebar} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
