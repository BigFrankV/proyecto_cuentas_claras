import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

import {
  listCargosByComunidad,
  createCargo,
  updateCargoFull,
  deleteCargo,
  getCargoDetalle,
  getCargoPagos,
  getCargoStatsByComunidad,
  getCargoHistorialPagos,
  recalcularInteresCargoVencido,
  notificarCargo,
  getCargosAlerta,
} from '@/lib/cargosService';
import { useAuth } from '@/lib/useAuth';

interface CargosModuloProps {
  comunidadId?: number;
}

export default function CargosModulo({ comunidadId }: CargosModuloProps) {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [cargos, setCargos] = useState<any[]>([]);
  const [selectedCargo, setSelectedCargo] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [detalles, setDetalles] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [historialPagos, setHistorialPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<any>({});

  // Cargar cargos por comunidad
  useEffect(() => {
    if (comunidadId) {
      cargarCargos();
      cargarStats();
      cargarAlertas();
    }
  }, [comunidadId, page, filters]);

  const cargarCargos = async () => {
    if (!comunidadId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await listCargosByComunidad(comunidadId, filters, page, 50);
      setCargos(result.data || []);
    } catch (err) {
      setError('Error al cargar cargos');
    } finally {
      setLoading(false);
    }
  };

  const cargarStats = async () => {
    if (!comunidadId) {
      return;
    }
    try {
      const result = await getCargoStatsByComunidad(comunidadId);
      setStats(result);
    } catch {
      // Error handled silently
    }
  };

  const cargarAlertas = async () => {
    if (!comunidadId) {
      return;
    }
    try {
      const result = await getCargosAlerta(comunidadId);
      setAlertas(result);
    } catch {
      // Error handled silently
    }
  };

  const handleViewDetail = async (cargo: any) => {
    setLoading(true);
    try {
      const [details, payments, history] = await Promise.all([
        getCargoDetalle(cargo.id),
        getCargoPagos(cargo.id),
        getCargoHistorialPagos(cargo.id),
      ]);
      setSelectedCargo(cargo);
      setDetalles(details);
      setPagos(payments);
      setHistorialPagos(history);
      setView('detail');
    } catch (err) {
      setError('Error al cargar detalles del cargo');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCargo(null);
    setView('form');
  };

  const handleEdit = (cargo: any) => {
    setSelectedCargo(cargo);
    setView('form');
  };

  const handleDelete = async (cargo: any) => {
    if (window.confirm('¿Está seguro que desea eliminar este cargo?')) {
      try {
        await deleteCargo(cargo.id);
        cargarCargos();
      } catch (err) {
        setError('Error al eliminar cargo');
      }
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (selectedCargo?.id) {
        await updateCargoFull(selectedCargo.id, data);
      } else {
        await createCargo(data);
      }
      cargarCargos();
      setView('list');
    } catch (err) {
      setError('Error al guardar cargo');
    }
  };

  const handleRecalcularInteres = async (cargoId: number) => {
    if (window.confirm('¿Recalcular interés del cargo vencido?')) {
      try {
        await recalcularInteresCargoVencido(cargoId);
        cargarCargos();
      } catch (err) {
        setError('Error al recalcular interés');
      }
    }
  };

  const handleNotificar = async (cargoId: number) => {
    try {
      await notificarCargo(cargoId);
      alert('Notificación enviada exitosamente');
    } catch (err) {
      setError('Error al enviar notificación');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'unidad', label: 'Unidad' },
    {
      key: 'monto',
      label: 'Monto',
      render: (val: number) =>
        new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }).format(val),
    },
    {
      key: 'saldo',
      label: 'Saldo',
      render: (val: number) =>
        new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }).format(val),
    },
    { key: 'estado', label: 'Estado' },
    {
      key: 'fecha_vencimiento',
      label: 'Vencimiento',
      render: (val: string) => new Date(val).toLocaleDateString('es-CO'),
    },
  ];

  const formFields = [
    {
      name: 'concepto',
      label: 'Concepto',
      type: 'text',
      required: true,
    },
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select',
      options: [
        { label: 'Administración', value: 'administracion' },
        { label: 'Extraordinaria', value: 'extraordinaria' },
        { label: 'Multa', value: 'multa' },
        { label: 'Interés', value: 'interes' },
      ],
      required: true,
    },
    {
      name: 'monto',
      label: 'Monto',
      type: 'number',
      required: true,
    },
    {
      name: 'fecha_vencimiento',
      label: 'Fecha Vencimiento',
      type: 'date',
      required: true,
    },
    {
      name: 'unidad',
      label: 'Unidad',
      type: 'text',
      required: true,
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
    },
  ];

  if (view === 'list') {
    return (
      <div className='container-fluid py-4'>
        {error && <Alert variant='danger'>{error}</Alert>}

        {/* Alertas de Próximos Vencimientos */}
        {alertas.length > 0 && (
          <Alert variant='warning' className='mb-3'>
            <strong>⚠️ {alertas.length} cargo(s) próximo a vencer</strong>
          </Alert>
        )}

        {/* Estadísticas */}
        {stats && (
          <div className='row mb-4'>
            <div className='col-md-3'>
              <div className='card bg-primary text-white'>
                <div className='card-body'>
                  <h6 className='card-title'>Total Cargos</h6>
                  <h3>{stats.total_cargos}</h3>
                  <small>${stats.monto_total?.toLocaleString()}</small>
                </div>
              </div>
            </div>
            <div className='col-md-3'>
              <div className='card bg-warning text-white'>
                <div className='card-body'>
                  <h6 className='card-title'>Pendientes</h6>
                  <h3>{stats.cargos_pendientes}</h3>
                  <small>${stats.saldo_total?.toLocaleString()}</small>
                </div>
              </div>
            </div>
            <div className='col-md-3'>
              <div className='card bg-danger text-white'>
                <div className='card-body'>
                  <h6 className='card-title'>Vencidos</h6>
                  <h3>{stats.cargos_vencidos}</h3>
                  <small>${stats.interes_total?.toLocaleString()}</small>
                </div>
              </div>
            </div>
            <div className='col-md-3'>
              <div className='card bg-success text-white'>
                <div className='card-body'>
                  <h6 className='card-title'>Pagados</h6>
                  <h3>{stats.cargos_pagados}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h3>Gestión de Cargos</h3>
          {user?.roles?.includes('admin') && (
            <button className='btn btn-success' onClick={handleCreate}>
              + Nuevo Cargo
            </button>
          )}
        </div>

        {/* Tabla de Cargos */}
        <div className='card'>
          <div className='table-responsive'>
            <table className='table table-hover mb-0'>
              <thead className='table-light'>
                <tr>
                  <th>ID</th>
                  <th>Concepto</th>
                  <th>Tipo</th>
                  <th>Unidad</th>
                  <th>Monto</th>
                  <th>Saldo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargos.map((cargo: any) => (
                  <tr key={cargo.id}>
                    <td>{cargo.id}</td>
                    <td>{cargo.concepto}</td>
                    <td>{cargo.tipo}</td>
                    <td>{cargo.unidad}</td>
                    <td>
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                      }).format(cargo.monto)}
                    </td>
                    <td>
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                      }).format(cargo.saldo)}
                    </td>
                    <td>
                      <span className='badge bg-secondary'>{cargo.estado}</span>
                    </td>
                    <td>
                      <button
                        className='btn btn-sm btn-outline-primary me-1'
                        onClick={() => handleViewDetail(cargo)}
                      >
                        Ver
                      </button>
                      {user?.roles?.includes('admin') && (
                        <>
                          <button
                            className='btn btn-sm btn-outline-warning me-1'
                            onClick={() => handleEdit(cargo)}
                          >
                            Editar
                          </button>
                          <button
                            className='btn btn-sm btn-outline-danger'
                            onClick={() => handleDelete(cargo)}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'form') {
    return (
      <div className='container-fluid py-4'>
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h3>{selectedCargo?.id ? 'Editar Cargo' : 'Nuevo Cargo'}</h3>
          <button className='btn btn-secondary' onClick={() => setView('list')}>
            Volver
          </button>
        </div>

        <div className='card'>
          <div className='card-body'>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget as HTMLFormElement);
                const data: Record<string, any> = {};
                // eslint-disable-next-line no-restricted-syntax
                for (const [key, value] of formData.entries()) {
                  data[key] = value;
                }
                handleSave(data);
              }}
            >
              <div className='row'>
                <div className='col-md-6 mb-3'>
                  <label className='form-label'>Concepto</label>
                  <input
                    type='text'
                    name='concepto'
                    className='form-control'
                    defaultValue={selectedCargo?.concepto || ''}
                    required
                  />
                </div>
                <div className='col-md-6 mb-3'>
                  <label className='form-label'>Tipo</label>
                  <select
                    name='tipo'
                    className='form-select'
                    defaultValue={selectedCargo?.tipo || ''}
                    required
                  >
                    <option value=''>Seleccionar...</option>
                    <option value='administracion'>Administración</option>
                    <option value='extraordinaria'>Extraordinaria</option>
                    <option value='multa'>Multa</option>
                    <option value='interes'>Interés</option>
                  </select>
                </div>
              </div>

              <div className='row'>
                <div className='col-md-6 mb-3'>
                  <label className='form-label'>Monto</label>
                  <input
                    type='number'
                    name='monto'
                    className='form-control'
                    defaultValue={selectedCargo?.monto || 0}
                    step='0.01'
                    required
                  />
                </div>
                <div className='col-md-6 mb-3'>
                  <label className='form-label'>Fecha Vencimiento</label>
                  <input
                    type='date'
                    name='fecha_vencimiento'
                    className='form-control'
                    defaultValue={selectedCargo?.fecha_vencimiento || ''}
                    required
                  />
                </div>
              </div>

              <div className='mb-3'>
                <label className='form-label'>Unidad</label>
                <input
                  type='text'
                  name='unidad'
                  className='form-control'
                  defaultValue={selectedCargo?.unidad || ''}
                  required
                />
              </div>

              <div className='mb-3'>
                <label className='form-label'>Descripción</label>
                <textarea
                  name='descripcion'
                  className='form-control'
                  rows={3}
                  defaultValue={selectedCargo?.descripcion || ''}
                />
              </div>

              <div className='d-flex gap-2'>
                <button
                  type='submit'
                  className='btn btn-success'
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={() => setView('list')}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'detail' && selectedCargo) {
    return (
      <div className='container-fluid py-4'>
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h3>Detalle del Cargo #{selectedCargo.id}</h3>
          <div>
            {user?.roles?.includes('admin') && (
              <>
                <button
                  className='btn btn-warning btn-sm me-2'
                  onClick={() => handleEdit(selectedCargo)}
                >
                  Editar
                </button>
                <button
                  className='btn btn-danger btn-sm me-2'
                  onClick={() => handleDelete(selectedCargo)}
                >
                  Eliminar
                </button>
              </>
            )}
            <button className='btn btn-secondary' onClick={() => setView('list')}>
              Volver
            </button>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-4'>
            <div className='card mb-3'>
              <div className='card-header'>
                <h5 className='mb-0'>Información del Cargo</h5>
              </div>
              <div className='card-body'>
                <p>
                  <strong>Concepto:</strong> {selectedCargo.concepto}
                </p>
                <p>
                  <strong>Tipo:</strong> {selectedCargo.tipo}
                </p>
                <p>
                  <strong>Unidad:</strong> {selectedCargo.unidad}
                </p>
                <p>
                  <strong>Monto:</strong>{' '}
                  {new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                  }).format(selectedCargo.monto)}
                </p>
                <p>
                  <strong>Saldo:</strong>{' '}
                  {new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                  }).format(selectedCargo.saldo)}
                </p>
                <p>
                  <strong>Estado:</strong>{' '}
                  <span className='badge bg-secondary'>
                    {selectedCargo.estado}
                  </span>
                </p>

                {user?.roles?.includes('admin') && selectedCargo.estado === 'vencido' && (
                  <button
                    className='btn btn-warning w-100 mt-3'
                    onClick={() =>
                      handleRecalcularInteres(selectedCargo.id)
                    }
                  >
                    Recalcular Interés
                  </button>
                )}

                {user?.roles?.includes('admin') && (
                  <button
                    className='btn btn-info w-100 mt-2'
                    onClick={() =>
                      handleNotificar(selectedCargo.id)
                    }
                  >
                    Enviar Notificación
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className='col-md-8'>
            {/* Detalles de Gastos */}
            {detalles.length > 0 && (
              <div className='card mb-3'>
                <div className='card-header'>
                  <h5 className='mb-0'>Desglose de Gastos</h5>
                </div>
                <div className='card-body'>
                  <div className='table-responsive'>
                    <table className='table table-sm'>
                      <thead>
                        <tr>
                          <th>Categoría</th>
                          <th>Descripción</th>
                          <th>Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalles.map((det: any, i: number) => (
                          <tr key={i}>
                            <td>{det.categoria}</td>
                            <td>{det.descripcion}</td>
                            <td>
                              {new Intl.NumberFormat('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                              }).format(det.monto)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Pagos Aplicados */}
            {pagos.length > 0 && (
              <div className='card mb-3'>
                <div className='card-header'>
                  <h5 className='mb-0'>Pagos Aplicados</h5>
                </div>
                <div className='card-body'>
                  <div className='table-responsive'>
                    <table className='table table-sm'>
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Método</th>
                          <th>Monto Pagado</th>
                          <th>Aplicado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagos.map((pago: any, i: number) => (
                          <tr key={i}>
                            <td>
                              {new Date(pago.fecha_pago).toLocaleDateString(
                                'es-CO',
                              )}
                            </td>
                            <td>{pago.metodo_pago}</td>
                            <td>
                              {new Intl.NumberFormat('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                              }).format(pago.monto_pago)}
                            </td>
                            <td>
                              {new Intl.NumberFormat('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                              }).format(pago.monto_aplicado)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Historial de Pagos */}
            {historialPagos.length > 0 && (
              <div className='card'>
                <div className='card-header'>
                  <h5 className='mb-0'>Historial de Pagos</h5>
                </div>
                <div className='card-body'>
                  <div className='table-responsive'>
                    <table className='table table-sm'>
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Usuario</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historialPagos.map((hist: any, i: number) => (
                          <tr key={i}>
                            <td>
                              {new Date(hist.fecha).toLocaleDateString('es-CO')}
                            </td>
                            <td>{hist.usuario}</td>
                            <td>{hist.accion}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
