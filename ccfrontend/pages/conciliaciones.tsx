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
  completedAt?: string;
}

interface Filters {
  search: string;
  status: string;
  bank: string;
  period: string;
  dateFrom: string;
  dateTo: string;
}

export default function ConciliacionesListado() {
  const [conciliaciones, setConciliaciones] = useState<Conciliacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    bank: '',
    period: '',
    dateFrom: '',
    dateTo: ''
  });

  // Mock data
  const mockConciliaciones: Conciliacion[] = [
    {
      id: 1,
      period: '2024-03',
      bankAccount: '12345678-9',
      bank: 'Banco de Chile',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      status: 'completed',
      bankBalance: 15750000,
      bookBalance: 15750000,
      difference: 0,
      matchedTransactions: 245,
      totalTransactions: 245,
      createdBy: 'María González',
      createdAt: '2024-04-01T10:30:00Z',
      completedAt: '2024-04-01T16:45:00Z'
    },
    {
      id: 2,
      period: '2024-04',
      bankAccount: '12345678-9',
      bank: 'Banco de Chile',
      startDate: '2024-04-01',
      endDate: '2024-04-30',
      status: 'with-differences',
      bankBalance: 18950000,
      bookBalance: 18962500,
      difference: -12500,
      matchedTransactions: 198,
      totalTransactions: 203,
      createdBy: 'Carlos Mendoza',
      createdAt: '2024-05-01T09:15:00Z',
      completedAt: '2024-05-02T14:20:00Z'
    },
    {
      id: 3,
      period: '2024-05',
      bankAccount: '87654321-0',
      bank: 'Banco Santander',
      startDate: '2024-05-01',
      endDate: '2024-05-31',
      status: 'in-progress',
      bankBalance: 22150000,
      bookBalance: 22150000,
      difference: 0,
      matchedTransactions: 156,
      totalTransactions: 189,
      createdBy: 'Ana Silva',
      createdAt: '2024-06-01T11:00:00Z'
    },
    {
      id: 4,
      period: '2024-06',
      bankAccount: '11223344-5',
      bank: 'Banco Estado',
      startDate: '2024-06-01',
      endDate: '2024-06-30',
      status: 'draft',
      bankBalance: 0,
      bookBalance: 0,
      difference: 0,
      matchedTransactions: 0,
      totalTransactions: 167,
      createdBy: 'Roberto Torres',
      createdAt: '2024-07-01T08:30:00Z'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setConciliaciones(mockConciliaciones);
      setLoading(false);
    }, 1000);
  }, []);

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

  // Stats calculation
  const stats = {
    total: conciliaciones.length,
    completed: conciliaciones.filter(c => c.status === 'completed').length,
    inProgress: conciliaciones.filter(c => c.status === 'in-progress').length,
    withDifferences: conciliaciones.filter(c => c.status === 'with-differences').length
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
