import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import Link from 'next/link';
import { ComunidadFormData, TipoComunidad, EstadoComunidad, VALIDATION_RULES } from '@/types/comunidades';
import comunidadesService from '@/lib/comunidadesService';

export default function ComunidadNueva() {
  const router = useRouter();
  const { id, edit } = router.query;
  const isEditing = !!edit && !!id;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
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
    amenidades: []
  });

  const [errors, setErrors] = useState<Partial<ComunidadFormData>>({});

  // Cargar datos si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      loadComunidadData();
    }
  }, [isEditing, id]);

  const loadComunidadData = async () => {
    try {
      const comunidad = await comunidadesService.getComunidadById(Number(id));
      setFormData({
        nombre: comunidad.nombre,
        direccion: comunidad.direccion,
        tipo: comunidad.tipo,
        estado: comunidad.estado,
        administrador: comunidad.administrador,
        telefono: comunidad.telefono || '',
        email: comunidad.email || '',
        descripcion: comunidad.descripcion || '',
        horarioAtencion: comunidad.horarioAtencion || '',
        totalUnidades: comunidad.totalUnidades || 0,
        totalEdificios: comunidad.edificios?.length || 0,
        areaComun: 0,
        amenidades: comunidad.amenidades?.map(a => a.nombre) || []
      });
      if (comunidad.imagen) {
        setPreviewImage(comunidad.imagen);
      }
    } catch (error) {
      console.error('Error loading comunidad:', error);
    }
  };

  const handleInputChange = (field: keyof ComunidadFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagen: file
      }));
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<ComunidadFormData> = {};
    
    if (step === 1) {
      // Validaciones básicas del paso 1
      if (!formData.nombre.trim()) {
        newErrors.nombre = 'El nombre es requerido';
      } else if (formData.nombre.length < VALIDATION_RULES.nombre.min) {
        newErrors.nombre = `El nombre debe tener al menos ${VALIDATION_RULES.nombre.min} caracteres`;
      }

      if (!formData.direccion.trim()) {
        newErrors.direccion = 'La dirección es requerida';
      } else if (formData.direccion.length < VALIDATION_RULES.direccion.min) {
        newErrors.direccion = `La dirección debe tener al menos ${VALIDATION_RULES.direccion.min} caracteres`;
      }

      if (!formData.administrador.trim()) {
        newErrors.administrador = 'El administrador es requerido';
      }

      if (formData.telefono && !VALIDATION_RULES.telefono.pattern.test(formData.telefono)) {
        newErrors.telefono = 'Formato de teléfono inválido';
      }

      if (formData.email && !VALIDATION_RULES.email.pattern.test(formData.email)) {
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
    if (!validateStep(1)) return;
    
    setIsLoading(true);
    try {
      if (isEditing) {
        await comunidadesService.updateComunidad(Number(id), formData);
      } else {
        await comunidadesService.createComunidad(formData);
      }
      
      router.push('/comunidades');
    } catch (error) {
      console.error('Error saving comunidad:', error);
      alert('Error al guardar la comunidad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // Implementar guardado como borrador
    alert('Borrador guardado (funcionalidad simulada)');
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>{isEditing ? 'Editar' : 'Nueva'} Comunidad — Cuentas Claras</title>
      </Head>

      <Layout title={isEditing ? 'Editar Comunidad' : 'Nueva Comunidad'}>
        <div className="container-fluid py-4">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/comunidades">Comunidades</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {isEditing ? 'Editar' : 'Nueva'}
              </li>
            </ol>
          </nav>

          {/* Stepper */}
          <div className="stepper mb-4">
            <div className={`stepper-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="stepper-circle">1</div>
              <div className="stepper-title">Información Básica</div>
            </div>
            <div className={`stepper-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="stepper-circle">2</div>
              <div className="stepper-title">Configuración</div>
            </div>
            <div className={`stepper-item ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="stepper-circle">3</div>
              <div className="stepper-title">Confirmación</div>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Paso 1: Información Básica */}
            {currentStep === 1 && (
              <div className="form-section">
                <h4 className="form-section-title">
                  <span className="material-icons me-2">info</span>
                  Información Básica
                </h4>
                
                <div className="row">
                  <div className="col-lg-8">
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label htmlFor="nombre" className="form-label">Nombre de la Comunidad <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => handleInputChange('nombre', e.target.value)}
                          placeholder="Condominio Las Palmas"
                          required
                        />
                        {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                      </div>

                      <div className="col-12 mb-3">
                        <label htmlFor="direccion" className="form-label">Dirección <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                          id="direccion"
                          value={formData.direccion}
                          onChange={(e) => handleInputChange('direccion', e.target.value)}
                          placeholder="Av. Las Palmas 1234, Las Condes, Santiago"
                          required
                        />
                        {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="tipo" className="form-label">Tipo de Comunidad</label>
                        <select
                          className="form-select"
                          id="tipo"
                          value={formData.tipo}
                          onChange={(e) => handleInputChange('tipo', e.target.value as any)}
                        >
                          {Object.values(TipoComunidad).map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="estado" className="form-label">Estado</label>
                        <select
                          className="form-select"
                          id="estado"
                          value={formData.estado}
                          onChange={(e) => handleInputChange('estado', e.target.value as any)}
                        >
                          {Object.values(EstadoComunidad).map(estado => (
                            <option key={estado} value={estado}>{estado}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="administrador" className="form-label">Administrador <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className={`form-control ${errors.administrador ? 'is-invalid' : ''}`}
                          id="administrador"
                          value={formData.administrador}
                          onChange={(e) => handleInputChange('administrador', e.target.value)}
                          placeholder="Nombre del administrador"
                        />
                        {errors.administrador && <div className="invalid-feedback">{errors.administrador}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="telefono" className="form-label">Teléfono</label>
                        <input
                          type="tel"
                          className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                          id="telefono"
                          value={formData.telefono}
                          onChange={(e) => handleInputChange('telefono', e.target.value)}
                          placeholder="+56 9 8765 4321"
                        />
                        {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
                      </div>

                      <div className="col-12 mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          id="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="admin@comunidad.cl"
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <label className="form-label">Imagen de la Comunidad</label>
                    <div 
                      className="form-thumbnail"
                      onClick={() => document.getElementById('imagen')?.click()}
                    >
                      {previewImage ? (
                        <>
                          <img src={previewImage} alt="Preview" />
                          <div className="overlay">
                            <span className="material-icons text-white" style={{ fontSize: '48px' }}>edit</span>
                            <span className="upload-text text-white">Cambiar imagen</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="upload-icon material-icons">cloud_upload</span>
                          <span className="upload-text">Click para subir imagen</span>
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
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Configuración Administrativa */}
            {currentStep === 2 && (
              <div className="form-section">
                <h4 className="form-section-title">
                  <span className="material-icons me-2">settings</span>
                  Configuración Administrativa
                </h4>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      id="descripcion"
                      rows={4}
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      placeholder="Descripción detallada de la comunidad..."
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="horarioAtencion" className="form-label">Horario de Atención</label>
                    <textarea
                      className="form-control"
                      id="horarioAtencion"
                      rows={4}
                      value={formData.horarioAtencion}
                      onChange={(e) => handleInputChange('horarioAtencion', e.target.value)}
                      placeholder="Ej: Lunes a Viernes 9:00 - 17:00"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label htmlFor="totalUnidades" className="form-label">Total de Unidades</label>
                    <input
                      type="number"
                      className="form-control"
                      id="totalUnidades"
                      value={formData.totalUnidades || ''}
                      onChange={(e) => handleInputChange('totalUnidades', parseInt(e.target.value) || 0)}
                      placeholder="120"
                      min="1"
                    />
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label htmlFor="totalEdificios" className="form-label">Total de Edificios</label>
                    <input
                      type="number"
                      className="form-control"
                      id="totalEdificios"
                      value={formData.totalEdificios || ''}
                      onChange={(e) => handleInputChange('totalEdificios', parseInt(e.target.value) || 0)}
                      placeholder="3"
                      min="1"
                    />
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label htmlFor="areaComun" className="form-label">Área Común (m²)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="areaComun"
                      value={formData.areaComun || ''}
                      onChange={(e) => handleInputChange('areaComun', parseFloat(e.target.value) || 0)}
                      placeholder="1500"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label">Amenidades</label>
                    <div className="border rounded p-3">
                      <div className="row">
                        {[
                          'Piscina', 'Gimnasio', 'Salón de eventos', 'Juegos infantiles',
                          'Cancha deportiva', 'Quincho', 'Estacionamiento visitas', 'Portería 24h'
                        ].map((amenidad) => (
                          <div key={amenidad} className="col-md-3 mb-2">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`amenidad-${amenidad}`}
                                checked={formData.amenidades?.includes(amenidad) || false}
                                onChange={(e) => {
                                  const amenidades = formData.amenidades || [];
                                  if (e.target.checked) {
                                    handleInputChange('amenidades', [...amenidades, amenidad]);
                                  } else {
                                    handleInputChange('amenidades', amenidades.filter(a => a !== amenidad));
                                  }
                                }}
                              />
                              <label className="form-check-label" htmlFor={`amenidad-${amenidad}`}>
                                {amenidad}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 3: Confirmación */}
            {currentStep === 3 && (
              <div className="form-section">
                <h4 className="form-section-title">
                  <span className="material-icons me-2">check_circle</span>
                  Confirmación
                </h4>
                
                <div className="row">
                  <div className="col-lg-8">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Resumen de la Comunidad</h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <h6>Información Básica</h6>
                            <table className="table table-sm">
                              <tbody>
                                <tr>
                                  <td><strong>Nombre:</strong></td>
                                  <td>{formData.nombre}</td>
                                </tr>
                                <tr>
                                  <td><strong>Dirección:</strong></td>
                                  <td>{formData.direccion}</td>
                                </tr>
                                <tr>
                                  <td><strong>Tipo:</strong></td>
                                  <td>{formData.tipo}</td>
                                </tr>
                                <tr>
                                  <td><strong>Administrador:</strong></td>
                                  <td>{formData.administrador}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="col-md-6">
                            <h6>Información de Contacto</h6>
                            <table className="table table-sm">
                              <tbody>
                                <tr>
                                  <td><strong>Teléfono:</strong></td>
                                  <td>{formData.telefono || 'No especificado'}</td>
                                </tr>
                                <tr>
                                  <td><strong>Email:</strong></td>
                                  <td>{formData.email || 'No especificado'}</td>
                                </tr>
                                <tr>
                                  <td><strong>Total Unidades:</strong></td>
                                  <td>{formData.totalUnidades || 'No especificado'}</td>
                                </tr>
                                <tr>
                                  <td><strong>Total Edificios:</strong></td>
                                  <td>{formData.totalEdificios || 'No especificado'}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        {formData.descripcion && (
                          <div className="mt-3">
                            <h6>Descripción</h6>
                            <p className="text-muted">{formData.descripcion}</p>
                          </div>
                        )}
                        
                        {formData.amenidades && formData.amenidades.length > 0 && (
                          <div className="mt-3">
                            <h6>Amenidades</h6>
                            <div className="d-flex flex-wrap gap-1">
                              {formData.amenidades.map((amenidad) => (
                                <span key={amenidad} className="badge bg-primary">{amenidad}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-4">
                    {previewImage && (
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">Imagen de la Comunidad</h6>
                        </div>
                        <div className="card-body p-0">
                          <img src={previewImage} alt="Preview" className="w-100" style={{ height: '200px', objectFit: 'cover' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
                <h4 className="form-section-title">Información Básica</h4>
                
                <div className="row">
                  <div className="col-lg-8">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="nombre" className="form-label">Nombre de la Comunidad *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => handleInputChange('nombre', e.target.value)}
                          placeholder="Ej: Condominio Las Palmas"
                        />
                        {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="tipo" className="form-label">Tipo de Comunidad *</label>
                        <select
                          className="form-select"
                          id="tipo"
                          value={formData.tipo}
                          onChange={(e) => handleInputChange('tipo', e.target.value)}
                        >
                          {Object.values(TipoComunidad).map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12 mb-3">
                        <label htmlFor="direccion" className="form-label">Dirección *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                          id="direccion"
                          value={formData.direccion}
                          onChange={(e) => handleInputChange('direccion', e.target.value)}
                          placeholder="Ej: Av. Las Condes 1234, Las Condes, Santiago"
                        />
                        {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="administrador" className="form-label">Administrador *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.administrador ? 'is-invalid' : ''}`}
                          id="administrador"
                          value={formData.administrador}
                          onChange={(e) => handleInputChange('administrador', e.target.value)}
                          placeholder="Nombre del administrador"
                        />
                        {errors.administrador && <div className="invalid-feedback">{errors.administrador}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="telefono" className="form-label">Teléfono</label>
                        <input
                          type="tel"
                          className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                          id="telefono"
                          value={formData.telefono}
                          onChange={(e) => handleInputChange('telefono', e.target.value)}
                          placeholder="+56 9 8765 4321"
                        />
                        {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
                      </div>

                      <div className="col-12 mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          id="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="admin@comunidad.cl"
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <label className="form-label">Imagen de la Comunidad</label>
                    <div 
                      className="form-thumbnail"
                      onClick={() => document.getElementById('imagen')?.click()}
                    >
                      {previewImage ? (
                        <>
                          <img src={previewImage} alt="Preview" />
                          <div className="overlay">
                            <span className="material-icons text-white" style={{ fontSize: '48px' }}>edit</span>
                            <span className="upload-text text-white">Cambiar imagen</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="material-icons upload-icon">image</span>
                          <span className="upload-text">Hacer clic para subir imagen</span>
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
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Configuración */}
            {currentStep === 2 && (
              <div className="form-section">
                <h4 className="form-section-title">Configuración Adicional</h4>
                
                <div className="row">
                  <div className="col-12 mb-3">
                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      id="descripcion"
                      rows={4}
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      placeholder="Descripción detallada de la comunidad..."
                    ></textarea>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="horarioAtencion" className="form-label">Horario de Atención</label>
                    <input
                      type="text"
                      className="form-control"
                      id="horarioAtencion"
                      value={formData.horarioAtencion}
                      onChange={(e) => handleInputChange('horarioAtencion', e.target.value)}
                      placeholder="Ej: Lunes a Viernes 9:00 - 18:00"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Paso 3: Confirmación */}
            {currentStep === 3 && (
              <div className="form-section">
                <h4 className="form-section-title">Confirmar Información</h4>
                
                <div className="row">
                  <div className="col-lg-8">
                    <div className="alert alert-info">
                      <span className="material-icons me-2">info</span>
                      Revisa la información antes de {isEditing ? 'actualizar' : 'crear'} la comunidad.
                    </div>
                    
                    <table className="table">
                      <tbody>
                        <tr>
                          <td><strong>Nombre:</strong></td>
                          <td>{formData.nombre}</td>
                        </tr>
                        <tr>
                          <td><strong>Tipo:</strong></td>
                          <td>{formData.tipo}</td>
                        </tr>
                        <tr>
                          <td><strong>Dirección:</strong></td>
                          <td>{formData.direccion}</td>
                        </tr>
                        <tr>
                          <td><strong>Administrador:</strong></td>
                          <td>{formData.administrador}</td>
                        </tr>
                        {formData.telefono && (
                          <tr>
                            <td><strong>Teléfono:</strong></td>
                            <td>{formData.telefono}</td>
                          </tr>
                        )}
                        {formData.email && (
                          <tr>
                            <td><strong>Email:</strong></td>
                            <td>{formData.email}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {previewImage && (
                    <div className="col-lg-4">
                      <img src={previewImage} alt="Preview" className="img-fluid rounded" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botones de navegación */}
            <div className="d-flex justify-content-between mt-4">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleBack}
                  >
                    <span className="material-icons me-2">arrow_back</span>
                    Atrás
                  </button>
                )}
              </div>
              
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleSaveDraft}
                >
                  <span className="material-icons me-2">save</span>
                  Guardar Borrador
                </button>
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleContinue}
                  >
                    Continuar
                    <span className="material-icons ms-2">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {isEditing ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      <>
                        <span className="material-icons me-2">check</span>
                        {isEditing ? 'Actualizar' : 'Crear'} Comunidad
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
