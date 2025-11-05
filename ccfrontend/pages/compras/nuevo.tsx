import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Form,
  Row,
  Col,
  Alert,
  Table,
  Modal,
  Badge,
} from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

interface Provider {
  id: number;
  name: string;
  category: string;
  rating: number;
  status: string;
}

interface CostCenter {
  id: number;
  name: string;
  department: string;
  budget: number;
  spent: number;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

interface PurchaseItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: string;
  notes?: string;
}

export default function NuevaCompra() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    type: 'order' as 'order' | 'service' | 'maintenance' | 'supplies',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    providerId: '',
    costCenterId: '',
    categoryId: '',
    description: '',
    requiredDate: '',
    currency: 'clp' as 'clp' | 'usd',
    notes: '',
    requestJustification: '',
  });

  const [items, setItems] = useState<PurchaseItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unit: 'unidad',
      unitPrice: 0,
      totalPrice: 0,
      category: '',
      notes: '',
    },
  ]);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockProviders: Provider[] = [
        {
          id: 1,
          name: 'Materiales San Fernando Ltda.',
          category: 'construction',
          rating: 4.5,
          status: 'active',
        },
        {
          id: 2,
          name: 'Limpiezas Profesionales Vitacura Ltda.',
          category: 'services',
          rating: 4.8,
          status: 'active',
        },
        {
          id: 3,
          name: 'Ferretería Industrial Maipú',
          category: 'supplies',
          rating: 4.2,
          status: 'active',
        },
        {
          id: 4,
          name: 'Servicios Eléctricos Las Condes SpA',
          category: 'services',
          rating: 4.6,
          status: 'active',
        },
        {
          id: 5,
          name: 'Vivero y Paisajismo Lo Barnechea Ltda.',
          category: 'services',
          rating: 4.3,
          status: 'active',
        },
      ];

      const mockCostCenters: CostCenter[] = [
        {
          id: 1,
          name: 'Mantenimiento General',
          department: 'maintenance',
          budget: 3500000,
          spent: 1200000,
        },
        {
          id: 2,
          name: 'Servicios Generales',
          department: 'operations',
          budget: 2800000,
          spent: 850000,
        },
        {
          id: 3,
          name: 'Administración',
          department: 'administration',
          budget: 2100000,
          spent: 650000,
        },
        {
          id: 4,
          name: 'Jardinería y Paisajismo',
          department: 'operations',
          budget: 1500000,
          spent: 320000,
        },
        {
          id: 5,
          name: 'Seguridad',
          department: 'security',
          budget: 4200000,
          spent: 1800000,
        },
      ];

      const mockCategories: Category[] = [
        { id: 1, name: 'Materiales de Construcción', color: '#ff9800' },
        { id: 2, name: 'Servicios de Limpieza', color: '#2196f3' },
        { id: 3, name: 'Mantenimiento Eléctrico', color: '#f44336' },
        { id: 4, name: 'Jardinería', color: '#4caf50' },
        { id: 5, name: 'Tecnología', color: '#9c27b0' },
        { id: 6, name: 'Suministros de Oficina', color: '#607d8b' },
      ];

      setProviders(mockProviders);
      setCostCenters(mockCostCenters);
      setCategories(mockCategories);
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error loading initial data:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Validar presupuesto si cambia el centro de costo
    if (field === 'costCenterId' && value) {
      checkBudgetAvailability(parseInt(value));
    }
  };

  const handleItemChange = (
    itemId: string,
    field: string,
    value: string | number,
  ) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };

          // Recalcular precio total cuando cambia cantidad o precio unitario
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.totalPrice =
              updatedItem.quantity * updatedItem.unitPrice;
          }

          return updatedItem;
        }
        return item;
      }),
    );
  };

  const addItem = () => {
    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit: 'unidad',
      unitPrice: 0,
      totalPrice: 0,
      category: '',
      notes: '',
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (itemId: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const checkBudgetAvailability = (costCenterId: number) => {
    const costCenter = costCenters.find(cc => cc.id === costCenterId);
    if (costCenter) {
      const totalAmount = getTotalAmount();
      const available = costCenter.budget - costCenter.spent;

      if (totalAmount > available) {
        setShowBudgetAlert(true);
      } else {
        setShowBudgetAlert(false);
      }
    }
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    if (!formData.providerId) {
      newErrors.providerId = 'Debe seleccionar un proveedor';
    }
    if (!formData.costCenterId) {
      newErrors.costCenterId = 'Debe seleccionar un centro de costo';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Debe seleccionar una categoría';
    }
    if (!formData.requiredDate) {
      newErrors.requiredDate = 'La fecha requerida es obligatoria';
    }

    // Validar items
    const validItems = items.filter(
      item => item.description.trim() && item.quantity > 0 && item.unitPrice > 0,
    );

    if (validItems.length === 0) {
      newErrors.items = 'Debe agregar al menos un item válido';
    }

    // Validar fecha no sea en el pasado
    if (formData.requiredDate) {
      const requiredDate = new Date(formData.requiredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (requiredDate < today) {
        newErrors.requiredDate = 'La fecha requerida no puede ser en el pasado';
      }
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

      const purchaseData = {
        ...formData,
        items: items.filter(item => item.description.trim()),
        totalAmount: getTotalAmount(),
        status: 'pending',
        requestedBy: 'Usuario Actual', // En implementación real vendría del contexto de auth
        requestDate: new Date().toISOString(),
      };

      // eslint-disable-next-line no-console`n      console.log('Nueva compra:', purchaseData);
      alert('Compra creada exitosamente');
      router.push('/compras');
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error creating purchase:', error);
      alert('Error al crear la compra');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProvider = () => {
    return providers.find(p => p.id === parseInt(formData.providerId));
  };

  const getSelectedCostCenter = () => {
    return costCenters.find(cc => cc.id === parseInt(formData.costCenterId));
  };

  const getSelectedCategory = () => {
    return categories.find(c => c.id === parseInt(formData.categoryId));
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nueva Compra — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='purchases-container'>
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
                <h1 className='purchases-title mb-0'>
                  <span className='material-icons me-2'>add_shopping_cart</span>
                  Nueva Compra
                </h1>
                <p className='purchases-subtitle'>
                  Crea una nueva orden de compra, servicio o mantenimiento
                </p>
              </div>
            </div>
          </div>

          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Columna principal */}
              <Col lg={8}>
                {/* Información General */}
                <Card className='purchase-form-section mb-4'>
                  <Card.Header className='section-header'>
                    <h6 className='mb-0'>
                      <span className='material-icons me-2'>info</span>
                      Información General
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row className='g-3'>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>
                            Tipo de Compra
                          </Form.Label>
                          <Form.Select
                            value={formData.type}
                            onChange={e =>
                              handleInputChange('type', e.target.value)
                            }
                          >
                            <option value='order'>Orden de Compra</option>
                            <option value='service'>
                              Contratación de Servicio
                            </option>
                            <option value='maintenance'>Mantenimiento</option>
                            <option value='supplies'>Suministros</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>
                            Prioridad
                          </Form.Label>
                          <Form.Select
                            value={formData.priority}
                            onChange={e =>
                              handleInputChange('priority', e.target.value)
                            }
                          >
                            <option value='low'>Baja</option>
                            <option value='medium'>Media</option>
                            <option value='high'>Alta</option>
                            <option value='urgent'>Urgente</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className='required'>
                            Descripción
                          </Form.Label>
                          <Form.Control
                            as='textarea'
                            rows={3}
                            placeholder='Describe detalladamente lo que necesitas comprar o contratar...'
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
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>
                            Fecha Requerida
                          </Form.Label>
                          <Form.Control
                            type='date'
                            value={formData.requiredDate}
                            onChange={e =>
                              handleInputChange('requiredDate', e.target.value)
                            }
                            isInvalid={!!errors.requiredDate}
                          />
                          <Form.Control.Feedback type='invalid'>
                            {errors.requiredDate}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Moneda</Form.Label>
                          <Form.Select
                            value={formData.currency}
                            onChange={e =>
                              handleInputChange('currency', e.target.value)
                            }
                          >
                            <option value='clp'>Peso Chileno (CLP)</option>
                            <option value='usd'>
                              Dólar Estadounidense (USD)
                            </option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Selección de Proveedor */}
                <Card className='purchase-form-section mb-4'>
                  <Card.Header className='section-header'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <h6 className='mb-0'>
                        <span className='material-icons me-2'>store</span>
                        Proveedor
                      </h6>
                      <Button
                        variant='outline-primary'
                        size='sm'
                        onClick={() => setShowProviderModal(true)}
                      >
                        <span className='material-icons me-1'>search</span>
                        Buscar Proveedor
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Row className='g-3'>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className='required'>
                            Proveedor Seleccionado
                          </Form.Label>
                          <Form.Select
                            value={formData.providerId}
                            onChange={e =>
                              handleInputChange('providerId', e.target.value)
                            }
                            isInvalid={!!errors.providerId}
                          >
                            <option value=''>Seleccione un proveedor</option>
                            {providers.map(provider => (
                              <option key={provider.id} value={provider.id}>
                                {provider.name} - {provider.category} (⭐{' '}
                                {provider.rating})
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type='invalid'>
                            {errors.providerId}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      {getSelectedProvider() && (
                        <Col xs={12}>
                          <div className='provider-selected-info'>
                            <div className='d-flex align-items-center'>
                              <div className='provider-logo me-3'>
                                {getSelectedProvider()!
                                  .name.substring(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <h6 className='mb-1'>
                                  {getSelectedProvider()!.name}
                                </h6>
                                <small className='text-muted'>
                                  Categoría: {getSelectedProvider()!.category} •
                                  Rating: ⭐ {getSelectedProvider()!.rating}
                                </small>
                              </div>
                            </div>
                          </div>
                        </Col>
                      )}
                    </Row>
                  </Card.Body>
                </Card>

                {/* Centro de Costo y Categoría */}
                <Card className='purchase-form-section mb-4'>
                  <Card.Header className='section-header'>
                    <h6 className='mb-0'>
                      <span className='material-icons me-2'>
                        account_balance_wallet
                      </span>
                      Presupuesto y Categorización
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row className='g-3'>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>
                            Centro de Costo
                          </Form.Label>
                          <Form.Select
                            value={formData.costCenterId}
                            onChange={e =>
                              handleInputChange('costCenterId', e.target.value)
                            }
                            isInvalid={!!errors.costCenterId}
                          >
                            <option value=''>
                              Seleccione un centro de costo
                            </option>
                            {costCenters.map(center => (
                              <option key={center.id} value={center.id}>
                                {center.name} - {center.department}
                                (Disponible:{' '}
                                {formatCurrency(
                                  center.budget - center.spent,
                                  formData.currency,
                                )}
                                )
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type='invalid'>
                            {errors.costCenterId}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className='required'>
                            Categoría
                          </Form.Label>
                          <Form.Select
                            value={formData.categoryId}
                            onChange={e =>
                              handleInputChange('categoryId', e.target.value)
                            }
                            isInvalid={!!errors.categoryId}
                          >
                            <option value=''>Seleccione una categoría</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type='invalid'>
                            {errors.categoryId}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      {getSelectedCostCenter() && (
                        <Col xs={12}>
                          <div className='budget-info'>
                            <div className='d-flex justify-content-between align-items-center'>
                              <span>Presupuesto disponible:</span>
                              <strong>
                                {formatCurrency(
                                  getSelectedCostCenter()!.budget -
                                    getSelectedCostCenter()!.spent,
                                  formData.currency,
                                )}
                              </strong>
                            </div>
                            <div className='progress mt-2'>
                              <div
                                className='progress-bar'
                                style={{
                                  width: `${(getSelectedCostCenter()!.spent / getSelectedCostCenter()!.budget) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </Col>
                      )}
                    </Row>

                    {showBudgetAlert && (
                      <Alert variant='warning' className='mt-3'>
                        <span className='material-icons me-2'>warning</span>
                        El monto total excede el presupuesto disponible del
                        centro de costo seleccionado.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>

                {/* Items de la Compra */}
                <Card className='purchase-form-section mb-4'>
                  <Card.Header className='section-header'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <h6 className='mb-0'>
                        <span className='material-icons me-2'>list</span>
                        Items de la Compra
                      </h6>
                      <Button
                        variant='outline-primary'
                        size='sm'
                        onClick={addItem}
                      >
                        <span className='material-icons me-1'>add</span>
                        Agregar Item
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {errors.items && (
                      <Alert variant='danger' className='mb-3'>
                        {errors.items}
                      </Alert>
                    )}

                    <div className='table-responsive'>
                      <Table className='items-table'>
                        <thead>
                          <tr>
                            <th>Descripción</th>
                            <th style={{ width: '100px' }}>Cantidad</th>
                            <th style={{ width: '100px' }}>Unidad</th>
                            <th style={{ width: '120px' }}>Precio Unit.</th>
                            <th style={{ width: '120px' }}>Total</th>
                            <th style={{ width: '60px' }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr key={item.id}>
                              <td>
                                <Form.Control
                                  type='text'
                                  placeholder='Descripción del item...'
                                  value={item.description}
                                  onChange={e =>
                                    handleItemChange(
                                      item.id,
                                      'description',
                                      e.target.value,
                                    )
                                  }
                                  size='sm'
                                />
                                <Form.Control
                                  as='textarea'
                                  rows={1}
                                  placeholder='Notas adicionales...'
                                  value={item.notes || ''}
                                  onChange={e =>
                                    handleItemChange(
                                      item.id,
                                      'notes',
                                      e.target.value,
                                    )
                                  }
                                  size='sm'
                                  className='mt-1'
                                />
                              </td>
                              <td>
                                <Form.Control
                                  type='number'
                                  min='1'
                                  value={item.quantity}
                                  onChange={e =>
                                    handleItemChange(
                                      item.id,
                                      'quantity',
                                      parseInt(e.target.value) || 1,
                                    )
                                  }
                                  size='sm'
                                />
                              </td>
                              <td>
                                <Form.Select
                                  value={item.unit}
                                  onChange={e =>
                                    handleItemChange(
                                      item.id,
                                      'unit',
                                      e.target.value,
                                    )
                                  }
                                  size='sm'
                                >
                                  <option value='unidad'>Unidad</option>
                                  <option value='metro'>Metro</option>
                                  <option value='metro2'>Metro²</option>
                                  <option value='metro3'>Metro³</option>
                                  <option value='litro'>Litro</option>
                                  <option value='kilogramo'>Kilogramo</option>
                                  <option value='saco'>Saco</option>
                                  <option value='caja'>Caja</option>
                                  <option value='servicio'>Servicio</option>
                                  <option value='hora'>Hora</option>
                                </Form.Select>
                              </td>
                              <td>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  step='0.01'
                                  value={item.unitPrice}
                                  onChange={e =>
                                    handleItemChange(
                                      item.id,
                                      'unitPrice',
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  size='sm'
                                />
                              </td>
                              <td>
                                <div className='fw-bold'>
                                  {item.totalPrice.toLocaleString()}
                                </div>
                              </td>
                              <td>
                                <Button
                                  variant='outline-danger'
                                  size='sm'
                                  onClick={() => removeItem(item.id)}
                                  disabled={items.length === 1}
                                >
                                  <span className='material-icons'>delete</span>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className='table-secondary'>
                            <td colSpan={4} className='text-end fw-bold'>
                              Total General:
                            </td>
                            <td className='fw-bold'>
                              {formatCurrency(
                                getTotalAmount(),
                                formData.currency,
                              )}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>

                {/* Notas y Justificación */}
                <Card className='purchase-form-section'>
                  <Card.Header className='section-header'>
                    <h6 className='mb-0'>
                      <span className='material-icons me-2'>note</span>
                      Notas y Justificación
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row className='g-3'>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label>Notas Adicionales</Form.Label>
                          <Form.Control
                            as='textarea'
                            rows={3}
                            placeholder='Información adicional sobre la compra...'
                            value={formData.notes}
                            onChange={e =>
                              handleInputChange('notes', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label>Justificación de la Solicitud</Form.Label>
                          <Form.Control
                            as='textarea'
                            rows={3}
                            placeholder='Explica por qué es necesaria esta compra...'
                            value={formData.requestJustification}
                            onChange={e =>
                              handleInputChange(
                                'requestJustification',
                                e.target.value,
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {/* Columna lateral */}
              <Col lg={4}>
                {/* Resumen */}
                <Card className='purchase-form-section mb-4'>
                  <Card.Header className='section-header'>
                    <h6 className='mb-0'>
                      <span className='material-icons me-2'>receipt</span>
                      Resumen de la Compra
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row className='g-2 text-center'>
                      <Col xs={6}>
                        <div className='summary-stat'>
                          <div className='stat-value'>{items.length}</div>
                          <div className='stat-label'>Items</div>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className='summary-stat'>
                          <div className='stat-value'>
                            {items.reduce(
                              (sum, item) => sum + item.quantity,
                              0,
                            )}
                          </div>
                          <div className='stat-label'>Cantidad Total</div>
                        </div>
                      </Col>
                      <Col xs={12}>
                        <div className='summary-total'>
                          <div className='total-label'>Total General</div>
                          <div className='total-value'>
                            {formatCurrency(
                              getTotalAmount(),
                              formData.currency,
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {getSelectedProvider() && (
                      <div className='mt-3 pt-3 border-top'>
                        <h6>Proveedor Seleccionado</h6>
                        <div className='d-flex align-items-center'>
                          <div className='provider-logo me-2'>
                            {getSelectedProvider()!
                              .name.substring(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className='fw-medium'>
                              {getSelectedProvider()!.name}
                            </div>
                            <small className='text-muted'>
                              ⭐ {getSelectedProvider()!.rating}
                            </small>
                          </div>
                        </div>
                      </div>
                    )}

                    {getSelectedCostCenter() && (
                      <div className='mt-3 pt-3 border-top'>
                        <h6>Centro de Costo</h6>
                        <div className='fw-medium'>
                          {getSelectedCostCenter()!.name}
                        </div>
                        <small className='text-muted'>
                          {getSelectedCostCenter()!.department}
                        </small>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* Información Importante */}
                <Card className='purchase-form-section'>
                  <Card.Header className='section-header'>
                    <h6 className='mb-0'>
                      <span className='material-icons me-2'>info</span>
                      Información Importante
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className='info-list'>
                      <div className='info-item'>
                        <span className='material-icons text-primary'>
                          check_circle
                        </span>
                        <div>
                          <strong>Proceso de Aprobación</strong>
                          <p>
                            Las compras superiores a $10,000 requieren
                            aprobación del administrador.
                          </p>
                        </div>
                      </div>
                      <div className='info-item'>
                        <span className='material-icons text-warning'>
                          schedule
                        </span>
                        <div>
                          <strong>Tiempo de Procesamiento</strong>
                          <p>
                            El tiempo estimado de procesamiento es de 2-5 días
                            hábiles.
                          </p>
                        </div>
                      </div>
                      <div className='info-item'>
                        <span className='material-icons text-info'>
                          description
                        </span>
                        <div>
                          <strong>Documentación</strong>
                          <p>
                            Asegúrate de adjuntar cotizaciones y documentos de
                            respaldo.
                          </p>
                        </div>
                      </div>
                    </div>
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
              <Button variant='outline-primary' disabled={loading}>
                <span className='material-icons me-2'>save</span>
                Guardar Borrador
              </Button>
              <Button type='submit' variant='primary' disabled={loading}>
                {loading ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2' />
                    Enviando...
                  </>
                ) : (
                  <>
                    <span className='material-icons me-2'>send</span>
                    Enviar Solicitud
                  </>
                )}
              </Button>
            </div>
          </Form>
        </div>

        {/* Modal de selección de proveedor */}
        <Modal
          show={showProviderModal}
          onHide={() => setShowProviderModal(false)}
          size='lg'
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <span className='material-icons me-2'>store</span>
              Seleccionar Proveedor
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className='provider-list'>
              {providers.map(provider => (
                <div
                  key={provider.id}
                  className={`provider-option ${formData.providerId === provider.id.toString() ? 'selected' : ''}`}
                  onClick={() => {
                    handleInputChange('providerId', provider.id.toString());
                    setShowProviderModal(false);
                  }}
                >
                  <div className='d-flex align-items-center'>
                    <div className='provider-logo me-3'>
                      {provider.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className='flex-grow-1'>
                      <h6 className='mb-1'>{provider.name}</h6>
                      <small className='text-muted'>
                        {provider.category} • ⭐ {provider.rating} •{' '}
                        {provider.status}
                      </small>
                    </div>
                    {formData.providerId === provider.id.toString() && (
                      <span className='material-icons text-primary'>
                        check_circle
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='outline-secondary'
              onClick={() => setShowProviderModal(false)}
            >
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </Layout>
    </ProtectedRoute>
  );
}

