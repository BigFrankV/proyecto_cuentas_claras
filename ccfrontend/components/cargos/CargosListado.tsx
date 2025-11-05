import React, { useState, useEffect } from 'react';

import AmountCell from './AmountCell';
import { Cargo } from './CargoCard';
import FilterCard, { FilterOptions } from './FilterCard';
import StatusBadge from './StatusBadge';
import TypeBadge from './TypeBadge';

export interface CargosListadoProps {
  className?: string;
}

// Mock data - Replace with actual API calls
const mockCargos: Cargo[] = [
  {
    id: 'CHG-2024-001',
    concepto: 'Administración Enero 2024',
    descripcion: 'Cuota de administración mensual',
    tipo: 'administration',
    estado: 'paid',
    monto: 250000,
    montoAplicado: 250000,
    unidad: '101-A',
    periodo: '2024-01',
    fechaVencimiento: new Date('2024-01-15'),
    fechaCreacion: new Date('2024-01-01'),
    cuentaCosto: 'ADM-001',
  },
  {
    id: 'CHG-2024-002',
    concepto: 'Mantenimiento Ascensor',
    descripcion: 'Mantenimiento preventivo del ascensor principal',
    tipo: 'maintenance',
    estado: 'pending',
    monto: 180000,
    montoAplicado: 0,
    unidad: '102-B',
    periodo: '2024-02',
    fechaVencimiento: new Date('2024-02-28'),
    fechaCreacion: new Date('2024-02-01'),
    cuentaCosto: 'MNT-002',
  },
  {
    id: 'CHG-2024-003',
    concepto: 'Seguro Todo Riesgo',
    descripcion: 'Prima de seguro anual edificio',
    tipo: 'insurance',
    estado: 'approved',
    monto: 450000,
    montoAplicado: 225000,
    unidad: '201-A',
    periodo: '2024-03',
    fechaVencimiento: new Date('2024-03-30'),
    fechaCreacion: new Date('2024-03-01'),
    cuentaCosto: 'SEG-001',
  },
];

