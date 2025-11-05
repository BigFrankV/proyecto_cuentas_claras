import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';

import Layout from '@/components/layout/Layout';
import {
  useEdificios,
  useEdificioForm,
  useEdificiosUtils,
} from '@/hooks/useEdificios';
import { ProtectedRoute } from '@/lib/useAuth';
import {
  Edificio,
  EdificioFormData,
  TIPOS_EDIFICIO,
  SERVICIOS_DISPONIBLES,
  AMENIDADES_DISPONIBLES,
} from '@/types/edificios';

export default function EdificioEditar() {
  const router = useRouter();
  const { id } = router.query;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [edificio, setEdificio] = useState<Edificio | null>(null);

  // Hooks personalizados
  const { getEdificioById, updateEdificio, loading, error } = useEdificios();
  const { getComunidadesOpciones } = useEdificiosUtils();
  const { formData, errors, updateField, touchField, validate } =
    useEdificioForm();

  // Estado local para comunidades
  const [comunidades, setComunidades] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [loadingData, setLoadingData] = useState(true);

  // Cargar datos del edificio y comunidades
  useEffect(() => {
    const loadData = async () => {
      if (id && typeof id === 'string') {
        try {
          const [edificioData, opciones] = await Promise.all([
            getEdificioById(id),
            getComunidadesOpciones(),
          ]);

          if (edificioData) {
            setEdificio(edificioData);

            // Llenar el formulario con los datos existentes
            // eslint-disable-next-line no-console
            console.log('Datos recibidos del edificio:', edificioData);

            // Cargar campos básicos
            updateField('nombre', edificioData.nombre);
            updateField('codigo', edificioData.codigo);
            updateField('direccion', edificioData.direccion);
            updateField('comunidadId', edificioData.comunidadId);
            updateField('tipo', edificioData.tipo);
            updateField('pisos', edificioData.pisos);
            updateField('anoConstructccion', edificioData.anoConstructccion);
            updateField('areaComun', edificioData.areaComun);
            updateField('areaPrivada', edificioData.areaPrivada);
            updateField('parqueaderos', edificioData.parqueaderos);
            updateField('depositos', edificioData.depositos);
            updateField('administrador', edificioData.administrador);
            updateField(
              'telefonoAdministrador',
              edificioData.telefonoAdministrador,
            );
            updateField('emailAdministrador', edificioData.emailAdministrador);
            updateField('latitud', edificioData.latitud);
            updateField('longitud', edificioData.longitud);
            updateField('observaciones', edificioData.observaciones);

            // Manejar servicios y amenidades específicamente
            if (edificioData.servicios) {
              // eslint-disable-next-line no-console
              console.log(
                'Servicios recibidos:',
                edificioData.servicios,
                typeof edificioData.servicios,
              );
              updateField(
                'servicios',
                Array.isArray(edificioData.servicios)
                  ? edificioData.servicios
                  : [],
              );
            } else {
              updateField('servicios', []);
            }

            if (edificioData.amenidades) {
              // eslint-disable-next-line no-console
              console.log(
                'Amenidades recibidas:',
                edificioData.amenidades,
                typeof edificioData.amenidades,
              );
              updateField(
                'amenidades',
                Array.isArray(edificioData.amenidades)
                  ? edificioData.amenidades
                  : [],
              );
            } else {
              updateField('amenidades', []);
            }

            // Establecer preview de imagen si existe
            if (edificioData.imagen) {
              setImagePreview(edificioData.imagen);
            }
          }

          setComunidades(opciones);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error cargando datos:', error);
        } finally {
          setLoadingData(false);
        }
      }
    };

    loadData();
  }, [id, getEdificioById, getComunidadesOpciones, updateField]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    touchField(name as keyof EdificioFormData);

    if (type === 'number') {
      updateField(
        name as keyof EdificioFormData,
        value === '' ? undefined : Number(value),
      );
    } else {
      updateField(name as keyof EdificioFormData, value);
    }
  };

  const handleCheckboxChange = (
    type: 'servicios' | 'amenidades',
    value: string,
    checked: boolean,
  ) => {
    const currentArray = formData[type] || [];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);

    updateField(type, newArray);
    touchField(type);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateField('imagen', file);
      touchField('imagen');

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

    if (!id || typeof id !== 'string') {
      return;
    }

    try {
      await updateEdificio(id, formData);
      router.push('/edificios');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error actualizando edificio:', error);
    }
  };

  if (loadingData) {
    return (
      <ProtectedRoute>
        <Layout title='Cargando...'>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ height: '400px' }}
          >
            <div className='text-center'>
              <div className='spinner-border text-primary mb-3' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <div>Cargando información del edificio...</div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!edificio) {
    return (
      <ProtectedRoute>
        <Layout title='Edificio no encontrado'>
          <div className='text-center py-5'>
            <i
              className='material-icons mb-3'
              style={{ fontSize: '64px', color: '#ddd' }}
            >
              error
            </i>
            <h3>Edificio no encontrado</h3>
            <p className='text-muted'>
              El edificio que intentas editar no existe o no tienes permisos
              para acceder a él.
            </p>
            <Link href='/edificios' className='btn btn-primary'>
              Volver al listado
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Editar {edificio.nombre} — Cuentas Claras</title>
      </Head>

      <Layout title={`Editar ${edificio.nombre}`}>
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
                <Link href={`/edificios/${id}`}>{edificio.nombre}</Link>
              </li>
              <li className='breadcrumb-item active'>Editar</li>
            </ol>
          </nav>

          {/* Información del edificio */}
          <div className='alert alert-info d-flex align-items-center mb-4'>
            <i className='material-icons me-2'>info</i>
            <div>
              <strong>Editando:</strong> {edificio.nombre}
              <small className='text-muted ms-2'>({edificio.codigo})</small>
            </div>
          </div>

          {/* Formulario */}
          <div className='card'>
            <div className='card-header'>
              <h5 className='card-title mb-0'>
                <i className='material-icons me-2'>edit</i>
                Información del Edificio
              </h5>
            </div>
            <div className='card-body'>
              <form onSubmit={handleSubmit} className='row g-3'>
                {/* Información Básica */}
                <div className='col-12'>
                  <h6 className='fw-bold text-primary mb-3'>
                    <i
                      className='material-icons me-2'
                      style={{ fontSize: '18px' }}
                    >
                      info
                    </i>
                    Información Básica
                  </h6>
                </div>

                <div className='row'>
                  <div className='col-md-6 mb-3'>
                    <label htmlFor='nombre' className='form-label'>
                      Nombre del Edificio *
                    </label>
                    <input
                      type='text'
                      className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                      id='nombre'
                      name='nombre'
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder='Ej: Torre Central'
                    />
                    {errors.nombre && (
                      <div className='invalid-feedback'>{errors.nombre}</div>
                    )}
                  </div>

                  <div className='col-md-6 mb-3'>
                    <label htmlFor='codigo' className='form-label'>
                      Código
                    </label>
                    <input
                      type='text'
                      className={`form-control ${errors.codigo ? 'is-invalid' : ''}`}
                      id='codigo'
                      name='codigo'
                      value={formData.codigo || ''}
                      onChange={handleInputChange}
                      placeholder='Ej: TC-001'
                    />
                    {errors.codigo && (
                      <div className='invalid-feedback'>{errors.codigo}</div>
                    )}
                  </div>
                </div>

                <div className='row'>
                  <div className='col-md-12 mb-3'>
                    <label htmlFor='direccion' className='form-label'>
                      Dirección *
                    </label>
                    <input
                      type='text'
                      className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                      id='direccion'
                      name='direccion'
                      value={formData.direccion}
                      onChange={handleInputChange}
                      placeholder='Ej: Calle 123 #45-67, Barrio Central'
                    />
                    {errors.direccion && (
                      <div className='invalid-feedback'>{errors.direccion}</div>
                    )}
                  </div>
                </div>

                <div className='row'>
                  <div className='col-md-6 mb-3'>
                    <label htmlFor='comunidadId' className='form-label'>
                      Comunidad *
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
                        <option key={comunidad.value} value={comunidad.value}>
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
                      className={`form-select ${errors.tipo ? 'is-invalid' : ''}`}
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
                    {errors.tipo && (
                      <div className='invalid-feedback'>{errors.tipo}</div>
                    )}
                  </div>
                </div>

                {/* Información Estructural */}
                <div className='col-12 mt-4'>
                  <h6 className='fw-bold text-primary mb-3'>
                    <i
                      className='material-icons me-2'
                      style={{ fontSize: '18px' }}
                    >
                      apartment
                    </i>
                    Información Estructural
                  </h6>
                </div>

                <div className='row'>
                  <div className='col-md-4 mb-3'>
                    <label htmlFor='numeroTorres' className='form-label'>
                      Número de Torres *
                    </label>
                    <input
                      type='number'
                      className={`form-control ${errors.numeroTorres ? 'is-invalid' : ''}`}
                      id='numeroTorres'
                      name='numeroTorres'
                      value={formData.numeroTorres || ''}
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
                      Número de Pisos *
                    </label>
                    <input
                      type='number'
                      className={`form-control ${errors.pisos ? 'is-invalid' : ''}`}
                      id='pisos'
                      name='pisos'
                      value={formData.pisos || ''}
                      onChange={handleInputChange}
                      min='1'
                    />
                    {errors.pisos && (
                      <div className='invalid-feedback'>{errors.pisos}</div>
                    )}
                  </div>

                  <div className='col-md-4 mb-3'>
                    <label htmlFor='anoConstructccion' className='form-label'>
                      Año de Construcción
                    </label>
                    <input
                      type='number'
                      className={`form-control ${errors.anoConstructccion ? 'is-invalid' : ''}`}
                      id='anoConstructccion'
                      name='anoConstructccion'
                      value={formData.anoConstructccion || ''}
                      onChange={handleInputChange}
                      min='1900'
                      max={new Date().getFullYear()}
                    />
                    {errors.anoConstructccion && (
                      <div className='invalid-feedback'>
                        {errors.anoConstructccion}
                      </div>
                    )}
                  </div>
                </div>

                {/* Áreas */}
                <div className='row'>
                  <div className='col-md-3 mb-3'>
                    <label htmlFor='areaComun' className='form-label'>
                      Área Común (m²)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      className={`form-control ${errors.areaComun ? 'is-invalid' : ''}`}
                      id='areaComun'
                      name='areaComun'
                      value={formData.areaComun || ''}
                      onChange={handleInputChange}
                      min='0'
                    />
                    {errors.areaComun && (
                      <div className='invalid-feedback'>{errors.areaComun}</div>
                    )}
                  </div>

                  <div className='col-md-3 mb-3'>
                    <label htmlFor='areaPrivada' className='form-label'>
                      Área Privada (m²)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      className={`form-control ${errors.areaPrivada ? 'is-invalid' : ''}`}
                      id='areaPrivada'
                      name='areaPrivada'
                      value={formData.areaPrivada || ''}
                      onChange={handleInputChange}
                      min='0'
                    />
                    {errors.areaPrivada && (
                      <div className='invalid-feedback'>
                        {errors.areaPrivada}
                      </div>
                    )}
                  </div>

                  <div className='col-md-3 mb-3'>
                    <label htmlFor='parqueaderos' className='form-label'>
                      Parqueaderos
                    </label>
                    <input
                      type='number'
                      className={`form-control ${errors.parqueaderos ? 'is-invalid' : ''}`}
                      id='parqueaderos'
                      name='parqueaderos'
                      value={formData.parqueaderos || ''}
                      onChange={handleInputChange}
                      min='0'
                    />
                    {errors.parqueaderos && (
                      <div className='invalid-feedback'>
                        {errors.parqueaderos}
                      </div>
                    )}
                  </div>

                  <div className='col-md-3 mb-3'>
                    <label htmlFor='depositos' className='form-label'>
                      Depósitos
                    </label>
                    <input
                      type='number'
                      className={`form-control ${errors.depositos ? 'is-invalid' : ''}`}
                      id='depositos'
                      name='depositos'
                      value={formData.depositos || ''}
                      onChange={handleInputChange}
                      min='0'
                    />
                    {errors.depositos && (
                      <div className='invalid-feedback'>{errors.depositos}</div>
                    )}
                  </div>
                </div>

                {/* Servicios */}
                <div className='col-12 mt-4'>
                  <h6 className='fw-bold text-primary mb-3'>
                    <i
                      className='material-icons me-2'
                      style={{ fontSize: '18px' }}
                    >
                      build
                    </i>
                    Servicios Disponibles
                  </h6>
                  <div className='row'>
                    {SERVICIOS_DISPONIBLES.map(servicio => (
                      <div key={servicio.value} className='col-md-4 mb-2'>
                        <div className='form-check'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            id={`servicio-${servicio.value}`}
                            checked={
                              formData.servicios?.includes(servicio.value) ||
                              false
                            }
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

                {/* Amenidades */}
                <div className='col-12 mt-4'>
                  <h6 className='fw-bold text-primary mb-3'>
                    <i
                      className='material-icons me-2'
                      style={{ fontSize: '18px' }}
                    >
                      pool
                    </i>
                    Amenidades
                  </h6>
                  <div className='row'>
                    {AMENIDADES_DISPONIBLES.map(amenidad => (
                      <div key={amenidad.value} className='col-md-4 mb-2'>
                        <div className='form-check'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            id={`amenidad-${amenidad.value}`}
                            checked={
                              formData.amenidades?.includes(amenidad.value) ||
                              false
                            }
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

                {/* Información de Contacto */}
                <div className='col-12 mt-4'>
                  <h6 className='fw-bold text-primary mb-3'>
                    <i
                      className='material-icons me-2'
                      style={{ fontSize: '18px' }}
                    >
                      contact_phone
                    </i>
                    Información de Contacto
                  </h6>
                </div>

                <div className='row'>
                  <div className='col-md-4 mb-3'>
                    <label htmlFor='administrador' className='form-label'>
                      Administrador
                    </label>
                    <input
                      type='text'
                      className={`form-control ${errors.administrador ? 'is-invalid' : ''}`}
                      id='administrador'
                      name='administrador'
                      value={formData.administrador || ''}
                      onChange={handleInputChange}
                      placeholder='Nombre del administrador'
                    />
                    {errors.administrador && (
                      <div className='invalid-feedback'>
                        {errors.administrador}
                      </div>
                    )}
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
                      className={`form-control ${errors.telefonoAdministrador ? 'is-invalid' : ''}`}
                      id='telefonoAdministrador'
                      name='telefonoAdministrador'
                      value={formData.telefonoAdministrador || ''}
                      onChange={handleInputChange}
                      placeholder='Ej: +57 300 123 4567'
                    />
                    {errors.telefonoAdministrador && (
                      <div className='invalid-feedback'>
                        {errors.telefonoAdministrador}
                      </div>
                    )}
                  </div>

                  <div className='col-md-4 mb-3'>
                    <label htmlFor='emailAdministrador' className='form-label'>
                      Email
                    </label>
                    <input
                      type='email'
                      className={`form-control ${errors.emailAdministrador ? 'is-invalid' : ''}`}
                      id='emailAdministrador'
                      name='emailAdministrador'
                      value={formData.emailAdministrador || ''}
                      onChange={handleInputChange}
                      placeholder='admin@edificio.com'
                    />
                    {errors.emailAdministrador && (
                      <div className='invalid-feedback'>
                        {errors.emailAdministrador}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ubicación */}
                <div className='col-12 mt-4'>
                  <h6 className='fw-bold text-primary mb-3'>
                    <i
                      className='material-icons me-2'
                      style={{ fontSize: '18px' }}
                    >
                      location_on
                    </i>
                    Ubicación
                  </h6>
                </div>

                <div className='row'>
                  <div className='col-md-6 mb-3'>
                    <label htmlFor='latitud' className='form-label'>
                      Latitud
                    </label>
                    <input
                      type='number'
                      step='any'
                      className={`form-control ${errors.latitud ? 'is-invalid' : ''}`}
                      id='latitud'
                      name='latitud'
                      value={formData.latitud || ''}
                      onChange={handleInputChange}
                      placeholder='Ej: 4.6097'
                    />
                    {errors.latitud && (
                      <div className='invalid-feedback'>{errors.latitud}</div>
                    )}
                  </div>

                  <div className='col-md-6 mb-3'>
                    <label htmlFor='longitud' className='form-label'>
                      Longitud
                    </label>
                    <input
                      type='number'
                      step='any'
                      className={`form-control ${errors.longitud ? 'is-invalid' : ''}`}
                      id='longitud'
                      name='longitud'
                      value={formData.longitud || ''}
                      onChange={handleInputChange}
                      placeholder='Ej: -74.0817'
                    />
                    {errors.longitud && (
                      <div className='invalid-feedback'>{errors.longitud}</div>
                    )}
                  </div>
                </div>

                {/* Imagen */}
                <div className='col-12 mt-4'>
                  <h6 className='fw-bold text-primary mb-3'>
                    <i
                      className='material-icons me-2'
                      style={{ fontSize: '18px' }}
                    >
                      photo_camera
                    </i>
                    Imagen del Edificio
                  </h6>
                  <div className='row'>
                    <div className='col-md-8'>
                      <input
                        type='file'
                        ref={fileInputRef}
                        className='d-none'
                        accept='image/*'
                        onChange={handleImageChange}
                      />
                      <div
                        className='border-2 border-dashed border-secondary rounded p-4 text-center cursor-pointer hover-bg-light'
                        onClick={handleImageClick}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleImageClick();
                          }
                        }}
                        role='button'
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                      >
                        {imagePreview ? (
                          <div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imagePreview}
                              alt='Preview'
                              className='img-fluid mb-2'
                              style={{ maxHeight: '200px' }}
                            />
                            <p className='text-muted small mb-0'>
                              Haz clic para cambiar la imagen
                            </p>
                          </div>
                        ) : (
                          <div>
                            <i
                              className='material-icons text-muted mb-2'
                              style={{ fontSize: '48px' }}
                            >
                              add_photo_alternate
                            </i>
                            <p className='text-muted'>
                              Haz clic para subir una imagen del edificio
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                <div className='col-12 mt-4'>
                  <h6 className='fw-bold text-primary mb-3'>
                    <i
                      className='material-icons me-2'
                      style={{ fontSize: '18px' }}
                    >
                      notes
                    </i>
                    Observaciones
                  </h6>
                  <textarea
                    className={`form-control ${errors.observaciones ? 'is-invalid' : ''}`}
                    id='observaciones'
                    name='observaciones'
                    rows={3}
                    value={formData.observaciones || ''}
                    onChange={handleInputChange}
                    placeholder='Observaciones adicionales sobre el edificio...'
                  />
                  {errors.observaciones && (
                    <div className='invalid-feedback'>
                      {errors.observaciones}
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className='col-12 mt-4'>
                  <div className='d-flex gap-2'>
                    <button
                      type='submit'
                      className='btn btn-primary'
                      disabled={loading}
                    >
                      {loading && (
                        <span
                          className='spinner-border spinner-border-sm me-2'
                          role='status'
                        >
                          <span className='visually-hidden'>Cargando...</span>
                        </span>
                      )}
                      <i className='material-icons me-2'>save</i>
                      Guardar Cambios
                    </button>

                    <Link
                      href={`/edificios/${id}`}
                      className='btn btn-outline-secondary'
                    >
                      <i className='material-icons me-2'>cancel</i>
                      Cancelar
                    </Link>

                    <Link href='/edificios' className='btn btn-outline-primary'>
                      <i className='material-icons me-2'>list</i>
                      Volver al Listado
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <style jsx>{`
          .cursor-pointer:hover {
            background-color: #f8f9fa !important;
          }
          .imagen-preview {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            overflow: hidden;
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}
