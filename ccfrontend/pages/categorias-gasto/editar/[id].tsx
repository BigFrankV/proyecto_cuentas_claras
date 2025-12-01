import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Card, Form, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-hot-toast';

import Layout from '@/components/layout/Layout';
import { categoriasGastoApi } from '@/lib/api/categoriasGasto';
import { ProtectedRoute } from '@/lib/useAuth';
import { useAuth } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';
import { usePermissions } from '@/lib/usePermissions';
import {
  CategoriaGasto,
  ActualizarCategoriaRequest,
} from '@/types/categoriasGasto';

interface FormData {
  nombre: string;
  tipo: string;
  cta_contable: string;
  activa: boolean;
}

interface ValidationErrors {
  nombre?: string;
  tipo?: string;
  cta_contable?: string;
}

const TIPOS_CATEGORIA = [
  { value: 'operacional', label: 'Operacional' },
  { value: 'extraordinario', label: 'Extraordinario' },
  { value: 'fondo_reserva', label: 'Fondo Reserva' },
  { value: 'multas', label: 'Multas' },
  { value: 'consumo', label: 'Consumo' },
];

export default function EditarCategoriaGasto() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { isSuperUser, currentRole, hasRoleInCommunity } = usePermissions();
  const { comunidadSeleccionada } = useComunidad();

  const [categoria, setCategoria] = useState<CategoriaGasto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    tipo: '',
    cta_contable: '',
    activa: true,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  // Resolver comunidad
  const resolvedComunidadId = useMemo(() => {
    if (typeof isSuperUser === 'function' ? isSuperUser() : isSuperUser) {
      return categoria?.comunidad_id ?? undefined;
    }
    if (comunidadSeleccionada && comunidadSeleccionada.id) {
      return Number(comunidadSeleccionada.id);
    }
    return categoria?.comunidad_id ?? user?.comunidad_id ?? undefined;
  }, [isSuperUser, comunidadSeleccionada, categoria?.comunidad_id, user?.comunidad_id]);

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

  // Cargar datos de la categoría
  useEffect(() => {
    if (!id || !isAuthenticated || authLoading) {
      return;
    }

    const loadCategoria = async () => {
      try {
        setLoading(true);
        const categoriaData = await categoriasGastoApi.getById(Number(id));
        setCategoria(categoriaData);

        const formDataFromCategoria: FormData = {
          nombre: categoriaData.nombre,
          tipo: categoriaData.tipo,
          cta_contable: categoriaData.cta_contable || '',
          activa: categoriaData.activa,
        };

        setFormData(formDataFromCategoria);
        setOriginalData(formDataFromCategoria);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error al cargar categoría:', error);
        toast.error('Error al cargar la categoría');
        router.push('/categorias-gasto');
      } finally {
        setLoading(false);
      }
    };

    loadCategoria();
  }, [id, isAuthenticated, authLoading, router]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'El tipo es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verificar si hay cambios
  const hasChanges = (): boolean => {
    if (!originalData) {
      return false;
    }

    return (
      formData.nombre !== originalData.nombre ||
      formData.tipo !== originalData.tipo ||
      formData.cta_contable !== originalData.cta_contable ||
      formData.activa !== originalData.activa
    );
  };

  // Manejar cambios en el formulario
  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean,
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !categoria) {
      return;
    }

    try {
      setSaving(true);

      const updateData: ActualizarCategoriaRequest = {
        nombre: formData.nombre.trim(),
        tipo: formData.tipo,
        cta_contable: formData.cta_contable.trim() || undefined,
        activa: formData.activa,
      };

      await categoriasGastoApi.update(categoria.id, updateData);

      toast.success('Categoría actualizada exitosamente');
      router.push('/categorias-gasto');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al actualizar categoría:', error);
      toast.error('Error al actualizar la categoría');
    } finally {
      setSaving(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    if (hasChanges()) {
      if (
        window.confirm(
          '¿Estás seguro de que quieres cancelar? Los cambios se perderán.',
        )
      ) {
        router.push('/categorias-gasto');
      }
    } else {
      router.push('/categorias-gasto');
    }
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
                    <p className='text-muted'>No tienes permisos para editar Categorías de Gasto en la comunidad seleccionada. Solo usuarios con roles administrativos pueden realizar esta acción.</p>
                    <button
                      className='btn btn-primary mt-3'
                      onClick={() => router.push('/categorias-gasto')}
                    >
                      Volver al Listado
                    </button>
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
        <Layout title='Editar Categoría de Gasto'>
          <div className='container-fluid p-4'>
            <div className='row justify-content-center'>
              <div className='col-12 col-md-8 col-lg-6'>
                <Card>
                  <Card.Body className='text-center py-5'>
                    <Spinner animation='border' />
                    <p className='mt-3'>Cargando categoría...</p>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!categoria) {
    return (
      <ProtectedRoute>
        <Layout title='Editar Categoría de Gasto'>
          <div className='container-fluid p-4'>
            <div className='row justify-content-center'>
              <div className='col-12 col-md-8 col-lg-6'>
                <Alert variant='danger'>
                  <i className='material-icons me-2'>error</i>
                  No se pudo cargar la categoría
                </Alert>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Editar Categoría de Gasto — Cuentas Claras</title>
      </Head>

      <Layout title='Editar Categoría de Gasto'>
        <div className='container-fluid p-4'>
          <div className='row justify-content-center'>
            <div className='col-12 col-md-8 col-lg-6'>
              <Card>
                <Card.Header>
                  <div className='d-flex justify-content-between align-items-center'>
                    <h5 className='mb-0'>Editar Categoría</h5>
                    <Button
                      variant='outline-secondary'
                      size='sm'
                      onClick={handleCancel}
                    >
                      <i className='material-icons me-1'>arrow_back</i>
                      Volver
                    </Button>
                  </div>
                </Card.Header>

                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    {/* Nombre */}
                    <Form.Group className='mb-3'>
                      <Form.Label>Nombre *</Form.Label>
                      <Form.Control
                        type='text'
                        value={formData.nombre}
                        onChange={e =>
                          handleInputChange('nombre', e.target.value)
                        }
                        isInvalid={!!errors.nombre}
                        placeholder='Ingrese el nombre de la categoría'
                      />
                      <Form.Control.Feedback type='invalid'>
                        {errors.nombre}
                      </Form.Control.Feedback>
                    </Form.Group>

                    {/* Tipo */}
                    <Form.Group className='mb-3'>
                      <Form.Label>Tipo *</Form.Label>
                      <Form.Select
                        value={formData.tipo}
                        onChange={e =>
                          handleInputChange('tipo', e.target.value)
                        }
                        isInvalid={!!errors.tipo}
                      >
                        <option value=''>Seleccione un tipo</option>
                        {TIPOS_CATEGORIA.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type='invalid'>
                        {errors.tipo}
                      </Form.Control.Feedback>
                    </Form.Group>

                    {/* Cuenta Contable */}
                    <Form.Group className='mb-3'>
                      <Form.Label>Cuenta Contable</Form.Label>
                      <Form.Control
                        type='text'
                        value={formData.cta_contable}
                        onChange={e =>
                          handleInputChange('cta_contable', e.target.value)
                        }
                        placeholder='Código de cuenta contable (opcional)'
                      />
                      <Form.Text className='text-muted'>
                        Código opcional para integración contable
                      </Form.Text>
                    </Form.Group>

                    {/* Estado Activa */}
                    <Form.Group className='mb-4'>
                      <Form.Check
                        type='switch'
                        id='activa-switch'
                        label='Categoría activa'
                        checked={formData.activa}
                        onChange={e =>
                          handleInputChange('activa', e.target.checked)
                        }
                      />
                      <Form.Text className='text-muted'>
                        Las categorías inactivas no se pueden usar en nuevos
                        gastos
                      </Form.Text>
                    </Form.Group>

                    {/* Información de la categoría */}
                    <div className='mb-4 p-3 bg-light rounded'>
                      <h6 className='text-muted mb-2'>
                        Información de la Categoría
                      </h6>
                      <div className='row text-sm'>
                        <div className='col-6'>
                          <strong>ID:</strong> {categoria.id}
                        </div>
                        <div className='col-6'>
                          <strong>Comunidad:</strong>{' '}
                          {categoria.comunidad_nombre}
                        </div>
                        <div className='col-6'>
                          <strong>Creada:</strong>{' '}
                          {new Date(categoria.created_at).toLocaleDateString()}
                        </div>
                        <div className='col-6'>
                          <strong>Actualizada:</strong>{' '}
                          {new Date(categoria.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Botones */}
                    <div className='d-flex gap-2 justify-content-end'>
                      <Button
                        variant='outline-secondary'
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type='submit'
                        variant='primary'
                        disabled={saving || !hasChanges()}
                      >
                        {saving ? (
                          <>
                            <Spinner size='sm' className='me-2' />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <i className='material-icons me-1'>save</i>
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
