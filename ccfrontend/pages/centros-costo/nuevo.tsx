import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Button, Card, Badge, Alert } from 'react-bootstrap';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { centrosCostoService } from '@/lib/centrosCostoService';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface FormData {
  nombre: string;
  descripcion: string;
  comunidadId: string;
  departamento: string;
  presupuestoAnual: string;
  añoFiscal: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  color: string;
  icono: string;
  etiquetas: string;
}

interface CategoriaGastoForm {
  id: string;
  nombre: string;
  presupuesto: number;
  color: string;
  icono: string;
}

const initialFormData: FormData = {
  nombre: '',
  descripcion: '',
  comunidadId: '',
  departamento: '',
  presupuestoAnual: '',
  añoFiscal: '2024',
  fechaInicio: '',
  fechaFin: '',
  activo: true,
  color: '#2196F3',
  icono: 'account_balance_wallet',
  etiquetas: ''
};

const colorOptions = [
  '#4CAF50', '#2196F3', '#F44336', '#FF9800', 
  '#9C27B0', '#607D8B', '#009688', '#795548'
];

const iconOptions = [
  'account_balance_wallet', 'apartment', 'pool', 'security',
  'campaign', 'engineering', 'landscape', 'event',
  'local_fire_department', 'attach_money', 'home_repair_service', 'inventory_2'
];

const departamentos = [
  { value: 'operations', label: 'Operaciones' },
  { value: 'administration', label: 'Administración' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'maintenance', label: 'Mantenimiento' },
  { value: 'security', label: 'Seguridad' }
];

