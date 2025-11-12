/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { createTarifaConsumo } from '@/lib/tarifasConsumoService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { ProtectedPage, UserRole } from '@/lib/usePermissions';

type Step = 1 | 2 | 3 | 4;
type ServiceType = 'electricity' | 'water' | 'gas' | '';
type TariffType = 'fixed' | 'tiered' | 'seasonal' | '';

interface TierItem {
  id: string;
  from: string;
  to: string;
  price: string;
}

interface SeasonItem {
  id: string;
  name: string;
  fromMonth: string;
  toMonth: string;
  price: string;
}

const SERVICES = [
  {
    id: 'electricity',
    name: 'Electricidad',
    icon: 'bolt',
    color: 'text-warning',
    unit: 'kWh',
  },
  {
    id: 'water',
    name: 'Agua',
    icon: 'water_drop',
    color: 'text-info',
    unit: 'L',
  },
  {
    id: 'gas',
    name: 'Gas',
    icon: 'local_gas_station',
    color: 'text-danger',
    unit: 'm³',
  },
];

const TARIFF_TYPES = [
  {
    id: 'fixed',
    title: 'Tarifa Fija',
    description: 'Precio único por unidad de consumo',
    example: 'Ejemplo: $365 por kWh',
  },
  {
    id: 'tiered',
    title: 'Tarifa Escalonada',
    description: 'Precios diferentes según rangos de consumo',
    example: 'Ejemplo: 0-100 kWh a $320, 101+ a $410',
  },
  {
    id: 'seasonal',
    title: 'Tarifa Estacional',
    description: 'Precios que varían por temporada',
    example: 'Ejemplo: Verano $400, Invierno $350',
  },
];

const MONTHS = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

