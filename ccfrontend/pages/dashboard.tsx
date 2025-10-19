import React, { useState, useEffect, useMemo } from 'react';
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
import {
  getDashboardKPIs,
  getPagosRecientes,
  getUnidadesMorosas,
  getProximasActividades,
  getReservasAmenidades,
  getNotificacionesRecientes,
  type DashboardKPIs,
  type PagoReciente,
  type UnidadMorosa,
  type ActividadProxima,
  type ReservaAmenidad,
  type Notificacion
} from '@/lib/dashboardService';

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { isSuperUser, currentRole } = usePermissions();

  // Obtener comunidadId dinámicamente
  const comunidadId = useMemo(() => {
    const id = currentRole?.comunidadId ??
               user?.memberships?.[0]?.comunidad_id ??
               user?.memberships?.[0]?.comunidadId ??
               1;
    console.log('Dashboard comunidadId:', id, 'user:', user, 'currentRole:', currentRole); // <-- añadir
    return id;
  }, [currentRole?.comunidadId, user?.memberships]);

  // Estado para datos del dashboard
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [pagosRecientes, setPagosRecientes] = useState<PagoReciente[]>([]);
  const [unidadesMorosas, setUnidadesMorosas] = useState<UnidadMorosa[]>([]);
  const [proximasActividades, setProximasActividades] = useState<ActividadProxima[]>([]);
  const [reservasAmenidades, setReservasAmenidades] = useState<ReservaAmenidad[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del dashboard
  useEffect(() => {
    // Evitar solicitudes hasta que auth esté resuelto y usuario esté autenticado
    if (authLoading) return;
    if (!isAuthenticated) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar todos los datos en paralelo
        const [
          kpisData,
          pagosData,
          morosasData,
          actividadesData,
          reservasData,
          notificacionesData
        ] = await Promise.all([
          getDashboardKPIs(comunidadId),
          getPagosRecientes(comunidadId),
          getUnidadesMorosas(comunidadId),
          getProximasActividades(comunidadId),
          getReservasAmenidades(comunidadId),
          getNotificacionesRecientes(comunidadId)
        ]);

        setKpis(kpisData);
        setPagosRecientes(pagosData);
        setUnidadesMorosas(morosasData);
        setProximasActividades(actividadesData);
        setReservasAmenidades(reservasData);
        setNotificaciones(notificacionesData);
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
        setError(err.message || 'Error al cargar datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [comunidadId, authLoading, isAuthenticated]);

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
          {error && (
            <div className='alert alert-danger d-flex align-items-center mb-4'>
              <span className='material-icons me-2'>error</span>
              <div>
                <strong>Error al cargar datos del dashboard:</strong> {error}
              </div>
            </div>
          )}
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
                    <h4 className='mb-0'>
                      {loading ? '...' : kpis?.saldo_total?.valor ? `$${kpis.saldo_total.valor.toLocaleString('es-CL')}` : '$0'}
                    </h4>
                    <div className={`small ${kpis?.saldo_total?.variacion_porcentual && kpis.saldo_total.variacion_porcentual > 0 ? 'text-success' : 'text-danger'}`}>
                      <span
                        className='material-icons align-middle'
                        style={{ fontSize: '14px' }}
                      >
                        {kpis?.saldo_total?.variacion_porcentual && kpis.saldo_total.variacion_porcentual > 0 ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                      <span>{kpis?.saldo_total?.variacion_porcentual ? `${Math.abs(kpis.saldo_total.variacion_porcentual)}%` : '0%'} vs mes anterior</span>
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
                    <h4 className='mb-0'>
                      {loading ? '...' : kpis?.ingresos_mes?.valor ? `$${kpis.ingresos_mes.valor.toLocaleString('es-CL')}` : '$0'}
                    </h4>
                    <div className={`small ${kpis?.ingresos_mes?.variacion_porcentual && kpis.ingresos_mes.variacion_porcentual > 0 ? 'text-success' : 'text-danger'}`}>
                      <span
                        className='material-icons align-middle'
                        style={{ fontSize: '14px' }}
                      >
                        {kpis?.ingresos_mes?.variacion_porcentual && kpis.ingresos_mes.variacion_porcentual > 0 ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                      <span>{kpis?.ingresos_mes?.variacion_porcentual ? `${Math.abs(kpis.ingresos_mes.variacion_porcentual)}%` : '0%'} vs mes anterior</span>
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
                    <h4 className='mb-0'>
                      {loading ? '...' : kpis?.gastos_mes?.valor ? `$${kpis.gastos_mes.valor.toLocaleString('es-CL')}` : '$0'}
                    </h4>
                    <div className={`small ${kpis?.gastos_mes?.variacion_porcentual && kpis.gastos_mes.variacion_porcentual > 0 ? 'text-danger' : 'text-success'}`}>
                      <span
                        className='material-icons align-middle'
                        style={{ fontSize: '14px' }}
                      >
                        {kpis?.gastos_mes?.variacion_porcentual && kpis.gastos_mes.variacion_porcentual > 0 ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                      <span>{kpis?.gastos_mes?.variacion_porcentual ? `${Math.abs(kpis.gastos_mes.variacion_porcentual)}%` : '0%'} vs mes anterior</span>
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
                    <h4 className='mb-0'>
                      {loading ? '...' : kpis?.morosidad?.valor !== undefined ? `${kpis.morosidad.valor}%` : '0%'}
                    </h4>
                    <div className={`small ${kpis?.morosidad?.variacion_porcentual && kpis.morosidad.variacion_porcentual < 0 ? 'text-success' : 'text-danger'}`}>
                      <span
                        className='material-icons align-middle'
                        style={{ fontSize: '14px' }}
                      >
                        {kpis?.morosidad?.variacion_porcentual && kpis.morosidad.variacion_porcentual < 0 ? 'arrow_downward' : 'arrow_upward'}
                      </span>
                      <span>{kpis?.morosidad?.variacion_porcentual ? `${Math.abs(kpis.morosidad.variacion_porcentual)}%` : '0%'} vs mes anterior</span>
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
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4">
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </div>
                            <div className="mt-2">Cargando pagos recientes...</div>
                          </td>
                        </tr>
                      ) : pagosRecientes.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-muted">
                            No hay pagos recientes
                          </td>
                        </tr>
                      ) : (
                        pagosRecientes.map((pago: PagoReciente) => (
                          <tr key={pago.id}>
                            <td>{pago.unidad_codigo}</td>
                            <td>${pago.monto ? pago.monto.toLocaleString('es-CL') : '0'}</td>
                            <td>{new Date(pago.fecha).toLocaleDateString('es-CL')}</td>
                            <td>
                              <span className={`badge ${pago.estado === 'aplicado' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                {pago.estado === 'aplicado' ? 'Conciliado' : 'Pendiente'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
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
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4">
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </div>
                            <div className="mt-2">Cargando unidades morosas...</div>
                          </td>
                        </tr>
                      ) : unidadesMorosas.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted">
                            No hay unidades morosas
                          </td>
                        </tr>
                      ) : (
                        unidadesMorosas.map((unidad: UnidadMorosa) => (
                          <tr key={unidad.unidad_id}>
                            <td>{unidad.codigo_unidad}</td>
                            <td>{unidad.propietario || 'Sin propietario'}</td>
                            <td>
                              <span className={`badge ${unidad.meses_morosos > 2 ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                {unidad.meses_morosos}
                              </span>
                            </td>
                            <td>${unidad.deuda_total ? unidad.deuda_total.toLocaleString('es-CL') : '0'}</td>
                            <td>
                              <button className='btn btn-sm btn-outline-primary'>
                                Notificar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
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
                  {loading ? (
                    <div className='list-group-item text-center py-4'>
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      <div className="mt-2">Cargando actividades...</div>
                    </div>
                  ) : proximasActividades.length === 0 ? (
                    <div className='list-group-item text-center py-4 text-muted'>
                      No hay actividades próximas
                    </div>
                  ) : (
                    proximasActividades.map((actividad: ActividadProxima, index: number) => (
                      <div key={index} className='list-group-item'>
                        <div className='d-flex w-100 justify-content-between align-items-center'>
                          <div>
                            <h6 className='mb-1'>{actividad.titulo}</h6>
                            <p className='mb-0 text-muted'>
                              {actividad.descripcion}
                            </p>
                          </div>
                          <div className='text-end'>
                            <span className={`badge ${actividad.estado_relativo === 'hoy' ? 'bg-warning text-dark' : actividad.estado_relativo === 'vencida' ? 'bg-danger' : 'bg-primary'}`}>
                              {actividad.fecha_formateada}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                  {loading ? (
                    <div className='p-3 text-center py-4'>
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      <div className="mt-2">Cargando reservas...</div>
                    </div>
                  ) : reservasAmenidades.length === 0 ? (
                    <div className='p-3 text-center py-4 text-muted'>
                      No hay reservas próximas
                    </div>
                  ) : (
                    reservasAmenidades.map((reserva: ReservaAmenidad, index: number) => (
                      <div key={reserva.id} className={`p-3 ${index < reservasAmenidades.length - 1 ? 'border-bottom' : ''}`}>
                        <div className='d-flex justify-content-between align-items-center mb-3'>
                          <div>
                            <h6 className='mb-0'>{reserva.amenidad}</h6>
                            <small className='text-muted'>
                              {reserva.fecha_inicio} - {reserva.fecha_fin}
                            </small>
                          </div>
                          <span className={`badge ${reserva.estado_descripcion === 'Confirmada' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {reserva.estado_descripcion}
                          </span>
                        </div>
                        <div className='d-flex align-items-center text-muted'>
                          <span
                            className='material-icons me-1'
                            style={{ fontSize: '16px' }}
                          >
                            apartment
                          </span>
                          <span className='me-3'>{reserva.unidad_reserva}</span>
                          <span
                            className='material-icons me-1'
                            style={{ fontSize: '16px' }}
                          >
                            person
                          </span>
                          <span>{reserva.reservado_por}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </ProtectedRoute>
  );
}
