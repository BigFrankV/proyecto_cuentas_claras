import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container, Table, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';

interface Conciliacion {
  id: number;
  period: string;
  bankAccount: string;
  bank: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'in-progress' | 'completed' | 'with-differences';
  bankBalance: number;
  bookBalance: number;
  difference: number;
  matchedTransactions: number;
  totalTransactions: number;
  createdBy: string;
  createdAt: string;
  completedAt: string | undefined;
  codigo: string | undefined;
  glosa: string | undefined;
  monto: number;
  estado: string;
  nombreComunidad: string | undefined;
}

interface Filters {
  search: string;
  status: string;
  bank: string;
  period: string;
  dateFrom: string;
  dateTo: string;
  comunidad_id?: string;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

// API interfaces
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiConciliacion {
  id: number;
  codigo?: string;
  fecha_mov: string;
  glosa?: string;
  monto: number;
  tipo?: 'credito' | 'debito' | 'otro';
  referencia_bancaria?: string;
  estado_conciliacion?: 'pendiente' | 'conciliado' | 'diferencia' | 'descartado';
  pago_id?: number;
  codigo_pago?: string;
  referencia_pago?: string;
  nombre_comunidad?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiEstadisticas {
  totalMovimientos: number;
  movimientosConciliados: number;
  movimientosPendientes: number;
  movimientosDiferencia: number;
  montoTotal: number;
  montoPromedio: number;
  movimientosCredito: number;
  movimientosDebito: number;
  movimientoMasAntiguo?: string;
  movimientoMasNuevo?: string;
}

interface ApiResumen {
  nombreComunidad?: string;
  totalMovimientos: number;
  movimientosConciliados: number;
  movimientosPendientes: number;
  movimientosDiferencia: number;
  montoBancarioTotal: number;
  pagosVinculados: number;
  tasaConciliacion: number;
  movimientoMasAntiguo?: string;
  movimientoMasNuevo?: string;
}

// API functions
const conciliacionesApi = {
  async getConciliaciones(filters: Partial<Filters> = {}, page = 1, limit = 20): Promise<{conciliaciones: ApiConciliacion[], total: number}> {
    const params = new URLSearchParams();
    
    if (filters.comunidad_id) params.append('comunidad_id', filters.comunidad_id);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    params.append('limit', limit.toString());
    params.append('offset', ((page - 1) * limit).toString());

    const response = await fetch(`${API_BASE_URL}/conciliaciones?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener conciliaciones: ${response.statusText}`);
    }

    const conciliaciones = await response.json();
    
    // Get total count
    const countResponse = await fetch(`${API_BASE_URL}/conciliaciones/count?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    const countData = await countResponse.json();
    const total = countData.total || 0;

    return { conciliaciones, total };
  },

  async getEstadisticas(comunidadId?: string): Promise<ApiEstadisticas> {
    const endpoint = comunidadId 
      ? `${API_BASE_URL}/conciliaciones/comunidad/${comunidadId}/estadisticas`
      : `${API_BASE_URL}/conciliaciones/estadisticas`;

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener estadísticas: ${response.statusText}`);
    }

    return response.json();
  },

