import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import Head from 'next/head';

import { useMedidores } from '@/hooks/useMedidores';
import { medidoresService, Medidor, LecturaMedidor } from '@/lib/medidoresService';

export default function LecturasPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Estados
  const [comunidadId, setComunidadId] = useState<number | null>(null);
  const [selectedMedidor, setSelectedMedidor] = useState<Medidor | null>(null);
  const [lecturas, setLecturas] = useState<LecturaMedidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLecturas, setLoadingLecturas] = useState(false);
  
  // Modal states
  const [showNuevaLecturaModal, setShowNuevaLecturaModal] = useState(false);
  
  // Form state
  const [lecturaFormData, setLecturaFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    lectura: '',
    periodo: ''
  });

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('');

  // Usar hook de medidores
  const { medidores } = useMedidores(comunidadId);

  // Obtener comunidad del usuario
  useEffect(() => {
    if (user) {
      const membresias = user?.membresias || user?.memberships || [];
      if (membresias.length > 0) {
        const comunidadId = membresias[0].comunidad_id || membresias[0].comunidadId;
        setComunidadId(comunidadId);
      }
    }
  }, [user]);

  // Auto-seleccionar primer medidor
  useEffect(() => {
    if (medidores.length > 0 && !selectedMedidor) {
      setSelectedMedidor(medidores[0]);
    }
  }, [medidores, selectedMedidor]);

  // Cargar lecturas cuando cambia el medidor
  useEffect(() => {
    if (selectedMedidor) {
      loadLecturas();
    }
  }, [selectedMedidor]);

  // Cargar lecturas
  const loadLecturas = async () => {
    if (!selectedMedidor) return;

    try {
      setLoadingLecturas(true);
      const data = await medidoresService.getLecturas(selectedMedidor.id, 50);
      setLecturas(data);
    } catch (error) {
      console.error('Error loading lecturas:', error);
    } finally {
      setLoadingLecturas(false);
    }
  };

  // Generar periodo automático
  const generatePeriodo = (fecha: string) => {
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // Handle fecha change
  const handleFechaChange = (fecha: string) => {
    setLecturaFormData(prev => ({
      ...prev,
      fecha,
      periodo: generatePeriodo(fecha)
    }));
  };

  // Handle crear lectura
  const handleNuevaLectura = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedidor) return;
    
    try {
      setLoading(true);
      await medidoresService.createLectura(selectedMedidor.id, {
        fecha: lecturaFormData.fecha,
        lectura: parseFloat(lecturaFormData.lectura),
        periodo: lecturaFormData.periodo
      });
      
      setShowNuevaLecturaModal(false);
      setLecturaFormData({
        fecha: new Date().toISOString().split('T')[0],
        lectura: '',
        periodo: ''
      });
      
      // Recargar lecturas
      loadLecturas();
    } catch (error) {
      console.error('Error creating lectura:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar medidores
  const medidoresFiltrados = medidores.filter(medidor => {
    if (filtroTipo !== 'todos' && medidor.tipo !== filtroTipo) return false;
    return true;
  });

  // Filtrar lecturas
  const lecturasFiltradas = lecturas.filter(lectura => {
    if (filtroPeriodo && !lectura.periodo.includes(filtroPeriodo)) return false;
    return true;
  });

  if (!comunidadId) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="alert alert-warning">
            <span className="material-icons align-middle me-2">warning</span>
            Sin acceso a comunidad
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Lecturas de Medidores — Cuentas Claras</title>
      </Head>

      <Layout title='Lecturas de Medidores'>
        <div className='container-fluid p-4'>
          
          {/* Header */}
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div>
              <h1 className='h3 mb-0'>
                <span className="material-icons align-middle me-2">timeline</span>
                Lecturas de Medidores
              </h1>
              <p className="text-muted mb-0">
                Registra y gestiona las lecturas de todos los medidores
              </p>
            </div>
            <button 
              className='btn btn-primary'
              onClick={() => setShowNuevaLecturaModal(true)}
              disabled={!selectedMedidor}
            >
              <span className="material-icons align-middle me-1">add</span>
              Nueva Lectura
            </button>
          </div>

          <div className="row">
            
            {/* Panel Izquierdo - Lista de Medidores */}
            <div className="col-md-4 col-lg-3 mb-4">
              <div className="card h-100">
                <div className="card-header bg-light">
                  <h6 className="card-title mb-0">
                    <span className="material-icons align-middle me-2">sensors</span>
                    Medidores ({medidoresFiltrados.length})
                  </h6>
                </div>
                
                {/* Filtros */}
                <div className="card-body pb-2">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Filtrar por tipo</label>
                    <select 
                      className="form-select form-select-sm"
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                      <option value="todos">Todos los tipos</option>
                      <option value="agua">💧 Agua</option>
                      <option value="luz">⚡ Electricidad</option>
                      <option value="gas">🔥 Gas</option>
                      <option value="calefaccion">🌡️ Calefacción</option>
                    </select>
                  </div>
                </div>

                {/* Lista de medidores */}
                <div className="list-group list-group-flush" style={{maxHeight: '400px', overflowY: 'auto'}}>
                  {medidoresFiltrados.length === 0 ? (
                    <div className="list-group-item text-center py-4">
                      <span className="material-icons mb-2 text-muted">sensors_off</span>
                      <p className="mb-0 text-muted">No hay medidores</p>
                    </div>
                  ) : (
                    medidoresFiltrados.map((medidor) => (
                      <button
                        key={medidor.id}
                        className={`list-group-item list-group-item-action d-flex align-items-center ${
                          selectedMedidor?.id === medidor.id ? 'active' : ''
                        }`}
                        onClick={() => setSelectedMedidor(medidor)}
                      >
                        <div className={`p-1 rounded me-2`} style={{
                          backgroundColor: medidor.tipo === 'agua' ? '#e3f2fd' : 
                                         medidor.tipo === 'luz' ? '#fff3e0' : '#f3e5f5',
                          color: medidor.tipo === 'agua' ? '#1565c0' : 
                                 medidor.tipo === 'luz' ? '#ef6c00' : '#6a1b9a'
                        }}>
                          <span className="material-icons" style={{fontSize: '16px'}}>
                            {medidor.tipo === 'agua' ? 'water_drop' : 
                             medidor.tipo === 'luz' ? 'flash_on' : 
                             medidor.tipo === 'gas' ? 'local_gas_station' : 'sensors'}
                          </span>
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{medidor.codigo}</div>
                          <small className={selectedMedidor?.id === medidor.id ? 'text-white-50' : 'text-muted'}>
                            {medidor.tipo} {medidor.unidad_id ? `• Unidad ${medidor.unidad_id}` : ''}
                            {medidor.es_compartido ? ' • Compartido' : ''}
                          </small>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Panel Derecho - Lecturas del Medidor Seleccionado */}
            <div className="col-md-8 col-lg-9">
              {!selectedMedidor ? (
                <div className="card">
                  <div className="card-body text-center py-5">
                    <span className="material-icons mb-3" style={{fontSize: '48px', color: '#6c757d'}}>
                      timeline
                    </span>
                    <h5 className="text-muted">Selecciona un medidor</h5>
                    <p className="text-muted">Elige un medidor de la lista para ver sus lecturas</p>
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div className={`p-2 rounded me-3`} style={{
                          backgroundColor: selectedMedidor.tipo === 'agua' ? '#e3f2fd' : 
                                         selectedMedidor.tipo === 'luz' ? '#fff3e0' : '#f3e5f5',
                          color: selectedMedidor.tipo === 'agua' ? '#1565c0' : 
                                 selectedMedidor.tipo === 'luz' ? '#ef6c00' : '#6a1b9a'
                        }}>
                          <span className="material-icons">
                            {selectedMedidor.tipo === 'agua' ? 'water_drop' : 
                             selectedMedidor.tipo === 'luz' ? 'flash_on' : 
                             selectedMedidor.tipo === 'gas' ? 'local_gas_station' : 'sensors'}
                          </span>
                        </div>
                        <div>
                          <h6 className="mb-0">{selectedMedidor.codigo}</h6>
                          <small className="text-muted">
                            Medidor de {selectedMedidor.tipo}
                            {selectedMedidor.unidad_id && ` • Unidad ${selectedMedidor.unidad_id}`}
                            {selectedMedidor.es_compartido && ` • Compartido`}
                          </small>
                        </div>
                      </div>
                      
                      {/* Filtro por período */}
                      <div className="d-flex align-items-center gap-2">
                        <div className="input-group input-group-sm" style={{width: '150px'}}>
                          <input 
                            type="month" 
                            className="form-control"
                            value={filtroPeriodo}
                            onChange={(e) => setFiltroPeriodo(e.target.value)}
                            placeholder="Filtrar período"
                          />
                        </div>
                        {filtroPeriodo && (
                          <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => setFiltroPeriodo('')}
                          >
                            <span className="material-icons" style={{fontSize: '16px'}}>clear</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-body p-0">
                    {loadingLecturas ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Cargando lecturas...</span>
                        </div>
                      </div>
                    ) : lecturasFiltradas.length === 0 ? (
                      <div className="text-center py-5">
                        <span className="material-icons mb-3" style={{fontSize: '48px', color: '#6c757d'}}>
                          timeline
                        </span>
                        <h5 className="text-muted">No hay lecturas registradas</h5>
                        <p className="text-muted">Registra la primera lectura para este medidor</p>
                        <button 
                          className="btn btn-primary"
                          onClick={() => setShowNuevaLecturaModal(true)}
                        >
                          <span className="material-icons align-middle me-1">add</span>
                          Primera Lectura
                        </button>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th style={{width: '120px'}}>Período</th>
                              <th style={{width: '120px'}}>Fecha</th>
                              <th className="text-end" style={{width: '120px'}}>Lectura</th>
                              <th className="text-end" style={{width: '120px'}}>Consumo</th>
                              <th className="text-center" style={{width: '100px'}}>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lecturasFiltradas.map((lectura, index) => {
                              const lecturaAnterior = lecturasFiltradas[index + 1];
                              const consumo = lecturaAnterior ? lectura.lectura - lecturaAnterior.lectura : null;
                              
                              return (
                                <tr key={lectura.id}>
                                  <td>
                                    <span className="badge bg-secondary">{lectura.periodo}</span>
                                  </td>
                                  <td>
                                    <small>{new Date(lectura.fecha).toLocaleDateString()}</small>
                                  </td>
                                  <td className="text-end">
                                    <strong className="font-monospace">{lectura.lectura}</strong>
                                    <small className="text-muted d-block">
                                      {selectedMedidor.tipo === 'agua' ? 'm³' : 
                                       selectedMedidor.tipo === 'luz' ? 'kWh' : 
                                       selectedMedidor.tipo === 'gas' ? 'm³' : 'unidad'}
                                    </small>
                                  </td>
                                  <td className="text-end">
                                    {consumo !== null ? (
                                      <div>
                                        <span className={`badge ${consumo >= 0 ? 'bg-info' : 'bg-warning'}`}>
                                          {consumo.toFixed(1)}
                                        </span>
                                        {consumo < 0 && (
                                          <small className="text-warning d-block">⚠️ Negativo</small>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-muted">-</span>
                                    )}
                                  </td>
                                  <td className="text-center">
                                    <div className="btn-group btn-group-sm">
                                      <button className="btn btn-outline-primary btn-sm">
                                        <span className="material-icons" style={{fontSize: '14px'}}>edit</span>
                                      </button>
                                      <button className="btn btn-outline-danger btn-sm">
                                        <span className="material-icons" style={{fontSize: '14px'}}>delete</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  
                  {lecturasFiltradas.length > 0 && (
                    <div className="card-footer bg-light">
                      <div className="row text-center">
                        <div className="col">
                          <div className="fw-semibold text-primary">{lecturasFiltradas.length}</div>
                          <small className="text-muted">Lecturas</small>
                        </div>
                        {lecturasFiltradas.length > 1 && (
                          <>
                            <div className="col">
                              <div className="fw-semibold text-success">
                                {(lecturasFiltradas[0].lectura - lecturasFiltradas[lecturasFiltradas.length - 1].lectura).toFixed(1)}
                              </div>
                              <small className="text-muted">Consumo Total</small>
                            </div>
                            <div className="col">
                              <div className="fw-semibold text-info">
                                {((lecturasFiltradas[0].lectura - lecturasFiltradas[lecturasFiltradas.length - 1].lectura) / (lecturasFiltradas.length - 1)).toFixed(1)}
                              </div>
                              <small className="text-muted">Promedio/Mes</small>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* Modal Nueva Lectura - IGUAL QUE ANTES */}
        {showNuevaLecturaModal && selectedMedidor && (
          <div className="modal fade show" style={{display: 'block'}} tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <span className="material-icons align-middle me-2">add_circle</span>
                    Nueva Lectura - {selectedMedidor.codigo}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowNuevaLecturaModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleNuevaLectura}>
                  <div className="modal-body">
                    
                    {/* Información del medidor */}
                    <div className="alert alert-light border mb-4">
                      <div className="d-flex align-items-center">
                        <div className={`p-2 rounded me-3`} style={{
                          backgroundColor: selectedMedidor.tipo === 'agua' ? '#e3f2fd' : 
                                         selectedMedidor.tipo === 'luz' ? '#fff3e0' : '#f3e5f5',
                          color: selectedMedidor.tipo === 'agua' ? '#1565c0' : 
                                 selectedMedidor.tipo === 'luz' ? '#ef6c00' : '#6a1b9a'
                        }}>
                          <span className="material-icons">
                            {selectedMedidor.tipo === 'agua' ? 'water_drop' : 
                             selectedMedidor.tipo === 'luz' ? 'flash_on' : 
                             selectedMedidor.tipo === 'gas' ? 'local_gas_station' : 'sensors'}
                          </span>
                        </div>
                        <div>
                          <h6 className="mb-0">{selectedMedidor.codigo}</h6>
                          <small className="text-muted text-capitalize">
                            Medidor de {selectedMedidor.tipo}
                            {selectedMedidor.unidad_id && ` • Unidad ${selectedMedidor.unidad_id}`}
                            {selectedMedidor.es_compartido && ` • Compartido`}
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Última lectura */}
                    {lecturas.length > 0 && (
                      <div className="alert alert-info mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>Última lectura registrada:</strong>
                            <div>
                              <span className="badge bg-secondary me-2">{lecturas[0].periodo}</span>
                              <span className="fw-semibold">{lecturas[0].lectura}</span>
                              <small className="text-muted ms-1">
                                ({new Date(lecturas[0].fecha).toLocaleDateString()})
                              </small>
                            </div>
                          </div>
                          <span className="material-icons text-info">info</span>
                        </div>
                      </div>
                    )}

                    {/* Formulario */}
                    <div className="row">
                      
                      {/* Fecha */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          <span className="material-icons align-middle me-1" style={{fontSize: '18px'}}>
                            calendar_today
                          </span>
                          Fecha de Lectura
                        </label>
                        <input 
                          type="date" 
                          className="form-control"
                          value={lecturaFormData.fecha}
                          onChange={(e) => handleFechaChange(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          required 
                        />
                      </div>

                      {/* Período */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          <span className="material-icons align-middle me-1" style={{fontSize: '18px'}}>
                            event_note
                          </span>
                          Período
                        </label>
                        <input 
                          type="text" 
                          className="form-control bg-light"
                          value={lecturaFormData.periodo}
                          readOnly
                          placeholder="Se genera automático"
                        />
                        <div className="form-text">Se genera automáticamente según la fecha</div>
                      </div>

                    </div>

                    {/* Lectura */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <span className="material-icons align-middle me-1" style={{fontSize: '18px'}}>
                          trending_up
                        </span>
                        Valor de la Lectura
                      </label>
                      <div className="input-group">
                        <input 
                          type="number" 
                          className="form-control"
                          placeholder="Ingrese el valor del medidor"
                          value={lecturaFormData.lectura}
                          onChange={(e) => setLecturaFormData(prev => ({...prev, lectura: e.target.value}))}
                          min="0"
                          step={selectedMedidor.tipo === 'agua' ? '0.1' : '1'}
                          required 
                        />
                        <span className="input-group-text">
                          {selectedMedidor.tipo === 'agua' ? 'm³' : 
                           selectedMedidor.tipo === 'luz' ? 'kWh' : 
                           selectedMedidor.tipo === 'gas' ? 'm³' : 'unidad'}
                        </span>
                      </div>
                    </div>

                    {/* Validación consumo */}
                    {lecturas.length > 0 && lecturaFormData.lectura && (
                      <div className={`alert ${
                        parseFloat(lecturaFormData.lectura) >= lecturas[0].lectura 
                          ? 'alert-success' 
                          : 'alert-warning'
                      }`}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>Consumo calculado:</strong>
                            <div className="d-flex align-items-center mt-1">
                              <span className="badge bg-primary me-2">
                                {Math.max(0, parseFloat(lecturaFormData.lectura || '0') - lecturas[0].lectura).toFixed(1)}
                              </span>
                              <small className="text-muted">
                                ({parseFloat(lecturaFormData.lectura || '0')} - {lecturas[0].lectura})
                              </small>
                            </div>
                          </div>
                          <span className="material-icons">
                            {parseFloat(lecturaFormData.lectura) >= lecturas[0].lectura 
                              ? 'check_circle' 
                              : 'warning'}
                          </span>
                        </div>
                        {parseFloat(lecturaFormData.lectura) < lecturas[0].lectura && (
                          <div className="mt-2">
                            <small>⚠️ La lectura actual es menor que la anterior. Verifique el valor.</small>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowNuevaLecturaModal(false)}
                    >
                      <span className="material-icons align-middle me-1">close</span>
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={!lecturaFormData.lectura || !lecturaFormData.fecha || loading}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm align-middle me-1" role="status"></span>
                      ) : (
                        <span className="material-icons align-middle me-1">save</span>
                      )}
                      Registrar Lectura
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Backdrop */}
        {showNuevaLecturaModal && (
          <div className="modal-backdrop fade show"></div>
        )}

      </Layout>
    </ProtectedRoute>
  );
}