export default function CargosListado({ className = '' }: CargosListadoProps) {
  const [cargos, setCargos] = useState<Cargo[]>(mockCargos);
  const [filteredCargos, setFilteredCargos] = useState<Cargo[]>(mockCargos);
  const [selectedCargos, setSelectedCargos] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    status: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    unitNumber: '',
    amountMin: '',
    amountMax: '',
  });

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatPeriod = (period: string): string => {
    const [year, month] = period.split('-');
    if (!year || !month) {return period;}
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
    }).format(new Date(parseInt(year), parseInt(month) - 1));
  };

  const applyFilters = () => {
    setLoading(true);

    let filtered = [...cargos];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        cargo =>
          cargo.concepto.toLowerCase().includes(searchLower) ||
          cargo.descripcion?.toLowerCase().includes(searchLower) ||
          cargo.unidad.toLowerCase().includes(searchLower) ||
          cargo.id.toLowerCase().includes(searchLower),
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(cargo => cargo.estado === filters.status);
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(cargo => cargo.tipo === filters.type);
    }

    // Unit filter
    if (filters.unitNumber) {
      filtered = filtered.filter(cargo =>
        cargo.unidad.toLowerCase().includes(filters.unitNumber.toLowerCase()),
      );
    }

    // Date filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(cargo => cargo.fechaCreacion >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(cargo => cargo.fechaCreacion <= toDate);
    }

    // Amount filters
    if (filters.amountMin) {
      const minAmount = parseFloat(filters.amountMin);
      filtered = filtered.filter(cargo => cargo.monto >= minAmount);
    }

    if (filters.amountMax) {
      const maxAmount = parseFloat(filters.amountMax);
      filtered = filtered.filter(cargo => cargo.monto <= maxAmount);
    }

    setFilteredCargos(filtered);
    setCurrentPage(1);
    setTimeout(() => setLoading(false), 500);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: '',
      type: '',
      dateFrom: '',
      dateTo: '',
      unitNumber: '',
      amountMin: '',
      amountMax: '',
    });
    setFilteredCargos(cargos);
    setCurrentPage(1);
  };

  const toggleCargoSelection = (cargoId: string) => {
    const newSelected = new Set(selectedCargos);
    if (newSelected.has(cargoId)) {
      newSelected.delete(cargoId);
    } else {
      newSelected.add(cargoId);
    }
    setSelectedCargos(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedCargos.size === filteredCargos.length) {
      setSelectedCargos(new Set());
    } else {
      setSelectedCargos(new Set(filteredCargos.map(cargo => cargo.id)));
    }
  };

  const handleViewCargo = (id: string) => {
    window.location.href = `/cargos/${id}`;
  };

  const handleEditCargo = (id: string) => {
    console.log('Edit cargo:', id);
    // TODO: Implement edit functionality
  };

  const handleDeleteCargo = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este cargo?')) {
      setCargos(prev => prev.filter(cargo => cargo.id !== id));
      setFilteredCargos(prev => prev.filter(cargo => cargo.id !== id));
      setSelectedCargos(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(id);
        return newSelected;
      });
    }
  };

  const handleBulkApprove = () => {
    console.log('Bulk approve:', Array.from(selectedCargos));
    // TODO: Implement bulk approve
  };

  const handleBulkReject = () => {
    console.log('Bulk reject:', Array.from(selectedCargos));
    // TODO: Implement bulk reject
  };

  const handleExport = () => {
    console.log('Export data');
    // TODO: Implement export functionality
  };

  // Pagination
  const totalPages = Math.ceil(filteredCargos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCargos = filteredCargos.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Statistics
  const totalCargos = filteredCargos.length;
  const pendingCargos = filteredCargos.filter(
    c => c.estado === 'pending',
  ).length;
  const approvedCargos = filteredCargos.filter(
    c => c.estado === 'approved',
  ).length;
  const paidCargos = filteredCargos.filter(c => c.estado === 'paid').length;
  const totalAmount = filteredCargos.reduce(
    (sum, cargo) => sum + cargo.monto,
    0,
  );

  useEffect(() => {
    applyFilters();
  }, []);

  return (
    <div className={`cargos-listado ${className}`}>
      {/* Header Stats */}
      <div className='charges-header'>
        <h1 className='charges-title'>Gestión de Cargos</h1>
        <p className='charges-subtitle'>
          Administre y controle todos los cargos de la propiedad horizontal
        </p>

        <div className='charges-stats'>
          <div className='stat-item'>
            <div className='stat-number'>{totalCargos}</div>
            <div className='stat-label'>Total</div>
          </div>
          <div className='stat-item'>
            <div className='stat-number'>{pendingCargos}</div>
            <div className='stat-label'>Pendientes</div>
          </div>
          <div className='stat-item'>
            <div className='stat-number'>{approvedCargos}</div>
            <div className='stat-label'>Aprobados</div>
          </div>
          <div className='stat-item'>
            <div className='stat-number'>{paidCargos}</div>
            <div className='stat-label'>Pagados</div>
          </div>
          <div className='stat-item'>
            <div className='stat-number'>
              <AmountCell amount={totalAmount} />
            </div>
            <div className='stat-label'>Monto Total</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterCard
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
      />

      {/* Bulk Actions */}
      {selectedCargos.size > 0 && (
        <div className='bulk-actions show'>
          <div className='bulk-actions-header'>
            <h6 className='bulk-actions-title'>
              {selectedCargos.size} cargo(s) seleccionado(s)
            </h6>
            <button
              className='btn btn-outline-secondary btn-sm'
              onClick={() => setSelectedCargos(new Set())}
            >
              <i className='material-icons'>clear</i>
            </button>
          </div>
          <div className='bulk-actions-buttons'>
            <button
              className='btn btn-success btn-sm'
              onClick={handleBulkApprove}
            >
              <i className='material-icons me-1'>check</i>
              Aprobar
            </button>
            <button
              className='btn btn-danger btn-sm'
              onClick={handleBulkReject}
            >
              <i className='material-icons me-1'>close</i>
              Rechazar
            </button>
            <button
              className='btn btn-outline-primary btn-sm'
              onClick={handleExport}
            >
              <i className='material-icons me-1'>download</i>
              Exportar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className='charges-table'>
        <div className='table-header'>
          <h5 className='table-title'>
            <i className='material-icons'>receipt_long</i>
            Lista de Cargos
          </h5>
          <div className='d-flex gap-2'>
            <button
              className='btn btn-primary'
              onClick={() => (window.location.href = '/cargos/nuevo')}
            >
              <i className='material-icons me-2'>add</i>
              Nuevo Cargo
            </button>
            <button
              className='btn btn-outline-secondary'
              onClick={handleExport}
            >
              <i className='material-icons me-2'>download</i>
              Exportar
            </button>
          </div>
        </div>

        <div className='table-responsive'>
          {loading ? (
            <div className='text-center p-4'>
              <div className='spinner-border' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
            </div>
          ) : filteredCargos.length === 0 ? (
            <div className='empty-state'>
              <div className='empty-state-icon'>
                <i className='material-icons'>search_off</i>
              </div>
              <h4 className='empty-state-title'>No se encontraron cargos</h4>
              <p className='empty-state-description'>
                No hay cargos que coincidan con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <table className='table custom-table'>
              <thead>
                <tr>
                  <th scope='col' style={{ width: '50px' }}>
                    <input
                      type='checkbox'
                      className='form-check-input'
                      checked={
                        selectedCargos.size === filteredCargos.length &&
                        filteredCargos.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th scope='col'>ID</th>
                  <th scope='col'>Concepto</th>
                  <th scope='col'>Tipo</th>
                  <th scope='col'>Unidad</th>
                  <th scope='col'>Período</th>
                  <th scope='col'>Monto</th>
                  <th scope='col'>Estado</th>
                  <th scope='col'>Vencimiento</th>
                  <th scope='col' style={{ width: '120px' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCargos.map(cargo => (
                  <tr key={cargo.id}>
                    <td>
                      <input
                        type='checkbox'
                        className='form-check-input'
                        checked={selectedCargos.has(cargo.id)}
                        onChange={() => toggleCargoSelection(cargo.id)}
                      />
                    </td>
                    <td>
                      <span className='charge-id'>{cargo.id}</span>
                    </td>
                    <td>
                      <div>
                        <strong>{cargo.concepto}</strong>
                        {cargo.descripcion && (
                          <div className='text-muted small'>
                            {cargo.descripcion}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <TypeBadge type={cargo.tipo} />
                    </td>
                    <td>
                      <strong>{cargo.unidad}</strong>
                    </td>
                    <td>{formatPeriod(cargo.periodo)}</td>
                    <td>
                      <AmountCell amount={cargo.monto} />
                    </td>
                    <td>
                      <StatusBadge status={cargo.estado} />
                    </td>
                    <td>
                      <span
                        className={
                          new Date() > cargo.fechaVencimiento &&
                          cargo.estado !== 'paid'
                            ? 'text-danger fw-bold'
                            : ''
                        }
                      >
                        {formatDate(cargo.fechaVencimiento)}
                      </span>
                    </td>
                    <td>
                      <div className='btn-group' role='group'>
                        <button
                          className='action-btn primary small'
                          onClick={() => handleViewCargo(cargo.id)}
                          title='Ver detalle'
                        >
                          <i className='material-icons'>visibility</i>
                        </button>
                        <button
                          className='action-btn outline small'
                          onClick={() => handleEditCargo(cargo.id)}
                          title='Editar'
                        >
                          <i className='material-icons'>edit</i>
                        </button>
                        <button
                          className='action-btn danger small'
                          onClick={() => handleDeleteCargo(cargo.id)}
                          title='Eliminar'
                        >
                          <i className='material-icons'>delete</i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='pagination-container'>
            <div className='pagination-info'>
              Mostrando {startIndex + 1} a{' '}
              {Math.min(startIndex + itemsPerPage, filteredCargos.length)} de{' '}
              {filteredCargos.length} cargos
            </div>
            <nav>
              <ul className='pagination'>
                <li
                  className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
                >
                  <button
                    className='page-link'
                    onClick={() =>
                      setCurrentPage(prev => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  page => (
                    <li
                      key={page}
                      className={`page-item ${currentPage === page ? 'active' : ''}`}
                    >
                      <button
                        className='page-link'
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ),
                )}
                <li
                  className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
                >
                  <button
                    className='page-link'
                    onClick={() =>
                      setCurrentPage(prev => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
