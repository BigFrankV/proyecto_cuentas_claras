import { useState } from 'react';

interface Medidor {
  id: string;
  tipo: 'Agua' | 'Gas' | 'Electricidad' | 'Calefacción';
  numero: string;
  marca: string;
  modelo: string;
  fechaInstalacion: string;
  ubicacion: string;
  estado: 'Activo' | 'Inactivo' | 'Mantenimiento';
  lecturaActual?: number;
  lecturAnterior?: number;
}

interface UnidadMedidoresProps {
  medidores: Medidor[];
  onMedidoresChange: (medidores: Medidor[]) => void;
}

const UnidadMedidores: React.FC<UnidadMedidoresProps> = ({
  medidores,
  onMedidoresChange
}) => {
  const [editingMedidor, setEditingMedidor] = useState<string | null>(null);
  const [newMedidor, setNewMedidor] = useState<Partial<Medidor>>({
    tipo: 'Agua',
    estado: 'Activo'
  });

  const tiposMedidor = [
    { value: 'Agua', icon: 'water_drop', color: '#2196F3' },
    { value: 'Gas', icon: 'local_fire_department', color: '#FF9800' },
    { value: 'Electricidad', icon: 'electric_bolt', color: '#FFC107' },
    { value: 'Calefacción', icon: 'thermostat', color: '#F44336' }
  ];

  const handleAddMedidor = () => {
    if (!newMedidor.tipo || !newMedidor.numero || !newMedidor.marca) {
      return;
    }

    const medidor: Medidor = {
      id: Date.now().toString(),
      tipo: newMedidor.tipo,
      numero: newMedidor.numero,
      marca: newMedidor.marca,
      modelo: newMedidor.modelo || '',
      fechaInstalacion: (newMedidor.fechaInstalacion || new Date().toISOString().split('T')[0]) as string,
      ubicacion: newMedidor.ubicacion || '',
      estado: newMedidor.estado || 'Activo'
    };

    // Agregar propiedades opcionales solo si tienen valor
    if (newMedidor.lecturaActual !== undefined) {
      medidor.lecturaActual = newMedidor.lecturaActual;
    }
    if (newMedidor.lecturAnterior !== undefined) {
      medidor.lecturAnterior = newMedidor.lecturAnterior;
    }

    onMedidoresChange([...medidores, medidor]);
    setNewMedidor({ tipo: 'Agua', estado: 'Activo' });
  };

  const handleRemoveMedidor = (medidorId: string) => {
    onMedidoresChange(medidores.filter(m => m.id !== medidorId));
  };

  const handleEditMedidor = (medidorId: string, updatedMedidor: Partial<Medidor>) => {
    onMedidoresChange(
      medidores.map(m => 
        m.id === medidorId ? { ...m, ...updatedMedidor } : m
      )
    );
    setEditingMedidor(null);
  };

  const getTipoInfo = (tipo: string) => {
    return tiposMedidor.find(t => t.value === tipo) || tiposMedidor[0];
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'bg-success';
      case 'Inactivo':
        return 'bg-secondary';
      case 'Mantenimiento':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className='card h-100'>
      <div className='card-header d-flex justify-content-between align-items-center'>
        <h6 className='card-title mb-0'>
          <i className='material-icons me-2'>speed</i>
          Medidores ({medidores.length})
        </h6>
        <button 
          className='btn btn-sm btn-primary'
          data-bs-toggle='collapse'
          data-bs-target='#addMedidorForm'
        >
          <i className='material-icons me-1' style={{ fontSize: '16px' }}>add</i>
          Agregar
        </button>
      </div>
      <div className='card-body'>
        {/* Formulario para agregar medidor */}
        <div className='collapse mb-3' id='addMedidorForm'>
          <div className='card card-body'>
            <h6 className='mb-3'>Nuevo Medidor</h6>
            <div className='row g-3'>
              <div className='col-md-6'>
                <label className='form-label'>Tipo *</label>
                <select 
                  className='form-select'
                  value={newMedidor.tipo}
                  onChange={(e) => setNewMedidor({ ...newMedidor, tipo: e.target.value as any })}
                >
                  {tiposMedidor.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.value}</option>
                  ))}
                </select>
              </div>
              <div className='col-md-6'>
                <label className='form-label'>Número de Serie *</label>
                <input
                  type='text'
                  className='form-control'
                  value={newMedidor.numero || ''}
                  onChange={(e) => setNewMedidor({ ...newMedidor, numero: e.target.value })}
                  placeholder='Ej: MED001'
                />
              </div>
              <div className='col-md-6'>
                <label className='form-label'>Marca *</label>
                <input
                  type='text'
                  className='form-control'
                  value={newMedidor.marca || ''}
                  onChange={(e) => setNewMedidor({ ...newMedidor, marca: e.target.value })}
                  placeholder='Ej: Elster'
                />
              </div>
              <div className='col-md-6'>
                <label className='form-label'>Modelo</label>
                <input
                  type='text'
                  className='form-control'
                  value={newMedidor.modelo || ''}
                  onChange={(e) => setNewMedidor({ ...newMedidor, modelo: e.target.value })}
                  placeholder='Ej: V100'
                />
              </div>
              <div className='col-md-6'>
                <label className='form-label'>Fecha de Instalación</label>
                <input
                  type='date'
                  className='form-control'
                  value={newMedidor.fechaInstalacion || ''}
                  onChange={(e) => setNewMedidor({ ...newMedidor, fechaInstalacion: e.target.value })}
                />
              </div>
              <div className='col-md-6'>
                <label className='form-label'>Ubicación</label>
                <input
                  type='text'
                  className='form-control'
                  value={newMedidor.ubicacion || ''}
                  onChange={(e) => setNewMedidor({ ...newMedidor, ubicacion: e.target.value })}
                  placeholder='Ej: Cocina, Baño principal'
                />
              </div>
              <div className='col-md-6'>
                <label className='form-label'>Lectura Actual</label>
                <input
                  type='number'
                  className='form-control'
                  value={newMedidor.lecturaActual || ''}
                  onChange={(e) => setNewMedidor({ ...newMedidor, lecturaActual: Number(e.target.value) })}
                  placeholder='0'
                />
              </div>
              <div className='col-md-6'>
                <label className='form-label'>Estado</label>
                <select 
                  className='form-select'
                  value={newMedidor.estado}
                  onChange={(e) => setNewMedidor({ ...newMedidor, estado: e.target.value as any })}
                >
                  <option value='Activo'>Activo</option>
                  <option value='Inactivo'>Inactivo</option>
                  <option value='Mantenimiento'>Mantenimiento</option>
                </select>
              </div>
            </div>
            <div className='d-flex gap-2 mt-3'>
              <button 
                type='button' 
                className='btn btn-primary'
                onClick={handleAddMedidor}
                disabled={!newMedidor.tipo || !newMedidor.numero || !newMedidor.marca}
              >
                <i className='material-icons me-1' style={{ fontSize: '16px' }}>add</i>
                Agregar Medidor
              </button>
              <button 
                type='button' 
                className='btn btn-secondary'
                data-bs-toggle='collapse'
                data-bs-target='#addMedidorForm'
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de medidores */}
        {medidores.length === 0 ? (
          <div className='text-center py-4 text-muted'>
            <i className='material-icons mb-2' style={{ fontSize: '48px' }}>speed</i>
            <p className='mb-0'>No hay medidores registrados</p>
            <small>Agrega medidores para llevar el control de consumos</small>
          </div>
        ) : (
          <div className='medidores-list'>
            {medidores.map((medidor) => {
              const tipoInfo = getTipoInfo(medidor.tipo);
              const isEditing = editingMedidor === medidor.id;

              return (
                <div key={medidor.id} className='card mb-3'>
                  <div className='card-body'>
                    <div className='d-flex justify-content-between align-items-start mb-2'>
                      <div className='d-flex align-items-center'>
                        <div 
                          className='me-3 d-flex align-items-center justify-content-center text-white'
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: tipoInfo?.color || '#6c757d'
                          }}
                        >
                          <i className='material-icons' style={{ fontSize: '20px' }}>{tipoInfo?.icon || 'speed'}</i>
                        </div>
                        <div>
                          <h6 className='mb-1'>{medidor.tipo} - {medidor.numero}</h6>
                          <div className='d-flex align-items-center gap-2'>
                            <span className={`badge ${getEstadoBadgeClass(medidor.estado)}`}>
                              {medidor.estado}
                            </span>
                            <small className='text-muted'>{medidor.marca} {medidor.modelo}</small>
                          </div>
                        </div>
                      </div>
                      <div className='dropdown'>
                        <button 
                          className='btn btn-sm btn-outline-secondary'
                          data-bs-toggle='dropdown'
                        >
                          <i className='material-icons' style={{ fontSize: '16px' }}>more_vert</i>
                        </button>
                        <ul className='dropdown-menu'>
                          <li>
                            <button 
                              className='dropdown-item'
                              onClick={() => setEditingMedidor(isEditing ? null : medidor.id)}
                            >
                              <i className='material-icons me-2' style={{ fontSize: '16px' }}>edit</i>
                              {isEditing ? 'Cancelar' : 'Editar'}
                            </button>
                          </li>
                          <li><hr className='dropdown-divider' /></li>
                          <li>
                            <button 
                              className='dropdown-item text-danger'
                              onClick={() => handleRemoveMedidor(medidor.id)}
                            >
                              <i className='material-icons me-2' style={{ fontSize: '16px' }}>delete</i>
                              Eliminar
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className='row g-2 mt-2'>
                        <div className='col-md-4'>
                          <input
                            type='text'
                            className='form-control form-control-sm'
                            value={medidor.numero}
                            onChange={(e) => handleEditMedidor(medidor.id, { numero: e.target.value })}
                            placeholder='Número'
                          />
                        </div>
                        <div className='col-md-4'>
                          <input
                            type='text'
                            className='form-control form-control-sm'
                            value={medidor.ubicacion}
                            onChange={(e) => handleEditMedidor(medidor.id, { ubicacion: e.target.value })}
                            placeholder='Ubicación'
                          />
                        </div>
                        <div className='col-md-4'>
                          <select 
                            className='form-select form-select-sm'
                            value={medidor.estado}
                            onChange={(e) => handleEditMedidor(medidor.id, { estado: e.target.value as any })}
                          >
                            <option value='Activo'>Activo</option>
                            <option value='Inactivo'>Inactivo</option>
                            <option value='Mantenimiento'>Mantenimiento</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className='row g-3 mt-1'>
                        <div className='col-md-4'>
                          <small className='text-muted d-block'>Ubicación</small>
                          <span>{medidor.ubicacion || 'No especificada'}</span>
                        </div>
                        <div className='col-md-4'>
                          <small className='text-muted d-block'>Instalación</small>
                          <span>{new Date(medidor.fechaInstalacion).toLocaleDateString('es-CL')}</span>
                        </div>
                        <div className='col-md-4'>
                          <small className='text-muted d-block'>Lectura Actual</small>
                          <span>{medidor.lecturaActual || 0} {medidor.tipo === 'Agua' ? 'm³' : medidor.tipo === 'Gas' ? 'm³' : 'kWh'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnidadMedidores;