import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Comunidades from './pages/Comunidades'
import Profile from './pages/Profile'
import { useAuth } from './auth/AuthContext'

import ApiExplorer from './pages/ApiExplorer'
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

function Protected({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { isAuthenticated, logout } = useAuth()
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-primary navbar-dark">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <span className="material-icons">payments</span>
            Cuentas Claras
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarsCC" aria-controls="navbarsCC" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarsCC">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {isAuthenticated && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/">
                      <span className="material-icons align-middle me-1">dashboard</span>
                      Panel
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/comunidades">
                      <span className="material-icons align-middle me-1">apartment</span>
                      Comunidades
                    </Link>
                  </li>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="modsMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <span className="material-icons align-middle me-1">view_module</span> Módulos
                    </a>
                      <div className="dropdown-menu p-3 megamenu" aria-labelledby="modsMenu">
                        <div className="container">
                          <div className="row">
                            <div className="col-12 col-md-3">
                              <h6 className="sidebar-section">Core</h6>
                              <ul className="list-unstyled mb-0">
                                <li><Link className="dropdown-item" to="/mod/categorias-gasto">Categorías de gasto</Link></li>
                                <li><Link className="dropdown-item" to="/mod/centros-costo">Centros de costo</Link></li>
                                <li><Link className="dropdown-item" to="/mod/proveedores">Proveedores</Link></li>
                                <li><Link className="dropdown-item" to="/mod/documentos-compra">Documentos de compra</Link></li>
                              </ul>
                            </div>

                            <div className="col-12 col-md-3">
                              <h6 className="sidebar-section">Operaciones</h6>
                              <ul className="list-unstyled mb-0">
                                <li><Link className="dropdown-item" to="/mod/gastos">Gastos</Link></li>
                                <li><Link className="dropdown-item" to="/mod/emisiones">Emisiones</Link></li>
                                <li><Link className="dropdown-item" to="/mod/cargos">Cargos</Link></li>
                                <li><Link className="dropdown-item" to="/mod/pagos">Pagos</Link></li>
                              </ul>
                            </div>

                            <div className="col-12 col-md-3">
                              <h6 className="sidebar-section">Instalaciones & Servicios</h6>
                              <ul className="list-unstyled mb-0">
                                <li><Link className="dropdown-item" to="/mod/medidores">Medidores</Link></li>
                                <li><Link className="dropdown-item" to="/mod/tarifas-consumo">Tarifas consumo</Link></li>
                                <li><Link className="dropdown-item" to="/mod/lecturas">Lecturas</Link></li>
                                <li><Link className="dropdown-item" to="/mod/multas">Multas</Link></li>
                              </ul>
                            </div>

                            <div className="col-12 col-md-3">
                              <h6 className="sidebar-section">Soporte & Utilidades</h6>
                              <ul className="list-unstyled mb-0">
                                <li><Link className="dropdown-item" to="/mod/conciliaciones">Conciliaciones</Link></li>
                                <li><Link className="dropdown-item" to="/mod/amenidades">Amenidades</Link></li>
                                <li><Link className="dropdown-item" to="/mod/reservas">Reservas</Link></li>
                                <li><Link className="dropdown-item" to="/mod/soporte/tickets">Soporte · Tickets</Link></li>
                                <li><Link className="dropdown-item" to="/mod/soporte/notificaciones">Soporte · Notificaciones</Link></li>
                                <li><Link className="dropdown-item" to="/mod/soporte/documentos">Soporte · Documentos</Link></li>
                                <li><Link className="dropdown-item" to="/mod/soporte/bitacora">Soporte · Bitácora</Link></li>
                                <li><Link className="dropdown-item" to="/mod/parametros-cobranza">Parámetros de cobranza</Link></li>
                                <li><Link className="dropdown-item" to="/mod/util">Util</Link></li>
                              </ul>
                              <hr />
                              <Link className="dropdown-item" to="/api-explorer">API Explorer</Link>
                            </div>
                          </div>
                        </div>
                      </div>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/profile">
                      <span className="material-icons align-middle me-1">badge</span>
                      Mi Perfil
                    </Link>
                  </li>
                </>
              )}
            </ul>
            <div className="d-flex gap-2">
              {isAuthenticated ? (
                <button className="btn btn-outline-light btn-sm" onClick={logout}>
                  <span className="material-icons align-middle me-1">logout</span>
                  Salir
                </button>
              ) : (
                <>
                  <Link className="btn btn-light btn-sm" to="/login">
                    <span className="material-icons align-middle me-1">login</span>
                    Entrar
                  </Link>
                  <Link className="btn btn-outline-light btn-sm" to="/register">
                    <span className="material-icons align-middle me-1">person_add</span>
                    Crear cuenta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container my-4">
        <Routes>
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/comunidades" element={<Protected><Comunidades /></Protected>} />
          <Route path="/api-explorer" element={<Protected><ApiExplorer /></Protected>} />
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

      <footer className="border-top py-4">
        <div className="container d-flex justify-content-between align-items-center">
          <small className="text-muted-sm">&copy; {new Date().getFullYear()} Cuentas Claras</small>
          <span className="text-muted-sm">Hecho con React + Bootstrap</span>
        </div>
      </footer>
    </div>
  )
}