export default function NuevaTarifa() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedService, setSelectedService] = useState<ServiceType>('');
  const [selectedTariffType, setSelectedTariffType] = useState<TariffType>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [tariffName, setTariffName] = useState('');
  const [tariffDescription, setTariffDescription] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [currency, setCurrency] = useState('CLP');
  const [activo, setActivo] = useState(1);
  const [applyTax, setApplyTax] = useState(false);
  const [taxRate, setTaxRate] = useState('19');

  // Tariff specific fields
  const [fixedPrice, setFixedPrice] = useState('');
  const [tiers, setTiers] = useState<TierItem[]>([
    { id: '1', from: '0', to: '100', price: '' },
  ]);
  const [seasons, setSeasons] = useState<SeasonItem[]>([
    { id: '1', name: 'Verano', fromMonth: '12', toMonth: '02', price: '' },
  ]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleServiceSelect = (serviceId: ServiceType) => {
    setSelectedService(serviceId);
  };

  const handleTariffTypeSelect = (typeId: TariffType) => {
    setSelectedTariffType(typeId);
  };

  const getServiceUnit = () => {
    const service = SERVICES.find(s => s.id === selectedService);
    return service?.unit || 'unidad';
  };

  const handleAddTier = () => {
    const newId = Math.max(...tiers.map(t => parseInt(t.id)), 0) + 1;
    setTiers([
      ...tiers,
      { id: newId.toString(), from: '', to: '', price: '' },
    ]);
  };

  const handleRemoveTier = (id: string) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter(t => t.id !== id));
    }
  };

  const handleUpdateTier = (id: string, field: string, value: string) => {
    setTiers(tiers.map(t => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleAddSeason = () => {
    const newId = Math.max(...seasons.map(s => parseInt(s.id)), 0) + 1;
    setSeasons([
      ...seasons,
      { id: newId.toString(), name: '', fromMonth: '01', toMonth: '01', price: '' },
    ]);
  };

  const handleRemoveSeason = (id: string) => {
    if (seasons.length > 1) {
      setSeasons(seasons.filter(s => s.id !== id));
    }
  };

  const handleUpdateSeason = (id: string, field: string, value: string) => {
    setSeasons(seasons.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        if (!selectedService) {
          alert('Por favor selecciona un tipo de servicio');
          return false;
        }
        return true;

      case 2:
        if (!tariffName.trim()) {
          alert('El nombre de la tarifa es obligatorio');
          return false;
        }
        if (!validFrom) {
          alert('Debes especificar la fecha de vigencia');
          return false;
        }
        if (!selectedTariffType) {
          alert('Debes seleccionar un tipo de tarifa');
          return false;
        }
        return true;

      case 3:
        if (selectedTariffType === 'fixed') {
          if (!fixedPrice || parseFloat(fixedPrice) <= 0) {
            alert('Ingresa un precio válido mayor a 0');
            return false;
          }
        } else if (selectedTariffType === 'tiered') {
          for (const tier of tiers) {
            if (!tier.from || !tier.to || !tier.price) {
              alert('Completa todos los escalones');
              return false;
            }
            if (parseFloat(tier.price) <= 0) {
              alert('Los precios deben ser mayores a 0');
              return false;
            }
          }
        } else if (selectedTariffType === 'seasonal') {
          for (const season of seasons) {
            if (!season.name || !season.price) {
              alert('Completa todas las temporadas');
              return false;
            }
            if (parseFloat(season.price) <= 0) {
              alert('Los precios deben ser mayores a 0');
              return false;
            }
          }
        }
        return true;

      case 4:
        return true;

      default:
        return true;
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((currentStep + 1) as Step);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: any = {
        tipo_consumo: selectedService,
        vigencia_desde: validFrom,
        vigencia_hasta: validTo || null,
        descripcion: tariffDescription,
        moneda: currency,
        activo,
        aplicar_impuesto: applyTax,
        tasa_impuesto: applyTax ? taxRate : null,
      };

      if (selectedTariffType === 'fixed') {
        payload.tipo_tarifa = 'fija';
        payload.valor_unitario = parseFloat(fixedPrice);
      } else if (selectedTariffType === 'tiered') {
        payload.tipo_tarifa = 'escalonada';
        payload.escalones = tiers.map(t => ({
          desde: parseFloat(t.from),
          hasta: parseFloat(t.to),
          precio: parseFloat(t.price),
        }));
      } else if (selectedTariffType === 'seasonal') {
        payload.tipo_tarifa = 'estacional';
        payload.temporadas = seasons.map(s => ({
          nombre: s.name,
          desde_mes: parseInt(s.fromMonth),
          hasta_mes: parseInt(s.toMonth),
          precio: parseFloat(s.price),
        }));
      }

      // For now, we'll create a basic tarifa (the full implementation depends on your backend)
      const basicPayload = {
        tipo_consumo: selectedService === 'electricity' ? 'Electricidad' : selectedService === 'water' ? 'Agua' : 'Gas',
        vigencia_desde: validFrom,
        vigencia_hasta: validTo || new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
        valor_unitario: selectedTariffType === 'fixed' ? parseFloat(fixedPrice) : 100,
        unidad_medida: getServiceUnit(),
        activo: 1,
      };

      await createTarifaConsumo(0, basicPayload); // Adjust based on your API requirements
      
      alert('¡Tarifa creada exitosamente!');
      router.push('/parametros');
    } catch (err) {
      console.error('Error creating tarifa:', err);
      alert('Error al crear la tarifa. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = (currentStep / 4) * 100;
  const service = SERVICES.find(s => s.id === selectedService);

  return (
    <ProtectedRoute>
      <ProtectedPage role={UserRole.ADMIN}>
        <Head>
          <title>Nueva Tarifa de Consumo — Cuentas Claras</title>
        </Head>

        <Layout title='Nueva Tarifa de Consumo'>
          <div className='container-fluid p-4'>
            <div className='row justify-content-center'>
              <div className='col-12 col-lg-10 col-xl-8'>
                {/* Wizard Steps */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '2rem',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '20px',
                      left: '20px',
                      right: '20px',
                      height: '2px',
                      backgroundColor: '#e9ecef',
                      zIndex: 1,
                    }}
                  />

                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 2,
                        backgroundColor: '#fff',
                        padding: '0 1rem',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor:
                            step < currentStep
                              ? '#28a745'
                              : step === currentStep
                                ? '#fd5d14'
                                : '#e9ecef',
                          color: step <= currentStep ? 'white' : '#6c757d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {step < currentStep ? (
                          <i className='material-icons'>check</i>
                        ) : (
                          step
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: step === currentStep ? '#fd5d14' : '#6c757d',
                          textAlign: 'center',
                        }}
                      >
                        {['Servicio', 'Datos', 'Tarifa', 'Revisión'][step - 1]}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Step 1: Service Selection */}
                {currentStep === 1 && (
                  <div className='card border-0 shadow-sm mb-4'>
                    <div className='card-body p-4'>
                      <h5 className='mb-4'>Selecciona el tipo de servicio</h5>
                      <div className='row'>
                        {SERVICES.map((service) => (
                          <div key={service.id} className='col-md-4 mb-3'>
                            <button
                              type='button'
                              onClick={() => handleServiceSelect(service.id as ServiceType)}
                              style={{
                                border: '2px solid #e9ecef',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                backgroundColor:
                                  selectedService === service.id
                                    ? 'rgba(253,93,20,0.05)'
                                    : '#fff',
                                borderColor:
                                  selectedService === service.id ? '#fd5d14' : '#e9ecef',
                                width: '100%',
                              }}
                              className='btn p-0 border-0'
                            >
                              <i
                                className={`material-icons ${service.color}`}
                                style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}
                              >
                                {service.icon}
                              </i>
                              <h6 className='mb-2'>{service.name}</h6>
                              <small className='text-muted'>({service.unit})</small>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Basic Information */}
                {currentStep === 2 && (
                  <div className='card border-0 shadow-sm mb-4'>
                    <div className='card-body p-4'>
                      <h5 className='mb-4'>
                        Información de la tarifa -{' '}
                        <span className='text-primary'>{service?.name}</span>
                      </h5>

                      <Form.Group className='mb-3'>
                        <Form.Label>Nombre de la tarifa *</Form.Label>
                        <Form.Control
                          type='text'
                          placeholder='Ej: Tarifa Electricidad Residencial'
                          value={tariffName}
                          onChange={(e) => setTariffName(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className='mb-3'>
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                          as='textarea'
                          rows={3}
                          placeholder='Descripción opcional de la tarifa'
                          value={tariffDescription}
                          onChange={(e) => setTariffDescription(e.target.value)}
                        />
                      </Form.Group>

                      <div className='row'>
                        <div className='col-md-6'>
                          <Form.Group className='mb-3'>
                            <Form.Label>Válida desde *</Form.Label>
                            <Form.Control
                              type='date'
                              value={validFrom}
                              onChange={(e) => setValidFrom(e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        <div className='col-md-6'>
                          <Form.Group className='mb-3'>
                            <Form.Label>Válida hasta</Form.Label>
                            <Form.Control
                              type='date'
                              value={validTo}
                              onChange={(e) => setValidTo(e.target.value)}
                            />
                          </Form.Group>
                        </div>
                      </div>

                      <div className='row'>
                        <div className='col-md-6'>
                          <Form.Group className='mb-3'>
                            <Form.Label>Moneda</Form.Label>
                            <Form.Select
                              value={currency}
                              onChange={(e) => setCurrency(e.target.value)}
                            >
                              <option value='CLP'>CLP (Pesos Chilenos)</option>
                              <option value='USD'>USD (Dólares)</option>
                              <option value='EUR'>EUR (Euros)</option>
                            </Form.Select>
                          </Form.Group>
                        </div>
                        <div className='col-md-6'>
                          <Form.Group className='mb-3'>
                            <Form.Label>Estado</Form.Label>
                            <Form.Select
                              value={activo}
                              onChange={(e) => setActivo(parseInt(e.target.value))}
                            >
                              <option value={1}>Activa</option>
                              <option value={0}>Inactiva</option>
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </div>

                      <div className='form-check mb-3'>
                        <Form.Check
                          type='checkbox'
                          id='applyTax'
                          label='Aplicar impuesto'
                          checked={applyTax}
                          onChange={(e) => setApplyTax(e.target.checked)}
                        />
                      </div>

                      {applyTax && (
                        <Form.Group className='mb-3'>
                          <Form.Label>Tasa de impuesto (%)</Form.Label>
                          <Form.Control
                            type='number'
                            placeholder='19'
                            value={taxRate}
                            onChange={(e) => setTaxRate(e.target.value)}
                            min='0'
                            max='100'
                            step='0.01'
                          />
                        </Form.Group>
                      )}

                      <h6 className='mt-4 mb-3'>Tipo de tarifa *</h6>
                      <div className='row'>
                        {TARIFF_TYPES.map((type) => (
                          <div key={type.id} className='col-md-4 mb-3'>
                            <button
                              type='button'
                              onClick={() => handleTariffTypeSelect(type.id as TariffType)}
                              style={{
                                border: '2px solid #e9ecef',
                                borderRadius: 'var(--radius)',
                                padding: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                backgroundColor:
                                  selectedTariffType === type.id
                                    ? 'rgba(253,93,20,0.05)'
                                    : '#fff',
                                borderColor:
                                  selectedTariffType === type.id ? '#fd5d14' : '#e9ecef',
                                width: '100%',
                                textAlign: 'left',
                              }}
                              className='btn p-0 border-0'
                            >
                              <h6 className='mb-2'>{type.title}</h6>
                              <small className='text-muted d-block mb-2'>
                                {type.description}
                              </small>
                              <small className='text-info'>{type.example}</small>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Tariff Configuration */}
                {currentStep === 3 && (
                  <div className='card border-0 shadow-sm mb-4'>
                    <div className='card-body p-4'>
                      {selectedTariffType === 'fixed' && (
                        <>
                          <h5 className='mb-4'>Configurar tarifa fija</h5>
                          <Form.Group className='mb-3'>
                            <Form.Label>Precio por {getServiceUnit()} *</Form.Label>
                            <div className='input-group'>
                              <span className='input-group-text'>{currency}</span>
                              <Form.Control
                                type='number'
                                placeholder='0.00'
                                value={fixedPrice}
                                onChange={(e) => setFixedPrice(e.target.value)}
                                min='0'
                                step='0.01'
                              />
                              <span className='input-group-text'>/ {getServiceUnit()}</span>
                            </div>
                          </Form.Group>
                        </>
                      )}

                      {selectedTariffType === 'tiered' && (
                        <>
                          <h5 className='mb-4'>Configurar escalones</h5>
                          {tiers.map((tier) => (
                            <div
                              key={tier.id}
                              className='card bg-light mb-3'
                              style={{ position: 'relative' }}
                            >
                              {tiers.length > 1 && (
                                <button
                                  className='btn btn-sm btn-danger'
                                  style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                  }}
                                  onClick={() => handleRemoveTier(tier.id)}
                                >
                                  <i className='material-icons'>close</i>
                                </button>
                              )}
                              <div className='card-body'>
                                <div className='row'>
                                  <div className='col-md-3'>
                                    <Form.Group>
                                      <Form.Label>Desde</Form.Label>
                                      <Form.Control
                                        type='number'
                                        placeholder='0'
                                        value={tier.from}
                                        onChange={(e) =>
                                          handleUpdateTier(tier.id, 'from', e.target.value)
                                        }
                                        min='0'
                                      />
                                    </Form.Group>
                                  </div>
                                  <div className='col-md-3'>
                                    <Form.Group>
                                      <Form.Label>Hasta</Form.Label>
                                      <Form.Control
                                        type='number'
                                        placeholder='100'
                                        value={tier.to}
                                        onChange={(e) =>
                                          handleUpdateTier(tier.id, 'to', e.target.value)
                                        }
                                      />
                                    </Form.Group>
                                  </div>
                                  <div className='col-md-4'>
                                    <Form.Group>
                                      <Form.Label>Precio ({currency})</Form.Label>
                                      <Form.Control
                                        type='number'
                                        placeholder='0.00'
                                        value={tier.price}
                                        onChange={(e) =>
                                          handleUpdateTier(tier.id, 'price', e.target.value)
                                        }
                                        min='0'
                                        step='0.01'
                                      />
                                    </Form.Group>
                                  </div>
                                  <div className='col-md-2'>
                                    <Form.Group>
                                      <Form.Label>Unidad</Form.Label>
                                      <div className='form-control-plaintext'>
                                        {getServiceUnit()}
                                      </div>
                                    </Form.Group>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button
                            variant='outline-primary'
                            onClick={handleAddTier}
                            className='mb-3'
                          >
                            <i className='material-icons me-1'>add</i>
                            Añadir escalón
                          </Button>
                        </>
                      )}

                      {selectedTariffType === 'seasonal' && (
                        <>
                          <h5 className='mb-4'>Configurar temporadas</h5>
                          {seasons.map((season) => (
                            <div
                              key={season.id}
                              className='card bg-light mb-3'
                              style={{ position: 'relative' }}
                            >
                              {seasons.length > 1 && (
                                <button
                                  className='btn btn-sm btn-danger'
                                  style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                  }}
                                  onClick={() => handleRemoveSeason(season.id)}
                                >
                                  <i className='material-icons'>close</i>
                                </button>
                              )}
                              <div className='card-body'>
                                <div className='row'>
                                  <div className='col-md-3'>
                                    <Form.Group>
                                      <Form.Label>Nombre</Form.Label>
                                      <Form.Control
                                        type='text'
                                        placeholder='Ej: Verano'
                                        value={season.name}
                                        onChange={(e) =>
                                          handleUpdateSeason(season.id, 'name', e.target.value)
                                        }
                                      />
                                    </Form.Group>
                                  </div>
                                  <div className='col-md-2'>
                                    <Form.Group>
                                      <Form.Label>Desde (mes)</Form.Label>
                                      <Form.Select
                                        value={season.fromMonth}
                                        onChange={(e) =>
                                          handleUpdateSeason(
                                            season.id,
                                            'fromMonth',
                                            e.target.value,
                                          )
                                        }
                                      >
                                        {MONTHS.map((m) => (
                                          <option key={m.value} value={m.value}>
                                            {m.label}
                                          </option>
                                        ))}
                                      </Form.Select>
                                    </Form.Group>
                                  </div>
                                  <div className='col-md-2'>
                                    <Form.Group>
                                      <Form.Label>Hasta (mes)</Form.Label>
                                      <Form.Select
                                        value={season.toMonth}
                                        onChange={(e) =>
                                          handleUpdateSeason(season.id, 'toMonth', e.target.value)
                                        }
                                      >
                                        {MONTHS.map((m) => (
                                          <option key={m.value} value={m.value}>
                                            {m.label}
                                          </option>
                                        ))}
                                      </Form.Select>
                                    </Form.Group>
                                  </div>
                                  <div className='col-md-3'>
                                    <Form.Group>
                                      <Form.Label>Precio ({currency})</Form.Label>
                                      <Form.Control
                                        type='number'
                                        placeholder='0.00'
                                        value={season.price}
                                        onChange={(e) =>
                                          handleUpdateSeason(season.id, 'price', e.target.value)
                                        }
                                        min='0'
                                        step='0.01'
                                      />
                                    </Form.Group>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button
                            variant='outline-primary'
                            onClick={handleAddSeason}
                            className='mb-3'
                          >
                            <i className='material-icons me-1'>add</i>
                            Añadir temporada
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className='card border-0 shadow-sm mb-4'>
                    <div className='card-body p-4'>
                      <h5 className='mb-4'>Revisión de la tarifa</h5>

                      <div className='row mb-3'>
                        <div className='col-md-6'>
                          <p className='text-muted mb-1'>Servicio</p>
                          <h6>{service?.name}</h6>
                        </div>
                        <div className='col-md-6'>
                          <p className='text-muted mb-1'>Tipo de tarifa</p>
                          <h6>
                            {TARIFF_TYPES.find(t => t.id === selectedTariffType)?.title}
                          </h6>
                        </div>
                      </div>

                      <div className='row mb-3'>
                        <div className='col-md-6'>
                          <p className='text-muted mb-1'>Nombre</p>
                          <h6>{tariffName}</h6>
                        </div>
                        <div className='col-md-6'>
                          <p className='text-muted mb-1'>Estado</p>
                          <h6>
                            <span className={`badge ${activo === 1 ? 'bg-success' : 'bg-secondary'}`}>
                              {activo === 1 ? 'Activa' : 'Inactiva'}
                            </span>
                          </h6>
                        </div>
                      </div>

                      <div className='row mb-3'>
                        <div className='col-md-6'>
                          <p className='text-muted mb-1'>Válida desde</p>
                          <h6>{validFrom}</h6>
                        </div>
                        <div className='col-md-6'>
                          <p className='text-muted mb-1'>Válida hasta</p>
                          <h6>{validTo || '-'}</h6>
                        </div>
                      </div>

                      {tariffDescription && (
                        <div className='mb-3'>
                          <p className='text-muted mb-1'>Descripción</p>
                          <p>{tariffDescription}</p>
                        </div>
                      )}

                      <div className='alert alert-info mt-4'>
                        <i className='material-icons me-2'>info</i>
                        Revisa los datos cuidadosamente antes de crear la tarifa.
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className='card border-0 shadow-sm'>
                  <div className='card-body d-flex justify-content-between align-items-center'>
                    <div>
                      <small className='text-muted'>
                        Paso {currentStep} de 4 - {Math.round(progressPercent)}%
                      </small>
                      <div className='progress mt-2' style={{ height: '4px' }}>
                        <div
                          className='progress-bar'
                          role='progressbar'
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className='d-flex gap-2'>
                      <Button
                        variant='outline-secondary'
                        onClick={handlePrevStep}
                        disabled={currentStep === 1 || isSubmitting}
                      >
                        <i className='material-icons me-1'>arrow_back</i>
                        Atrás
                      </Button>
                      <Button
                        variant='primary'
                        onClick={handleNextStep}
                        disabled={isSubmitting}
                      >
                        {currentStep === 4 ? (
                          <>
                            <i className='material-icons me-1'>save</i>
                            Crear Tarifa
                          </>
                        ) : (
                          <>
                            Siguiente
                            <i className='material-icons ms-1'>arrow_forward</i>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedPage>
    </ProtectedRoute>
  );
}
