import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useRef } from 'react';

import { TypeBadge, FileIcon } from '@/components/documentos';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Provider {
  id: string;
  name: string;
  rut: string;
  email: string;
  phone: string;
}

interface AttachedFile {
  id: string;
  file: File;
  progress: number;
  uploaded: boolean;
}

export default function NuevoDocumentoCompra() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documentType, setDocumentType] = useState<
    'invoice' | 'receipt' | 'quote' | 'order'
  >('invoice');
  const [documentNumber, setDocumentNumber] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [documentDate, setDocumentDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<DocumentItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(19);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [notes, setNotes] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mock providers
  const providers: Provider[] = [
    {
      id: '1',
      name: 'Empresa de Servicios ABC',
      rut: '12.345.678-9',
      email: 'contacto@abc.cl',
      phone: '+56 9 1234 5678',
    },
    {
      id: '2',
      name: 'Ferretería El Constructor',
      rut: '98.765.432-1',
      email: 'ventas@constructor.cl',
      phone: '+56 9 8765 4321',
    },
    {
      id: '3',
      name: 'Pinturas y Acabados Ltda.',
      rut: '55.444.333-2',
      email: 'info@pinturas.cl',
      phone: '+56 9 5544 3332',
    },
    {
      id: '4',
      name: 'Suministros Industriales SA',
      rut: '11.222.333-4',
      email: 'pedidos@suministros.cl',
      phone: '+56 9 1122 3334',
    },
  ];

  const costCenters = [
    { id: '1', name: 'Mantenimiento General', icon: 'handyman' },
    { id: '2', name: 'Servicios Básicos', icon: 'electric_bolt' },
    { id: '3', name: 'Seguridad', icon: 'security' },
    { id: '4', name: 'Jardines y Áreas Comunes', icon: 'park' },
    { id: '5', name: 'Administración', icon: 'business' },
  ];

  const addItem = () => {
    const newItem: DocumentItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (
    id: string,
    field: keyof DocumentItem,
    value: string | number,
  ) => {
    setItems(
      items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      }),
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const newFiles: AttachedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      uploaded: false,
    }));

    setAttachedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach(uploadFile => {
      const interval = setInterval(() => {
        setAttachedFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, progress: Math.min(f.progress + 20, 100) }
              : f,
          ),
        );
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        setAttachedFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id ? { ...f, progress: 100, uploaded: true } : f,
          ),
        );
      }, 1000);
    });
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {return '0 Bytes';}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentNumber) {
      alert('Debes ingresar el número del documento');
      return;
    }

    if (!selectedProvider) {
      alert('Debes seleccionar un proveedor');
      return;
    }

    if (!documentDate) {
      alert('Debes ingresar la fecha del documento');
      return;
    }

    if (items.some(item => !item.description)) {
      alert('Todos los ítems deben tener descripción');
      return;
    }

    setSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      setSubmitting(false);
      alert('Documento de compra creado exitosamente');
      router.push('/documentos-compra');
    }, 2000);
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nuevo Documento de Compra — Cuentas Claras</title>
      </Head>

      <Layout title='Nuevo Documento de Compra'>
        <div className='container-fluid py-4'>
          {/* Header */}
          <div className='d-flex align-items-center mb-4'>
            <Link
              href='/documentos-compra'
              className='btn btn-outline-secondary me-3'
            >
              <i className='material-icons me-2'>arrow_back</i>
              Volver
            </Link>
            <div>
              <h1 className='h3 mb-1'>Crear Documento de Compra</h1>
              <p className='text-muted mb-0'>
                Registra una nueva factura, boleta, cotización u orden de compra
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='row'>
              <div className='col-lg-8'>
                {/* Document Information */}
                <div className='form-card card shadow-sm mb-4'>
                  <div className='card-body'>
                    <div className='form-section-title d-flex align-items-center mb-4'>
                      <i className='material-icons me-2 text-primary'>
                        receipt
                      </i>
                      <h5 className='mb-0'>Información del Documento</h5>
                    </div>

                    <div className='row g-3'>
                      <div className='col-md-3'>
                        <label className='form-label'>
                          Tipo de documento *
                        </label>
                        <select
                          className='form-select'
                          value={documentType}
                          onChange={e => setDocumentType(e.target.value as any)}
                          required
                        >
                          <option value='invoice'>Factura</option>
                          <option value='receipt'>Boleta</option>
                          <option value='quote'>Cotización</option>
                          <option value='order'>Orden de Compra</option>
                        </select>
                      </div>

                      <div className='col-md-3'>
                        <label className='form-label'>Número *</label>
                        <input
                          type='text'
                          className='form-control'
                          placeholder='FC-2024-001'
                          value={documentNumber}
                          onChange={e => setDocumentNumber(e.target.value)}
                          required
                        />
                      </div>

                      <div className='col-md-3'>
                        <label className='form-label'>Fecha *</label>
                        <input
                          type='date'
                          className='form-control'
                          value={documentDate}
                          onChange={e => setDocumentDate(e.target.value)}
                          required
                        />
                      </div>

                      <div className='col-md-3'>
                        <label className='form-label'>Fecha vencimiento</label>
                        <input
                          type='date'
                          className='form-control'
                          value={dueDate}
                          onChange={e => setDueDate(e.target.value)}
                        />
                      </div>

                      <div className='col-md-6'>
                        <label className='form-label'>Proveedor *</label>
                        <select
                          className='form-select'
                          value={selectedProvider}
                          onChange={e => setSelectedProvider(e.target.value)}
                          required
                        >
                          <option value=''>Seleccionar proveedor</option>
                          {providers.map(provider => (
                            <option key={provider.id} value={provider.id}>
                              {provider.name} - {provider.rut}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className='col-md-6'>
                        <label className='form-label'>Centro de costo</label>
                        <select
                          className='form-select'
                          value={costCenter}
                          onChange={e => setCostCenter(e.target.value)}
                        >
                          <option value=''>Sin centro de costo</option>
                          {costCenters.map(center => (
                            <option key={center.id} value={center.id}>
                              {center.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className='col-12'>
                        <label className='form-label'>
                          Descripción general
                        </label>
                        <textarea
                          className='form-control'
                          rows={2}
                          placeholder='Describe brevemente el propósito de este documento...'
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className='form-card card shadow-sm mb-4'>
                  <div className='card-body'>
                    <div className='form-section-title d-flex align-items-center justify-content-between mb-4'>
                      <div className='d-flex align-items-center'>
                        <i className='material-icons me-2 text-primary'>list</i>
                        <h5 className='mb-0'>Ítems del Documento</h5>
                      </div>
                      <button
                        type='button'
                        className='btn btn-outline-primary btn-sm'
                        onClick={addItem}
                      >
                        <i className='material-icons me-2'>add</i>
                        Agregar ítem
                      </button>
                    </div>

                    <div className='table-responsive'>
                      <table className='table items-table'>
                        <thead>
                          <tr>
                            <th style={{ width: '40%' }}>Descripción</th>
                            <th style={{ width: '15%' }}>Cantidad</th>
                            <th style={{ width: '20%' }}>Precio Unitario</th>
                            <th style={{ width: '20%' }}>Total</th>
                            <th style={{ width: '5%' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr key={item.id}>
                              <td>
                                <input
                                  type='text'
                                  className='form-control'
                                  placeholder='Descripción del ítem...'
                                  value={item.description}
                                  onChange={e =>
                                    updateItem(
                                      item.id,
                                      'description',
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type='number'
                                  className='form-control'
                                  min='1'
                                  value={item.quantity}
                                  onChange={e =>
                                    updateItem(
                                      item.id,
                                      'quantity',
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type='number'
                                  className='form-control'
                                  min='0'
                                  step='0.01'
                                  value={item.unitPrice}
                                  onChange={e =>
                                    updateItem(
                                      item.id,
                                      'unitPrice',
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type='text'
                                  className='form-control'
                                  value={formatCurrency(item.total)}
                                  readOnly
                                />
                              </td>
                              <td>
                                {items.length > 1 && (
                                  <button
                                    type='button'
                                    className='btn btn-sm btn-outline-danger'
                                    onClick={() => removeItem(item.id)}
                                  >
                                    <i className='material-icons'>delete</i>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals Summary */}
                    <div className='totals-summary'>
                      <div className='summary-row'>
                        <span>Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className='summary-row'>
                        <span>IVA ({taxRate}%):</span>
                        <span>{formatCurrency(taxAmount)}</span>
                      </div>
                      <div className='summary-row total'>
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className='form-card card shadow-sm mb-4'>
                  <div className='card-body'>
                    <div className='form-section-title d-flex align-items-center mb-4'>
                      <i className='material-icons me-2 text-primary'>
                        attach_file
                      </i>
                      <h5 className='mb-0'>Archivos Adjuntos</h5>
                    </div>

                    <div className='attachments-container'>
                      <div className='text-center py-4'>
                        <i
                          className='material-icons mb-2 text-muted'
                          style={{ fontSize: '2rem' }}
                        >
                          cloud_upload
                        </i>
                        <p className='mb-2'>
                          Arrastra archivos aquí o haz clic para seleccionar
                        </p>
                        <button
                          type='button'
                          className='btn btn-outline-primary'
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <i className='material-icons me-2'>attach_file</i>
                          Seleccionar archivos
                        </button>
                        <p className='text-muted small mt-2'>
                          Formatos soportados: PDF, DOC, DOCX, XLS, XLSX, JPG,
                          PNG (máx. 10MB)
                        </p>
                      </div>

                      <input
                        ref={fileInputRef}
                        type='file'
                        className='d-none'
                        multiple
                        accept='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
                        onChange={handleFileSelect}
                      />
                    </div>

                    {/* Attached Files List */}
                    {attachedFiles.length > 0 && (
                      <div className='mt-4'>
                        <h6 className='mb-3'>
                          Archivos adjuntos ({attachedFiles.length})
                        </h6>
                        {attachedFiles.map(fileItem => (
                          <div
                            key={fileItem.id}
                            className='attachment-item d-flex align-items-center p-2 mb-2 border rounded'
                          >
                            <FileIcon fileName={fileItem.file.name} size='sm' />

                            <div className='attachment-info flex-grow-1 ms-3'>
                              <div className='attachment-name'>
                                {fileItem.file.name}
                              </div>
                              <div className='attachment-meta text-muted small'>
                                {formatFileSize(fileItem.file.size)}
                              </div>
                              {!fileItem.uploaded && (
                                <div
                                  className='progress mt-1'
                                  style={{ height: '3px' }}
                                >
                                  <div
                                    className='progress-bar'
                                    role='progressbar'
                                    style={{ width: `${fileItem.progress}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>

                            <div className='attachment-actions'>
                              {fileItem.uploaded ? (
                                <span className='text-success me-2'>
                                  <i className='material-icons'>check_circle</i>
                                </span>
                              ) : (
                                <span className='text-primary me-2'>
                                  <i className='material-icons'>upload</i>
                                </span>
                              )}
                              <button
                                type='button'
                                className='btn btn-sm btn-outline-danger'
                                onClick={() => removeFile(fileItem.id)}
                              >
                                <i className='material-icons'>delete</i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className='form-card card shadow-sm mb-4'>
                  <div className='card-body'>
                    <div className='form-section-title d-flex align-items-center mb-4'>
                      <i className='material-icons me-2 text-primary'>note</i>
                      <h5 className='mb-0'>Notas Adicionales</h5>
                    </div>

                    <textarea
                      className='form-control'
                      rows={4}
                      placeholder='Agrega cualquier información adicional sobre este documento...'
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className='col-lg-4'>
                {/* Document Preview */}
                <div
                  className='form-card card shadow-sm mb-4 sticky-top'
                  style={{ top: '1rem' }}
                >
                  <div className='card-body'>
                    <div className='form-section-title d-flex align-items-center mb-4'>
                      <i className='material-icons me-2 text-primary'>
                        preview
                      </i>
                      <h5 className='mb-0'>Vista Previa</h5>
                    </div>

                    <div className='text-center mb-3'>
                      <TypeBadge type={documentType} size='md' />
                    </div>

                    <div className='preview-container'>
                      <div className='mb-3'>
                        <strong>Número:</strong>{' '}
                        {documentNumber || 'Sin número'}
                      </div>
                      <div className='mb-3'>
                        <strong>Proveedor:</strong>{' '}
                        {selectedProvider
                          ? providers.find(p => p.id === selectedProvider)?.name
                          : 'No seleccionado'}
                      </div>
                      <div className='mb-3'>
                        <strong>Fecha:</strong>{' '}
                        {documentDate
                          ? new Date(documentDate).toLocaleDateString('es-CL')
                          : 'No especificada'}
                      </div>
                      {dueDate && (
                        <div className='mb-3'>
                          <strong>Vencimiento:</strong>{' '}
                          {new Date(dueDate).toLocaleDateString('es-CL')}
                        </div>
                      )}
                      <div className='mb-3'>
                        <strong>Ítems:</strong> {items.length}
                      </div>
                      <div className='mb-3'>
                        <strong>Archivos:</strong> {attachedFiles.length}
                      </div>
                      <hr />
                      <div className='text-center'>
                        <div className='h4 text-primary mb-0'>
                          {formatCurrency(total)}
                        </div>
                        <small className='text-muted'>
                          Total del documento
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='d-flex gap-3 justify-content-end py-4 border-top'>
              <Link
                href='/documentos-compra'
                className='btn btn-outline-secondary'
              >
                Cancelar
              </Link>
              <button
                type='submit'
                className='btn btn-primary'
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm me-2'
                      role='status'
                    ></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className='material-icons me-2'>save</i>
                    Crear Documento
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
