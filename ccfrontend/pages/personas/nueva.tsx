/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useRef } from 'react';

import Layout from '@/components/layout/Layout';
import { usePersonas } from '@/hooks/usePersonas';
import { ProtectedRoute } from '@/lib/useAuth';

interface FormData {
  tipo: 'Propietario' | 'Inquilino' | 'Administrador';
  nombre: string;
  apellido: string;
  tipoDoc: string;
  nroDoc: string;
  email: string;
  telefono: string;
  direccion: string;
  avatar?: File;
  crearCuenta: boolean;
  username: string;
  nivelAcceso: string;
  unidades: UnidadAsignada[];
}

interface UnidadAsignada {
  id: string;
  nombre: string;
  edificio: string;
  comunidad: string;
  relacion: 'Propietario' | 'Inquilino';
}

const tiposPersona = [
  {
    key: 'Propietario',
    icon: 'home_work',
    title: 'Propietario',
    description: 'Dueño de una o más unidades',
  },
  {
    key: 'Inquilino',
    icon: 'night_shelter',
    title: 'Inquilino',
    description: 'Habitante sin propiedad',
  },
  {
    key: 'Administrador',
    icon: 'admin_panel_settings',
    title: 'Administrador',
    description: 'Gestiona edificios o comunidades',
  },
];

const mockUnidades = [
  {
    id: '1',
    nombre: 'Departamento 4B',
    edificio: 'Torre Norte',
    comunidad: 'Parque Real',
  },
  {
    id: '2',
    nombre: 'Departamento 7A',
    edificio: 'Torre Sur',
    comunidad: 'Parque Real',
  },
  {
    id: '3',
    nombre: 'Casa 12',
    edificio: 'Barrio Residencial',
    comunidad: 'Valle Verde',
  },
];

