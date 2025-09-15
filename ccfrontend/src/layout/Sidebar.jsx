import React from 'react'
import { NavLink } from 'react-router-dom'
import './layout.css'

const items = [
  { section: 'PRINCIPAL', links: [
    { to: '/', label: 'Panel' },
    { to: '/comunidades', label: 'Comunidades' },
    { to: '/profile', label: 'Perfil' }
  ]},
  { section: 'MÓDULOS', links: [
    { to: '/mod/gastos', label: 'Gastos' },
    { to: '/mod/multas', label: 'Multas' },
    { to: '/mod/pagos',  label: 'Pagos' }
  ]}
]

const Sidebar = ({ open = true, onNavigate }) => {
  const handleClick = () => {
    if (typeof onNavigate === 'function' && window.innerWidth <= 900) onNavigate()
  }

  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`}>
      <div className="sidebar-inner">
        <div className="sidebar-brand">
          <span className="brand-icon">🏠</span>
          <span className="brand-text">Cuentas Claras</span>
        </div>

        <nav className="sidebar-nav">
          {items.map((block, i) => (
            <div key={i}>
              <h6 className="sidebar-section">{block.section}</h6>
              <ul>
                {block.links.map(l => (
                  <li key={l.to}>
                    <NavLink
                      to={l.to}
                      className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                      onClick={handleClick}
                    >
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">v0.1 • Cuentas Claras</div>
      </div>
    </aside>
  )
}

export default Sidebar