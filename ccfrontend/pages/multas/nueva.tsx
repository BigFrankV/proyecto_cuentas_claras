import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import Head from 'next/head';
import Link from 'next/link';

// Tipos y servicios
import { 
  MultaFormData, 
  MultaWizardStep, 
  CreateMultaData, 
  TipoInfraccion 
} from '@/types/multas';
import multasService from '@/lib/multasService';
import comunidadesService from '@/lib/comunidadesService';
import { Comunidad } from '@/types/comunidades';

export default function NuevaMulta() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Estados del wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<MultaFormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Datos para los selects
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [edificios, setEdificios] = useState<any[]>([]);
  const [torres, setTorres] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [tiposInfraccion, setTiposInfraccion] = useState<TipoInfraccion[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEdificios, setIsLoadingEdificios] = useState(false);
  const [isLoadingTorres, setIsLoadingTorres] = useState(false);
  const [isLoadingUnidades, setIsLoadingUnidades] = useState(false);
  
  // Archivos de evidencia
  const [evidenciaFiles, setEvidenciaFiles] = useState<File[]>([]);

  // Configuración de pasos del wizard
  const steps: MultaWizardStep[] = [
    {
      numero: 1,
      titulo: 'Seleccionar Unidad',
      descripcion: 'Elige la comunidad, edificio, torre y unidad',
      completado: !!(formData.unidad_id),
      activo: currentStep === 1
    },
    {
      numero: 2,
      titulo: 'Tipo de Infracción',
      descripcion: 'Selecciona el tipo de infracción y monto',
      completado: !!(formData.tipo_infraccion && formData.monto),
      activo: currentStep === 2
    },
    {
      numero: 3,
      titulo: 'Detalles de la Multa',
      descripcion: 'Descripción, fechas y evidencia',
      completado: !!(formData.descripcion && formData.fecha_infraccion && formData.fecha_vencimiento),
      activo: currentStep === 3
    },
    {
      numero: 4,
      titulo: 'Revisión y Confirmación',
      descripcion: 'Revisa todos los datos antes de crear',
      completado: false,
      activo: currentStep === 4
    }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Cargar edificios cuando cambia la comunidad
  useEffect(() => {
    if (formData.comunidad_id) {
      loadEdificios(formData.comunidad_id);
    } else {
      setEdificios([]);
      setTorres([]);
      setUnidades([]);
    }
  }, [formData.comunidad_id]);

  // Cargar torres cuando cambia el edificio
  useEffect(() => {
    if (formData.edificio_id) {
      loadTorres(formData.edificio_id);
    } else {
      setTorres([]);
      setUnidades([]);
    }
  }, [formData.edificio_id]);

  // Cargar unidades cuando cambia la torre
  useEffect(() => {
    if (formData.torre_id) {
      loadUnidades(formData.torre_id);
    } else {
      setUnidades([]);
    }
  }, [formData.torre_id]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Cargar comunidades según rol
      let comunidadesData: Comunidad[] = [];
      
      if (user?.is_superadmin) {
        comunidadesData = await comunidadesService.getComunidades();
      } else if (user?.memberships) {
        // Solo comunidades donde el usuario tiene membresía
        const todasComunidades = await comunidadesService.getComunidades();
        const comunidadIds = user.memberships.map(m => m.comunidadId);
        comunidadesData = todasComunidades.filter(c => comunidadIds.includes(c.id));
      }
      
      setComunidades(comunidadesData);

      // Si solo tiene una comunidad, preseleccionarla
      if (comunidadesData.length === 1) {
        setFormData(prev => ({ ...prev, comunidad_id: comunidadesData[0].id }));
      }

      // Cargar tipos de infracciones
      const tiposData = await multasService.getTiposInfraccion();
      setTiposInfraccion(tiposData);

      console.log('✅ Datos iniciales cargados');
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEdificios = async (comunidadId: number) => {
    setIsLoadingEdificios(true);
    try {
      // Aquí necesitarías un servicio de edificios
      // const edificiosData = await edificiosService.getEdificios({ comunidad_id: comunidadId });
      
      // Por ahora, datos de ejemplo
      const edificiosData = [
        { id: 1, nombre: 'Edificio A', comunidad_id: comunidadId },
        { id: 2, nombre: 'Edificio B', comunidad_id: comunidadId },
      ];
      
      setEdificios(edificiosData);
    } catch (error) {
      console.error('❌ Error cargando edificios:', error);
      setEdificios([]);
    } finally {
      setIsLoadingEdificios(false);
    }
  };

  const loadTorres = async (edificioId: number) => {
    setIsLoadingTorres(true);
    try {
      // const torresData = await torresService.getTorres({ edificio_id: edificioId });
      
      const torresData = [
        { id: 1, nombre: 'Torre 1', edificio_id: edificioId },
        { id: 2, nombre: 'Torre 2', edificio_id: edificioId },
      ];
      
      setTorres(torresData);
    } catch (error) {
      console.error('❌ Error cargando torres:', error);
      setTorres([]);
    } finally {
      setIsLoadingTorres(false);
    }
  };

  const loadUnidades = async (torreId: number) => {
    setIsLoadingUnidades(true);
    try {
      // const unidadesData = await unidadesService.getUnidades({ torre_id: torreId });
      
      const unidadesData = [
        { id: 1, numero: '101', piso: 1, torre_id: torreId, propietario_nombre: 'Juan Pérez' },
        { id: 2, numero: '102', piso: 1, torre_id: torreId, propietario_nombre: 'María García' },
        { id: 3, numero: '201', piso: 2, torre_id: torreId, propietario_nombre: 'Carlos López' },
      ];
      
      setUnidades(unidadesData);
    } catch (error) {
      console.error('❌ Error cargando unidades:', error);
      setUnidades([]);
    } finally {
      setIsLoadingUnidades(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // Solo permitir ir a pasos anteriores o al siguiente si el actual está completo
    const currentStepData = steps[currentStep - 1];
    if (stepNumber <= currentStep || currentStepData.completado) {
      setCurrentStep(stepNumber);
    }
  };

  const updateFormData = (field: keyof MultaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset cascadas
    if (field === 'comunidad_id') {
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        edificio_id: undefined,
        torre_id: undefined,
        unidad_id: undefined
      }));
    } else if (field === 'edificio_id') {
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        torre_id: undefined,
        unidad_id: undefined
      }));
    } else if (field === 'torre_id') {
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        unidad_id: undefined
      }));
    } else if (field === 'tipo_infraccion_id') {
      const tipoSeleccionado = tiposInfraccion.find(t => t.id === value);
      if (tipoSeleccionado) {
        setFormData(prev => ({ 
          ...prev, 
          tipo_infraccion_id: value,
          tipo_infraccion: tipoSeleccionado.nombre,
          monto: tipoSeleccionado.monto_base
        }));
      }
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setEvidenciaFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setEvidenciaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Preparar datos para enviar
      const submitData: CreateMultaData = {
        tipo_infraccion: formData.tipo_infraccion!,
        descripcion: formData.descripcion!,
        monto: formData.monto!,
        fecha_infraccion: formData.fecha_infraccion!,
        fecha_vencimiento: formData.fecha_vencimiento!,
        prioridad: formData.prioridad || 'media',
        unidad_id: formData.unidad_id!,
        notificar_email: formData.notificar_email || false,
        notificar_sms: formData.notificar_sms || false,
        observaciones: formData.observaciones,
      };

      // TODO: Subir archivos de evidencia si los hay
      if (evidenciaFiles.length > 0) {
        // Aquí subirías los archivos y obtendrías las URLs
        // const urls = await uploadFiles(evidenciaFiles);
        // submitData.evidencia_urls = urls;
      }

      const nuevaMulta = await multasService.createMulta(submitData);
      
      console.log('✅ Multa creada exitosamente:', nuevaMulta);
      
      // Redirigir a la página de detalle de la multa
      router.push(`/multas/${nuevaMulta.id}`);
      
    } catch (error) {
      console.error('❌ Error creando multa:', error);
      // TODO: Mostrar mensaje de error al usuario
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render del wizard header
  const renderWizardHeader = () => (
    <div className="card mb-4">
      <div className="card-body">
        <div className="row">
          {steps.map((step, index) => (
            <div key={step.numero} className="col-3">
              <div 
                className={`d-flex align-items-center ${
                  step.activo ? 'text-primary' : 
                  step.completado ? 'text-success' : 'text-muted'
                } ${step.numero <= currentStep ? 'cursor-pointer' : ''}`}
                onClick={() => handleStepClick(step.numero)}
                style={{ cursor: step.numero <= currentStep ? 'pointer' : 'default' }}
              >
                <div 
                  className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                    step.activo ? 'bg-primary text-white' :
                    step.completado ? 'bg-success text-white' : 'bg-light text-muted'
                  }`}
                  style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}
                >
                  {step.completado ? (
                    <span className="material-icons" style={{ fontSize: '20px' }}>check</span>
                  ) : (
                    step.numero
                  )}
                </div>
                <div>
                  <div className="fw-bold small">{step.titulo}</div>
                  <div className="text-muted" style={{ fontSize: '12px' }}>
                    {step.descripcion}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Step 1: Seleccionar Unidad
  const renderStep1 = () => (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          <span className="material-icons me-2">location_on</span>
          Paso 1: Seleccionar Unidad
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {/* Comunidad */}
          <div className="col-md-6">
            <label className="form-label">Comunidad *</label>
            <select
              className="form-select"
              value={formData.comunidad_id || ''}
              onChange={(e) => updateFormData('comunidad_id', e.target.value ? parseInt(e.target.value) : undefined)}
              disabled={comunidades.length <= 1}
            >
              <option value="">Seleccionar comunidad</option>
              {comunidades.map(comunidad => (
                <option key={comunidad.id} value={comunidad.id}>
                  {comunidad.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Edificio */}
          <div className="col-md-6">
            <label className="form-label">Edificio *</label>
            <select
              className="form-select"
              value={formData.edificio_id || ''}
              onChange={(e) => updateFormData('edificio_id', e.target.value ? parseInt(e.target.value) : undefined)}
              disabled={!formData.comunidad_id || isLoadingEdificios}
            >
              <option value="">
                {isLoadingEdificios ? 'Cargando edificios...' : 'Seleccionar edificio'}
              </option>
              {edificios.map(edificio => (
                <option key={edificio.id} value={edificio.id}>
                  {edificio.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Torre */}
          <div className="col-md-6">
            <label className="form-label">Torre *</label>
            <select
              className="form-select"
              value={formData.torre_id || ''}
              onChange={(e) => updateFormData('torre_id', e.target.value ? parseInt(e.target.value) : undefined)}
              disabled={!formData.edificio_id || isLoadingTorres}
            >
              <option value="">
                {isLoadingTorres ? 'Cargando torres...' : 'Seleccionar torre'}
              </option>
              {torres.map(torre => (
                <option key={torre.id} value={torre.id}>
                  {torre.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Unidad */}
          <div className="col-md-6">
            <label className="form-label">Unidad *</label>
            <select
              className="form-select"
              value={formData.unidad_id || ''}
              onChange={(e) => updateFormData('unidad_id', e.target.value ? parseInt(e.target.value) : undefined)}
              disabled={!formData.torre_id || isLoadingUnidades}
            >
              <option value="">
                {isLoadingUnidades ? 'Cargando unidades...' : 'Seleccionar unidad'}
              </option>
              {unidades.map(unidad => (
                <option key={unidad.id} value={unidad.id}>
                  {unidad.numero} - {unidad.propietario_nombre || 'Sin propietario'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Información de la unidad seleccionada */}
        {formData.unidad_id && (
          <div className="mt-4 p-3 bg-light rounded">
            {(() => {
              const unidadSeleccionada = unidades.find(u => u.id === formData.unidad_id);
              if (!unidadSeleccionada) return null;
              
              return (
                <div>
                  <h6 className="text-primary">Unidad Seleccionada</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Número:</strong> {unidadSeleccionada.numero}<br/>
                      <strong>Piso:</strong> {unidadSeleccionada.piso}
                    </div>
                    <div className="col-md-6">
                      <strong>Propietario:</strong> {unidadSeleccionada.propietario_nombre || 'Sin asignar'}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );

  // Render Step 2: Tipo de Infracción
  const renderStep2 = () => (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          <span className="material-icons me-2">gavel</span>
          Paso 2: Tipo de Infracción
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {/* Tipo de infracción */}
          <div className="col-12">
            <label className="form-label">Tipo de Infracción *</label>
            <select
              className="form-select"
              value={formData.tipo_infraccion_id || ''}
              onChange={(e) => updateFormData('tipo_infraccion_id', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">Seleccionar tipo de infracción</option>
              {tiposInfraccion.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre} - {multasService.formatearMonto(tipo.monto_base)}
                </option>
              ))}
            </select>
          </div>

          {/* Monto personalizado */}
          <div className="col-md-6">
            <label className="form-label">Monto *</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                className="form-control"
                value={formData.monto || ''}
                onChange={(e) => updateFormData('monto', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0"
                min="0"
                step="1000"
              />
            </div>
            <small className="text-muted">
              Puedes modificar el monto base de la infracción
            </small>
          </div>

          {/* Prioridad */}
          <div className="col-md-6">
            <label className="form-label">Prioridad</label>
            <select
              className="form-select"
              value={formData.prioridad || 'media'}
              onChange={(e) => updateFormData('prioridad', e.target.value)}
            >
              <option value="baja">🟢 Baja</option>
              <option value="media">🟡 Media</option>
              <option value="alta">🟠 Alta</option>
              <option value="critica">🔴 Crítica</option>
            </select>
          </div>
        </div>

        {/* Información del tipo seleccionado */}
        {formData.tipo_infraccion_id && (
          <div className="mt-4 p-3 bg-light rounded">
            {(() => {
              const tipoSeleccionado = tiposInfraccion.find(t => t.id === formData.tipo_infraccion_id);
              if (!tipoSeleccionado) return null;
              
              return (
                <div>
                  <h6 className="text-primary">{tipoSeleccionado.nombre}</h6>
                  <p className="mb-2">{tipoSeleccionado.descripcion}</p>
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Categoría:</strong> {tipoSeleccionado.categoria}
                    </div>
                    <div className="col-md-6">
                      <strong>Monto base:</strong> {multasService.formatearMonto(tipoSeleccionado.monto_base)}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );

  // Render Step 3: Detalles
  const renderStep3 = () => (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          <span className="material-icons me-2">description</span>
          Paso 3: Detalles de la Multa
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {/* Descripción */}
          <div className="col-12">
            <label className="form-label">Descripción *</label>
            <textarea
              className="form-control"
              rows={4}
              value={formData.descripcion || ''}
              onChange={(e) => updateFormData('descripcion', e.target.value)}
              placeholder="Describe detalladamente la infracción cometida..."
            />
          </div>

          {/* Fecha de infracción */}
          <div className="col-md-6">
            <label className="form-label">Fecha de Infracción *</label>
            <input
              type="datetime-local"
              className="form-control"
              value={formData.fecha_infraccion || ''}
              onChange={(e) => updateFormData('fecha_infraccion', e.target.value)}
              max={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Fecha de vencimiento */}
          <div className="col-md-6">
            <label className="form-label">Fecha de Vencimiento *</label>
            <input
              type="date"
              className="form-control"
              value={formData.fecha_vencimiento || ''}
              onChange={(e) => updateFormData('fecha_vencimiento', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Upload de evidencia */}
          <div className="col-12">
            <label className="form-label">Evidencia (Fotos/Documentos)</label>
            <div className="border-dashed border-2 border-light p-4 text-center rounded">
              <input
                type="file"
                className="d-none"
                id="evidencia-upload"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <label htmlFor="evidencia-upload" className="cursor-pointer">
                <span className="material-icons display-4 text-muted">cloud_upload</span>
                <div className="mt-2">
                  <div className="btn btn-outline-primary">Subir archivos</div>
                  <div className="text-muted mt-2">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </div>
                  <small className="text-muted">
                    Formatos soportados: JPG, PNG, PDF, DOC, DOCX (máx. 10MB cada uno)
                  </small>
                </div>
              </label>
            </div>

            {/* Archivos subidos */}
            {evidenciaFiles.length > 0 && (
              <div className="mt-3">
                <h6>Archivos seleccionados:</h6>
                <div className="list-group">
                  {evidenciaFiles.map((file, index) => (
                    <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className="material-icons me-2">attachment</span>
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFile(index)}
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div className="col-12">
            <label className="form-label">Observaciones Internas</label>
            <textarea
              className="form-control"
              rows={3}
              value={formData.observaciones || ''}
              onChange={(e) => updateFormData('observaciones', e.target.value)}
              placeholder="Notas internas sobre la multa (no visible para el propietario)..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render Step 4: Revisión
  const renderStep4 = () => (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          <span className="material-icons me-2">preview</span>
          Paso 4: Revisión y Confirmación
        </h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-8">
            {/* Resumen de la multa */}
            <h6 className="text-primary">Resumen de la Multa</h6>
            
            <div className="table-responsive">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <td width="30%" className="text-muted">Unidad:</td>
                    <td>
                      {(() => {
                        const unidad = unidades.find(u => u.id === formData.unidad_id);
                        const comunidad = comunidades.find(c => c.id === formData.comunidad_id);
                        return `${unidad?.numero} - ${comunidad?.nombre}`;
                      })()}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Propietario:</td>
                    <td>{unidades.find(u => u.id === formData.unidad_id)?.propietario_nombre || 'Sin asignar'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Tipo de Infracción:</td>
                    <td>{formData.tipo_infraccion}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Monto:</td>
                    <td className="fw-bold text-danger">
                      {formData.monto ? multasService.formatearMonto(formData.monto) : ''}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Prioridad:</td>
                    <td>
                      <span className={`badge bg-${multasService.getPrioridadColor(formData.prioridad || 'media')}`}>
                        {formData.prioridad}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Fecha Infracción:</td>
                    <td>
                      {formData.fecha_infraccion ? 
                        new Date(formData.fecha_infraccion).toLocaleString('es-CL') : ''
                      }
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Fecha Vencimiento:</td>
                    <td>
                      {formData.fecha_vencimiento ? 
                        new Date(formData.fecha_vencimiento).toLocaleDateString('es-CL') : ''
                      }
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Evidencia:</td>
                    <td>{evidenciaFiles.length} archivo(s) adjunto(s)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Descripción */}
            <h6 className="text-primary mt-4">Descripción</h6>
            <p className="text-muted">{formData.descripcion}</p>

            {/* Observaciones */}
            {formData.observaciones && (
              <>
                <h6 className="text-primary mt-4">Observaciones Internas</h6>
                <p className="text-muted">{formData.observaciones}</p>
              </>
            )}
          </div>

          <div className="col-md-4">
            {/* Configuración de notificaciones */}
            <h6 className="text-primary">Notificaciones</h6>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="notificar-email"
                checked={formData.notificar_email || false}
                onChange={(e) => updateFormData('notificar_email', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="notificar-email">
                📧 Notificar por email
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="notificar-sms"
                checked={formData.notificar_sms || false}
                onChange={(e) => updateFormData('notificar_sms', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="notificar-sms">
                📱 Notificar por SMS
              </label>
            </div>

            {/* Asignar a usuario */}
            <div className="mt-4">
              <label className="form-label">Asignar a:</label>
              <select
                className="form-select"
                value={formData.asignar_a_usuario_id || ''}
                onChange={(e) => updateFormData('asignar_a_usuario_id', e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">Sin asignar</option>
                <option value={user?.id}>{user?.username} (Yo)</option>
                {/* Aquí cargarías otros usuarios */}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render botones de navegación
  const renderNavigationButtons = () => (
    <div className="d-flex justify-content-between align-items-center mt-4">
      <div>
        {currentStep > 1 && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handlePrevious}
            disabled={isSubmitting}
          >
            <span className="material-icons me-2">arrow_back</span>
            Anterior
          </button>
        )}
      </div>

      <div>
        {currentStep < 4 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!steps[currentStep - 1].completado}
          >
            Siguiente
            <span className="material-icons ms-2">arrow_forward</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={isSubmitting || !steps.slice(0, 3).every(s => s.completado)}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creando multa...
              </>
            ) : (
              <>
                <span className="material-icons me-2">check</span>
                Crear Multa
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout title="Nueva Multa">
          <div className="container-fluid py-4">
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3">Cargando datos...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Nueva Multa — Cuentas Claras</title>
      </Head>

      <Layout title="Nueva Multa">
        <div className="container-fluid py-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">Nueva Multa</h1>
              <p className="text-muted mb-0">
                Crea una nueva multa siguiendo el proceso paso a paso
              </p>
            </div>
            <Link href="/multas" className="btn btn-outline-secondary">
              <span className="material-icons me-2">arrow_back</span>
              Volver al listado
            </Link>
          </div>

          {/* Wizard Header */}
          {renderWizardHeader()}

          {/* Contenido del step actual */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navegación */}
          {renderNavigationButtons()}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}