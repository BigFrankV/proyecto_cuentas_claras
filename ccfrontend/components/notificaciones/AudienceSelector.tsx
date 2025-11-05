import { useState } from 'react';

type AudienceType = 'all' | 'building' | 'unit' | 'custom';

interface Building {
  id: string;
  name: string;
  unitCount: number;
}

interface Unit {
  id: string;
  number: string;
  buildingId: string;
  buildingName: string;
  ownerName?: string;
}

interface UserGroup {
  id: string;
  name: string;
  count: number;
  description: string;
}

interface AudienceConfig {
  type: AudienceType;
  buildingIds?: string[];
  unitIds?: string[];
  userGroupIds?: string[];
  customFilters?: {
    role?: string[];
    paymentStatus?: string[];
    membershipType?: string[];
  };
}

interface AudienceSelectorProps {
  value: AudienceConfig;
  onChange: (config: AudienceConfig) => void;
  className?: string;
}

// Mock data - replace with API calls
const mockBuildings: Building[] = [
  { id: '1', name: 'Edificio A', unitCount: 120 },
  { id: '2', name: 'Edificio B', unitCount: 89 },
  { id: '3', name: 'Edificio C', unitCount: 156 },
];

const mockUserGroups: UserGroup[] = [
  {
    id: 'owners',
    name: 'Propietarios',
    count: 245,
    description: 'Todos los propietarios',
  },
  {
    id: 'tenants',
    name: 'Inquilinos',
    count: 134,
    description: 'Personas que arriendan',
  },
  {
    id: 'council',
    name: 'Consejo',
    count: 8,
    description: 'Miembros del consejo',
  },
  {
    id: 'admins',
    name: 'Administradores',
    count: 3,
    description: 'Personal administrativo',
  },
  {
    id: 'debtors',
    name: 'Morosos',
    count: 23,
    description: 'Con deuda pendiente',
  },
  {
    id: 'current',
    name: 'Al día',
    count: 222,
    description: 'Sin deudas pendientes',
  },
];

