import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useMemo } from 'react';
import { Button, Card, Row, Col, Badge, Table, Tabs, Tab, Alert } from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { getProveedor } from '@/lib/proveedoresService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';
import { usePermissions, Permission } from '@/lib/usePermissions';
import type { Proveedor } from '@/types/proveedores';

export default function ProveedorDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { isSuperUser, hasPermission, hasRoleInCommunity } = usePermissions();
  const { comunidadSeleccionada } = useComunidad();

  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  // Resolver comunidad
  const resolvedComunidadId = useMemo(() => {
    if (typeof isSuperUser === 'function' ? isSuperUser() : isSuperUser) {
      return undefined;
    }
    if (comunidadSeleccionada && comunidadSeleccionada.id) {
      return Number(comunidadSeleccionada.id);
    }
    return user?.comunidad_id ?? undefined;
  }, [isSuperUser, comunidadSeleccionada, user?.comunidad_id]);

  // Bloquear acceso si el usuario tiene rol básico
  const isBasicRoleInCommunity = useMemo(() => {
    if (typeof isSuperUser === 'function' ? isSuperUser() : isSuperUser) {
      return false;
    }

    if (resolvedComunidadId) {
      return (
        hasRoleInCommunity(Number(resolvedComunidadId), 'residente') ||
        hasRoleInCommunity(Number(resolvedComunidadId), 'propietario') ||
        hasRoleInCommunity(Number(resolvedComunidadId), 'inquilino')
      );
    }

    const memberships = user?.memberships || [];
    if (memberships.length === 0) {
      return false;
    }

    const hasNonBasicRole = memberships.some((m: any) => {
      const rol = (m.rol || '').toLowerCase();
      return rol !== 'residente' && rol !== 'propietario' && rol !== 'inquilino';
    });

    return !hasNonBasicRole;
  }, [resolvedComunidadId, isSuperUser, hasRoleInCommunity, user?.memberships]);

  useEffect(() => {
    if (id) {
      loadProveedor();
    }
  }, [id]);

  const loadProveedor = async () => {
    try {
      setLoading(true);
      const data = await getProveedor(Number(id));
      setProveedor(data);
    } catch (error) {
      // Error loading proveedor
    } finally {
      setLoading(false);
    }
  };

  // Si tiene rol básico, mostrar Acceso Denegado
  if (isBasicRoleInCommunity) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className='container-fluid'>
            <div className='row justify-content-center align-items-center min-vh-100'>
              <div className='col-12 col-md-8 col-lg-6'>
                <div className='card shadow-lg border-0'>
                  <div className='card-body text-center p-5'>
                    <div className='mb-4'>
                      <span className='material-icons text-danger' style={{ fontSize: '80px' }}>
                        block
                      </span>
                    </div>
                    <h2 className='card-title mb-3'>Acceso Denegado</h2>
                    <p className='card-text text-muted mb-4'>
                      No tienes permisos para ver este Proveedor.
                      <br />
                      Si crees que esto es un error, contacta al administrador.
                    </p>
                    <div className='d-flex gap-2 justify-content-center'>
                      <button
                        type='button'
                        className='btn btn-primary'
                        onClick={() => router.back()}
                      >
                        <span className='material-icons align-middle me-1'>arrow_back</span>
                        Volver Atrás
                      </button>
                      <button
                        type='button'
                        className='btn btn-outline-primary'
                        onClick={() => router.push('/proveedores')}
                      >
                        <span className='material-icons align-middle me-1'>list</span>
                        Ver Proveedores
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '400px' }}>
            <div className='text-center'>
              <div className='spinner-border text-primary mb-3' />
              <p>Cargando proveedor...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!proveedor) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className='text-center py-5'>
            <span className='material-icons text-muted mb-3' style={{ fontSize: '4rem' }}>
              error_outline
            </span>
            <h4>Proveedor no encontrado</h4>
            <p className='text-muted'>El proveedor que buscas no existe.</p>
            <Button variant='primary' onClick={() => router.push('/proveedores')}>
              Volver a Proveedores
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{proveedor.razon_social} — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='container-fluid p-4'>
          {/* Header */}
          <div className='mb-4'>
            <Button variant='link' className='p-0 mb-3' onClick={() => router.push('/proveedores')}>
              <span className='material-icons me-1'>arrow_back</span>
              Volver a Proveedores
            </Button>

            <div className='d-flex justify-content-between align-items-start'>
              <div>
                <h1 className='h2 mb-2'>{proveedor.razon_social}</h1>
                <div className='d-flex gap-2 mb-2'>
                  <Badge bg={proveedor.activo === 1 ? 'success' : 'secondary'}>
                    {proveedor.activo === 1 ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {proveedor.giro && (
                    <Badge bg='info'>{proveedor.giro}</Badge>
                  )}
                </div>
                <p className='text-muted mb-0'>RUT: {proveedor.rut_completo || `${proveedor.rut}-${proveedor.dv}`}</p>
              </div>

              {hasPermission(Permission.EDIT_PROVEEDOR, resolvedComunidadId) && (
                <Button
                  variant='primary'
                  onClick={() => router.push(`/proveedores/${id}/editar`)}
                >
                  <span className='material-icons me-2'>edit</span>
                  Editar
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'info')} className='mb-4'>
            <Tab eventKey='info' title='Información'>
              <Row>
                <Col md={6}>
                  <Card className='mb-4'>
                    <Card.Header>
                      <h5 className='mb-0'>
                        <span className='material-icons me-2'>business</span>
                        Información General
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <Table borderless size='sm'>
                        <tbody>
                          <tr>
                            <td className='text-muted'>Razón Social:</td>
                            <td className='fw-bold'>{proveedor.razon_social}</td>
                          </tr>
                          <tr>
                            <td className='text-muted'>RUT:</td>
                            <td>{proveedor.rut_completo || `${proveedor.rut}-${proveedor.dv}`}</td>
                          </tr>
                          <tr>
                            <td className='text-muted'>Giro:</td>
                            <td>{proveedor.giro || '-'}</td>
                          </tr>
                          <tr>
                            <td className='text-muted'>Comunidad:</td>
                            <td>{proveedor.comunidad_nombre || proveedor.comunidad_id}</td>
                          </tr>
                          <tr>
                            <td className='text-muted'>Estado:</td>
                            <td>
                              <Badge bg={proveedor.activo === 1 ? 'success' : 'secondary'}>
                                {proveedor.activo === 1 ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className='mb-4'>
                    <Card.Header>
                      <h5 className='mb-0'>
                        <span className='material-icons me-2'>contact_mail</span>
                        Contacto
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <Table borderless size='sm'>
                        <tbody>
                          <tr>
                            <td className='text-muted'>Email:</td>
                            <td>{proveedor.email || '-'}</td>
                          </tr>
                          <tr>
                            <td className='text-muted'>Teléfono:</td>
                            <td>{proveedor.telefono || '-'}</td>
                          </tr>
                          <tr>
                            <td className='text-muted'>Dirección:</td>
                            <td>{proveedor.direccion || '-'}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Card>
                    <Card.Header>
                      <h5 className='mb-0'>
                        <span className='material-icons me-2'>assessment</span>
                        Estadísticas
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <Row className='text-center'>
                        <Col md={3}>
                          <div className='p-3'>
                            <h3 className='mb-0'>{proveedor.total_documentos || 0}</h3>
                            <small className='text-muted'>Documentos</small>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className='p-3'>
                            <h3 className='mb-0'>{proveedor.total_gastos || 0}</h3>
                            <small className='text-muted'>Gastos</small>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className='p-3'>
                            <h3 className='mb-0'>
                              ${(proveedor.monto_total_gastado || 0).toLocaleString()}
                            </h3>
                            <small className='text-muted'>Total Gastado</small>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className='p-3'>
                            <h3 className='mb-0'>
                              ${(proveedor.promedio_gasto || 0).toLocaleString()}
                            </h3>
                            <small className='text-muted'>Promedio</small>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey='history' title='Historial'>
              <Alert variant='info'>
                <span className='material-icons me-2'>info</span>
                Historial de transacciones en desarrollo
              </Alert>
            </Tab>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
