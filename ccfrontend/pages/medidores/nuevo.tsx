import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Modal } from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

interface Community {
  id: number;
  name: string;
  address: string;
}

interface Building {
  id: number;
  name: string;
  floors: number;
}

interface Unit {
  id: number;
  number: string;
  floor: string;
  type: 'apartment' | 'commercial' | 'parking';
}

export default function NuevoMedidor() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Datos de referencia
  const [communities, setCommunities] = useState<Community[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // Estado del formulario
  const [formData, setFormData] = useState({
    // Información básica
    type: 'electric' as 'electric' | 'water' | 'gas',
    code: '',
    serialNumber: '',
    brand: '',
    model: '',

    // Ubicación
    communityId: '',
    buildingId: '',
    unitId: '',
    position: '',
    coordinates: '',

    // Especificaciones técnicas
    capacity: '',
    precision: '',
    certification: '',
    operatingTemp: '',
    maxPressure: '',
    communicationType: '',

    // Instalación
    installationDate: '',
    technician: '',
    company: '',
    warrantyUntil: '',
    certificate: '',

    // Configuración inicial
    readingFrequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly',
    autoReading: true,
    notifications: true,
    consumptionThreshold: 0,
    pressureThreshold: 0,
    temperatureThreshold: 0,

    // Mantenimiento
    maintenanceFrequency: 'semestral' as
      | 'mensual'
      | 'trimestral'
      | 'semestral'
      | 'anual',
    serviceCompany: '',
    firstServiceDate: '',

    // Notas adicionales
    notes: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.communityId) {
      loadBuildings(parseInt(formData.communityId));
    }
  }, [formData.communityId]);

  useEffect(() => {
    if (formData.buildingId) {
      loadUnits(parseInt(formData.buildingId));
    }
  }, [formData.buildingId]);

  useEffect(() => {
    // Generar código automático basado en el tipo
    if (formData.type) {
      const prefix =
        formData.type === 'electric'
          ? 'ELC'
          : formData.type === 'water'
            ? 'AGU'
            : 'GAS';
      const randomNum = Math.floor(Math.random() * 999) + 1;
      setFormData(prev => ({
        ...prev,
        code: `MED-${prefix}-${String(randomNum).padStart(3, '0')}`,
      }));
    }
  }, [formData.type]);

  const loadInitialData = async () => {
    try {
      // Simular carga de datos
      const mockCommunities: Community[] = [
        {
          id: 1,
          name: 'Condominio Las Condes',
          address: 'Av. Las Condes 12345',
        },
        { id: 2, name: 'Residencial Vitacura', address: 'Av. Vitacura 6789' },
        { id: 3, name: 'Edificio Lo Barnechea', address: 'Av. La Dehesa 3456' },
        {
          id: 4,
          name: 'Centro Comercial Maipú',
          address: 'Av. Pajaritos 8901',
        },
      ];

      setCommunities(mockCommunities);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadBuildings = async (communityId: number) => {
    try {
      // Simular carga de edificios según la comunidad
      const mockBuildings: Building[] = [
        { id: 1, name: 'Torre A', floors: 15 },
        { id: 2, name: 'Torre B', floors: 12 },
        { id: 3, name: 'Torre C', floors: 18 },
        { id: 4, name: 'Edificio Principal', floors: 8 },
      ];

      setBuildings(mockBuildings);
    } catch (error) {
      console.log(error);
    }
  };

  const loadUnits = async (_buildingId: number) => {
    try {
      // Simular carga de unidades según el edificio
      const mockUnits: Unit[] = [
        { id: 1, number: 'Apto 101', floor: '1', type: 'apartment' },
        { id: 2, number: 'Apto 102', floor: '1', type: 'apartment' },
        { id: 3, number: 'Apto 201', floor: '2', type: 'apartment' },
        { id: 4, number: 'Apto 202', floor: '2', type: 'apartment' },
        { id: 5, number: 'Local 001', floor: '1', type: 'commercial' },
        { id: 6, number: 'Estacion. 001', floor: '-1', type: 'parking' },
      ];

      setUnits(mockUnits);
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | number,
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones requeridas
    if (!formData.type) {
      newErrors.type = 'El tipo de medidor es requerido';
    }
    if (!formData.serialNumber) {
      newErrors.serialNumber = 'El número de serie es requerido';
    }
    if (!formData.brand) {
      newErrors.brand = 'La marca es requerida';
    }
    if (!formData.model) {
      newErrors.model = 'El modelo es requerido';
    }
    if (!formData.communityId) {
      newErrors.communityId = 'La comunidad es requerida';
    }
    if (!formData.buildingId) {
      newErrors.buildingId = 'El edificio es requerido';
    }
    if (!formData.unitId) {
      newErrors.unitId = 'La unidad es requerida';
    }
    if (!formData.position) {
      newErrors.position = 'La posición es requerida';
    }
    if (!formData.capacity) {
      newErrors.capacity = 'La capacidad es requerida';
    }
    if (!formData.precision) {
      newErrors.precision = 'La precisión es requerida';
    }
    if (!formData.certification) {
      newErrors.certification = 'La certificación es requerida';
    }
    if (!formData.installationDate) {
      newErrors.installationDate = 'La fecha de instalación es requerida';
    }
    if (!formData.technician) {
      newErrors.technician = 'El técnico instalador es requerido';
    }
    if (!formData.company) {
      newErrors.company = 'La empresa instaladora es requerida';
    }

    // Validaciones específicas por tipo
    if (formData.type === 'water' && !formData.maxPressure) {
      newErrors.maxPressure =
        'La presión máxima es requerida para medidores de agua';
    }

    // Validaciones de formato
    if (formData.serialNumber && formData.serialNumber.length < 5) {
      newErrors.serialNumber =
        'El número de serie debe tener al menos 5 caracteres';
    }

    if (formData.consumptionThreshold < 0) {
      newErrors.consumptionThreshold =
        'El umbral de consumo no puede ser negativo';
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
      setLoading(true);

      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('Medidor creado exitosamente');
      router.push('/medidores');
    } catch (error) {
      console.error('Error creating meter:', error);
      alert('Error al crear el medidor');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      electric: 'electrical_services',
      water: 'water_drop',
      gas: 'local_fire_department',
    };
    return icons[type as keyof typeof icons] || 'speed';
  };

  const getSelectedCommunity = () => {
    return communities.find(c => c.id === parseInt(formData.communityId));
  };

  const getSelectedBuilding = () => {
    return buildings.find(b => b.id === parseInt(formData.buildingId));
  };

  const getSelectedUnit = () => {
    return units.find(u => u.id === parseInt(formData.unitId));
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nuevo Medidor — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='medidores-container'>
          <div className='container-fluid px-4'>
            {/* Header */}
            <div className='page-header'>
              <div className='container-fluid'>
                <Row className='align-items-center'>
                  <Col>
                    <h1 className='page-title'>
                      <span
                        className='material-icons me-3'
                        style={{ fontSize: '2.5rem' }}
                      >
                        add_circle
                      </span>
                      Crear Nuevo Medidor
                    </h1>
                    <p className='page-subtitle'>
                      Registra un nuevo medidor en el sistema con toda su
                      información técnica
                    </p>
                  </Col>
                  <Col xs='auto'>
                    <Button
                      variant='outline-light'
                      onClick={() => router.back()}
                    >
                      <span className='material-icons me-2'>arrow_back</span>
                      Volver
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>

            <Form onSubmit={handleSubmit}>
              <Row className='g-4'>
                {/* Información Básica */}
                <Col lg={8}>
                  <div className='form-card'>
                    <h5 className='form-card-title'>
                      <span className='material-icons'>info</span>
                      Información Básica del Medidor
                    </h5>

                    {/* Selección de tipo */}
                    <Row className='g-3 mb-4'>
                      <Col>
                        <Form.Label className='required'>
                          Tipo de Medidor
                        </Form.Label>
                        <Row className='g-3'>
                          {(['electric', 'water', 'gas'] as const).map(type => (
                            <Col md={4} key={type}>
                              <div
                                className={`type-selection-card ${formData.type === type ? 'active' : ''} type-${type}`}
                                onClick={() => handleInputChange('type', type)}
                              >
                                <span className='material-icons'>
                                  {getTypeIcon(type)}
                                </span>
                                <div className='type-selection-title'>
                                  {type === 'electric'
                                    ? 'Eléctrico'
                                    : type === 'water'
                                      ? 'Agua'
                                      : 'Gas Natural'}
                                </div>
                                <div className='type-selection-description'>
                                  {type === 'electric'
                                    ? 'Medición de consumo eléctrico'
                                    : type === 'water'
                                      ? 'Medición de consumo de agua'
                                      : 'Medición de consumo de gas natural'}
                                </div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                        {errors.type && (
                          <div className='text-danger small mt-1'>
                            {errors.type}
                          </div>
                        )}
                      </Col>
                    </Row>

                    <Row className='g-3'>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>
                            Código del Medidor
                          </Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.code}
                            onChange={e =>
                              handleInputChange('code', e.target.value)
                            }
                            placeholder='Ej: MED-ELC-001'
                            readOnly
                          />
                          <Form.Text>
                            Se genera automáticamente según el tipo
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>
                            Número de Serie
                          </Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.serialNumber}
                            onChange={e =>
                              handleInputChange('serialNumber', e.target.value)
                            }
                            placeholder='Ej: SE2024001'
                            isInvalid={!!errors.serialNumber}
                          />
                          {errors.serialNumber && (
                            <Form.Control.Feedback type='invalid'>
                              {errors.serialNumber}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>Marca</Form.Label>
                          <Form.Select
                            value={formData.brand}
                            onChange={e =>
                              handleInputChange('brand', e.target.value)
                            }
                            isInvalid={!!errors.brand}
                          >
                            <option value=''>Seleccionar marca...</option>
                            {formData.type === 'electric' && (
                              <>
                                <option value='Schneider Electric'>
                                  Schneider Electric
                                </option>
                                <option value='Landis+Gyr'>Landis+Gyr</option>
                                <option value='Itron'>Itron</option>
                                <option value='ABB'>ABB</option>
                                <option value='Siemens'>Siemens</option>
                              </>
                            )}
                            {formData.type === 'water' && (
                              <>
                                <option value='Elster Honeywell'>
                                  Elster Honeywell
                                </option>
                                <option value='Sensus'>Sensus</option>
                                <option value='Kamstrup'>Kamstrup</option>
                                <option value='Itron'>Itron</option>
                                <option value='Neptune'>Neptune</option>
                              </>
                            )}
                            {formData.type === 'gas' && (
                              <>
                                <option value='Elster Instromet'>
                                  Elster Instromet
                                </option>
                                <option value='Itron'>Itron</option>
                                <option value='Honeywell'>Honeywell</option>
                                <option value='Dresser'>Dresser</option>
                                <option value='Sensus'>Sensus</option>
                              </>
                            )}
                          </Form.Select>
                          {errors.brand && (
                            <Form.Control.Feedback type='invalid'>
                              {errors.brand}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>Modelo</Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.model}
                            onChange={e =>
                              handleInputChange('model', e.target.value)
                            }
                            placeholder='Ej: iEM3155'
                            isInvalid={!!errors.model}
                          />
                          {errors.model && (
                            <Form.Control.Feedback type='invalid'>
                              {errors.model}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Ubicación */}
                  <div className='form-card'>
                    <h5 className='form-card-title'>
                      <span className='material-icons'>location_on</span>
                      Ubicación e Instalación
                    </h5>
                    <Row className='g-3'>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>
                            Comunidad
                          </Form.Label>
                          <Form.Select
                            value={formData.communityId}
                            onChange={e =>
                              handleInputChange('communityId', e.target.value)
                            }
                            isInvalid={!!errors.communityId}
                          >
                            <option value=''>Seleccionar comunidad...</option>
                            {communities.map(community => (
                              <option key={community.id} value={community.id}>
                                {community.name}
                              </option>
                            ))}
                          </Form.Select>
                          {errors.communityId && (
                            <Form.Control.Feedback type='invalid'>
                              {errors.communityId}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>Edificio</Form.Label>
                          <Form.Select
                            value={formData.buildingId}
                            onChange={e =>
                              handleInputChange('buildingId', e.target.value)
                            }
                            isInvalid={!!errors.buildingId}
                            disabled={!formData.communityId}
                          >
                            <option value=''>Seleccionar edificio...</option>
                            {buildings.map(building => (
                              <option key={building.id} value={building.id}>
                                {building.name} ({building.floors} pisos)
                              </option>
                            ))}
                          </Form.Select>
                          {errors.buildingId && (
                            <Form.Control.Feedback type='invalid'>
                              {errors.buildingId}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>Unidad</Form.Label>
                          <Form.Select
                            value={formData.unitId}
                            onChange={e =>
                              handleInputChange('unitId', e.target.value)
                            }
                            isInvalid={!!errors.unitId}
                            disabled={!formData.buildingId}
                          >
                            <option value=''>Seleccionar unidad...</option>
                            {units.map(unit => (
                              <option key={unit.id} value={unit.id}>
                                {unit.number} - Piso {unit.floor} (
                                {unit.type === 'apartment'
                                  ? 'Apartamento'
                                  : unit.type === 'commercial'
                                    ? 'Comercial'
                                    : 'Estacionamiento'}
                                )
                              </option>
                            ))}
                          </Form.Select>
                          {errors.unitId && (
                            <Form.Control.Feedback type='invalid'>
                              {errors.unitId}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>
                            Posición del Medidor
                          </Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.position}
                            onChange={e =>
                              handleInputChange('position', e.target.value)
                            }
                            placeholder='Ej: Tablero principal, Entrada, Sótano...'
                            isInvalid={!!errors.position}
                          />
                          {errors.position && (
                            <Form.Control.Feedback type='invalid'>
                              {errors.position}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Coordenadas GPS (opcional)</Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.coordinates}
                            onChange={e =>
                              handleInputChange('coordinates', e.target.value)
                            }
                            placeholder='Ej: -33.4489, -70.6693'
                          />
                          <Form.Text>Formato: latitud, longitud</Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Especificaciones Técnicas */}
                  <div className='form-card'>
                    <h5 className='form-card-title'>
                      <span className='material-icons'>engineering</span>
                      Especificaciones Técnicas
                    </h5>
                    <Row className='g-3'>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>
                            {formData.type === 'electric'
                              ? 'Capacidad (A)'
                              : formData.type === 'water'
                                ? 'Diámetro (mm)'
                                : 'Capacidad (m³/h)'}
                          </Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.capacity}
                            onChange={e =>
                              handleInputChange('capacity', e.target.value)
                            }
                            placeholder={
                              formData.type === 'electric'
                                ? 'Ej: 100 A'
                                : formData.type === 'water'
                                  ? 'Ej: 15 mm'
                                  : 'Ej: 6 m³/h'
                            }
                            isInvalid={!!errors.capacity}
                          />
                          {errors.capacity && (
                            <Form.Control.Feedback type='invalid'>
                              {errors.capacity}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>
                            Precisión
                          </Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.precision}
                            onChange={e =>
                              handleInputChange('precision', e.target.value)
                            }
                            placeholder={
                              formData.type === 'electric'
                                ? 'Ej: Clase 1 (±1%)'
                                : formData.type === 'water'
                                  ? 'Ej: R160'
                                  : 'Ej: Clase 1.5'
                            }
                            isInvalid={!!errors.precision}
                          />
                          {errors.precision && (
                            <Form.Control.Feedback type='invalid'>
                              {errors.precision}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>
                            Certificación
                          </Form.Label>
                          <Form.Select
                            value={formData.certification}
                            onChange={e =>
                              handleInputChange('certification', e.target.value)
                            }
                            isInvalid={!!errors.certification}
                          >
                            <option value=''>
                              Seleccionar certificación...
                            </option>
                            {formData.type === 'electric' && (
                              <>
                                <option value='SEC Aprobado - IEC 62053-21'>
                                  SEC Aprobado - IEC 62053-21
                                </option>
                                <option value='SEC Homologado - IEC 62052-11'>
                                  SEC Homologado - IEC 62052-11
                                </option>
                                <option value='ANSI C12.20'>ANSI C12.20</option>
                              </>
                            )}
                            {formData.type === 'water' && (
                              <>
                                <option value='SISS Certificado - ISO 4064'>
                                  SISS Certificado - ISO 4064
                                </option>
                                <option value='SISS Aprobado - OIML R49'>
                                  SISS Aprobado - OIML R49
                                </option>
                                <option value='NSF 61 Certified'>
                                  NSF 61 Certified
                                </option>
                              </>
                            )}
                            {formData.type === 'gas' && (
                              <>
                                <option value='CNE Aprobado - ISO 17808'>
                                  CNE Aprobado - ISO 17808
                                </option>
                                <option value='SEC Gas Natural - OIML R137'>
                                  SEC Gas Natural - OIML R137
                                </option>
                                <option value='EN 1359 Certified'>
                                  EN 1359 Certified
                                </option>
                              </>
                            )}
                          </Form.Select>
                          {errors.certification && (
                            <Form.Control.Feedback type='invalid'>
                              {errors.certification}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Temperatura de Operación</Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.operatingTemp}
                            onChange={e =>
                              handleInputChange('operatingTemp', e.target.value)
                            }
                            placeholder='Ej: -25°C a +55°C'
                          />
                        </Form.Group>
                      </Col>
                      {formData.type === 'water' && (
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className='required'>
                              Presión Máxima (bar)
                            </Form.Label>
                            <Form.Control
                              type='text'
                              value={formData.maxPressure}
                              onChange={e =>
                                handleInputChange('maxPressure', e.target.value)
                              }
                              placeholder='Ej: 16 bar'
                              isInvalid={!!errors.maxPressure}
                            />
                            {errors.maxPressure && (
                              <Form.Control.Feedback type='invalid'>
                                {errors.maxPressure}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      )}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Tipo de Comunicación</Form.Label>
                          <Form.Select
                            value={formData.communicationType}
                            onChange={e =>
                              handleInputChange(
                                'communicationType',
                                e.target.value,
                              )
                            }
                          >
                            <option value=''>Sin comunicación</option>
                            <option value='RS485 / Modbus RTU'>
                              RS485 / Modbus RTU
                            </option>
                            <option value='M-Bus'>M-Bus</option>
                            <option value='LoRaWAN'>LoRaWAN</option>
                            <option value='GSM/GPRS'>GSM/GPRS</option>
                            <option value='Wi-Fi'>Wi-Fi</option>
                            <option value='Ethernet'>Ethernet</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </Col>

                {/* Panel lateral */}
                <Col lg={4}>
                  {/* Resumen */}
                  <div className='form-card'>
                    <h5 className='form-card-title'>
                      <span className='material-icons'>preview</span>
                      Resumen del Medidor
                    </h5>

                    {formData.type && (
                      <div className='mb-3'>
                        <div className='d-flex align-items-center mb-2'>
                          <span className='material-icons me-2 text-primary-custom'>
                            {getTypeIcon(formData.type)}
                          </span>
                          <strong>
                            {formData.type === 'electric'
                              ? 'Medidor Eléctrico'
                              : formData.type === 'water'
                                ? 'Medidor de Agua'
                                : 'Medidor de Gas'}
                          </strong>
                        </div>

                        {formData.code && (
                          <div className='mb-2'>
                            <small className='text-muted'>Código:</small>{' '}
                            <code>{formData.code}</code>
                          </div>
                        )}

                        {formData.brand && formData.model && (
                          <div className='mb-2'>
                            <small className='text-muted'>Equipo:</small>{' '}
                            {formData.brand} {formData.model}
                          </div>
                        )}

                        {getSelectedCommunity() && (
                          <div className='mb-2'>
                            <small className='text-muted'>Comunidad:</small>{' '}
                            {getSelectedCommunity()?.name}
                          </div>
                        )}

                        {getSelectedBuilding() && getSelectedUnit() && (
                          <div className='mb-2'>
                            <small className='text-muted'>Ubicación:</small>{' '}
                            {getSelectedBuilding()?.name} -{' '}
                            {getSelectedUnit()?.number}
                          </div>
                        )}

                        {formData.capacity && (
                          <div className='mb-2'>
                            <small className='text-muted'>Capacidad:</small>{' '}
                            {formData.capacity}
                          </div>
                        )}
                      </div>
                    )}

                    <hr />

                    <div className='d-grid gap-2'>
                      <Button
                        variant='outline-info'
                        size='sm'
                        onClick={() => setShowPreview(true)}
                        disabled={!formData.type}
                      >
                        <span className='material-icons me-2'>preview</span>
                        Vista Previa
                      </Button>
                    </div>
                  </div>

                  {/* Instalación */}
                  <div className='form-card'>
                    <h5 className='form-card-title'>
                      <span className='material-icons'>build</span>
                      Datos de Instalación
                    </h5>
                    <Form.Group className='mb-3'>
                      <Form.Label className='required'>
                        Fecha de Instalación
                      </Form.Label>
                      <Form.Control
                        type='date'
                        value={formData.installationDate}
                        onChange={e =>
                          handleInputChange('installationDate', e.target.value)
                        }
                        isInvalid={!!errors.installationDate}
                      />
                      {errors.installationDate && (
                        <Form.Control.Feedback type='invalid'>
                          {errors.installationDate}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label className='required'>
                        Técnico Instalador
                      </Form.Label>
                      <Form.Control
                        type='text'
                        value={formData.technician}
                        onChange={e =>
                          handleInputChange('technician', e.target.value)
                        }
                        placeholder='Nombre completo del técnico'
                        isInvalid={!!errors.technician}
                      />
                      {errors.technician && (
                        <Form.Control.Feedback type='invalid'>
                          {errors.technician}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label className='required'>
                        Empresa Instaladora
                      </Form.Label>
                      <Form.Control
                        type='text'
                        value={formData.company}
                        onChange={e =>
                          handleInputChange('company', e.target.value)
                        }
                        placeholder='Nombre de la empresa'
                        isInvalid={!!errors.company}
                      />
                      {errors.company && (
                        <Form.Control.Feedback type='invalid'>
                          {errors.company}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label>Garantía hasta</Form.Label>
                      <Form.Control
                        type='date'
                        value={formData.warrantyUntil}
                        onChange={e =>
                          handleInputChange('warrantyUntil', e.target.value)
                        }
                      />
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label>Certificado de Instalación</Form.Label>
                      <Form.Control
                        type='text'
                        value={formData.certificate}
                        onChange={e =>
                          handleInputChange('certificate', e.target.value)
                        }
                        placeholder='Número de certificado'
                      />
                    </Form.Group>
                  </div>

                  {/* Configuración */}
                  <div className='form-card'>
                    <h5 className='form-card-title'>
                      <span className='material-icons'>settings</span>
                      Configuración Inicial
                    </h5>

                    <Form.Group className='mb-3'>
                      <Form.Label>Frecuencia de Lectura</Form.Label>
                      <Form.Select
                        value={formData.readingFrequency}
                        onChange={e =>
                          handleInputChange('readingFrequency', e.target.value)
                        }
                      >
                        <option value='daily'>Diaria</option>
                        <option value='weekly'>Semanal</option>
                        <option value='monthly'>Mensual</option>
                        <option value='quarterly'>Trimestral</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label>Frecuencia de Mantenimiento</Form.Label>
                      <Form.Select
                        value={formData.maintenanceFrequency}
                        onChange={e =>
                          handleInputChange(
                            'maintenanceFrequency',
                            e.target.value,
                          )
                        }
                      >
                        <option value='mensual'>Mensual</option>
                        <option value='trimestral'>Trimestral</option>
                        <option value='semestral'>Semestral</option>
                        <option value='anual'>Anual</option>
                      </Form.Select>
                    </Form.Group>

                    <div className='mb-3'>
                      <Form.Check
                        type='switch'
                        id='autoReading'
                        label='Lectura Automática'
                        checked={formData.autoReading}
                        onChange={e =>
                          handleInputChange('autoReading', e.target.checked)
                        }
                      />
                    </div>

                    <div className='mb-3'>
                      <Form.Check
                        type='switch'
                        id='notifications'
                        label='Notificaciones de Alertas'
                        checked={formData.notifications}
                        onChange={e =>
                          handleInputChange('notifications', e.target.checked)
                        }
                      />
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className='d-grid gap-2'>
                    <Button
                      type='submit'
                      variant='primary'
                      size='lg'
                      disabled={loading}
                      className='btn-primary-custom'
                    >
                      {loading ? (
                        <>
                          <span className='spinner-border spinner-border-sm me-2' />
                          Creando Medidor...
                        </>
                      ) : (
                        <>
                          <span className='material-icons me-2'>save</span>
                          Crear Medidor
                        </>
                      )}
                    </Button>

                    <Button
                      variant='outline-secondary'
                      onClick={() => router.back()}
                      disabled={loading}
                    >
                      <span className='material-icons me-2'>cancel</span>
                      Cancelar
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </div>

          {/* Modal de vista previa */}
          <Modal
            show={showPreview}
            onHide={() => setShowPreview(false)}
            size='lg'
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <span className='material-icons me-2'>preview</span>
                Vista Previa del Medidor
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <h6>Información Básica</h6>
                  <ul className='list-unstyled'>
                    <li>
                      <strong>Tipo:</strong>{' '}
                      {formData.type === 'electric'
                        ? 'Eléctrico'
                        : formData.type === 'water'
                          ? 'Agua'
                          : 'Gas'}
                    </li>
                    <li>
                      <strong>Código:</strong> {formData.code}
                    </li>
                    <li>
                      <strong>Serie:</strong> {formData.serialNumber}
                    </li>
                    <li>
                      <strong>Marca:</strong> {formData.brand}
                    </li>
                    <li>
                      <strong>Modelo:</strong> {formData.model}
                    </li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Ubicación</h6>
                  <ul className='list-unstyled'>
                    <li>
                      <strong>Comunidad:</strong> {getSelectedCommunity()?.name}
                    </li>
                    <li>
                      <strong>Edificio:</strong> {getSelectedBuilding()?.name}
                    </li>
                    <li>
                      <strong>Unidad:</strong> {getSelectedUnit()?.number}
                    </li>
                    <li>
                      <strong>Posición:</strong> {formData.position}
                    </li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Especificaciones</h6>
                  <ul className='list-unstyled'>
                    <li>
                      <strong>Capacidad:</strong> {formData.capacity}
                    </li>
                    <li>
                      <strong>Precisión:</strong> {formData.precision}
                    </li>
                    <li>
                      <strong>Certificación:</strong> {formData.certification}
                    </li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Instalación</h6>
                  <ul className='list-unstyled'>
                    <li>
                      <strong>Fecha:</strong>{' '}
                      {formData.installationDate
                        ? new Date(
                          formData.installationDate,
                        ).toLocaleDateString()
                        : '-'}
                    </li>
                    <li>
                      <strong>Técnico:</strong> {formData.technician}
                    </li>
                    <li>
                      <strong>Empresa:</strong> {formData.company}
                    </li>
                  </ul>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant='outline-secondary'
                onClick={() => setShowPreview(false)}
              >
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
