import React, { useState } from 'react';

import AmountCell from './AmountCell';
import { Cargo } from './CargoCard';
import PaymentProgress from './PaymentProgress';
import StatusBadge from './StatusBadge';
import Timeline, { TimelineItem } from './Timeline';
import TypeBadge from './TypeBadge';

export interface PaymentRecord {
  id: string;
  fecha: Date;
  monto: number;
  metodo: string;
  referencia: string;
  estado: 'completed' | 'pending' | 'failed';
  observaciones?: string;
}

export interface Document {
  id: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  fechaSubida: Date;
  url: string;
}

export interface CargoDetalleProps {
  cargo: Cargo;
  pagos?: PaymentRecord[];
  documentos?: Document[];
  historial?: TimelineItem[];
  className?: string;
}

// Mock data for demonstration
const mockPayments: PaymentRecord[] = [
  {
    id: 'PAY-001',
    fecha: new Date('2024-01-10'),
    monto: 125000,
    metodo: 'Transferencia Bancaria',
    referencia: 'TRF-001-2024',
    estado: 'completed',
    observaciones: 'Pago parcial inicial',
  },
  {
    id: 'PAY-002',
    fecha: new Date('2024-01-25'),
    monto: 125000,
    metodo: 'PSE',
    referencia: 'PSE-002-2024',
    estado: 'completed',
    observaciones: 'Completar pago restante',
  },
];

const mockDocuments: Document[] = [
  {
    id: 'DOC-001',
    nombre: 'Factura_Administracion_Enero_2024.pdf',
    tipo: 'PDF',
    tamaño: 256789,
    fechaSubida: new Date('2024-01-01'),
    url: '/documents/factura-adm-ene-2024.pdf',
  },
  {
    id: 'DOC-002',
    nombre: 'Soporte_Pago_Transferencia.jpg',
    tipo: 'Image',
    tamaño: 98432,
    fechaSubida: new Date('2024-01-10'),
    url: '/documents/soporte-pago-001.jpg',
  },
];

const mockTimeline: TimelineItem[] = [
  {
    id: 'TL-001',
    type: 'info',
    title: 'Cargo Creado',
    content: 'Se creó el cargo de administración para enero 2024',
    date: new Date('2024-01-01 09:00:00'),
    user: 'Sistema Admin',
  },
  {
    id: 'TL-002',
    type: 'success',
    title: 'Cargo Aprobado',
    content: 'El cargo fue aprobado por el administrador',
    date: new Date('2024-01-02 14:30:00'),
    user: 'María González',
  },
  {
    id: 'TL-003',
    type: 'success',
    title: 'Pago Parcial Recibido',
    content: 'Se recibió pago parcial por $125.000 vía transferencia bancaria',
    date: new Date('2024-01-10 16:45:00'),
    user: 'Sistema Pagos',
  },
  {
    id: 'TL-004',
    type: 'success',
    title: 'Pago Completado',
    content: 'Se completó el pago total del cargo vía PSE',
    date: new Date('2024-01-25 11:20:00'),
    user: 'Sistema Pagos',
  },
];

