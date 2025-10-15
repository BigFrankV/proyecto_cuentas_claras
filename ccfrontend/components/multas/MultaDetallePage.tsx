import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';

// Agregar interface
interface MultaDetallePageProps {
  multa: Multa;
  historial: HistorialItem[];
}

// Cambiar componente
const MultaDetallePage: React.FC<MultaDetallePageProps> = ({ multa, historial }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Calcular fecha de vencimiento (+15 días)
  const fechaVencimiento = new Date(new Date(multa.fecha).getTime() + 15 * 24 * 60 * 60 * 1000);

  return (
    <Layout title={`Detalle de Multa ${multa.numero}`}>
      <div className='container-fluid p-4'>
        {/* Usar header igual que listado para alinear con el layout y reducir gutter */}
        <div className='container-fluid px-3 py-3'>
          <header className='bg-white border-bottom shadow-sm p-3 mb-4'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <div style={{display:'inline-flex', alignItems:'center', gap:8, marginBottom:6}}>
                  <i className='material-icons'>schedule</i>
                  <small className='fw-medium'>Pendiente de Pago</small>
                </div>
                <h2 className='h5 mb-0'>Multa {multa.numero} — {multa.tipo_infraccion}</h2>
                <small className='text-muted'>Emitida {new Date(multa.fecha).toLocaleDateString()} • Vence {fechaVencimiento.toLocaleDateString()}</small>
              </div>
              <div className='text-end'>
                <div className='h4 mb-0 text-primary'>${multa.monto.toLocaleString()}</div>
                <small className='text-muted'>Monto a pagar</small>
              </div>
            </div>
          </header>

          {/* Botones de acción — mantener compactos y alineados con header */}
          <div className='d-flex flex-wrap align-items-center gap-3 mb-3'>
            <button className='btn btn-success btn-lg d-flex align-items-center' data-bs-toggle='modal' data-bs-target='#paymentModal'>
              <i className='material-icons me-2'>payment</i>
              Registrar Pago
            </button>

            <button className='btn btn-outline-primary btn-lg d-flex align-items-center' onClick={() => alert('Recordatorio enviado')}>
              <i className='material-icons me-2'>mail</i>
              Enviar Recordatorio
            </button>

            <button className='btn btn-info btn-lg d-flex align-items-center text-white' data-bs-toggle='modal' data-bs-target='#editModal'>
              <i className='material-icons me-2'>edit</i>
              Editar Multa
            </button>

            <button className='btn btn-danger btn-lg d-flex align-items-center' onClick={() => alert('¿Anular multa?')}>
              <i className='material-icons me-2'>cancel</i>
              Anular Multa
            </button>
          </div>
        </div>

        <div className='row'>
          {/* Columna principal */}
          <div className='col-lg-8'>
            {/* Tabs */}
            <ul className='nav nav-tabs' id='fineDetailTabs' role='tablist'>
              <li className='nav-item'>
                <button className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                  <span className='material-icons me-2'>info</span>
                  Información General
                </button>
              </li>
              <li className='nav-item'>
                <button className={`nav-link ${activeTab === 'evidence' ? 'active' : ''}`} onClick={() => setActiveTab('evidence')}>
                  <span className='material-icons me-2'>attach_file</span>
                  Evidencia
                </button>
              </li>
              <li className='nav-item'>
                <button className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
                  <span className='material-icons me-2'>payment</span>
                  Pagos
                </button>
              </li>
              <li className='nav-item'>
                <button className={`nav-link ${activeTab === 'appeals' ? 'active' : ''}`} onClick={() => setActiveTab('appeals')}>
                  <span className='material-icons me-2'>gavel</span>
                  Apelaciones
                </button>
              </li>
              <li className='nav-item'>
                <button className={`nav-link ${activeTab === 'communications' ? 'active' : ''}`} onClick={() => setActiveTab('communications')}>
                  <span className='material-icons me-2'>message</span>
                  Comunicaciones
                </button>
              </li>
            </ul>

            <div className='tab-content'>
              {/* Información General */}
              {activeTab === 'overview' && (
                <div className='tab-pane fade show active'>
                  <div className='row'>
                    <div className='col-md-6'>
                      <h6 className='mb-3'>Detalles de la Infracción</h6>
                      <div className='info-item'>
                        <span className='info-label'>Fecha y Hora:</span>
                        <span className='info-value'>{new Date(multa.fecha).toLocaleString()}</span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Ubicación:</span>
                        <span className='info-value'>{multa.torre_nombre} - {multa.unidad_numero}</span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Tipo de Infracción:</span>
                        <span className='info-value'>{multa.tipo_infraccion}</span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Reportado por:</span>
                        <span className='info-value'>Conserje nocturno</span> {/* Estático */}
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Prioridad:</span>
                        <span className='info-value'>
                          <span className={`badge bg-${multa.prioridad === 'alta' ? 'danger' : multa.prioridad === 'media' ? 'warning' : 'success'}`}>{multa.prioridad}</span>
                        </span>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <h6 className='mb-3'>Información del Pago</h6>
                      <div className='info-item'>
                        <span className='info-label'>Monto Base:</span>
                        <span className='info-value'>${multa.monto.toLocaleString()}</span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Recargos:</span>
                        <span className='info-value'>$0</span> {/* Estático */}
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Total a Pagar:</span>
                        <span className='info-value'><strong>${multa.monto.toLocaleString()}</strong></span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Fecha de Vencimiento:</span>
                        <span className='info-value'>{fechaVencimiento.toLocaleString()}</span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Días Restantes:</span>
                        <span className='info-value text-warning'><strong>10 días</strong></span> {/* Estático */}
                      </div>
                    </div>
                  </div>
                  
                  <div className='mt-4'>
                    <h6 className='mb-3'>Descripción Detallada</h6>
                    <div className='bg-light p-3 rounded'>
                      <p className='mb-0'>{multa.descripcion || 'Sin descripción'}</p>
                    </div>
                  </div>
                  
                  <div className='mt-4'>
                    <h6 className='mb-3'>Notas Internas</h6>
                    <div className='bg-light p-3 rounded'>
                      <p className='mb-0'>
                        <strong>Administrador:</strong> Segunda infracción del mismo tipo en 3 meses. 
                        Considerar seguimiento adicional si persiste el comportamiento.
                      </p> {/* Estático */}
                    </div>
                  </div>
                </div>
              )}

              {/* Evidencia */}
              {activeTab === 'evidence' && (
                <div className='tab-pane fade'>
                  <h6 className='mb-3'>Evidencia Adjunta</h6>
                  <div className='alert alert-secondary'>
                    <span className='material-icons me-2'>info</span>
                    <strong>Sin evidencia adjunta.</strong> No hay archivos asociados a esta multa.
                  </div> {/* Estático */}
                  <div className='mt-4'>
                    <button className='btn btn-outline-primary' onClick={() => alert('Agregar evidencia')}>
                      <span className='material-icons me-2'>add</span>
                      Agregar Evidencia
                    </button> {/* Estático */}
                  </div>
                </div>
              )}

              {/* Pagos */}
              {activeTab === 'payments' && (
                <div className='tab-pane fade'>
                  <div className='d-flex justify-content-between align-items-center mb-3'>
                    <h6 className='mb-0'>Historial de Pagos</h6>
                    <button className='btn btn-primary btn-sm' data-bs-toggle='modal' data-bs-target='#paymentModal'>
                      <span className='material-icons me-1'>add</span>
                      Registrar Pago
                    </button>
                  </div>
                  
                  <div className='alert alert-info'>
                    <span className='material-icons me-2'>info</span>
                    <strong>Sin pagos registrados.</strong> Esta multa aún no ha sido pagada.
                  </div> {/* Estático */}
                  
                  <div className='bg-light p-3 rounded'>
                    <h6>Información de Pago</h6>
                    <div className='row'>
                      <div className='col-md-6'>
                        <p><strong>Monto Total:</strong> ${multa.monto.toLocaleString()}</p>
                        <p><strong>Fecha de Vencimiento:</strong> {fechaVencimiento.toLocaleDateString()}</p>
                      </div>
                      <div className='col-md-6'>
                        <p><strong>Días para Vencimiento:</strong> 10 días</p> {/* Estático */}
                        <p><strong>Recargo por Atraso:</strong> 5% después del vencimiento</p> {/* Estático */}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Apelaciones */}
              {activeTab === 'appeals' && (
                <div className='tab-pane fade'>
                  <div className='d-flex justify-content-between align-items-center mb-3'>
                    <h6 className='mb-0'>Historial de Apelaciones</h6>
                  </div>
                  
                  <div className='alert alert-secondary'>
                    <span className='material-icons me-2'>info</span>
                    <strong>Sin apelaciones presentadas.</strong> Esta multa no ha sido apelada.
                  </div> {/* Estático */}
                  
                  <div className='bg-light p-3 rounded'>
                    <h6>Información sobre Apelaciones</h6>
                    <ul className='mb-0'>
                      <li>El residente tiene derecho a apelar dentro de 15 días de emitida la multa</li>
                      <li>La apelación debe presentarse por escrito con la evidencia correspondiente</li>
                      <li>El administrador tiene 10 días hábiles para responder</li>
                      <li>Plazo de apelación: hasta el {fechaVencimiento.toLocaleDateString()}</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Comunicaciones */}
              {activeTab === 'communications' && (
                <div className='tab-pane fade'>
                  <div className='d-flex justify-content-between align-items-center mb-3'>
                    <h6 className='mb-0'>Historial de Comunicaciones</h6>
                    <button className='btn btn-primary btn-sm' onClick={() => alert('Enviar comunicación')}>
                      <span className='material-icons me-1'>send</span>
                      Enviar Comunicación
                    </button> {/* Estático */}
                  </div>
                  
                  {/* Historial de comunicaciones del historial */}
                  {historial.filter(h => h.accion === 'comunicacion_enviada').map((comm, index) => (
                    <div key={index} className='communication-item'>
                      <div className='communication-header'>
                        <div>
                          <span className={`communication-type ${comm.tipo || 'email'}`}>{comm.tipo === 'email' ? 'Email' : 'Notificación'}</span>
                          <span className='ms-2 fw-bold'>{comm.descripcion || 'Comunicación enviada'}</span>
                        </div>
                        <small className='text-muted'>{new Date(comm.created_at).toLocaleDateString()}</small>
                      </div>
                      <p className='mb-0'>{comm.descripcion || 'Mensaje enviado al residente'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Columna lateral */}
          <div className='col-lg-4'>
            {/* Información de la Unidad */}
            <div className='info-card'>
              <div className='info-card-title'>
                <span className='material-icons'>apartment</span>
                Información de la Unidad
              </div>
              <div className='info-item'>
                <span className='info-label'>Unidad:</span>
                <span className='info-value'>{multa.torre_nombre} - {multa.unidad_numero}</span>
              </div>
              <div className='info-item'>
                <span className='info-label'>Propietario:</span>
                <span className='info-value'>María González</span> {/* Estático */}
              </div>
              <div className='info-item'>
                <span className='info-label'>Email:</span>
                <span className='info-value'>maria.gonzalez@email.com</span> {/* Estático */}
              </div>
              <div className='info-item'>
                <span className='info-label'>Teléfono:</span>
                <span className='info-value'>+56 9 8765 4321</span> {/* Estático */}
              </div>
              <div className='info-item'>
                <span className='info-label'>Tipo:</span>
                <span className='info-value'>Propietario residente</span> {/* Estático */}
              </div>
              <div className='mt-3'>
                <a href='unidad-detalle.html' className='btn btn-outline-primary btn-sm w-100'>
                  <span className='material-icons me-1'>visibility</span>
                  Ver Detalle de Unidad
                </a> {/* Estático */}
              </div>
            </div>

            {/* Estadísticas de Multas */}
            <div className='info-card'>
              <div className='info-card-title'>
                <span className='material-icons'>analytics</span>
                Historial de Multas
              </div>
              <div className='info-item'>
                <span className='info-label'>Total Multas:</span>
                <span className='info-value'>3</span> {/* Estático */}
              </div>
              <div className='info-item'>
                <span className='info-label'>Multas Pagadas:</span>
                <span className='info-value text-success'>1</span> {/* Estático */}
              </div>
              <div className='info-item'>
                <span className='info-label'>Multas Pendientes:</span>
                <span className='info-value text-warning'>2</span> {/* Estático */}
              </div>
              <div className='info-item'>
                <span className='info-label'>Monto Total Pendiente:</span>
                <span className='info-value text-danger'>$170.000</span> {/* Estático */}
              </div>
              <div className='info-item'>
                <span className='info-label'>Última Multa:</span>
                <span className='info-value'>{new Date(multa.fecha).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Timeline de Actividades */}
            <div className='info-card'>
              <div className='info-card-title'>
                <span className='material-icons'>timeline</span>
                Actividades Recientes
              </div>
              <div className='timeline'>
                {historial.slice(0, 3).map((item, index) => (
                  <div key={index} className='timeline-item'>
                    <div className='timeline-content'>
                      <div className='timeline-date'>{new Date(item.created_at).toLocaleDateString()}</div>
                      <div className='timeline-title'>{item.accion}</div>
                      <div className='timeline-description'>{item.descripcion || 'Acción realizada'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para registrar pago */}
      <div className='modal fade' id='paymentModal' tabIndex={-1}>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Registrar Pago - Multa #{multa.numero}</h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal'></button>
            </div>
            <div className='modal-body'>
              <form>
                <div className='mb-3'>
                  <label className='form-label'>Monto Pagado *</label>
                  <div className='input-group'>
                    <span className='input-group-text'>$</span>
                    <input type='number' className='form-control' defaultValue={multa.monto} required />
                  </div>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Fecha de Pago *</label>
                  <input type='date' className='form-control' required />
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Método de Pago *</label>
                  <select className='form-select' required>
                    <option>Efectivo</option>
                    <option>Transferencia</option>
                    <option>Cheque</option>
                    <option>Tarjeta</option>
                    <option>Online</option>
                  </select>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Número de Comprobante</label>
                  <input type='text' className='form-control' placeholder='Número de transacción' />
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Observaciones</label>
                  <textarea className='form-control' rows={3} placeholder='Observaciones...'></textarea>
                </div>
                <div className='mb-3'>
                  <div className='form-check'>
                    <input className='form-check-input' type='checkbox' defaultChecked />
                    <label className='form-check-label'>Enviar confirmación de pago al residente</label>
                  </div>
                </div>
              </form>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>Cancelar</button>
              <button type='button' className='btn btn-success' onClick={() => alert('Pago registrado')}>
                <span className='material-icons me-1'>payment</span>
                Registrar Pago
              </button> {/* Estático */}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para editar multa */}
      <div className='modal fade' id='editModal' tabIndex={-1}>
        <div className='modal-dialog modal-lg'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Editar Multa #{multa.numero}</h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal'></button>
            </div>
            <div className='modal-body'>
              <form>
                <div className='row'>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>Fecha de Infracción</label>
                    <input type='date' className='form-control' defaultValue={new Date(multa.fecha).toISOString().split('T')[0]} />
                  </div>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>Monto de la Multa</label>
                    <div className='input-group'>
                      <span className='input-group-text'>$</span>
                      <input type='number' className='form-control' defaultValue={multa.monto} />
                    </div>
                  </div>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Descripción</label>
                  <textarea className='form-control' rows={4} defaultValue={multa.descripcion}></textarea>
                </div>
                <div className='row'>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>Fecha de Vencimiento</label>
                    <input type='date' className='form-control' defaultValue={fechaVencimiento.toISOString().split('T')[0]} />
                  </div>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>Prioridad</label>
                    <select className='form-select' defaultValue={multa.prioridad}>
                      <option value='baja'>Baja</option>
                      <option value='media'>Media</option>
                      <option value='alta'>Alta</option>
                    </select>
                  </div>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Notas Internas</label>
                  <textarea className='form-control' rows={3} defaultValue='Segunda infracción...'></textarea> {/* Estático */}
                </div>
              </form>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>Cancelar</button>
              <button type='button' className='btn btn-primary' onClick={() => alert('Multa actualizada')}>
                <span className='material-icons me-1'>save</span>
                Guardar Cambios
              </button> {/* Estático */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MultaDetallePage;