  async getResumen(comunidadId?: string): Promise<ApiResumen> {
    const endpoint = comunidadId 
      ? `${API_BASE_URL}/conciliaciones/comunidad/${comunidadId}/resumen`
      : `${API_BASE_URL}/conciliaciones/resumen`;

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener resumen: ${response.statusText}`);
    }

    return response.json();
  }
};

// Helper function to map API data to frontend format
const mapApiToFrontend = (apiConciliacion: ApiConciliacion): Conciliacion => {
  // Extract year and month from fecha_mov for period
  const fecha = new Date(apiConciliacion.fecha_mov);
  const period = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  
  // Map status
  let status: Conciliacion['status'] = 'draft';
  switch (apiConciliacion.estado_conciliacion) {
    case 'pendiente':
      status = 'in-progress';
      break;
    case 'conciliado':
      status = 'completed';
      break;
    case 'diferencia':
    case 'descartado':
      status = 'with-differences';
      break;
  }

  return {
    id: apiConciliacion.id,
    period,
    bankAccount: 'Cuenta Principal', // Default, could be enhanced
    bank: 'Banco Principal', // Default, could be enhanced
    startDate: apiConciliacion.fecha_mov,
    endDate: apiConciliacion.fecha_mov,
    status,
    bankBalance: apiConciliacion.monto,
    bookBalance: apiConciliacion.monto, // Simplified, could be enhanced with pago data
    difference: 0, // Simplified, could be calculated
    matchedTransactions: apiConciliacion.estado_conciliacion === 'conciliado' ? 1 : 0,
    totalTransactions: 1,
    createdBy: 'Sistema', // Default, could be enhanced
    createdAt: apiConciliacion.created_at || new Date().toISOString(),
    completedAt: apiConciliacion.estado_conciliacion === 'conciliado' ? (apiConciliacion.updated_at || undefined) : undefined,
    codigo: apiConciliacion.codigo,
    glosa: apiConciliacion.glosa,
    monto: apiConciliacion.monto,
    estado: apiConciliacion.estado_conciliacion || 'pendiente',
    nombreComunidad: apiConciliacion.nombre_comunidad
  };
};

export default function ConciliacionesListado() {
  const [conciliaciones, setConciliaciones] = useState<Conciliacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    withDifferences: 0
  });
  const [summaryData, setSummaryData] = useState({
    totalBalance: 0,
    precision: 0,
    daysAverage: 0,
    accountsCount: 0
  });
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    bank: '',
    period: '',
    dateFrom: '',
    dateTo: ''
  });

  // Load data from API
  const loadConciliaciones = async () => {
    try {
      setLoading(true);
      setError(null);

      // Map frontend filters to API filters
      const apiFilters: Partial<Filters> = {};
      if (filters.status) {
        switch (filters.status) {
          case 'draft':
            apiFilters.estado = 'pendiente';
            break;
          case 'in-progress':
            apiFilters.estado = 'pendiente';
            break;
          case 'completed':
            apiFilters.estado = 'conciliado';
            break;
          case 'with-differences':
            apiFilters.estado = 'descartado';
            break;
        }
      }
      if (filters.dateFrom) apiFilters.fecha_desde = filters.dateFrom;
      if (filters.dateTo) apiFilters.fecha_hasta = filters.dateTo;

      const { conciliaciones: apiData } = await conciliacionesApi.getConciliaciones(apiFilters);
      const mappedData = apiData.map(mapApiToFrontend);
      setConciliaciones(mappedData);

      // Load statistics
      try {
        const estadisticas = await conciliacionesApi.getEstadisticas();
        setStats({
          total: estadisticas.totalMovimientos,
          completed: estadisticas.movimientosConciliados,
          inProgress: estadisticas.movimientosPendientes,
          withDifferences: estadisticas.movimientosDiferencia
        });

        setSummaryData({
          totalBalance: estadisticas.montoTotal,
          precision: estadisticas.totalMovimientos > 0 
            ? (estadisticas.movimientosConciliados / estadisticas.totalMovimientos) * 100 
            : 0,
          daysAverage: 2.3, // This would need to be calculated from actual data
          accountsCount: 4 // This would need to be fetched from accounts API
        });
      } catch (statsError) {
        console.warn('Could not load statistics:', statsError);
        // Set default stats
        setStats({
          total: mappedData.length,
          completed: mappedData.filter(c => c.status === 'completed').length,
          inProgress: mappedData.filter(c => c.status === 'in-progress').length,
          withDifferences: mappedData.filter(c => c.status === 'with-differences').length
        });
      }

    } catch (err) {
      console.error('Error loading conciliaciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar conciliaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConciliaciones();
  }, [filters.status, filters.dateFrom, filters.dateTo]);

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { class: 'status-badge draft', text: 'Borrador', icon: 'edit' },
      'in-progress': { class: 'status-badge in-progress', text: 'En Proceso', icon: 'schedule' },
      'completed': { class: 'status-badge completed', text: 'Completada', icon: 'check_circle' },
      'with-differences': { class: 'status-badge with-differences', text: 'Con Diferencias', icon: 'error' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={config.class}>
        <span className="material-icons">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${monthNames[parseInt(month || '1') - 1]} ${year || ''}`;
  };

