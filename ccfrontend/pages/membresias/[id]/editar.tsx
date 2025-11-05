import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

interface MembershipData {
  id: string;
  code: string;
  tier: 'basico' | 'estandar' | 'premium' | 'vip';
  tierName: string;
  tierDisplayName: string;
  status: 'activo' | 'inactivo' | 'vencido';
  member: {
    id: string;
    name: string;
    type: 'Propietario' | 'Inquilino' | 'Administrador';
    document: string;
    unit: string;
  };
  community: {
    id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  price: number;
  progress: number;
  features: {
    name: string;
    included: boolean;
  }[];
  paymentHistory: {
    id: string;
    date: string;
    amount: number;
    status: 'pagado' | 'pendiente' | 'vencido';
  }[];
}

const tierStyles = {
  basico: { badge: 'tier-basic', bgColor: '#e9ecef', textColor: '#495057' },
  estandar: {
    badge: 'tier-standard',
    bgColor: '#cff4fc',
    textColor: '#055160',
  },
  premium: { badge: 'tier-premium', bgColor: '#fff3cd', textColor: '#664d03' },
  vip: {
    badge: 'tier-vip',
    bgColor: 'linear-gradient(45deg, #f6d365 0%, #fda085 100%)',
    textColor: '#212529',
  },
};

const statusColors = {
  activo: 'success',
  inactivo: 'secondary',
  vencido: 'danger',
};

export default function MembresiaEditar() {
  const router = useRouter();
  const { id } = router.query;
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // Mock data - reemplazar con API call
    setMembership({
      id: '1',
      code: 'MEM-20230001',
      tier: 'estandar',
      tierName: 'Estándar',
      tierDisplayName: 'Plan Estándar',
      status: 'activo',
      member: {
        id: '123',
        name: 'Juan Delgado',
        type: 'Propietario',
        document: '12.345.678-9',
        unit: 'Edificio A - Depto 101',
      },
      community: {
        id: '1',
        name: 'Comunidad Parque Real',
      },
      startDate: '2023-01-15',
      endDate: '2024-01-15',
      price: 8000,
      progress: 75,
      features: [
        { name: 'Acceso a portal', included: true },
        { name: 'Pago de expensas', included: true },
        { name: 'Visualización de saldos', included: true },
        { name: 'Gestión de solicitudes', included: true },
        { name: 'Reserva de áreas comunes', included: true },
        { name: 'Acceso múltiples unidades', included: false },
        { name: 'Soporte prioritario', included: false },
      ],
      paymentHistory: [
        { id: '1', date: '2023-11-01', amount: 8000, status: 'pagado' },
        { id: '2', date: '2023-10-01', amount: 8000, status: 'pagado' },
        { id: '3', date: '2023-09-01', amount: 8000, status: 'pagado' },
      ],
    });
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!membership) {
    return (
      <ProtectedRoute>
        <Layout title='Cargando...'>
          <div className='container-fluid py-4'>
            <div className='text-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const tierStyle = tierStyles[membership.tier];

  return (
    <ProtectedRoute>
      <Head>
        <title>Editar Membresía - {membership.code} — Cuentas Claras</title>
      </Head>

      <Layout title='Detalle de Membresía'>
        {/* Header personalizado */}
        <header className='bg-white shadow-sm py-3 px-4 d-flex justify-content-between align-items-center sticky-top'>
          <div className='d-flex align-items-center'>
            <Link
              href='/membresias'
              className='btn btn-link text-secondary p-0 me-3'
            >
              <i className='material-icons'>arrow_back</i>
            </Link>
            <h5 className='mb-0'>Detalle de Membresía</h5>
          </div>
          <div className='d-flex align-items-center'>
            <div className='dropdown me-2'>
              <button
                className='btn btn-outline-secondary dropdown-toggle'
                type='button'
                data-bs-toggle='dropdown'
              >
                <i className='fas fa-ellipsis-v'></i> Acciones
              </button>
              <ul className='dropdown-menu'>
                <li>
                  <a className='dropdown-item' href='#'>
                    <i className='fas fa-sync-alt me-2'></i> Renovar membresía
                  </a>
                </li>
                <li>
                  <a className='dropdown-item' href='#'>
                    <i className='fas fa-star me-2'></i> Cambiar nivel
                  </a>
                </li>
                <li>
                  <a className='dropdown-item' href='#'>
                    <i className='fas fa-envelope me-2'></i> Notificar al
                    miembro
                  </a>
                </li>
                <li>
                  <hr className='dropdown-divider' />
                </li>
                <li>
                  <a className='dropdown-item text-danger' href='#'>
                    <i className='fas fa-ban me-2'></i> Cancelar membresía
                  </a>
                </li>
              </ul>
            </div>
            <button
              className='btn btn-primary'
              onClick={() => setEditMode(!editMode)}
            >
              <i className='fas fa-edit me-2'></i>
              {editMode ? 'Ver Detalle' : 'Editar'}
            </button>
          </div>
        </header>

        {/* Membership Header */}
        <div
          className='membership-header'
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '2rem 0',
            marginBottom: '1.5rem',
          }}
        >
          <div className='container-fluid'>
            <div className='row align-items-center'>
              <div className='col-auto'>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: tierStyle.bgColor,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i
                    className='material-icons'
                    style={{ fontSize: '40px', color: tierStyle.textColor }}
                  >
                    card_membership
                  </i>
                </div>
              </div>
              <div className='col membership-info'>
                <h3 className='mb-1'>Membresía {membership.tierName}</h3>
                <div className='d-flex align-items-center mb-2'>
                  <span className={`tier-badge ${tierStyle.badge} me-2`}>
                    {membership.tierName}
                  </span>
                  <span className='small'>ID: {membership.code}</span>
                </div>
                <div className='d-flex align-items-center'>
                  <i className='material-icons me-2 small'>person</i>
                  <span className='small'>
                    {membership.member.name} ({membership.member.type})
                  </span>
                  <i className='material-icons mx-3 small'>domain</i>
                  <span className='small'>{membership.community.name}</span>
                </div>
              </div>
              <div className='col-auto'>
                <span
                  className={`badge bg-${statusColors[membership.status]} status-badge`}
                >
                  {membership.status.charAt(0).toUpperCase() +
                    membership.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='container-fluid py-3'>
          <div className='row'>
            <div className='col-12 col-lg-4'>
              {/* Estado y Validez */}
              <div
                className='content-section mb-4'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  className='content-header'
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    backgroundColor: '#f9f9fa',
                  }}
                >
                  <h6 className='mb-0'>Estado y Validez</h6>
                </div>
                <div className='content-body' style={{ padding: '1.5rem' }}>
                  <div className='progress-container'>
                    <div className='d-flex justify-content-between mb-2'>
                      <div>Período activo</div>
                      <div>{membership.progress}%</div>
                    </div>
                    <div className='progress' style={{ height: '8px' }}>
                      <div
                        className='progress-bar bg-success'
                        role='progressbar'
                        style={{ width: `${membership.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className='row text-center mt-4'>
                    <div className='col-6'>
                      <div className='border-end'>
                        <div className='h5 mb-0'>
                          {formatDate(membership.startDate)}
                        </div>
                        <div className='small text-muted'>Inicio</div>
                      </div>
                    </div>
                    <div className='col-6'>
                      <div className='h5 mb-0'>
                        {formatDate(membership.endDate)}
                      </div>
                      <div className='small text-muted'>Vencimiento</div>
                    </div>
                  </div>

                  <div className='mt-4'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <span>Estado actual:</span>
                      <span
                        className={`badge bg-${statusColors[membership.status]}`}
                      >
                        {membership.status.charAt(0).toUpperCase() +
                          membership.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del Miembro */}
              <div
                className='content-section mb-4'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  className='content-header'
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    backgroundColor: '#f9f9fa',
                  }}
                >
                  <h6 className='mb-0'>Información del Miembro</h6>
                </div>
                <div className='content-body' style={{ padding: '1.5rem' }}>
                  <div className='d-flex align-items-center mb-3'>
                    <div
                      className='avatar me-3'
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: '600',
                      }}
                    >
                      {membership.member.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h6 className='mb-1'>{membership.member.name}</h6>
                      <div className='text-muted small'>
                        {membership.member.type}
                      </div>
                    </div>
                  </div>

                  <div className='row'>
                    <div className='col-12 mb-2'>
                      <strong>Documento:</strong>
                      <div className='text-muted'>
                        {membership.member.document}
                      </div>
                    </div>
                    <div className='col-12 mb-2'>
                      <strong>Unidad:</strong>
                      <div className='text-muted'>{membership.member.unit}</div>
                    </div>
                    <div className='col-12'>
                      <strong>Comunidad:</strong>
                      <div className='text-muted'>
                        {membership.community.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Características del Plan */}
              <div
                className='content-section mb-4'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  className='content-header'
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    backgroundColor: '#f9f9fa',
                  }}
                >
                  <h6 className='mb-0'>Características del Plan</h6>
                </div>
                <div className='content-body' style={{ padding: '1.5rem' }}>
                  <ul
                    className='feature-list'
                    style={{ listStyleType: 'none', paddingLeft: 0 }}
                  >
                    {membership.features.map((feature, index) => (
                      <li
                        key={index}
                        className={`${feature.included ? 'feature-active' : 'feature-inactive'}`}
                        style={{
                          padding: '0.5rem 0',
                          borderBottom:
                            index < membership.features.length - 1
                              ? '1px solid #f1f1f1'
                              : 'none',
                        }}
                      >
                        <i
                          className='material-icons me-2'
                          style={{
                            fontSize: '18px',
                            color: feature.included
                              ? 'var(--color-success)'
                              : 'var(--color-muted)',
                          }}
                        >
                          {feature.included ? 'check_circle' : 'cancel'}
                        </i>
                        {feature.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className='col-12 col-lg-8'>
              {editMode ? (
                /* Formulario de edición */
                <div
                  className='content-section'
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div
                    className='content-header'
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      backgroundColor: '#f9f9fa',
                    }}
                  >
                    <h6 className='mb-0'>Editar Membresía</h6>
                  </div>
                  <div className='content-body' style={{ padding: '1.5rem' }}>
                    <form>
                      <div className='row'>
                        <div className='col-md-6 mb-3'>
                          <label htmlFor='tier' className='form-label'>
                            Nivel de Membresía
                          </label>
                          <select
                            className='form-select'
                            id='tier'
                            defaultValue={membership.tier}
                          >
                            <option value='basico'>Básico</option>
                            <option value='estandar'>Estándar</option>
                            <option value='premium'>Premium</option>
                            <option value='vip'>VIP</option>
                          </select>
                        </div>
                        <div className='col-md-6 mb-3'>
                          <label htmlFor='status' className='form-label'>
                            Estado
                          </label>
                          <select
                            className='form-select'
                            id='status'
                            defaultValue={membership.status}
                          >
                            <option value='activo'>Activo</option>
                            <option value='inactivo'>Inactivo</option>
                            <option value='vencido'>Vencido</option>
                          </select>
                        </div>
                      </div>

                      <div className='row'>
                        <div className='col-md-6 mb-3'>
                          <label htmlFor='startDate' className='form-label'>
                            Fecha de Inicio
                          </label>
                          <input
                            type='date'
                            className='form-control'
                            id='startDate'
                            defaultValue={membership.startDate}
                          />
                        </div>
                        <div className='col-md-6 mb-3'>
                          <label htmlFor='endDate' className='form-label'>
                            Fecha de Vencimiento
                          </label>
                          <input
                            type='date'
                            className='form-control'
                            id='endDate'
                            defaultValue={membership.endDate}
                          />
                        </div>
                      </div>

                      <div className='mb-3'>
                        <label htmlFor='price' className='form-label'>
                          Precio Mensual
                        </label>
                        <div className='input-group'>
                          <span className='input-group-text'>$</span>
                          <input
                            type='number'
                            className='form-control'
                            id='price'
                            defaultValue={membership.price}
                          />
                        </div>
                      </div>

                      <div className='d-flex justify-content-end'>
                        <button
                          type='button'
                          className='btn btn-outline-secondary me-2'
                          onClick={() => setEditMode(false)}
                        >
                          Cancelar
                        </button>
                        <button type='submit' className='btn btn-primary'>
                          Guardar Cambios
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                /* Historial de pagos */
                <div
                  className='content-section'
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div
                    className='content-header'
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      backgroundColor: '#f9f9fa',
                    }}
                  >
                    <h6 className='mb-0'>Historial de Pagos</h6>
                  </div>
                  <div className='content-body' style={{ padding: '1.5rem' }}>
                    {membership.paymentHistory.map(payment => (
                      <div
                        key={payment.id}
                        className='payment-card'
                        style={{
                          border: '1px solid #dee2e6',
                          borderRadius: 'var(--radius)',
                          padding: '1rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div className='d-flex justify-content-between align-items-start'>
                          <div>
                            <div
                              className='payment-date text-muted'
                              style={{ fontSize: '0.85rem' }}
                            >
                              {formatDate(payment.date)}
                            </div>
                            <div
                              className='payment-amount'
                              style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: 'var(--color-primary)',
                                margin: '0.5rem 0',
                              }}
                            >
                              {formatPrice(payment.amount)}
                            </div>
                          </div>
                          <span
                            className={`badge bg-${payment.status === 'pagado' ? 'success' : payment.status === 'pendiente' ? 'warning' : 'danger'}`}
                          >
                            {payment.status.charAt(0).toUpperCase() +
                              payment.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}

                    <div className='text-center mt-4'>
                      <button className='btn btn-outline-primary'>
                        Ver historial completo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
          .tier-badge.tier-basic {
            background-color: #e9ecef;
            color: #495057;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .tier-badge.tier-standard {
            background-color: #cff4fc;
            color: #055160;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .tier-badge.tier-premium {
            background-color: #fff3cd;
            color: #664d03;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .tier-badge.tier-vip {
            background: linear-gradient(45deg, #f6d365 0%, #fda085 100%);
            color: #212529;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}
