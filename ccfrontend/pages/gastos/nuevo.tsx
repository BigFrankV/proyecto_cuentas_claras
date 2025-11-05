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
  createGasto,
  getCategorias,
  getCentrosCosto,
  getProveedores,
  getComunidades,
} from '@/lib/gastosService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { usePermissions } from '@/lib/usePermissions';

interface ExpenseFormData {
  description: string;
  category: number; // Cambiar a number para IDs
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
}

export default function GastoNuevo() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { isSuperUser, currentRole } = usePermissions();
  // Obtener currentComunidadId del user
  const currentComunidadId =
    user?.comunidad_id || user?.memberships?.[0]?.comunidadId;
  // para superadmin
  const isSuper = Boolean(user?.is_superadmin);
  // Normalizar isSuper (puede ser función o boolean)
  const comunidadParaEnviar = user?.is_superadmin ? null : currentComunidadId;

  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    category: 0,
    provider: 0,
    amount: '',
    date: new Date().toISOString().split('T')[0] || '',
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedComunidad, setSelectedComunidad] = useState<number | null>(
    null,
  );
  const [comunidades, setComunidades] = useState<any[]>([]); // Lista de comunidades

  useEffect(() => {
    const loadLists = async () => {
      // eslint-disable-next-line no-console
      console.log('idToUse:', comunidadParaEnviar, 'isSuperUser:', isSuperUser);
      try {
        // eslint-disable-next-line no-console
        console.log('-> llamando getCategorias...');
        const cats = await getCategorias(comunidadParaEnviar);
        const catsArray = Array.isArray(cats) ? cats : (cats?.data ?? []);
        // eslint-disable-next-line no-console
        console.log('<- getCategorias normalized length:', catsArray.length);
        setCategories(
          (catsArray || []).map((c: any) => ({
            id: c.id,
            nombre: c.nombre ?? c.name ?? String(c.id),
          })),
        );

        // eslint-disable-next-line no-console
        console.log('-> llamando getCentrosCosto...');
        const centros = await getCentrosCosto(comunidadParaEnviar);
        const centrosArray = Array.isArray(centros)
          ? centros
          : (centros?.data ?? []);
        // eslint-disable-next-line no-console
        console.log(
          '<- getCentrosCosto normalized length:',
          centrosArray.length,
        );
        setCostCenters(
          (centrosArray || []).map((c: any) => ({
            id: c.id,
            nombre: c.nombre ?? String(c.id),
          })),
        );

        // eslint-disable-next-line no-console
        console.log('-> llamando getProveedores...');
        const provs = await getProveedores(comunidadParaEnviar);
        const provsArray = Array.isArray(provs) ? provs : (provs?.data ?? []);
        // eslint-disable-next-line no-console
        console.log('<- getProveedores normalized length:', provsArray.length);
        setProviders(
          (provsArray || []).map((p: any) => ({
            id: p.id,
            nombre: p.nombre ?? p.razon_social ?? String(p.id),
          })),
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error cargando listas para dropdowns:', err);
        setCategories([]);
        setCostCenters([]);
        setProviders([]);
      }
    };

    loadLists();
  }, [comunidadParaEnviar]);

  useEffect(() => {
    if (isSuper) {
      getComunidades()
        .then(res => {
          const comunidadesArray = Array.isArray(res) ? res : (res?.data ?? []);
          setComunidades(comunidadesArray);
        })
        // eslint-disable-next-line no-console
        .catch(console.error);
    }
  }, [isSuper]);

  // Esperar a que el user se cargue
  if (!user) {
    return (
      <ProtectedRoute>
        <Layout>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ minHeight: '400px' }}
          >
            <div className='text-center'>
              <div className='spinner-border text-primary mb-3' />
              <p>Cargando...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Verificar permisos: Solo superadmin, admin, contador, admin_comunidad pueden crear
  const canCreate =
    user?.is_superadmin ||
    user?.roles?.includes('admin') ||
    user?.roles?.includes('contador') ||
    user?.roles?.includes('admin_comunidad');
  {
    if (!canCreate) {
      return (
        <ProtectedRoute>
          <Layout>
            <Alert variant='danger'>
              No tienes permisos para crear gastos.
            </Alert>
          </Layout>
        </ProtectedRoute>
      );
    }
  }

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
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es obligatoria';
    }

    if (!formData.provider) {
      newErrors.provider = 'El proveedor es obligatorio';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria';
    }

    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'El número de documento es obligatorio';
    }

    // Para superadmin, validar que seleccione comunidad
    if (isSuper && !selectedComunidad) {
      newErrors.general = 'Selecciona una comunidad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapFormDataToPayload = (data: ExpenseFormData) => {
    return {
      categoria_id: data.category,
      fecha: data.date,
      monto: parseFloat(data.amount.replace(/\./g, '').replace(',', '.')),
      glosa: data.description,
      centro_costo_id: data.costCenter || undefined,
      documento_tipo: data.documentType,
      documento_numero: data.documentNumber,
      extraordinario: false,
      // Agrega otros campos según backend
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const payload = mapFormDataToPayload(formData);
      // eslint-disable-next-line no-console
      console.log(
        'creando gasto - comunidadId:',
        isSuper ? selectedComunidad : comunidadParaEnviar,
        'payload:',
        payload,
      );
      // eslint-disable-next-line no-console
      console.log(
        'Antes de createGasto - user.is_superadmin:',
        user?.is_superadmin,
        'currentComunidadId:',
        currentComunidadId,
        'comunidadParaEnviar:',
        comunidadParaEnviar,
      );
      const comunidadIdFinal = isSuper
        ? selectedComunidad
        : comunidadParaEnviar;
      const newGasto = await createGasto(comunidadIdFinal ?? null, payload);
      router.push(`/gastos/${newGasto.id}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error creando gasto:', err);
      setErrors({ general: 'Error al crear gasto' });
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

  return (
    <ProtectedRoute>
      <Head>
        <title>Nuevo Gasto — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='expense-form-container'>
          {/* Header */}
          <div className='form-header mb-4'>
            <div className='d-flex align-items-center mb-3'>
              <Button
                variant='outline-secondary'
                onClick={() => router.push('/gastos')}
                className='me-3'
              >
                <span className='material-icons'>arrow_back</span>
              </Button>
              <div>
                <h1 className='form-title mb-1'>
                  <span className='material-icons me-2'>add_circle</span>
                  Nuevo Gasto
                </h1>
                <p className='form-subtitle text-muted'>
                  Registra un nuevo gasto para la comunidad
                </p>
              </div>
            </div>
          </div>

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col lg={8}>
                {/* Dropdown para superadmin */}
                {isSuper && (
                  <Card className='form-card mb-4'>
                    <Card.Body>
                      <Form.Group>
                        <Form.Label className='required'>Comunidad</Form.Label>
                        <Form.Select
                          value={selectedComunidad || ''}
                          onChange={e =>
                            setSelectedComunidad(Number(e.target.value) || null)
                          }
                          required
                        >
                          <option value=''>Selecciona una comunidad</option>
                          {comunidades.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.nombre}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Card.Body>
                  </Card>
                )}

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
                              handleInputChange(
                                'category',
                                parseInt(e.target.value),
                              )
                            }
                            isInvalid={!!errors.category}
                          >
                            <option value={0}>Selecciona una categoría</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.nombre ?? String(cat.id)}
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
                          <Form.Label className='required'>
                            Proveedor
                          </Form.Label>
                          <Form.Select
                            value={formData.provider}
                            onChange={e =>
                              handleInputChange(
                                'provider',
                                parseInt(e.target.value),
                              )
                            }
                            isInvalid={!!errors.provider}
                          >
                            <option value={0}>Selecciona un proveedor</option>
                            {providers.map(prov => (
                              <option key={prov.id} value={prov.id}>
                                {prov.nombre ??
                                  prov.razon_social ??
                                  String(prov.id)}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type='invalid'>
                            {errors.provider}
                          </Form.Control.Feedback>
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
                              handleInputChange(
                                'costCenter',
                                parseInt(e.target.value),
                              )
                            }
                          >
                            <option value={0}>
                              Selecciona un centro de costo
                            </option>
                            {costCenters.map(cc => (
                              <option key={cc.id} value={cc.id}>
                                {cc.nombre ?? String(cc.id)}
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

                    <div
                      className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      role='button'
                      tabIndex={0}
                      aria-label='Haz clic o arrastra archivos para subir'
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

                    {formData.attachments.length > 0 && (
                      <div className='uploaded-files mt-3'>
                        <h6>
                          Archivos Seleccionados ({formData.attachments.length})
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
                          Creando Gasto...
                        </>
                      ) : (
                        <>
                          <span className='material-icons me-2'>save</span>
                          Crear Gasto
                        </>
                      )}
                    </Button>

                    <Button
                      type='button'
                      variant='outline-secondary'
                      size='lg'
                      className='w-100'
                      onClick={() => router.push('/gastos')}
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
