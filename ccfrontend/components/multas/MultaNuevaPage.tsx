import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';

const MultaNuevaPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedViolationType, setSelectedViolationType] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [unitSearch, setUnitSearch] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const violationTypes = [
    { id: 'noise', title: 'Ruido excesivo', description: 'Violación de normas de ruido', amount: 50000, icon: 'volume_up' },
    { id: 'parking', title: 'Estacionamiento indebido', description: 'Vehículo mal estacionado', amount: 30000, icon: 'local_parking' },
    { id: 'pets', title: 'Mascotas sin control', description: 'Mascotas sin correa o supervisión', amount: 25000, icon: 'pets' },
    { id: 'cleanliness', title: 'Falta de limpieza', description: 'Áreas comunes sucias', amount: 20000, icon: 'cleaning_services' }
  ];

  const units = [
    { id: 'A-101', owner: 'Juan Pérez', details: 'Piso 1, Torre A' },
    { id: 'B-205', owner: 'María González', details: 'Piso 2, Torre B' },
    { id: 'C-303', owner: 'Carlos Rodríguez', details: 'Piso 3, Torre C' }
  ];

  const filteredUnits = units.filter(unit =>
    unit.id.toLowerCase().includes(unitSearch.toLowerCase()) ||
    unit.owner.toLowerCase().includes(unitSearch.toLowerCase())
  );

  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
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
        return selectedUnit !== null;
      case 3:
        return true; // Basic validation for step 3
      case 4:
        return true;
      default:
        return false;
    }
  };

  const selectedViolation = violationTypes.find(v => v.id === selectedViolationType);

  return (
    <Layout title='Nueva Multa'>
      <div className='container-fluid p-4'>
        {/* Header */}
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h1 className='h3'>Nueva Multa</h1>
          <button className='btn btn-secondary' onClick={() => window.history.back()}>
            <i className='material-icons me-2'>arrow_back</i>
            Cancelar
          </button>
        </div>

        {/* Wizard steps */}
        <div className='wizard-steps'>
          <div className={`wizard-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className='wizard-step-number'>1</div>
            <div className='wizard-step-title'>Tipo de infracción</div>
          </div>
          <div className={`wizard-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className='wizard-step-number'>2</div>
            <div className='wizard-step-title'>Buscar unidad</div>
          </div>
          <div className={`wizard-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className='wizard-step-number'>3</div>
            <div className='wizard-step-title'>Detalles</div>
          </div>
          <div className={`wizard-step ${currentStep >= 4 ? 'active' : ''}`}>
            <div className='wizard-step-number'>4</div>
            <div className='wizard-step-title'>Revisión</div>
          </div>
        </div>

        {/* Step 1: Violation Type Selection */}
        <div className={`wizard-section ${currentStep === 1 ? 'active' : ''}`}>
          <h4 className='mb-4'>Seleccione el tipo de infracción</h4>
          <div className='row'>
            {violationTypes.map((type) => (
              <div key={type.id} className='col-md-6 col-lg-3 mb-4'>
                <div
                  className={`violation-type-card ${selectedViolationType === type.id ? 'selected' : ''}`}
                  onClick={() => setSelectedViolationType(type.id)}
                >
                  <div className='violation-icon'>
                    <i className='material-icons'>{type.icon}</i>
                  </div>
                  <div className='violation-title'>{type.title}</div>
                  <div className='violation-description'>{type.description}</div>
                  <div className='violation-amount'>${type.amount.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Unit Search */}
        <div className={`wizard-section ${currentStep === 2 ? 'active' : ''}`}>
          <h4 className='mb-4'>Buscar unidad infractora</h4>
          <div className='mb-4'>
            <input
              type='text'
              className='form-control'
              placeholder='Buscar por número de unidad o nombre del propietario...'
              value={unitSearch}
              onChange={(e) => setUnitSearch(e.target.value)}
            />
          </div>
          <div>
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className={`unit-search-result ${selectedUnit === unit.id ? 'selected' : ''}`}
                onClick={() => setSelectedUnit(unit.id)}
              >
                <div className='d-flex justify-content-between align-items-center'>
                  <div>
                    <div className='unit-number'>{unit.id}</div>
                    <div className='unit-owner'>{unit.owner}</div>
                    <div className='unit-details'>{unit.details}</div>
                  </div>
                  <div>
                    <input
                      type='radio'
                      name='unit'
                      checked={selectedUnit === unit.id}
                      onChange={() => setSelectedUnit(unit.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Details */}
        <div className={`wizard-section ${currentStep === 3 ? 'active' : ''}`}>
          <h4 className='mb-4'>Detalles de la multa</h4>
          <div className='row'>
            <div className='col-md-8'>
              <div className='form-section'>
                <h5 className='form-section-title'>
                  <i className='material-icons'>description</i>
                  Información básica
                </h5>
                <div className='mb-3'>
                  <label className='form-label'>Descripción detallada</label>
                  <textarea
                    className='form-control'
                    rows={4}
                    placeholder='Describa la infracción cometida...'
                  ></textarea>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Fecha de la infracción</label>
                  <input type='date' className='form-control' />
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Prioridad</label>
                  <select className='form-select'>
                    <option value='low'>Baja</option>
                    <option value='medium'>Media</option>
                    <option value='high'>Alta</option>
                  </select>
                </div>
              </div>

              <div className='form-section'>
                <h5 className='form-section-title'>
                  <i className='material-icons'>attach_file</i>
                  Evidencia
                </h5>
                <div
                  className='evidence-upload-zone'
                  onClick={() => document.getElementById('evidenceFiles')?.click()}
                >
                  <i className='material-icons mb-2'>cloud_upload</i>
                  <div>Haga clic para subir archivos o arrastre y suelte</div>
                  <small className='text-muted'>PNG, JPG, PDF hasta 10MB</small>
                </div>
                <input
                  type='file'
                  id='evidenceFiles'
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
                <div id='uploadedFiles' className='mt-3'>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className='uploaded-file'>
                      <div className='d-flex align-items-center'>
                        <div className='file-icon'>
                          <i className='material-icons'>insert_drive_file</i>
                        </div>
                        <div className='file-info'>
                          <div className='file-name'>{file.name}</div>
                          <div className='file-size'>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                        <button
                          className='file-remove btn btn-sm btn-outline-danger'
                          onClick={() => removeFile(index)}
                        >
                          <i className='material-icons'>close</i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className='col-md-4'>
              <div className='form-section'>
                <h5 className='form-section-title'>
                  <i className='material-icons'>info</i>
                  Resumen
                </h5>
                <div className='summary-item'>
                  <div className='summary-label'>Tipo de infracción:</div>
                  <div className='summary-value'>{selectedViolation?.title}</div>
                </div>
                <div className='summary-item'>
                  <div className='summary-label'>Unidad:</div>
                  <div className='summary-value'>{selectedUnit}</div>
                </div>
                <div className='summary-item'>
                  <div className='summary-label'>Monto:</div>
                  <div className='summary-value'>${selectedViolation?.amount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Review */}
        <div className={`wizard-section ${currentStep === 4 ? 'active' : ''}`}>
          <h4 className='mb-4'>Revisar y crear multa</h4>
          <div className='row'>
            <div className='col-md-8'>
              <div id='reviewContent'>
                {/* Review content will be populated by JavaScript */}
                <div className='alert alert-info'>
                  <i className='material-icons me-2'>info</i>
                  Revisando la información de la multa...
                </div>
              </div>
            </div>
            <div className='col-md-4'>
              <div className='form-section'>
                <h5 className='form-section-title'>
                  <i className='material-icons'>check_circle</i>
                  Confirmación
                </h5>
                <p>¿Está seguro de que desea crear esta multa?</p>
                <div className='d-grid'>
                  <button className='btn btn-success' onClick={() => alert('Multa creada exitosamente')}>
                    <i className='material-icons me-2'>check</i>
                    Crear Multa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className='navigation-buttons'>
          <button
            className='btn btn-outline-secondary'
            onClick={() => changeStep(-1)}
            disabled={currentStep === 1}
          >
            <i className='material-icons me-2'>arrow_back</i>
            Anterior
          </button>
          <div className='ms-auto'>
            <button
              className='btn btn-primary'
              onClick={() => changeStep(1)}
              disabled={!validateStep(currentStep)}
            >
              {currentStep === 4 ? 'Finalizar' : 'Siguiente'}
              <i className='material-icons ms-2'>arrow_forward</i>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MultaNuevaPage;