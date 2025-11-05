import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import apiClient from '@/lib/api';
import { ProtectedRoute } from '@/lib/useAuth';

interface TorreFormData {
  edificioId: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  numPisos: number;
  numUnidades: number;
  administradorId: string;
  tieneAscensor: boolean;
  tienePorteria: boolean;
  tieneEstacionamiento: boolean;
  gastosEspecificos: 'si' | 'no';
  coeficienteTorre: number;
  imagen: File | null;
  activa: boolean;
  visibleEnPortal: boolean;
  facturacionIndependiente: boolean;
  observaciones: string;
}

const initialFormData: TorreFormData = {
  edificioId: '',
  nombre: '',
  codigo: '',
  descripcion: '',
  numPisos: 1,
  numUnidades: 1,
  administradorId: '',
  tieneAscensor: false,
  tienePorteria: false,
  tieneEstacionamiento: false,
  gastosEspecificos: 'no',
  coeficienteTorre: 0,
  imagen: null,
  activa: true,
  visibleEnPortal: false,
  facturacionIndependiente: false,
  observaciones: '',
};

export default function TorreNueva() {
  const router = useRouter();
  const [formData, setFormData] = useState<TorreFormData>(initialFormData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [codigoValidating, setCodigoValidating] = useState(false);
  const [codigoExists, setCodigoExists] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate codigo uniqueness
  useEffect(() => {
    const validateCodigo = async () => {
      if (!formData.edificioId || !formData.codigo.trim()) {
        setCodigoExists(null);
        return;
      }

      setCodigoValidating(true);
      try {
        const response = await apiClient.get(
          `/torres/edificio/${formData.edificioId}/validar-codigo`,
          {
            params: { codigo: formData.codigo },
          },
        );
        setCodigoExists(response.data.existe);
      } catch (error) {
// eslint-disable-next-line no-console
console.error('Error validating codigo:', error);
        setCodigoExists(null);
      } finally {
        setCodigoValidating(false);
      }
    };

    const timeoutId = setTimeout(validateCodigo, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [formData.edificioId, formData.codigo]);

  // Get suggested next codigo
  useEffect(() => {
    const getSiguienteCodigo = async () => {
      if (!formData.edificioId) {return;}

      try {
        const response = await apiClient.get(
          `/torres/edificio/${formData.edificioId}/siguiente-codigo`,
        );
        const suggestedCode = response.data.siguienteCodigo;
        if (suggestedCode && !formData.codigo) {
          setFormData(prev => ({ ...prev, codigo: suggestedCode }));
        }
      } catch (error) {
// eslint-disable-next-line no-console
console.error('Error getting siguiente codigo:', error);
      }
    };

    getSiguienteCodigo();
  }, [formData.edificioId]);

  // Datos mock para selects
  const edificios = [
    { id: '1', nombre: 'Torre Central' },
    { id: '2', nombre: 'Edificio Norte' },
    { id: '3', nombre: 'Condominio Jardines' },
    { id: '4', nombre: 'Edificio Mirador' },
  ];

  const administradores = [
    { id: '1', nombre: 'Patricia Contreras' },
    { id: '2', nombre: 'Juan Pérez' },
    { id: '3', nombre: 'María González' },
  ];

  const handleInputChange = (field: keyof TorreFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          imagen: 'La imagen debe ser menor a 5MB',
        }));
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          imagen: 'Solo se permiten archivos de imagen',
        }));
        return;
      }

      setFormData(prev => ({ ...prev, imagen: file }));

      // Crear preview
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Limpiar error
      setErrors(prev => ({
        ...prev,
        imagen: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.edificioId) {
      newErrors.edificioId = 'Debe seleccionar un edificio';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    } else if (codigoExists === true) {
      newErrors.codigo = 'Este código ya existe en el edificio';
    }

    if (formData.numPisos < 1) {
      newErrors.numPisos = 'Debe tener al menos 1 piso';
    }

    if (formData.numUnidades < 1) {
      newErrors.numUnidades = 'Debe tener al menos 1 unidad';
    }

    if (formData.gastosEspecificos === 'si' && formData.coeficienteTorre <= 0) {
      newErrors.coeficienteTorre = 'El coeficiente debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar datos para la API
      const torreData = {
        edificio_id: parseInt(formData.edificioId),
        nombre: formData.nombre,
        codigo: formData.codigo,
        descripcion: formData.descripcion,
        num_pisos: formData.numPisos,
        tiene_ascensor: formData.tieneAscensor,
        tiene_porteria: formData.tienePorteria,
        tiene_estacionamiento: formData.tieneEstacionamiento,
        administrador_id: formData.administradorId
          ? parseInt(formData.administradorId)
          : null,
      };

      // Llamar a la API
      await apiClient.post('/torres', torreData);

      // Redirigir al listado de torres
      router.push('/torres');
    } catch (error: any) {
// eslint-disable-next-line no-console
console.error('Error al crear torre:', error);
      if (error.response?.status === 409) {
        setErrors({ codigo: 'Este código ya existe en el edificio' });
      } else {
        setErrors({ general: 'Error al crear la torre. Intente nuevamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nueva Torre — Cuentas Claras</title>
      </Head>

      <Layout title='Nueva Torre'>
        <div className='container-fluid py-4'>
          {/* Breadcrumb */}
          <nav aria-label='breadcrumb' className='mb-4'>
            <ol className='breadcrumb'>
              <li className='breadcrumb-item'>
                <Link href='/dashboard'>Dashboard</Link>
              </li>
              <li className='breadcrumb-item'>
                <Link href='/edificios'>Edificios</Link>
              </li>
              <li className='breadcrumb-item'>
                <Link href='/torres'>Torres</Link>
              </li>
              <li className='breadcrumb-item active' aria-current='page'>
                Nueva Torre
              </li>
            </ol>
          </nav>

          <form onSubmit={handleSubmit}>
            <div className='row'>
              <div className='col-lg-8'>
                {/* Información básica de la torre */}
                <div className='card mb-4'>
                  <div
                    className='card-header'
                    style={{ backgroundColor: '#f9f9f9' }}
                  >
                    <h5 className='mb-0'>Información Básica</h5>
                  </div>
                  <div className='card-body'>
                    <div className='mb-3'>
                      <label htmlFor='edificioSelect' className='form-label'>
                        Edificio <span className='text-danger'>*</span>
                      </label>
                      <select
                        className={`form-select ${errors.edificioId ? 'is-invalid' : ''}`}
                        id='edificioSelect'
                        value={formData.edificioId}
                        onChange={e =>
                          handleInputChange('edificioId', e.target.value)
                        }
                        required
                      >
                        <option value='' disabled>
                          Seleccionar edificio
                        </option>
                        {edificios.map(edificio => (
                          <option key={edificio.id} value={edificio.id}>
                            {edificio.nombre}
                          </option>
                        ))}
                      </select>
                      {errors.edificioId && (
                        <div className='invalid-feedback'>
                          {errors.edificioId}
                        </div>
                      )}
                      <div className='form-text'>
                        Edificio al que pertenece esta torre
                      </div>
                    </div>

                    <div className='row'>
                      <div className='col-md-8'>
                        <div className='mb-3'>
                          <label htmlFor='nombreTorre' className='form-label'>
                            Nombre de la Torre{' '}
                            <span className='text-danger'>*</span>
                          </label>
                          <input
                            type='text'
                            className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                            id='nombreTorre'
                            placeholder='Ej: Torre A'
                            value={formData.nombre}
                            onChange={e =>
                              handleInputChange('nombre', e.target.value)
                            }
                            required
                          />
                          {errors.nombre && (
                            <div className='invalid-feedback'>
                              {errors.nombre}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='col-md-4'>
                        <div className='mb-3'>
                          <label htmlFor='codigoTorre' className='form-label'>
                            Código <span className='text-danger'>*</span>
                          </label>
                          <div className='input-group'>
                            <input
                              type='text'
                              className={`form-control ${
                                errors.codigo
                                  ? 'is-invalid'
                                  : codigoExists === false &&
                                      formData.codigo.trim()
                                    ? 'is-valid'
                                    : ''
                              }`}
                              id='codigoTorre'
                              placeholder='Ej: TA'
                              value={formData.codigo}
                              onChange={e =>
                                handleInputChange('codigo', e.target.value)
                              }
                              required
                            />
                            {codigoValidating && (
                              <span className='input-group-text'>
                                <div
                                  className='spinner-border spinner-border-sm'
                                  role='status'
                                >
                                  <span className='visually-hidden'>
                                    Validando...
                                  </span>
                                </div>
                              </span>
                            )}
                            {!codigoValidating && formData.codigo.trim() && (
                              <span className='input-group-text'>
                                {codigoExists === false ? (
                                  <i className='material-icons text-success'>
                                    check_circle
                                  </i>
                                ) : codigoExists === true ? (
                                  <i className='material-icons text-danger'>
                                    error
                                  </i>
                                ) : null}
                              </span>
                            )}
                          </div>
                          {errors.codigo && (
                            <div className='invalid-feedback'>
                              {errors.codigo}
                            </div>
                          )}
                          {!errors.codigo &&
                            codigoExists === false &&
                            formData.codigo.trim() && (
                              <div className='valid-feedback'>
                                Código disponible
                              </div>
                            )}
                          <div className='form-text'>
                            Código único para identificar la torre
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='mb-3'>
                      <label htmlFor='descripcionTorre' className='form-label'>
                        Descripción
                      </label>
                      <textarea
                        className='form-control'
                        id='descripcionTorre'
                        rows={3}
                        placeholder='Descripción de la torre'
                        value={formData.descripcion}
                        onChange={e =>
                          handleInputChange('descripcion', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Detalles de la torre */}
                <div className='card mb-4'>
                  <div
                    className='card-header'
                    style={{ backgroundColor: '#f9f9f9' }}
                  >
                    <h5 className='mb-0'>Detalles de la Torre</h5>
                  </div>
                  <div className='card-body'>
                    <div className='row'>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label htmlFor='numPisos' className='form-label'>
                            Número de Pisos
                          </label>
                          <input
                            type='number'
                            className={`form-control ${errors.numPisos ? 'is-invalid' : ''}`}
                            id='numPisos'
                            min='1'
                            value={formData.numPisos}
                            onChange={e =>
                              handleInputChange(
                                'numPisos',
                                parseInt(e.target.value) || 1,
                              )
                            }
                          />
                          {errors.numPisos && (
                            <div className='invalid-feedback'>
                              {errors.numPisos}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label htmlFor='numUnidades' className='form-label'>
                            Número de Unidades
                          </label>
                          <input
                            type='number'
                            className={`form-control ${errors.numUnidades ? 'is-invalid' : ''}`}
                            id='numUnidades'
                            min='1'
                            value={formData.numUnidades}
                            onChange={e =>
                              handleInputChange(
                                'numUnidades',
                                parseInt(e.target.value) || 1,
                              )
                            }
                          />
                          {errors.numUnidades && (
                            <div className='invalid-feedback'>
                              {errors.numUnidades}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='row'>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label
                            htmlFor='administradorTorre'
                            className='form-label'
                          >
                            Administrador
                          </label>
                          <select
                            className='form-select'
                            id='administradorTorre'
                            value={formData.administradorId}
                            onChange={e =>
                              handleInputChange(
                                'administradorId',
                                e.target.value,
                              )
                            }
                          >
                            <option value=''>Seleccionar administrador</option>
                            {administradores.map(admin => (
                              <option key={admin.id} value={admin.id}>
                                {admin.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label className='form-label'>
                            Servicios Específicos
                          </label>
                          <div className='form-check'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              id='tieneAscensor'
                              checked={formData.tieneAscensor}
                              onChange={e =>
                                handleInputChange(
                                  'tieneAscensor',
                                  e.target.checked,
                                )
                              }
                            />
                            <label
                              className='form-check-label'
                              htmlFor='tieneAscensor'
                            >
                              Ascensor
                            </label>
                          </div>
                          <div className='form-check'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              id='tienePorteria'
                              checked={formData.tienePorteria}
                              onChange={e =>
                                handleInputChange(
                                  'tienePorteria',
                                  e.target.checked,
                                )
                              }
                            />
                            <label
                              className='form-check-label'
                              htmlFor='tienePorteria'
                            >
                              Portería
                            </label>
                          </div>
                          <div className='form-check'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              id='tieneEstacionamiento'
                              checked={formData.tieneEstacionamiento}
                              onChange={e =>
                                handleInputChange(
                                  'tieneEstacionamiento',
                                  e.target.checked,
                                )
                              }
                            />
                            <label
                              className='form-check-label'
                              htmlFor='tieneEstacionamiento'
                            >
                              Estacionamientos Propios
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuración de cobros */}
                <div className='card mb-4'>
                  <div
                    className='card-header'
                    style={{ backgroundColor: '#f9f9f9' }}
                  >
                    <h5 className='mb-0'>Configuración de Cobros</h5>
                  </div>
                  <div className='card-body'>
                    <div className='mb-3'>
                      <label className='form-label d-block'>
                        ¿Tiene gastos específicos por torre?
                      </label>
                      <div className='form-check form-check-inline'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='gastosEspecificos'
                          id='gastosNo'
                          value='no'
                          checked={formData.gastosEspecificos === 'no'}
                          onChange={e =>
                            handleInputChange(
                              'gastosEspecificos',
                              e.target.value as 'si' | 'no',
                            )
                          }
                        />
                        <label className='form-check-label' htmlFor='gastosNo'>
                          No
                        </label>
                      </div>
                      <div className='form-check form-check-inline'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='gastosEspecificos'
                          id='gastosSi'
                          value='si'
                          checked={formData.gastosEspecificos === 'si'}
                          onChange={e =>
                            handleInputChange(
                              'gastosEspecificos',
                              e.target.value as 'si' | 'no',
                            )
                          }
                        />
                        <label className='form-check-label' htmlFor='gastosSi'>
                          Sí
                        </label>
                      </div>
                      <div className='form-text'>
                        Si la torre tiene gastos separados del resto del
                        edificio
                      </div>
                    </div>

                    <div className='mb-3'>
                      <label htmlFor='coeficienteTorre' className='form-label'>
                        Coeficiente de Torre
                      </label>
                      <div className='input-group'>
                        <input
                          type='number'
                          className={`form-control ${errors.coeficienteTorre ? 'is-invalid' : ''}`}
                          id='coeficienteTorre'
                          step='0.000001'
                          min='0'
                          max='1'
                          value={formData.coeficienteTorre}
                          onChange={e =>
                            handleInputChange(
                              'coeficienteTorre',
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          required={formData.gastosEspecificos === 'si'}
                        />
                        <span className='input-group-text'>%</span>
                        {errors.coeficienteTorre && (
                          <div className='invalid-feedback'>
                            {errors.coeficienteTorre}
                          </div>
                        )}
                      </div>
                      <div className='form-text'>
                        Coeficiente de participación de la torre en el edificio
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='col-lg-4'>
                {/* Imagen de la torre */}
                <div className='card mb-4'>
                  <div
                    className='card-header'
                    style={{ backgroundColor: '#f9f9f9' }}
                  >
                    <h5 className='mb-0'>Imagen de la Torre</h5>
                  </div>
                  <div className='card-body'>
                    <div className='mb-4'>
                      <label className='form-label'>
                        Imagen Representativa
                      </label>
                      <div
                        className='border-2 border-dashed rounded p-4 text-center'
                        style={{
                          borderColor: '#ddd',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          backgroundColor: imagePreview
                            ? 'transparent'
                            : '#f8f9fa',
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        onMouseEnter={e => {
                          if (!imagePreview)
                            {e.currentTarget.style.borderColor =
                              'var(--color-primary)';}
                        }}
                        onMouseLeave={e => {
                          if (!imagePreview)
                            {e.currentTarget.style.borderColor = '#ddd';}
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Haz clic para seleccionar imagen"
                      >
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt='Preview'
                            className='img-fluid rounded'
                            width={300}
                            height={200}
                            style={{ maxHeight: '200px', width: 'auto' }}
                          />
                        ) : (
                          <>
                            <i
                              className='material-icons mb-2'
                              style={{ fontSize: '48px', color: '#aaa' }}
                            >
                              add_photo_alternate
                            </i>
                            <p className='mb-1'>
                              Arrastrar imagen o hacer clic para subir
                            </p>
                            <p className='small text-muted mb-0'>
                              PNG, JPG hasta 5MB
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type='file'
                        className='d-none'
                        ref={fileInputRef}
                        accept='image/*'
                        onChange={handleImageUpload}
                      />
                      {errors.imagen && (
                        <div className='text-danger small mt-1'>
                          {errors.imagen}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Estado y configuración */}
                <div className='card mb-4'>
                  <div
                    className='card-header'
                    style={{ backgroundColor: '#f9f9f9' }}
                  >
                    <h5 className='mb-0'>Estado y Configuración</h5>
                  </div>
                  <div className='card-body'>
                    <div className='form-check form-switch mb-3'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        id='torreActiva'
                        checked={formData.activa}
                        onChange={e =>
                          handleInputChange('activa', e.target.checked)
                        }
                      />
                      <label className='form-check-label' htmlFor='torreActiva'>
                        Torre Activa
                      </label>
                    </div>
                    <div className='form-check form-switch mb-3'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        id='visibleEnPortal'
                        checked={formData.visibleEnPortal}
                        onChange={e =>
                          handleInputChange('visibleEnPortal', e.target.checked)
                        }
                      />
                      <label
                        className='form-check-label'
                        htmlFor='visibleEnPortal'
                      >
                        Visible en portal público
                      </label>
                    </div>
                    <div className='form-check form-switch mb-3'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        id='facturacionIndependiente'
                        checked={formData.facturacionIndependiente}
                        onChange={e =>
                          handleInputChange(
                            'facturacionIndependiente',
                            e.target.checked,
                          )
                        }
                      />
                      <label
                        className='form-check-label'
                        htmlFor='facturacionIndependiente'
                      >
                        Facturación independiente
                      </label>
                      <div className='form-text'>
                        La torre gestiona sus gastos de forma independiente
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                <div className='card mb-4'>
                  <div
                    className='card-header'
                    style={{ backgroundColor: '#f9f9f9' }}
                  >
                    <h5 className='mb-0'>Observaciones</h5>
                  </div>
                  <div className='card-body'>
                    <div className='mb-3'>
                      <label htmlFor='observaciones' className='form-label'>
                        Notas adicionales
                      </label>
                      <textarea
                        className='form-control'
                        id='observaciones'
                        rows={4}
                        value={formData.observaciones}
                        onChange={e =>
                          handleInputChange('observaciones', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Acciones finales */}
                <div className='d-flex justify-content-between mb-4'>
                  <Link href='/torres' className='btn btn-outline-secondary'>
                    Cancelar
                  </Link>
                  <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-2'></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className='material-icons me-1'>save</i>
                        Guardar Torre
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

