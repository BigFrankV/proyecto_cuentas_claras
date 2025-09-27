import React, { useState, useRef, useEffect } from 'react';  // ← AGREGAR useEffect
import { useRouter } from 'next/router';
import { Form, Button, Alert, Card, Badge } from 'react-bootstrap';
import { useAuth } from '@/lib/useAuth';
import { gastosService } from '@/lib/gastosService';
import { proveedoresService } from '@/lib/proveedoresService';  // ← AGREGAR
import { GastoCreateRequest } from '@/types/gastos';

export default function GastoNuevo() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<GastoCreateRequest>({
    categoria_id: 0,
    fecha: new Date().toISOString().split('T')[0],
    monto: 0,
    glosa: '',
    extraordinario: false,
    // ✅ AGREGAR ESTOS CAMPOS:
    centro_costo_id: null,
    proveedor_id: null,
    documento_compra_id: null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // ✅ AGREGAR useState para proveedores
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.glosa?.trim()) {
      newErrors.glosa = 'La descripción es obligatoria';
    }

    if (!formData.categoria_id || formData.categoria_id === 0) {
      newErrors.categoria_id = 'La categoría es obligatoria';
    }

    if (!formData.monto || formData.monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    }

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const comunidadId = 2; // Tu comunidad actual
      await gastosService.createGasto(comunidadId, formData);

      // Éxito
      alert('Gasto creado exitosamente');
      router.push('/gastos');

    } catch (error) {
      console.error('Error creating gasto:', error);
      alert('Error al crear el gasto');
    } finally {
      setLoading(false);
    }
  };

  // Manejo de cambios en inputs
  const handleInputChange = (field: keyof GastoCreateRequest, value: any) => {
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

  // Manejo del monto con formato
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    const numericValue = parseInt(rawValue) || 0;
    setFormData(prev => ({
      ...prev,
      monto: numericValue
    }));
  };

  // Manejo de archivos
  const handleFiles = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).filter(file => file.size <= 10 * 1024 * 1024); // 10MB límite
      setAttachments(prev => [...prev, ...newFiles].slice(0, 5)); // máximo 5 archivos
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Manejo de drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  // Manejo de tags
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Formatear monto para display
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  // ✅ CARGAR PROVEEDORES AL INICIAR
  useEffect(() => {
    const cargarProveedores = async () => {
      setLoadingProveedores(true);
      try {
        // Aquí llamarías a tu servicio de proveedores
        // const response = await proveedoresService.getProveedores(comunidadId);
        // setProveedores(response.data);
        
        // Por ahora usamos datos mock:
        setProveedores([
          { id: 1, nombre: 'Empresa de Limpieza Central', activo: true },
          { id: 2, nombre: 'Ferretería San José', activo: true },
          { id: 3, nombre: 'Electricista López y Asociados', activo: true },
          { id: 4, nombre: 'Jardinería Verde Limpio', activo: true },
          { id: 5, nombre: 'Pinturas El Color', activo: true }
        ]);
      } catch (error) {
        console.error('Error cargando proveedores:', error);
      } finally {
        setLoadingProveedores(false);
      }
    };

    cargarProveedores();
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 col-xl-6">
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <i className="fas fa-plus-circle me-2"></i>
                  Registrar Nuevo Gasto
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
                {/* Descripción */}
                <div className="mb-4">
                  <Form.Label className="fw-semibold">
                    Descripción del Gasto <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: Mantenimiento de ascensores, Suministros de limpieza..."
                    value={formData.glosa}
                    onChange={(e) => handleInputChange('glosa', e.target.value)}
                    isInvalid={!!errors.glosa}
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.glosa}
                  </Form.Control.Feedback>
                </div>

                {/* Categoría */}
                <div className="mb-4">
                  <Form.Label className="fw-semibold">
                    Categoría <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.categoria_id}
                    onChange={(e) => handleInputChange('categoria_id', parseInt(e.target.value))}
                    isInvalid={!!errors.categoria_id}
                    disabled={loading}
                  >
                    <option value={0}>Selecciona una categoría</option>
                    <option value={3}>Mantenimiento Edificios</option>
                    <option value={4}>Seguros</option>
                    <option value={1}>Gastos Generales</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.categoria_id}
                  </Form.Control.Feedback>
                </div>

                {/* Proveedor */}
                <div className="mb-4">
                  <Form.Label className="fw-semibold">
                    Proveedor
                  </Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Select
                      value={formData.proveedor_id || 0}
                      onChange={(e) => handleInputChange('proveedor_id', e.target.value === '0' ? null : parseInt(e.target.value))}
                      disabled={loading || loadingProveedores}
                      className="flex-grow-1"
                    >
                      <option value={0}>Sin proveedor especificado</option>
                      {proveedores.map(proveedor => (
                        <option key={proveedor.id} value={proveedor.id}>
                          {proveedor.nombre}
                        </option>
                      ))}
                    </Form.Select>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={loading}
                      onClick={() => {
                        // Aquí podrías abrir modal para crear nuevo proveedor
                        alert('Funcionalidad de crear proveedor - próximamente');
                      }}
                      title="Agregar nuevo proveedor"
                    >
                      <i className="fas fa-plus"></i>
                    </Button>
                  </div>
                  <Form.Text className="text-muted">
                    Selecciona el proveedor o deja en blanco si es un gasto interno
                  </Form.Text>
                </div>

                {/* Monto */}
                <div className="mb-4">
                  <Form.Label className="fw-semibold">
                    Monto <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <Form.Control
                      type="text"
                      placeholder="0"
                      value={formData.monto?.toString() || ''}
                      onChange={handleAmountChange}
                      isInvalid={!!errors.monto}
                      disabled={loading}
                    />
                  </div>
                  {formData.monto > 0 && (
                    <Form.Text className="text-success fw-medium">
                      {formatAmount(formData.monto)}
                    </Form.Text>
                  )}
                  <Form.Control.Feedback type="invalid">
                    {errors.monto}
                  </Form.Control.Feedback>
                </div>

                {/* Fecha */}
                <div className="mb-4">
                  <Form.Label className="fw-semibold">
                    Fecha del Gasto <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => handleInputChange('fecha', e.target.value)}
                    isInvalid={!!errors.fecha}
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.fecha}
                  </Form.Control.Feedback>
                </div>

                {/* Gasto Extraordinario */}
                <div className="mb-4">
                  <Form.Check
                    type="checkbox"
                    id="extraordinario"
                    label="Este es un gasto extraordinario"
                    checked={formData.extraordinario}
                    onChange={(e) => handleInputChange('extraordinario', e.target.checked)}
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    Los gastos extraordinarios requieren aprobación especial
                  </Form.Text>
                </div>

                {/* Archivos Adjuntos */}
                <div className="mb-4">
                  <Form.Label className="fw-semibold">
                    Documentos de Respaldo
                  </Form.Label>
                  <div
                    className={`border-2 border-dashed p-4 text-center rounded ${dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
                      }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <i className="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                    <p className="mb-2">
                      Arrastra archivos aquí o{' '}
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                      >
                        selecciona archivos
                      </Button>
                    </p>
                    <small className="text-muted">
                      Máximo 5 archivos, 10MB cada uno (PDF, JPG, PNG, DOC)
                    </small>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFiles(e.target.files)}
                    style={{ display: 'none' }}
                  />

                  {/* Lista de archivos */}
                  {attachments.length > 0 && (
                    <div className="mt-3">
                      {attachments.map((file, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center p-2 border rounded mb-2">
                          <span className="small">
                            <i className="fas fa-file me-2"></i>
                            {file.name}
                          </span>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            disabled={loading}
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <Form.Label className="fw-semibold">
                    Etiquetas (Opcional)
                  </Form.Label>
                  <div className="input-group mb-2">
                    <Form.Control
                      type="text"
                      placeholder="Agregar etiqueta..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      disabled={loading || tags.length >= 5}
                    />
                    <Button
                      variant="outline-primary"
                      onClick={addTag}
                      disabled={loading || !tagInput.trim() || tags.length >= 5}
                    >
                      <i className="fas fa-plus"></i>
                    </Button>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} bg="secondary" className="d-flex align-items-center">
                        {tag}
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-2"
                          style={{ fontSize: '0.75em' }}
                          onClick={() => removeTag(tag)}
                          disabled={loading}
                        ></button>
                      </Badge>
                    ))}
                  </div>
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
                        Guardar Gasto
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
  );
}