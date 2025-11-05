import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import apiClient from '@/lib/api';
import { ProtectedRoute } from '@/lib/useAuth';

interface FormData {
  comunidad: string;
  edificio: string;
  torre: string;
  codigoUnidad: string;
  tipoUnidad: string;
  piso: number;
  nroDormitorios: number;
  nroBanos: number;
  descripcion: string;
  m2Utiles: number;
  m2Terrazas: number;
  m2Totales: number;
  alicuota: number;
  estacionamiento: string;
  ubicacionEstacionamiento: string;
  bodega: string;
  ubicacionBodega: string;
  estadoInicial: string;
}

interface Medidor {
  id: string;
  tipo: string;
  numero: string;
  ubicacion: string;
}

const comunidades = [
  { id: '1', nombre: 'Las Palmas' },
  { id: '2', nombre: 'Edificio Central' },
  { id: '3', nombre: 'Jardines del Este' },
];

const edificios = [
  { id: '1', nombre: 'Torre Central', comunidadId: '2' },
  { id: '2', nombre: 'Edificio Norte', comunidadId: '1' },
  { id: '3', nombre: 'Jardines del Este', comunidadId: '3' },
];

const torres = [
  { id: '1', nombre: 'Torre A', edificioId: '2' },
  { id: '2', nombre: 'Torre B', edificioId: '1' },
  { id: '3', nombre: 'Torre C', edificioId: '3' },
];

const caracteristicasDisponibles = [
  'Balcón',
  'Terraza',
  'Luminoso',
  'Vista',
  'Pet Friendly',
  'Amoblado',
  'Calefacción',
  'Aire acondicionado',
  'Chimenea',
];

