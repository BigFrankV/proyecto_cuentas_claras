import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import { usePermissions, Permission } from '@/lib/usePermissions'; // si existe, o importa permissionsUtils

import { useAuth } from '../../lib/useAuth';
const sampleAppeals = [
  {
    id: 'A-2024-001',
    fineId: 'M-2024-089',
    resident: 'Juan Pérez',
    unit: 'A-101',
    violation: 'Ruido excesivo después de las 22:00',
    amount: 50000,
    status: 'pending',
    submittedDate: '2024-09-20',
    description:
      'El residente solicita reconsideración debido a circunstancias atenuantes no consideradas inicialmente.',
    evidence: ['documento_prueba.pdf', 'foto_evidencia.jpg'],
    reviewer: null,
    reviewDate: null,
  },
  {
    id: 'A-2024-002',
    fineId: 'M-2024-088',
    resident: 'María González',
    unit: 'B-205',
    violation: 'Estacionamiento indebido',
    amount: 30000,
    status: 'under_review',
    submittedDate: '2024-09-18',
    description:
      'Se adjunta permiso médico que justifica el estacionamiento en zona prohibida.',
    evidence: ['certificado_medico.pdf'],
    reviewer: 'Ana López',
    reviewDate: null,
  },
  {
    id: 'A-2024-003',
    fineId: 'M-2024-087',
    resident: 'Carlos Rodríguez',
    unit: 'C-303',
    violation: 'Mascotas sin correa',
    amount: 25000,
    status: 'approved',
    submittedDate: '2024-08-25',
    description:
      'La multa fue aplicada incorrectamente ya que la mascota estaba bajo supervisión.',
    evidence: ['testimonio_vecino.pdf', 'foto_incidente.jpg'],
    reviewer: 'Pedro Sánchez',
    reviewDate: '2024-09-01',
  },
  {
    id: 'A-2024-004',
    fineId: 'M-2024-086',
    resident: 'Laura Martínez',
    unit: 'D-404',
    violation: 'Basura fuera de horario',
    amount: 15000,
    status: 'rejected',
    submittedDate: '2024-09-10',
    description:
      'La evidencia presentada no es suficiente para justificar la apelación.',
    evidence: ['foto_basura.jpg'],
    reviewer: 'Carmen Díaz',
    reviewDate: '2024-09-15',
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const ApelacionesListadoPage: React.FC = () => {
  const { user, token } = useAuth(); // adapta según lo que exporte tu hook
  const authToken = token;
  const router = useRouter();
  const { hasPermission } = usePermissions(); // usar las funciones que exporta el hook
  const [appeals, setAppeals] = useState<any[]>([]);
  const [selectedAppeals, setSelectedAppeals] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const limit = 10; // o el valor que corresponda

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const options: any = { method: 'GET', headers };
      // si no hay token, intentar enviar cookies (si tu backend usa sesión por cookie)
      if (!authToken) {
        options.credentials = 'include';
      }

      const res = await fetch(
        `${API_BASE}/apelaciones?page=${p}&limit=${limit}`,
        options,
      );

      if (res.status === 401) {
        // token inválido / expirado -> forzar login
        router.push('/login');
        return;
      }

      if (!res.ok) {
        throw new Error('Error fetching appeals');
      }
      const payload = await res.json();
      // aceptar varias formas de respuesta del backend:
      // { success: true, data: [...] }  OR  { appeals: [...], total }  OR  [...]
      const rows = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.appeals)
          ? payload.appeals
          : Array.isArray(payload)
            ? payload
            : [];

      setAppeals(rows);
      // aquí podrías manejar la paginación si es necesario, usando el total
    } catch (err) {
      console.error('load apelaciones error', err);
      setAppeals(sampleAppeals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getStatusBadge = (status: string) => {
    const classes = {
      pending: 'appeal-status pending',
      under_review: 'appeal-status under_review',
      approved: 'appeal-status approved',
      rejected: 'appeal-status rejected',
    };
    return classes[status as keyof typeof classes] || 'appeal-status pending';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pendiente',
      under_review: 'En Revisión',
      approved: 'Aprobada',
      rejected: 'Rechazada',
    };
    return texts[status as keyof typeof texts] || 'Pendiente';
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAppeals(appeals.map(appeal => appeal.id));
    } else {
      setSelectedAppeals([]);
    }
  };

  const handleSelectAppeal = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedAppeals([...selectedAppeals, id]);
    } else {
      setSelectedAppeals(selectedAppeals.filter(appealId => appealId !== id));
    }
  };

  const filteredAppeals = appeals.filter(appeal => {
    if (filter === 'all') {
      return true;
    }
    return appeal.status === filter;
  });

  const handleCrear = () => {
    // lógica para crear nueva apelación
  };

  const handleVer = (appeal: any) => {
    // lógica para ver detalles de la apelación
  };

  const handleResolver = (appeal: any, decision: 'aceptada' | 'rechazada') => {
    // lógica para resolver apelación
  };

  // cuando muestres el botón de crear, usa la función de permisos correcta:
  const canCreate = hasPermission(Permission.MANAGE_FINANCES);

  return (
    <Layout title='Lista de Apelaciones'>
      <div className='container-fluid p-4'>
        {/* Header con título y botón nueva apelación */}
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h1 className='h3'>Apelaciones</h1>
          <div>
            {canCreate && (
              <button
                className='btn btn-primary me-2'
                onClick={() => {
                  /* handleCrear */
                }}
              >
                Nueva Apelación
              </button>
            )}
            <button className='btn btn-outline-secondary' onClick={() => load()}>
              {loading ? 'Cargando...' : 'Refrescar'}
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className='filters-panel mb-4'>
          <div className='d-flex flex-wrap align-items-center'>
            <span className='me-3 fw-bold'>Filtros:</span>
            <a
              href='#'
              className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todas
            </a>
            <a
              href='#'
              className={`filter-chip ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pendientes
            </a>
            <a
              href='#'
              className={`filter-chip ${filter === 'under_review' ? 'active' : ''}`}
              onClick={() => setFilter('under_review')}
            >
              En Revisión
            </a>
            <a
              href='#'
              className={`filter-chip ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Aprobadas
            </a>
            <a
              href='#'
              className={`filter-chip ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              Rechazadas
            </a>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedAppeals.length > 0 && (
          <div className='bulk-actions show mb-4'>
            <div className='d-flex justify-content-between align-items-center'>
              <span>{selectedAppeals.length} apelaciones seleccionadas</span>
              <div>
                <button
                  className='btn btn-light me-2'
                  onClick={() => {
                    /* bulk approve */
                  }}
                >
                  <i className='material-icons me-1'>check_circle</i>
                  Aprobar seleccionadas
                </button>
                <button
                  className='btn btn-light'
                  onClick={() => {
                    /* bulk reject */
                  }}
                >
                  <i className='material-icons me-1'>cancel</i>
                  Rechazar seleccionadas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de apelaciones */}
        <div className='table-responsive d-none d-md-block'>
          <table className='table table-hover'>
            <thead>
              <tr>
                <th>
                  <input
                    type='checkbox'
                    id='selectAll'
                    onChange={e => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>ID Apelación</th>
                <th>ID Multa</th>
                <th>Residente</th>
                <th>Unidad</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppeals.map(appeal => (
                <tr key={appeal.id}>
                  <td>
                    <input
                      type='checkbox'
                      className='appeal-checkbox'
                      checked={selectedAppeals.includes(appeal.id)}
                      onChange={e =>
                        handleSelectAppeal(appeal.id, e.target.checked)
                      }
                    />
                  </td>
                  <td>
                    <Link
                      href={`/apelacion-detalle/${appeal.id}`}
                      className='text-decoration-none fw-bold'
                    >
                      {appeal.id}
                    </Link>
                  </td>
                  <td>
                    <Link
                      href={`/multa-detalle/${appeal.fineId}`}
                      className='text-decoration-none'
                    >
                      {appeal.fineId}
                    </Link>
                  </td>
                  <td>{appeal.resident}</td>
                  <td>{appeal.unit}</td>
                  <td>${appeal.amount.toLocaleString()}</td>
                  <td>
                    <span
                      className={`appeal-status-badge ${getStatusBadge(appeal.status)}`}
                    >
                      {getStatusText(appeal.status)}
                    </span>
                  </td>
                  <td>{appeal.submittedDate}</td>
                  <td>
                    <div className='btn-group'>
                      <button
                        className='btn btn-sm btn-outline-primary'
                        data-bs-toggle='modal'
                        data-bs-target='#reviewModal'
                      >
                        <i className='material-icons'>visibility</i>
                      </button>
                      {appeal.status === 'pending' && (
                        <>
                          <button
                            className='btn btn-sm btn-outline-success'
                            onClick={() => alert('Apelación aprobada')}
                          >
                            <i className='material-icons'>check</i>
                          </button>
                          <button
                            className='btn btn-sm btn-outline-danger'
                            onClick={() => alert('Apelación rechazada')}
                          >
                            <i className='material-icons'>close</i>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className='mobile-cards d-md-none'>
          {filteredAppeals.map(appeal => (
            <div key={appeal.id} className={`appeal-card ${appeal.status}`}>
              <div className='appeal-header'>
                <div>
                  <div className='appeal-number'>
                    <Link
                      href={`/apelacion-detalle/${appeal.id}`}
                      className='text-decoration-none'
                    >
                      {appeal.id}
                    </Link>
                  </div>
                  <div className='appeal-fine'>Multa: {appeal.fineId}</div>
                  <div className='appeal-resident'>{appeal.resident}</div>
                  <div className='appeal-unit'>{appeal.unit}</div>
                </div>
                <div className='text-end'>
                  <div className='appeal-amount'>
                    ${appeal.amount.toLocaleString()}
                  </div>
                  <span
                    className={`appeal-status-badge ${getStatusBadge(appeal.status)}`}
                  >
                    {getStatusText(appeal.status)}
                  </span>
                </div>
              </div>
              <div className='d-flex justify-content-between align-items-center mt-3'>
                <span className='appeal-date'>
                  Enviada: {appeal.submittedDate}
                </span>
                <div className='btn-group'>
                  <button className='btn btn-sm btn-outline-primary'>
                    <i className='material-icons'>visibility</i>
                  </button>
                  {appeal.status === 'pending' && (
                    <>
                      <button className='btn btn-sm btn-outline-success'>
                        <i className='material-icons'>check</i>
                      </button>
                      <button className='btn btn-sm btn-outline-danger'>
                        <i className='material-icons'>close</i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <nav aria-label='Paginación de apelaciones' className='mt-4'>
          <ul className='pagination justify-content-center'>
            <li className='page-item disabled'>
              <a className='page-link' href='#'>
                Anterior
              </a>
            </li>
            <li className='page-item active'>
              <a className='page-link' href='#'>
                1
              </a>
            </li>
            <li className='page-item'>
              <a className='page-link' href='#'>
                2
              </a>
            </li>
            <li className='page-item'>
              <a className='page-link' href='#'>
                3
              </a>
            </li>
            <li className='page-item'>
              <a className='page-link' href='#'>
                Siguiente
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Modal para revisar apelación */}
      <div className='modal fade' id='reviewModal' tabIndex={-1}>
        <div className='modal-dialog modal-lg'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Revisar Apelación</h5>
              <button
                type='button'
                className='btn-close'
                data-bs-dismiss='modal'
              ></button>
            </div>
            <div className='modal-body'>
              <div className='row'>
                <div className='col-md-6'>
                  <h6>Información de la Apelación</h6>
                  <div className='mb-3'>
                    <strong>ID Apelación:</strong> A-2024-001
                  </div>
                  <div className='mb-3'>
                    <strong>ID Multa:</strong> M-2024-089
                  </div>
                  <div className='mb-3'>
                    <strong>Residente:</strong> Juan Pérez
                  </div>
                  <div className='mb-3'>
                    <strong>Unidad:</strong> A-101
                  </div>
                </div>
                <div className='col-md-6'>
                  <h6>Motivo de la Apelación</h6>
                  <p>
                    El residente solicita reconsideración debido a
                    circunstancias atenuantes no consideradas inicialmente.
                  </p>
                  <h6>Evidencia Adjunta</h6>
                  <ul>
                    <li>
                      <a href='#'>documento_prueba.pdf</a>
                    </li>
                    <li>
                      <a href='#'>foto_evidencia.jpg</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='mt-3'>
                <label className='form-label'>Comentarios del Revisor</label>
                <textarea
                  className='form-control'
                  rows={3}
                  placeholder='Ingrese sus comentarios...'
                ></textarea>
              </div>
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-secondary'
                data-bs-dismiss='modal'
              >
                Cancelar
              </button>
              <button type='button' className='btn btn-success'>
                Aprobar Apelación
              </button>
              <button type='button' className='btn btn-danger'>
                Rechazar Apelación
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ApelacionesListadoPage;