export default function AudienceSelector({
  value,
  onChange,
  className = '',
}: AudienceSelectorProps) {
  const [searchUnits, setSearchUnits] = useState('');
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>(
    value.buildingIds || []
  );
  const [selectedUnits, setSelectedUnits] = useState<string[]>(
    value.unitIds || []
  );
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    value.userGroupIds || []
  );

  const handleTypeChange = (type: AudienceType) => {
    const newConfig: AudienceConfig = { type };

    // Reset selections when type changes
    setSelectedBuildings([]);
    setSelectedUnits([]);
    setSelectedGroups([]);

    onChange(newConfig);
  };

  const handleBuildingToggle = (buildingId: string) => {
    const newBuildings = selectedBuildings.includes(buildingId)
      ? selectedBuildings.filter(id => id !== buildingId)
      : [...selectedBuildings, buildingId];

    setSelectedBuildings(newBuildings);
    onChange({ ...value, buildingIds: newBuildings });
  };

  const handleUnitChange = (unitNumbers: string) => {
    const units = unitNumbers
      .split(',')
      .map(u => u.trim())
      .filter(u => u);
    setSelectedUnits(units);
    onChange({ ...value, unitIds: units });
  };

  const handleGroupToggle = (groupId: string) => {
    const newGroups = selectedGroups.includes(groupId)
      ? selectedGroups.filter(id => id !== groupId)
      : [...selectedGroups, groupId];

    setSelectedGroups(newGroups);
    onChange({ ...value, userGroupIds: newGroups });
  };

  const getEstimatedCount = () => {
    switch (value.type) {
      case 'all':
        return 365; // Total residents
      case 'building':
        return selectedBuildings.reduce((total, buildingId) => {
          const building = mockBuildings.find(b => b.id === buildingId);
          return total + (building?.unitCount || 0);
        }, 0);
      case 'unit':
        return selectedUnits.length;
      case 'custom':
        return selectedGroups.reduce((total, groupId) => {
          const group = mockUserGroups.find(g => g.id === groupId);
          return total + (group?.count || 0);
        }, 0);
      default:
        return 0;
    }
  };

  return (
    <div className={`audience-selector ${className}`}>
      <label className='form-label'>
        Audiencia <span className='text-danger'>*</span>
      </label>
      <p className='text-muted small mb-3'>
        Define quién recibirá esta notificación
      </p>

      {/* Audience Type Selection */}
      <div className='audience-options mb-4'>
        <div className='form-check mb-3'>
          <input
            className='form-check-input'
            type='radio'
            name='audience-type'
            id='audience-all'
            checked={value.type === 'all'}
            onChange={() => handleTypeChange('all')}
          />
          <label className='form-check-label' htmlFor='audience-all'>
            <div className='fw-semibold'>Todos los residentes</div>
            <div className='small text-muted'>
              Enviar a todas las unidades y residentes
            </div>
            <div className='small text-info'>~365 personas</div>
          </label>
        </div>

        <div className='form-check mb-3'>
          <input
            className='form-check-input'
            type='radio'
            name='audience-type'
            id='audience-building'
            checked={value.type === 'building'}
            onChange={() => handleTypeChange('building')}
          />
          <label className='form-check-label' htmlFor='audience-building'>
            <div className='fw-semibold'>Por edificio</div>
            <div className='small text-muted'>
              Seleccionar edificios específicos
            </div>
            {selectedBuildings.length > 0 && (
              <div className='small text-info'>
                ~{getEstimatedCount()} personas
              </div>
            )}
          </label>
        </div>

        <div className='form-check mb-3'>
          <input
            className='form-check-input'
            type='radio'
            name='audience-type'
            id='audience-unit'
            checked={value.type === 'unit'}
            onChange={() => handleTypeChange('unit')}
          />
          <label className='form-check-label' htmlFor='audience-unit'>
            <div className='fw-semibold'>Por unidad</div>
            <div className='small text-muted'>
              Seleccionar unidades específicas
            </div>
            {selectedUnits.length > 0 && (
              <div className='small text-info'>
                {getEstimatedCount()} unidades
              </div>
            )}
          </label>
        </div>

        <div className='form-check mb-3'>
          <input
            className='form-check-input'
            type='radio'
            name='audience-type'
            id='audience-custom'
            checked={value.type === 'custom'}
            onChange={() => handleTypeChange('custom')}
          />
          <label className='form-check-label' htmlFor='audience-custom'>
            <div className='fw-semibold'>Audiencia personalizada</div>
            <div className='small text-muted'>
              Seleccionar grupos específicos
            </div>
            {selectedGroups.length > 0 && (
              <div className='small text-info'>
                ~{getEstimatedCount()} personas
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Building Selector */}
      {value.type === 'building' && (
        <div
          className='building-selector mb-3'
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            border: '1px solid #e9ecef',
          }}
        >
          <h6 className='mb-3'>Seleccionar edificios</h6>
          <div className='row g-2'>
            {mockBuildings.map(building => (
              <div key={building.id} className='col-md-4'>
                <div className='form-check'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    id={`building-${building.id}`}
                    checked={selectedBuildings.includes(building.id)}
                    onChange={() => handleBuildingToggle(building.id)}
                  />
                  <label
                    className='form-check-label w-100'
                    htmlFor={`building-${building.id}`}
                  >
                    <div
                      className='building-option'
                      style={{
                        backgroundColor: selectedBuildings.includes(building.id)
                          ? '#e3f2fd'
                          : '#fff',
                        border: selectedBuildings.includes(building.id)
                          ? '1px solid #2196f3'
                          : '1px solid #dee2e6',
                        borderRadius: '0.375rem',
                        padding: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      <div className='fw-semibold'>{building.name}</div>
                      <div className='small text-muted'>
                        {building.unitCount} unidades
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unit Selector */}
      {value.type === 'unit' && (
        <div
          className='unit-selector mb-3'
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            border: '1px solid #e9ecef',
          }}
        >
          <h6 className='mb-3'>Especificar unidades</h6>
          <div className='mb-3'>
            <input
              type='text'
              className='form-control'
              placeholder='Ej: 101, 205, 312, A-405'
              value={selectedUnits.join(', ')}
              onChange={e => handleUnitChange(e.target.value)}
            />
            <div className='form-text'>
              Escribe los números de unidad separados por comas. Puedes usar
              formatos como: 101, A-205, B-312
            </div>
          </div>

          {/* Quick selection */}
          <div className='quick-unit-selection'>
            <label className='form-label small'>Selección rápida:</label>
            <div className='d-flex flex-wrap gap-2'>
              <button
                type='button'
                className='btn btn-outline-secondary btn-sm'
                onClick={() =>
                  handleUnitChange('101,102,103,104,105,106,107,108,109,110')
                }
              >
                Primer piso
              </button>
              <button
                type='button'
                className='btn btn-outline-secondary btn-sm'
                onClick={() =>
                  handleUnitChange('201,202,203,204,205,206,207,208,209,210')
                }
              >
                Segundo piso
              </button>
              <button
                type='button'
                className='btn btn-outline-secondary btn-sm'
                onClick={() => setSelectedUnits([])}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Groups Selector */}
      {value.type === 'custom' && (
        <div
          className='custom-selector mb-3'
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            border: '1px solid #e9ecef',
          }}
        >
          <h6 className='mb-3'>Seleccionar grupos</h6>
          <div className='row g-2'>
            {mockUserGroups.map(group => (
              <div key={group.id} className='col-md-6'>
                <div className='form-check'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    id={`group-${group.id}`}
                    checked={selectedGroups.includes(group.id)}
                    onChange={() => handleGroupToggle(group.id)}
                  />
                  <label
                    className='form-check-label w-100'
                    htmlFor={`group-${group.id}`}
                  >
                    <div
                      className='group-option'
                      style={{
                        backgroundColor: selectedGroups.includes(group.id)
                          ? '#e8f5e9'
                          : '#fff',
                        border: selectedGroups.includes(group.id)
                          ? '1px solid #4caf50'
                          : '1px solid #dee2e6',
                        borderRadius: '0.375rem',
                        padding: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      <div className='d-flex justify-content-between align-items-start'>
                        <div>
                          <div className='fw-semibold'>{group.name}</div>
                          <div className='small text-muted'>
                            {group.description}
                          </div>
                        </div>
                        <div className='text-primary fw-semibold'>
                          {group.count}
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div
        className='audience-summary'
        style={{
          backgroundColor: '#e3f2fd',
          borderRadius: 'var(--radius)',
          padding: '1rem',
          border: '1px solid #2196f3',
        }}
      >
        <div className='d-flex align-items-center'>
          <i className='material-icons me-2 text-primary'>people</i>
          <div>
            <div className='fw-semibold text-primary'>
              Destinatarios estimados: {getEstimatedCount()}
            </div>
            <div className='small text-muted'>
              {value.type === 'all' && 'Todos los residentes del conjunto'}
              {value.type === 'building' &&
                `${selectedBuildings.length} edificio(s) seleccionado(s)`}
              {value.type === 'unit' &&
                `${selectedUnits.length} unidad(es) específica(s)`}
              {value.type === 'custom' &&
                `${selectedGroups.length} grupo(s) personalizado(s)`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