  const getDifferenceClass = (difference: number) => {
    if (difference === 0) return 'text-success';
    if (difference > 0) return 'text-primary';
    return 'text-danger';
  };

  const getProgressPercentage = (matched: number, total: number) => {
    return total > 0 ? Math.round((matched / total) * 100) : 0;
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Conciliaciones Bancarias — Cuentas Claras</title>
      </Head>

      <Layout title='Conciliaciones Bancarias'>
        <Container fluid className="p-4">
          {/* Header */}
          <div className="conciliations-header">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h1 className="conciliations-title">Conciliaciones Bancarias</h1>
                <p className="conciliations-subtitle">
                  Gestiona y controla las conciliaciones bancarias mensuales
                </p>
                <div className="header-stats">
                  <div className="stat-item">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Total</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{stats.completed}</div>
                    <div className="stat-label">Completadas</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{stats.inProgress}</div>
                    <div className="stat-label">En Proceso</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{stats.withDifferences}</div>
                    <div className="stat-label">Con Diferencias</div>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <Link href="/conciliaciones/nueva" passHref>
                  <Button variant="light" size="lg">
                    <span className="material-icons me-2">add</span>
                    Nueva Conciliación
                  </Button>
                </Link>
                <Button variant="outline-light" size="lg">
                  <span className="material-icons me-2">upload</span>
                  Importar Estados
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-card-icon">
                <span className="material-icons">account_balance</span>
              </div>
              <div className="summary-card-number">4</div>
              <div className="summary-card-label">Cuentas Bancarias</div>
              <div className="summary-card-description">
                Cuentas activas configuradas
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-card-icon">
                <span className="material-icons">trending_up</span>
              </div>
              <div className="summary-card-number">96%</div>
              <div className="summary-card-label">Precisión Promedio</div>
              <div className="summary-card-description">
                Porcentaje de transacciones coincidentes
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-card-icon">
                <span className="material-icons">schedule</span>
              </div>
              <div className="summary-card-number">2.3</div>
              <div className="summary-card-label">Días Promedio</div>
              <div className="summary-card-description">
                Tiempo promedio de conciliación
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-card-icon">
                <span className="material-icons">savings</span>
              </div>
              <div className="summary-card-number">{formatCurrency(57212500)}</div>
              <div className="summary-card-label">Balance Total</div>
              <div className="summary-card-description">
                Suma de saldos conciliados
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-card">
            <div className="filters-header">
              <h5 className="filters-title">
                <span className="material-icons">filter_list</span>
                Filtros de Búsqueda
              </h5>
              <Button variant="outline-secondary" size="sm">
                <span className="material-icons me-1">clear</span>
                Limpiar Filtros
              </Button>
            </div>
            <div className="filters-grid">
              <div>
                <Form.Label className="small fw-medium text-muted mb-1">Buscar conciliaciones</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-end-0">
                    <span className="material-icons text-muted">search</span>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Período, banco, cuenta..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="border-start-0"
                  />
                </InputGroup>
              </div>
              <div>
                <Form.Label className="small fw-medium text-muted mb-1">Estado</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="draft">Borrador</option>
                  <option value="in-progress">En Proceso</option>
                  <option value="completed">Completada</option>
                  <option value="with-differences">Con Diferencias</option>
                </Form.Select>
              </div>
              <div>
                <Form.Label className="small fw-medium text-muted mb-1">Banco</Form.Label>
                <Form.Select
                  value={filters.bank}
                  onChange={(e) => handleFilterChange('bank', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Banco de Chile">Banco de Chile</option>
                  <option value="Banco Santander">Banco Santander</option>
                  <option value="Banco Estado">Banco Estado</option>
                </Form.Select>
              </div>
              <div>
                <Form.Label className="small fw-medium text-muted mb-1">Período</Form.Label>
                <Form.Control
                  type="month"
                  value={filters.period}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                />
              </div>
              <div>
                <Button variant="primary" size="sm" className="w-100">
                  <span className="material-icons me-1">search</span>
                  Buscar
                </Button>
              </div>
            </div>
          </div>

          {/* Conciliations Table */}
          <div className="conciliations-table">
            <div className="table-header">
              <h5 className="table-title">
                <span className="material-icons">view_list</span>
                Lista de Conciliaciones ({conciliaciones.length})
              </h5>
              <div className="d-flex gap-2">
                <Button variant="outline-primary" size="sm">
                  <span className="material-icons me-1">download</span>
                  Exportar
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <span className="material-icons me-1">print</span>
                  Imprimir
                </Button>
              </div>
            </div>
            <div className="table-responsive">
              {loading ? (
                <div className="text-center p-5">
                  <Spinner animation="border" variant="primary" />
                  <div className="mt-3">Cargando conciliaciones...</div>
                </div>
              ) : (
                <Table hover className="custom-table mb-0">
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>Cuenta Bancaria</th>
                      <th>Banco</th>
                      <th>Saldo Banco</th>
                      <th>Saldo Libros</th>
                      <th>Diferencia</th>
                      <th>Progreso</th>
                      <th>Estado</th>
                      <th>Fecha Creación</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conciliaciones.map((conciliacion) => (
                      <tr key={conciliacion.id}>
                        <td>
                          <div className="fw-semibold">{formatPeriod(conciliacion.period)}</div>
                          <small className="text-muted">{conciliacion.period}</small>
                        </td>
                        <td>
                          <div className="fw-medium">{conciliacion.bankAccount}</div>
                          <small className="text-muted">{conciliacion.bank}</small>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="material-icons me-2 text-primary">account_balance</span>
                            <span>{conciliacion.bank}</span>
                          </div>
                        </td>
                        <td>
                          <span className="amount-cell">
                            {formatCurrency(conciliacion.bankBalance)}
                          </span>
                        </td>
                        <td>
                          <span className="amount-cell">
                            {formatCurrency(conciliacion.bookBalance)}
                          </span>
                        </td>
                        <td>
                          <span className={`difference-indicator ${conciliacion.difference === 0 ? 'zero' : conciliacion.difference > 0 ? 'positive' : 'negative'}`}>
                            {conciliacion.difference === 0 ? '$ 0' : formatCurrency(conciliacion.difference)}
                          </span>
                        </td>
                        <td style={{minWidth: '120px'}}>
                          <div className="progress-container">
                            <div className="progress">
                              <div 
                                className="progress-bar bg-info" 
                                style={{width: `${getProgressPercentage(conciliacion.matchedTransactions, conciliacion.totalTransactions)}%`}}
                              ></div>
                            </div>
                            <div className="progress-text">
                              {conciliacion.matchedTransactions}/{conciliacion.totalTransactions} 
                              ({getProgressPercentage(conciliacion.matchedTransactions, conciliacion.totalTransactions)}%)
                            </div>
                          </div>
                        </td>
                        <td>{getStatusBadge(conciliacion.status)}</td>
                        <td>
                          <div className="fw-medium">{new Date(conciliacion.createdAt).toLocaleDateString('es-CL')}</div>
                          <small className="text-muted">por {conciliacion.createdBy}</small>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-1">
                            <Link href={`/conciliaciones/${conciliacion.id}`} passHref>
                              <Button variant="outline-primary" size="sm" title="Ver detalle">
                                <span className="material-icons small">visibility</span>
                              </Button>
                            </Link>
                            <Button variant="outline-secondary" size="sm" title="Editar">
                              <span className="material-icons small">edit</span>
                            </Button>
                            <Button variant="outline-success" size="sm" title="Descargar">
                              <span className="material-icons small">download</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </div>
        </Container>
      </Layout>
    </ProtectedRoute>
  );
}
