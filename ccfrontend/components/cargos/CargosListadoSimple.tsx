import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';

import { useCargos } from '@/hooks/useCargos';
import { Cargo } from '@/types/cargos';

const CargosListadoSimple: React.FC = () => {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');

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
      <div className='mb-4'>
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h2 className='mb-0'>Gestión de Cargos</h2>
          <Link href='/cargos/nuevo' className='btn btn-success'>
            <i className='material-icons me-2'>add</i>
            Nuevo Cargo
          </Link>
        </div>
        <p className='text-muted mb-0'>
          Administra y da seguimiento a todos los cargos
        </p>
      </div>

      {/* Statistics Cards */}
      <div className='row mb-4'>
        <div className='col-md-3'>
          <div className='card text-center'>
            <div className='card-body'>
              <h5 className='card-title text-muted mb-2'>Total Cargos</h5>
              <h2 className='mb-0'>{stats.total}</h2>
              <small className='text-muted'>
                {formatCurrency(stats.montoTotal)}
              </small>
            </div>
          </div>
        </div>
        <div className='col-md-3'>
          <div className='card text-center border-warning'>
            <div className='card-body'>
              <h5 className='card-title text-warning mb-2'>Pendientes</h5>
              <h2 className='text-warning mb-0'>{stats.pendientes}</h2>
              <small className='text-muted'>Por cobrar</small>
            </div>
          </div>
        </div>
        <div className='col-md-3'>
          <div className='card text-center border-success'>
            <div className='card-body'>
              <h5 className='card-title text-success mb-2'>Pagados</h5>
              <h2 className='text-success mb-0'>{stats.pagados}</h2>
              <small className='text-muted'>Completado</small>
            </div>
          </div>
        </div>
        <div className='col-md-3'>
          <div className='card text-center border-danger'>
            <div className='card-body'>
              <h5 className='card-title text-danger mb-2'>Vencidos</h5>
              <h2 className='text-danger mb-0'>{stats.vencidos}</h2>
              <small className='text-muted'>Requieren atención</small>
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
