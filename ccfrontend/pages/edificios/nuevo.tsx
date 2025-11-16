import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import {
  useEdificios,
  useEdificioForm,
  useEdificiosUtils,
} from '@/hooks/useEdificios';
import { ProtectedRoute } from '@/lib/useAuth';
import { Permission, usePermissions } from '@/lib/usePermissions';
import {
  EdificioFormData,
  TIPOS_EDIFICIO,
  SERVICIOS_DISPONIBLES,
  AMENIDADES_DISPONIBLES,
} from '@/types/edificios';

export default function EdificioNuevo() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { hasPermission } = usePermissions();

  // Validar permisos al cargar
  useEffect(() => {
    if (!hasPermission(Permission.CREATE_EDIFICIO)) {
      router.push('/edificios');
    }
  }, [hasPermission, router]);

  // Hooks personalizados
  const { createEdificio, loading, error } = useEdificios();
  const { getComunidadesOpciones } = useEdificiosUtils();
  const { formData, errors, updateField, touchField, validate, reset } =
    useEdificioForm();

  // Estado local para comunidades
  const [comunidades, setComunidades] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // Cargar comunidades al montar el componente
  useEffect(() => {
    const loadComunidades = async () => {
      const opciones = await getComunidadesOpciones();
      setComunidades(opciones);
    };
    loadComunidades();
  }, [getComunidadesOpciones]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      updateField(
        name as keyof EdificioFormData,
        value === '' ? undefined : Number(value),
      );
    } else {
      updateField(name as keyof EdificioFormData, value);
    }

    touchField(name as keyof EdificioFormData);
  };

  const handleCheckboxChange = (
    type: 'servicios' | 'amenidades',
    value: string,
    checked: boolean,
  ) => {
    const currentValues = formData[type] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(item => item !== value);

    updateField(type, newValues);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateField('imagen', file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const success = await createEdificio(formData);
      if (success) {
        router.push('/edificios');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al crear edificio:', error);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nuevo Edificio — Cuentas Claras</title>
      </Head>

      <Layout title='Crear Nuevo Edificio'>
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
              <li className='breadcrumb-item active'>Nuevo Edificio</li>
            </ol>
          </nav>

          {/* Mostrar errores */}
          {error && (
            <div className='alert alert-danger' role='alert'>
              <i className='material-icons me-2'>error</i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className='row'>
              <div className='col-lg-8'>
                {/* Información básica */}
                <div className='form-section mb-4'>
                  <div className='form-section-header'>
                    <h5 className='mb-0'>
                      <i className='material-icons me-2'>info</i>
                      Información Básica
                    </h5>
                  </div>
                  <div className='form-section-body'>
                    <div className='row'>
                      <div className='col-md-8 mb-3'>
                        <label htmlFor='nombre' className='form-label'>
                          Nombre del Edificio{' '}
                          <span className='text-danger'>*</span>
                        </label>
                        <input
                          type='text'
                          className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                          id='nombre'
                          name='nombre'
                          value={formData.nombre}
                          onChange={handleInputChange}
                          placeholder='Ej: Torre Azul'
                        />
                        {errors.nombre && (
                          <div className='invalid-feedback'>
                            {errors.nombre}
                          </div>
                        )}
                      </div>
                      <div className='col-md-4 mb-3'>
                        <label htmlFor='codigo' className='form-label'>
                          Código
                        </label>
                        <input
                          type='text'
                          className='form-control'
                          id='codigo'
                          name='codigo'
                          value={formData.codigo}
                          onChange={handleInputChange}
                          placeholder='Ej: TA-001'
                        />
                      </div>
                    </div>

                    <div className='mb-3'>
                      <label htmlFor='direccion' className='form-label'>
                        Dirección <span className='text-danger'>*</span>
                      </label>
                      <input
                        type='text'
                        className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                        id='direccion'
                        name='direccion'
                        value={formData.direccion}
                        onChange={handleInputChange}
                        placeholder='Ej: Calle 85 # 15-32, Chapinero'
                      />
                      {errors.direccion && (
                        <div className='invalid-feedback'>
                          {errors.direccion}
                        </div>
                      )}
                    </div>

                    <div className='row'>
                      <div className='col-md-6 mb-3'>
                        <label htmlFor='comunidadId' className='form-label'>
                          Comunidad <span className='text-danger'>*</span>
                        </label>
                        <select
                          className={`form-select ${errors.comunidadId ? 'is-invalid' : ''}`}
                          id='comunidadId'
                          name='comunidadId'
                          value={formData.comunidadId}
                          onChange={handleInputChange}
                        >
                          <option value=''>Seleccionar comunidad</option>
                          {comunidades.map(comunidad => (
                            <option
                              key={comunidad.value}
                              value={comunidad.value}
                            >
                              {comunidad.label}
                            </option>
                          ))}
                        </select>
                        {errors.comunidadId && (
                          <div className='invalid-feedback'>
                            {errors.comunidadId}
                          </div>
                        )}
                      </div>
                      <div className='col-md-6 mb-3'>
                        <label htmlFor='tipo' className='form-label'>
                          Tipo de Edificio
                        </label>
                        <select
                          className='form-select'
                          id='tipo'
                          name='tipo'
                          value={formData.tipo}
                          onChange={handleInputChange}
                        >
                          {TIPOS_EDIFICIO.map(tipo => (
                            <option key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles del edificio */}
                <div className='form-section mb-4'>
                  <div className='form-section-header'>
                    <h5 className='mb-0'>
                      <i className='material-icons me-2'>business</i>
                      Detalles del Edificio
                    </h5>
                  </div>
                  <div className='form-section-body'>
                    <div className='row'>
                      <div className='col-md-4 mb-3'>
                        <label
                          htmlFor='anoConstructccion'
                          className='form-label'
                        >
                          Año de Construcción
                        </label>
                        <input
                          type='number'
                          className='form-control'
                          id='anoConstructccion'
                          name='anoConstructccion'
                          value={formData.anoConstructccion || ''}
                          onChange={handleInputChange}
                          min='1900'
                          max={new Date().getFullYear() + 10}
                        />
                      </div>
                      <div className='col-md-4 mb-3'>
                        <label htmlFor='numeroTorres' className='form-label'>
                          Número de Torres{' '}
                          <span className='text-danger'>*</span>
                        </label>
                        <input
                          type='number'
                          className={`form-control ${errors.numeroTorres ? 'is-invalid' : ''}`}
                          id='numeroTorres'
                          name='numeroTorres'
                          value={formData.numeroTorres}
                          onChange={handleInputChange}
                          min='1'
                        />
                        {errors.numeroTorres && (
                          <div className='invalid-feedback'>
                            {errors.numeroTorres}
                          </div>
                        )}
                      </div>
                      <div className='col-md-4 mb-3'>
                        <label htmlFor='pisos' className='form-label'>
                          Número de Pisos <span className='text-danger'>*</span>
                        </label>
                        <input
                          type='number'
                          className={`form-control ${errors.pisos ? 'is-invalid' : ''}`}
                          id='pisos'
                          name='pisos'
                          value={formData.pisos}
                          onChange={handleInputChange}
                          min='1'
                        />
                        {errors.pisos && (
                          <div className='invalid-feedback'>{errors.pisos}</div>
                        )}
                      </div>
                    </div>

                    <div className='row'>
                      <div className='col-md-3 mb-3'>
                        <label htmlFor='areaComun' className='form-label'>
                          Área Común (m²)
                        </label>
                        <input
                          type='number'
                          className='form-control'
                          id='areaComun'
                          name='areaComun'
                          value={formData.areaComun || ''}
                          onChange={handleInputChange}
                          min='0'
                          step='0.01'
                        />
                      </div>
                      <div className='col-md-3 mb-3'>
                        <label htmlFor='areaPrivada' className='form-label'>
                          Área Privada (m²)
                        </label>
                        <input
                          type='number'
                          className='form-control'
                          id='areaPrivada'
                          name='areaPrivada'
                          value={formData.areaPrivada || ''}
                          onChange={handleInputChange}
                          min='0'
                          step='0.01'
                        />
                      </div>
                      <div className='col-md-3 mb-3'>
                        <label htmlFor='parqueaderos' className='form-label'>
                          Parqueaderos
                        </label>
                        <input
                          type='number'
                          className='form-control'
                          id='parqueaderos'
                          name='parqueaderos'
                          value={formData.parqueaderos || ''}
                          onChange={handleInputChange}
                          min='0'
                        />
                      </div>
                      <div className='col-md-3 mb-3'>
                        <label htmlFor='depositos' className='form-label'>
                          Depósitos
                        </label>
                        <input
                          type='number'
                          className='form-control'
                          id='depositos'
                          name='depositos'
                          value={formData.depositos || ''}
                          onChange={handleInputChange}
                          min='0'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de contacto */}
                <div className='form-section mb-4'>
                  <div className='form-section-header'>
                    <h5 className='mb-0'>
                      <i className='material-icons me-2'>person</i>
                      Información de Contacto
                    </h5>
                  </div>
                  <div className='form-section-body'>
                    <div className='row'>
                      <div className='col-md-4 mb-3'>
                        <label htmlFor='administrador' className='form-label'>
                          Administrador
                        </label>
                        <input
                          type='text'
                          className='form-control'
                          id='administrador'
                          name='administrador'
                          value={formData.administrador}
                          onChange={handleInputChange}
                          placeholder='Nombre del administrador'
                        />
                      </div>
                      <div className='col-md-4 mb-3'>
                        <label
                          htmlFor='telefonoAdministrador'
                          className='form-label'
                        >
                          Teléfono
                        </label>
                        <input
                          type='tel'
                          className='form-control'
                          id='telefonoAdministrador'
                          name='telefonoAdministrador'
                          value={formData.telefonoAdministrador}
                          onChange={handleInputChange}
                          placeholder='+57 300 123 4567'
                        />
                      </div>
                      <div className='col-md-4 mb-3'>
                        <label
                          htmlFor='emailAdministrador'
                          className='form-label'
                        >
                          Email
                        </label>
                        <input
                          type='email'
                          className={`form-control ${errors.emailAdministrador ? 'is-invalid' : ''}`}
                          id='emailAdministrador'
                          name='emailAdministrador'
                          value={formData.emailAdministrador}
                          onChange={handleInputChange}
                          placeholder='admin@example.com'
                        />
                        {errors.emailAdministrador && (
                          <div className='invalid-feedback'>
                            {errors.emailAdministrador}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Servicios */}
                <div className='form-section mb-4'>
                  <div className='form-section-header'>
                    <h5 className='mb-0'>
                      <i className='material-icons me-2'>build</i>
                      Servicios Disponibles
                    </h5>
                  </div>
                  <div className='form-section-body'>
                    <div className='row'>
                      {SERVICIOS_DISPONIBLES.map(servicio => (
                        <div key={servicio.value} className='col-md-3 mb-2'>
                          <div className='form-check'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              id={`servicio-${servicio.value}`}
                              checked={(formData.servicios || []).includes(
                                servicio.value,
                              )}
                              onChange={e =>
                                handleCheckboxChange(
                                  'servicios',
                                  servicio.value,
                                  e.target.checked,
                                )
                              }
                            />
                            <label
                              className='form-check-label'
                              htmlFor={`servicio-${servicio.value}`}
                            >
                              {servicio.label}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Amenidades */}
                <div className='form-section mb-4'>
                  <div className='form-section-header'>
                    <h5 className='mb-0'>
                      <i className='material-icons me-2'>pool</i>
                      Amenidades
                    </h5>
                  </div>
                  <div className='form-section-body'>
                    <div className='row'>
                      {AMENIDADES_DISPONIBLES.map(amenidad => (
                        <div key={amenidad.value} className='col-md-3 mb-2'>
                          <div className='form-check'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              id={`amenidad-${amenidad.value}`}
                              checked={(formData.amenidades || []).includes(
                                amenidad.value,
                              )}
                              onChange={e =>
                                handleCheckboxChange(
                                  'amenidades',
                                  amenidad.value,
                                  e.target.checked,
                                )
                              }
                            />
                            <label
                              className='form-check-label'
                              htmlFor={`amenidad-${amenidad.value}`}
                            >
                              {amenidad.label}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className='col-lg-4'>
                {/* Imagen del edificio */}
                <div className='form-section mb-4'>
                  <div className='form-section-header'>
                    <h5 className='mb-0'>
                      <i className='material-icons me-2'>image</i>
                      Imagen del Edificio
                    </h5>
                  </div>
                  <div className='form-section-body'>
                    <div
                      className='upload-area'
                      onClick={handleImageClick}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleImageClick();
                        }
                      }}
                      role='button'
                      tabIndex={0}
                    >
                      {imagePreview ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={imagePreview}
                          alt='Preview'
                          className='img-fluid rounded'
                          style={{ maxHeight: '200px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className='text-center py-4'>
                          <i
                            className='material-icons mb-2'
                            style={{ fontSize: '48px', color: '#ddd' }}
                          >
                            add_a_photo
                          </i>
                          <div className='text-muted'>
                            <div>Haz clic para subir una imagen</div>
                            <small>PNG, JPG hasta 5MB</small>
                          </div>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/*'
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                <div className='form-section mb-4'>
                  <div className='form-section-header'>
                    <h5 className='mb-0'>
                      <i className='material-icons me-2'>location_on</i>
                      Ubicación
                    </h5>
                  </div>
                  <div className='form-section-body'>
                    <div className='row'>
                      <div className='col-6 mb-3'>
                        <label htmlFor='latitud' className='form-label'>
                          Latitud
                        </label>
                        <input
                          type='number'
                          className='form-control'
                          id='latitud'
                          name='latitud'
                          value={formData.latitud || ''}
                          onChange={handleInputChange}
                          step='any'
                          placeholder='4.6097'
                        />
                      </div>
                      <div className='col-6 mb-3'>
                        <label htmlFor='longitud' className='form-label'>
                          Longitud
                        </label>
                        <input
                          type='number'
                          className='form-control'
                          id='longitud'
                          name='longitud'
                          value={formData.longitud || ''}
                          onChange={handleInputChange}
                          step='any'
                          placeholder='-74.0817'
                        />
                      </div>
                    </div>
                    <div className='map-container'>
                      <div className='d-flex align-items-center justify-content-center h-100 text-muted'>
                        <div className='text-center'>
                          <i
                            className='material-icons mb-2'
                            style={{ fontSize: '48px' }}
                          >
                            map
                          </i>
                          <div>Mapa interactivo</div>
                          <small>Próximamente</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                <div className='form-section mb-4'>
                  <div className='form-section-header'>
                    <h5 className='mb-0'>
                      <i className='material-icons me-2'>notes</i>
                      Observaciones
                    </h5>
                  </div>
                  <div className='form-section-body'>
                    <textarea
                      className='form-control'
                      id='observaciones'
                      name='observaciones'
                      rows={4}
                      value={formData.observaciones}
                      onChange={handleInputChange}
                      placeholder='Observaciones adicionales sobre el edificio...'
                    />
                  </div>
                </div>

                {/* Botones de acción */}
                <div className='d-grid gap-2'>
                  <button
                    type='submit'
                    className='btn btn-primary btn-lg'
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div
                          className='spinner-border spinner-border-sm me-2'
                          role='status'
                        >
                          <span className='visually-hidden'>Loading...</span>
                        </div>
                        Creando Edificio...
                      </>
                    ) : (
                      <>
                        <i className='material-icons me-2'>save</i>
                        Crear Edificio
                      </>
                    )}
                  </button>
                  <Link href='/edificios' className='btn btn-outline-secondary'>
                    <i className='material-icons me-2'>arrow_back</i>
                    Cancelar
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>

        <style jsx>{`
          .form-section {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }

          .form-section-header {
            padding: 1rem;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            background-color: #f9f9f9;
          }

          .form-section-body {
            padding: 1.5rem;
          }

          .upload-area {
            border: 2px dashed #ddd;
            border-radius: 8px;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .upload-area:hover {
            border-color: var(--bs-primary);
            background-color: rgba(13, 110, 253, 0.02);
          }

          .map-container {
            height: 200px;
            background-color: #f8f9fa;
            border-radius: 8px;
            overflow: hidden;
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}
