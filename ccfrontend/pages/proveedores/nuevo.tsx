import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { proveedoresService, ProveedorCreateRequest } from '@/lib/proveedoresService';

export default function NuevoProveedor() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState<ProveedorCreateRequest>({
    razon_social: '',
    rut: '',
    dv: '',
    giro: '',
    telefono: '',
    email: '',
    direccion: '',
    categorias: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [categoriaInput, setCategoriaInput] = useState('');

  const handleInputChange = (field: keyof ProveedorCreateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 8) {
      value = value.slice(0, 8);
    }

    setFormData(prev => ({ ...prev, rut: value }));

    if (errors.rut) {
      setErrors(prev => ({ ...prev, rut: '' }));
    }
  };

  const handleDvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^0-9K]/g, '');

    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    setFormData(prev => ({ ...prev, dv: value }));

    if (errors.dv) {
      setErrors(prev => ({ ...prev, dv: '' }));
    }
  };

  const agregarCategoria = () => {
    if (categoriaInput.trim() && !formData.categorias?.includes(categoriaInput.trim()) && (formData.categorias?.length || 0) < 10) {
      setFormData(prev => ({
        ...prev,
        categorias: [...(prev.categorias || []), categoriaInput.trim()]
      }));
      setCategoriaInput('');
    }
  };

  const removerCategoria = (categoriaARemover: string) => {
    setFormData(prev => ({
      ...prev,
      categorias: prev.categorias?.filter(cat => cat !== categoriaARemover) || []
    }));
  };

  const handleCategoriaKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregarCategoria();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.razon_social?.trim()) {
      newErrors.razon_social = 'La razón social es obligatoria';
    }

    if (!formData.rut?.trim()) {
      newErrors.rut = 'El RUT es obligatorio';
    } else if (formData.rut.length < 7) {
      newErrors.rut = 'El RUT debe tener al menos 7 dígitos';
    }

    if (!formData.dv?.trim()) {
      newErrors.dv = 'El dígito verificador es obligatorio';
    } else if (!proveedoresService.validateRut(formData.rut, formData.dv)) {
      newErrors.dv = 'El RUT y dígito verificador no son válidos';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
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
      // ✅ CORREGIR - Usar memberships correctamente:
      const comunidadId = user?.memberships?.[0]?.comunidadId;

      if (!comunidadId) {
        throw new Error('No se pudo obtener la comunidad del usuario');
      }

      await proveedoresService.createProveedor(comunidadId, formData);

      alert('Proveedor creado exitosamente');
      router.push('/proveedores');

    } catch (error: any) {
      console.error('Error creating proveedor:', error);
      const errorMsg = error.response?.data?.error || 'Error al crear proveedor';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nuevo Proveedor — Cuentas Claras</title>
      </Head>

      <Layout title="Nuevo Proveedor">
        <div className="container-fluid py-4">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 col-xl-6">
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-primary text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">
                      <i className="fas fa-store me-2"></i>
                      Registrar Nuevo Proveedor
                    </h4>
                    <Button
                      variant="outline-light"
                      size="sm"
                      onClick={() => router.back()}
                      disabled={loading}
                    >
                      <i className="fas fa-arrow-left me-1"></i>
                      Volver
                    </Button>
                  </div>
                </Card.Header>

                <Card.Body className="p-4">
                  <Form onSubmit={handleSubmit}>
                    {/* Razón Social */}
                    <div className="mb-4">
                      <Form.Label className="fw-semibold">
                        Razón Social <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ej: Empresa de Servicios Ltda."
                        value={formData.razon_social}
                        onChange={(e) => handleInputChange('razon_social', e.target.value)}
                        isInvalid={!!errors.razon_social}
                        disabled={loading}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.razon_social}
                      </Form.Control.Feedback>
                    </div>

                    {/* RUT */}
                    <Row className="mb-4">
                      <Col md={8}>
                        <Form.Label className="fw-semibold">
                          RUT <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="12345678"
                          value={formData.rut}
                          onChange={handleRutChange}
                          isInvalid={!!errors.rut}
                          disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.rut}
                        </Form.Control.Feedback>
                      </Col>
                      <Col md={4}>
                        <Form.Label className="fw-semibold">
                          DV <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="9"
                          value={formData.dv}
                          onChange={handleDvChange}
                          isInvalid={!!errors.dv}
                          disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.dv}
                        </Form.Control.Feedback>
                      </Col>
                    </Row>

                    {formData.rut && formData.dv && (
                      <div className="mb-3">
                        <small className="text-muted">
                          RUT completo: {proveedoresService.formatRut(formData.rut, formData.dv)}
                        </small>
                      </div>
                    )}

                    {/* Giro */}
                    <div className="mb-4">
                      <Form.Label className="fw-semibold">
                        Giro Comercial
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ej: Servicios de mantención, Construcción, etc."
                        value={formData.giro}
                        onChange={(e) => handleInputChange('giro', e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {/* Contacto */}
                    <Row className="mb-4">
                      <Col md={6}>
                        <Form.Label className="fw-semibold">
                          Teléfono
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="+56 9 1234 5678"
                          value={formData.telefono}
                          onChange={(e) => handleInputChange('telefono', e.target.value)}
                          disabled={loading}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="fw-semibold">
                          Email
                        </Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="contacto@empresa.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          isInvalid={!!errors.email}
                          disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Col>
                    </Row>

                    {/* Dirección */}
                    <div className="mb-4">
                      <Form.Label className="fw-semibold">
                        Dirección
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Calle Ejemplo 123, Comuna, Ciudad"
                        value={formData.direccion}
                        onChange={(e) => handleInputChange('direccion', e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {/* Categorías */}
                    <div className="mb-4">
                      <Form.Label className="fw-semibold">
                        Categorías de Servicio
                      </Form.Label>
                      <div className="input-group mb-2">
                        <Form.Control
                          type="text"
                          placeholder="Agregar categoría..."
                          value={categoriaInput}
                          onChange={(e) => setCategoriaInput(e.target.value)}
                          onKeyPress={handleCategoriaKeyPress}
                          disabled={loading || (formData.categorias?.length || 0) >= 10}
                        />
                        <Button
                          variant="outline-primary"
                          onClick={agregarCategoria}
                          disabled={loading || !categoriaInput.trim() || (formData.categorias?.length || 0) >= 10}
                        >
                          <i className="fas fa-plus"></i>
                        </Button>
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        {formData.categorias?.map((categoria) => (
                          <span key={categoria} className="badge bg-secondary d-flex align-items-center">
                            {categoria}
                            <button
                              type="button"
                              className="btn-close btn-close-white ms-2"
                              style={{ fontSize: '0.75em' }}
                              onClick={() => removerCategoria(categoria)}
                              disabled={loading}
                            ></button>
                          </span>
                        ))}
                      </div>

                      <Form.Text className="text-muted">
                        Máximo 10 categorías. Ej: Electricidad, Plomería, Jardinería, etc.
                      </Form.Text>
                    </div>

                    {/* Botones */}
                    <div className="d-flex gap-2 justify-content-end">
                      <Button
                        variant="outline-secondary"
                        onClick={() => router.back()}
                        disabled={loading}
                      >
                        <i className="fas fa-times me-2"></i>
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="success"
                        disabled={loading}
                        className="px-4"
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Guardar Proveedor
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
