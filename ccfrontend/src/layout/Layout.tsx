import React from 'react'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
// layout styles are loaded globally via styles/index.css

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="kk-app">
      <Topbar />
      <div className="kk-body">
        <aside className="kk-sidebar">
          <Sidebar />
        </aside>
        <main className="kk-main">{children}</main>
        <aside className="kk-panel">{/* right panel placeholder */}</aside>
      </div>
      <footer className="kk-footer">© {new Date().getFullYear()} Cuentas Claras</footer>
    </div>
  )
}