export default function UnidadNueva() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    comunidad: '',
    edificio: '',
    torre: '',
    codigoUnidad: '',
    tipoUnidad: 'departamento',
    piso: 0,
    nroDormitorios: 0,
    nroBanos: 0,
    descripcion: '',
    m2Utiles: 0,
    m2Terrazas: 0,
    m2Totales: 0,
    alicuota: 0,
    estacionamiento: '',
    ubicacionEstacionamiento: '',
    bodega: '',
    ubicacionBodega: '',
    estadoInicial: 'activa',
  });

  const [selectedCaracteristicas, setSelectedCaracteristicas] = useState<
    string[]
  >([]);
  const [medidores, setMedidores] = useState<Medidor[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar edificios según comunidad seleccionada
  const availableEdificios = edificios.filter(
    edificio =>
      !formData.comunidad || edificio.comunidadId === formData.comunidad
  );

  // Filtrar torres según edificio seleccionado
  const availableTorres = torres.filter(
    torre => !formData.edificio || torre.edificioId === formData.edificio
  );

  // Calcular m² totales automáticamente
  useEffect(() => {
    const totales = formData.m2Utiles + formData.m2Terrazas;
    setFormData(prev => ({ ...prev, m2Totales: totales }));
  }, [formData.m2Utiles, formData.m2Terrazas]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar errores del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Resetear campos dependientes
    if (field === 'comunidad') {
      setFormData(prev => ({ ...prev, edificio: '', torre: '' }));
    } else if (field === 'edificio') {
      setFormData(prev => ({ ...prev, torre: '' }));
    }
  };

  const handleCaracteristicaToggle = (caracteristica: string) => {
    setSelectedCaracteristicas(prev =>
      prev.includes(caracteristica)
        ? prev.filter(c => c !== caracteristica)
        : [...prev, caracteristica]
    );
  };

  const handleAddMedidor = () => {
    const newMedidor: Medidor = {
      id: Date.now().toString(),
      tipo: 'agua',
      numero: '',
      ubicacion: '',
    };
    setMedidores(prev => [...prev, newMedidor]);
  };

  const handleMedidorChange = (id: string, field: string, value: string) => {
    setMedidores(prev =>
      prev.map(medidor =>
        medidor.id === id ? { ...medidor, [field]: value } : medidor
      )
    );
  };

  const handleRemoveMedidor = (id: string) => {
    setMedidores(prev => prev.filter(medidor => medidor.id !== id));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.comunidad) {
      newErrors.comunidad = 'La comunidad es requerida';
    }
    if (!formData.edificio) {
      newErrors.edificio = 'El edificio es requerido';
    }
    if (!formData.codigoUnidad) {
      newErrors.codigoUnidad = 'El código de unidad es requerido';
    }
    if (!formData.tipoUnidad) {
      newErrors.tipoUnidad = 'El tipo de unidad es requerido';
    }
    if (formData.m2Utiles <= 0) {
      newErrors.m2Utiles = 'Los m² útiles deben ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Construir payload según API
      const payload = {
        codigo: formData.codigoUnidad,
        tipo: formData.tipoUnidad,
        piso: formData.piso,
        dormitorios: formData.nroDormitorios,
        nro_banos: formData.nroBanos,
        descripcion: formData.descripcion,
        m2_utiles: formData.m2Utiles,
        m2_terraza: formData.m2Terrazas,
        alicuota: formData.alicuota,
        estacionamiento: formData.estacionamiento
          ? {
              numero: formData.estacionamiento,
              ubicacion: formData.ubicacionEstacionamiento,
            }
          : null,
        bodega: formData.bodega
          ? { numero: formData.bodega, ubicacion: formData.ubicacionBodega }
          : null,
        estado: formData.estadoInicial,
        caracteristicas: selectedCaracteristicas,
        medidores: medidores.map(m => ({
          tipo: m.tipo,
          numero: m.numero,
          ubicacion: m.ubicacion,
        })),
      };

      // POST to create unidad on selected comunidad
      const comunidadId = formData.comunidad;
      const resp = await apiClient.post(
        `/unidades/comunidad/${comunidadId}`,
        payload
      );
      // on success, navigate to new unidad detail or list
      const created = resp.data;
      if (created && created.id) {
        router.push(`/unidades/${created.id}`);
      } else {
        router.push('/unidades');
      }
    } catch (err) {
      const error: any = err;
      // eslint-disable-next-line no-console
      console.error('Error al crear unidad:', error);
      // map server validation
      const serverErr = error?.response?.data;
      if (serverErr) {
        if (serverErr.errors) {
          const newErrors: Record<string, string> = {};
          Object.keys(serverErr.errors).forEach(k => {
            newErrors[k] = serverErr.errors[k].msg || serverErr.errors[k];
          });
          setErrors(newErrors);
        } else if (serverErr.error) {
          setErrors({ _global: serverErr.error });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nueva Unidad — Cuentas Claras</title>
      </Head>

      <Layout title='Crear Nueva Unidad'>
        <div className='container-fluid py-4'>
          {/* Breadcrumb */}
          <nav aria-label='breadcrumb' className='mb-4'>
            <ol className='breadcrumb'>
              <li className='breadcrumb-item'>
                <Link href='/dashboard'>Dashboard</Link>
              </li>
              <li className='breadcrumb-item'>
                <Link href='/unidades'>Unidades</Link>
              </li>
              <li className='breadcrumb-item active' aria-current='page'>
                Nueva Unidad
              </li>
            </ol>
          </nav>

          <form onSubmit={handleSubmit}>
            <div className='row'>
              <div className='col-lg-8'>
                {/* Información básica */}
                <div
                  className='mb-4'
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div
                    className='px-3 py-2'
                    style={{
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <h5 className='mb-0'>Información Básica</h5>
                  </div>
                  <div className='p-4'>
                    <div className='mb-3'>
                      <label htmlFor='comunidadSelect' className='form-label'>
                        Comunidad <span className='text-danger'>*</span>
                      </label>
                      <select
                        className={`form-select ${errors.comunidad ? 'is-invalid' : ''}`}
                        id='comunidadSelect'
                        value={formData.comunidad}
                        onChange={e =>
                          handleInputChange('comunidad', e.target.value)
                        }
                        required
                      >
                        <option value='' disabled>
                          Seleccionar comunidad
                        </option>
                        {comunidades.map(comunidad => (
                          <option key={comunidad.id} value={comunidad.id}>
                            {comunidad.nombre}
                          </option>
                        ))}
                      </select>
                      {errors.comunidad && (
                        <div className='invalid-feedback'>
                          {errors.comunidad}
                        </div>
                      )}
                    </div>

                    <div className='row'>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label
                            htmlFor='edificioSelect'
                            className='form-label'
                          >
                            Edificio <span className='text-danger'>*</span>
                          </label>
                          <select
                            className={`form-select ${errors.edificio ? 'is-invalid' : ''}`}
                            id='edificioSelect'
                            value={formData.edificio}
                            onChange={e =>
                              handleInputChange('edificio', e.target.value)
                            }
                            disabled={!formData.comunidad}
                            required
                          >
                            <option value='' disabled>
                              Seleccionar edificio
                            </option>
                            {availableEdificios.map(edificio => (
                              <option key={edificio.id} value={edificio.id}>
                                {edificio.nombre}
                              </option>
                            ))}
                          </select>
                          {errors.edificio && (
                            <div className='invalid-feedback'>
                              {errors.edificio}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label htmlFor='torreSelect' className='form-label'>
                            Torre
                          </label>
                          <select
                            className='form-select'
                            id='torreSelect'
                            value={formData.torre}
                            onChange={e =>
                              handleInputChange('torre', e.target.value)
                            }
                            disabled={!formData.edificio}
                          >
                            <option value=''>
                              Seleccionar torre (opcional)
                            </option>
                            {availableTorres.map(torre => (
                              <option key={torre.id} value={torre.id}>
                                {torre.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className='row'>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label htmlFor='codigoUnidad' className='form-label'>
                            Código de Unidad{' '}
                            <span className='text-danger'>*</span>
                          </label>
                          <input
                            type='text'
                            className={`form-control ${errors.codigoUnidad ? 'is-invalid' : ''}`}
                            id='codigoUnidad'
                            placeholder='Ej: A-101'
                            value={formData.codigoUnidad}
                            onChange={e =>
                              handleInputChange('codigoUnidad', e.target.value)
                            }
                            required
                          />
                          <div className='form-text'>
                            Código único que identifica la unidad (Ej: A-101,
                            2B, Dpto. 503)
                          </div>
                          {errors.codigoUnidad && (
                            <div className='invalid-feedback'>
                              {errors.codigoUnidad}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label htmlFor='tipoUnidad' className='form-label'>
                            Tipo de Unidad{' '}
                            <span className='text-danger'>*</span>
                          </label>
                          <select
                            className='form-select'
                            id='tipoUnidad'
                            value={formData.tipoUnidad}
                            onChange={e =>
                              handleInputChange('tipoUnidad', e.target.value)
                            }
                            required
                          >
                            <option value='departamento'>Departamento</option>
                            <option value='casa'>Casa</option>
                            <option value='oficina'>Oficina</option>
                            <option value='local_comercial'>
                              Local Comercial
                            </option>
                            <option value='bodega'>Bodega</option>
                            <option value='estacionamiento'>
                              Estacionamiento
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className='row'>
                      <div className='col-md-4'>
                        <div className='mb-3'>
                          <label htmlFor='piso' className='form-label'>
                            Piso
                          </label>
                          <input
                            type='number'
                            className='form-control'
                            id='piso'
                            min='0'
                            value={formData.piso}
                            onChange={e =>
                              handleInputChange(
                                'piso',
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className='col-md-4'>
                        <div className='mb-3'>
                          <label
                            htmlFor='nroDormitorios'
                            className='form-label'
                          >
                            N° Dormitorios
                          </label>
                          <input
                            type='number'
                            className='form-control'
                            id='nroDormitorios'
                            min='0'
                            value={formData.nroDormitorios}
                            onChange={e =>
                              handleInputChange(
                                'nroDormitorios',
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className='col-md-4'>
                        <div className='mb-3'>
                          <label htmlFor='nroBanos' className='form-label'>
                            N° Baños
                          </label>
                          <input
                            type='number'
                            className='form-control'
                            id='nroBanos'
                            min='0'
                            value={formData.nroBanos}
                            onChange={e =>
                              handleInputChange(
                                'nroBanos',
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className='mb-3'>
                      <label htmlFor='descripcionUnidad' className='form-label'>
                        Descripción
                      </label>
                      <textarea
                        className='form-control'
                        id='descripcionUnidad'
                        rows={3}
                        value={formData.descripcion}
                        onChange={e =>
                          handleInputChange('descripcion', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Medidas y coeficiente */}
                <div
                  className='mb-4'
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div
                    className='px-3 py-2'
                    style={{
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <h5 className='mb-0'>Medidas y Coeficiente</h5>
                  </div>
                  <div className='p-4'>
                    <div className='row'>
                      <div className='col-md-4'>
                        <div className='mb-3'>
                          <label htmlFor='m2Utiles' className='form-label'>
                            M² Útiles <span className='text-danger'>*</span>
                          </label>
                          <div className='input-group'>
                            <input
                              type='number'
                              className={`form-control ${errors.m2Utiles ? 'is-invalid' : ''}`}
                              id='m2Utiles'
                              step='0.01'
                              min='0'
                              value={formData.m2Utiles}
                              onChange={e =>
                                handleInputChange(
                                  'm2Utiles',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              required
                            />
                            <span className='input-group-text'>m²</span>
                          </div>
                          {errors.m2Utiles && (
                            <div className='invalid-feedback'>
                              {errors.m2Utiles}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='col-md-4'>
                        <div className='mb-3'>
                          <label htmlFor='m2Terrazas' className='form-label'>
                            M² Terrazas
                          </label>
                          <div className='input-group'>
                            <input
                              type='number'
                              className='form-control'
                              id='m2Terrazas'
                              step='0.01'
                              min='0'
                              value={formData.m2Terrazas}
                              onChange={e =>
                                handleInputChange(
                                  'm2Terrazas',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                            <span className='input-group-text'>m²</span>
                          </div>
                        </div>
                      </div>
                      <div className='col-md-4'>
                        <div className='mb-3'>
                          <label htmlFor='m2Totales' className='form-label'>
                            M² Totales
                          </label>
                          <div className='input-group'>
                            <input
                              type='number'
                              className='form-control'
                              id='m2Totales'
                              step='0.01'
                              value={formData.m2Totales}
                              readOnly
                            />
                            <span className='input-group-text'>m²</span>
                          </div>
                          <div className='form-text'>
                            Se calcula automáticamente
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='row'>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label htmlFor='alicuota' className='form-label'>
                            Alícuota
                          </label>
                          <input
                            type='number'
                            className='form-control'
                            id='alicuota'
                            step='0.000001'
                            min='0'
                            max='1'
                            value={formData.alicuota}
                            onChange={e =>
                              handleInputChange(
                                'alicuota',
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                          <div className='form-text'>
                            Valor decimal entre 0 y 1 (Ej: 0.012500)
                          </div>
                        </div>
                      </div>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label htmlFor='estadoInicial' className='form-label'>
                            Estado Inicial
                          </label>
                          <select
                            className='form-select'
                            id='estadoInicial'
                            value={formData.estadoInicial}
                            onChange={e =>
                              handleInputChange('estadoInicial', e.target.value)
                            }
                          >
                            <option value='activa'>Activa</option>
                            <option value='inactiva'>Inactiva</option>
                            <option value='mantenimiento'>En mantención</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estacionamiento y Bodega */}
                <div
                  className='mb-4'
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div
                    className='px-3 py-2'
                    style={{
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <h5 className='mb-0'>Estacionamiento y Bodega</h5>
                  </div>
                  <div className='p-4'>
                    <div className='row'>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label
                            htmlFor='estacionamiento'
                            className='form-label'
                          >
                            N° Estacionamiento
                          </label>
                          <input
                            type='text'
                            className='form-control'
                            id='estacionamiento'
                            placeholder='Ej: E-25'
                            value={formData.estacionamiento}
                            onChange={e =>
                              handleInputChange(
                                'estacionamiento',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className='mb-3'>
                          <label
                            htmlFor='ubicacionEstacionamiento'
                            className='form-label'
                          >
                            Ubicación Estacionamiento
                          </label>
                          <input
                            type='text'
                            className='form-control'
                            id='ubicacionEstacionamiento'
                            placeholder='Ej: Subterráneo 2, Sector Norte'
                            value={formData.ubicacionEstacionamiento}
                            onChange={e =>
                              handleInputChange(
                                'ubicacionEstacionamiento',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className='col-md-6'>
                        <div className='mb-3'>
                          <label htmlFor='bodega' className='form-label'>
                            N° Bodega
                          </label>
                          <input
                            type='text'
                            className='form-control'
                            id='bodega'
                            placeholder='Ej: B-12'
                            value={formData.bodega}
                            onChange={e =>
                              handleInputChange('bodega', e.target.value)
                            }
                          />
                        </div>
                        <div className='mb-3'>
                          <label
                            htmlFor='ubicacionBodega'
                            className='form-label'
                          >
                            Ubicación Bodega
                          </label>
                          <input
                            type='text'
                            className='form-control'
                            id='ubicacionBodega'
                            placeholder='Ej: Subterráneo 1, Pasillo Central'
                            value={formData.ubicacionBodega}
                            onChange={e =>
                              handleInputChange(
                                'ubicacionBodega',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Características */}
                <div
                  className='mb-4'
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div
                    className='px-3 py-2'
                    style={{
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <h5 className='mb-0'>Características</h5>
                  </div>
                  <div className='p-4'>
                    <p className='text-muted mb-3'>
                      Seleccione las características que aplican a esta unidad:
                    </p>
                    <div>
                      {caracteristicasDisponibles.map(caracteristica => (
                        <span
                          key={caracteristica}
                          className={`badge me-2 mb-2 ${
                            selectedCaracteristicas.includes(caracteristica)
                              ? 'bg-primary text-white'
                              : 'bg-light text-dark'
                          }`}
                          style={{
                            cursor: 'pointer',
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '0.875rem',
                          }}
                          role='button'
                          tabIndex={0}
                          onClick={() =>
                            handleCaracteristicaToggle(caracteristica)
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCaracteristicaToggle(caracteristica);
                            }
                          }}
                        >
                          {caracteristica}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Medidores */}
                <div
                  className='mb-4'
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div
                    className='px-3 py-2 d-flex justify-content-between align-items-center'
                    style={{
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <h5 className='mb-0'>Medidores</h5>
                    <button
                      type='button'
                      className='btn btn-sm btn-outline-primary'
                      onClick={handleAddMedidor}
                    >
                      <i
                        className='material-icons me-1'
                        style={{ fontSize: '16px' }}
                      >
                        add
                      </i>
                      Agregar Medidor
                    </button>
                  </div>
                  <div className='p-4'>
                    {medidores.length === 0 ? (
                      <p className='text-muted mb-0'>
                        No hay medidores configurados. Haga clic en
                        &quot;Agregar Medidor&quot; para añadir uno.
                      </p>
                    ) : (
                      medidores.map(medidor => (
                        <div
                          key={medidor.id}
                          className='border rounded p-3 mb-3'
                        >
                          <div className='row'>
                            <div className='col-md-3'>
                              <label className='form-label'>Tipo</label>
                              <select
                                className='form-select form-select-sm'
                                value={medidor.tipo}
                                onChange={e =>
                                  handleMedidorChange(
                                    medidor.id,
                                    'tipo',
                                    e.target.value
                                  )
                                }
                              >
                                <option value='agua'>Agua</option>
                                <option value='gas'>Gas</option>
                                <option value='electricidad'>
                                  Electricidad
                                </option>
                              </select>
                            </div>
                            <div className='col-md-4'>
                              <label className='form-label'>
                                Número de Medidor
                              </label>
                              <input
                                type='text'
                                className='form-control form-control-sm'
                                value={medidor.numero}
                                onChange={e =>
                                  handleMedidorChange(
                                    medidor.id,
                                    'numero',
                                    e.target.value
                                  )
                                }
                                placeholder='Número del medidor'
                              />
                            </div>
                            <div className='col-md-4'>
                              <label className='form-label'>Ubicación</label>
                              <input
                                type='text'
                                className='form-control form-control-sm'
                                value={medidor.ubicacion}
                                onChange={e =>
                                  handleMedidorChange(
                                    medidor.id,
                                    'ubicacion',
                                    e.target.value
                                  )
                                }
                                placeholder='Ubicación del medidor'
                              />
                            </div>
                            <div className='col-md-1 d-flex align-items-end'>
                              <button
                                type='button'
                                className='btn btn-sm btn-outline-danger'
                                onClick={() => handleRemoveMedidor(medidor.id)}
                              >
                                <i
                                  className='material-icons'
                                  style={{ fontSize: '16px' }}
                                >
                                  delete
                                </i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar con acciones */}
              <div className='col-lg-4'>
                <div className='sticky-top' style={{ top: '2rem' }}>
                  <div
                    className='mb-4'
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 'var(--radius)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div
                      className='px-3 py-2'
                      style={{
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        backgroundColor: '#f9f9f9',
                      }}
                    >
                      <h5 className='mb-0'>Acciones</h5>
                    </div>
                    <div className='p-4'>
                      <div className='d-grid gap-2'>
                        <button
                          type='submit'
                          className='btn btn-primary'
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span
                                className='spinner-border spinner-border-sm me-2'
                                role='status'
                                aria-hidden='true'
                              ></span>
                              Creando...
                            </>
                          ) : (
                            <>
                              <i className='material-icons me-1'>save</i>
                              Crear Unidad
                            </>
                          )}
                        </button>
                        <Link
                          href='/unidades'
                          className='btn btn-outline-secondary'
                        >
                          <i className='material-icons me-1'>cancel</i>
                          Cancelar
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Información de ayuda */}
                  <div
                    className='alert alert-info'
                    style={{
                      backgroundColor: '#e7f3ff',
                      border: '1px solid #b3d9ff',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    <h6 className='alert-heading'>
                      <i className='material-icons me-2'>info</i>
                      Información
                    </h6>
                    <p className='mb-0 small'>
                      Los campos marcados con{' '}
                      <span className='text-danger'>*</span> son obligatorios.
                      Los m² totales se calculan automáticamente sumando m²
                      útiles y terrazas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
