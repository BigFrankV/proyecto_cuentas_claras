import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import Head from 'next/head';

// ✅ Usar nuestros hooks y servicios
import { useMedidores, useLecturas } from '@/hooks/useMedidores';
import { Medidor, CreateMedidorRequest } from '@/lib/medidoresService';

export default function MedidoresListado() {
  const router = useRouter();
  const { user } = useAuth();

  // Estados locales
  const [comunidadId, setComunidadId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLecturasModal, setShowLecturasModal] = useState(false);
  const [showNuevaLecturaModal, setShowNuevaLecturaModal] = useState(false);
  const [selectedMedidor, setSelectedMedidor] = useState<Medidor | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateMedidorRequest>({
    tipo: 'agua',
    codigo: '',
    es_compartido: false,
    unidad_id: null
  });

  const [lecturaFormData, setLecturaFormData] = useState({
    fecha: new Date().toISOString().split('T')[0], // Fecha actual
    lectura: '',
    periodo: ''
  });

  // ✅ Usar nuestros hooks
  const { medidores, loading, createMedidor } = useMedidores(comunidadId);
  const { lecturas, loading: loadingLecturas, createLectura } = useLecturas(selectedMedidor?.id || null);

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

  // ✅ Handler simplificado con el hook
  const handleCreateMedidor = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMedidor(formData);
      setShowCreateModal(false);
      setFormData({ tipo: 'agua', codigo: '', es_compartido: false, unidad_id: null });
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  // ✅ Handler simplificado para ver lecturas
  const handleVerLecturas = async (medidor: Medidor) => {
    setSelectedMedidor(medidor);
    setShowLecturasModal(true);
  };

  // AGREGAR esta función después de handleVerLecturas:
  const handleNuevaLectura = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMedidor) return;

    try {
      await createLectura({
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
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  // GENERAR periodo automático
  const generatePeriodo = (fecha: string) => {
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // ACTUALIZAR cuando cambie la fecha
  const handleFechaChange = (fecha: string) => {
    setLecturaFormData(prev => ({
      ...prev,
      fecha,
      periodo: generatePeriodo(fecha)
    }));
  };

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
        <title>Medidores — Cuentas Claras</title>
      </Head>

      <Layout title='Gestión de Medidores'>
        <div className='container-fluid p-4'>

          {/* Header */}
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div>
              <h1 className='h3 mb-0'>
                <span className="material-icons align-middle me-2">sensors</span>
                Medidores
              </h1>
              <p className="text-muted mb-0">
                {medidores.length} medidores registrados • Comunidad ID: {comunidadId}
              </p>
            </div>
            <button
              className='btn btn-primary'
              onClick={() => setShowCreateModal(true)}
            >
              <span className="material-icons align-middle me-1">add</span>
              Nuevo Medidor
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando medidores...</span>
              </div>
            </div>
          )}

          {/* Lista de medidores */}
          {!loading && (
            <div className='row'>
              {medidores.length === 0 ? (
                <div className="col-12">
                  <div className="card">
                    <div className="card-body text-center py-5">
                      <span className="material-icons mb-3" style={{ fontSize: '48px', color: '#6c757d' }}>
                        sensors_off
                      </span>
                      <h5 className="text-muted">No hay medidores registrados</h5>
                      <p className="text-muted">Crear el primer medidor para comenzar</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                      >
                        <span className="material-icons align-middle me-1">add</span>
                        Crear Medidor
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                medidores.map((medidor) => (
                  <div key={medidor.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center">
                            <div className={`p-2 rounded me-3`} style={{
                              backgroundColor: medidor.tipo === 'agua' ? '#e3f2fd' :
                                medidor.tipo === 'luz' ? '#fff3e0' : '#f3e5f5',
                              color: medidor.tipo === 'agua' ? '#1565c0' :
                                medidor.tipo === 'luz' ? '#ef6c00' : '#6a1b9a'
                            }}>
                              <span className="material-icons">
                                {medidor.tipo === 'agua' ? 'water_drop' :
                                  medidor.tipo === 'luz' ? 'flash_on' :
                                    medidor.tipo === 'gas' ? 'local_gas_station' : 'sensors'}
                              </span>
                            </div>
                            <div>
                              <h6 className="card-title mb-0">{medidor.codigo}</h6>
                              <small className="text-muted text-capitalize">{medidor.tipo}</small>
                            </div>
                          </div>
                          {medidor.es_compartido && (
                            <span className="badge bg-info">Compartido</span>
                          )}
                        </div>

                        <div className="mb-3">
                          <small className="text-muted">ID: {medidor.id}</small>
                          {medidor.unidad_id && (
                            <div><small className="text-muted">Unidad: {medidor.unidad_id}</small></div>
                          )}
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleVerLecturas(medidor)}
                          >
                            <span className="material-icons align-middle me-1" style={{ fontSize: '16px' }}>
                              timeline
                            </span>
                            Lecturas
                          </button>
                          <button className="btn btn-outline-secondary btn-sm">
                            <span className="material-icons align-middle" style={{ fontSize: '16px' }}>
                              edit
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Modal Crear Medidor - Igual que antes pero usando handleCreateMedidor */}
        {showCreateModal && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <span className="material-icons align-middle me-2">sensors</span>
                    Nuevo Medidor
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCreateModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleCreateMedidor}>
                  <div className="modal-body">

                    {/* Tipo */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Tipo de Medidor</label>
                      <select
                        className="form-select"
                        value={formData.tipo}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                        required
                      >
                        <option value="agua">💧 Agua</option>
                        <option value="luz">⚡ Electricidad</option>
                        <option value="gas">🔥 Gas</option>
                        <option value="calefaccion">🌡️ Calefacción</option>
                      </select>
                    </div>

                    {/* Código */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Código del Medidor</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: MED-AGUA-001"
                        value={formData.codigo}
                        onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Unidad (opcional) */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Unidad (opcional)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="ID de la unidad"
                        value={formData.unidad_id || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, unidad_id: e.target.value ? Number(e.target.value) : null }))}
                      />
                      <div className="form-text">Dejar vacío si es un medidor compartido</div>
                    </div>

                    {/* Es compartido */}
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="es_compartido"
                        checked={formData.es_compartido}
                        onChange={(e) => setFormData(prev => ({ ...prev, es_compartido: e.target.checked }))}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="es_compartido">
                        Medidor compartido
                      </label>
                      <div className="form-text">Marcar si el medidor mide consumo de áreas comunes</div>
                    </div>

                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <span className="material-icons align-middle me-1">save</span>
                      Crear Medidor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Lecturas */}
        {showLecturasModal && selectedMedidor && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <span className="material-icons align-middle me-2">timeline</span>
                    Lecturas - {selectedMedidor.codigo}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowLecturasModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {loadingLecturas ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando lecturas...</span>
                      </div>
                    </div>
                  ) : lecturas.length === 0 ? (
                    <div className="text-center py-4">
                      <span className="material-icons mb-2" style={{ fontSize: '48px', color: '#6c757d' }}>
                        timeline
                      </span>
                      <p className="text-muted">No hay lecturas registradas</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Período</th>
                            <th>Fecha</th>
                            <th className="text-end">Lectura</th>
                            <th className="text-end">Consumo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lecturas.map((lectura, index) => (
                            <tr key={lectura.id}>
                              <td>{lectura.periodo}</td>
                              <td>{new Date(lectura.fecha).toLocaleDateString()}</td>
                              <td className="text-end font-monospace">{lectura.lectura}</td>
                              <td className="text-end">
                                {lectura.consumo ? (
                                  <span className="badge bg-info">{lectura.consumo}</span>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowLecturasModal(false)}
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setShowLecturasModal(false);
                      setShowNuevaLecturaModal(true);
                    }}
                  >
                    <span className="material-icons align-middle me-1">add</span>
                    Nueva Lectura
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Nueva Lectura */}
        {showNuevaLecturaModal && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <span className="material-icons align-middle me-2">add_circle</span>
                    Nueva Lectura
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowNuevaLecturaModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleNuevaLectura}>
                  <div className="modal-body">

                    {/* Fecha */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Fecha</label>
                      <input
                        type="date"
                        className="form-control"
                        value={lecturaFormData.fecha}
                        onChange={(e) => handleFechaChange(e.target.value)}
                        required
                      />
                    </div>

                    {/* Lectura */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Lectura</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Valor de la lectura"
                        value={lecturaFormData.lectura}
                        onChange={(e) => setLecturaFormData(prev => ({ ...prev, lectura: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Periodo */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Período</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: 2023-10"
                        value={lecturaFormData.periodo}
                        onChange={(e) => setLecturaFormData(prev => ({ ...prev, periodo: e.target.value }))}
                        required
                      />
                    </div>

                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowNuevaLecturaModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <span className="material-icons align-middle me-1">save</span>
                      Guardar Lectura
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Backdrop */}
        {(showCreateModal || showLecturasModal || showNuevaLecturaModal) && (
          <div className="modal-backdrop fade show"></div>
        )}

      </Layout>
    </ProtectedRoute>
  );
}
