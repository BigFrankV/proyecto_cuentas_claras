import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';

// Interfaces
interface Charge {
  id: string;
  concept: string;
  type: 'administration' | 'maintenance' | 'service' | 'insurance' | 'other';
  amount: number;
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'partial';
  unit: string;
  description?: string;
  createdAt: string;
  paymentDate?: string;
  paymentAmount?: number;
}

// Mock data - En un caso real vendría de la API
const mockCharges: Charge[] = [
  {
    id: 'CHG-2024-001',
    concept: 'Administración Enero 2024',
    type: 'administration',
    amount: 45000,
    dueDate: '2024-01-31',
    status: 'paid',
    unit: 'APT-101',
    description: 'Cuota de administración mensual',
    createdAt: '2024-01-01',
    paymentDate: '2024-01-25',
    paymentAmount: 45000
  },
  {
    id: 'CHG-2024-002',
    concept: 'Mantenimiento Ascensores',
    type: 'maintenance',
    amount: 25000,
    dueDate: '2024-02-15',
    status: 'pending',
    unit: 'APT-102',
    description: 'Mantenimiento preventivo ascensores',
    createdAt: '2024-02-01'
  },
  {
    id: 'CHG-2024-003',
    concept: 'Servicio de Seguridad',
    type: 'service',
    amount: 35000,
    dueDate: '2024-02-28',
    status: 'approved',
    unit: 'APT-103',
    description: 'Servicio de vigilancia 24/7',
    createdAt: '2024-02-01'
  }
];

export default function EditarCargoPage() {
  const router = useRouter();
  const { id } = router.query;
  const [charge, setCharge] = useState<Charge | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [formData, setFormData] = useState({
    concept: '',
    type: 'administration' as Charge['type'],
    amount: 0,
    dueDate: '',
    status: 'pending' as Charge['status'],
    unit: '',
    description: ''
  });

  useEffect(() => {
    if (id) {
      // Simular carga de datos - en un caso real sería una llamada a la API
      const foundCharge = mockCharges.find(c => c.id === id);
      if (foundCharge) {
        setCharge(foundCharge);
        setFormData({
          concept: foundCharge.concept,
          type: foundCharge.type,
          amount: foundCharge.amount,
          dueDate: foundCharge.dueDate,
          status: foundCharge.status,
          unit: foundCharge.unit,
          description: foundCharge.description || ''
        });
      }
      setLoading(false);
    }
  }, [id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      // Simular guardado - en un caso real sería una llamada a la API
      console.log('Guardando cargo:', { id, ...formData });
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirigir de vuelta a la lista
      router.push('/cargos');
    } catch (error) {
      console.error('Error al guardar:', error);
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

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'approved': 'Aprobado',
      'rejected': 'Rechazado',
      'paid': 'Pagado',
      'partial': 'Parcial'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="Editar Cargo">
          <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!charge) {
    return (
      <ProtectedRoute>
        <Layout title="Cargo no encontrado">
          <div className="container-fluid py-4">
            <div className="alert alert-warning">
              <h4>Cargo no encontrado</h4>
              <p>El cargo que estás buscando no existe o ha sido eliminado.</p>
              <button 
                className="btn btn-primary"
                onClick={() => router.push('/cargos')}
              >
                Volver a la lista
              </button>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Editar Cargo {charge.id} — Cuentas Claras</title>
      </Head>

      <Layout title={`Editar Cargo ${charge.id}`}>
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
                Editar {charge.id}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="charges-header mb-4">
            <h1 className="charges-title">
              ✏️ Editar Cargo
            </h1>
            <p className="charges-subtitle">
              Modifica la información del cargo {charge.id}
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
                        className="btn btn-primary"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Guardando...</span>
                            </span>
                            Guardando...
                          </>
                        ) : (
                          <>
                            💾 Guardar Cambios
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

            {/* Información adicional */}
            <div className="col-lg-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Información del Cargo</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">ID del Cargo</label>
                    <div className="charge-id fs-5">{charge.id}</div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Tipo Actual</label>
                    <div>
                      <span className={`charge-type ${charge.type}`}>
                        {getTypeText(charge.type)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Estado Actual</label>
                    <div>
                      <span className={`status-badge ${charge.status}`}>
                        {getStatusText(charge.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Fecha de Creación</label>
                    <div className="text-muted">
                      {new Date(charge.createdAt).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  {charge.paymentDate && (
                    <div className="mb-3">
                      <label className="form-label">Fecha de Pago</label>
                      <div className="text-success">
                        {new Date(charge.paymentDate).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}