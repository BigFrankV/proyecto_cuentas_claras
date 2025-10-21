import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { useAuth } from '@/lib/useAuth';
import {
  usePermissions,
  PermissionGuard,
  Permission,
} from '@/lib/usePermissions';
import Head from 'next/head';
import DashboardCharts from '@/components/ui/DashboardCharts';

export default function Dashboard() {
  const { user } = useAuth();
  const { isSuperUser, currentRole } = usePermissions();

  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard — Cuentas Claras</title>
      </Head>

      <Layout title='Dashboard'>
        {/* Header con búsqueda y filtros */}
        <header className='bg-white border-bottom shadow-sm p-3 mb-4'>
          <div className='container-fluid'>
            <div className='row align-items-center'>
              <div className='col-lg-4'>
                <div className='input-group'>
                  <span className='input-group-text bg-light border-0'>
                    <span className='material-icons text-muted'>search</span>
                  </span>
                  <input
                    type='text'
                    className='form-control bg-light border-0'
                    placeholder='Buscar...'
                  />
                </div>
              </div>

              <div className='col-lg-8'>
                <div className='d-flex justify-content-end align-items-center'>
                  {/* Notificaciones */}
                  <div className='me-3'>
                    <button
                      className='btn position-relative p-0'
                      type='button'
                      data-bs-toggle='dropdown'
                    >
                      <span className='material-icons'>notifications</span>
                      <span className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger'>
                        3
                      </span>
                    </button>
                    <div
                      className='dropdown-menu dropdown-menu-end p-0'
                      style={{ width: '320px' }}
                    >
                      <div className='p-3 border-bottom'>
                        <h6 className='mb-0'>Notificaciones</h6>
                      </div>
                      <div className='list-group list-group-flush'>
                        <a
                          href='#'
                          className='list-group-item list-group-item-action'
                        >
                          <div className='d-flex align-items-center'>
                            <span className='material-icons text-warning me-3'>
                              payment
                            </span>
                            <div>
                              <p className='mb-0'>Nuevo pago registrado</p>
                              <small className='text-muted'>
                                Hace 10 minutos
                              </small>
                            </div>
                          </div>
                        </a>
                        <a
                          href='#'
                          className='list-group-item list-group-item-action'
                        >
                          <div className='d-flex align-items-center'>
                            <span className='material-icons text-success me-3'>
                              person_add
                            </span>
                            <div>
                              <p className='mb-0'>Nuevo residente registrado</p>
                              <small className='text-muted'>Hace 1 hora</small>
                            </div>
                          </div>
                        </a>
                        <a
                          href='#'
                          className='list-group-item list-group-item-action'
                        >
                          <div className='d-flex align-items-center'>
                            <span className='material-icons text-danger me-3'>
                              report_problem
                            </span>
                            <div>
                              <p className='mb-0'>Alerta: 5 pagos vencidos</p>
                              <small className='text-muted'>Hace 3 horas</small>
                            </div>
                          </div>
                        </a>
                      </div>
                      <div className='p-2 border-top text-center'>
                        <a
                          href='#'
                          className='text-decoration-none text-accent small'
                        >
                          Ver todas las notificaciones
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido del dashboard */}
        <main className='container-fluid py-4'>
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div>
              <h1 className='h3 mb-0'>
                Dashboard
                {isSuperUser() && (
                  <span className='badge bg-warning text-dark ms-2'>
                    SUPERUSER
                  </span>
                )}
              </h1>
              <p className='text-muted mb-0'>
                Bienvenido de vuelta, {user?.username || 'Usuario'}
              </p>
            </div>

            {/* Filtros */}
            <div className='d-flex'>
              <div className='dropdown me-2'>
                <button
                  className='btn btn-outline-secondary dropdown-toggle'
                  type='button'
                  id='comunidadDropdown'
                  data-bs-toggle='dropdown'
                >
                  <span className='material-icons align-middle me-1'>
                    domain
                  </span>
                  <span>Edificio Las Palmas</span>
                </button>
                <ul
                  className='dropdown-menu'
                  aria-labelledby='comunidadDropdown'
                >
                  <li>
                    <a className='dropdown-item active' href='#'>
                      Edificio Las Palmas
                    </a>
                  </li>
                  <li>
                    <a className='dropdown-item' href='#'>
                      Condominio Los Pinos
                    </a>
                  </li>
                  <li>
                    <a className='dropdown-item' href='#'>
                      Edificio Central
                    </a>
                  </li>
                  <li>
                    <hr className='dropdown-divider' />
                  </li>
                  <li>
                    <a
                      className='dropdown-item text-primary'
                      href='/comunidades/nueva'
                    >
                      + Nueva comunidad
                    </a>
                  </li>
                </ul>
              </div>

              <div className='dropdown'>
                <button
                  className='btn btn-outline-secondary dropdown-toggle'
                  type='button'
                  id='periodoDropdown'
                  data-bs-toggle='dropdown'
                >
                  <span className='material-icons align-middle me-1'>
                    calendar_today
                  </span>
                  <span>Septiembre 2025</span>
                </button>
                <ul
                  className='dropdown-menu dropdown-menu-end'
                  aria-labelledby='periodoDropdown'
                >
                  <li>
                    <a className='dropdown-item active' href='#'>
                      Septiembre 2025
                    </a>
                  </li>
                  <li>
                    <a className='dropdown-item' href='#'>
                      Agosto 2025
                    </a>
                  </li>
                  <li>
                    <a className='dropdown-item' href='#'>
                      Julio 2025
                    </a>
                  </li>
                  <li>
                    <hr className='dropdown-divider' />
                  </li>
                  <li>
                    <a className='dropdown-item' href='#'>
                      Personalizar período
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Resumen de KPIs */}
          <div className='row g-4 mb-4'>
            {/* KPI - Saldo Total */}
            <div className='col-md-6 col-xl-3'>
              <div className='card app-card shadow-sm h-100 data-card'>
                <div className='card-body d-flex align-items-center'>
                  <div className='icon-box bg-primary-light me-3'>
                    <span
                      className='material-icons'
                      style={{
                        color: 'var(--color-primary)',
                        fontSize: '28px',
                      }}
                    >
                      account_balance
                    </span>
                  </div>
                  <div>
                    <span className='text-muted small d-block'>
                      Saldo Total
                    </span>
                    <h4 className='mb-0'>$124,568,945</h4>
                    <div className='small text-success'>
                      <span
                        className='material-icons align-middle'
                        style={{ fontSize: '14px' }}
                      >
                        arrow_upward
                      </span>
                      <span>3.2% vs mes anterior</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI - Ingresos */}
            <div className='col-md-6 col-xl-3'>
              <div className='card app-card shadow-sm h-100 data-card'>
                <div className='card-body d-flex align-items-center'>
                  <div className='icon-box bg-success-light me-3'>
                    <span
                      className='material-icons'
                      style={{
                        color: 'var(--color-success)',
                        fontSize: '28px',
                      }}
                    >
                      payments
                    </span>
                  </div>
                  <div>
                    <span className='text-muted small d-block'>
                      Ingresos del Mes
                    </span>
                    <h4 className='mb-0'>$5,872,500</h4>
                    <div className='small text-success'>
                      <span
                        className='material-icons align-middle'
                        style={{ fontSize: '14px' }}
                      >
                        arrow_upward
                      </span>
                      <span>7.5% vs mes anterior</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI - Gastos */}
            <div className='col-md-6 col-xl-3'>
              <div className='card app-card shadow-sm h-100 data-card'>
                <div className='card-body d-flex align-items-center'>
                  <div className='icon-box bg-danger-light me-3'>
                    <span
                      className='material-icons'
                      style={{ color: 'var(--color-danger)', fontSize: '28px' }}
                    >
                      money_off
                    </span>
                  </div>
                  <div>
                    <span className='text-muted small d-block'>
                      Gastos del Mes
                    </span>
                    <h4 className='mb-0'>$3,845,790</h4>
                    <div className='small text-danger'>
                      <span
                        className='material-icons align-middle'
                        style={{ fontSize: '14px' }}
                      >
                        arrow_upward
                      </span>
                      <span>2.1% vs mes anterior</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI - Morosidad */}
            <div className='col-md-6 col-xl-3'>
              <div className='card app-card shadow-sm h-100 data-card'>
                <div className='card-body d-flex align-items-center'>
                  <div className='icon-box bg-warning-light me-3'>
                    <span
                      className='material-icons'
                      style={{
                        color: 'var(--color-warning)',
                        fontSize: '28px',
                      }}
                    >
                      report_problem
                    </span>
                  </div>
                  <div>
                    <span className='text-muted small d-block'>
                      Tasa de Morosidad
                    </span>
                    <h4 className='mb-0'>8.5%</h4>
                    <div className='small text-success'>
                      <span
                        className='material-icons align-middle'
                        style={{ fontSize: '14px' }}
                      >
                        arrow_downward
                      </span>
                      <span>1.3% vs mes anterior</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos implementados con Chart.js */}
          <DashboardCharts />

          {/* Tablas de datos */}
          <div className='row g-4 mb-4'>
            {/* Pagos recientes */}
            <div className='col-lg-6'>
              <div className='card app-card shadow-sm h-100'>
                <div className='card-header bg-white d-flex justify-content-between align-items-center'>
                  <h5 className='card-title mb-0'>Pagos Recientes</h5>
                  <a href='/pagos' className='btn btn-sm btn-outline-primary'>
                    Ver todos
                  </a>
                </div>
                <div className='table-responsive'>
                  <table className='table table-hover'>
                    <thead className='table-light'>
                      <tr>
                        <th>Unidad</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>A-101</td>
                        <td>$45,000</td>
                        <td>12/09/2025</td>
                        <td>
                          <span className='badge bg-success'>Conciliado</span>
                        </td>
                      </tr>
                      <tr>
                        <td>B-202</td>
                        <td>$50,000</td>
                        <td>11/09/2025</td>
                        <td>
                          <span className='badge bg-success'>Conciliado</span>
                        </td>
                      </tr>
                      <tr>
                        <td>C-303</td>
                        <td>$42,500</td>
                        <td>10/09/2025</td>
                        <td>
                          <span className='badge bg-warning text-dark'>
                            Pendiente
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>A-102</td>
                        <td>$45,000</td>
                        <td>09/09/2025</td>
                        <td>
                          <span className='badge bg-success'>Conciliado</span>
                        </td>
                      </tr>
                      <tr>
                        <td>B-203</td>
                        <td>$50,000</td>
                        <td>08/09/2025</td>
                        <td>
                          <span className='badge bg-success'>Conciliado</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Unidades morosas */}
            <div className='col-lg-6'>
              <div className='card app-card shadow-sm h-100'>
                <div className='card-header bg-white d-flex justify-content-between align-items-center'>
                  <h5 className='card-title mb-0'>Unidades con Morosidad</h5>
                  <a href='#' className='btn btn-sm btn-outline-primary'>
                    Ver detalle
                  </a>
                </div>
                <div className='table-responsive'>
                  <table className='table table-hover'>
                    <thead className='table-light'>
                      <tr>
                        <th>Unidad</th>
                        <th>Propietario</th>
                        <th>Meses</th>
                        <th>Deuda</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>C-303</td>
                        <td>Juan Pérez</td>
                        <td>
                          <span className='badge bg-warning text-dark'>2</span>
                        </td>
                        <td>$90,000</td>
                        <td>
                          <button className='btn btn-sm btn-outline-primary'>
                            Notificar
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>D-404</td>
                        <td>María López</td>
                        <td>
                          <span className='badge bg-danger'>3</span>
                        </td>
                        <td>$135,000</td>
                        <td>
                          <button className='btn btn-sm btn-outline-primary'>
                            Notificar
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>A-105</td>
                        <td>Carlos González</td>
                        <td>
                          <span className='badge bg-warning text-dark'>1</span>
                        </td>
                        <td>$45,000</td>
                        <td>
                          <button className='btn btn-sm btn-outline-primary'>
                            Notificar
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>B-206</td>
                        <td>Ana Martínez</td>
                        <td>
                          <span className='badge bg-danger'>4</span>
                        </td>
                        <td>$180,000</td>
                        <td>
                          <button className='btn btn-sm btn-outline-primary'>
                            Notificar
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className='row g-4'>
            {/* Próximas actividades */}
            <div className='col-lg-6'>
              <div className='card app-card shadow-sm h-100'>
                <div className='card-header bg-white d-flex justify-content-between align-items-center'>
                  <h5 className='card-title mb-0'>Próximas Actividades</h5>
                  <button className='btn btn-sm btn-outline-primary'>
                    <span className='material-icons align-middle'>add</span>
                    Agendar
                  </button>
                </div>
                <div className='list-group list-group-flush'>
                  <div className='list-group-item'>
                    <div className='d-flex w-100 justify-content-between align-items-center'>
                      <div>
                        <h6 className='mb-1'>Asamblea General</h6>
                        <p className='mb-0 text-muted'>
                          Presentación de presupuesto anual
                        </p>
                      </div>
                      <div className='text-end'>
                        <span className='badge bg-primary'>20/09/2025</span>
                      </div>
                    </div>
                  </div>
                  <div className='list-group-item'>
                    <div className='d-flex w-100 justify-content-between align-items-center'>
                      <div>
                        <h6 className='mb-1'>Emisión Mensual</h6>
                        <p className='mb-0 text-muted'>
                          Generación de cargos de octubre
                        </p>
                      </div>
                      <div className='text-end'>
                        <span className='badge bg-primary'>30/09/2025</span>
                      </div>
                    </div>
                  </div>
                  <div className='list-group-item'>
                    <div className='d-flex w-100 justify-content-between align-items-center'>
                      <div>
                        <h6 className='mb-1'>Mantención de Ascensores</h6>
                        <p className='mb-0 text-muted'>
                          Servicio técnico programado
                        </p>
                      </div>
                      <div className='text-end'>
                        <span className='badge bg-primary'>02/10/2025</span>
                      </div>
                    </div>
                  </div>
                  <div className='list-group-item'>
                    <div className='d-flex w-100 justify-content-between align-items-center'>
                      <div>
                        <h6 className='mb-1'>Cierre Contable</h6>
                        <p className='mb-0 text-muted'>
                          Revisión de estado financiero mensual
                        </p>
                      </div>
                      <div className='text-end'>
                        <span className='badge bg-primary'>05/10/2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de reservas */}
            <div className='col-lg-6'>
              <div className='card app-card shadow-sm h-100'>
                <div className='card-header bg-white d-flex justify-content-between align-items-center'>
                  <h5 className='card-title mb-0'>Reservas de Amenidades</h5>
                  <a
                    href='/amenidades'
                    className='btn btn-sm btn-outline-primary'
                  >
                    Ver todas
                  </a>
                </div>
                <div className='card-body p-0'>
                  <div className='p-3 border-bottom'>
                    <div className='d-flex justify-content-between align-items-center mb-3'>
                      <div>
                        <h6 className='mb-0'>Salón de Eventos</h6>
                        <small className='text-muted'>
                          18/09/2025, 18:00 - 22:00
                        </small>
                      </div>
                      <span className='badge bg-success'>Confirmada</span>
                    </div>
                    <div className='d-flex align-items-center text-muted'>
                      <span
                        className='material-icons me-1'
                        style={{ fontSize: '16px' }}
                      >
                        apartment
                      </span>
                      <span className='me-3'>A-103</span>
                      <span
                        className='material-icons me-1'
                        style={{ fontSize: '16px' }}
                      >
                        person
                      </span>
                      <span>María González</span>
                    </div>
                  </div>
                  <div className='p-3 border-bottom'>
                    <div className='d-flex justify-content-between align-items-center mb-3'>
                      <div>
                        <h6 className='mb-0'>Quincho</h6>
                        <small className='text-muted'>
                          20/09/2025, 12:00 - 18:00
                        </small>
                      </div>
                      <span className='badge bg-warning text-dark'>
                        Pendiente
                      </span>
                    </div>
                    <div className='d-flex align-items-center text-muted'>
                      <span
                        className='material-icons me-1'
                        style={{ fontSize: '16px' }}
                      >
                        apartment
                      </span>
                      <span className='me-3'>B-205</span>
                      <span
                        className='material-icons me-1'
                        style={{ fontSize: '16px' }}
                      >
                        person
                      </span>
                      <span>Carlos Ruiz</span>
                    </div>
                  </div>
                  <div className='p-3'>
                    <div className='d-flex justify-content-between align-items-center mb-3'>
                      <div>
                        <h6 className='mb-0'>Piscina</h6>
                        <small className='text-muted'>
                          22/09/2025, 15:00 - 19:00
                        </small>
                      </div>
                      <span className='badge bg-success'>Confirmada</span>
                    </div>
                    <div className='d-flex align-items-center text-muted'>
                      <span
                        className='material-icons me-1'
                        style={{ fontSize: '16px' }}
                      >
                        apartment
                      </span>
                      <span className='me-3'>C-301</span>
                      <span
                        className='material-icons me-1'
                        style={{ fontSize: '16px' }}
                      >
                        person
                      </span>
                      <span>Ana Morales</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </ProtectedRoute>
  );
}
