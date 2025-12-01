import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Card, Badge, Alert } from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';
import { usePermissions } from '@/lib/usePermissions';

interface CostCenterForm {
  name: string;
  description: string;
  department: string;
  manager: string;
  budget: string;
  community: string;
  responsibilities: string[];
  icon: string;
  color: string;
  status: string;
}

export default function CentroCostoEditar() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { isSuperUser, hasRoleInCommunity } = usePermissions();
  const { comunidadSeleccionada } = useComunidad();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newResponsibility, setNewResponsibility] = useState('');

  const [formData, setFormData] = useState<CostCenterForm>({
    name: '',
    description: '',
    department: '',
    manager: '',
    budget: '',
    community: '',
    responsibilities: [],
    icon: 'build',
    color: '#2196F3',
    status: 'active',
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

  const departmentOptions = [
    { value: 'operations', label: 'Operaciones', badge: 'success' },
    { value: 'administration', label: 'Administración', badge: 'primary' },
    { value: 'marketing', label: 'Marketing', badge: 'warning' },
    { value: 'maintenance', label: 'Mantenimiento', badge: 'secondary' },
    { value: 'security', label: 'Seguridad', badge: 'danger' },
  ];

  const iconOptions = [
    'build',
    'security',
    'business',
    'apartment',
    'campaign',
    'park',
    'pool',
    'electrical_services',
    'emergency',
    'computer',
    'cleaning_services',
    'local_fire_department',
    'water_drop',
    'maintenance',
    'phone',
    'wifi',
    'account_balance',
    'analytics',
    'engineering',
    'handyman',
  ];

  const colorOptions = [
    '#2196F3',
    '#4CAF50',
    '#FF9800',
    '#F44336',
    '#9C27B0',
    '#009688',
    '#03A9F4',
    '#FF5722',
    '#E91E63',
    '#673AB7',
    '#795548',
    '#607D8B',
    '#FFC107',
    '#8BC34A',
    '#CDDC39',
    '#FFEB3B',
    '#FF6F00',
    '#D32F2F',
  ];

  useEffect(() => {
    if (id) {
      loadCostCenter();
    }
  }, [id]);

  const loadCostCenter = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data - En una app real, esto vendría de la API
      const mockData = {
        name: 'Mantenimiento Edificio A',
        description:
          'Centro de costo para mantenimiento general del edificio A, incluyendo reparaciones, pintura, plomería y electricidad.',
        department: 'maintenance',
        manager: 'Carlos Rodriguez',
        budget: '50000',
        community: 'Comunidad Parque Real',
        responsibilities: [
          'Reparaciones menores',
          'Pintura interior y exterior',
          'Plomería general',
          'Electricidad básica',
          'Limpieza profunda',
          'Mantenimiento preventivo',
        ],
        icon: 'build',
        color: '#2196F3',
        status: 'active',
      };

      setFormData(mockData);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading cost center:', error);
      alert('Error al cargar el centro de costo');
      router.push('/centros-costo');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CostCenterForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addResponsibility = () => {
    if (
      newResponsibility.trim() &&
      !formData.responsibilities.includes(newResponsibility.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        responsibilities: [...prev.responsibilities, newResponsibility.trim()],
      }));
      setNewResponsibility('');
    }
  };

  const removeResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('Centro de costo actualizado exitosamente');
      router.push(`/centros-costo/${id}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating cost center:', error);
      alert('Error al actualizar el centro de costo');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ minHeight: '400px' }}
          >
            <div className='text-center'>
              <div
                className='spinner-border text-primary mb-3'
                style={{ width: '3rem', height: '3rem' }}
              />
              <p className='text-muted'>Cargando centro de costo...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

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
                    <p className='text-muted'>No tienes permisos para editar Centros de Costo. Solo usuarios con roles administrativos pueden acceder a esta sección.</p>
                    <Button variant='primary' onClick={() => router.push('/centros-costo')}>
                      Volver a Centros de Costo
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

  const selectedDepartment = departmentOptions.find(
    d => d.value === formData.department,
  );

  return (
    <ProtectedRoute>
      <Head>
        <title>Editar Centro de Costo — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='cost-center-form-container'>
          {/* Header */}
          <div className='cost-center-form-header'>
            <div className='d-flex justify-content-between align-items-start mb-4'>
              <div>
                <Button
                  variant='link'
                  className='p-0 mb-2 text-decoration-none'
                  onClick={() => router.push(`/centros-costo/${id}`)}
                >
                  <span className='material-icons me-1'>arrow_back</span>
                  Volver al Centro de Costo
                </Button>
                <h1 className='cost-center-form-title'>
                  <span className='material-icons me-2'>edit</span>
                  Editar Centro de Costo
                </h1>
                <p className='cost-center-form-subtitle'>
                  Modifica la información y configuración del centro de costo
                </p>
              </div>
            </div>
          </div>

          <Form onSubmit={handleSubmit}>
            <div className='row'>
              {/* Columna izquierda - Información General */}
              <div className='col-12 col-lg-8 mb-4'>
                {/* Información Básica */}
                <Card className='form-section mb-4'>
                  <Card.Header className='form-section-header'>
                    <h5 className='mb-0'>
                      <span className='material-icons me-2'>info</span>
                      Información Básica
                    </h5>
                  </Card.Header>
                  <Card.Body className='form-section-body'>
                    <div className='row g-3'>
                      <div className='col-md-6'>
                        <Form.Group>
                          <Form.Label className='required'>
                            Nombre del Centro
                          </Form.Label>
                          <Form.Control
                            type='text'
                            placeholder='Ej: Mantenimiento Edificio A'
                            value={formData.name}
                            onChange={e =>
                              handleInputChange('name', e.target.value)
                            }
                            required
                          />
                        </Form.Group>
                      </div>
                      <div className='col-md-6'>
                        <Form.Group>
                          <Form.Label className='required'>
                            Departamento
                          </Form.Label>
                          <Form.Select
                            value={formData.department}
                            onChange={e =>
                              handleInputChange('department', e.target.value)
                            }
                            required
                          >
                            <option value=''>Seleccionar departamento</option>
                            {departmentOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className='col-12'>
                        <Form.Group>
                          <Form.Label>Descripción</Form.Label>
                          <Form.Control
                            as='textarea'
                            rows={3}
                            placeholder='Describe las funciones y objetivos de este centro de costo...'
                            value={formData.description}
                            onChange={e =>
                              handleInputChange('description', e.target.value)
                            }
                          />
                        </Form.Group>
                      </div>
                      <div className='col-md-4'>
                        <Form.Group>
                          <Form.Label className='required'>
                            Responsable
                          </Form.Label>
                          <Form.Control
                            type='text'
                            placeholder='Nombre del responsable'
                            value={formData.manager}
                            onChange={e =>
                              handleInputChange('manager', e.target.value)
                            }
                            required
                          />
                        </Form.Group>
                      </div>
                      <div className='col-md-4'>
                        <Form.Group>
                          <Form.Label className='required'>
                            Comunidad
                          </Form.Label>
                          <Form.Select
                            value={formData.community}
                            onChange={e =>
                              handleInputChange('community', e.target.value)
                            }
                            required
                          >
                            <option value=''>Seleccionar comunidad</option>
                            <option value='Todas'>Todas las comunidades</option>
                            <option value='Comunidad Parque Real'>
                              Comunidad Parque Real
                            </option>
                            <option value='Edificio Central'>
                              Edificio Central
                            </option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className='col-md-4'>
                        <Form.Group>
                          <Form.Label className='required'>Estado</Form.Label>
                          <Form.Select
                            value={formData.status}
                            onChange={e =>
                              handleInputChange('status', e.target.value)
                            }
                            required
                          >
                            <option value='active'>Activo</option>
                            <option value='inactive'>Inactivo</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Responsabilidades */}
                <Card className='form-section mb-4'>
                  <Card.Header className='form-section-header'>
                    <h5 className='mb-0'>
                      <span className='material-icons me-2'>assignment</span>
                      Responsabilidades
                    </h5>
                  </Card.Header>
                  <Card.Body className='form-section-body'>
                    <div className='mb-3'>
                      <div className='d-flex gap-2'>
                        <Form.Control
                          type='text'
                          placeholder='Agregar nueva responsabilidad...'
                          value={newResponsibility}
                          onChange={e => setNewResponsibility(e.target.value)}
                          onKeyPress={e =>
                            e.key === 'Enter' &&
                            (e.preventDefault(), addResponsibility())
                          }
                        />
                        <Button
                          variant='outline-primary'
                          onClick={addResponsibility}
                          disabled={!newResponsibility.trim()}
                        >
                          <span className='material-icons'>add</span>
                        </Button>
                      </div>
                    </div>

                    {formData.responsibilities.length > 0 && (
                      <div>
                        <h6 className='mb-2'>Responsabilidades asignadas:</h6>
                        <div className='d-flex flex-wrap gap-2'>
                          {formData.responsibilities.map(
                            (responsibility, index) => (
                              <Badge
                                key={index}
                                bg='light'
                                text='dark'
                                className='d-flex align-items-center gap-2 p-2'
                              >
                                {responsibility}
                                <Button
                                  variant='link'
                                  size='sm'
                                  className='p-0 text-danger'
                                  onClick={() => removeResponsibility(index)}
                                >
                                  <span
                                    className='material-icons'
                                    style={{ fontSize: '16px' }}
                                  >
                                    close
                                  </span>
                                </Button>
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* Presupuesto */}
                <Card className='form-section'>
                  <Card.Header className='form-section-header'>
                    <h5 className='mb-0'>
                      <span className='material-icons me-2'>
                        account_balance_wallet
                      </span>
                      Presupuesto
                    </h5>
                  </Card.Header>
                  <Card.Body className='form-section-body'>
                    <Alert variant='info' className='mb-3'>
                      <span className='material-icons me-2'>info</span>
                      Ten cuidado al modificar el presupuesto, esto podría
                      afectar la planificación financiera existente.
                    </Alert>
                    <div className='row g-3'>
                      <div className='col-md-6'>
                        <Form.Group>
                          <Form.Label className='required'>
                            Presupuesto Anual
                          </Form.Label>
                          <div className='input-group'>
                            <span className='input-group-text'>$</span>
                            <Form.Control
                              type='number'
                              placeholder='0'
                              value={formData.budget}
                              onChange={e =>
                                handleInputChange('budget', e.target.value)
                              }
                              required
                              min='0'
                              step='1000'
                            />
                          </div>
                          <Form.Text className='text-muted'>
                            Presupuesto asignado para todo el año
                          </Form.Text>
                        </Form.Group>
                      </div>
                      <div className='col-md-6'>
                        <div className='budget-preview'>
                          <h6 className='text-muted'>
                            Vista previa del presupuesto
                          </h6>
                          <div className='budget-amount'>
                            $
                            {formData.budget
                              ? parseInt(formData.budget).toLocaleString()
                              : '0'}
                          </div>
                          <small className='text-muted'>
                            Mensual: $
                            {formData.budget
                              ? (parseInt(formData.budget) / 12).toLocaleString(
                                  undefined,
                                  { maximumFractionDigits: 0 },
                                )
                              : '0'}
                          </small>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              {/* Columna derecha - Personalización y Vista Previa */}
              <div className='col-12 col-lg-4'>
                {/* Personalización Visual */}
                <Card className='form-section mb-4'>
                  <Card.Header className='form-section-header'>
                    <h5 className='mb-0'>
                      <span className='material-icons me-2'>palette</span>
                      Personalización
                    </h5>
                  </Card.Header>
                  <Card.Body className='form-section-body'>
                    <div className='mb-4'>
                      <h6 className='mb-2'>Icono</h6>
                      <div className='icon-grid'>
                        {iconOptions.map(icon => (
                          <div
                            key={icon}
                            className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                            style={{ backgroundColor: formData.color }}
                            onClick={() => handleInputChange('icon', icon)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleInputChange('icon', icon);
                              }
                            }}
                            role='button'
                            tabIndex={0}
                          >
                            <span className='material-icons'>{icon}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className='mb-4'>
                      <h6 className='mb-2'>Color</h6>
                      <div className='color-picker'>
                        {colorOptions.map(color => (
                          <div
                            key={color}
                            className={`color-option ${formData.color === color ? 'selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleInputChange('color', color)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleInputChange('color', color);
                              }
                            }}
                            role='button'
                            tabIndex={0}
                            aria-label={`Select color ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Vista Previa */}
                <Card className='form-section'>
                  <Card.Header className='form-section-header'>
                    <h5 className='mb-0'>
                      <span className='material-icons me-2'>preview</span>
                      Vista Previa
                    </h5>
                  </Card.Header>
                  <Card.Body className='form-section-body'>
                    <div className='preview-card'>
                      <div className='d-flex align-items-center mb-3'>
                        <div
                          className='icon-preview me-3'
                          style={{ backgroundColor: formData.color }}
                        >
                          <span className='material-icons'>
                            {formData.icon}
                          </span>
                        </div>
                        <div className='flex-grow-1'>
                          <h6 className='mb-0'>
                            {formData.name || 'Nombre del Centro'}
                          </h6>
                          <small className='text-muted'>
                            {formData.community || 'Comunidad'}
                          </small>
                        </div>
                      </div>

                      <div className='d-flex align-items-center gap-2 mb-3'>
                        {selectedDepartment && (
                          <Badge bg={selectedDepartment.badge}>
                            {selectedDepartment.label}
                          </Badge>
                        )}
                        <Badge
                          bg={
                            formData.status === 'active'
                              ? 'success'
                              : 'secondary'
                          }
                        >
                          {formData.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>

                      {formData.manager && (
                        <div className='mb-3'>
                          <small className='text-muted d-block'>
                            Responsable
                          </small>
                          <span>{formData.manager}</span>
                        </div>
                      )}

                      {formData.budget && (
                        <div className='mb-3'>
                          <small className='text-muted d-block'>
                            Presupuesto
                          </small>
                          <span className='fw-bold'>
                            ${parseInt(formData.budget).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {formData.responsibilities.length > 0 && (
                        <div>
                          <small className='text-muted d-block mb-2'>
                            Responsabilidades
                          </small>
                          <div className='d-flex flex-wrap gap-1'>
                            {formData.responsibilities
                              .slice(0, 3)
                              .map((resp, index) => (
                                <Badge
                                  key={index}
                                  bg='light'
                                  text='dark'
                                  className='small'
                                >
                                  {resp}
                                </Badge>
                              ))}
                            {formData.responsibilities.length > 3 && (
                              <Badge bg='light' text='dark' className='small'>
                                +{formData.responsibilities.length - 3} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>

            {/* Botones de acción */}
            <div className='d-flex justify-content-end mt-4 gap-2'>
              <Button
                variant='outline-secondary'
                onClick={() => router.push(`/centros-costo/${id}`)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type='submit' variant='primary' disabled={isSubmitting}>
                {isSubmitting ? (
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
            </div>
          </Form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
