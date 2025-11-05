import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Card,
  Form,
  Alert,
  Col,
  Row,
  InputGroup,
} from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import {
  getGastoById,
  updateGasto,
  getCategorias,
  getCentrosCosto,
  getProveedores,
} from '@/lib/gastosService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { usePermissions } from '@/lib/usePermissions';

interface ExpenseFormData {
  id: number;
  description: string;
  category: number; // Cambiar a number
  provider: number; // Cambiar a number
  amount: string;
  date: string;
  dueDate: string;
  documentType: string;
  documentNumber: string;
  isRecurring: boolean;
  recurringPeriod: string;
  costCenter: number; // Cambiar a number
  tags: string[];
  observations: string;
  priority: 'low' | 'medium' | 'high';
  requiredApprovals: number;
  attachments: File[];
  existingAttachments: ExistingAttachment[];
}

interface ExistingAttachment {
  id: number;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export default function EditarGasto() {
  const router = useRouter();
  const { id } = router.query;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const currentComunidadId = user?.comunidad_id;
  const { isSuperUser, currentRole } = usePermissions();
  const comunidadId = currentComunidadId;

  const [formData, setFormData] = useState<ExpenseFormData>({
    id: 0,
    description: '',
    category: 0,
    provider: 0,
    amount: '',
    date: '',
    dueDate: '',
    documentType: 'factura',
    documentNumber: '',
    isRecurring: false,
    recurringPeriod: '',
    costCenter: 0,
    tags: [],
    observations: '',
    priority: 'medium',
    requiredApprovals: 1,
    attachments: [],
    existingAttachments: [],
  });

  const [initialFormData, setInitialFormData] =
    useState<ExpenseFormData | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [costCenters, setCostCenters] = useState([]);

  useEffect(() => {
    if (id) {
      getGastoById(Number(id))
        .then(data => {
          const mappedData = mapToFormData(data);
          setFormData(mappedData);
          setInitialFormData(mappedData); // Guarda iniciales
          setInitialLoading(false);
        })
        .catch(() => setInitialLoading(false));

      // Cargar listas con comunidadId opcional
      getCategorias(comunidadId || undefined).then(setCategories);
      getCentrosCosto(comunidadId || undefined).then(setCostCenters);
      getProveedores(comunidadId || undefined).then(setProviders);
    }
  }, [id, comunidadId]); // Mantener dependencias

  const documentTypes = [
    { value: 'factura', label: 'Factura' },
    { value: 'boleta', label: 'Boleta de Honorarios' },
    { value: 'recibo', label: 'Recibo' },
    { value: 'factura_electronica', label: 'Factura Electrónica' },
    { value: 'nota_credito', label: 'Nota de Crédito' },
    { value: 'nota_debito', label: 'Nota de Débito' },
    { value: 'orden_compra', label: 'Orden de Compra' },
    { value: 'cotizacion', label: 'Cotización' },
    { value: 'contrato', label: 'Contrato' },
    { value: 'otro', label: 'Otro' },
  ];

  // Verificar permisos: Solo superadmin o admin puede editar
  const canEdit = isSuperUser || currentRole === 'admin';
  if (!canEdit) {
    return (
      <ProtectedRoute>
        <Layout>
          <Alert variant='danger'>No tienes permisos para editar gastos.</Alert>
        </Layout>
      </ProtectedRoute>
    );
  }

  const mapToFormData = (gasto: any): ExpenseFormData => ({
    id: gasto.id,
    description: gasto.glosa || '',
    category: gasto.categoria_id || 0, // Usar ID
    provider: gasto.proveedor_id || 0,
    amount: gasto.monto?.toString() || '',
    date: gasto.fecha || '',
    dueDate: gasto.due_date || '',
    documentType: gasto.documento_tipo || 'factura',
    documentNumber: gasto.documento_numero || '',
    isRecurring: gasto.is_recurring || false,
    recurringPeriod: gasto.recurring_period || '',
    costCenter: gasto.centro_costo_id || 0,
    tags: gasto.tags || [],
    observations: gasto.observations || '',
    priority: gasto.priority || 'medium',
    requiredApprovals: gasto.required_approvals || 1,
    attachments: [],
    existingAttachments:
      gasto.attachments?.map((a: any) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        size: a.size,
        url: a.url,
        uploadedAt: a.uploadedAt,
      })) || [],
  });

  const mapFormDataToPayload = (
    data: ExpenseFormData,
    initial: ExpenseFormData | null,
  ) => {
    const payload: any = {};

    // Compara y agrega solo si cambió
    if (data.category !== initial?.category)
      {payload.categoria_id = data.category;}
    if (data.date !== initial?.date) {payload.fecha = data.date;}
    if (data.amount !== initial?.amount)
      {payload.monto = parseFloat(
        data.amount.replace(/\./g, '').replace(',', '.'),
      );}
    if (data.description !== initial?.description)
      {payload.glosa = data.description;}
    if (data.costCenter !== initial?.costCenter)
      {payload.centro_costo_id = data.costCenter || undefined;}
    if (data.documentType !== initial?.documentType)
      {payload.documento_tipo = data.documentType;}
    if (data.documentNumber !== initial?.documentNumber)
      {payload.documento_numero = data.documentNumber;}
    if (data.isRecurring !== initial?.isRecurring)
      {payload.extraordinario = data.isRecurring;}
    if (data.recurringPeriod !== initial?.recurringPeriod)
      {payload.recurring_period = data.recurringPeriod;}
    if (JSON.stringify(data.tags) !== JSON.stringify(initial?.tags))
      {payload.tags = data.tags;}
    if (data.observations !== initial?.observations)
      {payload.observations = data.observations;}
    if (data.priority !== initial?.priority) {payload.priority = data.priority;}
    if (data.requiredApprovals !== initial?.requiredApprovals)
      {payload.required_approvals = data.requiredApprovals;}

    return payload;
  };

  const handleInputChange = (field: keyof ExpenseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) {
      return;
    }

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'image/jpg',
      ];

      if (file.size > maxSize) {
        alert(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`);
        return false;
      }

      if (!allowedTypes.includes(file.type)) {
        alert(
          `El archivo ${file.name} no es de un tipo permitido. Solo se permiten imágenes (JPG, PNG) y PDF.`,
        );
        return false;
      }

      return true;
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles],
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const removeExistingAttachment = (attachmentId: number) => {
    setFormData(prev => ({
      ...prev,
      existingAttachments: prev.existingAttachments.filter(
        att => att.id !== attachmentId,
      ),
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const validateForm = (): boolean => {
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {return;}
    setLoading(true);
    try {
      const payload = mapFormDataToPayload(formData, initialFormData);
      if (Object.keys(payload).length === 0) {
        alert('No hay cambios para guardar');
        setLoading(false);
        return;
      }
      await updateGasto(Number(id), payload);
      router.push(`/gastos/${id}`);
    } catch (err) {
// eslint-disable-next-line no-console
      console.error(err);
      setErrors({ general: 'Error al actualizar gasto' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    handleInputChange('amount', formatted);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (initialLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ minHeight: '400px' }}
          >
            <div className='text-center'>
              <div className='spinner-border text-primary mb-3' />
              <p>Cargando datos del gasto...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Editar Gasto #{formData.id} — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='expense-form-container'>
          {/* Header */}
          <div className='form-header mb-4'>
            <div className='d-flex align-items-center mb-3'>
              <Button
                variant='outline-light'
                onClick={() => router.push(`/gastos/${formData.id}`)}
                className='me-3'
              >
                <span className='material-icons'>arrow_back</span>
              </Button>
              <div>
                <h1 className='form-title mb-1'>
                  <span className='material-icons me-2'>edit</span>
                  Editar Gasto #{formData.id}
                </h1>
                <p className='form-subtitle'>
                  Modifica la información del gasto existente
                </p>
              </div>
            </div>

            {/* Alert de edición */}
            <Alert variant='info' className='mb-0'>
              <span className='material-icons me-2'>info</span>
              Estás editando un gasto existente. Los cambios se guardarán cuando
              presiones &quot;Actualizar Gasto&quot;.
            </Alert>
          </div>

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col lg={8}>
                {/* Información básica */}
                <Card className='form-card mb-4'>
                  <Card.Body>
                    <div className='card-header-custom mb-4'>
                      <h5 className='card-title-custom'>
                        <span className='material-icons me-2'>info</span>
                        Información Básica
                      </h5>
                    </div>

                    <Row>
                      <Col md={12} className='mb-3'>
                        <Form.Group>
                          <Form.Label className='required'>
                            Descripción del Gasto
                          </Form.Label>
                          <Form.Control
                            type='text'
                            placeholder='Ej: Mantenimiento de ascensores, Suministros de limpieza...'
                            value={formData.description}
                            onChange={e =>
                              handleInputChange('description', e.target.value)
                            }
                            isInvalid={!!errors.description}
                          />
                          <Form.Control.Feedback type='invalid'>
                            {errors.description}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={6} className='mb-3'>
                        <Form.Group>
                          <Form.Label className='required'>
                            Categoría
                          </Form.Label>
                          <Form.Select
                            value={formData.category}
                            onChange={e =>
                              handleInputChange('category', e.target.value)
                            }
                            isInvalid={!!errors.category}
                          >
                            <option value=''>Selecciona una categoría</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.nombre}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type='invalid'>
                            {errors.category}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={6} className='mb-3'>
                        <Form.Group>
                          <Form.Label>Proveedor</Form.Label>
                          <Form.Select
                            value={formData.provider}
                            onChange={e =>
                              handleInputChange(
                                'provider',
                                parseInt(e.target.value),
                              )
                            }
                          >
                            <option value={0}>Selecciona un proveedor</option>
                            {providers.map(prov => (
                              <option key={prov.id} value={prov.id}>
                                {prov.razon_social}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6} className='mb-3'>
                        <Form.Group>
                          <Form.Label className='required'>Monto</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>$</InputGroup.Text>
                            <Form.Control
                              type='text'
                              placeholder='0'
                              value={formData.amount}
                              onChange={handleAmountChange}
                              isInvalid={!!errors.amount}
                            />
                            <InputGroup.Text>CLP</InputGroup.Text>
                          </InputGroup>
                          <Form.Control.Feedback type='invalid'>
                            {errors.amount}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={6} className='mb-3'>
                        <Form.Group>
                          <Form.Label>Centro de Costo</Form.Label>
                          <Form.Select
                            value={formData.costCenter}
                            onChange={e =>
                              handleInputChange('costCenter', e.target.value)
                            }
                          >
                            <option value=''>
                              Selecciona un centro de costo
                            </option>
                            {costCenters.map(cc => (
                              <option key={cc.id} value={cc.id}>
                                {cc.nombre}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Información del documento */}
                <Card className='form-card mb-4'>
                  <Card.Body>
                    <div className='card-header-custom mb-4'>
                      <h5 className='card-title-custom'>
                        <span className='material-icons me-2'>description</span>
                        Información del Documento
                      </h5>
                    </div>

                    <Row>
                      <Col md={6} className='mb-3'>
                        <Form.Group>
                          <Form.Label className='required'>
                            Tipo de Documento
                          </Form.Label>
                          <Form.Select
                            value={formData.documentType}
                            onChange={e =>
                              handleInputChange('documentType', e.target.value)
                            }
                          >
                            {documentTypes.map(doc => (
                              <option key={doc.value} value={doc.value}>
                                {doc.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6} className='mb-3'>
                        <Form.Group>
                          <Form.Label className='required'>
                            Número de Documento
                          </Form.Label>
                          <Form.Control
                            type='text'
                            placeholder='Ej: F-2024-001, B-789'
                            value={formData.documentNumber}
                            onChange={e =>
                              handleInputChange(
                                'documentNumber',
                                e.target.value,
                              )
                            }
                            isInvalid={!!errors.documentNumber}
                          />
                          <Form.Control.Feedback type='invalid'>
                            {errors.documentNumber}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={6} className='mb-3'>
                        <Form.Group>
                          <Form.Label className='required'>
                            Fecha del Documento
                          </Form.Label>
                          <Form.Control
                            type='date'
                            value={formData.date}
                            onChange={e =>
                              handleInputChange('date', e.target.value)
                            }
                            isInvalid={!!errors.date}
                          />
                          <Form.Control.Feedback type='invalid'>
                            {errors.date}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={6} className='mb-3'>
                        <Form.Group>
                          <Form.Label>Fecha de Vencimiento</Form.Label>
                          <Form.Control
                            type='date'
                            value={formData.dueDate}
                            onChange={e =>
                              handleInputChange('dueDate', e.target.value)
                            }
                            min={formData.date}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Archivos adjuntos */}
                <Card className='form-card mb-4'>
                  <Card.Body>
                    <div className='card-header-custom mb-4'>
                      <h5 className='card-title-custom'>
                        <span className='material-icons me-2'>attach_file</span>
                        Archivos Adjuntos
                      </h5>
                    </div>

                    {/* Archivos existentes */}
                    {formData.existingAttachments.length > 0 && (
                      <div className='existing-files mb-4'>
                        <h6 className='text-muted mb-3'>
                          Archivos Actuales (
                          {formData.existingAttachments.length})
                        </h6>
                        {formData.existingAttachments.map(file => (
                          <div
                            key={file.id}
                            className='uploaded-file-item mb-2'
                          >
                            <div className='d-flex align-items-center'>
                              <span className='material-icons file-icon me-2'>
                                {file.type.includes('pdf')
                                  ? 'picture_as_pdf'
                                  : 'image'}
                              </span>
                              <div className='flex-grow-1'>
                                <div className='file-name'>{file.name}</div>
                                <small className='text-muted'>
                                  {formatFileSize(file.size)} • Subido el{' '}
                                  {new Date(file.uploadedAt).toLocaleDateString(
                                    'es-CL',
                                  )}
                                </small>
                              </div>
                              <Button
                                variant='outline-primary'
                                size='sm'
                                className='me-2'
                                onClick={() => window.open(file.url, '_blank')}
                              >
                                <span className='material-icons'>
                                  visibility
                                </span>
                              </Button>
                              <Button
                                variant='outline-danger'
                                size='sm'
                                onClick={() =>
                                  removeExistingAttachment(file.id)
                                }
                              >
                                <span className='material-icons'>delete</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Área para nuevos archivos */}
                    <div
                      className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label="Haz clic o arrastra archivos para subir"
                    >
                      <div className='file-upload-content'>
                        <span className='material-icons file-upload-icon'>
                          cloud_upload
                        </span>
                        <p className='file-upload-text'>
                          Arrastra archivos aquí o{' '}
                          <strong>haz clic para seleccionar</strong>
                        </p>
                        <small className='text-muted'>
                          Formatos permitidos: JPG, PNG, PDF • Tamaño máximo:
                          10MB por archivo
                        </small>
                      </div>
                      <Form.Control
                        ref={fileInputRef}
                        type='file'
                        multiple
                        accept='image/jpeg,image/png,image/jpg,application/pdf'
                        onChange={e =>
                          handleFileUpload((e.target as HTMLInputElement).files)
                        }
                        style={{ display: 'none' }}
                      />
                    </div>

                    {/* Nuevos archivos seleccionados */}
                    {formData.attachments.length > 0 && (
                      <div className='uploaded-files mt-3'>
                        <h6 className='text-success mb-3'>
                          Nuevos Archivos ({formData.attachments.length})
                        </h6>
                        {formData.attachments.map((file, index) => (
                          <div key={index} className='uploaded-file-item'>
                            <div className='d-flex align-items-center'>
                              <span className='material-icons file-icon me-2'>
                                {file.type.includes('pdf')
                                  ? 'picture_as_pdf'
                                  : 'image'}
                              </span>
                              <div className='flex-grow-1'>
                                <div className='file-name'>{file.name}</div>
                                <small className='text-muted'>
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </small>
                              </div>
                              <Button
                                variant='outline-danger'
                                size='sm'
                                onClick={() => removeAttachment(index)}
                              >
                                <span className='material-icons'>delete</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                {/* Panel lateral */}
                <div className='sticky-sidebar'>
                  {/* Configuración adicional */}
                  <Card className='form-card mb-4'>
                    <Card.Body>
                      <div className='card-header-custom mb-3'>
                        <h6 className='card-title-custom'>
                          <span className='material-icons me-2'>settings</span>
                          Configuración Adicional
                        </h6>
                      </div>

                      <Form.Group className='mb-3'>
                        <Form.Label>Prioridad</Form.Label>
                        <Form.Select
                          value={formData.priority}
                          onChange={e =>
                            handleInputChange('priority', e.target.value)
                          }
                        >
                          <option value='low'>Baja</option>
                          <option value='medium'>Media</option>
                          <option value='high'>Alta</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className='mb-3'>
                        <Form.Label>Aprobaciones Requeridas</Form.Label>
                        <Form.Select
                          value={formData.requiredApprovals}
                          onChange={e =>
                            handleInputChange(
                              'requiredApprovals',
                              parseInt(e.target.value),
                            )
                          }
                        >
                          <option value={1}>1 Aprobación</option>
                          <option value={2}>2 Aprobaciones</option>
                          <option value={3}>3 Aprobaciones</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className='mb-3'>
                        <Form.Check
                          type='checkbox'
                          label='Gasto recurrente'
                          checked={formData.isRecurring}
                          onChange={e =>
                            handleInputChange('isRecurring', e.target.checked)
                          }
                        />
                      </Form.Group>

                      {formData.isRecurring && (
                        <Form.Group className='mb-3'>
                          <Form.Label>Período de Recurrencia</Form.Label>
                          <Form.Select
                            value={formData.recurringPeriod}
                            onChange={e =>
                              handleInputChange(
                                'recurringPeriod',
                                e.target.value,
                              )
                            }
                          >
                            <option value=''>Selecciona período</option>
                            <option value='monthly'>Mensual</option>
                            <option value='quarterly'>Trimestral</option>
                            <option value='semiannual'>Semestral</option>
                            <option value='annual'>Anual</option>
                          </Form.Select>
                        </Form.Group>
                      )}
                    </Card.Body>
                  </Card>

                  {/* Etiquetas */}
                  <Card className='form-card mb-4'>
                    <Card.Body>
                      <div className='card-header-custom mb-3'>
                        <h6 className='card-title-custom'>
                          <span className='material-icons me-2'>label</span>
                          Etiquetas
                        </h6>
                      </div>

                      <Form.Group className='mb-3'>
                        <InputGroup>
                          <Form.Control
                            type='text'
                            placeholder='Agregar etiqueta'
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyPress={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag();
                              }
                            }}
                          />
                          <Button variant='outline-secondary' onClick={addTag}>
                            <span className='material-icons'>add</span>
                          </Button>
                        </InputGroup>
                      </Form.Group>

                      {formData.tags.length > 0 && (
                        <div className='tags-container'>
                          {formData.tags.map((tag, index) => (
                            <span key={index} className='tag-item'>
                              {tag}
                              <Button
                                variant='link'
                                size='sm'
                                className='tag-remove'
                                onClick={() => removeTag(tag)}
                              >
                                <span className='material-icons'>close</span>
                              </Button>
                            </span>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                  </Card>

                  {/* Observaciones */}
                  <Card className='form-card mb-4'>
                    <Card.Body>
                      <div className='card-header-custom mb-3'>
                        <h6 className='card-title-custom'>
                          <span className='material-icons me-2'>note</span>
                          Observaciones
                        </h6>
                      </div>
                      <Form.Group>
                        <Form.Control
                          as='textarea'
                          rows={4}
                          placeholder='Observaciones adicionales sobre este gasto...'
                          value={formData.observations}
                          onChange={e =>
                            handleInputChange('observations', e.target.value)
                          }
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>

                  {/* Botones de acción */}
                  <div className='form-actions'>
                    <Button
                      type='submit'
                      variant='primary'
                      size='lg'
                      disabled={loading}
                      className='w-100 mb-2'
                    >
                      {loading ? (
                        <>
                          <span className='spinner-border spinner-border-sm me-2' />
                          Actualizando Gasto...
                        </>
                      ) : (
                        <>
                          <span className='material-icons me-2'>save</span>
                          Actualizar Gasto
                        </>
                      )}
                    </Button>

                    <Button
                      type='button'
                      variant='outline-secondary'
                      size='lg'
                      className='w-100'
                      onClick={() => router.push(`/gastos/${formData.id}`)}
                      disabled={loading}
                    >
                      <span className='material-icons me-2'>cancel</span>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
