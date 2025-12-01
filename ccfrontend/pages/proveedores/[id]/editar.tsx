import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useMemo } from 'react';
import { Button, Card, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-hot-toast';

import Layout from '@/components/layout/Layout';
import { getProveedor, updateProveedor } from '@/lib/proveedoresService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';
import { usePermissions } from '@/lib/usePermissions';

export default function EditarProveedor() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { isSuperUser, hasRoleInCommunity } = usePermissions();
  const { comunidadSeleccionada } = useComunidad();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    rut: '',
    dv: '',
    razon_social: '',
    giro: '',
    email: '',
    telefono: '',
    direccion: '',
    activo: 1,
  });

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
      setFormData({
        rut: data.rut || '',
        dv: data.dv || '',
        razon_social: data.razon_social || '',
        giro: data.giro || '',
        email: data.email || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
        activo: data.activo || 1,
      });
    } catch (error) {
      // Error loading proveedor
      toast.error('Error al cargar el proveedor');
      router.push('/proveedores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rut || !formData.dv || !formData.razon_social) {
      toast.error('RUT y Razón Social son requeridos');
      return;
    }

    try {
      setSaving(true);
      await updateProveedor(Number(id), {
        ...formData,
        activo: formData.activo as 0 | 1, // Cast explícito a EstadoProveedor
      });
      toast.success('Proveedor actualizado exitosamente');
      router.push(`/proveedores/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar el proveedor');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Si tiene rol básico, mostrar Acceso Denegado
  if (isBasicRoleInCommunity) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className='container-fluid'>
            <div className='row justify-content-center align-items-center min-vh-50'>
              <div className='col-12 col-md-8'>
                <div className='card shadow-sm'>
                  <div className='card-body text-center p-5'>
                    <div className='mb-4'>
                      <span className='material-icons text-danger' style={{ fontSize: '56px' }}>
                        block
                      </span>
                    </div>
                    <h2>Acceso Denegado</h2>
                    <p className='text-muted'>No tienes permisos para editar Proveedores.</p>
                    <Button variant='primary' onClick={() => router.push('/proveedores')}>
                      Volver a Proveedores
                    </Button>
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

  return (
    <ProtectedRoute>
      <Head>
        <title>Editar Proveedor — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='container-fluid p-4'>
          <div className='mb-4'>
            <Button variant='link' className='p-0 mb-3' onClick={() => router.push(`/proveedores/${id}`)}>
              <span className='material-icons me-1'>arrow_back</span>
              Volver al Proveedor
            </Button>
            <h1 className='h2'>Editar Proveedor</h1>
          </div>

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Card className='mb-4'>
                  <Card.Header>
                    <h5 className='mb-0'>
                      <span className='material-icons me-2'>business</span>
                      Información del Proveedor
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row className='g-3'>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className='required'>RUT</Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.rut}
                            onChange={(e) => handleInputChange('rut', e.target.value)}
                            required
                            placeholder='12345678'
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label className='required'>DV</Form.Label>
                          <Form.Control
                            type='text'
                            maxLength={1}
                            value={formData.dv}
                            onChange={(e) => handleInputChange('dv', e.target.value)}
                            required
                            placeholder='9'
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>Razón Social</Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.razon_social}
                            onChange={(e) => handleInputChange('razon_social', e.target.value)}
                            required
                            placeholder='Nombre del proveedor'
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Giro</Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.giro}
                            onChange={(e) => handleInputChange('giro', e.target.value)}
                            placeholder='Ej: Construcción, Servicios, etc.'
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type='email'
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder='correo@ejemplo.com'
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Teléfono</Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.telefono}
                            onChange={(e) => handleInputChange('telefono', e.target.value)}
                            placeholder='+56 9 1234 5678'
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Dirección</Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.direccion}
                            onChange={(e) => handleInputChange('direccion', e.target.value)}
                            placeholder='Calle, número, comuna'
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Estado</Form.Label>
                          <Form.Select
                            value={formData.activo}
                            onChange={(e) => handleInputChange('activo', Number(e.target.value))}
                          >
                            <option value={1}>Activo</option>
                            <option value={0}>Inactivo</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card>
                  <Card.Header>
                    <h5 className='mb-0'>
                      <span className='material-icons me-2'>info</span>
                      Información
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Alert variant='info' className='mb-3'>
                      <small>
                        <strong>Nota:</strong> Los cambios se aplicarán inmediatamente.
                      </small>
                    </Alert>
                    <div className='d-grid gap-2'>
                      <Button type='submit' variant='primary' disabled={saving}>
                        {saving ? (
                          <>
                            <span className='spinner-border spinner-border-sm me-2' />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <span className='material-icons me-2'>save</span>
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                      <Button
                        variant='outline-secondary'
                        onClick={() => router.push(`/proveedores/${id}`)}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