export default function CargoDetalle({
  cargo,
  pagos = mockPayments,
  documentos = mockDocuments,
  historial = mockTimeline,
  className = '',
}: CargoDetalleProps) {
  const [activeTab, setActiveTab] = useState('detalles');

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatPeriod = (period: string): string => {
    const [year, month] = period.split('-');
    if (!year || !month) {
      return period;
    }
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
    }).format(new Date(parseInt(year), parseInt(month) - 1));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getTotalPaid = (): number => {
    return pagos
      .filter(pago => pago.estado === 'completed')
      .reduce((total, pago) => total + pago.monto, 0);
  };

  const isOverdue = (): boolean => {
    return new Date() > cargo.fechaVencimiento && cargo.estado !== 'paid';
  };

  const handleRegisterPayment = () => {
    // eslint-disable-next-line no-console
    console.log('Register payment for cargo:', cargo.id);
    // TODO: Implement payment registration
  };

  const handleSendReminder = () => {
    // eslint-disable-next-line no-console
    console.log('Send reminder for cargo:', cargo.id);
    // TODO: Implement send reminder
  };

  const handleEditCargo = () => {
    // eslint-disable-next-line no-console
    console.log('Edit cargo:', cargo.id);
    // TODO: Implement edit functionality
  };

  const handleDuplicateCargo = () => {
    // eslint-disable-next-line no-console
    console.log('Duplicate cargo:', cargo.id);
    // TODO: Implement duplicate functionality
  };

  const handleCancelCargo = () => {
    if (confirm('¿Está seguro de que desea cancelar este cargo?')) {
      // eslint-disable-next-line no-console
      console.log('Cancel cargo:', cargo.id);
      // TODO: Implement cancel functionality
    }
  };

  const handlePrintCargo = () => {
    window.print();
  };

  const handleExportCargo = () => {
    // eslint-disable-next-line no-console
    console.log('Export cargo:', cargo.id);
    // TODO: Implement export functionality
  };

  const handleUploadDocument = () => {
    // eslint-disable-next-line no-console
    console.log('Upload document for cargo:', cargo.id);
    // TODO: Implement document upload
  };

  const handleViewDocument = (docId: string) => {
    const doc = documentos.find(d => d.id === docId);
    if (doc) {
      window.open(doc.url, '_blank');
    }
  };

  const handleDownloadDocument = (docId: string) => {
    const doc = documentos.find(d => d.id === docId);
    if (doc) {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.nombre;
      link.click();
    }
  };

  return (
    <div className={`cargo-detalle ${className}`}>
      {/* Header */}
      <div className='charge-header'>
        <div className='d-flex justify-content-between align-items-start mb-3'>
          <div>
            <h1 className='charge-title'>{cargo.concepto}</h1>
            <p className='charge-subtitle'>
              {cargo.descripcion || 'Sin descripción'}
            </p>
            <div className='charge-id-badge'>#{cargo.id}</div>
          </div>
          <div className='d-flex gap-2'>
            <TypeBadge type={cargo.tipo} />
            <StatusBadge status={cargo.estado} />
          </div>
        </div>

        <div className='charge-stats'>
          <div className='stat-item'>
            <div className='stat-number'>{cargo.unidad}</div>
            <div className='stat-label'>Unidad</div>
          </div>
          <div className='stat-item'>
            <div className='stat-number'>{formatPeriod(cargo.periodo)}</div>
            <div className='stat-label'>Período</div>
          </div>
          <div className='stat-item'>
            <div className='stat-number'>
              <AmountCell amount={cargo.monto} />
            </div>
            <div className='stat-label'>Monto Total</div>
          </div>
          <div className='stat-item'>
            <div className='stat-number'>
              <AmountCell amount={getTotalPaid()} />
            </div>
            <div className='stat-label'>Pagado</div>
          </div>
          <div className='stat-item'>
            <div className='stat-number'>
              <AmountCell amount={cargo.monto - getTotalPaid()} />
            </div>
            <div className='stat-label'>Pendiente</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='row mb-4'>
        <div className='col-12'>
          <div className='d-flex flex-wrap gap-2'>
            <button
              className='action-btn primary'
              onClick={handleRegisterPayment}
            >
              <i className='material-icons me-2'>payment</i>
              Registrar Pago
            </button>
            <button className='action-btn outline' onClick={handleSendReminder}>
              <i className='material-icons me-2'>notifications</i>
              Enviar Recordatorio
            </button>
            <button className='action-btn secondary' onClick={handleEditCargo}>
              <i className='material-icons me-2'>edit</i>
              Editar
            </button>
            <button
              className='action-btn outline'
              onClick={handleDuplicateCargo}
            >
              <i className='material-icons me-2'>content_copy</i>
              Duplicar
            </button>
            <button className='action-btn outline' onClick={handlePrintCargo}>
              <i className='material-icons me-2'>print</i>
              Imprimir
            </button>
            <button className='action-btn outline' onClick={handleExportCargo}>
              <i className='material-icons me-2'>download</i>
              Exportar
            </button>
            <button className='action-btn danger' onClick={handleCancelCargo}>
              <i className='material-icons me-2'>cancel</i>
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className='nav nav-tabs mb-4'>
        <li className='nav-item'>
          <button
            className={`nav-link ${activeTab === 'detalles' ? 'active' : ''}`}
            onClick={() => setActiveTab('detalles')}
          >
            <i className='material-icons me-2'>info</i>
            Detalles
          </button>
        </li>
        <li className='nav-item'>
          <button
            className={`nav-link ${activeTab === 'pagos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pagos')}
          >
            <i className='material-icons me-2'>payments</i>
            Historial de Pagos ({pagos.length})
          </button>
        </li>
        <li className='nav-item'>
          <button
            className={`nav-link ${activeTab === 'documentos' ? 'active' : ''}`}
            onClick={() => setActiveTab('documentos')}
          >
            <i className='material-icons me-2'>description</i>
            Documentos ({documentos.length})
          </button>
        </li>
        <li className='nav-item'>
          <button
            className={`nav-link ${activeTab === 'historial' ? 'active' : ''}`}
            onClick={() => setActiveTab('historial')}
          >
            <i className='material-icons me-2'>history</i>
            Actividad ({historial.length})
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className='tab-content'>
        {/* Detalles Tab */}
        {activeTab === 'detalles' && (
          <div className='row'>
            <div className='col-lg-8'>
              <div className='info-card'>
                <div className='info-card-header'>
                  <h5 className='info-card-title'>
                    <i className='material-icons'>receipt</i>
                    Información del Cargo
                  </h5>
                </div>

                <div className='info-row'>
                  <span className='info-label'>ID del Cargo:</span>
                  <span className='info-value'>{cargo.id}</span>
                </div>

                <div className='info-row'>
                  <span className='info-label'>Concepto:</span>
                  <span className='info-value'>{cargo.concepto}</span>
                </div>

                {cargo.descripcion && (
                  <div className='info-row'>
                    <span className='info-label'>Descripción:</span>
                    <span className='info-value'>{cargo.descripcion}</span>
                  </div>
                )}

                <div className='info-row'>
                  <span className='info-label'>Tipo:</span>
                  <span className='info-value'>
                    <TypeBadge type={cargo.tipo} />
                  </span>
                </div>

                <div className='info-row'>
                  <span className='info-label'>Estado:</span>
                  <span className='info-value'>
                    <StatusBadge status={cargo.estado} />
                  </span>
                </div>

                <div className='info-row'>
                  <span className='info-label'>Unidad:</span>
                  <span className='info-value'>{cargo.unidad}</span>
                </div>

                <div className='info-row'>
                  <span className='info-label'>Período:</span>
                  <span className='info-value'>
                    {formatPeriod(cargo.periodo)}
                  </span>
                </div>

                <div className='info-row'>
                  <span className='info-label'>Cuenta de Costo:</span>
                  <span className='info-value'>{cargo.cuentaCosto}</span>
                </div>

                <div className='info-row'>
                  <span className='info-label'>Fecha de Creación:</span>
                  <span className='info-value'>
                    {formatDate(cargo.fechaCreacion)}
                  </span>
                </div>

                <div className='info-row'>
                  <span className='info-label'>Fecha de Vencimiento:</span>
                  <span
                    className={`info-value ${isOverdue() ? 'text-danger fw-bold' : ''}`}
                  >
                    {formatDate(cargo.fechaVencimiento)}
                    {isOverdue() && (
                      <i className='material-icons ms-1 text-danger'>warning</i>
                    )}
                  </span>
                </div>

                {cargo.observaciones && (
                  <div className='info-row'>
                    <span className='info-label'>Observaciones:</span>
                    <span className='info-value'>{cargo.observaciones}</span>
                  </div>
                )}
              </div>
            </div>

            <div className='col-lg-4'>
              <div className='info-card'>
                <div className='info-card-header'>
                  <h5 className='info-card-title'>
                    <i className='material-icons'>account_balance_wallet</i>
                    Información Financiera
                  </h5>
                </div>

                <div className='info-row'>
                  <span className='info-label'>Monto Total:</span>
                  <span className='info-value money'>
                    <AmountCell amount={cargo.monto} />
                  </span>
                </div>

                <div className='info-row'>
                  <span className='info-label'>Monto Aplicado:</span>
                  <span className='info-value money'>
                    <AmountCell amount={cargo.montoAplicado} />
                  </span>
                </div>

                <div className='info-row'>
                  <span className='info-label'>Total Pagado:</span>
                  <span className='info-value money positive'>
                    <AmountCell amount={getTotalPaid()} />
                  </span>
                </div>

                <div className='info-row'>
                  <span className='info-label'>Saldo Pendiente:</span>
                  <span
                    className={`info-value money ${cargo.monto - getTotalPaid() > 0 ? 'negative' : 'positive'}`}
                  >
                    <AmountCell amount={cargo.monto - getTotalPaid()} />
                  </span>
                </div>

                <div className='mt-4'>
                  <PaymentProgress
                    totalAmount={cargo.monto}
                    paidAmount={getTotalPaid()}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagos Tab */}
        {activeTab === 'pagos' && (
          <div className='info-card'>
            <div className='info-card-header'>
              <h5 className='info-card-title'>
                <i className='material-icons'>payment</i>
                Historial de Pagos
              </h5>
              <button
                className='btn btn-primary btn-sm'
                onClick={handleRegisterPayment}
              >
                <i className='material-icons me-1'>add</i>
                Nuevo Pago
              </button>
            </div>

            {pagos.length === 0 ? (
              <div className='text-center py-4'>
                <i className='material-icons display-4 text-muted'>payment</i>
                <h5 className='mt-3'>No hay pagos registrados</h5>
                <p className='text-muted'>
                  Este cargo aún no tiene pagos asociados.
                </p>
              </div>
            ) : (
              <div className='payment-history-table'>
                <div className='table-responsive'>
                  <table className='table'>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Método</th>
                        <th>Referencia</th>
                        <th>Estado</th>
                        <th>Observaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagos.map(pago => (
                        <tr key={pago.id}>
                          <td>{formatDate(pago.fecha)}</td>
                          <td>
                            <AmountCell amount={pago.monto} />
                          </td>
                          <td>{pago.metodo}</td>
                          <td>
                            <span className='badge bg-secondary'>
                              {pago.referencia}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                pago.estado === 'completed'
                                  ? 'bg-success'
                                  : pago.estado === 'pending'
                                    ? 'bg-warning'
                                    : 'bg-danger'
                              }`}
                            >
                              {pago.estado === 'completed'
                                ? 'Completado'
                                : pago.estado === 'pending'
                                  ? 'Pendiente'
                                  : 'Fallido'}
                            </span>
                          </td>
                          <td>{pago.observaciones || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documentos Tab */}
        {activeTab === 'documentos' && (
          <div className='info-card'>
            <div className='info-card-header'>
              <h5 className='info-card-title'>
                <i className='material-icons'>folder</i>
                Documentos Adjuntos
              </h5>
              <button
                className='btn btn-primary btn-sm'
                onClick={handleUploadDocument}
              >
                <i className='material-icons me-1'>upload</i>
                Subir Documento
              </button>
            </div>

            {documentos.length === 0 ? (
              <div className='text-center py-4'>
                <i className='material-icons display-4 text-muted'>
                  description
                </i>
                <h5 className='mt-3'>No hay documentos</h5>
                <p className='text-muted'>
                  No se han subido documentos para este cargo.
                </p>
              </div>
            ) : (
              <div className='row'>
                {documentos.map(doc => (
                  <div key={doc.id} className='col-md-6 col-lg-4 mb-3'>
                    <div className='document-item'>
                      <div className='document-icon'>
                        <i className='material-icons'>
                          {doc.tipo === 'PDF'
                            ? 'picture_as_pdf'
                            : doc.tipo === 'Image'
                              ? 'image'
                              : 'description'}
                        </i>
                      </div>
                      <div className='document-info'>
                        <div className='document-name'>{doc.nombre}</div>
                        <div className='document-meta'>
                          {formatFileSize(doc.tamaño)} •{' '}
                          {formatDate(doc.fechaSubida)}
                        </div>
                      </div>
                      <div className='document-actions'>
                        <button
                          className='btn btn-outline-primary btn-sm'
                          onClick={() => handleViewDocument(doc.id)}
                        >
                          <i className='material-icons'>visibility</i>
                        </button>
                        <button
                          className='btn btn-outline-secondary btn-sm'
                          onClick={() => handleDownloadDocument(doc.id)}
                        >
                          <i className='material-icons'>download</i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Historial Tab */}
        {activeTab === 'historial' && (
          <div className='info-card'>
            <div className='info-card-header'>
              <h5 className='info-card-title'>
                <i className='material-icons'>history</i>
                Historial de Actividad
              </h5>
            </div>

            <Timeline items={historial} />
          </div>
        )}
      </div>
    </div>
  );
}
