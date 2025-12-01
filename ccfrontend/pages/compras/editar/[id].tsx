import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useMemo } from 'react';
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
import { comprasApi } from '@/lib/api/compras';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';
import { usePermissions, Permission } from '@/lib/usePermissions';
import { CompraBackend } from '@/types/compras';

// Función para formatear moneda chilena
const formatCurrency = (
  amount: number,
  currency: 'clp' | 'usd' = 'clp',
): string => {
  if (currency === 'clp') {
    return `$${amount.toLocaleString('es-CL')}`;
  } else {
    return `US$${amount.toLocaleString('en-US')}`;
  }
};

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
  status: 'pending' | 'approved' | 'rejected' | 'received';
}

interface Purchase {
  id: number;
  number: string;
  type: 'order' | 'service' | 'maintenance' | 'supplies';
  status:
    | 'draft'
    | 'pending'
    | 'approved'
    | 'in-progress'
    | 'delivered'
    | 'completed'
    | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  provider: {
    id: number;
    name: string;
    category: string;
    rating: number;
  };
  costCenter: {
    id: number;
    name: string;
    department: string;
    budget: number;
    spent: number;
  };
  category: {
    id: number;
    name: string;
    color: string;
  };
  items: PurchaseItem[];
  totalAmount: number;
  currency: 'clp' | 'usd';
  requiredDate: string;
  requestedBy: string;
  requestedDate: string;
  notes?: string;
  requestJustification?: string;
}

