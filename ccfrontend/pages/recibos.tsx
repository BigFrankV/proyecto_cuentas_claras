import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Button,
  Card,
  Form,
  Table,
  Dropdown,
  Badge,
  Alert,
} from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import reciboService, { Recibo } from '@/lib/reciboService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import {
  usePermissions,
  ProtectedPage,
  UserRole,
  Permission,
} from '@/lib/usePermissions';

export default function RecibosListado() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { isSuperUser, hasPermission } = usePermissions();
  
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedRecibos, setSelectedRecibos] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    method: '',
    dateFrom: '',
    dateTo: '',
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const resolvedComunidadId = useMemo(() => {
    if (isSuperUser) {
      return undefined;
    }
    return user?.comunidad_id ?? undefined;
  }, [isSuperUser, user?.comunidad_id]);

  const loadRecibos = useCallback(async () => {
    try {
      setLoading(true);
      const queryFilters: any = { ...filters };
      if (resolvedComunidadId) {
        queryFilters.comunidad_id = resolvedComunidadId;
      }
      
      const response = await reciboService.listRecibos(queryFilters);
      // Manejar respuesta que puede ser array directo o objeto con data
      const data = Array.isArray(response) ? response : (response.data || []);
      setRecibos(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading recibos:', error);
      setRecibos([]);
    } finally {
      setLoading(false);
    }
  }, [resolvedComunidadId, filters]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadRecibos();
    }
  }, [authLoading, isAuthenticated, loadRecibos]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pendiente_validacion: { label: 'Pendiente', className: 'bg-warning text-dark' },
      validado: { label: 'Validado', className: 'bg-success' },
      rechazado: { label: 'Rechazado', className: 'bg-danger' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-secondary' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getMethodLabel = (method: string) => {
    const methods: any = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      cheque: 'Cheque',
      deposito: 'Depósito',
      otro: 'Otro',
    };
    return methods[method] || method;
  };

  const handleReciboClick = (id: number) => {
    router.push(`/recibos/${id}`);
  };

  // Filtrado local (si el backend no filtra todo o para búsqueda rápida)
  const filteredRecibos = recibos.filter(recibo => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch = 
      recibo.numero_recibo?.toLowerCase().includes(searchLower) ||
      recibo.referencia?.toLowerCase().includes(searchLower) ||
      recibo.observaciones?.toLowerCase().includes(searchLower);
      
    const matchesStatus = filters.status === '' || recibo.estado === filters.status;
    const matchesMethod = filters.method === '' || recibo.metodo_pago === filters.method;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Paginación
  const totalPages = Math.ceil(filteredRecibos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecibos = filteredRecibos.slice(startIndex, startIndex + itemsPerPage);

  // Estadísticas
  const stats = useMemo(() => {
    return {
      total: recibos.length,
      pending: recibos.filter(r => r.estado === 'pendiente_validacion').length,
      totalAmount: recibos.reduce((sum, r) => sum + Number(r.monto_recibido || 0), 0),
    };
  }, [recibos]);

  return (
    <ProtectedRoute>
      <ProtectedPage role={UserRole.ADMIN}>
        <Head>
          <title>Recibos — Cuentas Claras</title>
        </Head>

        <Layout title='Recibos'>
          {/* Header Profesional */}
          <div className='container-fluid p-0'>
            <div
              className='text-white'
              style={{
                background: 'linear-gradient(135deg, #009688 0%, #00796b 100%)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div className='p-4'>
                <div className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-4'
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i
                        className='material-icons'
                        style={{ fontSize: '32px', color: 'white' }}
                      >
                        receipt
                      </i>
                    </div>
                    <div>
                      <h1 className='h2 mb-1 text-white'>Recibos de Pago</h1>
                      <p className='mb-0 opacity-75'>
                        Gestión de ingresos y comprobantes
                      </p>
                    </div>
                  </div>
                  {hasPermission(Permission.MANAGE_FINANCES) && (
                    <div className='text-end'>
                      <Button
                        variant='light'
                        onClick={() => router.push('/recibos/nuevo')}
                        className='btn-lg'
                      >
                        <i className='material-icons me-2'>add</i>
                        Nuevo Recibo
                      </Button>
                    </div>
                  )}
                </div>

                {/* Estadísticas */}
                <div className='row mt-4'>
                  <div className='col-md-4 mb-3'>
                    <div
                      className='p-3 rounded-3 text-white'
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div className='d-flex align-items-center'>
                        <div
                          className='me-3'
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <i className='material-icons'>receipt</i>
                        </div>
                        <div>
                          <div className='h3 mb-0'>{stats.total}</div>
                          <div className='text-white-50'>Total Recibos</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='col-md-4 mb-3'>
                    <div
                      className='p-3 rounded-3 text-white'
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div className='d-flex align-items-center'>
                        <div
                          className='me-3'
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-warning)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <i className='material-icons'>pending_actions</i>
                        </div>
                        <div>
                          <div className='h3 mb-0'>{stats.pending}</div>
                          <div className='text-white-50'>Pendientes de Validación</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='col-md-4 mb-3'>
                    <div
                      className='p-3 rounded-3 text-white'
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div className='d-flex align-items-center'>
                        <div
                          className='me-3'
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-success)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <i className='material-icons'>attach_money</i>
                        </div>
                        <div>
                          <div className='h3 mb-0'>{formatCurrency(stats.totalAmount)}</div>
                          <div className='text-white-50'>Total Recaudado</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='container-fluid py-4'>
            {/* Filtros y Herramientas */}
            <div className='d-flex justify-content-between align-items-center mb-4'>
              <div className='d-flex gap-2'>
                <Button
                  variant={showFilters ? 'secondary' : 'outline-secondary'}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <span className='material-icons me-2'>filter_list</span>
                  Filtros
                </Button>
                <div className='input-group' style={{ maxWidth: '300px' }}>
                  <span className='input-group-text bg-white border-end-0'>
                    <i className='material-icons text-muted'>search</i>
                  </span>
                  <Form.Control
                    type='text'
                    placeholder='Buscar recibo...'
                    className='border-start-0 ps-0'
                    value={filters.search}
                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>

              <div className='btn-group'>
                <Button
                  variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('table')}
                >
                  <span className='material-icons'>view_list</span>
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('grid')}
                >
                  <span className='material-icons'>view_module</span>
                </Button>
              </div>
            </div>

            {showFilters && (
              <Card className='mb-4 border-0 shadow-sm'>
                <Card.Body>
                  <div className='row g-3'>
                    <div className='col-md-3'>
                      <Form.Group>
                        <Form.Label>Estado</Form.Label>
                        <Form.Select
                          value={filters.status}
                          onChange={e => setFilters({ ...filters, status: e.target.value })}
                        >
                          <option value=''>Todos</option>
                          <option value='pendiente_validacion'>Pendiente</option>
                          <option value='validado'>Validado</option>
                          <option value='rechazado'>Rechazado</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className='col-md-3'>
                      <Form.Group>
                        <Form.Label>Método de Pago</Form.Label>
                        <Form.Select
                          value={filters.method}
                          onChange={e => setFilters({ ...filters, method: e.target.value })}
                        >
                          <option value=''>Todos</option>
                          <option value='efectivo'>Efectivo</option>
                          <option value='transferencia'>Transferencia</option>
                          <option value='cheque'>Cheque</option>
                          <option value='deposito'>Depósito</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                    {/* Más filtros si es necesario */}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Contenido Principal */}
            {loading ? (
              <div className='text-center py-5'>
                <div className='spinner-border text-primary' role='status'>
                  <span className='visually-hidden'>Cargando...</span>
                </div>
              </div>
            ) : filteredRecibos.length === 0 ? (
              <div className='text-center py-5'>
                <span className='material-icons display-1 text-muted'>inbox</span>
                <h3 className='mt-3 text-muted'>No hay recibos encontrados</h3>
                <p className='text-muted'>Intenta ajustar los filtros o crea un nuevo recibo.</p>
              </div>
            ) : (
              <>
                {viewMode === 'table' ? (
                  <Card className='border-0 shadow-sm'>
                    <div className='table-responsive'>
                      <Table hover className='align-middle mb-0'>
                        <thead className='bg-light'>
                          <tr>
                            <th style={{ width: '40px' }}>
                              <Form.Check 
                                type='checkbox'
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRecibos(paginatedRecibos.map(r => r.id));
                                  } else {
                                    setSelectedRecibos([]);
                                  }
                                }}
                              />
                            </th>
                            <th>Número</th>
                            <th>Fecha</th>
                            <th>Método</th>
                            <th>Referencia</th>
                            <th>Monto</th>
                            <th>Estado</th>
                            <th className='text-end'>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRecibos.map(recibo => (
                            <tr 
                              key={recibo.id} 
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleReciboClick(recibo.id)}
                            >
                              <td onClick={e => e.stopPropagation()}>
                                <Form.Check 
                                  type='checkbox'
                                  checked={selectedRecibos.includes(recibo.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRecibos([...selectedRecibos, recibo.id]);
                                    } else {
                                      setSelectedRecibos(selectedRecibos.filter(id => id !== recibo.id));
                                    }
                                  }}
                                />
                              </td>
                              <td className='fw-bold'>#{recibo.numero_recibo}</td>
                              <td>{new Date(recibo.fecha_recepcion).toLocaleDateString('es-CL')}</td>
                              <td>{getMethodLabel(recibo.metodo_pago)}</td>
                              <td>{recibo.referencia || '-'}</td>
                              <td className='fw-bold'>{formatCurrency(Number(recibo.monto_recibido))}</td>
                              <td>{getStatusBadge(recibo.estado)}</td>
                              <td className='text-end' onClick={e => e.stopPropagation()}>
                                <Dropdown align='end'>
                                  <Dropdown.Toggle variant='link' className='text-muted p-0 no-caret'>
                                    <span className='material-icons'>more_vert</span>
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => handleReciboClick(recibo.id)}>
                                      <span className='material-icons me-2 fs-6'>visibility</span>
                                      Ver Detalle
                                    </Dropdown.Item>
                                    <Dropdown.Item href='#'>
                                      <span className='material-icons me-2 fs-6'>print</span>
                                      Imprimir
                                    </Dropdown.Item>
                                    {hasPermission(Permission.MANAGE_FINANCES) && (
                                      <>
                                        <Dropdown.Divider />
                                        <Dropdown.Item className='text-danger'>
                                          <span className='material-icons me-2 fs-6'>delete</span>
                                          Eliminar
                                        </Dropdown.Item>
                                      </>
                                    )}
                                  </Dropdown.Menu>
                                </Dropdown>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card>
                ) : (
                  <div className='row g-3'>
                    {paginatedRecibos.map(recibo => (
                      <div key={recibo.id} className='col-md-6 col-lg-4'>
                        <Card 
                          className='h-100 border-0 shadow-sm cursor-pointer hover-card'
                          onClick={() => handleReciboClick(recibo.id)}
                        >
                          <Card.Body>
                            <div className='d-flex justify-content-between align-items-start mb-3'>
                              <div>
                                <h5 className='card-title mb-1'>#{recibo.numero_recibo}</h5>
                                <small className='text-muted'>
                                  {new Date(recibo.fecha_recepcion).toLocaleDateString('es-CL')}
                                </small>
                              </div>
                              {getStatusBadge(recibo.estado)}
                            </div>
                            
                            <div className='mb-3'>
                              <div className='d-flex justify-content-between mb-1'>
                                <span className='text-muted'>Monto:</span>
                                <span className='fw-bold'>{formatCurrency(Number(recibo.monto_recibido))}</span>
                              </div>
                              <div className='d-flex justify-content-between'>
                                <span className='text-muted'>Método:</span>
                                <span>{getMethodLabel(recibo.metodo_pago)}</span>
                              </div>
                            </div>

                            {recibo.referencia && (
                              <div className='bg-light p-2 rounded small text-muted mb-3'>
                                <i className='material-icons fs-6 me-1 align-middle'>description</i>
                                {recibo.referencia}
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}

                {/* Paginación Simple */}
                {totalPages > 1 && (
                  <div className='d-flex justify-content-center mt-4'>
                    <div className='btn-group'>
                      <Button 
                        variant='outline-secondary' 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                      >
                        Anterior
                      </Button>
                      <Button variant='outline-secondary' disabled>
                        {currentPage} de {totalPages}
                      </Button>
                      <Button 
                        variant='outline-secondary' 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Layout>
      </ProtectedPage>
    </ProtectedRoute>
  );
}

