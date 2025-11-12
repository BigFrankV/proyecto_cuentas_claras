import { useRouter } from 'next/router';
import React, { useState, useEffect, useRef } from 'react';

import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/ui/PageHeader';
import multasService, { fetchWithAuth } from '@/lib/multasService';

const MultaNuevaPage: React.FC = () => {
  const router = useRouter();

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

  // Comunidades del usuario (para casos multi-comunidad)
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [selectedComunidadGlobal, setSelectedComunidadGlobal] = useState<
    number | null
  >(null);
  const [comunidadesLoading, setComunidadesLoading] = useState(false);

  const filteredUnits = units.filter(
    unit =>
      (unit.codigo || '').toLowerCase().includes(unitSearch.toLowerCase()) ||
      (unit.owner || unit.propietario || '')
        .toLowerCase()
        .includes(unitSearch.toLowerCase()),
  );

  // Cargar comunidades al montar (si existe endpoint)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setComunidadesLoading(true);
        const base =
          process.env.NEXT_PUBLIC_API_URL &&
          process.env.NEXT_PUBLIC_API_URL !== ''
            ? process.env.NEXT_PUBLIC_API_URL
            : 'http://localhost:3001';
        const resp = await fetchWithAuth(`${base}/multas/comunidades/mis`, {
          method: 'GET',
        });
        if (!resp.ok) {
          // eslint-disable-next-line no-console
          console.warn(
            'No se pudieron cargar comunidades (status):',
            resp.status,
          );
          return;
        }
        const json = await resp.json();
        const data = Array.isArray(json) ? json : json.data || [];
        if (!mounted) {
          return;
        }
        setComunidades(data);
        if (Array.isArray(data) && data.length === 1) {
          setSelectedComunidadGlobal(Number(data[0].id));
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error cargando comunidades:', err);
      } finally {
        setComunidadesLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Debounce y carga de unidades desde backend (incluye comunidadId si fue seleccionada)
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoadingUnits(true);
        const data =
          await multasService.obtenerUnidadesAutocompletar(unitSearch);
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
  }, [unitSearch, selectedComunidadGlobal]);

  // UI: helper para mostrar select de comunidades en Step 2
  const renderComunidadSelector = () => {
    if (comunidadesLoading) {
      return <div className='mb-3'>Cargando comunidades...</div>;
    }
    if (!comunidades || comunidades.length <= 1) {
      if (comunidades && comunidades.length === 1) {
        return (
          <div className='mb-3'>
            <strong>Comunidad:</strong> {comunidades[0].razon_social}
          </div>
        );
      }
      return null;
    }
    return (
      <div className='mb-3'>
        <label className='form-label'>Comunidad</label>
        <select
          className='form-select'
          value={selectedComunidadGlobal ?? ''}
          onChange={e =>
            setSelectedComunidadGlobal(
              e.target.value ? Number(e.target.value) : null,
            )
          }
        >
          <option value=''>-- Seleccione comunidad --</option>
          {comunidades.map(c => (
            <option key={c.id} value={c.id}>
              {c.razon_social}
            </option>
          ))}
        </select>
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

    const tipoIdNum = (selectedViolation as any)?.id
      ? Number((selectedViolation as any).id)
      : undefined;
    const payload: any = {
      comunidad_id: selectedUnitComunidadId ?? undefined,
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
      <div className='container-fluid p-4'>
        <PageHeader
          title="Nueva Multa"
          subtitle="Crear una nueva multa paso a paso"
          icon="add_circle"
        >
          <button
            className="btn btn-secondary"
            onClick={() => window.history.back()}
          >
            <i className="material-icons me-2">arrow_back</i>
            Cancelar
          </button>
        </PageHeader>

        {/* Wizard steps */}
        <div className='wizard-steps mb-4 d-flex gap-3'>
          <div
            className={`wizard-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
          >
            <div className='wizard-step-number'>1</div>
            <div className='wizard-step-title'>Tipo de infracción</div>
          </div>
          <div
            className={`wizard-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
          >
            <div className='wizard-step-number'>2</div>
            <div className='wizard-step-title'>Buscar unidad</div>
          </div>
          <div
            className={`wizard-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}
          >
            <div className='wizard-step-number'>3</div>
            <div className='wizard-step-title'>Detalles</div>
          </div>
          <div className={`wizard-step ${currentStep >= 4 ? 'active' : ''}`}>
            <div className='wizard-step-number'>4</div>
            <div className='wizard-step-title'>Revisión</div>
          </div>
        </div>

        {/* Step 1 */}
        <div className={`wizard-section ${currentStep === 1 ? 'active' : ''}`}>
          <h4 className='mb-4'>Seleccione el tipo de infracción</h4>
          <div className='row'>
            {violationTypes.map(v => (
              <div key={v.id} className='col-md-6 col-lg-3 mb-4'>
                <div
                  className={`violation-type-card card p-2 ${selectedViolationType === v.id ? 'selected border-primary shadow-sm' : ''}`}
                  style={{ cursor: 'pointer', minHeight: 120 }}
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
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-3 d-flex align-items-center'
                      style={{ minWidth: 48 }}
                    >
                      <span
                        className='material-icons'
                        style={{
                          background: v.color,
                          color: '#fff',
                          borderRadius: 8,
                          padding: 8,
                          fontSize: 24,
                          lineHeight: '24px',
                        }}
                        aria-hidden
                      >
                        {v.icon}
                      </span>
                    </div>
                    <div className='flex-grow-1'>
                      <h5 className='mb-1' style={{ color: v.color }}>
                        {v.title}
                      </h5>
                      <p className='small mb-1'>{v.description}</p>
                      <p className='mb-0'>
                        <strong>{v.amount.toLocaleString('es-CL')} CLP</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2 */}
        <div className={`wizard-section ${currentStep === 2 ? 'active' : ''}`}>
          <h4 className='mb-4'>Buscar unidad infractora</h4>
          {renderComunidadSelector()}
          <div className='mb-4'>
            <input
              type='text'
              className='form-control'
              placeholder={
                comunidades &&
                comunidades.length > 1 &&
                !selectedComunidadGlobal
                  ? 'Seleccione comunidad primero...'
                  : 'Buscar por número de unidad o nombre del propietario...'
              }
              value={unitSearch}
              onChange={e => setUnitSearch(e.target.value)}
              disabled={
                comunidades &&
                comunidades.length > 1 &&
                !selectedComunidadGlobal
              }
            />
          </div>

          <div>
            <div className='list-group'>
              {filteredUnits.map(u => (
                <button
                  key={u.id}
                  type='button'
                  className={`list-group-item list-group-item-action ${selectedUnitId === u.id ? 'active' : ''}`}
                  onClick={() => handleSelectUnit(u)}
                >
                  <div className='d-flex w-100 justify-content-between'>
                    <div>
                      <h5 className='mb-1'>{u.codigo}</h5>
                      <small className='text-muted'>
                        {u.owner || u.propietario || '-'}
                      </small>
                    </div>
                    <div>
                      <small className='text-muted'>{u.details || ''}</small>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className={`wizard-section ${currentStep === 3 ? 'active' : ''}`}>
          <h4 className='mb-4'>Detalles de la multa</h4>
          <div className='row'>
            <div className='col-md-8'>
              <div className='form-section mb-3'>
                <h5 className='form-section-title'>
                  <i className='material-icons me-2'>description</i>
                  Información básica
                </h5>
                <div className='mb-3'>
                  <label className='form-label'>Descripción detallada</label>
                  <textarea
                    className='form-control'
                    rows={4}
                    placeholder='Describa la infracción cometida...'
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                  ></textarea>
                </div>
                <div className='row'>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>Fecha de la infracción</label>
                    <input
                      type='date'
                      className='form-control'
                      value={fechaInfraccion}
                      onChange={e => setFechaInfraccion(e.target.value)}
                    />
                  </div>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>
                      Fecha de vencimiento (opcional)
                    </label>
                    <input
                      type='date'
                      className='form-control'
                      value={fechaVencimiento}
                      onChange={e => setFechaVencimiento(e.target.value)}
                    />
                  </div>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>Monto (CLP)</label>
                    <input
                      type='number'
                      className='form-control'
                      value={monto}
                      onChange={e =>
                        setMonto(
                          e.target.value === '' ? '' : Number(e.target.value),
                        )
                      }
                      min={0}
                    />
                  </div>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>Prioridad</label>
                    <select
                      className='form-select'
                      value={prioridad}
                      onChange={e =>
                        setPrioridad(mapPriority(e.target.value) as any)
                      }
                    >
                      <option value='media'>Media</option>
                      <option value='baja'>Baja</option>
                      <option value='alta'>Alta</option>
                      <option value='critica'>Crítica</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className='form-section'>
                <h5 className='form-section-title'>
                  <i className='material-icons me-2'>attach_file</i>
                  Evidencia
                </h5>
                <div
                  className='evidence-upload-zone border rounded p-4 text-center'
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  role='button'
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  <i className='material-icons mb-2' style={{ fontSize: 36 }}>
                    cloud_upload
                  </i>
                  <div>Haga clic para subir archivos o arrastre y suelte</div>
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
                <div id='uploadedFiles' className='mt-3'>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className='uploaded-file d-flex align-items-center justify-content-between border rounded p-2 mb-2'
                    >
                      <div className='d-flex align-items-center'>
                        <div className='file-icon me-3'>
                          <i className='material-icons'>insert_drive_file</i>
                        </div>
                        <div>
                          <div className='file-name'>{file.name}</div>
                          <div className='file-size text-muted'>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        className='btn btn-sm btn-outline-danger'
                        onClick={() => removeFile(index)}
                      >
                        <i className='material-icons'>close</i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='col-md-4'>
              <div className='form-section'>
                <h5 className='form-section-title'>
                  <i className='material-icons me-2'>info</i>
                  Resumen
                </h5>
                <div className='summary-item mb-2'>
                  <div className='summary-label text-muted'>
                    Tipo de infracción
                  </div>
                  <div className='summary-value'>
                    {selectedViolation?.title || '-'}
                  </div>
                </div>
                <div className='summary-item mb-2'>
                  <div className='summary-label text-muted'>Unidad</div>
                  <div className='summary-value'>{selectedUnitCode || '-'}</div>
                </div>
                <div className='summary-item mb-2'>
                  <div className='summary-label text-muted'>Monto</div>
                  <div className='summary-value'>
                    {monto
                      ? `${Number(monto).toLocaleString('es-CL')} CLP`
                      : '-'}
                  </div>
                </div>
                <div className='summary-item mb-2'>
                  <div className='summary-label text-muted'>Archivos</div>
                  <div className='summary-value'>
                    {uploadedFiles.length} adjuntos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className={`wizard-section ${currentStep === 4 ? 'active' : ''}`}>
          <h4 className='mb-4'>Revisar y crear multa</h4>
          <div className='row'>
            <div className='col-md-8'>
              <div id='reviewContent'>
                <div className='alert alert-info'>
                  <i className='material-icons me-2'>info</i>
                  Revise la información antes de crear la multa.
                </div>
                <dl>
                  <dt>Tipo</dt>
                  <dd>{selectedViolation?.title}</dd>
                  <dt>Unidad</dt>
                  <dd>{selectedUnitCode}</dd>
                  <dt>Monto</dt>
                  <dd>
                    {monto
                      ? `${Number(monto).toLocaleString('es-CL')} CLP`
                      : '-'}
                  </dd>
                  <dt>Fecha</dt>
                  <dd>{fechaInfraccion || '-'}</dd>
                  <dt>Prioridad</dt>
                  <dd>{prioridad}</dd>
                  <dt>Descripción</dt>
                  <dd>{descripcion || '-'}</dd>
                </dl>
              </div>
            </div>
            <div className='col-md-4'>
              <div className='form-section'>
                <h5 className='form-section-title'>
                  <i className='material-icons me-2'>check_circle</i>
                  Confirmación
                </h5>
                <p>¿Está seguro de que desea crear esta multa?</p>
                <div className='d-grid'>
                  <button className='btn btn-success' onClick={handleSubmit}>
                    <i className='material-icons me-2'>check</i>
                    Crear Multa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className='navigation-buttons mt-4 d-flex justify-content-between'>
          <div>
            <button
              className='btn btn-outline-secondary me-2'
              onClick={() => changeStep(-1)}
              disabled={currentStep === 1}
            >
              <i className='material-icons me-2'>arrow_back</i>
              Anterior
            </button>
            {currentStep < 4 && (
              <button
                className='btn btn-primary'
                onClick={() => {
                  if (validateStep(currentStep)) {
                    changeStep(1);
                  } else {
                    window.alert(
                      'Completa los campos obligatorios en este paso.',
                    );
                  }
                }}
              >
                Siguiente
                <i className='material-icons ms-2'>arrow_forward</i>
              </button>
            )}
          </div>

          <div>
            {currentStep === 4 ? (
              <button className='btn btn-success' onClick={handleSubmit}>
                <i className='material-icons me-2'>check</i>
                Crear Multa
              </button>
            ) : (
              <button
                className='btn btn-secondary'
                onClick={() => setCurrentStep(4)}
              >
                Revisar
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MultaNuevaPage;
