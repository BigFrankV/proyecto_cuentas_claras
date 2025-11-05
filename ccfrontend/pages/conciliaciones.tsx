import Head from 'next/head';
import Link from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Table,
  Form,
  Button,
  Spinner,
  InputGroup,
  Alert,
} from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { conciliacionesApi } from '@/lib/api/conciliaciones';
import { ProtectedRoute } from '@/lib/useAuth';
import { Conciliacion, ConciliacionFiltros } from '@/types/conciliaciones';

export default function ConciliacionesListado() {
  const [conciliaciones, setConciliaciones] = useState<Conciliacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ConciliacionFiltros>({
    limit: 20,
    offset: 0,
  });

  const loadConciliaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await conciliacionesApi.getAll(filters);
      setConciliaciones(response.data);
    } catch {
      setError('Error al cargar las conciliaciones');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Cargar conciliaciones al montar el componente
  useEffect(() => {
    loadConciliaciones();
  }, [loadConciliaciones]);

  const handleFilterChange = (
    field: keyof ConciliacionFiltros,
    value: string | number | undefined,
  ) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      pendiente: {
        class: 'status-badge draft',
        text: 'Pendiente',
        icon: 'edit',
      },
      conciliado: {
        class: 'status-badge completed',
        text: 'Conciliado',
        icon: 'check_circle',
      },
      descartado: {
        class: 'status-badge with-differences',
        text: 'Descartado',
        icon: 'error',
      },
    };

    const config =
      statusConfig[estado as keyof typeof statusConfig] ||
      statusConfig.pendiente;

    return (
      <span className={config.class}>
        <span className='material-icons'>{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  // Stats calculation
  const stats = {
    total: conciliaciones.length,
    conciliadas: conciliaciones.filter(
      c => c.reconciliationStatus === 'reconciliado',
    ).length,
    pendientes: conciliaciones.filter(
      c => c.reconciliationStatus === 'pendiente',
    ).length,
    descartadas: conciliaciones.filter(
      c => c.reconciliationStatus === 'descartado',
    ).length,
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Conciliaciones Bancarias — Cuentas Claras</title>
      </Head>

      <Layout title='Conciliaciones Bancarias'>
        <Container fluid className='p-4'>
          {/* Header */}
          <div className='conciliations-header'>
            <div className='d-flex justify-content-between align-items-start'>
              <div>
                <h1 className='conciliations-title'>
                  Conciliaciones Bancarias
                </h1>
                <p className='conciliations-subtitle'>
                  Gestiona y controla las conciliaciones bancarias mensuales
                </p>
                <div className='header-stats'>
                  <div className='stat-item'>
                    <div className='stat-number'>{stats.total}</div>
                    <div className='stat-label'>Total</div>
                  </div>
                  <div className='stat-item'>
                    <div className='stat-number'>{stats.conciliadas}</div>
                    <div className='stat-label'>Completadas</div>
                  </div>
                  <div className='stat-item'>
                    <div className='stat-number'>{stats.pendientes}</div>
                    <div className='stat-label'>En Proceso</div>
                  </div>
                  <div className='stat-item'>
                    <div className='stat-number'>{stats.descartadas}</div>
                    <div className='stat-label'>Con Diferencias</div>
                  </div>
                </div>
              </div>
              <div className='d-flex gap-2'>
                <Link href='/conciliaciones/nueva' passHref>
                  <Button variant='light' size='lg'>
                    <span className='material-icons me-2'>add</span>
                    Nueva Conciliación
                  </Button>
                </Link>
                <Button variant='outline-light' size='lg'>
                  <span className='material-icons me-2'>upload</span>
                  Importar Estados
                </Button>
              </div>
            </div>
          </div>

          {/* Alert de error */}
          {error && (
            <Alert variant='danger' onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          {/* Summary Cards */}
          <div className='summary-cards'>
            <div className='summary-card'>
              <div className='summary-card-icon'>
                <span className='material-icons'>account_balance</span>
              </div>
              <div className='summary-card-number'>{stats.total}</div>
              <div className='summary-card-label'>Total Conciliaciones</div>
              <div className='summary-card-description'>
                Conciliaciones registradas
              </div>
            </div>
            <div className='summary-card'>
              <div className='summary-card-icon'>
                <span className='material-icons'>check_circle</span>
              </div>
              <div className='summary-card-number'>{stats.conciliadas}</div>
              <div className='summary-card-label'>Conciliadas</div>
              <div className='summary-card-description'>
                Movimientos conciliados
              </div>
            </div>
            <div className='summary-card'>
              <div className='summary-card-icon'>
                <span className='material-icons'>schedule</span>
              </div>
              <div className='summary-card-number'>{stats.pendientes}</div>
              <div className='summary-card-label'>Pendientes</div>
              <div className='summary-card-description'>
                Esperando conciliación
              </div>
            </div>
            <div className='summary-card'>
              <div className='summary-card-icon'>
                <span className='material-icons'>error</span>
              </div>
              <div className='summary-card-number'>{stats.descartadas}</div>
              <div className='summary-card-label'>Descartadas</div>
              <div className='summary-card-description'>
                Movimientos descartados
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className='filters-card'>
            <div className='filters-header'>
              <h5 className='filters-title'>
                <span className='material-icons'>filter_list</span>
                Filtros de Búsqueda
              </h5>
              <Button variant='outline-secondary' size='sm'>
                <span className='material-icons me-1'>clear</span>
                Limpiar Filtros
              </Button>
            </div>
            <div className='filters-grid'>
              <div>
                <Form.Label className='small fw-medium text-muted mb-1'>
                  Buscar conciliaciones
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className='bg-light border-end-0'>
                    <span className='material-icons text-muted'>search</span>
                  </InputGroup.Text>
                  <Form.Control
                    type='text'
                    placeholder='Buscar por glosa o referencia...'
                    value={filters.fecha_inicio || ''}
                    onChange={e =>
                      handleFilterChange('fecha_inicio', e.target.value)
                    }
                  />
                </InputGroup>
              </div>
              <div>
                <Form.Label className='small fw-medium text-muted mb-1'>
                  Estado
                </Form.Label>
                <Form.Select
                  value={filters.estado || ''}
                  onChange={e =>
                    handleFilterChange('estado', e.target.value || undefined)
                  }
                >
                  <option value=''>Todos</option>
                  <option value='draft'>Borrador</option>
                  <option value='in-progress'>En Proceso</option>
                  <option value='completed'>Completada</option>
                  <option value='with-differences'>Con Diferencias</option>
                </Form.Select>
              </div>
              <div>
                <Form.Label className='small fw-medium text-muted mb-1'>
                  Fecha Fin
                </Form.Label>
                <Form.Control
                  type='date'
                  value={filters.fecha_fin || ''}
                  onChange={e =>
                    handleFilterChange('fecha_fin', e.target.value)
                  }
                />
              </div>
              <div>
                <Button variant='primary' size='sm' className='w-100'>
                  <span className='material-icons me-1'>search</span>
                  Buscar
                </Button>
              </div>
            </div>
          </div>

          {/* Conciliations Table */}
          <div className='conciliations-table'>
            <div className='table-header'>
              <h5 className='table-title'>
                <span className='material-icons'>view_list</span>
                Lista de Conciliaciones ({conciliaciones.length})
              </h5>
              <div className='d-flex gap-2'>
                <Button variant='outline-primary' size='sm'>
                  <span className='material-icons me-1'>download</span>
                  Exportar
                </Button>
                <Button variant='outline-secondary' size='sm'>
                  <span className='material-icons me-1'>print</span>
                  Imprimir
                </Button>
              </div>
            </div>
            <div className='table-responsive'>
              {loading ? (
                <div className='text-center p-5'>
                  <Spinner animation='border' variant='primary' />
                  <div className='mt-3'>Cargando conciliaciones...</div>
                </div>
              ) : (
                <Table hover className='custom-table mb-0'>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Monto</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                      <th>Comunidad</th>
                      <th className='text-center'>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conciliaciones.map(conciliacion => (
                      <tr key={conciliacion.id}>
                        <td>
                          <div className='fw-semibold'>{conciliacion.code}</div>
                          <small className='text-muted'>
                            {conciliacion.movementDate}
                          </small>
                        </td>
                        <td>
                          <div className='fw-medium'>{conciliacion.glosa}</div>
                          <small className='text-muted'>
                            {conciliacion.bankReference}
                          </small>
                        </td>
                        <td>
                          <div className='d-flex align-items-center'>
                            <span className='material-icons me-2 text-primary'>
                              account_balance
                            </span>
                            <span>{formatCurrency(conciliacion.amount)}</span>
                          </div>
                        </td>
                        <td style={{ minWidth: '120px' }}>
                          <div className='text-center'>
                            <span className='fw-medium'>
                              {conciliacion.movementType}
                            </span>
                          </div>
                        </td>
                        <td>
                          {getStatusBadge(conciliacion.reconciliationStatus)}
                        </td>
                        <td>
                          <div className='fw-medium'>
                            {conciliacion.communityName}
                          </div>
                        </td>
                        <td>
                          <div className='d-flex justify-content-center gap-1'>
                            <Link
                              href={`/conciliaciones/${conciliacion.id}`}
                              passHref
                            >
                              <Button
                                variant='outline-primary'
                                size='sm'
                                title='Ver detalle'
                              >
                                <span className='material-icons small'>
                                  visibility
                                </span>
                              </Button>
                            </Link>
                            <Button
                              variant='outline-secondary'
                              size='sm'
                              title='Editar'
                            >
                              <span className='material-icons small'>edit</span>
                            </Button>
                            <Button
                              variant='outline-success'
                              size='sm'
                              title='Descargar'
                            >
                              <span className='material-icons small'>
                                download
                              </span>
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
