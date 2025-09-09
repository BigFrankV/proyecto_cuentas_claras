import React from 'react'
import { Link } from 'react-router-dom'
// layout styles are loaded globally via styles/index.css

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="kk-section">
      <div className="kk-section-title">{title}</div>
      <ul className="kk-nav">{children}</ul>
    </div>
  )
}

export default function Sidebar() {
  return (
    <nav>
      <Section title="Core">
        <li><Link to="/mod/proveedores" className="kk-nav-link">Proveedores</Link></li>
        <li><Link to="/mod/documentos-compra" className="kk-nav-link">Documentos</Link></li>
        <li><Link to="/mod/categorias-gasto" className="kk-nav-link">Categorias Gasto</Link></li>
      </Section>

      <Section title="Operaciones">
        <li><Link to="/mod/gastos" className="kk-nav-link">Gastos</Link></li>
        <li><Link to="/mod/emisiones" className="kk-nav-link">Emisiones</Link></li>
        <li><Link to="/mod/cargos" className="kk-nav-link">Cargos</Link></li>
        <li><Link to="/mod/pagos" className="kk-nav-link">Pagos</Link></li>
      </Section>

      <Section title="Servicios">
        <li><Link to="/mod/medidores" className="kk-nav-link">Medidores</Link></li>
        <li><Link to="/mod/tarifas-consumo" className="kk-nav-link">Tarifas Consumo</Link></li>
        <li><Link to="/mod/lecturas" className="kk-nav-link">Lecturas</Link></li>
      </Section>

      <Section title="Soporte">
        <li><Link to="/mod/soporte/tickets" className="kk-nav-link">Tickets</Link></li>
        <li><Link to="/mod/soporte/notificaciones" className="kk-nav-link">Notificaciones</Link></li>
        <li><Link to="/mod/soporte/documentos" className="kk-nav-link">Documentos</Link></li>
      </Section>

      <div className="kk-sidebar-footer">v0.1 • Cuentas Claras</div>
    </nav>
  )
}
