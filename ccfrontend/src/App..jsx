import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Comunidades from './pages/Comunidades'
import Profile from './pages/Profile'
import { useAuth } from './auth/AuthContext'

import ApiExplorer from './pages/ApiExplorer'
import BoardsDemo from './pages/BoardsDemo'
import CategoriasGastoPage from './pages/domains/CategoriasGasto'
import CentrosCostoPage from './pages/domains/CentrosCosto'
import ProveedoresPage from './pages/domains/Proveedores'
import DocumentosCompraPage from './pages/domains/DocumentosCompra'
import GastosPage from './pages/domains/Gastos'
import EmisionesPage from './pages/domains/Emisiones'
import CargosPage from './pages/domains/Cargos'
import PagosPage from './pages/domains/Pagos'
import MedidoresPage from './pages/domains/Medidores'
import TarifasConsumoPage from './pages/domains/TarifasConsumo'
import LecturasPage from './pages/domains/Lecturas'
import MultasPage from './pages/domains/Multas'
import ConciliacionesPage from './pages/domains/Conciliaciones'
import AmenidadesPage from './pages/domains/Amenidades'
import ReservasPage from './pages/domains/Reservas'
import SoporteTicketsPage from './pages/domains/SoporteTickets'
import SoporteNotificacionesPage from './pages/domains/SoporteNotificaciones'
import SoporteDocumentosPage from './pages/domains/SoporteDocumentos'
import SoporteBitacoraPage from './pages/domains/SoporteBitacora'
import ParametrosCobranzaPage from './pages/domains/ParametrosCobranza'
import UtilPage from './pages/domains/Util'

import Layout from './layout/Layout'

function Protected({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  const { isAuthenticated, logout } = useAuth()
  return (
    <div className="kk-app">
      {/* Topbar: brand + quick actions (responsive) */}
      <header className="kk-topbar">
        <div className="d-flex align-items-center">
          <Link className="kk-logo d-flex align-items-center gap-2" to="/">
            <span className="kk-logo-mark material-icons">payments</span>
            <div>
              <div className="kk-brand">Cuentas Claras</div>
              <div className="kk-brand-sub">Administra tu comunidad</div>
            </div>
          </Link>
        </div>

        <div className="kk-topbar-right d-flex align-items-center gap-2">
          <nav className="d-none d-lg-flex align-items-center gap-2">
            <Link to="/api-explorer" className="nav-link">API</Link>
            <Link to="/boards-demo" className="nav-link">Demo</Link>
          </nav>

          {isAuthenticated ? (
            <div className="d-flex align-items-center gap-2">
              <Link to="/profile" className="btn btn-sm btn-outline-secondary">Perfil</Link>
              <button className="btn btn-sm btn-primary" onClick={() => logout()}>Cerrar sesión</button>
            </div>
          ) : (
            <div>
              <Link to="/login" className="btn btn-sm btn-outline-primary me-2">Ingresar</Link>
              <Link to="/register" className="btn btn-sm btn-primary">Crear cuenta</Link>
            </div>
          )}
        </div>
      </header>

      <main className="container my-5 kk-main">
        <Routes>
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/comunidades" element={<Protected><Comunidades /></Protected>} />
          <Route path="/api-explorer" element={<Protected><ApiExplorer /></Protected>} />
          <Route path="/boards-demo" element={<Protected><BoardsDemo /></Protected>} />
          <Route path="/mod/categorias-gasto" element={<Protected><CategoriasGastoPage /></Protected>} />
          <Route path="/mod/centros-costo" element={<Protected><CentrosCostoPage /></Protected>} />
          <Route path="/mod/proveedores" element={<Protected><ProveedoresPage /></Protected>} />
          <Route path="/mod/documentos-compra" element={<Protected><DocumentosCompraPage /></Protected>} />
          <Route path="/mod/gastos" element={<Protected><GastosPage /></Protected>} />
          <Route path="/mod/emisiones" element={<Protected><EmisionesPage /></Protected>} />
          <Route path="/mod/cargos" element={<Protected><CargosPage /></Protected>} />
          <Route path="/mod/pagos" element={<Protected><PagosPage /></Protected>} />
          <Route path="/mod/medidores" element={<Protected><MedidoresPage /></Protected>} />
          <Route path="/mod/tarifas-consumo" element={<Protected><TarifasConsumoPage /></Protected>} />
          <Route path="/mod/lecturas" element={<Protected><LecturasPage /></Protected>} />
          <Route path="/mod/multas" element={<Protected><MultasPage /></Protected>} />
          <Route path="/mod/conciliaciones" element={<Protected><ConciliacionesPage /></Protected>} />
          <Route path="/mod/amenidades" element={<Protected><AmenidadesPage /></Protected>} />
          <Route path="/mod/reservas" element={<Protected><ReservasPage /></Protected>} />
          <Route path="/mod/soporte/tickets" element={<Protected><SoporteTicketsPage /></Protected>} />
          <Route path="/mod/soporte/notificaciones" element={<Protected><SoporteNotificacionesPage /></Protected>} />
          <Route path="/mod/soporte/documentos" element={<Protected><SoporteDocumentosPage /></Protected>} />
          <Route path="/mod/soporte/bitacora" element={<Protected><SoporteBitacoraPage /></Protected>} />
          <Route path="/mod/parametros-cobranza" element={<Protected><ParametrosCobranzaPage /></Protected>} />
          <Route path="/mod/util" element={<Protected><UtilPage /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="site-footer kk-footer py-4">
        <div className="container d-flex justify-content-between align-items-center">
          <small className="text-muted-sm">&copy; {new Date().getFullYear()} Cuentas Claras</small>
          <small className="text-muted-sm">Hecho con React • Bootstrap • UX-minded</small>
        </div>
      </footer>
    </div>
  )
}
