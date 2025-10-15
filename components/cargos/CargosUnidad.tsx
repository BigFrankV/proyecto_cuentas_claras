import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import StatusBadge from './StatusBadge';
import TypeBadge from './TypeBadge';
import AmountCell from './AmountCell';
import FilterCard, { FilterOptions } from './FilterCard';
import { Cargo } from './CargoCard';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export interface UnitInfo {
  numero: string;
  torre?: string;
  propietario: string;
  residente: string;
  telefono: string;
  email: string;
  metrosCuadrados: number;
  coeficiente: number;
}

export interface CargosUnidadProps {
  unidad: UnitInfo;
  cargos: Cargo[];
  className?: string;
}

// Mock data for demonstration - REMOVED: Component now receives data via props
const mockUnit: UnitInfo = {
  numero: '101-A',
  torre: 'Torre A',
  propietario: 'Juan Carlos Pérez',
  residente: 'María Elena Rodríguez',
  telefono: '+57 300 123 4567',
  email: 'maria.rodriguez@email.com',
  metrosCuadrados: 85.5,
  coeficiente: 0.0342
};

const mockCargosUnidad: Cargo[] = [];

export default function CargosUnidad({ 
  unidad, 
  cargos,
  className = '' 
}: CargosUnidadProps) {
  const [filteredCargos, setFilteredCargos] = useState<Cargo[]>(cargos);
  const [selectedCargos, setSelectedCargos] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [chartView, setChartView] = useState<'status' | 'type' | 'monthly'>('status');
  
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    status: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    unitNumber: unidad.numero,
    amountMin: '',
    amountMax: '',
  });

  // Update filtered cargos when props change
  useEffect(() => {
    setFilteredCargos(cargos);
    setFilters(prev => ({ ...prev, unitNumber: unidad.numero }));
  }, [cargos, unidad.numero]);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatPeriod = (period: string): string => {
    const [year, month] = period.split('-');
    if (!year || !month) return period;
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long'
    }).format(new Date(parseInt(year), parseInt(month) - 1));
  };

  const applyFilters = () => {
    setLoading(true);
    
    let filtered = [...cargos];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(cargo => 
        cargo.concepto.toLowerCase().includes(searchLower) ||
        cargo.descripcion?.toLowerCase().includes(searchLower) ||
        cargo.id.toLowerCase().includes(searchLower)
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
      unitNumber: unidad.numero,
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

  // Statistics
  const totalCargos = filteredCargos.length;
  const pendingCargos = filteredCargos.filter(c => c.estado === 'pending').length;
  const approvedCargos = filteredCargos.filter(c => c.estado === 'approved').length;
  const paidCargos = filteredCargos.filter(c => c.estado === 'paid').length;
  const partialCargos = filteredCargos.filter(c => c.estado === 'partial').length;
  const totalAmount = filteredCargos.reduce((sum, cargo) => sum + cargo.monto, 0);
  const paidAmount = filteredCargos.reduce((sum, cargo) => 
    cargo.estado === 'paid' ? sum + cargo.monto : 
    cargo.estado === 'partial' ? sum + cargo.montoAplicado : sum, 0);

  // Chart data
  const getChartData = () => {
    switch (chartView) {
      case 'status':
        return {
          labels: ['Pendiente', 'Aprobado', 'Pagado', 'Parcial'],
          datasets: [{
            data: [pendingCargos, approvedCargos, paidCargos, partialCargos],
            backgroundColor: ['#ffc107', '#17a2b8', '#28a745', '#fd7e14'],
            borderColor: ['#fff', '#fff', '#fff', '#fff'],
            borderWidth: 2,
          }]
        };
      
      case 'type':
        const typeGroups = filteredCargos.reduce((acc, cargo) => {
          acc[cargo.tipo] = (acc[cargo.tipo] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return {
          labels: Object.keys(typeGroups).map(type => {
            const labels = {
              administration: 'Administración',
              maintenance: 'Mantenimiento',
              service: 'Servicios',
              insurance: 'Seguros',
              other: 'Otros'
            };
            return labels[type as keyof typeof labels] || type;
          }),
          datasets: [{
            data: Object.values(typeGroups),
            backgroundColor: ['#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#6c757d'],
            borderColor: ['#fff', '#fff', '#fff', '#fff', '#fff'],
            borderWidth: 2,
          }]
        };
      
      case 'monthly':
        const monthlyData = filteredCargos.reduce((acc, cargo) => {
          const month = cargo.periodo;
          acc[month] = (acc[month] || 0) + cargo.monto;
          return acc;
        }, {} as Record<string, number>);
        
        return {
          labels: Object.keys(monthlyData).map(formatPeriod),
          datasets: [{
            label: 'Monto Total',
            data: Object.values(monthlyData),
            backgroundColor: '#17a2b8',
            borderColor: '#117a8b',
            borderWidth: 1,
          }]
        };
      
      default:
        return { labels: [], datasets: [] };
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredCargos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCargos = filteredCargos.slice(startIndex, startIndex + itemsPerPage);

  const handleViewCargo = (id: string) => {
    window.location.href = `/cargos/${id}`;
  };

  const handleCreateNewCharge = () => {
    window.location.href = `/cargos/nuevo?unidad=${unidad.numero}`;
  };

  const handleRegisterPayment = (cargoId?: string) => {
    const params = cargoId ? `?cargo=${cargoId}` : '';
    window.location.href = `/pagos/nuevo${params}`;
  };

  const handleSendStatement = () => {
    console.log('Send statement for unit:', unidad.numero);
    // TODO: Implement send statement functionality
  };

  const handleViewUnitDetails = () => {
    window.location.href = `/unidades/${unidad.numero}`;
  };

  const handleExportUnitCharges = () => {
    console.log('Export charges for unit:', unidad.numero);
    // TODO: Implement export functionality
  };

  useEffect(() => {
    applyFilters();
  }, []);

  return (
    <div className={`cargos-unidad ${className}`}>
      {/* Unit Header */}
      <div className="unit-header">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h1 className="unit-title">Unidad {unidad.numero}</h1>
            <p className="unit-subtitle">
              {unidad.torre && `${unidad.torre} • `}
              Gestión de cargos y estado de cuenta
            </p>
          </div>
        </div>
        
        <div className="unit-stats">
          <div className="stat-item">
            <div className="stat-number">{totalCargos}</div>
            <div className="stat-label">Total Cargos</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{pendingCargos}</div>
            <div className="stat-label">Pendientes</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{paidCargos}</div>
            <div className="stat-label">Pagados</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              <AmountCell amount={totalAmount} />
            </div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              <AmountCell amount={paidAmount} />
            </div>
            <div className="stat-label">Pagado</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="quick-actions">
            <div className="quick-actions-header">
              <h5 className="quick-actions-title">
                <i className="material-icons">flash_on</i>
                Acciones Rápidas
              </h5>
            </div>
            <div className="quick-actions-grid">
              <button 
                className="btn btn-primary"
                onClick={handleCreateNewCharge}
              >
                <i className="material-icons me-2">add</i>
                Nuevo Cargo
              </button>
              <button 
                className="btn btn-success"
                onClick={() => handleRegisterPayment()}
              >
                <i className="material-icons me-2">payment</i>
                Registrar Pago
              </button>
              <button 
                className="btn btn-info"
                onClick={handleSendStatement}
              >
                <i className="material-icons me-2">mail</i>
                Enviar Estado de Cuenta
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={handleViewUnitDetails}
              >
                <i className="material-icons me-2">home</i>
                Ver Detalles Unidad
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={handleExportUnitCharges}
              >
                <i className="material-icons me-2">download</i>
                Exportar Cargos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Filters and Table */}
        <div className="col-lg-8">
          {/* Filters */}
          <FilterCard
            filters={filters}
            onFiltersChange={setFilters}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
            className="mb-4"
          />

          {/* Table */}
          <div className="charges-table">
            <div className="table-header">
              <h5 className="table-title">
                <i className="material-icons">receipt_long</i>
                Cargos de la Unidad
              </h5>
              <small className="table-info">
                {filteredCargos.length} cargo(s) encontrado(s)
              </small>
            </div>

            <div className="table-responsive">
              {loading ? (
                <div className="text-center p-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : filteredCargos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <i className="material-icons">search_off</i>
                  </div>
                  <h4 className="empty-state-title">No se encontraron cargos</h4>
                  <p className="empty-state-description">
                    No hay cargos que coincidan con los filtros seleccionados.
                  </p>
                </div>
              ) : (
                <table className="table custom-table">
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: '50px' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedCargos.size === filteredCargos.length && filteredCargos.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th scope="col">Concepto</th>
                      <th scope="col">Tipo</th>
                      <th scope="col">Período</th>
                      <th scope="col">Monto</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Vencimiento</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCargos.map((cargo) => (
                      <tr key={cargo.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedCargos.has(cargo.id)}
                            onChange={() => toggleCargoSelection(cargo.id)}
                          />
                        </td>
                        <td>
                          <div>
                            <strong>{cargo.concepto}</strong>
                            <div className="text-muted small">#{cargo.id}</div>
                          </div>
                        </td>
                        <td>
                          <TypeBadge type={cargo.tipo} />
                        </td>
                        <td>
                          {formatPeriod(cargo.periodo)}
                        </td>
                        <td>
                          <AmountCell amount={cargo.monto} />
                        </td>
                        <td>
                          <StatusBadge status={cargo.estado} />
                        </td>
                        <td>
                          <span className={new Date() > cargo.fechaVencimiento && cargo.estado !== 'paid' ? 'text-danger fw-bold' : ''}>
                            {formatDate(cargo.fechaVencimiento)}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="action-btn primary small"
                              onClick={() => handleViewCargo(cargo.id)}
                              title="Ver detalle"
                            >
                              <i className="material-icons">visibility</i>
                            </button>
                            <button
                              className="action-btn success small"
                              onClick={() => handleRegisterPayment(cargo.id)}
                              title="Registrar pago"
                            >
                              <i className="material-icons">payment</i>
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
              <div className="pagination-container">
                <div className="pagination-info">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredCargos.length)} de {filteredCargos.length} cargos
                </div>
                <nav>
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

        {/* Charts and Unit Info */}
        <div className="col-lg-4">
          {/* Unit Information */}
          <div className="info-card mb-4">
            <div className="info-card-header">
              <h5 className="info-card-title">
                <i className="material-icons">home</i>
                Información de la Unidad
              </h5>
            </div>
            
            <div className="info-row">
              <span className="info-label">Número:</span>
              <span className="info-value">{unidad.numero}</span>
            </div>
            
            {unidad.torre && (
              <div className="info-row">
                <span className="info-label">Torre:</span>
                <span className="info-value">{unidad.torre}</span>
              </div>
            )}
            
            <div className="info-row">
              <span className="info-label">Propietario:</span>
              <span className="info-value">{unidad.propietario}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Residente:</span>
              <span className="info-value">{unidad.residente}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Teléfono:</span>
              <span className="info-value">{unidad.telefono}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{unidad.email}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Área (m²):</span>
              <span className="info-value">{unidad.metrosCuadrados}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Coeficiente:</span>
              <span className="info-value">{(unidad.coeficiente * 100).toFixed(4)}%</span>
            </div>
          </div>

          {/* Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h5 className="chart-title">
                <i className="material-icons">pie_chart</i>
                Análisis de Cargos
              </h5>
              <div className="btn-group btn-group-sm">
                <button 
                  className={`btn ${chartView === 'status' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setChartView('status')}
                >
                  Estado
                </button>
                <button 
                  className={`btn ${chartView === 'type' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setChartView('type')}
                >
                  Tipo
                </button>
                <button 
                  className={`btn ${chartView === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setChartView('monthly')}
                >
                  Mensual
                </button>
              </div>
            </div>
            
            <div style={{ height: '300px', position: 'relative' }}>
              {chartView === 'monthly' ? (
                <Bar 
                  data={getChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              ) : (
                <Pie 
                  data={getChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}