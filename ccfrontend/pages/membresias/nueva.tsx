import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

interface TierInfo {
  id: string;
  name: string;
  displayName: string;
  price: number;
  period: string;
  features: {
    name: string;
    included: boolean;
  }[];
  className: string;
}

const tiers: TierInfo[] = [
  {
    id: 'basico',
    name: 'Básico',
    displayName: 'Plan Básico',
    price: 5000,
    period: 'por mes',
    className: 'tier-basic',
    features: [
      { name: 'Acceso a portal', included: true },
      { name: 'Pago de expensas', included: true },
      { name: 'Visualización de saldos', included: true },
      { name: 'Gestión de solicitudes', included: false },
      { name: 'Reserva de áreas comunes', included: false },
      { name: 'Acceso múltiples unidades', included: false },
      { name: 'Soporte prioritario', included: false }
    ]
  },
  {
    id: 'estandar',
    name: 'Estándar',
    displayName: 'Plan Estándar',
    price: 8000,
    period: 'por mes',
    className: 'tier-standard',
    features: [
      { name: 'Acceso a portal', included: true },
      { name: 'Pago de expensas', included: true },
      { name: 'Visualización de saldos', included: true },
      { name: 'Gestión de solicitudes', included: true },
      { name: 'Reserva de áreas comunes', included: true },
      { name: 'Acceso múltiples unidades', included: false },
      { name: 'Soporte prioritario', included: false }
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    displayName: 'Plan Premium',
    price: 15000,
    period: 'por mes',
    className: 'tier-premium',
    features: [
      { name: 'Acceso a portal', included: true },
      { name: 'Pago de expensas', included: true },
      { name: 'Visualización de saldos', included: true },
      { name: 'Gestión de solicitudes', included: true },
      { name: 'Reserva de áreas comunes', included: true },
      { name: 'Acceso múltiples unidades', included: true },
      { name: 'Soporte prioritario', included: false }
    ]
  },
  {
    id: 'vip',
    name: 'VIP',
    displayName: 'Plan VIP',
    price: 25000,
    period: 'por mes',
    className: 'tier-vip',
    features: [
      { name: 'Acceso a portal', included: true },
      { name: 'Pago de expensas', included: true },
      { name: 'Visualización de saldos', included: true },
      { name: 'Gestión de solicitudes', included: true },
      { name: 'Reserva de áreas comunes', included: true },
      { name: 'Acceso múltiples unidades', included: true },
      { name: 'Soporte prioritario', included: true }
    ]
  }
];

export default function MembresiaNueva() {
  const [currentStep, setCurrentStep] = useState(2);
  const [selectedTier, setSelectedTier] = useState('estandar');
  const [selectedCommunity] = useState({
    id: '1',
    name: 'Comunidad Parque Real',
    buildings: 3,
    units: 120,
    people: 156
  });

  const steps = [
    { id: 1, name: 'Comunidad', completed: true },
    { id: 2, name: 'Nivel', active: true },
    { id: 3, name: 'Miembro', disabled: true },
    { id: 4, name: 'Duración', disabled: true },
    { id: 5, name: 'Pago', disabled: true }
  ];

  const handleTierSelection = (tierId: string) => {
    setSelectedTier(tierId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nueva Membresía — Cuentas Claras</title>
      </Head>

      <Layout title='Nueva Membresía'>
        {/* Header personalizado */}
        <header className='bg-white shadow-sm py-3 px-4 d-flex justify-content-between align-items-center sticky-top'>
          <div className='d-flex align-items-center'>
            <Link href='/membresias' className='btn btn-link text-secondary p-0 me-3'>
              <i className='material-icons'>arrow_back</i>
            </Link>
            <h5 className='mb-0'>Nueva Membresía</h5>
          </div>
          <div className='d-flex align-items-center'>
            <button type='button' className='btn btn-outline-secondary me-2'>
              Cancelar
            </button>
            <button type='button' className='btn btn-primary'>
              Guardar
            </button>
          </div>
        </header>

        <div className='container-fluid py-4'>
          <div className='row'>
            <div className='col-12'>
              {/* Progreso de pasos */}
              <div className='form-section mb-4' style={{ 
                backgroundColor: '#fff',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div className='form-section-body p-3'>
                  <div className='row'>
                    <div className='col-12'>
                      <div className='progress' style={{ height: '4px' }}>
                        <div 
                          className='progress-bar bg-success' 
                          role='progressbar' 
                          style={{ width: `${(currentStep / steps.length) * 100}%` }}
                          aria-valuenow={currentStep}
                          aria-valuemin={0}
                          aria-valuemax={steps.length}
                        />
                      </div>
                      <div className='d-flex justify-content-between mt-2'>
                        {steps.map((step) => (
                          <div key={step.id} className='text-center'>
                            <div 
                              className={`badge rounded-circle ${
                                step.completed ? 'bg-success' : 
                                step.active ? 'bg-primary' : 
                                'bg-secondary'
                              }`}
                              style={{ width: '24px', height: '24px', fontSize: '12px' }}
                            >
                              {step.completed ? (
                                <i className='material-icons' style={{ fontSize: '12px' }}>check</i>
                              ) : (
                                step.id
                              )}
                            </div>
                            <div className='small mt-1'>{step.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selección de comunidad (ya completado) */}
              <div className='form-section mb-4' style={{ 
                backgroundColor: '#fff',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div className='form-section-header d-flex justify-content-between align-items-center' style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  backgroundColor: '#f9f9fa'
                }}>
                  <h6 className='mb-0'>Comunidad</h6>
                  <button type='button' className='btn btn-sm btn-outline-primary'>
                    Cambiar
                  </button>
                </div>
                <div className='form-section-body' style={{ padding: '1.5rem' }}>
                  <div className='d-flex align-items-center'>
                    <div className='membresia-icon me-3' style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className='material-icons'>domain</i>
                    </div>
                    <div>
                      <h6 className='mb-1'>{selectedCommunity.name}</h6>
                      <div className='text-muted'>
                        {selectedCommunity.buildings} Edificios | {selectedCommunity.units} Unidades | {selectedCommunity.people} Personas
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selección de nivel de membresía (paso actual) */}
              <div className='form-section mb-4' style={{ 
                backgroundColor: '#fff',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div className='form-section-header' style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  backgroundColor: '#f9f9fa'
                }}>
                  <h6 className='mb-0'>Nivel de Membresía</h6>
                </div>
                <div className='form-section-body' style={{ padding: '1.5rem' }}>
                  <div className='row g-3'>
                    {tiers.map((tier) => (
                      <div key={tier.id} className='col-12 col-md-6 col-lg-3'>
                        <div 
                          className={`tier-card ${tier.className} ${selectedTier === tier.id ? 'selected' : ''}`}
                          onClick={() => handleTierSelection(tier.id)}
                          style={{
                            border: '2px solid #e9ecef',
                            borderRadius: 'var(--radius)',
                            padding: '1.25rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            height: '100%',
                            ...(selectedTier === tier.id && {
                              borderColor: 'var(--color-primary)',
                              backgroundColor: 'rgba(3, 14, 39, 0.05)'
                            })
                          }}
                        >
                          <div className={`tier-badge ${tier.className} mb-2`} style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            borderRadius: '4px'
                          }}>
                            {tier.name}
                          </div>
                          <h6 className='tier-header mb-2'>{tier.displayName}</h6>
                          <div className='tier-price' style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: 'var(--color-primary)',
                            margin: '0.5rem 0'
                          }}>
                            {formatPrice(tier.price)}
                          </div>
                          <div className='tier-period mb-3' style={{
                            color: 'var(--color-muted)',
                            fontSize: '0.875rem'
                          }}>
                            {tier.period}
                          </div>

                          {tier.features.map((feature, index) => (
                            <div 
                              key={index}
                              className={`tier-feature ${!feature.included ? 'disabled' : ''}`}
                              style={{
                                padding: '0.25rem 0',
                                color: feature.included ? 'var(--color-secondary)' : '#adb5bd',
                                textDecoration: feature.included ? 'none' : 'line-through'
                              }}
                            >
                              <i 
                                className='material-icons me-2'
                                style={{ 
                                  fontSize: '16px',
                                  color: feature.included ? 'var(--color-success)' : '#ced4da'
                                }}
                              >
                                {feature.included ? 'check_circle' : 'cancel'}
                              </i>
                              {feature.name}
                            </div>
                          ))}

                          <button 
                            className={`btn w-100 mt-3 ${
                              selectedTier === tier.id ? 'btn-primary' : 'btn-outline-primary'
                            }`}
                          >
                            {selectedTier === tier.id ? 'Seleccionado' : 'Seleccionar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selección de miembro (paso siguiente, inactivo) */}
              <div className='form-section mb-4' style={{ 
                backgroundColor: '#fff',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div className='form-section-header' style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  backgroundColor: '#f9f9fa'
                }}>
                  <h6 className='mb-0'>Seleccionar Miembro</h6>
                </div>
                <div className='form-section-body' style={{ padding: '1.5rem' }}>
                  <div className='alert alert-info' role='alert'>
                    <div className='d-flex'>
                      <i className='material-icons me-2'>info</i>
                      <div>
                        Por favor, primero seleccione un nivel de membresía para continuar con la selección del miembro.
                      </div>
                    </div>
                  </div>

                  <div className='mb-3'>
                    <div className='input-group'>
                      <span className='input-group-text'>
                        <i className='material-icons' style={{ fontSize: '18px' }}>search</i>
                      </span>
                      <input 
                        type='text' 
                        className='form-control' 
                        placeholder='Buscar persona por nombre, documento o unidad...' 
                        disabled 
                      />
                      <button className='btn btn-outline-secondary' type='button' disabled>
                        Buscar
                      </button>
                    </div>
                    <div className='form-text'>
                      Puede buscar por nombre, documento, o unidad asociada.
                    </div>
                  </div>

                  <div className='member-results mt-4 d-none'>
                    {/* Aquí irían los resultados de búsqueda cuando esté activo */}
                  </div>
                </div>
              </div>

              {/* Duración y fechas (paso futuro, inactivo) */}
              <div className='form-section mb-4' style={{ 
                backgroundColor: '#fff',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div className='form-section-header' style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  backgroundColor: '#f9f9fa'
                }}>
                  <h6 className='mb-0'>Duración y Fechas</h6>
                </div>
                <div className='form-section-body' style={{ padding: '1.5rem' }}>
                  <div className='alert alert-info' role='alert'>
                    <div className='d-flex'>
                      <i className='material-icons me-2'>info</i>
                      <div>
                        Complete los pasos previos para configurar las fechas de la membresía.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de pago (paso futuro, inactivo) */}
              <div className='form-section mb-4' style={{ 
                backgroundColor: '#fff',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div className='form-section-header' style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  backgroundColor: '#f9f9fa'
                }}>
                  <h6 className='mb-0'>Información de Pago</h6>
                </div>
                <div className='form-section-body' style={{ padding: '1.5rem' }}>
                  <div className='alert alert-info' role='alert'>
                    <div className='d-flex'>
                      <i className='material-icons me-2'>info</i>
                      <div>
                        Complete los pasos previos para configurar el pago de la membresía.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className='d-flex justify-content-between'>
                <button type='button' className='btn btn-outline-secondary'>
                  Cancelar
                </button>
                <div>
                  <button type='button' className='btn btn-outline-primary me-2'>
                    Guardar como Borrador
                  </button>
                  <button type='button' className='btn btn-primary'>
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .tier-badge.tier-basic {
            background-color: #e9ecef;
            color: #495057;
          }
          
          .tier-badge.tier-standard {
            background-color: #cff4fc;
            color: #055160;
          }
          
          .tier-badge.tier-premium {
            background-color: #fff3cd;
            color: #664d03;
          }
          
          .tier-badge.tier-vip {
            background: linear-gradient(45deg, #f6d365 0%, #fda085 100%);
            color: #212529;
          }
          
          .tier-card:hover {
            border-color: #ced4da !important;
            background-color: #f8f9fa !important;
          }
          
          .tier-card.selected:hover {
            border-color: var(--color-primary) !important;
            background-color: rgba(3, 14, 39, 0.05) !important;
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}
