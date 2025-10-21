import { useState, useMemo } from 'react';

interface CaracteristicaOption {
  id: string;
  nombre: string;
  categoria: string;
  icono: string;
}

interface UnidadCaracteristicasProps {
  selectedCaracteristicas: string[];
  onCaracteristicasChange: (caracteristicas: string[]) => void;
}

const UnidadCaracteristicas: React.FC<UnidadCaracteristicasProps> = ({
  selectedCaracteristicas,
  onCaracteristicasChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data de características
  const caracteristicas: CaracteristicaOption[] = [
    // Comodidades
    { id: 'piscina', nombre: 'Piscina', categoria: 'Comodidades', icono: 'pool' },
    { id: 'gimnasio', nombre: 'Gimnasio', categoria: 'Comodidades', icono: 'fitness_center' },
    { id: 'quincho', nombre: 'Quincho', categoria: 'Comodidades', icono: 'outdoor_grill' },
    { id: 'salon_eventos', nombre: 'Salón de Eventos', categoria: 'Comodidades', icono: 'celebration' },
    { id: 'juegos_infantiles', nombre: 'Juegos Infantiles', categoria: 'Comodidades', icono: 'child_friendly' },
    { id: 'cancha_tennis', nombre: 'Cancha de Tenis', categoria: 'Comodidades', icono: 'sports_tennis' },
    { id: 'cancha_futbol', nombre: 'Cancha de Fútbol', categoria: 'Comodidades', icono: 'sports_soccer' },
    { id: 'spa', nombre: 'Spa', categoria: 'Comodidades', icono: 'spa' },
    { id: 'sauna', nombre: 'Sauna', categoria: 'Comodidades', icono: 'hot_tub' },
    
    // Seguridad
    { id: 'porteria_24h', nombre: 'Portería 24h', categoria: 'Seguridad', icono: 'security' },
    { id: 'circuito_cerrado', nombre: 'Circuito Cerrado', categoria: 'Seguridad', icono: 'videocam' },
    { id: 'alarma', nombre: 'Sistema de Alarma', categoria: 'Seguridad', icono: 'notification_important' },
    { id: 'control_acceso', nombre: 'Control de Acceso', categoria: 'Seguridad', icono: 'key' },
    
    // Servicios
    { id: 'administracion', nombre: 'Administración', categoria: 'Servicios', icono: 'admin_panel_settings' },
    { id: 'mantención', nombre: 'Mantención', categoria: 'Servicios', icono: 'build' },
    { id: 'jardineria', nombre: 'Jardinería', categoria: 'Servicios', icono: 'grass' },
    { id: 'aseo', nombre: 'Servicio de Aseo', categoria: 'Servicios', icono: 'cleaning_services' },
    
    // Ubicación
    { id: 'vista_mar', nombre: 'Vista al Mar', categoria: 'Ubicación', icono: 'waves' },
    { id: 'vista_ciudad', nombre: 'Vista a la Ciudad', categoria: 'Ubicación', icono: 'location_city' },
    { id: 'vista_cordillera', nombre: 'Vista a la Cordillera', categoria: 'Ubicación', icono: 'landscape' },
    { id: 'cerca_metro', nombre: 'Cerca del Metro', categoria: 'Ubicación', icono: 'train' },
    { id: 'centro_comercial', nombre: 'Centro Comercial Cercano', categoria: 'Ubicación', icono: 'shopping_cart' },
    
    // Características Especiales
    { id: 'balcon', nombre: 'Balcón', categoria: 'Características', icono: 'balcony' },
    { id: 'terraza', nombre: 'Terraza', categoria: 'Características', icono: 'deck' },
    { id: 'walk_in_closet', nombre: 'Walk-in Closet', categoria: 'Características', icono: 'checkroom' },
    { id: 'aire_acondicionado', nombre: 'Aire Acondicionado', categoria: 'Características', icono: 'ac_unit' },
    { id: 'calefaccion_central', nombre: 'Calefacción Central', categoria: 'Características', icono: 'thermostat' },
    { id: 'cocina_equipada', nombre: 'Cocina Equipada', categoria: 'Características', icono: 'kitchen' },
    { id: 'amoblado', nombre: 'Amoblado', categoria: 'Características', icono: 'chair' },
    { id: 'piso_flotante', nombre: 'Piso Flotante', categoria: 'Características', icono: 'layers' },
    { id: 'ventanas_termopanel', nombre: 'Ventanas Termopanel', categoria: 'Características', icono: 'window' }
  ];

  const categorias = useMemo(() => {
    const cats = Array.from(new Set(caracteristicas.map(c => c.categoria)));
    return cats.sort();
  }, []);

  const filteredCaracteristicas = useMemo(() => {
    if (!searchTerm) return caracteristicas;
    return caracteristicas.filter(c => 
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleCaracteristicaToggle = (caracteristicaId: string) => {
    const newSelected = selectedCaracteristicas.includes(caracteristicaId)
      ? selectedCaracteristicas.filter(id => id !== caracteristicaId)
      : [...selectedCaracteristicas, caracteristicaId];
    
    onCaracteristicasChange(newSelected);
  };

  const getCaracteristicasByCategoria = (categoria: string) => {
    return filteredCaracteristicas.filter(c => c.categoria === categoria);
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'Comodidades':
        return 'pool';
      case 'Seguridad':
        return 'security';
      case 'Servicios':
        return 'room_service';
      case 'Ubicación':
        return 'place';
      case 'Características':
        return 'home';
      default:
        return 'category';
    }
  };

  return (
    <div className='card h-100'>
      <div className='card-header'>
        <h6 className='card-title mb-0'>
          <i className='material-icons me-2'>check_circle</i>
          Características
        </h6>
      </div>
      <div className='card-body'>
        {/* Buscador */}
        <div className='mb-3'>
          <div className='input-group'>
            <span className='input-group-text'>
              <i className='material-icons' style={{ fontSize: '18px' }}>search</i>
            </span>
            <input
              type='text'
              className='form-control'
              placeholder='Buscar características...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Contador de seleccionadas */}
        {selectedCaracteristicas.length > 0 && (
          <div className='alert alert-info py-2 mb-3'>
            <small>
              <i className='material-icons me-1' style={{ fontSize: '16px' }}>info</i>
              {selectedCaracteristicas.length} característica{selectedCaracteristicas.length !== 1 ? 's' : ''} seleccionada{selectedCaracteristicas.length !== 1 ? 's' : ''}
            </small>
          </div>
        )}

        {/* Características por categoría */}
        <div className='caracteristicas-container' style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {categorias.map(categoria => {
            const caracteristicasCategoria = getCaracteristicasByCategoria(categoria);
            if (caracteristicasCategoria.length === 0) return null;

            return (
              <div key={categoria} className='mb-4'>
                <h6 className='text-muted mb-2 d-flex align-items-center'>
                  <i className='material-icons me-2' style={{ fontSize: '18px' }}>
                    {getCategoriaIcon(categoria)}
                  </i>
                  {categoria}
                </h6>
                <div className='row g-2'>
                  {caracteristicasCategoria.map(caracteristica => (
                    <div key={caracteristica.id} className='col-12'>
                      <div className='form-check'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          id={`caracteristica-${caracteristica.id}`}
                          checked={selectedCaracteristicas.includes(caracteristica.id)}
                          onChange={() => handleCaracteristicaToggle(caracteristica.id)}
                        />
                        <label 
                          className='form-check-label d-flex align-items-center'
                          htmlFor={`caracteristica-${caracteristica.id}`}
                        >
                          <i className='material-icons me-2 text-muted' style={{ fontSize: '18px' }}>
                            {caracteristica.icono}
                          </i>
                          {caracteristica.nombre}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {filteredCaracteristicas.length === 0 && (
          <div className='text-center py-4 text-muted'>
            <i className='material-icons mb-2' style={{ fontSize: '48px' }}>search_off</i>
            <p className='mb-0'>No se encontraron características</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnidadCaracteristicas;