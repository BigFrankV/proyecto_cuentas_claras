import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Spinner,
  ProgressBar,
} from 'react-bootstrap';

import Layout from '../../components/layout/Layout';
import comunidadesService from '../../lib/comunidadesService';
import {
  validateRut,
  getRutValidationError,
  formatRut,
  calculateDV,
} from '../../lib/rutValidator';
import { useAuth } from '../../lib/useAuth';
import { Permission, usePermissions, PermissionGuard, ProtectedPage } from '../../lib/usePermissions';
import {
  ComunidadFormData,
  TipoComunidad,
  EstadoComunidad,
} from '../../types/comunidades';

export default function NuevaComunidad() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const isEditing = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ComunidadFormData>({
    nombre: '',
    direccion: '',
    tipo: TipoComunidad.CONDOMINIO,
    estado: EstadoComunidad.ACTIVA,
    administrador: '',
    telefono: '',
    email: '',
    descripcion: '',
    horarioAtencion: '',
    totalUnidades: 0,
    totalEdificios: 0,
    areaComun: 0,
    amenidades: [],
  });

  useEffect(() => {
    if (isEditing && id) {
      loadComunidadData();
    }
  }, [id, isEditing]);

  const loadComunidadData = async () => {
    try {
      const comunidad = await comunidadesService.getComunidadById(Number(id));
      // Convertir amenidades de objetos a strings si es necesario
      const amenidadesString = Array.isArray(comunidad.amenidades)
        ? comunidad.amenidades.map(a => (typeof a === 'string' ? a : a.nombre))
        : [];

      setFormData({
        ...comunidad,
        amenidades: amenidadesString,
      });

      if (comunidad.imagen) {
        setPreviewImage(comunidad.imagen);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading comunidad:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.nombre.trim()) {
        newErrors.nombre = 'El nombre es requerido';
      }
      if (!formData.direccion.trim()) {
        newErrors.direccion = 'La dirección es requerida';
      }
      if (!formData.administrador.trim()) {
        newErrors.administrador = 'El administrador es requerido';
      }

      // Validación de RUT (opcional pero si se ingresa debe ser válido)
      if (formData.rut || formData.dv) {
        const rutError = getRutValidationError(
          formData.rut || '',
          formData.dv || '',
        );
        if (rutError) {
          newErrors.rut = rutError;
        }
      }

      if (formData.telefono && !/^\+?[\d\s-()]+$/.test(formData.telefono)) {
        newErrors.telefono = 'Formato de teléfono inválido';
      }
      if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        newErrors.email = 'Formato de email inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        await comunidadesService.updateComunidad(Number(id), formData);
      } else {
        await comunidadesService.createComunidad(formData);
      }

      router.push('/comunidades');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving comunidad:', error);
      alert('Error al guardar la comunidad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    alert('Borrador guardado (funcionalidad simulada)');
  };

  const steps = [
    { number: 1, title: 'Información Básica' },
    { number: 2, title: 'Configuración' },
    { number: 3, title: 'Confirmación' },
  ];

  return (
    <ProtectedPage permission={Permission.CREATE_COMUNIDAD}>
      <>
        <Head>
          <title>
            {isEditing ? 'Editar' : 'Nueva'} Comunidad — Cuentas Claras
          </title>
        </Head>

        <Layout title={isEditing ? 'Editar Comunidad' : 'Nueva Comunidad'}>
          <Container fluid className="py-4">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/comunidades" className="text-decoration-none">Comunidades</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {isEditing ? 'Editar' : 'Nueva'}
                </li>
              </ol>
            </nav>

            <Row className="justify-content-center">
              <Col lg={10}>
                <Card className="shadow-sm border-0">
                  <Card.Body className="p-4">
                    {/* Stepper Visual */}
                    <div className="mb-5 position-relative">
                      <ProgressBar now={((currentStep - 1) / (steps.length - 1)) * 100} className="position-absolute w-100" style={{ height: '2px', top: '15px', zIndex: 0 }} variant="primary" />
                      <div className="d-flex justify-content-between position-relative" style={{ zIndex: 1 }}>
                        {steps.map((step) => (
                          <div key={step.number} className="text-center bg-white px-2">
                            <div
                              className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${
                                currentStep >= step.number ? 'bg-primary text-white' : 'bg-light text-muted border'
                              }`}
                              style={{ width: '32px', height: '32px', transition: 'all 0.3s ease' }}
                            >
                              {currentStep > step.number ? (
                                <span className="material-icons" style={{ fontSize: '18px' }}>check</span>
                              ) : (
                                step.number
                              )}
                            </div>
                            <small className={`fw-bold ${currentStep >= step.number ? 'text-primary' : 'text-muted'}`}>
                              {step.title}
                            </small>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Form onSubmit={e => e.preventDefault()}>
                      {/* Paso 1: Información Básica */}
                      {currentStep === 1 && (
                        <div className="animate__animated animate__fadeIn">
                          <h5 className="mb-4 d-flex align-items-center text-primary">
                            <span className="material-icons me-2">info</span>
                            Información Básica
                          </h5>

                          <Row>
                            <Col lg={8}>
                              <Row>
                                <Col md={12} className="mb-3">
                                  <Form.Group controlId="nombre">
                                    <Form.Label>Nombre de la Comunidad <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                      type="text"
                                      value={formData.nombre}
                                      onChange={e => handleInputChange('nombre', e.target.value)}
                                      placeholder="Ej: Condominio Las Palmas"
                                      isInvalid={!!errors.nombre}
                                      required
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
                                  </Form.Group>
                                </Col>

                                <Col md={12} className="mb-3">
                                  <Form.Group controlId="direccion">
                                    <Form.Label>Dirección <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                      type="text"
                                      value={formData.direccion}
                                      onChange={e => handleInputChange('direccion', e.target.value)}
                                      placeholder="Ej: Av. Las Palmas 1234, Las Condes, Santiago"
                                      isInvalid={!!errors.direccion}
                                      required
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.direccion}</Form.Control.Feedback>
                                  </Form.Group>
                                </Col>

                                <Col md={6} className="mb-3">
                                  <Form.Group controlId="tipo">
                                    <Form.Label>Tipo de Comunidad</Form.Label>
                                    <Form.Select
                                      value={formData.tipo}
                                      onChange={e => handleInputChange('tipo', e.target.value as TipoComunidad)}
                                    >
                                      {Object.values(TipoComunidad).map(tipo => (
                                        <option key={tipo} value={tipo}>{tipo}</option>
                                      ))}
                                    </Form.Select>
                                  </Form.Group>
                                </Col>

                                <Col md={6} className="mb-3">
                                  <Form.Group controlId="estado">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Select
                                      value={formData.estado}
                                      onChange={e => handleInputChange('estado', e.target.value as EstadoComunidad)}
                                    >
                                      {Object.values(EstadoComunidad).map(estado => (
                                        <option key={estado} value={estado}>{estado}</option>
                                      ))}
                                    </Form.Select>
                                  </Form.Group>
                                </Col>

                                {/* Campos de RUT */}
                                <Col md={8} className="mb-3">
                                  <Form.Group controlId="rut">
                                    <Form.Label>RUT <small className="text-muted">(sin puntos ni guión)</small></Form.Label>
                                    <Form.Control
                                      type="text"
                                      value={formData.rut || ''}
                                      onChange={e => {
                                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
                                        handleInputChange('rut', value);
                                        if (value.length >= 7) {
                                          const calculatedDV = calculateDV(value);
                                          handleInputChange('dv', calculatedDV);
                                        }
                                      }}
                                      placeholder="12345678"
                                      maxLength={8}
                                      isInvalid={!!errors.rut}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.rut}</Form.Control.Feedback>
                                    <Form.Text className="text-muted">
                                      Ingrese el RUT y el dígito verificador se calculará automáticamente
                                    </Form.Text>
                                  </Form.Group>
                                </Col>

                                <Col md={4} className="mb-3">
                                  <Form.Group controlId="dv">
                                    <Form.Label>DV</Form.Label>
                                    <Form.Control
                                      type="text"
                                      value={formData.dv || ''}
                                      onChange={e => {
                                        const value = e.target.value.toUpperCase().replace(/[^0-9K]/g, '').slice(0, 1);
                                        handleInputChange('dv', value);
                                      }}
                                      placeholder="K"
                                      maxLength={1}
                                      readOnly={!!(formData.rut && formData.rut.length >= 7)}
                                      style={{
                                        backgroundColor: formData.rut && formData.rut.length >= 7 ? '#e9ecef' : 'white',
                                        cursor: formData.rut && formData.rut.length >= 7 ? 'not-allowed' : 'text',
                                      }}
                                      isInvalid={!!errors.rut}
                                    />
                                    {formData.rut && formData.dv && (
                                      <Form.Text className="text-success d-flex align-items-center mt-1">
                                        <span className="material-icons me-1" style={{ fontSize: '14px' }}>check_circle</span>
                                        RUT: {formatRut(formData.rut, formData.dv)}
                                      </Form.Text>
                                    )}
                                  </Form.Group>
                                </Col>

                                <Col md={6} className="mb-3">
                                  <Form.Group controlId="administrador">
                                    <Form.Label>Administrador <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                      type="text"
                                      value={formData.administrador}
                                      onChange={e => handleInputChange('administrador', e.target.value)}
                                      placeholder="Nombre del administrador"
                                      isInvalid={!!errors.administrador}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.administrador}</Form.Control.Feedback>
                                  </Form.Group>
                                </Col>

                                <Col md={6} className="mb-3">
                                  <Form.Group controlId="telefono">
                                    <Form.Label>Teléfono</Form.Label>
                                    <Form.Control
                                      type="tel"
                                      value={formData.telefono}
                                      onChange={e => handleInputChange('telefono', e.target.value)}
                                      placeholder="+56 9 8765 4321"
                                      isInvalid={!!errors.telefono}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.telefono}</Form.Control.Feedback>
                                  </Form.Group>
                                </Col>

                                <Col md={12} className="mb-3">
                                  <Form.Group controlId="email">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                      type="email"
                                      value={formData.email}
                                      onChange={e => handleInputChange('email', e.target.value)}
                                      placeholder="admin@comunidad.cl"
                                      isInvalid={!!errors.email}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                  </Form.Group>
                                </Col>
                              </Row>
                            </Col>

                            <Col lg={4}>
                              <Form.Label>Imagen de la Comunidad</Form.Label>
                              <div
                                className="border rounded d-flex flex-column align-items-center justify-content-center bg-light position-relative overflow-hidden"
                                style={{ height: '250px', cursor: 'pointer', borderStyle: 'dashed !important' }}
                                onClick={() => document.getElementById('imagen')?.click()}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    document.getElementById('imagen')?.click();
                                  }
                                }}
                                role="button"
                                tabIndex={0}
                              >
                                {previewImage ? (
                                  <>
                                    <Image
                                      src={previewImage}
                                      alt="Preview"
                                      fill
                                      style={{ objectFit: 'cover' }}
                                    />
                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-dark bg-opacity-50 opacity-0 hover-opacity-100 transition-opacity">
                                      <span className="material-icons text-white" style={{ fontSize: '48px' }}>edit</span>
                                      <span className="text-white fw-bold mt-2">Cambiar imagen</span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <span className="material-icons text-muted mb-2" style={{ fontSize: '48px' }}>cloud_upload</span>
                                    <span className="text-muted">Click para subir imagen</span>
                                  </>
                                )}
                              </div>
                              <input
                                type="file"
                                id="imagen"
                                className="d-none"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </Col>
                          </Row>
                        </div>
                      )}

                      {/* Paso 2: Configuración Administrativa */}
                      {currentStep === 2 && (
                        <div className="animate__animated animate__fadeIn">
                          <h5 className="mb-4 d-flex align-items-center text-primary">
                            <span className="material-icons me-2">settings</span>
                            Configuración Administrativa
                          </h5>

                          <Row>
                            <Col md={6} className="mb-3">
                              <Form.Group controlId="descripcion">
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={4}
                                  value={formData.descripcion}
                                  onChange={e => handleInputChange('descripcion', e.target.value)}
                                  placeholder="Descripción detallada de la comunidad..."
                                />
                              </Form.Group>
                            </Col>

                            <Col md={6} className="mb-3">
                              <Form.Group controlId="horarioAtencion">
                                <Form.Label>Horario de Atención</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={4}
                                  value={formData.horarioAtencion}
                                  onChange={e => handleInputChange('horarioAtencion', e.target.value)}
                                  placeholder="Ej: Lunes a Viernes 9:00 - 17:00"
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={4} className="mb-3">
                              <Form.Group controlId="totalUnidades">
                                <Form.Label>Total de Unidades</Form.Label>
                                <Form.Control
                                  type="number"
                                  value={formData.totalUnidades || ''}
                                  onChange={e => handleInputChange('totalUnidades', parseInt(e.target.value) || 0)}
                                  placeholder="120"
                                  min="1"
                                />
                              </Form.Group>
                            </Col>

                            <Col md={4} className="mb-3">
                              <Form.Group controlId="totalEdificios">
                                <Form.Label>Total de Edificios</Form.Label>
                                <Form.Control
                                  type="number"
                                  value={formData.totalEdificios || ''}
                                  onChange={e => handleInputChange('totalEdificios', parseInt(e.target.value) || 0)}
                                  placeholder="3"
                                  min="1"
                                />
                              </Form.Group>
                            </Col>

                            <Col md={4} className="mb-3">
                              <Form.Group controlId="areaComun">
                                <Form.Label>Área Común (m²)</Form.Label>
                                <Form.Control
                                  type="number"
                                  value={formData.areaComun || ''}
                                  onChange={e => handleInputChange('areaComun', parseFloat(e.target.value) || 0)}
                                  placeholder="1500"
                                  step="0.01"
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col xs={12} className="mb-3">
                              <Form.Label>Amenidades</Form.Label>
                              <div className="border rounded p-3 bg-light">
                                <Row>
                                  {[
                                    'Piscina',
                                    'Gimnasio',
                                    'Salón de eventos',
                                    'Juegos infantiles',
                                    'Cancha deportiva',
                                    'Quincho',
                                    'Estacionamiento visitas',
                                    'Portería 24h',
                                  ].map(amenidad => (
                                    <Col md={3} key={amenidad} className="mb-2">
                                      <Form.Check
                                        type="checkbox"
                                        id={`amenidad-${amenidad}`}
                                        label={amenidad}
                                        checked={formData.amenidades?.includes(amenidad) || false}
                                        onChange={e => {
                                          const amenidades = formData.amenidades || [];
                                          if (e.target.checked) {
                                            handleInputChange('amenidades', [...amenidades, amenidad]);
                                          } else {
                                            handleInputChange('amenidades', amenidades.filter(a => a !== amenidad));
                                          }
                                        }}
                                      />
                                    </Col>
                                  ))}
                                </Row>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}

                      {/* Paso 3: Confirmación */}
                      {currentStep === 3 && (
                        <div className="animate__animated animate__fadeIn">
                          <h5 className="mb-4 d-flex align-items-center text-primary">
                            <span className="material-icons me-2">check_circle</span>
                            Confirmación
                          </h5>

                          <Row>
                            <Col lg={8}>
                              <Card className="mb-3 border-light bg-light">
                                <Card.Header className="bg-white border-bottom-0 pt-3">
                                  <h6 className="mb-0 fw-bold text-primary">Resumen de la Comunidad</h6>
                                </Card.Header>
                                <Card.Body>
                                  <Row>
                                    <Col md={6}>
                                      <h6 className="text-muted text-uppercase small fw-bold mb-3">Información Básica</h6>
                                      <dl className="row mb-0">
                                        <dt className="col-sm-4 text-muted fw-normal">Nombre:</dt>
                                        <dd className="col-sm-8 fw-medium">{formData.nombre}</dd>

                                        <dt className="col-sm-4 text-muted fw-normal">Dirección:</dt>
                                        <dd className="col-sm-8 fw-medium">{formData.direccion}</dd>

                                        <dt className="col-sm-4 text-muted fw-normal">Tipo:</dt>
                                        <dd className="col-sm-8 fw-medium">{formData.tipo}</dd>

                                        <dt className="col-sm-4 text-muted fw-normal">Admin:</dt>
                                        <dd className="col-sm-8 fw-medium">{formData.administrador}</dd>
                                      </dl>
                                    </Col>

                                    <Col md={6}>
                                      <h6 className="text-muted text-uppercase small fw-bold mb-3">Contacto y Detalles</h6>
                                      <dl className="row mb-0">
                                        <dt className="col-sm-5 text-muted fw-normal">Teléfono:</dt>
                                        <dd className="col-sm-7 fw-medium">{formData.telefono || 'No especificado'}</dd>

                                        <dt className="col-sm-5 text-muted fw-normal">Email:</dt>
                                        <dd className="col-sm-7 fw-medium">{formData.email || 'No especificado'}</dd>

                                        <dt className="col-sm-5 text-muted fw-normal">Unidades:</dt>
                                        <dd className="col-sm-7 fw-medium">{formData.totalUnidades || 'No especificado'}</dd>

                                        <dt className="col-sm-5 text-muted fw-normal">Edificios:</dt>
                                        <dd className="col-sm-7 fw-medium">{formData.totalEdificios || 'No especificado'}</dd>
                                      </dl>
                                    </Col>
                                  </Row>

                                  {formData.descripcion && (
                                    <div className="mt-4 border-top pt-3">
                                      <h6 className="text-muted text-uppercase small fw-bold">Descripción</h6>
                                      <p className="text-muted mb-0">{formData.descripcion}</p>
                                    </div>
                                  )}

                                  {formData.amenidades && formData.amenidades.length > 0 && (
                                    <div className="mt-4 border-top pt-3">
                                      <h6 className="text-muted text-uppercase small fw-bold mb-2">Amenidades</h6>
                                      <div className="d-flex flex-wrap gap-2">
                                        {formData.amenidades.map(amenidad => (
                                          <Badge key={amenidad} bg="info" className="fw-normal px-3 py-2">
                                            {amenidad}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </Card.Body>
                              </Card>
                            </Col>

                            <Col lg={4}>
                              {previewImage && (
                                <Card className="border-0 shadow-sm">
                                  <Card.Header className="bg-white border-bottom-0 pt-3">
                                    <h6 className="mb-0 fw-bold text-primary">Imagen de Portada</h6>
                                  </Card.Header>
                                  <Card.Body className="p-0 position-relative" style={{ height: '200px' }}>
                                    <Image
                                      src={previewImage}
                                      alt="Preview"
                                      fill
                                      style={{ objectFit: 'cover' }}
                                      className="rounded-bottom"
                                    />
                                  </Card.Body>
                                </Card>
                              )}
                            </Col>
                          </Row>
                        </div>
                      )}

                      {/* Botones de navegación */}
                      <div className="d-flex justify-content-between mt-5 pt-3 border-top">
                        <div>
                          {currentStep > 1 && (
                            <Button
                              variant="outline-secondary"
                              onClick={handleBack}
                              className="d-flex align-items-center"
                            >
                              <span className="material-icons me-1">arrow_back</span>
                              Anterior
                            </Button>
                          )}
                        </div>

                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            onClick={handleSaveDraft}
                            className="d-flex align-items-center"
                          >
                            <span className="material-icons me-1">save</span>
                            Guardar Borrador
                          </Button>

                          {currentStep < 3 ? (
                            <Button
                              variant="primary"
                              onClick={handleContinue}
                              className="d-flex align-items-center"
                            >
                              Continuar
                              <span className="material-icons ms-1">arrow_forward</span>
                            </Button>
                          ) : (
                            <Button
                              variant="success"
                              onClick={handleSubmit}
                              disabled={isLoading}
                              className="d-flex align-items-center"
                            >
                              {isLoading ? (
                                <>
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                  />
                                  Guardando...
                                </>
                              ) : (
                                <>
                                  <span className="material-icons me-1">check</span>
                                  {isEditing ? 'Actualizar' : 'Crear'} Comunidad
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Layout>
      </>
    </ProtectedPage>
  );
}