export default function CentroCostoNuevo() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaGastoForm[]>([]);
  const [comunidades, setComunidades] = useState<Array<{id: string, nombre: string}>>([]);

  useEffect(() => {
    // Cargar comunidades para el select
    loadComunidades();
  }, []);

  const loadComunidades = async () => {
    try {
      // TODO: Implementar servicio de comunidades
      setComunidades([
        { id: '1', nombre: 'Comunidad Parque Real' },
        { id: '2', nombre: 'Edificio Central' },
        { id: '3', nombre: 'Torre Norte' }
      ]);
    } catch (error) {
      console.error('Error loading comunidades:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.comunidadId) {
      newErrors.comunidadId = 'La comunidad es requerida';
    }
    
    if (!formData.departamento) {
      newErrors.departamento = 'El departamento es requerido';
    }
    
    if (!formData.presupuestoAnual || parseFloat(formData.presupuestoAnual) <= 0) {
      newErrors.presupuestoAnual = 'El presupuesto debe ser mayor a 0';
    }
    
    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    }
    
    if (!formData.fechaFin) {
      newErrors.fechaFin = 'La fecha de fin es requerida';
    }
    
    if (formData.fechaInicio && formData.fechaFin && formData.fechaInicio >= formData.fechaFin) {
      newErrors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
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
      const centroCostoData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        departamento: formData.departamento,
        presupuesto: parseFloat(formData.presupuestoAnual),
        icono: formData.icono,
        color: formData.color
      };
      
      const comunidadId = parseInt(formData.comunidadId);
      await centrosCostoService.createCentroCosto(comunidadId, centroCostoData);
      
      // Redirect to list page
      router.push('/centros-costo');
      
    } catch (error: any) {
      console.error('Error creating centro de costo:', error);
      setErrors({ submit: error.message || 'Error al crear el centro de costo' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCategoriaGasto = () => {
    const randomColor = colorOptions.length > 0 ? colorOptions[Math.floor(Math.random() * colorOptions.length)] : '#2196F3';
    const randomIcon = iconOptions.length > 0 ? iconOptions[Math.floor(Math.random() * iconOptions.length)] : 'account_balance_wallet';
    
    const newCategoria: CategoriaGastoForm = {
      id: Date.now().toString(),
      nombre: '',
      presupuesto: 0,
      color: randomColor as string,
      icono: randomIcon as string
    };
    setCategorias(prev => [...prev, newCategoria]);
  };

  const removeCategoriaGasto = (id: string) => {
    setCategorias(prev => prev.filter(cat => cat.id !== id));
  };

  const updateCategoriaGasto = (id: string, field: keyof CategoriaGastoForm, value: any) => {
    setCategorias(prev => prev.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const getTotalPresupuestoAsignado = () => {
    return categorias.reduce((total, cat) => total + cat.presupuesto, 0);
  };

  const getPorcentajeAsignado = () => {
    const total = parseFloat(formData.presupuestoAnual) || 0;
    if (total === 0) return 0;
    return (getTotalPresupuestoAsignado() / total) * 100;
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nuevo Centro de Costo — Cuentas Claras</title>
      </Head>

      <Layout title='Crear Nuevo Centro de Costo'>
        <div className='container-fluid p-4'>
          <form onSubmit={handleSubmit}>
            <div className='row'>
              {/* Columna izquierda - Información general */}
              <div className='col-12 col-lg-8'>
                {/* Información General */}
                <div className='card mb-4'>
                  <div className='card-header d-flex align-items-center'>
                    <i className='material-icons me-2'>info</i>
                    <h6 className='mb-0'>Información General</h6>
                  </div>
                  <div className='card-body'>
                    <div className='row g-3'>
                      <div className='col-12'>
                        <label htmlFor='nombre' className='form-label'>
                          Nombre <span className='text-danger'>*</span>
                        </label>
                        <input
                          type='text'
                          className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                          id='nombre'
                          name='nombre'
                          value={formData.nombre}
                          onChange={handleInputChange}
                          placeholder='Ej: Mantenimiento Edificio A'
                        />
                        <div className='form-text'>Nombre descriptivo para identificar el centro de costo.</div>
                        {errors.nombre && <div className='invalid-feedback'>{errors.nombre}</div>}
                      </div>
                      
                      <div className='col-12'>
                        <label htmlFor='descripcion' className='form-label'>Descripción</label>
                        <textarea
                          className='form-control'
                          id='descripcion'
                          name='descripcion'
                          rows={3}
                          value={formData.descripcion}
                          onChange={handleInputChange}
                          placeholder='Describe brevemente este centro de costo...'
                        />
                      </div>
                      
                      <div className='col-12 col-md-6'>
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
                          <option value=''>Todas las comunidades</option>
                          {comunidades.map(comunidad => (
                            <option key={comunidad.id} value={comunidad.id}>
                              {comunidad.nombre}
                            </option>
                          ))}
                        </select>
                        <div className='form-text'>Si aplica a todas las comunidades, seleccione "Todas".</div>
                        {errors.comunidadId && <div className='invalid-feedback'>{errors.comunidadId}</div>}
                      </div>
                      
                      <div className='col-12 col-md-6'>
                        <label htmlFor='departamento' className='form-label'>
                          Departamento <span className='text-danger'>*</span>
                        </label>
                        <select
                          className={`form-select ${errors.departamento ? 'is-invalid' : ''}`}
                          id='departamento'
                          name='departamento'
                          value={formData.departamento}
                          onChange={handleInputChange}
                        >
                          <option value=''>Seleccione un departamento</option>
                          {departamentos.map(dept => (
                            <option key={dept.value} value={dept.value}>
                              {dept.label}
                            </option>
                          ))}
                        </select>
                        {errors.departamento && <div className='invalid-feedback'>{errors.departamento}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Presupuesto y Período */}
                <div className='card mb-4'>
                  <div className='card-header d-flex align-items-center'>
                    <i className='material-icons me-2'>account_balance_wallet</i>
                    <h6 className='mb-0'>Presupuesto y Período</h6>
                  </div>
                  <div className='card-body'>
                    <div className='row g-3'>
                      <div className='col-12 col-md-6'>
                        <label htmlFor='presupuestoAnual' className='form-label'>
                          Presupuesto Anual <span className='text-danger'>*</span>
                        </label>
                        <div className='input-group'>
                          <span className='input-group-text'>$</span>
                          <input
                            type='number'
                            className={`form-control ${errors.presupuestoAnual ? 'is-invalid' : ''}`}
                            id='presupuestoAnual'
                            name='presupuestoAnual'
                            value={formData.presupuestoAnual}
                            onChange={handleInputChange}
                            placeholder='0.00'
                            min='0'
                            step='0.01'
                          />
                          {errors.presupuestoAnual && <div className='invalid-feedback'>{errors.presupuestoAnual}</div>}
                        </div>
                        <div className='form-text'>Monto total asignado para el año.</div>
                      </div>
                      
                      <div className='col-12 col-md-6'>
                        <label htmlFor='añoFiscal' className='form-label'>Año Fiscal</label>
                        <select
                          className='form-select'
                          id='añoFiscal'
                          name='añoFiscal'
                          value={formData.añoFiscal}
                          onChange={handleInputChange}
                        >
                          <option value='2023'>2023</option>
                          <option value='2024'>2024</option>
                          <option value='2025'>2025</option>
                        </select>
                      </div>
                      
                      <div className='col-12 col-md-6'>
                        <label htmlFor='fechaInicio' className='form-label'>
                          Fecha de Inicio <span className='text-danger'>*</span>
                        </label>
                        <input
                          type='date'
                          className={`form-control ${errors.fechaInicio ? 'is-invalid' : ''}`}
                          id='fechaInicio'
                          name='fechaInicio'
                          value={formData.fechaInicio}
                          onChange={handleInputChange}
                        />
                        {errors.fechaInicio && <div className='invalid-feedback'>{errors.fechaInicio}</div>}
                      </div>
                      
                      <div className='col-12 col-md-6'>
                        <label htmlFor='fechaFin' className='form-label'>
                          Fecha de Fin <span className='text-danger'>*</span>
                        </label>
                        <input
                          type='date'
                          className={`form-control ${errors.fechaFin ? 'is-invalid' : ''}`}
                          id='fechaFin'
                          name='fechaFin'
                          value={formData.fechaFin}
                          onChange={handleInputChange}
                        />
                        {errors.fechaFin && <div className='invalid-feedback'>{errors.fechaFin}</div>}
                      </div>
                      
                      <div className='col-12'>
                        <div className='form-check form-switch'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            id='activo'
                            name='activo'
                            checked={formData.activo}
                            onChange={handleInputChange}
                          />
                          <label className='form-check-label' htmlFor='activo'>
                            Centro de Costo Activo
                          </label>
                        </div>
                        <div className='form-text'>Desactive para suspender temporalmente este centro de costo.</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categorías de Gasto Asociadas */}
                <div className='card mb-4'>
                  <div className='card-header d-flex justify-content-between align-items-center'>
                    <div className='d-flex align-items-center'>
                      <i className='material-icons me-2'>category</i>
                      <h6 className='mb-0'>Categorías de Gasto Asociadas</h6>
                    </div>
                    <button
                      type='button'
                      className='btn btn-sm btn-outline-primary'
                      onClick={addCategoriaGasto}
                    >
                      <i className='material-icons align-middle me-1' style={{fontSize: '16px'}}>add</i>
                      Añadir
                    </button>
                  </div>
                  <div className='card-body'>
                    {categorias.length > 0 ? (
                      <>
                        <div className='table-responsive'>
                          <table className='table table-sm table-hover'>
                            <thead className='table-light'>
                              <tr>
                                <th>Categoría</th>
                                <th>Presupuesto</th>
                                <th>% del total</th>
                                <th>Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categorias.map((categoria) => (
                                <tr key={categoria.id}>
                                  <td>
                                    <div className='d-flex align-items-center'>
                                      <div 
                                        className='rounded me-2 d-flex align-items-center justify-content-center' 
                                        style={{
                                          width: '24px', 
                                          height: '24px', 
                                          backgroundColor: categoria.color
                                        }}
                                      >
                                        <i className='material-icons' style={{fontSize: '14px', color: 'white'}}>
                                          {categoria.icono}
                                        </i>
                                      </div>
                                      <input
                                        type='text'
                                        className='form-control form-control-sm border-0'
                                        value={categoria.nombre}
                                        onChange={(e) => updateCategoriaGasto(categoria.id, 'nombre', e.target.value)}
                                        placeholder='Nombre categoría'
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div className='input-group input-group-sm'>
                                      <span className='input-group-text'>$</span>
                                      <input
                                        type='number'
                                        className='form-control form-control-sm'
                                        value={categoria.presupuesto}
                                        onChange={(e) => updateCategoriaGasto(categoria.id, 'presupuesto', parseFloat(e.target.value) || 0)}
                                        min='0'
                                        step='0.01'
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    {formData.presupuestoAnual && parseFloat(formData.presupuestoAnual) > 0 
                                      ? `${((categoria.presupuesto / parseFloat(formData.presupuestoAnual)) * 100).toFixed(1)}%`
                                      : '0%'
                                    }
                                  </td>
                                  <td>
                                    <button
                                      type='button'
                                      className='btn btn-sm btn-outline-danger'
                                      onClick={() => removeCategoriaGasto(categoria.id)}
                                    >
                                      <i className='material-icons' style={{fontSize: '16px'}}>delete</i>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className='table-light'>
                              <tr>
                                <th>Total</th>
                                <th>${getTotalPresupuestoAsignado().toLocaleString()}</th>
                                <th>{getPorcentajeAsignado().toFixed(1)}%</th>
                                <th></th>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                        
                        {getPorcentajeAsignado() < 100 && (
                          <div className='alert alert-info mt-3 mb-0' role='alert'>
                            <div className='d-flex align-items-start'>
                              <i className='material-icons me-2'>info</i>
                              <div>
                                <strong>Nota:</strong> Aún tiene un {(100 - getPorcentajeAsignado()).toFixed(1)}% del presupuesto 
                                (${((parseFloat(formData.presupuestoAnual) || 0) - getTotalPresupuestoAsignado()).toLocaleString()}) por asignar.
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className='text-center text-muted py-4'>
                        <i className='material-icons display-6 mb-3'>category</i>
                        <p>No hay categorías de gasto asociadas.</p>
                        <p className='small'>Haga clic en "Añadir" para comenzar.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Etiquetas */}
                <div className='card mb-4'>
                  <div className='card-header d-flex align-items-center'>
                    <i className='material-icons me-2'>label</i>
                    <h6 className='mb-0'>Etiquetas</h6>
                  </div>
                  <div className='card-body'>
                    <div className='mb-3'>
                      <label htmlFor='etiquetas' className='form-label'>Etiquetas</label>
                      <input
                        type='text'
                        className='form-control'
                        id='etiquetas'
                        name='etiquetas'
                        value={formData.etiquetas}
                        onChange={handleInputChange}
                        placeholder='Añadir etiquetas separadas por comas...'
                      />
                      <div className='form-text'>Las etiquetas facilitan la búsqueda y organización de los centros de costo.</div>
                    </div>
                    
                    {formData.etiquetas && (
                      <div className='d-flex flex-wrap gap-2'>
                        {formData.etiquetas.split(',').filter(tag => tag.trim()).map((tag, index) => (
                          <span key={index} className='badge bg-secondary'>
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Columna derecha - Personalización y vista previa */}
              <div className='col-12 col-lg-4'>
                {/* Personalización Visual */}
                <div className='card mb-4'>
                  <div className='card-header d-flex align-items-center'>
                    <i className='material-icons me-2'>palette</i>
                    <h6 className='mb-0'>Personalización Visual</h6>
                  </div>
                  <div className='card-body text-center'>
                    {/* Vista previa del icono */}
                    <div className='mb-4'>
                      <div 
                        className='rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3'
                        style={{
                          width: '80px', 
                          height: '80px', 
                          backgroundColor: formData.color
                        }}
                      >
                        <i className='material-icons text-white' style={{fontSize: '32px'}}>
                          {formData.icono}
                        </i>
                      </div>
                      <h6 className='mb-0'>{formData.nombre || 'Nuevo Centro de Costo'}</h6>
                    </div>

                    {/* Selector de color */}
                    <div className='mb-4'>
                      <label className='form-label'>Color</label>
                      <div className='d-flex justify-content-center flex-wrap gap-2'>
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            type='button'
                            className={`btn btn-sm rounded-circle ${formData.color === color ? 'border-dark border-2' : 'border'}`}
                            style={{
                              backgroundColor: color,
                              width: '32px',
                              height: '32px',
                              minWidth: '32px'
                            }}
                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Selector de ícono */}
                    <div className='mb-3'>
                      <label className='form-label'>Icono</label>
                      <div className='d-flex justify-content-center flex-wrap gap-2'>
                        {iconOptions.map((icon) => (
                          <button
                            key={icon}
                            type='button'
                            className={`btn btn-sm ${formData.icono === icon ? 'btn-primary' : 'btn-outline-secondary'}`}
                            style={{ width: '40px', height: '40px' }}
                            onClick={() => setFormData(prev => ({ ...prev, icono: icon }))}
                          >
                            <i className='material-icons' style={{fontSize: '18px'}}>
                              {icon}
                            </i>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vista Previa Presupuesto */}
                <div className='card mb-4'>
                  <div className='card-header d-flex align-items-center'>
                    <i className='material-icons me-2'>analytics</i>
                    <h6 className='mb-0'>Vista Previa Presupuesto</h6>
                  </div>
                  <div className='card-body'>
                    <div className='bg-light rounded p-3 mb-3 text-center'>
                      <div className='small text-muted'>Presupuesto Total</div>
                      <div className='h4 mb-1'>${parseFloat(formData.presupuestoAnual || '0').toLocaleString()}</div>
                      <div className='small text-muted'>Año fiscal {formData.añoFiscal}</div>
                    </div>

                    <div className='bg-light rounded p-3 mb-3 text-center'>
                      <div className='small text-muted mb-2'>Porcentaje Asignado</div>
                      <div className='progress mb-2' style={{ height: '20px' }}>
                        <div 
                          className='progress-bar' 
                          role='progressbar' 
                          style={{ width: `${getPorcentajeAsignado()}%` }}
                          aria-valuenow={getPorcentajeAsignado()}
                          aria-valuemin={0} 
                          aria-valuemax={100}
                        >
                          {getPorcentajeAsignado().toFixed(1)}%
                        </div>
                      </div>
                      <div className='small text-muted'>
                        ${getTotalPresupuestoAsignado().toLocaleString()} de ${parseFloat(formData.presupuestoAnual || '0').toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className='d-flex justify-content-end mt-4 gap-2'>
              <button 
                type='button' 
                className='btn btn-outline-secondary'
                onClick={() => router.push('/centros-costo')}
              >
                Cancelar
              </button>
              <button 
                type='submit' 
                className='btn btn-primary'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className='material-icons align-middle me-1' style={{fontSize: '18px'}}>save</i>
                    Guardar Centro de Costo
                  </>
                )}
              </button>
            </div>

            {/* Error de envío */}
            {errors.submit && (
              <div className='alert alert-danger mt-3' role='alert'>
                <i className='material-icons me-2'>error</i>
                {errors.submit}
              </div>
            )}
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
