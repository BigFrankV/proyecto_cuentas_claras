import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Head from 'next/head';

// Interfaces
interface Charge {
  concept: string;
  type: 'administration' | 'maintenance' | 'service' | 'insurance' | 'other';
  amount: number;
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'partial';
  unit: string;
  description?: string;
}

export default function NuevoCargoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [formData, setFormData] = useState<Charge>({
    concept: '',
    type: 'administration',
    amount: 0,
    dueDate: '',
    status: 'pending',
    unit: '',
    description: ''
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.concept.trim()) {
      newErrors.concept = 'El concepto es obligatorio';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'La unidad es obligatoria';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'La fecha de vencimiento es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateId = () => {
    // Generar un ID simple para el ejemplo
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CHG-${year}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      // Simular creación - en un caso real sería una llamada a la API
      const newCharge = {
        id: generateId(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      console.log('Creando cargo:', newCharge);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirigir de vuelta a la lista
      router.push('/cargos');
    } catch (error) {
      console.error('Error al crear:', error);
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setSaving(false);
    }
  };

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'administration': 'Administración',
      'maintenance': 'Mantenimiento',
      'service': 'Servicio',
      'insurance': 'Seguro',
      'other': 'Otro'
    };
    return typeMap[type] || type;
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nuevo Cargo — Cuentas Claras</title>
      </Head>

      <Layout title="Nuevo Cargo">
        <div className="container-fluid py-4">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button 
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => router.push('/cargos')}
                >
                  Cargos
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Nuevo Cargo
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="charges-header mb-4">
            <h1 className="charges-title">
              ➕ Nuevo Cargo
            </h1>
            <p className="charges-subtitle">
              Crea un nuevo cargo para una unidad
            </p>
          </div>

          {/* Formulario */}
          <div className="row">
            <div className="col-lg-8">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Información del Cargo</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="concept" className="form-label">
                          Concepto <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.concept ? 'is-invalid' : ''}`}
                          id="concept"
                          value={formData.concept}
                          onChange={(e) => handleInputChange('concept', e.target.value)}
                          placeholder="Ej: Administración Febrero 2024"
                        />
                        {errors.concept && (
                          <div className="invalid-feedback">{errors.concept}</div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="unit" className="form-label">
                          Unidad <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.unit ? 'is-invalid' : ''}`}
                          id="unit"
                          value={formData.unit}
                          onChange={(e) => handleInputChange('unit', e.target.value)}
                          placeholder="Ej: APT-101"
                        />
                        {errors.unit && (
                          <div className="invalid-feedback">{errors.unit}</div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="type" className="form-label">Tipo</label>
                        <select
                          className="form-select"
                          id="type"
                          value={formData.type}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                        >
                          <option value="administration">Administración</option>
                          <option value="maintenance">Mantenimiento</option>
                          <option value="service">Servicio</option>
                          <option value="insurance">Seguro</option>
                          <option value="other">Otro</option>
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="status" className="form-label">Estado</label>
                        <select
                          className="form-select"
                          id="status"
                          value={formData.status}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="approved">Aprobado</option>
                          <option value="rejected">Rechazado</option>
                          <option value="paid">Pagado</option>
                          <option value="partial">Parcial</option>
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="amount" className="form-label">
                          Monto <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="number"
                            className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                            id="amount"
                            value={formData.amount}
                            onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="1000"
                          />
                          {errors.amount && (
                            <div className="invalid-feedback">{errors.amount}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="dueDate" className="form-label">
                          Fecha de Vencimiento <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className={`form-control ${errors.dueDate ? 'is-invalid' : ''}`}
                          id="dueDate"
                          value={formData.dueDate}
                          onChange={(e) => handleInputChange('dueDate', e.target.value)}
                        />
                        {errors.dueDate && (
                          <div className="invalid-feedback">{errors.dueDate}</div>
                        )}
                      </div>

                      <div className="col-12 mb-3">
                        <label htmlFor="description" className="form-label">Descripción</label>
                        <textarea
                          className="form-control"
                          id="description"
                          rows={3}
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Descripción adicional del cargo (opcional)"
                        />
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Creando...</span>
                            </span>
                            Creando...
                          </>
                        ) : (
                          <>
                            ➕ Crear Cargo
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => router.push('/cargos')}
                        disabled={saving}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Panel de ayuda */}
            <div className="col-lg-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">💡 Ayuda</h5>
                </div>
                <div className="card-body">
                  <h6>Tipos de Cargo:</h6>
                  <ul className="list-unstyled">
                    <li><span className="charge-type administration">Administración</span> - Cuotas mensuales</li>
                    <li><span className="charge-type maintenance">Mantenimiento</span> - Reparaciones</li>
                    <li><span className="charge-type service">Servicio</span> - Servicios adicionales</li>
                    <li><span className="charge-type insurance">Seguro</span> - Pólizas de seguro</li>
                    <li><span className="charge-type other">Otro</span> - Cargos especiales</li>
                  </ul>

                  <hr />

                  <h6>Estados:</h6>
                  <ul className="list-unstyled">
                    <li><span className="status-badge pending">Pendiente</span> - Por aprobar</li>
                    <li><span className="status-badge approved">Aprobado</span> - Listo para cobro</li>
                    <li><span className="status-badge paid">Pagado</span> - Completamente pagado</li>
                    <li><span className="status-badge partial">Parcial</span> - Pago parcial</li>
                    <li><span className="status-badge rejected">Rechazado</span> - No aprobado</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}