export default function PersonaNueva() {
  const router = useRouter();
  const { crearPersona, validarCampo, loading, error } = usePersonas();
  const [formData, setFormData] = useState<FormData>({
    tipo: 'Propietario',
    nombre: '',
    apellido: '',
    tipoDoc: 'DNI',
    nroDoc: '',
    email: '',
    telefono: '',
    direccion: '',
    crearCuenta: true,
    username: '',
    nivelAcceso: 'Usuario Estándar',
    unidades: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = async (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Generar username automáticamente
    if (field === 'nombre' || field === 'apellido') {
      const nombre = field === 'nombre' ? value : formData.nombre;
      const apellido = field === 'apellido' ? value : formData.apellido;
      if (nombre && apellido) {
        const username =
          `${nombre.toLowerCase()}${apellido.toLowerCase().charAt(0)}`.replace(
            /\s+/g,
            '',
          );
        setFormData(prev => ({ ...prev, username }));
      }
    }

    // Validación en tiempo real para campos únicos
    if (field === 'nroDoc' && value) {
      try {
        const result = await validarCampo('rut', value);
        if (!result.valido) {
          setErrors(prev => ({
            ...prev,
            nroDoc: result.mensaje || 'RUT ya existe',
          }));
        } else {
          setErrors(prev => ({ ...prev, nroDoc: '' }));
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error validando RUT:', err);
      }
    }

    if (field === 'email' && value) {
      try {
        const result = await validarCampo('email', value);
        if (!result.valido) {
          setErrors(prev => ({
            ...prev,
            email: result.mensaje || 'Email ya existe',
          }));
        } else {
          setErrors(prev => ({ ...prev, email: '' }));
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error validando email:', err);
      }
    }

    if (field === 'username' && value && formData.crearCuenta) {
      try {
        const result = await validarCampo('username', value);
        if (!result.valido) {
          setErrors(prev => ({
            ...prev,
            username: result.mensaje || 'Username ya existe',
          }));
        } else {
          setErrors(prev => ({ ...prev, username: '' }));
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error validando username:', err);
      }
    }

    // Limpiar error si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, avatar: file }));
    }
  };

  const toggleUnidad = (unidad: (typeof mockUnidades)[0]) => {
    setFormData(prev => {
      const exists = prev.unidades.find(u => u.id === unidad.id);
      if (exists) {
        return {
          ...prev,
          unidades: prev.unidades.filter(u => u.id !== unidad.id),
        };
      } else {
        return {
          ...prev,
          unidades: [
            ...prev.unidades,
            {
              ...unidad,
              relacion:
                prev.tipo === 'Administrador' ? 'Propietario' : prev.tipo,
            },
          ],
        };
      }
    });
  };

  const updateUnidadRelacion = (
    unidadId: string,
    relacion: 'Propietario' | 'Inquilino',
  ) => {
    setFormData(prev => ({
      ...prev,
      unidades: prev.unidades.map(u =>
        u.id === unidadId ? { ...u, relacion } : u,
      ),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    }
    if (!formData.nroDoc.trim()) {
      newErrors.nroDoc = 'El número de documento es obligatorio';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (formData.tipo !== 'Administrador' && formData.unidades.length === 0) {
      newErrors.unidades = 'Debe seleccionar al menos una unidad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      // Preparar datos para la API
      const rutParts = formData.nroDoc.split('-');
      if (!rutParts[0]) {
        setErrors({ nroDoc: 'Formato de documento inválido' });
        return;
      }

      const personaData: any = {
        rut: rutParts[0],
        dv: rutParts[1] || '',
        nombres: formData.nombre,
        apellidos: formData.apellido,
      };

      // Agregar campos opcionales solo si tienen valor
      if (formData.email) {
        personaData.email = formData.email;
      }
      if (formData.telefono) {
        personaData.telefono = formData.telefono;
      }
      if (formData.direccion) {
        personaData.direccion = formData.direccion;
      }
      if (avatarPreview) {
        personaData.avatar = avatarPreview;
      }

      const nuevaPersona = await crearPersona(personaData);

      // Si se debe crear cuenta de usuario
      if (formData.crearCuenta && nuevaPersona.id) {
        // Aquí iría la lógica para crear usuario si la API lo soporta
        // eslint-disable-next-line no-console
        console.log('Usuario creado:', nuevaPersona);
      }

      // Redirigir a la lista o al detalle
      router.push('/personas');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al crear persona:', err);
      setErrors({ submit: 'Error al crear la persona. Intente nuevamente.' });
    }
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nueva Persona — Cuentas Claras</title>
      </Head>

      <Layout title='Nueva Persona'>
        <div className='container-fluid py-4'>
          {/* Mostrar error general */}
          {error && (
            <div
              className='alert alert-danger alert-dismissible fade show'
              role='alert'
            >
              <i className='material-icons me-2'>error</i>
              {error}
              <button
                type='button'
                className='btn-close'
                onClick={() => {
                  /* clear error */
                }}
              ></button>
            </div>
          )}

          {/* Mostrar error de submit */}
          {errors.submit && (
            <div
              className='alert alert-danger alert-dismissible fade show'
              role='alert'
            >
              <i className='material-icons me-2'>error</i>
              {errors.submit}
              <button
                type='button'
                className='btn-close'
                onClick={() => setErrors(prev => ({ ...prev, submit: '' }))}
              ></button>
            </div>
          )}
          <div className='row'>
            <div className='col-12'>
              {/* Header */}
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <div className='d-flex align-items-center'>
                  <Link
                    href='/personas'
                    className='btn btn-link text-secondary p-0 me-3'
                  >
                    <i className='material-icons'>arrow_back</i>
                  </Link>
                  <h1 className='h3 mb-0'>Nueva Persona</h1>
                </div>
                <div className='d-flex align-items-center'>
                  <Link
                    href='/personas'
                    className='btn btn-outline-secondary me-2'
                  >
                    Cancelar
                  </Link>
                  <button
                    type='button'
                    className='btn btn-primary'
                    onClick={handleSubmit}
                  >
                    Guardar
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Tipo de Persona */}
                <div className='card shadow-sm mb-4'>
                  <div className='card-header bg-transparent'>
                    <h6 className='mb-0'>Tipo de Persona</h6>
                  </div>
                  <div className='card-body'>
                    <div className='row g-3'>
                      {tiposPersona.map(tipo => (
                        <div key={tipo.key} className='col-12 col-md-4'>
                          <div
                            className={`card h-100 cursor-pointer ${
                              formData.tipo === tipo.key
                                ? 'border-primary bg-primary bg-opacity-10'
                                : ''
                            }`}
                            onClick={() => handleInputChange('tipo', tipo.key)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleInputChange('tipo', tipo.key);
                              }
                            }}
                            tabIndex={0}
                            role='button'
                            aria-label={`Seleccionar tipo ${tipo.title}`}
                            style={{
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              border:
                                formData.tipo === tipo.key
                                  ? '2px solid var(--color-primary)'
                                  : '1px solid var(--color-border)',
                            }}
                          >
                            <div className='card-body text-center'>
                              <div className='mb-3'>
                                <i
                                  className='material-icons'
                                  style={{
                                    fontSize: '48px',
                                    color:
                                      formData.tipo === tipo.key
                                        ? 'var(--color-primary)'
                                        : 'var(--color-muted)',
                                  }}
                                >
                                  {tipo.icon}
                                </i>
                              </div>
                              <h6 className='mb-2'>{tipo.title}</h6>
                              <p className='text-muted small mb-0'>
                                {tipo.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Información Personal */}
                <div className='card shadow-sm mb-4'>
                  <div className='card-header bg-transparent'>
                    <h6 className='mb-0'>Información Personal</h6>
                  </div>
                  <div className='card-body'>
                    <div className='row g-3'>
                      <div className='col-12 col-md-3'>
                        <div className='d-flex justify-content-center mb-3'>
                          <div
                            className='position-relative'
                            style={{ cursor: 'pointer' }}
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                fileInputRef.current?.click();
                              }
                            }}
                            tabIndex={0}
                            role='button'
                            aria-label='Seleccionar foto de perfil'
                          >
                            {avatarPreview ? (
                              <Image
                                src={avatarPreview}
                                alt='Avatar'
                                width={120}
                                height={120}
                                style={{
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <div
                                className={
                                  'd-flex align-items-center justify-content-center ' +
                                  'bg-light border border-2 border-dashed'
                                }
                                style={{
                                  width: '120px',
                                  height: '120px',
                                  borderRadius: '50%',
                                  color: 'var(--color-muted)',
                                }}
                              >
                                {formData.nombre && formData.apellido ? (
                                  <span
                                    style={{
                                      fontSize: '36px',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    {getInitials(
                                      formData.nombre,
                                      formData.apellido,
                                    )}
                                  </span>
                                ) : (
                                  <i
                                    className='material-icons'
                                    style={{ fontSize: '48px' }}
                                  >
                                    add_a_photo
                                  </i>
                                )}
                              </div>
                            )}
                            <input
                              ref={fileInputRef}
                              type='file'
                              accept='image/*'
                              onChange={handleAvatarUpload}
                              style={{ display: 'none' }}
                            />
                          </div>
                        </div>
                        <div className='text-center text-muted small'>
                          Foto de perfil (opcional)
                        </div>
                      </div>
                      <div className='col-12 col-md-9'>
                        <div className='row g-3'>
                          <div className='col-12 col-md-6'>
                            <label htmlFor='nombre' className='form-label'>
                              Nombre <span className='text-danger'>*</span>
                            </label>
                            <input
                              type='text'
                              className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                              id='nombre'
                              placeholder='Ingrese nombre'
                              value={formData.nombre}
                              onChange={e =>
                                handleInputChange('nombre', e.target.value)
                              }
                            />
                            {errors.nombre && (
                              <div className='invalid-feedback'>
                                {errors.nombre}
                              </div>
                            )}
                          </div>
                          <div className='col-12 col-md-6'>
                            <label htmlFor='apellido' className='form-label'>
                              Apellido <span className='text-danger'>*</span>
                            </label>
                            <input
                              type='text'
                              className={`form-control ${errors.apellido ? 'is-invalid' : ''}`}
                              id='apellido'
                              placeholder='Ingrese apellido'
                              value={formData.apellido}
                              onChange={e =>
                                handleInputChange('apellido', e.target.value)
                              }
                            />
                            {errors.apellido && (
                              <div className='invalid-feedback'>
                                {errors.apellido}
                              </div>
                            )}
                          </div>
                          <div className='col-12 col-md-6'>
                            <label htmlFor='tipoDoc' className='form-label'>
                              Tipo de Documento{' '}
                              <span className='text-danger'>*</span>
                            </label>
                            <select
                              className='form-select'
                              id='tipoDoc'
                              value={formData.tipoDoc}
                              onChange={e =>
                                handleInputChange('tipoDoc', e.target.value)
                              }
                            >
                              <option value='DNI'>DNI</option>
                              <option value='Pasaporte'>Pasaporte</option>
                              <option value='CUIT/CUIL'>CUIT/CUIL</option>
                              <option value='LC/LE'>LC/LE</option>
                            </select>
                          </div>
                          <div className='col-12 col-md-6'>
                            <label htmlFor='nroDoc' className='form-label'>
                              Número de Documento{' '}
                              <span className='text-danger'>*</span>
                            </label>
                            <input
                              type='text'
                              className={`form-control ${errors.nroDoc ? 'is-invalid' : ''}`}
                              id='nroDoc'
                              placeholder='Ingrese número de documento'
                              value={formData.nroDoc}
                              onChange={e =>
                                handleInputChange('nroDoc', e.target.value)
                              }
                            />
                            {errors.nroDoc && (
                              <div className='invalid-feedback'>
                                {errors.nroDoc}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className='card shadow-sm mb-4'>
                  <div className='card-header bg-transparent'>
                    <h6 className='mb-0'>Información de Contacto</h6>
                  </div>
                  <div className='card-body'>
                    <div className='row g-3'>
                      <div className='col-12 col-md-6'>
                        <label htmlFor='email' className='form-label'>
                          Email <span className='text-danger'>*</span>
                        </label>
                        <input
                          type='email'
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          id='email'
                          placeholder='Ingrese email'
                          value={formData.email}
                          onChange={e =>
                            handleInputChange('email', e.target.value)
                          }
                        />
                        {errors.email && (
                          <div className='invalid-feedback'>{errors.email}</div>
                        )}
                      </div>
                      <div className='col-12 col-md-6'>
                        <label htmlFor='telefono' className='form-label'>
                          Teléfono
                        </label>
                        <input
                          type='tel'
                          className='form-control'
                          id='telefono'
                          placeholder='Ingrese teléfono'
                          value={formData.telefono}
                          onChange={e =>
                            handleInputChange('telefono', e.target.value)
                          }
                        />
                      </div>
                      <div className='col-12'>
                        <label htmlFor='direccion' className='form-label'>
                          Dirección
                        </label>
                        <input
                          type='text'
                          className='form-control'
                          id='direccion'
                          placeholder='Ingrese dirección completa'
                          value={formData.direccion}
                          onChange={e =>
                            handleInputChange('direccion', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unidades Relacionadas */}
                {formData.tipo !== 'Administrador' && (
                  <div className='card shadow-sm mb-4'>
                    <div className='card-header bg-transparent d-flex justify-content-between align-items-center'>
                      <h6 className='mb-0'>Unidades Relacionadas</h6>
                      <button
                        type='button'
                        className='btn btn-sm btn-outline-primary'
                      >
                        <i
                          className='material-icons me-1'
                          style={{ fontSize: '16px' }}
                        >
                          add
                        </i>
                        Añadir Unidad
                      </button>
                    </div>
                    <div className='card-body'>
                      {errors.unidades && (
                        <div className='alert alert-danger'>
                          <i className='material-icons me-2'>error</i>
                          {errors.unidades}
                        </div>
                      )}

                      <div className='alert alert-info' role='alert'>
                        <div className='d-flex align-items-center'>
                          <i className='material-icons me-2'>info</i>
                          <div>
                            <p className='mb-0'>
                              Seleccione las unidades que esta persona posee o
                              habita.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className='row g-2'>
                        {mockUnidades.map(unidad => {
                          const isSelected = formData.unidades.find(
                            u => u.id === unidad.id,
                          );
                          const selectedUnidad = formData.unidades.find(
                            u => u.id === unidad.id,
                          );

                          return (
                            <div key={unidad.id} className='col-12'>
                              <div
                                className={`p-3 border rounded cursor-pointer ${
                                  isSelected
                                    ? 'border-primary bg-primary bg-opacity-10'
                                    : 'border-secondary'
                                }`}
                                onClick={() => toggleUnidad(unidad)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    toggleUnidad(unidad);
                                  }
                                }}
                                tabIndex={0}
                                role='button'
                                aria-label={`Seleccionar unidad ${unidad.nombre}`}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className='d-flex justify-content-between align-items-center'>
                                  <div className='d-flex align-items-center'>
                                    <i className='material-icons me-2 text-primary'>
                                      apartment
                                    </i>
                                    <div>
                                      <div className='fw-medium'>
                                        {unidad.nombre}
                                      </div>
                                      <div className='small text-muted'>
                                        {unidad.edificio} - {unidad.comunidad}
                                      </div>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div
                                      onClick={e => e.stopPropagation()}
                                      role='presentation'
                                      aria-hidden='true'
                                    >
                                      <select
                                        className='form-select form-select-sm'
                                        value={
                                          selectedUnidad?.relacion ||
                                          'Propietario'
                                        }
                                        onChange={e =>
                                          updateUnidadRelacion(
                                            unidad.id,
                                            e.target.value as
                                              | 'Propietario'
                                              | 'Inquilino',
                                          )
                                        }
                                      >
                                        <option value='Propietario'>
                                          Propietario
                                        </option>
                                        <option value='Inquilino'>
                                          Inquilino
                                        </option>
                                      </select>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuración de Cuenta */}
                <div className='card shadow-sm mb-4'>
                  <div className='card-header bg-transparent'>
                    <h6 className='mb-0'>Configuración de Cuenta</h6>
                  </div>
                  <div className='card-body'>
                    <div className='row g-3'>
                      <div className='col-12'>
                        <div className='form-check form-switch'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            id='crearCuenta'
                            checked={formData.crearCuenta}
                            onChange={e =>
                              handleInputChange('crearCuenta', e.target.checked)
                            }
                          />
                          <label
                            className='form-check-label'
                            htmlFor='crearCuenta'
                          >
                            Crear cuenta de acceso
                          </label>
                        </div>
                        <div className='small text-muted mt-1'>
                          La persona recibirá un email para establecer su
                          contraseña
                        </div>
                      </div>
                      {formData.crearCuenta && (
                        <>
                          <div className='col-12 col-md-6'>
                            <label htmlFor='username' className='form-label'>
                              Nombre de usuario
                            </label>
                            <input
                              type='text'
                              className='form-control'
                              id='username'
                              placeholder='usuario'
                              value={formData.username}
                              onChange={e =>
                                handleInputChange('username', e.target.value)
                              }
                            />
                            <div className='form-text'>
                              Generado automáticamente a partir del nombre y
                              apellido
                            </div>
                          </div>
                          <div className='col-12 col-md-6'>
                            <label htmlFor='nivelAcceso' className='form-label'>
                              Nivel de Acceso
                            </label>
                            <select
                              className='form-select'
                              id='nivelAcceso'
                              value={formData.nivelAcceso}
                              onChange={e =>
                                handleInputChange('nivelAcceso', e.target.value)
                              }
                            >
                              <option value='Solo lectura'>Solo lectura</option>
                              <option value='Usuario Estándar'>
                                Usuario Estándar
                              </option>
                              <option value='Administrador'>
                                Administrador
                              </option>
                              <option value='Superadministrador'>
                                Superadministrador
                              </option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className='d-flex justify-content-between'>
                  <Link href='/personas' className='btn btn-outline-secondary'>
                    Cancelar
                  </Link>
                  <div>
                    <button
                      type='button'
                      className='btn btn-outline-primary me-2'
                      disabled={loading}
                    >
                      Guardar como Borrador
                    </button>
                    <button
                      type='submit'
                      className='btn btn-primary'
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className='spinner-border spinner-border-sm me-2'
                            role='status'
                          ></span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i
                            className='material-icons me-1'
                            style={{ fontSize: '16px' }}
                          >
                            save
                          </i>
                          Guardar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
