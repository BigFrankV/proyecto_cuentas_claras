import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Form, Button, Card, Badge, Alert } from 'react-bootstrap';
import { toast } from 'react-hot-toast';

import Layout from '@/components/layout/Layout';
import { createCentro } from '@/lib/centrosCostoService';
import comunidadesService from '@/lib/comunidadesService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';
import { usePermissions } from '@/lib/usePermissions';

interface Comunidad {
  id: number;
  nombre: string;
}

interface CostCenterForm {
  name: string;
  codigo: string;
  description: string;
  department: string;
  manager: string;
  budget: string;
  community: string;
  responsibilities: string[];
  icon: string;
  color: string;
}

export default function CentroCostoNuevo() {
  const router = useRouter();
  const { user } = useAuth();
  const { isSuperUser, getUserCommunities, hasRoleInCommunity } = usePermissions();
  const { comunidadSeleccionada } = useComunidad();
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [selectedComunidadId, setSelectedComunidadId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loadedComunidadesRef = useRef(false);
  const [newResponsibility, setNewResponsibility] = useState(''); // Agregado

  // Resolver comunidad
  const resolvedComunidadId = useMemo(() => {
    if (typeof isSuperUser === 'function' ? isSuperUser() : isSuperUser) {
      return selectedComunidadId ?? undefined;
    }
    if (comunidadSeleccionada && comunidadSeleccionada.id) {
      return Number(comunidadSeleccionada.id);
    }
    return user?.comunidad_id ?? undefined;
  }, [isSuperUser, comunidadSeleccionada, user?.comunidad_id, selectedComunidadId]);

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

  const [formData, setFormData] = useState<CostCenterForm>({
    name: '',
    codigo: '',
    description: '',
    department: '',
    manager: '',
    budget: '',
    community: '',
    responsibilities: [],
    icon: 'build',
    color: '#2196F3',
  });

  useEffect(() => {
    if (isSuperUser && !loadedComunidadesRef.current) {
      loadedComunidadesRef.current = true;
      comunidadesService.getComunidades()
        .then(setComunidades)
        .catch(() => toast.error('Error cargando comunidades'));
    } else if (!isSuperUser) {
      const userCommunities = getUserCommunities();
      setSelectedComunidadId(userCommunities[0]?.comunidadId || null);
    }
  }, [isSuperUser, getUserCommunities]);

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

  const handleInputChange = (field: keyof CostCenterForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addResponsibility = () => { // Agregado
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
    setLoading(true);
    setError('');

    if (!selectedComunidadId) {
      setError('Selecciona una comunidad');
      setLoading(false);
      return;
    }

    if (!formData.name.trim() || !formData.codigo.trim()) {
      setError('Nombre y código son requeridos');
      setLoading(false);
      return;
    }

    try {
      await createCentro(selectedComunidadId, {
        nombre: formData.name.trim(),
        codigo: formData.codigo.trim(),
      });

      toast.success('Centro de costo creado exitosamente');
      router.push('/centros-costo');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear el centro de costo');
    } finally {
      setLoading(false);
    }
  };

  const selectedDepartment = departmentOptions.find(
    d => d.value === formData.department,
  );

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
                      No tienes permisos para crear Centros de Costo.
                      <br />
                      Solo usuarios con roles administrativos pueden acceder a esta sección.
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
                        onClick={() => router.push('/centros-costo')}
                      >
                        <span className='material-icons align-middle me-1'>list</span>
                        Ver Centros de Costo
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

  return (
    <ProtectedRoute>
      <Head>
        <title>Nuevo Centro de Costo — Cuentas Claras</title>
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
                  onClick={() => router.push('/centros-costo')}
                >
                  <span className='material-icons me-1'>arrow_back</span>
                  Volver a Centros de Costo
                </Button>
                <h1 className='cost-center-form-title'>
                  <span className='material-icons me-2'>add_business</span>
                  Nuevo Centro de Costo
                </h1>
                <p className='cost-center-form-subtitle'>
                  Crea un nuevo centro de costo para organizar el presupuesto
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
                      {isSuperUser && (
                        <div className='col-md-12'>
                          <Form.Group>
                            <Form.Label className='required'>
                              Comunidad
                            </Form.Label>
                            <Form.Select
                              value={selectedComunidadId || ''}
                              onChange={e => setSelectedComunidadId(Number(e.target.value))}
                              required
                            >
                              <option value=''>Seleccionar comunidad</option>
                              {comunidades.map(com => (
                                <option key={com.id} value={com.id}>
                                  {com.nombre}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      )}

                      <div className='col-md-6'>
                        <Form.Group>
                          <Form.Label className='required'>
                            Nombre del Centro
                          </Form.Label>
                          <Form.Control
                            type='text'
                            placeholder='Ej: Mantenimiento Edificio A'
                            value={formData.name}
                            onChange={e => handleInputChange('name', e.target.value)}
                            required
                          />
                        </Form.Group>
                      </div>

                      <div className='col-md-6'>
                        <Form.Group>
                          <Form.Label className='required'>
                            Código
                          </Form.Label>
                          <Form.Control
                            type='text'
                            placeholder='Ej: CC001'
                            value={formData.codigo}
                            onChange={e => handleInputChange('codigo', e.target.value)}
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
                            onChange={e => handleInputChange('department', e.target.value)}
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

                      <div className='col-md-6'>
                        <Form.Group>
                          <Form.Label className='required'>
                            Responsable
                          </Form.Label>
                          <Form.Control
                            type='text'
                            placeholder='Nombre del responsable'
                            value={formData.manager}
                            onChange={e => handleInputChange('manager', e.target.value)}
                            required
                          />
                        </Form.Group>
                      </div>

                      <div className='col-12'>
                        <Form.Group>
                          <Form.Label>Descripción</Form.Label>
                          <Form.Control
                            as='textarea'
                            rows={3}
                            placeholder='Describe las funciones del centro de costo...'
                            value={formData.description}
                            onChange={e => handleInputChange('description', e.target.value)}
                          />
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
                              step='1'
                            />
                          </div>
                        </Form.Group>
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
                            Comunidad seleccionada
                          </small>
                        </div>
                      </div>

                      {selectedDepartment && (
                        <div className='mb-3'>
                          <Badge bg={selectedDepartment.badge}>
                            {selectedDepartment.label}
                          </Badge>
                        </div>
                      )}

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

            {error && (
              <Alert variant='danger'>
                <span className='material-icons me-2'>error</span>
                {error}
              </Alert>
            )}

            {/* Botones de acción */}
            <div className='d-flex justify-content-end mt-4 gap-2'>
              <Button
                variant='outline-secondary'
                onClick={() => router.push('/centros-costo')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type='submit' variant='primary' disabled={loading}>
                {loading ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2' />
                    Creando...
                  </>
                ) : (
                  <>
                    <span className='material-icons me-2'>save</span>
                    Crear Centro de Costo
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