export default function EditarCompra() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { isSuperUser, hasPermission, hasRoleInCommunity } = usePermissions();
  const { comunidadSeleccionada } = useComunidad();

  // Resolver comunidad
  const resolvedComunidadId = useMemo(() => {
    if (typeof isSuperUser === 'function' ? isSuperUser() : isSuperUser) {
      return undefined;
    }
    if (comunidadSeleccionada && comunidadSeleccionada.id) {
      return Number(comunidadSeleccionada.id);
    }
    return user?.comunidad_id ?? undefined;
  }, [isSuperUser, comunidadSeleccionada, user?.comunidad_id]);

  // Bloquear acceso si el usuario tiene rol básico
  const isBasicRoleInCommunity = useMemo(() => {
    if (typeof isSuperUser === 'function' ? isSuperUser() : isSuperUser) {
      return false;
    }

    if (resolvedComunidadId) {
      return (
        hasRoleInCommunity(Number(resolvedComunidadId), 'residente') ||
        hasRoleInCommunity(Number(resolvedComunidadId), 'propietario') ||
        hasRoleInCommunity(Number(resolvedComunidadId), 'inquilino')
      );
    }

    const memberships = user?.memberships || [];
    if (memberships.length === 0) {
      return false;
    }

    const hasNonBasicRole = memberships.some((m: any) => {
      const rol = (m.rol || '').toLowerCase();
      return rol !== 'residente' && rol !== 'propietario' && rol !== 'inquilino';
    });

    return !hasNonBasicRole;
  }, [resolvedComunidadId, isSuperUser, hasRoleInCommunity, user?.memberships]);

  const [purchase, setPurchase] = useState<Purchase | null>(null);
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

  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadPurchaseData();
      loadInitialData();
    }
  }, [id]);

  const loadPurchaseData = async () => {
    try {
      setLoading(true);

      const compra: CompraBackend = await comprasApi.getById(Number(id));

      // Mapear CompraBackend a Purchase local
      const mappedPurchase: Purchase = {
        id: Number(compra.id),
        number: compra.folio ?? `#${compra.id}`,
        type: 'order', // por defecto
        status: 'pending', // por defecto
        priority: 'medium', // por defecto
        description: compra.glosa ?? '',
        provider: {
          id: Number(compra.proveedor_id ?? 0),
          name: compra.proveedor_nombre ?? '-',
          category: '',
          rating: 0,
        },
        costCenter: {
          id: Number(compra.centro_costo_id ?? 0),
          name: compra.centro_costo_nombre ?? '',
          department: '',
          budget: 0,
          spent: 0,
        },
        category: {
          id: 0,
          name: compra.categoria_gasto ?? '',
          color: '#ccc',
        },
        items: [], // por ahora vacío
        totalAmount: Number(compra.total ?? 0),
        currency: 'clp',
        requiredDate: compra.fecha_emision ?? compra.created_at ?? '',
        requestedBy: '',
        requestedDate: compra.created_at ?? '',
        notes: '',
        requestJustification: '',
      };

      setPurchase(mappedPurchase);

      // Llenar formulario con datos existentes
      setFormData({
        type: mappedPurchase.type,
        priority: mappedPurchase.priority,
        providerId: mappedPurchase.provider.id.toString(),
        costCenterId: mappedPurchase.costCenter.id.toString(),
        categoryId: mappedPurchase.category.id.toString(),
        description: mappedPurchase.description,
        requiredDate: mappedPurchase.requiredDate,
        currency: mappedPurchase.currency,
        notes: mappedPurchase.notes || '',
        requestJustification: mappedPurchase.requestJustification || '',
      });

      setItems(mappedPurchase.items);

      // Guardar datos originales para detectar cambios
      setOriginalData({
        formData: {
          type: mappedPurchase.type,
          priority: mappedPurchase.priority,
          providerId: mappedPurchase.provider.id.toString(),
          costCenterId: mappedPurchase.costCenter.id.toString(),
          categoryId: mappedPurchase.category.id.toString(),
          description: mappedPurchase.description,
          requiredDate: mappedPurchase.requiredDate,
          currency: mappedPurchase.currency,
          notes: mappedPurchase.notes || '',
          requestJustification: mappedPurchase.requestJustification || '',
        },
        items: mappedPurchase.items,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading purchase data:', error);
      setPurchase(null);
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      // Simular carga de datos de referencia
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
          budget: 8500000,
          spent: 2850000,
        },
        {
          id: 2,
          name: 'Servicios Generales',
          department: 'operations',
          budget: 6200000,
          spent: 1850000,
        },
        {
          id: 3,
          name: 'Administración',
          department: 'administration',
          budget: 4500000,
          spent: 1200000,
        },
        {
          id: 4,
          name: 'Jardinería y Paisajismo',
          department: 'operations',
          budget: 3800000,
          spent: 950000,
        },
        {
          id: 5,
          name: 'Seguridad',
          department: 'security',
          budget: 7500000,
          spent: 2800000,
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

  // Detectar cambios en el formulario
  useEffect(() => {
    if (originalData) {
      const formChanged =
        JSON.stringify(formData) !== JSON.stringify(originalData.formData);
      const itemsChanged =
        JSON.stringify(items) !== JSON.stringify(originalData.items);
      setHasChanges(formChanged || itemsChanged);
    }
  }, [formData, items, originalData]);

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
      status: 'pending',
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
      newErrors.items = 'Debe tener al menos un item válido';
    }

    // Validar fecha no sea en el pasado (solo para compras en borrador)
    if (purchase?.status === 'draft' && formData.requiredDate) {
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

    // Si hay cambios significativos en una compra aprobada, mostrar confirmación
    if (purchase?.status === 'approved' && hasChanges) {
      setShowConfirmModal(true);
      return;
    }

    await savePurchase();
  };

  const savePurchase = async (requiresReapproval = false) => {
    setSaving(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 2000));

      const updatedData = {
        ...formData,
        items: items.filter(item => item.description.trim()),
        totalAmount: getTotalAmount(),
        lastModified: new Date().toISOString(),
        modifiedBy: 'Usuario Actual',
        // Si requiere re-aprobación, cambiar estado a pendiente
        status: requiresReapproval ? 'pending' : purchase?.status,
      };

      // eslint-disable-next-line no-console

      // eslint-disable-next-line no-console
      console.log('Compra actualizada:', updatedData);

      if (requiresReapproval) {
        alert(
          'Compra actualizada. Se ha enviado para re-aprobación debido a los cambios realizados.',
        );
      } else {
        alert('Compra actualizada exitosamente');
      }

      router.push(`/compras/${id}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating purchase:', error);
      alert('Error al actualizar la compra');
    } finally {
      setSaving(false);
      setShowConfirmModal(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      draft: { label: 'Borrador', variant: 'secondary', icon: 'draft' },
      pending: { label: 'Pendiente', variant: 'warning', icon: 'schedule' },
      approved: { label: 'Aprobada', variant: 'success', icon: 'check_circle' },
      'in-progress': {
        label: 'En Progreso',
        variant: 'info',
        icon: 'progress_activity',
      },
      delivered: {
        label: 'Entregada',
        variant: 'primary',
        icon: 'local_shipping',
      },
      completed: { label: 'Completada', variant: 'success', icon: 'task_alt' },
      cancelled: { label: 'Cancelada', variant: 'danger', icon: 'cancel' },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.draft;
  };

  const canEdit = () => {
    return (
      purchase?.status === 'draft' ||
      purchase?.status === 'pending' ||
      purchase?.status === 'approved'
    );
  };

  const isReadOnly = () => {
    return !canEdit();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
  };

  // Si tiene rol básico, mostrar Acceso Denegado
  if (isBasicRoleInCommunity) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className='container-fluid'>
            <div className='row justify-content-center align-items-center min-vh-50'>
              <div className='col-12 col-md-8'>
                <div className='card shadow-sm'>
                  <div className='card-body text-center p-5'>
                    <div className='mb-4'>
                      <span className='material-icons text-danger' style={{ fontSize: '56px' }}>
                        block
                      </span>
                    </div>
                    <h2>Acceso Denegado</h2>
                    <p className='text-muted'>No tienes permisos para editar Compras. Solo usuarios con roles administrativos pueden acceder a esta sección.</p>
                    <Button variant='primary' onClick={() => router.push('/compras')}>
                      Volver a Compras
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ minHeight: '400px' }}
          >
            <div className='text-center'>
              <div className='spinner-border text-primary mb-3' />
              <p>Cargando compra...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!purchase) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className='text-center py-5'>
            <span
              className='material-icons text-muted mb-3'
              style={{ fontSize: '4rem' }}
            >
              error_outline
            </span>
            <h4>Compra no encontrada</h4>
            <p className='text-muted'>
              La compra que intentas editar no existe o ha sido eliminada.
            </p>
            <Button variant='primary' onClick={() => router.push('/compras')}>
              Volver a Compras
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (isReadOnly()) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className='text-center py-5'>
            <span
              className='material-icons text-warning mb-3'
              style={{ fontSize: '4rem' }}
            >
              lock
            </span>
            <h4>Compra no editable</h4>
            <p className='text-muted'>
              Esta compra está en estado &quot;
              {getStatusInfo(purchase.status).label}
              &quot; y no puede ser editada.
            </p>
            <div className='d-flex gap-2 justify-content-center'>
              <Button variant='outline-secondary' onClick={() => router.back()}>
                Volver
              </Button>
              <Button
                variant='primary'
                onClick={() => router.push(`/compras/${id}`)}
              >
                Ver Detalles
              </Button>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const statusInfo = getStatusInfo(purchase.status);

  return (
    <ProtectedRoute>
      <Head>
        <title>Editar {purchase.number} — Cuentas Claras</title>
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
                <div className='d-flex align-items-center gap-3 mb-2'>
                  <h1 className='purchases-title mb-0'>
                    <span className='material-icons me-2'>edit</span>
                    Editar {purchase.number}
                  </h1>
                  <Badge
                    bg={statusInfo.variant}
                    className='d-flex align-items-center'
                  >
                    <span
                      className='material-icons me-1'
                      style={{ fontSize: '16px' }}
                    >
                      {statusInfo.icon}
                    </span>
                    {statusInfo.label}
                  </Badge>
                  {hasChanges && (
                    <Badge bg='info' className='d-flex align-items-center'>
                      <span
                        className='material-icons me-1'
                        style={{ fontSize: '16px' }}
                      >
                        edit_note
                      </span>
                      Cambios pendientes
                    </Badge>
                  )}
                </div>
                <p className='purchases-subtitle'>
                  Editando compra solicitada por {purchase.requestedBy}
                </p>
              </div>
            </div>
          </div>

          {/* Alertas de estado */}
          {purchase.status === 'approved' && (
            <Alert variant='warning' className='mb-4'>
              <span className='material-icons me-2'>warning</span>
              <strong>Atención:</strong> Esta compra ya está aprobada. Los
              cambios significativos requerirán re-aprobación y volverán el
              estado a &quot;Pendiente&quot;.
            </Alert>
          )}

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
                    <h6 className='mb-0'>
                      <span className='material-icons me-2'>store</span>
                      Proveedor
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row className='g-3'>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className='required'>
                            Proveedor
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
                      Resumen de Cambios
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

                    {hasChanges && (
                      <Alert variant='info' className='mt-3 mb-0'>
                        <small>
                          <span
                            className='material-icons me-1'
                            style={{ fontSize: '16px' }}
                          >
                            info
                          </span>
                          Tienes cambios pendientes de guardar
                        </small>
                      </Alert>
                    )}
                  </Card.Body>
                </Card>

                {/* Estado Actual */}
                <Card className='purchase-form-section mb-4'>
                  <Card.Header className='section-header'>
                    <h6 className='mb-0'>
                      <span className='material-icons me-2'>info</span>
                      Estado Actual
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className='d-flex align-items-center mb-3'>
                      <Badge
                        bg={statusInfo.variant}
                        className='d-flex align-items-center'
                      >
                        <span
                          className='material-icons me-1'
                          style={{ fontSize: '16px' }}
                        >
                          {statusInfo.icon}
                        </span>
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <div className='small text-muted'>
                      <div>
                        <strong>Solicitada por:</strong> {purchase.requestedBy}
                      </div>
                      <div>
                        <strong>Fecha de solicitud:</strong>{' '}
                        {new Date(purchase.requestedDate).toLocaleDateString(
                          'es-ES',
                        )}
                      </div>
                      {purchase.status === 'approved' && (
                        <div className='mt-2 text-warning'>
                          <span
                            className='material-icons me-1'
                            style={{ fontSize: '16px' }}
                          >
                            warning
                          </span>
                          Cambios significativos requerirán re-aprobación
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>

                {/* Información Importante */}
                <Card className='purchase-form-section'>
                  <Card.Header className='section-header'>
                    <h6 className='mb-0'>
                      <span className='material-icons me-2'>info</span>
                      Información
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className='info-list'>
                      <div className='info-item'>
                        <span className='material-icons text-primary'>
                          save
                        </span>
                        <div>
                          <strong>Guardado Automático</strong>
                          <p>Los cambios se detectan automáticamente.</p>
                        </div>
                      </div>
                      <div className='info-item'>
                        <span className='material-icons text-warning'>
                          refresh
                        </span>
                        <div>
                          <strong>Re-aprobación</strong>
                          <p>
                            Cambios en compras aprobadas requieren nueva
                            aprobación.
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
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                variant='primary'
                disabled={saving || !hasChanges}
              >
                {saving ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2' />
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className='material-icons me-2'>save</span>
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </Form>
        </div>

        {/* Modal de Confirmación */}
        <Modal
          show={showConfirmModal}
          onHide={() => setShowConfirmModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <span className='material-icons me-2 text-warning'>warning</span>
              Confirmar Cambios
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Esta compra está <strong>aprobada</strong>. Los cambios que
              realizaste requieren una nueva aprobación.
            </p>
            <p>
              ¿Deseas continuar? El estado cambiará a &quot;Pendiente&quot; y
              deberá ser aprobada nuevamente.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='outline-secondary'
              onClick={() => setShowConfirmModal(false)}
            >
              Cancelar
            </Button>
            <Button variant='warning' onClick={() => savePurchase(true)}>
              <span className='material-icons me-2'>refresh</span>
              Continuar (Requiere Re-aprobación)
            </Button>
          </Modal.Footer>
        </Modal>
      </Layout>
    </ProtectedRoute>
  );
}
