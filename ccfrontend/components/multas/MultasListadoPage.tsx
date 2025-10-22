import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import multasService from '@/lib/multasService';
import { useAuth } from '@/lib/useAuth';
import { ProtectedRoute } from '@/lib/useAuth'; // Agrega si no está
import { usePermissions } from '@/lib/usePermissions';

const MultasListadoPage: React.FC = () => {
  console.log('🚀 MultasListadoPage - Componente montado'); // ✅ Agrega esto

  const router = useRouter();
  const { user } = useAuth();
  const { canCreateMulta } = usePermissions();

  console.log('👤 Usuario en MultasListadoPage:', user); // ✅ Agrega esto

  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    estado: 'all',
    prioridad: 'all',
    busqueda: '',
  });
  const [selectedFines, setSelectedFines] = useState<string[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    console.log('🔄 useEffect ejecutado en MultasListadoPage'); // ✅ Agrega esto
    cargarMultas();
  }, [filtros, pagina]);

  const cargarMultas = async () => {
    console.log('📡 Cargando multas...');
    setLoading(true);
    setError(null);
    try {
      const response = await multasService.getMultas({ ...filtros, pagina });
      // ✅ Asegúrate de que response tenga data y totalPaginas
      setMultas(response.data || []);
      setTotalPaginas(response.totalPaginas || 1);
    } catch (err) {
      setError('Error al cargar multas');
      console.error('Error en cargarMultas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (key: string, value: string) => {
    setFiltros({ ...filtros, [key]: value });
    setPagina(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFines(multas.map((m: any) => m.id));
    } else {
      setSelectedFines([]);
    }
  };

  const handleSelectFine = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedFines([...selectedFines, id]);
    } else {
      setSelectedFines(selectedFines.filter(f => f !== id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedFines.length === 0) {
      return;
    }
    try {
      if (action === 'delete') {
        await Promise.all(
          selectedFines.map(id => multasService.deleteMulta(id)),
        );
        cargarMultas();
      } else if (action === 'pay') {
        // ✅ Agrega acción para marcar pagadas
        await Promise.all(
          selectedFines.map(id => multasService.marcarPagada(id)),
        );
        cargarMultas();
      } else if (action === 'cancel') {
        // ✅ Agrega acción para anular
        await Promise.all(
          selectedFines.map(id =>
            multasService.anularMulta(id, 'Anulada masivamente'),
          ),
        );
        cargarMultas();
      }
      // ✅ Agrega más si es necesario
    } catch (err) {
      setError('Error en acción masiva');
      console.error('Error en handleBulkAction:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      pendiente: 'status-pending',
      pagado: 'status-paid',
      vencido: 'status-overdue',
      apelada: 'status-appealed',
      anulada: 'status-cancelled',
    };
    return classes[status as keyof typeof classes] || 'status-pending';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pendiente: 'Pendiente',
      pagado: 'Pagada',
      vencido: 'Vencida',
      apelada: 'Apelada',
      anulada: 'Cancelada',
    };
    return texts[status as keyof typeof texts] || 'Pendiente';
  };

  const getPriorityBadge = (priority: string) => {
    const classes = {
      baja: 'priority-low',
      media: 'priority-medium',
      alta: 'priority-high',
      critica: 'priority-high',
    };
    return classes[priority as keyof typeof classes] || 'priority-low';
  };

  const getPriorityText = (priority: string) => {
    const texts = {
      baja: 'Baja',
      media: 'Media',
      alta: 'Alta',
      critica: 'Crítica',
    };
    return texts[priority as keyof typeof texts] || 'Baja';
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();
  const isDueSoon = (dueDate: string) => {
    const diff =
      (new Date(dueDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24);
    return diff <= 3 && diff > 0;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Lista de Multas'>
          <div className='text-center p-4'>Cargando...</div>
        </Layout>
      </ProtectedRoute>
    );
  }
  if (error) {
    return (
      <ProtectedRoute>
        <Layout title='Lista de Multas'>
          <div className='alert alert-danger'>{error}</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout title='Lista de Multas'>
        <div className='container-fluid p-4'>
          {/* Header con búsqueda y notificaciones */}
          <header className='bg-white border-bottom shadow-sm p-3 mb-4'>
            <div className='d-flex justify-content-between align-items-center'>
              <div className='d-flex align-items-center'>
                <button
                  className='btn btn-link d-lg-none me-3'
                  onClick={() => {
                    /* toggle sidebar */
                  }}
                >
                  <i className='material-icons'>menu</i>
                </button>
                <h1 className='h4 mb-0'>Multas</h1>
              </div>
              <div className='d-flex align-items-center'>
                <div className='input-group me-3' style={{ maxWidth: '300px' }}>
                  <span className='input-group-text'>
                    <i className='material-icons'>search</i>
                  </span>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Buscar multas...'
                    value={filtros.busqueda}
                    onChange={e =>
                      handleFiltroChange('busqueda', e.target.value)
                    }
                  />
                </div>
                <button className='btn btn-outline-secondary me-2'>
                  <i className='material-icons'>notifications</i>
                </button>
                {canCreateMulta && (
                  <Link href='/multas/nueva' className='btn btn-primary'>
                    <i className='material-icons me-2'>add</i>Nueva Multa
                  </Link>
                )}
              </div>
            </div>
          </header>

          {/* Filtros */}
          <div className='filters-panel mb-4'>
            <div className='d-flex flex-wrap align-items-center'>
              <span className='me-3 fw-bold'>Filtros:</span>
              <select
                value={filtros.estado}
                onChange={e => handleFiltroChange('estado', e.target.value)}
                className='form-select me-2'
              >
                <option value='all'>Todas</option>
                <option value='pendiente'>Pendientes</option>
                <option value='pagado'>Pagadas</option>
                <option value='vencido'>Vencidas</option>
                <option value='apelada'>Apeladas</option>
              </select>
              <select
                value={filtros.prioridad}
                onChange={e => handleFiltroChange('prioridad', e.target.value)}
                className='form-select'
              >
                <option value='all'>Todas Prioridades</option>
                <option value='baja'>Baja</option>
                <option value='media'>Media</option>
                <option value='alta'>Alta</option>
                <option value='critica'>Crítica</option>
              </select>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedFines.length > 0 && (
            <div className='bulk-actions show mb-4'>
              <div className='d-flex justify-content-between align-items-center'>
                <span>{selectedFines.length} multas seleccionadas</span>
                <div>
                  <button
                    className='btn btn-light me-2'
                    onClick={() => handleBulkAction('reminder')}
                  >
                    <i className='material-icons me-1'>send</i>Enviar
                    recordatorios
                  </button>
                  <button
                    className='btn btn-light me-2'
                    onClick={() => handleBulkAction('pay')}
                  >
                    <i className='material-icons me-1'>check_circle</i>Marcar
                    como pagadas
                  </button>
                  <button
                    className='btn btn-light'
                    onClick={() => handleBulkAction('cancel')}
                  >
                    <i className='material-icons me-1'>cancel</i>Cancelar multas
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabla */}
          <div className='table-responsive d-none d-md-block'>
            <table className='table table-hover'>
              <thead>
                <tr>
                  <th>
                    <input
                      type='checkbox'
                      onChange={e => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th>Número</th>
                  <th>Infracción</th>
                  <th>Unidad</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Fecha límite</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {multas.map((multa: any) => (
                  <tr key={multa.id}>
                    <td>
                      <input
                        type='checkbox'
                        checked={selectedFines.includes(multa.id)}
                        onChange={e =>
                          handleSelectFine(multa.id, e.target.checked)
                        }
                      />
                    </td>
                    <td>
                      <Link
                        href={`/multas/${multa.id}`}
                        className='text-decoration-none fw-bold'
                      >
                        {multa.numero}
                      </Link>
                    </td>
                    <td>{multa.tipo_infraccion}</td>
                    <td>{multa.unidad_numero}</td>
                    <td>${multa.monto.toLocaleString()}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusBadge(multa.estado)}`}
                      >
                        {getStatusText(multa.estado)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`priority-badge ${getPriorityBadge(multa.prioridad)}`}
                      >
                        {getPriorityText(multa.prioridad)}
                      </span>
                    </td>
                    <td>
                      <div className='fine-meta'>
                        <div className='fine-date'>
                          {multa.fecha_vencimiento}
                        </div>
                        <div
                          className={`fine-due-date ${isOverdue(multa.fecha_vencimiento) ? 'overdue' : isDueSoon(multa.fecha_vencimiento) ? 'soon' : 'normal'}`}
                        >
                          {isOverdue(multa.fecha_vencimiento)
                            ? 'Vencida'
                            : isDueSoon(multa.fecha_vencimiento)
                              ? 'Próxima a vencer'
                              : 'En plazo'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className='btn-group'>
                        <button
                          className='btn btn-sm btn-outline-primary'
                          onClick={() => router.push(`/multas/${multa.id}`)}
                        >
                          <i className='material-icons'>visibility</i>
                        </button>
                        <button
                          className='btn btn-sm btn-outline-secondary'
                          onClick={() =>
                            router.push(`/multas/${multa.id}/editar`)
                          }
                        >
                          <i className='material-icons'>edit</i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className='mobile-cards d-md-none'>
            {multas.map((multa: any) => (
              <div key={multa.id} className={`fine-card ${multa.estado}`}>
                <div className='fine-header'>
                  <div>
                    <div className='fine-number'>
                      <Link href={`/multas/${multa.id}`}>{multa.numero}</Link>
                    </div>
                    <div className='fine-violation'>
                      {multa.tipo_infraccion}
                    </div>
                    <div className='fine-unit'>{multa.unidad_numero}</div>
                  </div>
                  <div className='text-end'>
                    <div className='fine-amount'>
                      ${multa.monto.toLocaleString()}
                    </div>
                    <span
                      className={`status-badge ${getStatusBadge(multa.estado)}`}
                    >
                      {getStatusText(multa.estado)}
                    </span>
                  </div>
                </div>
                <div className='d-flex justify-content-between align-items-center mt-3'>
                  <span
                    className={`priority-badge ${getPriorityBadge(multa.prioridad)}`}
                  >
                    {getPriorityText(multa.prioridad)}
                  </span>
                  <div className='btn-group'>
                    <button
                      className='btn btn-sm btn-outline-primary'
                      onClick={() => router.push(`/multas/${multa.id}`)}
                    >
                      <i className='material-icons'>visibility</i>
                    </button>
                    <button
                      className='btn btn-sm btn-outline-secondary'
                      onClick={() => router.push(`/multas/${multa.id}/editar`)}
                    >
                      <i className='material-icons'>edit</i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          <nav aria-label='Paginación' className='mt-4'>
            <ul className='pagination justify-content-center'>
              <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
                <button
                  className='page-link'
                  onClick={() => setPagina(pagina - 1)}
                >
                  Anterior
                </button>
              </li>
              {Array.from({ length: totalPaginas }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${pagina === i + 1 ? 'active' : ''}`}
                >
                  <button
                    className='page-link'
                    onClick={() => setPagina(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}
              >
                <button
                  className='page-link'
                  onClick={() => setPagina(pagina + 1)}
                >
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>

          {/* Modal para registrar pago */}
          <div className='modal fade' id='paymentModal' tabIndex={-1}>
            <div className='modal-dialog'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title'>Registrar Pago</h5>
                  <button
                    type='button'
                    className='btn-close'
                    data-bs-dismiss='modal'
                  ></button>
                </div>
                <div className='modal-body'>
                  <form>
                    <div className='mb-3'>
                      <label className='form-label'>Monto</label>
                      <input
                        type='number'
                        className='form-control'
                        placeholder='Ingrese el monto'
                      />
                    </div>
                    <div className='mb-3'>
                      <label className='form-label'>Fecha de pago</label>
                      <input type='date' className='form-control' />
                    </div>
                    <div className='mb-3'>
                      <label className='form-label'>Método de pago</label>
                      <select className='form-select'>
                        <option>Efectivo</option>
                        <option>Transferencia</option>
                        <option>Tarjeta de crédito</option>
                      </select>
                    </div>
                    <div className='mb-3'>
                      <label className='form-label'>Referencia</label>
                      <input
                        type='text'
                        className='form-control'
                        placeholder='Número de referencia'
                      />
                    </div>
                  </form>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-secondary'
                    data-bs-dismiss='modal'
                  >
                    Cancelar
                  </button>
                  <button type='button' className='btn btn-primary'>
                    Registrar Pago
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal para revisar apelación */}
          <div className='modal fade' id='appealModal' tabIndex={-1}>
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
                  <div className='mb-3'>
                    <label className='form-label'>Motivo de la apelación</label>
                    <textarea
                      className='form-control'
                      rows={3}
                      readOnly
                      value='El residente solicita reconsideración debido a circunstancias atenuantes...'
                    />
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Evidencia adjunta</label>
                    <div className='d-flex gap-2'>
                      <button className='btn btn-outline-secondary btn-sm'>
                        Ver evidencia 1
                      </button>
                      <button className='btn btn-outline-secondary btn-sm'>
                        Ver evidencia 2
                      </button>
                    </div>
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Decisión</label>
                    <select className='form-select'>
                      <option>Aprobar apelación</option>
                      <option>Rechazar apelación</option>
                      <option>Requerir más información</option>
                    </select>
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Comentarios</label>
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
                    Aprobar
                  </button>
                  <button type='button' className='btn btn-danger'>
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal para acciones masivas */}
          <div className='modal fade' id='bulkActionModal' tabIndex={-1}>
            <div className='modal-dialog'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title'>Acciones Masivas</h5>
                  <button
                    type='button'
                    className='btn-close'
                    data-bs-dismiss='modal'
                  ></button>
                </div>
                <div className='modal-body'>
                  <p>
                    ¿Qué acción desea realizar con las {selectedFines.length}{' '}
                    multas seleccionadas?
                  </p>
                  <div className='d-grid gap-2'>
                    <button className='btn btn-outline-primary'>
                      Enviar recordatorios
                    </button>
                    <button className='btn btn-outline-success'>
                      Marcar como pagadas
                    </button>
                    <button className='btn btn-outline-danger'>
                      Cancelar multas
                    </button>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default MultasListadoPage;
