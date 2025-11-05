/* eslint-disable no-console */
/* eslint-disable max-len */
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState, useRef } from 'react';
import { Button, Card, Form, Row, Col, Alert, Badge } from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

interface Contact {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  notes: string;
  isPrimary: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export default function ProveedorNuevo() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    category: '',
    type: '',
    rif: '',
    website: '',
    status: 'active',
    description: '',
    address: '',
    city: '',
    state: '',
    country: 'Venezuela',
    postalCode: '',
    bank: '',
    accountType: '',
    accountNumber: '',
    accountHolder: '',
    paymentTerms: '',
    currency: 'ves',
    tags: '',
    rating: 0,
  });

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: '',
      position: '',
      phone: '',
      email: '',
      notes: '',
      isPrimary: true,
    },
  ]);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Confiable', 'Preferente']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContactChange = (
    contactId: string,
    field: string,
    value: string | boolean,
  ) => {
    setContacts(prev =>
      prev.map(contact =>
        contact.id === contactId ? { ...contact, [field]: value } : contact,
      ),
    );
  };

  const addContact = () => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name: '',
      position: '',
      phone: '',
      email: '',
      notes: '',
      isPrimary: false,
    };
    setContacts(prev => [...prev, newContact]);
  };

  const removeContact = (contactId: string) => {
    if (contacts.length > 1) {
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
    }
  };

  const setPrimaryContact = (contactId: string) => {
    setContacts(prev =>
      prev.map(contact => ({ ...contact, isPrimary: contact.id === contactId })),
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    Array.from(files).forEach(file => {
      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
      };
      setUploadedFiles(prev => [...prev, newFile]);
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    // Validar que haya al menos un contacto con nombre y teléfono
    const validContacts = contacts.filter(c => c.name.trim() && c.phone.trim());
    if (validContacts.length === 0) {
      newErrors.contacts =
        'Debe agregar al menos un contacto con nombre y teléfono';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Simular envío de datos
      await new Promise(resolve => setTimeout(resolve, 2000));

// eslint-disable-next-line no-console
      console.log('Datos del proveedor:', {
        ...formData,
        contacts: contacts.filter(c => c.name.trim()),
        files: uploadedFiles,
        tags,
        logo: logoPreview,
      });

      alert('Proveedor creado exitosamente');
      router.push('/proveedores');
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error creating provider:', error);
      alert('Error al crear el proveedor');
    } finally {
      setLoading(false);
    }
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

  const renderRatingInput = () => {
    const stars = [];
    for (let i = 5; i >= 1; i--) {
      stars.push(
        <React.Fragment key={i}>
          <input
            type='radio'
            id={`star${i}`}
            name='rating'
            value={i}
            checked={formData.rating === i}
            onChange={() => handleInputChange('rating', i.toString())}
            className='rating-radio'
          />
          <label htmlFor={`star${i}`} className='rating-label'>
            <span className='material-icons'>star</span>
          </label>
        </React.Fragment>,
      );
    }
    return <div className='rating-input'>{stars}</div>;
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nuevo Proveedor — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='providers-container'>
          {/* Header */}
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div className='d-flex align-items-center'>
              <Button
                variant='link'
                className='text-secondary p-0 me-3'
                onClick={() => router.back()}
              >
                <span className='material-icons'>arrow_back</span>
              </Button>
              <div>
                <h1 className='providers-title mb-0'>
                  <span className='material-icons me-2'>add_business</span>
                  Nuevo Proveedor
                </h1>
                <p className='providers-subtitle'>
                  Registra un nuevo proveedor en el sistema
                </p>
              </div>
            </div>
          </div>

          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Columna izquierda */}
              <Col lg={8}>
                {/* Información General */}
                <Card className='provider-form-section mb-4'>
                  <Card.Header className='section-header'>
                    <h6 className='mb-0'>
                      <span className='material-icons me-2'>business</span>
                      Información General
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row className='g-3'>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>
                            Nombre o Razón Social
                          </Form.Label>
                          <Form.Control
                            type='text'
                            placeholder='Ej: Constructora Edificar'
                            value={formData.name}
                            onChange={e =>
                              handleInputChange('name', e.target.value)
                            }
                            isInvalid={!!errors.name}
                          />
                          <Form.Control.Feedback type='invalid'>
                            {errors.name}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>RIF/ID Fiscal</Form.Label>
                          <Form.Control
                            type='text'
                            placeholder='J-12345678-9'
                            value={formData.rif}
                            onChange={e =>
                              handleInputChange('rif', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
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
                            <option value=''>Seleccione una categoría</option>
                            <option value='supplies'>Suministros</option>
                            <option value='services'>Servicios</option>
                            <option value='construction'>Construcción</option>
                            <option value='others'>Otros</option>
                          </Form.Select>
                          <Form.Control.Feedback type='invalid'>
                            {errors.category}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Tipo de Proveedor</Form.Label>
                          <Form.Select
                            value={formData.type}
                            onChange={e =>
                              handleInputChange('type', e.target.value)
                            }
                          >
                            <option value=''>Seleccione un tipo</option>
                            <option value='empresa'>Empresa</option>
                            <option value='individual'>
                              Persona Individual
                            </option>
                            <option value='externo'>Proveedor Externo</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label>Descripción</Form.Label>
                          <Form.Control
                            as='textarea'
                            rows={3}
                            placeholder='Describe brevemente los productos o servicios que ofrece este proveedor...'
                            value={formData.description}
                            onChange={e =>
                              handleInputChange('description', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Sitio Web</Form.Label>
                          <Form.Control
                            type='url'
                            placeholder='https://www.ejemplo.com'
                            value={formData.website}
                            onChange={e =>
                              handleInputChange('website', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Estado</Form.Label>
                          <Form.Select
                            value={formData.status}
                            onChange={e =>
                              handleInputChange('status', e.target.value)
                            }
                          >
                            <option value='active'>Activo</option>
                            <option value='inactive'>Inactivo</option>
                            <option value='pending'>Pendiente</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Dirección */}
                <Card className='provider-form-section mb-4'>
                  <Card.Header className='section-header'>
                    <h6 className='mb-0'>
                      <span className='material-icons me-2'>location_on</span>
                      Dirección
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row className='g-3'>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label>Dirección</Form.Label>
                          <Form.Control
                            type='text'
                            placeholder='Calle, número, oficina, etc.'
                            value={formData.address}
                            onChange={e =>
                              handleInputChange('address', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Ciudad</Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.city}
                            onChange={e =>
                              handleInputChange('city', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Estado/Región</Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.state}
                            onChange={e =>
                              handleInputChange('state', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>País</Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.country}
                            onChange={e =>
                              handleInputChange('country', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Código Postal</Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.postalCode}
                            onChange={e =>
                              handleInputChange('postalCode', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Contactos */}
                <Card className='provider-form-section mb-4'>
                  <Card.Header className='section-header'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <h6 className='mb-0'>
                        <span className='material-icons me-2'>contacts</span>
                        Contactos
                      </h6>
                      <Button
                        variant='outline-primary'
                        size='sm'
                        onClick={addContact}
                      >
                        <span className='material-icons me-1'>add</span>
                        Añadir Contacto
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {errors.contacts && (
                      <Alert variant='danger' className='mb-3'>
                        {errors.contacts}
                      </Alert>
                    )}
                    {contacts.map(contact => (
                      <div key={contact.id} className='contact-item'>
                        {contacts.length > 1 && (
                          <Button
                            variant='outline-danger'
                            size='sm'
                            className='remove-btn'
                            onClick={() => removeContact(contact.id)}
                          >
                            <span className='material-icons'>close</span>
                          </Button>
                        )}
                        <Row className='g-3'>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className='required'>
                                Nombre
                              </Form.Label>
                              <Form.Control
                                type='text'
                                placeholder='Nombre del contacto'
                                value={contact.name}
                                onChange={e =>
                                  handleContactChange(
                                    contact.id,
                                    'name',
                                    e.target.value,
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Cargo</Form.Label>
                              <Form.Control
                                type='text'
                                placeholder='Ej: Gerente de Ventas'
                                value={contact.position}
                                onChange={e =>
                                  handleContactChange(
                                    contact.id,
                                    'position',
                                    e.target.value,
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className='required'>
                                Teléfono
                              </Form.Label>
                              <Form.Control
                                type='tel'
                                placeholder='+58 212 555-0123'
                                value={contact.phone}
                                onChange={e =>
                                  handleContactChange(
                                    contact.id,
                                    'phone',
                                    e.target.value,
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Email</Form.Label>
                              <Form.Control
                                type='email'
                                placeholder='contacto@ejemplo.com'
                                value={contact.email}
                                onChange={e =>
                                  handleContactChange(
                                    contact.id,
                                    'email',
                                    e.target.value,
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col xs={12}>
                            <Form.Group>
                              <Form.Label>Notas</Form.Label>
                              <Form.Control
                                as='textarea'
                                rows={2}
                                placeholder='Información adicional sobre este contacto...'
                                value={contact.notes}
                                onChange={e =>
                                  handleContactChange(
                                    contact.id,
                                    'notes',
                                    e.target.value,
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col xs={12}>
                            <Form.Check
                              type='checkbox'
                              label='Contacto principal'
                              checked={contact.isPrimary}
                              onChange={e => {
                                if (e.target.checked) {
                                  setPrimaryContact(contact.id);
                                }
                              }}
                            />
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </Card.Body>
                </Card>

                {/* Información Financiera */}
                <Card className='provider-form-section mb-4'>
                  <Card.Header className='section-header'>
                    <h6 className='mb-0'>
                      <span className='material-icons me-2'>
                        account_balance
                      </span>
                      Información Financiera
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row className='g-3'>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Banco</Form.Label>
                          <Form.Control
                            type='text'
                            placeholder='Ej: Banco Provincial'
                            value={formData.bank}
                            onChange={e =>
                              handleInputChange('bank', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Tipo de Cuenta</Form.Label>
                          <Form.Select
                            value={formData.accountType}
                            onChange={e =>
                              handleInputChange('accountType', e.target.value)
                            }
                          >
                            <option value=''>Seleccione un tipo</option>
                            <option value='corriente'>Cuenta Corriente</option>
                            <option value='ahorro'>Cuenta de Ahorro</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Número de Cuenta</Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.accountNumber}
                            onChange={e =>
                              handleInputChange('accountNumber', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Titular de la Cuenta</Form.Label>
                          <Form.Control
                            type='text'
                            value={formData.accountHolder}
                            onChange={e =>
                              handleInputChange('accountHolder', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Condición de Pago</Form.Label>
                          <Form.Select
                            value={formData.paymentTerms}
                            onChange={e =>
                              handleInputChange('paymentTerms', e.target.value)
                            }
                          >
                            <option value=''>Seleccione una condición</option>
                            <option value='contado'>Contado</option>
                            <option value='30dias'>30 días</option>
                            <option value='60dias'>60 días</option>
                            <option value='90dias'>90 días</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Moneda de Pago</Form.Label>
                          <Form.Select
                            value={formData.currency}
                            onChange={e =>
                              handleInputChange('currency', e.target.value)
                            }
                          >
                            <option value='ves'>Bolívar Soberano (VES)</option>
                            <option value='usd'>
                              Dólar Estadounidense (USD)
                            </option>
                            <option value='eur'>Euro (EUR)</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Documentos */}
                <Card className='provider-form-section mb-4'>
                  <Card.Header className='section-header'>
                    <h6 className='mb-0'>
                      <span className='material-icons me-2'>folder</span>
                      Documentos
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div
                      className='file-upload-box'
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label="Seleccionar archivos para subir"
                    >
                      <div className='upload-content'>
                        <span className='material-icons'>cloud_upload</span>
                        <h6 className='mb-2'>Sube tus archivos aquí</h6>
                        <p className='text-muted small mb-0'>
                          Haz clic para seleccionar archivos
                        </p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type='file'
                      multiple
                      className='d-none'
                      onChange={handleFileUpload}
                    />

                    {uploadedFiles.length > 0 && (
                      <div className='mt-3'>
                        {uploadedFiles.map(file => (
                          <div key={file.id} className='uploaded-file'>
                            <span className='material-icons file-icon'>
                              description
                            </span>
                            <div className='file-info'>
                              <p className='file-name mb-0'>{file.name}</p>
                              <span className='file-size'>
                                {formatFileSize(file.size)}
                              </span>
                            </div>
                            <Button
                              variant='outline-danger'
                              size='sm'
                              onClick={() => removeFile(file.id)}
                            >
                              <span className='material-icons'>delete</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* Etiquetas */}
                <Card className='provider-form-section'>
                  <Card.Header className='section-header'>
                    <h6 className='mb-0'>
                      <span className='material-icons me-2'>label</span>
                      Etiquetas
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className='mb-3'>
                      <Form.Label>Etiquetas</Form.Label>
                      <div className='d-flex'>
                        <Form.Control
                          type='text'
                          placeholder='Añadir etiqueta...'
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button
                          variant='outline-primary'
                          className='ms-2'
                          onClick={addTag}
                        >
                          <span className='material-icons'>add</span>
                        </Button>
                      </div>
                      <Form.Text>
                        Las etiquetas facilitan la búsqueda y organización de
                        los proveedores.
                      </Form.Text>
                    </Form.Group>

                    <div className='d-flex flex-wrap gap-2'>
                      {tags.map(tag => (
                        <Badge
                          key={tag}
                          bg='light'
                          text='dark'
                          className='d-flex align-items-center provider-tag'
                        >
                          {tag}
                          <Button
                            variant='link'
                            size='sm'
                            className='p-0 ms-2 text-danger'
                            onClick={() => removeTag(tag)}
                          >
                            <span
                              className='material-icons'
                              style={{ fontSize: '14px' }}
                            >
                              close
                            </span>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Columna derecha */}
              <Col lg={4}>
                <Card className='provider-form-section'>
                  <Card.Header className='section-header'>
                    <h6 className='mb-0'>
                      <span className='material-icons me-2'>photo</span>
                      Logo y Clasificación
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    {/* Logo */}
                    <div className='text-center mb-4'>
                      <Form.Label>Logo del Proveedor</Form.Label>
                      <div
                        className='provider-logo-upload'
                        onClick={() => logoInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            logoInputRef.current?.click();
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label="Seleccionar logo del proveedor"
                      >
                        {logoPreview ? (
                          <>
                            <Image
                              src={logoPreview}
                              alt='Logo del proveedor'
                              width={120}
                              height={120}
                              style={{
                                borderRadius: '8px',
                                objectFit: 'cover',
                              }}
                            />
                            <div className='upload-overlay'>
                              <span className='material-icons'>edit</span>
                            </div>
                          </>
                        ) : (
                          <div className='upload-placeholder'>
                            <span className='material-icons'>
                              add_photo_alternate
                            </span>
                            <span className='d-block small text-muted'>
                              Subir logo
                            </span>
                          </div>
                        )}
                      </div>
                      <input
                        ref={logoInputRef}
                        type='file'
                        accept='image/*'
                        className='d-none'
                        onChange={handleLogoUpload}
                      />
                    </div>

                    {/* Rating */}
                    <Form.Group>
                      <Form.Label>Calificación Inicial</Form.Label>
                      {renderRatingInput()}
                      <Form.Text>
                        Califica el proveedor basándote en experiencias previas
                      </Form.Text>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Botones de acción */}
            <div className='d-flex justify-content-end gap-2 mt-4'>
              <Button
                variant='outline-secondary'
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type='submit' variant='primary' disabled={loading}>
                {loading ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2' />
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className='material-icons me-2'>save</span>
                    Crear Proveedor
                  </>
                )}
              </Button>
            </div>
          </Form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

