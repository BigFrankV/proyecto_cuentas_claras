import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

// layout styles are loaded globally via styles/index.css

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`kk-app d-flex ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onClose={() => setCollapsed(true)} onOpen={() => setCollapsed(false)} />
      <div className="kk-main flex-grow-1">
        <Topbar onToggleSidebar={() => setCollapsed(!collapsed)} />
        <div className="p-3">
          {children}
        </div>
      </div>
    </div>
  )
}
