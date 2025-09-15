import React from 'react'
import { Link } from 'react-router-dom'

// layout styles are loaded globally via styles/index.css

function Section({ title, children }) {
  return (
    <div className="kk-section mb-3">
      <div className="kk-section-title fw-semibold mb-2">{title}</div>
      <ul className="kk-nav list-unstyled ps-0">{children}</ul>
    </div>
  )
}

export default function Sidebar({ collapsed }) {
  return (
    <aside className={`kk-sidebar p-3 ${collapsed ? 'collapsed' : ''}`}>
      <div className="kk-sidebar-brand mb-3">
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
          <span className="material-icons kk-logo-mark">payments</span>
          {!collapsed && (
            <div>
              <div className="kk-brand">Cuentas Claras</div>
              <div className="kk-brand-sub small text-muted">Admin</div>
            </div>
          )}
        </Link>
      </div>

      <nav>
        <Section title="Principal">
          <li><Link to="/" className="kk-nav-link d-block py-1">Panel</Link></li>
          <li><Link to="/comunidades" className="kk-nav-link d-block py-1">Comunidades</Link></li>
          <li><Link to="/profile" className="kk-nav-link d-block py-1">Perfil</Link></li>
        </Section>

        <Section title="Módulos">
          <li><Link to="/mod/gastos" className="kk-nav-link d-block py-1">Gastos</Link></li>
          <li><Link to="/mod/multas" className="kk-nav-link d-block py-1">Multas</Link></li>
          <li><Link to="/mod/pagos" className="kk-nav-link d-block py-1">Pagos</Link></li>
        </Section>
      </nav>

      <div className="kk-sidebar-footer mt-4 small text-muted">{collapsed ? 'v0.1' : 'v0.1 • Cuentas Claras'}</div>
    </aside>
  )
}