/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable max-len */
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import DashboardCharts from '@/components/ui/DashboardCharts';
import comunidadesService from '@/lib/comunidadesService';
import { dashboardService, DashboardResumenCompleto } from '@/lib/dashboardService';
import { ProtectedRoute } from '@/lib/useAuth';
import { useAuth } from '@/lib/useAuth';
import {
  usePermissions,
} from '@/lib/usePermissions';


export default function Dashboard() {
  const { user } = useAuth();
  const { isSuperUser } = usePermissions();

  // Estados para datos dinámicos
  const [selectedComunidad, setSelectedComunidad] = useState<number | null>(null);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [searchComunidad, setSearchComunidad] = useState('');
  const [showComunidadDropdown, setShowComunidadDropdown] = useState(false);
  const [notificacionesCount] = useState(0);
  const [dashboardData, setDashboardData] = useState<DashboardResumenCompleto | null>(null);
  const [, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const comunidadesData = await comunidadesService.getComunidades();
        setComunidades(comunidadesData);

        // Inicializar con la primera comunidad si existe
        if (comunidadesData.length > 0) {
          const primeraComunidad = comunidadesData[0];
          if (primeraComunidad) {
            setSelectedComunidad(primeraComunidad.id);
            await loadDashboardData(primeraComunidad.id);
          }
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Error al cargar los datos iniciales');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Función para cargar datos del dashboard
  const loadDashboardData = async (comunidadId: number) => {
    try {
      const data = await dashboardService.getResumenCompleto(comunidadId);
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    }
  };

  // Función para cambiar de comunidad
  const handleComunidadChange = async (comunidadId: number) => {
    setSelectedComunidad(comunidadId);
    setIsLoading(true);
    await loadDashboardData(comunidadId);
    setIsLoading(false);
  };

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
                        {notificacionesCount > 0 ? notificacionesCount : ''}
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
            <div className='d-flex gap-2'>
              <div className='position-relative' style={{ minWidth: '280px' }}>
                <div className='input-group'>
                  <span className='input-group-text bg-white border-end-0'>
                    <span className='material-icons'>domain</span>
                  </span>
                  <input
                    type='text'
                    className='form-control border-start-0'
                    placeholder='Buscar comunidad...'
                    value={
                      showComunidadDropdown
                        ? searchComunidad
                        : comunidades.find(
                          c => c.id === selectedComunidad,
                        )?.nombre || 'Seleccionar Comunidad'
                    }
                    onChange={(e) => {
                      setSearchComunidad(e.target.value);
                      setShowComunidadDropdown(true);
                    }}
                    onFocus={() => setShowComunidadDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowComunidadDropdown(false), 200)
                    }
                  />
                </div>

                {/* Dropdown con resultados de búsqueda */}
                {showComunidadDropdown && (
                  <div
                    className='position-absolute w-100 mt-1 bg-white border rounded shadow-sm'
                    style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}
                  >
                    {comunidades
                      .filter(
                        c =>
                          c.nombre
                            .toLowerCase()
                            .includes(searchComunidad.toLowerCase()),
                      )
                      .map(comunidad => (
                        <button
                          key={comunidad.id}
                          className={`d-block w-100 text-start px-3 py-2 border-0 bg-white ${
                            comunidad.id === selectedComunidad
                              ? 'bg-light'
                              : ''
                          }`}
                          style={{ cursor: 'pointer' }}
                          onMouseDown={() => {
                            handleComunidadChange(comunidad.id);
                            setSearchComunidad('');
                            setShowComunidadDropdown(false);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              comunidad.id === selectedComunidad
                                ? '#f8f9fa'
                                : 'white';
                          }}
                        >
                          <div className='d-flex align-items-center'>
                            <span className='material-icons me-2 text-muted' style={{ fontSize: '18px' }}>
                              apartment
                            </span>
                            <div>
                              <div className='fw-500'>{comunidad.nombre}</div>
                              <small className='text-muted'>
                                {comunidad.direccion}
                              </small>
                            </div>
                          </div>
                        </button>
                      ))}
                    {comunidades.filter(c =>
                      c.nombre
                        .toLowerCase()
                        .includes(searchComunidad.toLowerCase()),
                    ).length === 0 && (
                      <div className='px-3 py-2 text-muted text-center'>
                        No se encontraron comunidades
                      </div>
                    )}
                  </div>
                )}
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
                      ${dashboardData?.kpis?.saldoTotal?.toLocaleString() || '0'}
                    </h4>
                    <div className={`small ${(dashboardData?.kpis?.saldoTotalChange || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                      <span
                        className='material-icons align-middle'
                        style={{ fontSize: '14px' }}
                      >
                        {(dashboardData?.kpis?.saldoTotalChange || 0) >= 0 ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                      <span>{Math.abs(dashboardData?.kpis?.saldoTotalChange || 0).toFixed(1)}% vs mes anterior</span>
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
                      ${dashboardData?.kpis?.ingresosMes?.toLocaleString() || '0'}
                    </h4>
                    <div className={`small ${(dashboardData?.kpis?.ingresosMesChange || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                      <span
                        className='material-icons align-middle'
                        style={{ fontSize: '14px' }}
                      >
                        {(dashboardData?.kpis?.ingresosMesChange || 0) >= 0 ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                      <span>{Math.abs(dashboardData?.kpis?.ingresosMesChange || 0).toFixed(1)}% vs mes anterior</span>
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
                      ${dashboardData?.kpis?.gastosMes?.toLocaleString() || '0'}
                    </h4>
                    <div className={`small ${(dashboardData?.kpis?.gastosMesChange || 0) >= 0 ? 'text-danger' : 'text-success'}`}>
                      <span
                        className='material-icons align-middle'
                        style={{ fontSize: '14px' }}
                      >
                        {(dashboardData?.kpis?.gastosMesChange || 0) >= 0 ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                      <span>{Math.abs(dashboardData?.kpis?.gastosMesChange || 0).toFixed(1)}% vs mes anterior</span>
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
                      {dashboardData?.kpis?.tasaMorosidad || '0'}%
                    </h4>
                    <div className={`small ${(dashboardData?.kpis?.tasaMorosidadChange || 0) <= 0 ? 'text-success' : 'text-danger'}`}>
                      <span
                        className='material-icons align-middle'
                        style={{ fontSize: '14px' }}
                      >
                        {(dashboardData?.kpis?.tasaMorosidadChange || 0) <= 0 ? 'arrow_downward' : 'arrow_upward'}
                      </span>
                      <span>{Math.abs(dashboardData?.kpis?.tasaMorosidadChange || 0).toFixed(1)}% vs mes anterior</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos implementados con Chart.js */}
          <DashboardCharts comunidadId={selectedComunidad || 0} />

          {/* Tablas de datos */}
          <div className='row g-4 mb-4'>
            {/* Pagos recientes */}
            <div className='col-lg-6'>
              <div className='card app-card shadow-sm h-100'>
                <div className='card-header bg-white d-flex justify-content-between align-items-center'>
                  <h5 className='card-title mb-0'>Pagos Recientes</h5>
                  <Link
                    href='/pagos'
                    className='btn btn-sm btn-outline-primary'
                  >
                    Ver todos
                  </Link>
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
                      {dashboardData?.pagosRecientes?.map((pago, index) => (
                        <tr key={index}>
                          <td>{pago.unidad}</td>
                          <td>${pago.monto.toLocaleString()}</td>
                          <td>{new Date(pago.fecha).toLocaleDateString()}</td>
                          <td>
                            <span
                              className={`badge ${
                                pago.estado === 'Conciliado'
                                  ? 'bg-success'
                                  : pago.estado === 'Pendiente'
                                    ? 'bg-warning text-dark'
                                    : 'bg-secondary'
                              }`}
                            >
                              {pago.estado}
                            </span>
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={4} className="text-center text-muted">
                            No hay pagos recientes
                          </td>
                        </tr>
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
                      {dashboardData?.unidadesMorosas?.map((unidad, index) => (
                        <tr key={index}>
                          <td>{unidad.unidad}</td>
                          <td>{unidad.propietario}</td>
                          <td>
                            <span
                              className={`badge ${
                                unidad.meses >= 3
                                  ? 'bg-danger'
                                  : 'bg-warning text-dark'
                              }`}
                            >
                              {unidad.meses}
                            </span>
                          </td>
                          <td>${unidad.deuda.toLocaleString()}</td>
                          <td>
                            <button className='btn btn-sm btn-outline-primary'>
                              Notificar
                            </button>
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={5} className="text-center text-muted">
                            No hay unidades morosas
                          </td>
                        </tr>
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
                  {dashboardData?.proximasActividades?.map((actividad, index) => (
                    <div key={index} className='list-group-item'>
                      <div className='d-flex w-100 justify-content-between align-items-center'>
                        <div>
                          <h6 className='mb-1'>{actividad.titulo}</h6>
                          <p className='mb-0 text-muted'>
                            {actividad.descripcion}
                          </p>
                        </div>
                        <div className='text-end'>
                          <span className='badge bg-primary'>
                            {new Date(actividad.fecha).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className='list-group-item text-center text-muted'>
                      No hay actividades próximas
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen de reservas */}
            <div className='col-lg-6'>
              <div className='card app-card shadow-sm h-100'>
                <div className='card-header bg-white d-flex justify-content-between align-items-center'>
                  <h5 className='card-title mb-0'>Reservas de Amenidades</h5>
                  <Link
                    href='/amenidades'
                    className='btn btn-sm btn-outline-primary'
                  >
                    Ver todas
                  </Link>
                </div>
                <div className='card-body p-0'>
                  {dashboardData?.reservasAmenidades?.map((reserva, index) => (
                    <div
                      key={index}
                      className={`p-3 ${
                        index < dashboardData.reservasAmenidades.length - 1
                          ? 'border-bottom'
                          : ''
                      }`}
                    >
                      <div className='d-flex justify-content-between align-items-center mb-3'>
                        <div>
                          <h6 className='mb-0'>{reserva.amenidad}</h6>
                          <small className='text-muted'>
                            {new Date(reserva.fecha).toLocaleDateString()}
                          </small>
                        </div>
                        <span
                          className={`badge ${
                            reserva.estado === 'Confirmada'
                              ? 'bg-success'
                              : reserva.estado === 'Pendiente'
                                ? 'bg-warning text-dark'
                                : 'bg-secondary'
                          }`}
                        >
                          {reserva.estado}
                        </span>
                      </div>
                      <div className='d-flex align-items-center text-muted'>
                        <span
                          className='material-icons me-1'
                          style={{ fontSize: '16px' }}
                        >
                          apartment
                        </span>
                        <span className='me-3'>{reserva.unidad}</span>
                        <span
                          className='material-icons me-1'
                          style={{ fontSize: '16px' }}
                        >
                          person
                        </span>
                        <span>{reserva.usuario}</span>
                      </div>
                    </div>
                  )) || (
                    <div className='p-3 text-center text-muted'>
                      No hay reservas próximas
                    </div>
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
