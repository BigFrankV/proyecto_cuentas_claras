import { useRouter } from 'next/router';
import React, { useState, useEffect, useRef } from 'react';

import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/ui/PageHeader';
import multasService, { fetchWithAuth } from '@/lib/multasService';
import { useComunidad } from '@/lib/useComunidad';

const MultaNuevaPage: React.FC = () => {
  const router = useRouter();
  const { comunidadSeleccionada } = useComunidad();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedViolationType, setSelectedViolationType] = useState<
    number | null
  >(null);
  const [selectedUnitCode, setSelectedUnitCode] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedUnitComunidadId, setSelectedUnitComunidadId] = useState<
    number | null
  >(null);
  const [unitSearch, setUnitSearch] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Campos del paso "Detalles"
  const [monto, setMonto] = useState<number | ''>('');
  const [fechaInfraccion, setFechaInfraccion] = useState<string>('');
  const [fechaVencimiento, setFechaVencimiento] = useState<string>('');
  const [prioridad, setPrioridad] = useState<
    'baja' | 'media' | 'alta' | 'critica'
  >('media');
  const [descripcion, setDescripcion] = useState<string>('');

  const [violationTypes, setViolationTypes] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Unidades vendrán desde backend (autocompletar)
  const [units, setUnits] = useState<any[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const filteredUnits = units.filter(
    unit =>
      (unit.codigo || '').toLowerCase().includes(unitSearch.toLowerCase()) ||
      (unit.owner || unit.propietario || '')
        .toLowerCase()
        .includes(unitSearch.toLowerCase()),
  );

  // Cargar tipos de infracción cuando se selecciona una comunidad
  useEffect(() => {
    if (!comunidadSeleccionada) {
      setViolationTypes([]);
      return undefined;
    }

    (async () => {
      try {
        const comunidadId = Number(comunidadSeleccionada.id);
        const tipos = await multasService.obtenerTipos(comunidadId);
        setViolationTypes(
          (tipos || []).map((t: any, i: number) => ({
            id: t.id,
            title: t.nombre,
            description: t.descripcion,
            amount: Number(t.monto_default || 0),
            icon:
              t.icono ||
              ['warning', 'gavel', 'pets', 'cleaning_services'][i % 4],
            color: t.color || '#6f42c1',
          })),
        );
      } catch (err) {
        console.error('Error cargando tipos de infracción:', err);
      }
    })();
  }, [comunidadSeleccionada]);

  // Debounce y carga de unidades desde backend (incluye comunidadId si fue seleccionada)
  useEffect(() => {
    if (!comunidadSeleccionada) {
      setUnits([]);
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingUnits(true);
        const comunidadId = Number(comunidadSeleccionada.id);
        const data = await multasService.obtenerUnidadesAutocompletar(
          unitSearch,
          comunidadId,
        );
        const mappedData = data.map((u: any) => ({
          id: u.id,
          codigo: u.codigo,
          comunidad_id: u.comunidad_id ?? null,
          owner: u.propietario || '',
          propietario: u.propietario || '',
          details: '', // Ajusta si necesitas más detalles
          edificio_id: null,
          torre_id: null,
        }));
        setUnits(mappedData);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error cargando unidades:', err);
        setUnits([]);
      } finally {
        setLoadingUnits(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [unitSearch, comunidadSeleccionada]);

  // UI: mostrar comunidad seleccionada
  const renderComunidadInfo = () => {
    if (!comunidadSeleccionada) {
      return (
        <div className='alert alert-info mb-3'>
          <span className='material-icons me-2'>info</span>
          Por favor selecciona una comunidad del menú superior
        </div>
      );
    }
    return (
      <div className='mb-3'>
        <label className='form-label'>Comunidad</label>
        <div className='form-control bg-light'>
          {comunidadSeleccionada.nombre}
        </div>
      </div>
    );
  };

  const handleSelectUnit = async (unit: {
    id: number;
    codigo: string;
    comunidad_id?: number;
  }) => {
    setSelectedUnitCode(unit.codigo);
    setSelectedUnitId(unit.id);
    setSelectedUnitComunidadId(unit.comunidad_id ?? null);

    // Opcional: recargar tipos filtrados por comunidad para mejor UX
    try {
      if (unit.comunidad_id) {
        const tipos = await multasService.obtenerTipos(
          Number(unit.comunidad_id),
        );
        setViolationTypes(
          (tipos || []).map((t: any, i: number) => ({
            id: t.id,
            title: t.nombre,
            description: t.descripcion,
            amount: Number(t.monto_default || 0),
            icon:
              t.icono ||
              ['warning', 'gavel', 'pets', 'cleaning_services'][i % 4],
            color: t.color || '#6f42c1',
          })),
        );
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error recargando tipos por comunidad:', err);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) {
      return;
    }
    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const changeStep = (direction: number) => {
    const newStep = currentStep + direction;
    if (newStep >= 1 && newStep <= 4) {
      setCurrentStep(newStep);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return selectedViolationType !== null;
      case 2:
        return selectedUnitId !== null;
      case 3:
        if (monto === '' || Number(monto) <= 0) {
          return false;
        }
        if (!fechaInfraccion) {
          return false;
        }
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const selectedViolation = violationTypes.find(
    v => v.id === selectedViolationType,
  );

  useEffect(() => {
    (async () => {
      try {
        const tipos = await multasService.obtenerTipos();
        setViolationTypes(
          tipos.map((t: any, i: number) => ({
            id: t.id,
            title: t.nombre,
            description: t.descripcion,
            amount: Number(t.monto_default || 0),
            icon:
              t.icono ||
              ['warning', 'gavel', 'pets', 'cleaning_services'][i % 4],
            color: t.color || '#6f42c1',
          })),
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error cargando tipos:', e);
        setViolationTypes([
          {
            id: 1,
            title: 'Ruido excesivo',
            description: 'Violación de normas de ruido',
            amount: 50000,
            icon: 'volume_up',
            color: '#ff6b6b',
          },
          {
            id: 2,
            title: 'Estacionamiento indebido',
            description: 'Vehículo mal estacionado',
            amount: 30000,
            icon: 'local_parking',
            color: '#6f42c1',
          },
          {
            id: 3,
            title: 'Mascotas sin control',
            description: 'Mascotas sin correa o supervisión',
            amount: 25000,
            icon: 'pets',
            color: '#0d6efd',
          },
          {
            id: 4,
            title: 'Falta de limpieza',
            description: 'Áreas comunes sucias',
            amount: 20000,
            icon: 'cleaning_services',
            color: '#198754',
          },
        ]);
      }
    })();
  }, []);

  const mapPriority = (p: string) => {
    switch (p) {
      case 'low':
        return 'baja';
      case 'medium':
        return 'media';
      case 'high':
        return 'alta';
      case 'critical':
        return 'critica';
      default:
        return p;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      window.alert(
        'Completa todos los campos obligatorios antes de crear la multa.',
      );
      return;
    }
    if (!selectedUnitId) {
      window.alert('Debe seleccionar una unidad válida.');
      return;
    }
    if (!selectedViolation) {
      window.alert('Seleccione un tipo de infracción.');
      return;
    }
    if (!comunidadSeleccionada) {
      window.alert('Debe seleccionar una comunidad.');
      return;
    }

    const tipoIdNum = (selectedViolation as any)?.id
      ? Number((selectedViolation as any).id)
      : undefined;
    const payload: any = {
      comunidad_id: Number(comunidadSeleccionada.id),
      unidad_id: selectedUnitId,
      tipo_infraccion_id: tipoIdNum,
      tipo_infraccion: selectedViolation.title,
      motivo: selectedViolation.description || selectedViolation.title,
      monto: Number(monto),
      descripcion: descripcion || null,
      fecha_infraccion: fechaInfraccion || null,
      prioridad,
    };
    if (fechaVencimiento) {
      payload.fecha_vencimiento = fechaVencimiento;
    }

    try {
      const createdMulta = await multasService.createMulta(payload);
      const multaId = createdMulta?.id;
      if (!multaId) {
        // eslint-disable-next-line no-console

        // eslint-disable-next-line no-console
        console.warn('Respuesta creación multa inesperada:', createdMulta);
        window.alert('Multa creada pero no se obtuvo id. Revisa logs.');
        router.push('/multas');
        return;
      }

      if (uploadedFiles.length > 0) {
        try {
          await multasService.uploadDocumentos(multaId, uploadedFiles);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error en upload:', err);
          window.alert('Multa creada pero fallo la subida de archivos.');
        }
      }

      window.alert('Multa creada correctamente.');
      router.push(`/multas/${multaId}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error creando multa:', err);
      window.alert('Error al crear la multa. Revisa la consola.');
    }
  };

  return (
    <Layout title='Nueva Multa'>
      <div className='multa-nueva-page'>
        <PageHeader
          title="Nueva Multa"
          subtitle="Crear una nueva multa paso a paso"
          icon="add_circle"
        >
          <button
            className="btn-secondary-action"
            onClick={() => window.history.back()}
          >
            <span className="material-icons">arrow_back</span>
            Cancelar
          </button>
        </PageHeader>

        <div className="content-card">
          {/* Wizard steps */}
          <div className='wizard-steps'>
            <div className={`wizard-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className='step-indicator'>
                {currentStep > 1 ? <span className="material-icons">check</span> : '1'}
              </div>
              <div className='step-label'>Tipo de Infracción</div>
            </div>
            <div className="step-connector"></div>
            <div className={`wizard-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className='step-indicator'>
                {currentStep > 2 ? <span className="material-icons">check</span> : '2'}
              </div>
              <div className='step-label'>Unidad</div>
            </div>
            <div className="step-connector"></div>
            <div className={`wizard-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
              <div className='step-indicator'>
                {currentStep > 3 ? <span className="material-icons">check</span> : '3'}
              </div>
              <div className='step-label'>Detalles</div>
            </div>
            <div className="step-connector"></div>
            <div className={`wizard-step ${currentStep >= 4 ? 'active' : ''}`}>
              <div className='step-indicator'>4</div>
              <div className='step-label'>Revisión</div>
            </div>
          </div>

          <div className="wizard-content">
            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="fade-in">
                <h3 className='section-title'>Seleccione el tipo de infracción</h3>
                <div className='violation-grid'>
                  {violationTypes.map(v => (
                    <div
                      key={v.id}
                      className={`violation-card ${selectedViolationType === v.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedViolationType(v.id);
                        setMonto(v.amount);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedViolationType(v.id);
                          setMonto(v.amount);
                        }
                      }}
                      role='button'
                      tabIndex={0}
                    >
                      <div className="violation-icon" style={{ backgroundColor: `${v.color}15`, color: v.color }}>
                        <span className="material-icons">{v.icon}</span>
                      </div>
                      <div className="violation-info">
                        <h4 style={{ color: selectedViolationType === v.id ? v.color : 'inherit' }}>{v.title}</h4>
                        <p>{v.description}</p>
                        <div className="violation-amount">
                          ${v.amount.toLocaleString('es-CL')}
                        </div>
                      </div>
                      {selectedViolationType === v.id && (
                        <div className="selection-check">
                          <span className="material-icons">check_circle</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="fade-in">
                <h3 className='section-title'>Buscar unidad infractora</h3>
                <div className="search-section">
                  {renderComunidadInfo()}
                  <div className="search-box">
                    <span className="material-icons search-icon">search</span>
                    <input
                      type='text'
                      className='search-input'
                      placeholder={
                        !comunidadSeleccionada
                          ? 'Seleccione comunidad primero...'
                          : 'Buscar por número de unidad o nombre del propietario...'
                      }
                      value={unitSearch}
                      onChange={e => setUnitSearch(e.target.value)}
                      disabled={!comunidadSeleccionada}
                      autoFocus
                    />
                  </div>

                  <div className='units-list'>
                    {filteredUnits.length > 0 ? (
                      filteredUnits.map(u => (
                        <button
                          key={u.id}
                          type='button'
                          className={`unit-item ${selectedUnitId === u.id ? 'selected' : ''}`}
                          onClick={() => handleSelectUnit(u)}
                        >
                          <div className="unit-icon">
                            <span className="material-icons">apartment</span>
                          </div>
                          <div className='unit-details'>
                            <div className="unit-code">{u.codigo}</div>
                            <div className="unit-owner">{u.owner || u.propietario || 'Sin propietario'}</div>
                          </div>
                          {selectedUnitId === u.id && (
                            <span className="material-icons text-primary">check_circle</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="empty-search">
                        <span className="material-icons">search_off</span>
                        <p>No se encontraron unidades</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="fade-in">
                <h3 className='section-title'>Detalles de la multa</h3>
                <div className='details-grid'>
                  <div className='main-form'>
                    <div className='form-group mb-4'>
                      <label className='form-label'>Descripción detallada</label>
                      <textarea
                        className='form-control'
                        rows={4}
                        placeholder='Describa la infracción cometida...'
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                      ></textarea>
                    </div>
                    
                    <div className='row g-3'>
                      <div className='col-md-6'>
                        <label className='form-label'>Fecha de la infracción</label>
                        <input
                          type='date'
                          className='form-control'
                          value={fechaInfraccion}
                          onChange={e => setFechaInfraccion(e.target.value)}
                        />
                      </div>
                      <div className='col-md-6'>
                        <label className='form-label'>Fecha de vencimiento (opcional)</label>
                        <input
                          type='date'
                          className='form-control'
                          value={fechaVencimiento}
                          onChange={e => setFechaVencimiento(e.target.value)}
                        />
                      </div>
                      <div className='col-md-6'>
                        <label className='form-label'>Monto (CLP)</label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type='number'
                            className='form-control'
                            value={monto}
                            onChange={e => setMonto(e.target.value === '' ? '' : Number(e.target.value))}
                            min={0}
                          />
                        </div>
                      </div>
                      <div className='col-md-6'>
                        <label className='form-label'>Prioridad</label>
                        <select
                          className='form-select'
                          value={prioridad}
                          onChange={e => setPrioridad(mapPriority(e.target.value) as any)}
                        >
                          <option value='baja'>Baja</option>
                          <option value='media'>Media</option>
                          <option value='alta'>Alta</option>
                          <option value='critica'>Crítica</option>
                        </select>
                      </div>
                    </div>

                    <div className='evidence-section mt-4'>
                      <label className='form-label mb-2'>Evidencia</label>
                      <div
                        className='upload-zone'
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        role='button'
                        tabIndex={0}
                      >
                        <span className='material-icons upload-icon'>cloud_upload</span>
                        <div className="upload-text">
                          <strong>Haga clic para subir archivos</strong> o arrastre y suelte
                        </div>
                        <small className='text-muted'>PNG, JPG, PDF hasta 10MB</small>
                      </div>
                      <input
                        ref={fileInputRef}
                        type='file'
                        id='evidenceFiles'
                        multiple
                        style={{ display: 'none' }}
                        onChange={e => handleFileUpload(e.target.files)}
                      />
                      
                      {uploadedFiles.length > 0 && (
                        <div className='uploaded-files-list'>
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className='file-item'>
                              <div className="file-info">
                                <span className='material-icons file-icon'>description</span>
                                <div>
                                  <div className='file-name'>{file.name}</div>
                                  <div className='file-size'>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                </div>
                              </div>
                              <button className='btn-icon-danger' onClick={() => removeFile(index)}>
                                <span className='material-icons'>close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='summary-sidebar'>
                    <div className='summary-card'>
                      <h4 className='summary-title'>Resumen Actual</h4>
                      <div className='summary-row'>
                        <span className='label'>Tipo</span>
                        <span className='value'>{selectedViolation?.title || '-'}</span>
                      </div>
                      <div className='summary-row'>
                        <span className='label'>Unidad</span>
                        <span className='value'>{selectedUnitCode || '-'}</span>
                      </div>
                      <div className='summary-row'>
                        <span className='label'>Monto</span>
                        <span className='value highlight'>
                          {monto ? `$${Number(monto).toLocaleString('es-CL')}` : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <div className="fade-in">
                <h3 className='section-title'>Revisar y Confirmar</h3>
                <div className='review-container'>
                  <div className='review-card'>
                    <div className="review-header">
                      <div className="review-icon">
                        <span className="material-icons">assignment</span>
                      </div>
                      <div>
                        <h4>Resumen de la Multa</h4>
                        <p>Por favor verifique que toda la información sea correcta</p>
                      </div>
                    </div>
                    
                    <div className="review-grid">
                      <div className="review-item">
                        <label>Tipo de Infracción</label>
                        <div className="value">{selectedViolation?.title}</div>
                      </div>
                      <div className="review-item">
                        <label>Unidad</label>
                        <div className="value">{selectedUnitCode}</div>
                      </div>
                      <div className="review-item">
                        <label>Monto</label>
                        <div className="value highlight">
                          {monto ? `$${Number(monto).toLocaleString('es-CL')}` : '-'}
                        </div>
                      </div>
                      <div className="review-item">
                        <label>Prioridad</label>
                        <div className="value">
                          <span className={`priority-badge priority-${prioridad}`}>
                            {prioridad}
                          </span>
                        </div>
                      </div>
                      <div className="review-item">
                        <label>Fecha Infracción</label>
                        <div className="value">{fechaInfraccion || '-'}</div>
                      </div>
                      <div className="review-item full-width">
                        <label>Descripción</label>
                        <div className="value">{descripcion || '-'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="confirmation-actions">
                    <p className="confirmation-text">
                      Al confirmar, se generará la multa y se notificará al residente correspondiente.
                    </p>
                    <button className='btn-primary-lg' onClick={handleSubmit}>
                      <span className='material-icons'>check_circle</span>
                      Confirmar y Crear Multa
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className='wizard-footer'>
            <button
              className='btn-secondary-action'
              onClick={() => changeStep(-1)}
              disabled={currentStep === 1}
            >
              <span className='material-icons'>arrow_back</span>
              Anterior
            </button>

            {currentStep < 4 && (
              <button
                className='btn-primary-action'
                onClick={() => {
                  if (validateStep(currentStep)) {
                    changeStep(1);
                  } else {
                    window.alert('Por favor complete los campos requeridos para continuar.');
                  }
                }}
              >
                Siguiente
                <span className='material-icons'>arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .multa-nueva-page {
          padding: 1.5rem;
          background-color: #f8f9fa;
          min-height: 100vh;
        }

        .content-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e9ecef;
          margin-top: 2rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 600px;
        }

        /* Wizard Steps */
        .wizard-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2rem 4rem;
          background: #fff;
          border-bottom: 1px solid #e9ecef;
        }

        .wizard-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          z-index: 1;
          opacity: 0.5;
          transition: all 0.3s;
        }

        .wizard-step.active {
          opacity: 1;
        }

        .step-indicator {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e9ecef;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s;
          line-height: 1;
        }

        .wizard-step.active .step-indicator {
          background: #2a5298;
          color: white;
          box-shadow: 0 0 0 4px rgba(42, 82, 152, 0.1);
        }

        .wizard-step.completed .step-indicator {
          background: #4caf50;
          color: white;
        }

        .step-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #495057;
        }

        .step-connector {
          flex: 1;
          height: 2px;
          background: #e9ecef;
          margin: 0 1rem;
          margin-bottom: 1.5rem;
        }

        /* Wizard Content */
        .wizard-content {
          flex: 1;
          padding: 2rem 4rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #212529;
          margin-bottom: 2rem;
          text-align: center;
        }

        /* Violation Grid */
        .violation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .violation-card {
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .violation-card:hover {
          border-color: #2a5298;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .violation-card.selected {
          border-color: #2a5298;
          background: #f8f9fa;
          box-shadow: 0 0 0 2px rgba(42, 82, 152, 0.1);
        }

        .violation-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          line-height: 1;
        }

        .violation-info h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .violation-info p {
          font-size: 0.85rem;
          color: #6c757d;
          margin: 0 0 0.5rem 0;
          line-height: 1.4;
        }

        .violation-amount {
          font-weight: 700;
          color: #212529;
        }

        .selection-check {
          position: absolute;
          top: 1rem;
          right: 1rem;
          color: #2a5298;
        }

        /* Search Section */
        .search-section {
          max-width: 600px;
          margin: 0 auto;
        }

        .search-box {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #adb5bd;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 1px solid #dee2e6;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #2a5298;
          box-shadow: 0 0 0 4px rgba(42, 82, 152, 0.1);
        }

        .units-list {
          border: 1px solid #e9ecef;
          border-radius: 12px;
          overflow: hidden;
          max-height: 400px;
          overflow-y: auto;
        }

        .unit-item {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 1rem;
          border: none;
          background: white;
          border-bottom: 1px solid #e9ecef;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .unit-item:last-child {
          border-bottom: none;
        }

        .unit-item:hover {
          background: #f8f9fa;
        }

        .unit-item.selected {
          background: #e3f2fd;
        }

        .unit-icon {
          width: 40px;
          height: 40px;
          background: #f8f9fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
          margin-right: 1rem;
          line-height: 1;
        }

        .unit-details {
          flex: 1;
        }

        .unit-code {
          font-weight: 600;
          color: #212529;
        }

        .unit-owner {
          font-size: 0.85rem;
          color: #6c757d;
        }

        .empty-search {
          padding: 3rem;
          text-align: center;
          color: #adb5bd;
        }

        .empty-search .material-icons {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        /* Details Grid */
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
        }

        .upload-zone {
          border: 2px dashed #dee2e6;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #f8f9fa;
        }

        .upload-zone:hover {
          border-color: #2a5298;
          background: #e3f2fd;
        }

        .upload-icon {
          font-size: 3rem;
          color: #adb5bd;
          margin-bottom: 1rem;
        }

        .uploaded-files-list {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .file-icon {
          color: #2a5298;
        }

        .file-name {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .file-size {
          font-size: 0.75rem;
          color: #6c757d;
        }

        .btn-icon-danger {
          background: none;
          border: none;
          color: #dc3545;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .btn-icon-danger:hover {
          background: #fee2e2;
        }

        .summary-card {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .summary-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .summary-row .label {
          color: #6c757d;
        }

        .summary-row .value {
          font-weight: 600;
          color: #212529;
          text-align: right;
        }

        .summary-row .value.highlight {
          color: #2a5298;
          font-size: 1.1rem;
        }

        /* Review Section */
        .review-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .review-card {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .review-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }

        .review-icon {
          width: 48px;
          height: 48px;
          background: #e3f2fd;
          color: #2a5298;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .review-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .review-item label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #6c757d;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .review-item .value {
          font-size: 1.1rem;
          font-weight: 500;
          color: #212529;
        }

        .review-item .value.highlight {
          color: #2a5298;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .review-item.full-width {
          grid-column: 1 / -1;
        }

        .confirmation-actions {
          text-align: center;
        }

        .confirmation-text {
          color: #6c757d;
          margin-bottom: 1.5rem;
        }

        /* Footer */
        .wizard-footer {
          padding: 1.5rem 4rem;
          background: #fff;
          border-top: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Buttons */
        .btn-primary-action, .btn-primary-lg {
          background: #2a5298;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-primary-lg {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          margin: 0 auto;
        }

        .btn-primary-action:hover, .btn-primary-lg:hover {
          background: #1e3c72;
          transform: translateY(-1px);
        }

        .btn-secondary-action {
          background: white;
          color: #495057;
          border: 1px solid #dee2e6;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-secondary-action:hover {
          background: #f8f9fa;
          color: #212529;
          border-color: #adb5bd;
        }

        .priority-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .priority-baja { background-color: #f1f8e9; color: #33691e; }
        .priority-media { background-color: #fffde7; color: #f57f17; }
        .priority-alta { background-color: #ffebee; color: #c62828; }
        .priority-critica { background-color: #ffebee; color: #b71c1c; border: 1px solid #ffcdd2; }

        @media (max-width: 768px) {
          .wizard-steps, .wizard-content, .wizard-footer {
            padding: 1.5rem;
          }
          
          .step-label {
            display: none;
          }
          
          .details-grid {
            grid-template-columns: 1fr;
          }
          
          .review-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
};

export default MultaNuevaPage;
