import { useState } from 'react';

// Props para el componente de filtros
interface EmissionFiltersProps {
  onFilterChange: (filters: IEmissionFilters) => void;
  onClearFilters: () => void;
}

// Interfaz para los filtros
export interface IEmissionFilters {
  search: string;
  status: string;
  type: string;
  period: string;
  dateFrom: string;
  dateTo: string;
  community: string;
}

export function EmissionFilters({
  onFilterChange,
  onClearFilters,
}: EmissionFiltersProps) {
  const [filters, setFilters] = useState<IEmissionFilters>({
    search: '',
    status: 'all',
    type: 'all',
    period: 'all',
    dateFrom: '',
    dateTo: '',
    community: 'all',
  });

  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleFilterChange = (field: keyof IEmissionFilters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: IEmissionFilters = {
      search: '',
      status: 'all',
      type: 'all',
      period: 'all',
      dateFrom: '',
      dateTo: '',
      community: 'all',
    };
    setFilters(clearedFilters);
    onClearFilters();
  };

  return (
    <div className='filters-card'>
      <div className='filters-header'>
        <h5 className='mb-0'>Filtros</h5>
        <button
          className='btn btn-sm btn-link'
          type='button'
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <i className='material-icons'>
            {isCollapsed ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
          </i>
        </button>
      </div>

      <div className={`filters-body ${isCollapsed ? 'collapsed' : ''}`}>
        <div className='row g-3'>
          {/* Búsqueda general */}
          <div className='col-md-4'>
            <label className='form-label'>Buscar</label>
            <div className='input-group'>
              <span className='input-group-text'>
                <i className='material-icons'>search</i>
              </span>
              <input
                type='text'
                className='form-control'
                placeholder='Buscar por período, descripción...'
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Estado */}
          <div className='col-md-2'>
            <label className='form-label'>Estado</label>
            <select
              className='form-select'
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              <option value='all'>Todos</option>
              <option value='draft'>Borrador</option>
              <option value='ready'>Lista</option>
              <option value='sent'>Enviada</option>
              <option value='paid'>Pagada</option>
              <option value='partial'>Parcial</option>
              <option value='overdue'>Vencida</option>
              <option value='cancelled'>Cancelada</option>
            </select>
          </div>

          {/* Tipo */}
          <div className='col-md-2'>
            <label className='form-label'>Tipo</label>
            <select
              className='form-select'
              value={filters.type}
              onChange={e => handleFilterChange('type', e.target.value)}
            >
              <option value='all'>Todos</option>
              <option value='gastos_comunes'>Gastos Comunes</option>
              <option value='extraordinaria'>Extraordinaria</option>
              <option value='multa'>Multa</option>
              <option value='interes'>Interés</option>
            </select>
          </div>

          {/* Período */}
          <div className='col-md-2'>
            <label className='form-label'>Período</label>
            <select
              className='form-select'
              value={filters.period}
              onChange={e => handleFilterChange('period', e.target.value)}
            >
              <option value='all'>Todos</option>
              <option value='2025-09'>Septiembre 2025</option>
              <option value='2025-08'>Agosto 2025</option>
              <option value='2025-07'>Julio 2025</option>
              <option value='2025-06'>Junio 2025</option>
              <option value='2025-05'>Mayo 2025</option>
              <option value='2025-04'>Abril 2025</option>
            </select>
          </div>

          {/* Comunidad */}
          <div className='col-md-2'>
            <label className='form-label'>Comunidad</label>
            <select
              className='form-select'
              value={filters.community}
              onChange={e => handleFilterChange('community', e.target.value)}
            >
              <option value='all'>Todas</option>
              <option value='1'>Edificio Central</option>
              <option value='2'>Torres del Sol</option>
              <option value='3'>Condominio Verde</option>
            </select>
          </div>

          {/* Fecha desde */}
          <div className='col-md-3'>
            <label className='form-label'>Fecha desde</label>
            <input
              type='date'
              className='form-control'
              value={filters.dateFrom}
              onChange={e => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          {/* Fecha hasta */}
          <div className='col-md-3'>
            <label className='form-label'>Fecha hasta</label>
            <input
              type='date'
              className='form-control'
              value={filters.dateTo}
              onChange={e => handleFilterChange('dateTo', e.target.value)}
            />
          </div>

          {/* Botones de acción */}
          <div className='col-md-6'>
            <label className='form-label'>&nbsp;</label>
            <div className='d-flex gap-2'>
              <button
                type='button'
                className='btn btn-outline-secondary'
                onClick={handleClearFilters}
              >
                <i className='material-icons me-2'>clear</i>
                Limpiar filtros
              </button>
              <button
                type='button'
                className='btn btn-outline-primary'
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <i className='material-icons me-2'>
                  {isCollapsed ? 'expand_more' : 'expand_less'}
                </i>
                {isCollapsed ? 'Mostrar más' : 'Mostrar menos'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .filters-card {
          background: #fff;
          border-radius: 0.5rem;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          border: 1px solid #e9ecef;
          margin-bottom: 1.5rem;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f8f9fa;
          background: #fdfdfe;
          border-radius: 0.5rem 0.5rem 0 0;
        }

        .filters-header h5 {
          color: #212529;
          font-weight: 600;
        }

        .filters-header .btn-link {
          color: #6c757d;
          text-decoration: none;
          padding: 0.25rem;
        }

        .filters-header .btn-link:hover {
          color: #0d6efd;
        }

        .filters-body {
          padding: 1.5rem;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .filters-body.collapsed {
          max-height: 0;
          padding-top: 0;
          padding-bottom: 0;
        }

        .form-label {
          font-weight: 500;
          color: #495057;
          margin-bottom: 0.5rem;
        }

        .input-group-text {
          background: #f8f9fa;
          border-color: #e9ecef;
          color: #6c757d;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .btn-outline-secondary {
          border-color: #6c757d;
          color: #6c757d;
        }

        .btn-outline-secondary:hover {
          background-color: #6c757d;
          border-color: #6c757d;
          color: #fff;
        }

        .btn-outline-primary {
          border-color: #0d6efd;
          color: #0d6efd;
        }

        .btn-outline-primary:hover {
          background-color: #0d6efd;
          border-color: #0d6efd;
          color: #fff;
        }

        @media (max-width: 768px) {
          .filters-body .row {
            gap: 1rem;
          }

          .filters-body .col-md-2,
          .filters-body .col-md-3,
          .filters-body .col-md-4,
          .filters-body .col-md-6 {
            flex: 0 0 100%;
            max-width: 100%;
          }

          .filters-body .d-flex {
            flex-direction: column;
            gap: 0.5rem;
          }

          .filters-body .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

// Componente para controles de vista
interface ViewControlsProps {
  currentView: 'table' | 'cards';
  onViewChange: (view: 'table' | 'cards') => void;
  totalItems: number;
  selectedItems: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkAction: (action: string) => void;
}

export function ViewControls({
  currentView,
  onViewChange,
  totalItems,
  selectedItems,
  onSelectAll,
  onDeselectAll,
  onBulkAction,
}: ViewControlsProps) {
  return (
    <div className='view-controls'>
      <div className='controls-left'>
        <div className='selection-info'>
          {selectedItems > 0 ? (
            <span className='text-primary'>
              {selectedItems} de {totalItems} seleccionados
            </span>
          ) : (
            <span className='text-muted'>
              {totalItems} emisiones encontradas
            </span>
          )}
        </div>

        {selectedItems > 0 && (
          <div className='bulk-actions'>
            <div className='btn-group' role='group'>
              <button
                type='button'
                className='btn btn-sm btn-outline-secondary'
                onClick={onDeselectAll}
              >
                <i className='material-icons me-1'>clear</i>
                Deseleccionar
              </button>

              <div className='btn-group' role='group'>
                <button
                  type='button'
                  className='btn btn-sm btn-outline-primary dropdown-toggle'
                  data-bs-toggle='dropdown'
                >
                  <i className='material-icons me-1'>more_horiz</i>
                  Acciones masivas
                </button>
                <ul className='dropdown-menu'>
                  <li>
                    <button
                      className='dropdown-item'
                      onClick={() => onBulkAction('send')}
                    >
                      <i className='material-icons me-2'>send</i>
                      Enviar seleccionadas
                    </button>
                  </li>
                  <li>
                    <button
                      className='dropdown-item'
                      onClick={() => onBulkAction('export')}
                    >
                      <i className='material-icons me-2'>file_download</i>
                      Exportar seleccionadas
                    </button>
                  </li>
                  <li>
                    <hr className='dropdown-divider' />
                  </li>
                  <li>
                    <button
                      className='dropdown-item text-danger'
                      onClick={() => onBulkAction('delete')}
                    >
                      <i className='material-icons me-2'>delete</i>
                      Eliminar seleccionadas
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='controls-right'>
        <div className='view-toggles'>
          <div className='btn-group' role='group'>
            <button
              type='button'
              className={`btn btn-sm btn-outline-secondary ${currentView === 'table' ? 'active' : ''}`}
              onClick={() => onViewChange('table')}
            >
              <i className='material-icons'>table_rows</i>
            </button>
            <button
              type='button'
              className={`btn btn-sm btn-outline-secondary ${currentView === 'cards' ? 'active' : ''}`}
              onClick={() => onViewChange('cards')}
            >
              <i className='material-icons'>view_module</i>
            </button>
          </div>
        </div>

        <div className='export-controls'>
          <div className='dropdown'>
            <button
              className='btn btn-sm btn-outline-primary dropdown-toggle'
              type='button'
              data-bs-toggle='dropdown'
            >
              <i className='material-icons me-1'>file_download</i>
              Exportar
            </button>
            <ul className='dropdown-menu dropdown-menu-end'>
              <li>
                <button
                  className='dropdown-item'
                  onClick={() => onBulkAction('export-csv')}
                >
                  <i className='material-icons me-2'>table_chart</i>
                  CSV
                </button>
              </li>
              <li>
                <button
                  className='dropdown-item'
                  onClick={() => onBulkAction('export-excel')}
                >
                  <i className='material-icons me-2'>description</i>
                  Excel
                </button>
              </li>
              <li>
                <button
                  className='dropdown-item'
                  onClick={() => onBulkAction('export-pdf')}
                >
                  <i className='material-icons me-2'>picture_as_pdf</i>
                  PDF
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .view-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #fff;
          border-radius: 0.5rem;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          border: 1px solid #e9ecef;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .controls-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .controls-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .selection-info {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .bulk-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .view-toggles .btn-group .btn {
          border-color: #6c757d;
          color: #6c757d;
        }

        .view-toggles .btn-group .btn.active,
        .view-toggles .btn-group .btn:hover {
          background-color: #0d6efd;
          border-color: #0d6efd;
          color: #fff;
        }

        .view-toggles .btn-group .btn .material-icons {
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .view-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .controls-left,
          .controls-right {
            justify-content: center;
            width: 100%;
          }

          .bulk-actions {
            width: 100%;
            justify-content: center;
          }

          .bulk-actions .btn-group {
            width: 100%;
          }

          .bulk-actions .btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
