import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';

const MultaDetallePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data
  const fine = {
    id: 'M-2024-089',
    violation: 'Ruido excesivo después de las 22:00',
    unit: 'A-101',
    resident: 'Juan Pérez',
    amount: 50000,
    status: 'pending',
    date: '2024-09-15',
    dueDate: '2024-10-15',
    description: 'El residente fue advertido en múltiples ocasiones sobre el ruido excesivo generado por fiestas nocturnas.',
    priority: 'medium'
  };

  const timeline = [
    {
      date: '2024-09-15 14:30',
      title: 'Multa creada',
      description: 'Multa generada automáticamente por el sistema de monitoreo',
      type: 'success'
    },
    {
      date: '2024-09-16 09:00',
      title: 'Notificación enviada',
      description: 'Correo electrónico y SMS enviados al residente',
      type: 'success'
    },
    {
      date: '2024-09-20 16:45',
      title: 'Recordatorio enviado',
      description: 'Recordatorio automático de pago pendiente',
      type: 'warning'
    }
  ];

  const payments = [
    {
      date: '2024-09-16',
      amount: 0,
      method: 'N/A',
      status: 'pending',
      reference: 'N/A'
    }
  ];

  const communications = [
    {
      date: '2024-09-16 09:00',
      type: 'email',
      title: 'Notificación de multa',
      content: 'Se le informa que se ha generado una multa por ruido excesivo...'
    },
    {
      date: '2024-09-16 09:05',
      type: 'sms',
      title: 'Recordatorio de multa',
      content: 'Tiene una multa pendiente por $50.000. Fecha límite: 15/10/2024'
    }
  ];

  const getStatusBadge = (status: string) => {
    const classes = {
      pending: 'fine-status pending',
      paid: 'fine-status paid',
      overdue: 'fine-status overdue',
      appealed: 'fine-status appealed',
      cancelled: 'fine-status cancelled'
    };
    return classes[status as keyof typeof classes] || 'fine-status pending';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pendiente',
      paid: 'Pagada',
      overdue: 'Vencida',
      appealed: 'Apelada',
      cancelled: 'Cancelada'
    };
    return texts[status as keyof typeof texts] || 'Pendiente';
  };

  return (
    <Layout title={`Detalle de Multa ${fine.id}`}>
      <div className='container-fluid p-4'>
        {/* Header */}
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <div className='d-flex align-items-center'>
            <button className='btn btn-link me-3' onClick={() => window.history.back()}>
              <i className='material-icons'>arrow_back</i>
            </button>
            <div>
              <h1 className='h3 mb-0'>Multa {fine.id}</h1>
              <small className='text-muted'>Torre Norte - Unidad 4A • Ruidos molestos</small>
            </div>
          </div>
          <div className='text-end'>
            <div className='h4 mb-0 text-primary'>$85.000</div>
            <small className='text-muted'>Monto a pagar</small>
          </div>
        </div>

        {/* Status badge and action buttons */}
        <div className='d-flex justify-content-between align-items-start mb-4'>
          <div>
            <div className={getStatusBadge(fine.status)}>
              <i className='material-icons me-2'>schedule</i>
              {getStatusText(fine.status)}
            </div>
            <h2 className='h4 mb-1'>Multa por Ruidos Molestos</h2>
            <p className='text-muted mb-0'>Emitida el 10/09/2024 • Vence el 25/09/2024</p>
          </div>
          <div className='fine-actions-panel'>
            {/* Botón principal más prominente */}
            <div className='primary-fine-action mb-3'>
              <button className='btn btn-fine-primary btn-lg shadow-sm' data-bs-toggle='modal' data-bs-target='#paymentModal'>
                <i className='material-icons me-2'>credit_card</i>
                <span className='fw-semibold'>Registrar Pago</span>
              </button>
            </div>
            
            {/* Botones secundarios en fila */}
            <div className='secondary-fine-actions d-flex flex-wrap gap-3 justify-content-center'>
              <button className='btn btn-fine-warning shadow-sm' onClick={() => alert('Recordatorio enviado')}>
                <i className='material-icons me-2'>send</i>
                <span>Enviar Recordatorio</span>
              </button>
              <button className='btn btn-fine-info shadow-sm' data-bs-toggle='modal' data-bs-target='#editModal'>
                <i className='material-icons me-2'>edit_document</i>
                <span className=''>Editar Multa</span>
              </button>
              <button className='btn btn-fine-danger shadow-sm' onClick={() => alert('¿Anular multa?')}>
                <i className='material-icons me-2'>delete_sweep</i>
                <span>Anular Multa</span>
              </button>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-lg-8'>

        {/* Tabs */}
        <ul className='nav nav-tabs' role='tablist'>
          <li className='nav-item'>
            <a
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              href='#overview'
              onClick={() => setActiveTab('overview')}
            >
              <i className='material-icons me-2'>info</i>
              Información General
            </a>
          </li>
          <li className='nav-item'>
            <a
              className={`nav-link ${activeTab === 'evidence' ? 'active' : ''}`}
              href='#evidence'
              onClick={() => setActiveTab('evidence')}
            >
              <i className='material-icons me-2'>attach_file</i>
              Evidencia
            </a>
          </li>
          <li className='nav-item'>
            <a
              className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
              href='#payments'
              onClick={() => setActiveTab('payments')}
            >
              <i className='material-icons me-2'>payment</i>
              Pagos
            </a>
          </li>
          <li className='nav-item'>
            <a
              className={`nav-link ${activeTab === 'appeals' ? 'active' : ''}`}
              href='#appeals'
              onClick={() => setActiveTab('appeals')}
            >
              <i className='material-icons me-2'>gavel</i>
              Apelaciones
            </a>
          </li>
          <li className='nav-item'>
            <a
              className={`nav-link ${activeTab === 'communications' ? 'active' : ''}`}
              href='#communications'
              onClick={() => setActiveTab('communications')}
            >
              <i className='material-icons me-2'>message</i>
              Comunicaciones
            </a>
          </li>
        </ul>

        <div className='tab-content'>
          {/* Overview Tab */}
          {/* {activeTab === 'overview' && (
            <div>
              <div className='row'>
                <div className='col-md-6'>
                  <h6 className='mb-3'>Detalles de la Infracción</h6>
                  <div className='info-item'>
                    <span className='info-label'>Fecha y Hora:</span>
                    <span className='info-value'>10/09/2024 - 23:30</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Ubicación:</span>
                    <span className='info-value'>Unidad 4A - Torre Norte</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Tipo de Infracción:</span>
                    <span className='info-value'>Ruidos molestos en horario de descanso</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Reportado por:</span>
                    <span className='info-value'>Conserje nocturno</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Prioridad:</span>
                    <span className='info-value'>
                      <span className='badge bg-warning'>Media</span>
                    </span>
                  </div>
                </div>
                <div className='col-md-6'>
                  <h6 className='mb-3'>Información del Pago</h6>
                  <div className='info-item'>
                    <span className='info-label'>Monto Base:</span>
                    <span className='info-value'>$85.000</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Recargos:</span>
                    <span className='info-value'>$0</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Total a Pagar:</span>
                    <span className='info-value'><strong>$85.000</strong></span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Fecha de Vencimiento:</span>
                    <span className='info-value'>25/09/2024</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Días Restantes:</span>
                    <span className='info-value text-warning'><strong>10 días</strong></span>
                  </div>
                </div>
              </div>
              
              <div className='mt-4'>
                <h6 className='mb-3'>Descripción Detallada</h6>
                <div className='bg-light p-3 rounded'>
                  <p className='mb-0'>
                    Según reporte del conserje nocturno, se registraron ruidos molestos provenientes de la unidad 4A durante 
                    el horario de descanso establecido en el reglamento (22:00 - 08:00). Los ruidos consistían en música a 
                    alto volumen y voces que se escuchaban desde el pasillo. Se realizaron dos llamadas de atención verbales 
                    sin obtener respuesta antes de proceder con la multa.
                  </p>
                </div>
              </div>
              
              <div className='mt-4'>
                <h6 className='mb-3'>Notas Internas</h6>
                <div className='bg-light p-3 rounded'>
                  <p className='mb-0'>
                    <strong>Administrador:</strong> Segunda infracción del mismo tipo en 3 meses. 
                    Considerar seguimiento adicional si persiste el comportamiento.
                  </p>
                </div>
              </div>
            </div>
          )} */}

          {/* Evidence Tab */}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <h5>Historial de pagos</h5>
                <button className='btn btn-fine-success btn-sm shadow-sm' data-bs-toggle='modal' data-bs-target='#paymentModal'>
                  <i className='material-icons me-2'>credit_card</i>
                  <span className='fw-medium'>Registrar pago</span>
                </button>
              </div>
              <div className='table-responsive'>
                <table className='table table-hover'>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Método</th>
                      <th>Referencia</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr key={index}>
                        <td>{payment.date}</td>
                        <td>${payment.amount.toLocaleString()}</td>
                        <td>{payment.method}</td>
                        <td>{payment.reference}</td>
                        <td>
                          <span className='badge bg-warning'>{payment.status}</span>
                        </td>
                        <td>
                          <button className='btn btn-sm btn-outline-primary'>
                            <i className='material-icons'>receipt</i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Appeals Tab */}
          {activeTab === 'appeals' && (
            <div>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <h6 className='mb-0'>Historial de Apelaciones</h6>
              </div>
              
              <div className='alert alert-secondary'>
                <span className='material-icons me-2'>info</span>
                <strong>Sin apelaciones presentadas.</strong> Esta multa no ha sido apelada.
              </div>
              
              <div className='bg-light p-3 rounded'>
                <h6>Información sobre Apelaciones</h6>
                <ul className='mb-0'>
                  <li>El residente tiene derecho a apelar dentro de 15 días de emitida la multa</li>
                  <li>La apelación debe presentarse por escrito con la evidencia correspondiente</li>
                  <li>El administrador tiene 10 días hábiles para responder</li>
                  <li>Plazo de apelación: hasta el 25/09/2024</li>
                </ul>
              </div>
            </div>
          )}

          {/* Communications Tab */}
          {activeTab === 'communications' && (
            <div>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <h5>Comunicaciones</h5>
                <button className='btn btn-fine-info btn-sm shadow-sm'>
                  <i className='material-icons me-2'>send</i>
                  <span className='fw-medium'>Enviar mensaje</span>
                </button>
              </div>
              <div className='timeline'>
                {communications.map((comm, index) => (
                  <div key={index} className='timeline-item'>
                    <div className='timeline-content'>
                      <div className='timeline-date'>{comm.date}</div>
                      <div className='timeline-title'>
                        <span className={`communication-type ${comm.type}`}>
                          <i className='material-icons me-1'>
                            {comm.type === 'email' ? 'email' : comm.type === 'sms' ? 'sms' : 'notifications'}
                          </i>
                          {comm.title}
                        </span>
                      </div>
                      <div className='timeline-description'>{comm.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Appeal section */}
        {fine.status === 'pending' && (
          <div className='appeal-section mt-4'>
            <div className='appeal-header'>
              <h5>
                <i className='material-icons me-2'>gavel</i>
                Apelación
              </h5>
              <p>Si considera que esta multa es injusta, puede presentar una apelación.</p>
            </div>
            <div className='appeal-status'>
              <span className='badge bg-secondary'>Sin apelación</span>
            </div>
            <button className='btn btn-fine-warning shadow-sm'>
              <i className='material-icons me-2'>gavel</i>
              <span className='fw-medium'>Presentar apelación</span>
            </button>
          </div>
        )}
      </div>
    </div>
  </div>

      {/* Sidebar */}
      {/* <div className='col-lg-4'> ... </div> */}


      {/* Modal para registrar pago */}
      <div className='modal fade' id='paymentModal' tabIndex={-1}>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Registrar Pago</h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal'></button>
            </div>
            <div className='modal-body'>
              <form>
                <div className='mb-3'>
                  <label className='form-label'>Monto</label>
                  <input type='number' className='form-control' placeholder='Ingrese el monto' />
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Fecha de pago</label>
                  <input type='date' className='form-control' />
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Método de pago</label>
                  <select className='form-select'>
                    <option>Efectivo</option>
                    <option>Transferencia</option>
                    <option>Tarjeta de crédito</option>
                  </select>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Referencia</label>
                  <input type='text' className='form-control' placeholder='Número de referencia' />
                </div>
              </form>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>Cancelar</button>
              <button type='button' className='btn btn-primary'>Registrar Pago</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para editar multa */}
      <div className='modal fade' id='editModal' tabIndex={-1}>
        <div className='modal-dialog modal-lg'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Editar Multa</h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal'></button>
            </div>
            <div className='modal-body'>
              <form>
                <div className='mb-3'>
                  <label className='form-label'>Descripción</label>
                  <textarea className='form-control' rows={3} defaultValue={fine.description}></textarea>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Monto</label>
                  <input type='number' className='form-control' defaultValue={fine.amount} />
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Fecha de vencimiento</label>
                  <input type='date' className='form-control' defaultValue={fine.dueDate} />
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Prioridad</label>
                  <select className='form-select' defaultValue={fine.priority}>
                    <option value='low'>Baja</option>
                    <option value='medium'>Media</option>
                    <option value='high'>Alta</option>
                  </select>
                </div>
              </form>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>Cancelar</button>
              <button type='button' className='btn btn-primary'>Guardar Cambios</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MultaDetallePage;