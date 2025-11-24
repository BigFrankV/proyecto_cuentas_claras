import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';

import { useCargos } from '@/hooks/useCargos';
import { useAuth } from '@/lib/useAuth';
import { Permission, usePermissions } from '@/lib/usePermissions';
import { Cargo } from '@/types/cargos';

const CargosListadoSimple: React.FC = () => {
  const { user } = useAuth();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const { hasPermission } = usePermissions();

  const { listarCargos, loading, error } = useCargos();

  // Cargar cargos al montar el componente
  useEffect(() => {
    cargarCargos();
  }, []);

  // Cargar cargos con filtro de estado
  useEffect(() => {
    cargarCargos();
  }, [selectedStatus]);

  const cargarCargos = async () => {
    try {
      const filters: any = {};

      if (selectedStatus !== 'todos') {
        filters.estado = selectedStatus;
      }

      const data = await listarCargos(filters);
      setCargos(data);
    } catch {
      // Error ya manejado por el hook
    }
  };

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Formatear fecha
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Obtener clase de estado
  const getStatusClass = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return 'bg-success';
      case 'pendiente':
        return 'bg-warning';
      case 'vencido':
        return 'bg-danger';
      case 'parcial':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  // Obtener texto del estado
  const getStatusText = (estado: string) => {
    const statusMap: Record<string, string> = {
      pendiente: 'Pendiente',
      pagado: 'Pagado',
      vencido: 'Vencido',
      parcial: 'Parcial',
    };
    return statusMap[estado] || estado;
  };

  // Filtrar cargos por búsqueda
  const filteredCargos = useMemo(() => {
    if (!searchTerm.trim()) {
      return cargos;
    }

    const term = searchTerm.toLowerCase();
    return cargos.filter(
      cargo =>
        cargo.concepto.toLowerCase().includes(term) ||
        cargo.unidad.toLowerCase().includes(term) ||
        cargo.id.toString().includes(term) ||
        (cargo.propietario?.toLowerCase().includes(term) || false),
    );
  }, [cargos, searchTerm]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    return {
      total: cargos.length,
      pendientes: cargos.filter(c => c.estado === 'pendiente').length,
      pagados: cargos.filter(c => c.estado === 'pagado').length,
      vencidos: cargos.filter(c => c.estado === 'vencido').length,
      parciales: cargos.filter(c => c.estado === 'parcial').length,
      montoTotal: cargos.reduce((sum, c) => sum + c.monto, 0),
      saldoTotal: cargos.reduce((sum, c) => sum + c.saldo, 0),
    };
  }, [cargos]);

  if (loading) {
    return (
      <div className='container-fluid py-4'>
        <div className='text-center'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Cargando...</span>
          </div>
          <p className='mt-2'>Cargando cargos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container-fluid py-4'>
      {/* Error Alert */}
      {error && (
        <div className='alert alert-danger alert-dismissible fade show' role='alert'>
          <i className='material-icons me-2'>error</i>
          <strong>Error:</strong> {error}
          <button
            type='button'
            className='btn-close'
            onClick={() => cargarCargos()}
            title='Reintentar'
          />
        </div>
      )}

      {/* Header */}
      <div className='container-fluid p-0'>
        <div
          className='text-white'
          style={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className='p-4'>
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-10%',
              left: '-5%',
              width: '150px',
              height: '150px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
            }}
          />
          <div className='d-flex align-items-center justify-content-between'>
            <div className='d-flex align-items-center'>
              <div
                className='me-4'
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i
                  className='material-icons'
                  style={{ fontSize: '32px', color: 'white' }}
                >
                  receipt
                </i>
              </div>
              <div>
                <h1 className='h2 mb-1 text-white'>
                  Cargos
                </h1>
                <p className='mb-0 opacity-75'>
                  {hasPermission(Permission.CREATE_CARGO) 
                    ? 'Gestión y seguimiento de cargos de la comunidad'
                    : 'Consulta tus cargos pendientes y pagados'}
                </p>
              </div>
            </div>
            <div className='text-end'>
              {hasPermission(Permission.CREATE_CARGO) && (
                <Link
                  href='/cargos/nuevo'
                  className='btn btn-light btn-lg'
                >
                  <i className='material-icons me-2'>add</i>
                  Nuevo Cargo
                </Link>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className='row mt-4'>
            <div className='col-md-3 mb-3'>
              <div
                className='p-3 rounded-3 text-white'
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className='d-flex align-items-center'>
                  <div
                    className='me-3'
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className='material-icons'>receipt</i>
                  </div>
                  <div>
                    <div className='h3 mb-0'>{stats.total}</div>
                    <div className='text-white-50'>Total Cargos</div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-md-3 mb-3'>
              <div
                className='p-3 rounded-3 text-white'
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className='d-flex align-items-center'>
                  <div
                    className='me-3'
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-warning)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className='material-icons'>schedule</i>
                  </div>
                  <div>
                    <div className='h3 mb-0'>{stats.pendientes}</div>
                    <div className='text-white-50'>Pendientes</div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-md-3 mb-3'>
              <div
                className='p-3 rounded-3 text-white'
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className='d-flex align-items-center'>
                  <div
                    className='me-3'
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-success)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className='material-icons'>check_circle</i>
                  </div>
                  <div>
                    <div className='h3 mb-0'>{stats.pagados}</div>
                    <div className='text-white-50'>Pagados</div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-md-3 mb-3'>
              <div
                className='p-3 rounded-3 text-white'
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className='d-flex align-items-center'>
                  <div
                    className='me-3'
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-danger)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className='material-icons'>error</i>
                  </div>
                  <div>
                    <div className='h3 mb-0'>{stats.vencidos}</div>
                    <div className='text-white-50'>Vencidos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='card mb-4'>
        <div className='card-body'>
          <div className='row g-3'>
            <div className='col-md-6'>
              <label className='form-label'>Buscar</label>
              <input
                type='text'
                className='form-control'
                placeholder='Concepto, unidad, ID o propietario...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className='col-md-4'>
              <label className='form-label'>Estado</label>
              <select
                className='form-select'
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
              >
                <option value='todos'>Todos los estados</option>
                <option value='pendiente'>Pendiente</option>
                <option value='pagado'>Pagado</option>
                <option value='vencido'>Vencido</option>
                <option value='parcial'>Parcial</option>
              </select>
            </div>
            <div className='col-md-2 d-flex align-items-end'>
              <button
                className='btn btn-outline-secondary w-100'
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('todos');
                }}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredCargos.length === 0 ? (
        <div className='card'>
          <div className='card-body text-center py-5'>
            <i className='material-icons' style={{ fontSize: '48px' }}>
              event_note
            </i>
            <h5 className='mt-3'>
              {cargos.length === 0
                ? 'No hay cargos registrados'
                : 'No se encontraron cargos'}
            </h5>
            <p className='text-muted mb-0'>
              {cargos.length === 0
                ? 'Comienza creando un nuevo cargo.'
                : 'No hay cargos que coincidan con los filtros.'}
            </p>
          </div>
        </div>
      ) : (
        <div className='card'>
          <div className='table-responsive'>
            <table className='table table-hover mb-0'>
              <thead className='table-light'>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Concepto</th>
                  <th>Tipo</th>
                  <th>Unidad</th>
                  <th>Monto</th>
                  <th>Saldo</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th style={{ width: '100px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCargos.map(cargo => (
                  <tr key={cargo.id}>
                    <td>
                      <span className='badge bg-secondary'>{cargo.id}</span>
                    </td>
                    <td>
                      <div>
                        <strong>{cargo.concepto}</strong>
                        {cargo.descripcion && (
                          <div className='small text-muted'>
                            {cargo.descripcion}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <small className='text-muted'>{cargo.tipo}</small>
                    </td>
                    <td>
                      <strong>{cargo.unidad}</strong>
                    </td>
                    <td>{formatCurrency(cargo.monto)}</td>
                    <td>
                      {cargo.saldo > 0 ? (
                        <span className='text-danger'>
                          {formatCurrency(cargo.saldo)}
                        </span>
                      ) : (
                        <span className='text-success'>$0</span>
                      )}
                    </td>
                    <td>{formatDate(cargo.fechaVencimiento)}</td>
                    <td>
                      <span
                        className={`badge ${getStatusClass(cargo.estado)}`}
                      >
                        {getStatusText(cargo.estado)}
                      </span>
                    </td>
                    <td>
                      <div className='btn-group btn-group-sm'>
                        <Link
                          href={`/cargos/${cargo.id}`}
                          className='btn btn-outline-primary'
                          title='Ver detalles'
                        >
                          <i className='material-icons' style={{ fontSize: '16px' }}>
                            visibility
                          </i>
                        </Link>
                        <button
                          className='btn btn-outline-secondary'
                          title='Más opciones'
                        >
                          <i className='material-icons' style={{ fontSize: '16px' }}>
                            more_vert
                          </i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results Info */}
      {filteredCargos.length > 0 && (
        <div className='mt-3 text-muted small'>
          Mostrando {filteredCargos.length} de {cargos.length} cargos
          {stats.saldoTotal > 0 && (
            <>
              • Saldo total: <strong>{formatCurrency(stats.saldoTotal)}</strong>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CargosListadoSimple;
