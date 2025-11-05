import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';

import { cargosApi } from '../../lib/api/cargos';
import { Cargo } from '../../types/cargos';

interface CargosListadoProps {
  comunidadId?: string;
}

const CargosListado: React.FC<CargosListadoProps> = ({ comunidadId }) => {
  const [charges, setCharges] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Cargar datos de la API
  useEffect(() => {
    const loadCharges = async () => {
      try {
        setLoading(true);
        setError(null);

        let data: Cargo[];
        if (comunidadId) {
          const id = parseInt(comunidadId, 10);
          if (!isNaN(id)) {
            data = await cargosApi.getByComunidad(id);
          } else {
            data = [];
          }
        } else {
          // Si no hay comunidadId, podríamos cargar todos los cargos o mostrar un mensaje
          data = [];
        }

        setCharges(data);
      } catch {
        setError('Error al cargar los cargos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadCharges();
  }, [comunidadId]);

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Formatear fecha
  const formatDate = (dateString: string | Date) => {
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Obtener texto del estado
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pendiente: 'Pendiente',
      pagado: 'Pagado',
      vencido: 'Vencido',
      parcial: 'Parcial',
    };
    return statusMap[status] || status;
  };

  // Obtener texto del tipo
  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      Administración: 'Administración',
      extraordinaria: 'Extraordinaria',
      multa: 'Multa',
      interes: 'Interés',
      Mantenimiento: 'Mantenimiento',
      Servicio: 'Servicio',
      Seguro: 'Seguro',
      Otro: 'Otro',
    };
    return typeMap[type] || type;
  };

  // Filtrar cargos
  const filteredCharges = useMemo(() => {
    return charges.filter(charge => {
      const matchesSearch =
        charge.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charge.unidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charge.id.toString().includes(searchTerm);

      const matchesStatus =
        selectedStatus === 'all' || charge.estado === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [charges, searchTerm, selectedStatus]);

  // Estadísticas
  const stats = useMemo(() => {
    return {
      total: charges.length,
      pending: charges.filter(c => c.estado === 'pendiente').length,
      paid: charges.filter(c => c.estado === 'pagado').length,
      overdue: charges.filter(c => {
        const dueDate =
          c.fechaVencimiento instanceof Date
            ? c.fechaVencimiento
            : new Date(c.fechaVencimiento);
        const today = new Date();
        return c.estado === 'pendiente' && dueDate < today;
      }).length,
    };
  }, [charges]);

  // Función para marcar como pagado
  const handleMarkAsPaid = async (chargeId: number) => {
    try {
      // Aquí podríamos implementar la lógica para marcar como pagado
      // Por ahora solo mostramos un mensaje
      alert(
        `Funcionalidad para marcar como pagado el cargo ${chargeId} próximamente disponible`
      );
    } catch {
      // Error handling sin console
    }
  };

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

  if (error) {
    return (
      <div className='container-fluid py-4'>
        <div className='alert alert-danger' role='alert'>
          <h4 className='alert-heading'>Error</h4>
          <p>{error}</p>
          <button
            className='btn btn-outline-danger'
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='container-fluid py-4'>
      {/* Header con estadísticas */}
      <div className='charges-header mb-4'>
        <h1 className='charges-title'>Gestión de Cargos</h1>
        <p className='charges-subtitle'>
          Administra y da seguimiento a todos los cargos de la comunidad
        </p>

        <div className='charges-stats'>
          <div className='stat-item'>
            <div className='stat-number'>{stats.total}</div>
            <div className='stat-label'>Total</div>
          </div>
          <div className='stat-item'>
            <div className='stat-number'>{stats.pending}</div>
            <div className='stat-label'>Pendientes</div>
          </div>
          <div className='stat-item'>
            <div className='stat-number'>{stats.paid}</div>
            <div className='stat-label'>Pagados</div>
          </div>
          <div className='stat-item'>
            <div className='stat-number'>{stats.overdue}</div>
            <div className='stat-label'>Vencidos</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className='filters-card mb-4'>
        <div className='row g-3'>
          <div className='col-md-6'>
            <div className='search-bar'>
              <input
                type='text'
                className='form-control search-input'
                placeholder='Buscar por concepto, unidad o ID...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className='col-md-4'>
            <select
              className='form-select'
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value='all'>Todos los estados</option>
              <option value='pendiente'>Pendiente</option>
              <option value='pagado'>Pagado</option>
              <option value='vencido'>Vencido</option>
              <option value='parcial'>Parcial</option>
            </select>
          </div>
          <div className='col-md-2'>
            <button
              className='btn btn-outline-secondary w-100'
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Acciones principales */}
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <div></div>
        <div>
          <Link href='/cargos/nuevo' className='btn btn-success'>
            ➕ Nuevo Cargo
          </Link>
        </div>
      </div>

      {/* Tabla de cargos */}
      <div className='charges-table'>
        <div className='table-header'>
          <h4 className='table-title mb-0'>Lista de Cargos</h4>
          <div className='table-info'>
            Mostrando {filteredCharges.length} de {charges.length} cargos
          </div>
        </div>

        {filteredCharges.length === 0 ? (
          <div className='empty-state'>
            <div className='empty-state-icon'>📋</div>
            <h5 className='empty-state-title'>
              {charges.length === 0
                ? 'No hay cargos registrados'
                : 'No se encontraron cargos'}
            </h5>
            <p className='empty-state-description mb-0'>
              {charges.length === 0
                ? 'Comienza creando tu primer cargo.'
                : 'No hay cargos que coincidan con los filtros seleccionados.'}
            </p>
            {charges.length === 0 && (
              <Link href='/cargos/nuevo' className='btn btn-success mt-3'>
                Crear primer cargo
              </Link>
            )}
          </div>
        ) : (
          <div className='table-responsive'>
            <table className='table custom-table mb-0'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Concepto</th>
                  <th>Tipo</th>
                  <th>Unidad</th>
                  <th>Monto</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCharges.map(charge => (
                  <tr key={charge.id}>
                    <td>
                      <span className='charge-id'>{charge.id}</span>
                    </td>
                    <td>
                      <div>
                        <strong>{charge.concepto}</strong>
                        {charge.descripcion && (
                          <small className='text-muted d-block'>
                            {charge.descripcion}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`charge-type ${charge.tipo.toLowerCase()}`}
                      >
                        {getTypeText(charge.tipo)}
                      </span>
                    </td>
                    <td>
                      <span className='fw-bold'>{charge.unidad}</span>
                    </td>
                    <td>
                      <div
                        className={`amount-cell ${
                          charge.estado === 'pagado' ? 'positive' : 'pending'
                        }`}
                      >
                        <div>{formatCurrency(charge.monto)}</div>
                        {charge.montoAplicado &&
                          charge.montoAplicado !== charge.monto && (
                            <small className='text-muted'>
                              Aplicado: {formatCurrency(charge.montoAplicado)}
                            </small>
                          )}
                      </div>
                    </td>
                    <td>
                      <div>
                        {formatDate(charge.fechaVencimiento)}
                        {(() => {
                          const dueDate =
                            charge.fechaVencimiento instanceof Date
                              ? charge.fechaVencimiento
                              : new Date(charge.fechaVencimiento);
                          const today = new Date();
                          return (
                            dueDate < today && charge.estado === 'pendiente'
                          );
                        })() && (
                          <small className='text-danger d-block'>
                            ⚠️ Vencido
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${charge.estado}`}>
                        {getStatusText(charge.estado)}
                      </span>
                    </td>
                    <td>
                      <div className='d-flex gap-1'>
                        <a
                          href={`/cargos/${charge.id}`}
                          className='btn btn-primary btn-sm'
                          title='Ver detalles'
                        >
                          👁️
                        </a>
                        <a
                          href={`/cargos/editar/${charge.id}`}
                          className='btn btn-outline-secondary btn-sm'
                          title='Editar'
                        >
                          ✏️
                        </a>
                        {charge.estado !== 'pagado' && (
                          <button
                            className='btn btn-success btn-sm'
                            title='Marcar como pagado'
                            onClick={() => handleMarkAsPaid(charge.id)}
                          >
                            💳
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CargosListado;
