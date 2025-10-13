import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Card, Row, Col, Button, Form, Table } from 'react-bootstrap';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import * as gastosApi from '../../lib/api/gastos';

export default function ReportesGastos() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [comunidadId] = useState(1); // TODO: Obtener de contexto/sesión
  
  // Estados para los diferentes reportes
  const [gastosPorCategoria, setGastosPorCategoria] = useState<gastosApi.GastoPorCategoria[]>([]);
  const [gastosPorProveedor, setGastosPorProveedor] = useState<gastosApi.GastoPorProveedor[]>([]);
  const [gastosPorCentroCosto, setGastosPorCentroCosto] = useState<gastosApi.GastoPorCentroCosto[]>([]);
  const [evolucionTemporal, setEvolucionTemporal] = useState<gastosApi.EvolucionTemporal[]>([]);
  const [topGastos, setTopGastos] = useState<gastosApi.Gasto[]>([]);
  const [gastosPendientes, setGastosPendientes] = useState<gastosApi.Gasto[]>([]);
  const [alertas, setAlertas] = useState<gastosApi.Alerta[]>([]);
  
  // Filtros
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [mesesEvolucion, setMesesEvolucion] = useState(12);
  const [limitTop, setLimitTop] = useState(10);

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    try {
      setLoading(true);
      
      const [
        categoriasRes,
        proveedoresRes,
        centrosCostoRes,
        evolucionRes,
        topGastosRes,
        pendientesRes,
        alertasRes
      ] = await Promise.all([
        gastosApi.obtenerGastosPorCategoria(comunidadId, fechaDesde, fechaHasta),
        gastosApi.obtenerGastosPorProveedor(comunidadId, fechaDesde, fechaHasta),
        gastosApi.obtenerGastosPorCentroCosto(comunidadId, fechaDesde, fechaHasta),
        gastosApi.obtenerEvolucionTemporal(comunidadId, mesesEvolucion),
        gastosApi.obtenerTopGastos(comunidadId, limitTop, fechaDesde, fechaHasta),
        gastosApi.obtenerGastosPendientes(comunidadId),
        gastosApi.obtenerAlertas(comunidadId)
      ]);

      if (categoriasRes.success) setGastosPorCategoria(categoriasRes.data);
      if (proveedoresRes.success) setGastosPorProveedor(proveedoresRes.data);
      if (centrosCostoRes.success) setGastosPorCentroCosto(centrosCostoRes.data);
      if (evolucionRes.success) setEvolucionTemporal(evolucionRes.data);
      if (topGastosRes.success) setTopGastos(topGastosRes.data);
      if (pendientesRes.success) setGastosPendientes(pendientesRes.data);
      if (alertasRes.success) setAlertas(alertasRes.data);
      
    } catch (error) {
      console.error('Error loading reports:', error);
      alert('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    loadAllReports();
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'sin_aprobacion': return 'pending_actions';
      case 'monto_alto': return 'trending_up';
      case 'vencido': return 'schedule';
      default: return 'warning';
    }
  };

  const getAlertColor = (tipo: string) => {
    switch (tipo) {
      case 'sin_aprobacion': return 'warning';
      case 'monto_alto': return 'danger';
      case 'vencido': return 'info';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" />
              <p>Cargando reportes...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Reportes de Gastos — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className="reports-container">
          {/* Header */}
          <div className="reports-header mb-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h1 className="reports-title">
                  <span className="material-icons me-2">assessment</span>
                  Reportes de Gastos
                </h1>
                <p className="reports-subtitle">
                  Análisis detallado y estadísticas de gastos
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-light" 
                  onClick={() => router.push('/gastos')}
                >
                  <span className="material-icons me-2">arrow_back</span>
                  Volver
                </Button>
                <Button 
                  variant="light" 
                  onClick={() => window.print()}
                >
                  <span className="material-icons me-2">print</span>
                  Imprimir
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">
                <span className="material-icons me-2">filter_alt</span>
                Filtros de Reporte
              </h5>
              <Row className="g-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Fecha Desde</Form.Label>
                    <Form.Control
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Fecha Hasta</Form.Label>
                    <Form.Control
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Meses Evolución</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="24"
                      value={mesesEvolucion}
                      onChange={(e) => setMesesEvolucion(parseInt(e.target.value))}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Top Gastos</Form.Label>
                    <Form.Control
                      type="number"
                      min="5"
                      max="50"
                      value={limitTop}
                      onChange={(e) => setLimitTop(parseInt(e.target.value))}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button 
                    variant="primary" 
                    onClick={handleFilterChange}
                    className="w-100"
                  >
                    <span className="material-icons me-2">refresh</span>
                    Actualizar
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Alertas */}
          {alertas.length > 0 && (
            <Card className="mb-4 border-warning">
              <Card.Body>
                <h5 className="mb-3">
                  <span className="material-icons me-2">notifications_active</span>
                  Alertas y Notificaciones
                </h5>
                <Row>
                  {alertas.map((alerta, index) => (
                    <Col key={index} md={4} className="mb-3">
                      <div className={`alert alert-${getAlertColor(alerta.tipo)} d-flex align-items-center mb-0`}>
                        <span className="material-icons me-2">{getAlertIcon(alerta.tipo)}</span>
                        <div>
                          <strong>{alerta.cantidad}</strong> {alerta.descripcion}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Gastos Pendientes de Aprobación */}
          {gastosPendientes.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <h5 className="mb-3">
                  <span className="material-icons me-2">pending_actions</span>
                  Gastos Pendientes de Aprobación ({gastosPendientes.length})
                </h5>
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Fecha</th>
                      <th>Descripción</th>
                      <th>Categoría</th>
                      <th className="text-end">Monto</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gastosPendientes.map((gasto) => (
                      <tr key={gasto.id}>
                        <td>{gasto.numero}</td>
                        <td>{new Date(gasto.fecha).toLocaleDateString('es-CL')}</td>
                        <td>{gasto.glosa}</td>
                        <td>{gasto.categoria_nombre}</td>
                        <td className="text-end fw-bold">{formatCurrency(gasto.monto)}</td>
                        <td>
                          <span className="badge bg-warning text-dark">Pendiente</span>
                        </td>
                        <td>
                          <Button 
                            size="sm" 
                            variant="outline-primary"
                            onClick={() => router.push(`/gastos/${gasto.id}`)}
                          >
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          <Row>
            {/* Gastos por Categoría */}
            <Col lg={6} className="mb-4">
              <Card>
                <Card.Body>
                  <h5 className="mb-3">
                    <span className="material-icons me-2">category</span>
                    Gastos por Categoría
                  </h5>
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th>Categoría</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-end">Monto Total</th>
                        <th className="text-center">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gastosPorCategoria.map((item) => (
                        <tr key={item.categoria_id}>
                          <td>{item.categoria_nombre}</td>
                          <td className="text-center">{item.total_gastos}</td>
                          <td className="text-end fw-bold">{formatCurrency(item.monto_total)}</td>
                          <td className="text-center">
                            <span className="badge bg-primary">{item.porcentaje.toFixed(1)}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            {/* Gastos por Centro de Costo */}
            <Col lg={6} className="mb-4">
              <Card>
                <Card.Body>
                  <h5 className="mb-3">
                    <span className="material-icons me-2">account_balance</span>
                    Gastos por Centro de Costo
                  </h5>
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th>Centro de Costo</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-end">Monto Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gastosPorCentroCosto.map((item) => (
                        <tr key={item.centro_costo_id}>
                          <td>{item.centro_costo_nombre}</td>
                          <td className="text-center">{item.total_gastos}</td>
                          <td className="text-end fw-bold">{formatCurrency(item.monto_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Gastos por Proveedor */}
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">
                <span className="material-icons me-2">business</span>
                Gastos por Proveedor
              </h5>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-end">Monto Total</th>
                    <th className="text-end">Monto Promedio</th>
                    <th>Último Gasto</th>
                  </tr>
                </thead>
                <tbody>
                  {gastosPorProveedor.map((item) => (
                    <tr key={item.proveedor_id}>
                      <td>{item.proveedor_nombre}</td>
                      <td className="text-center">{item.total_gastos}</td>
                      <td className="text-end fw-bold">{formatCurrency(item.monto_total)}</td>
                      <td className="text-end">{formatCurrency(item.monto_promedio)}</td>
                      <td>{formatDate(item.ultimo_gasto)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Evolución Temporal */}
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">
                <span className="material-icons me-2">show_chart</span>
                Evolución Temporal (Últimos {mesesEvolucion} meses)
              </h5>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-end">Monto Total</th>
                    <th className="text-end">Monto Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {evolucionTemporal.map((item, index) => (
                    <tr key={index}>
                      <td>{item.mes} {item.anio}</td>
                      <td className="text-center">{item.total_gastos}</td>
                      <td className="text-end fw-bold">{formatCurrency(item.monto_total)}</td>
                      <td className="text-end">{formatCurrency(item.monto_promedio)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Top Gastos Mayores */}
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">
                <span className="material-icons me-2">leaderboard</span>
                Top {limitTop} Gastos Mayores
              </h5>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Número</th>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th className="text-end">Monto</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {topGastos.map((gasto, index) => (
                    <tr key={gasto.id}>
                      <td>{index + 1}</td>
                      <td>{gasto.numero}</td>
                      <td>{new Date(gasto.fecha).toLocaleDateString('es-CL')}</td>
                      <td>{gasto.glosa}</td>
                      <td>{gasto.categoria_nombre}</td>
                      <td className="text-end fw-bold text-danger">{formatCurrency(gasto.monto)}</td>
                      <td>
                        <span className={`badge bg-${
                          gasto.estado === 'aprobado' ? 'success' :
                          gasto.estado === 'pendiente' ? 'warning' :
                          gasto.estado === 'rechazado' ? 'danger' :
                          'secondary'
                        }`}>
                          {gasto.estado}
                        </span>
                      </td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => router.push(`/gastos/${gasto.id}`)}
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>

        <style jsx>{`
          .reports-container {
            padding: 2rem;
          }

          .reports-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .reports-title {
            font-size: 2rem;
            font-weight: 700;
            margin: 0;
            display: flex;
            align-items: center;
          }

          .reports-subtitle {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
          }

          @media print {
            .reports-header button,
            .filters-card {
              display: none;
            }
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}
