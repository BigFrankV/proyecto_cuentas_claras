import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/layout/Layout';
import { ProtectedRoute, useAuth } from '../../../lib/useAuth';
import multasService from '../../../lib/multasService';
import { Multa, TipoInfraccion } from '../../../types/multas';
import Head from 'next/head';

export default function EditarMulta() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  // Estados
  const [multa, setMulta] = useState<Multa | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    motivo: '',
    descripcion: '',
    monto: 0,
    estado: 'pendiente' as Multa['estado']
  });

  // Tipos de infracción predefinidos
  const [tiposInfraccion, setTiposInfraccion] = useState<TipoInfraccion[]>([]);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadMulta(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    // Cargar tipos de infracción predefinidos
    const tipos = multasService.getTiposInfraccionPredefinidos();
    setTiposInfraccion(tipos);
  }, []);

  const loadMulta = async (multaId: number) => {
    try {
      setLoading(true);
      const multaData = await multasService.getMulta(multaId);
      setMulta(multaData);
      
      // Llenar el formulario con los datos actuales
      setFormData({
        motivo: multaData.tipo_infraccion,
        descripcion: multaData.descripcion,
        monto: multaData.monto,
        estado: multaData.estado
      });
    } catch (err) {
      setError('Error al cargar la multa');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Si cambia el tipo de infracción, actualizar el monto automáticamente
    if (field === 'motivo') {
      const tipoSeleccionado = tiposInfraccion.find(t => t.id === value || t.nombre === value);
      if (tipoSeleccionado) {
        setFormData(prev => ({ ...prev, monto: tipoSeleccionado.monto_base }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!multa) return;
    
    try {
      setSubmitting(true);
      
      await multasService.updateMulta(multa.id, {
        tipo_infraccion: formData.motivo,
        descripcion: formData.descripcion,
        monto: formData.monto,
        estado: formData.estado
      });
      
      // Redirigir a la vista detalle con mensaje de éxito
      router.push(`/multas/${multa.id}?updated=true`);
      
    } catch (error) {
      console.error('Error actualizando multa:', error);
      setError('Error al actualizar la multa. Intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (multa) {
      router.push(`/multas/${multa.id}`);
    } else {
      router.push('/multas');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="Cargando...">
          <div className="container-fluid py-4">
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando multa...</span>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error || !multa) {
    return (
      <ProtectedRoute>
        <Layout title="Error">
          <div className="container-fluid py-4">
            <div className="alert alert-danger">
              <h4 className="alert-heading">Error</h4>
              <p className="mb-0">{error || 'Multa no encontrada'}</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout title={`Editar Multa ${multa.numero}`}>
        <Head>
          <title>Editar Multa {multa.numero} - Cuentas Claras</title>
        </Head>

        <div className="container-fluid py-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">Editar Multa {multa.numero}</h1>
              <p className="text-muted mb-0">
                Unidad {multa.unidad_numero} - {multa.comunidad_nombre}
              </p>
            </div>
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={handleCancel}
            >
              <span className="material-icons me-2">arrow_back</span>
              Volver
            </button>
          </div>

          {/* Formulario */}
          <div className="row">
            <div className="col-lg-8">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Información de la Multa</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    {/* Tipo de Infracción */}
                    <div className="mb-3">
                      <label htmlFor="motivo" className="form-label">
                        Tipo de Infracción *
                      </label>
                      <select
                        id="motivo"
                        className="form-select"
                        value={formData.motivo}
                        onChange={(e) => handleInputChange('motivo', e.target.value)}
                        required
                      >
                        <option value="">Seleccionar tipo de infracción</option>
                        {tiposInfraccion.map((tipo) => (
                          <option key={tipo.id} value={tipo.nombre}>
                            {tipo.nombre} - {multasService.formatearMonto(tipo.monto_base)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Monto */}
                    <div className="mb-3">
                      <label htmlFor="monto" className="form-label">
                        Monto *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          id="monto"
                          className="form-control"
                          value={formData.monto}
                          onChange={(e) => handleInputChange('monto', parseInt(e.target.value) || 0)}
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="mb-3">
                      <label htmlFor="descripcion" className="form-label">
                        Descripción
                      </label>
                      <textarea
                        id="descripcion"
                        className="form-control"
                        rows={4}
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange('descripcion', e.target.value)}
                        placeholder="Descripción detallada de la infracción..."
                      />
                    </div>

                    {/* Estado */}
                    <div className="mb-4">
                      <label htmlFor="estado" className="form-label">
                        Estado
                      </label>
                      <select
                        id="estado"
                        className="form-select"
                        value={formData.estado}
                        onChange={(e) => handleInputChange('estado', e.target.value as Multa['estado'])}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="pagado">Pagado</option>
                        <option value="vencido">Vencido</option>
                        <option value="apelada">Apelada</option>
                        <option value="anulada">Anulada</option>
                      </select>
                    </div>

                    {/* Botones */}
                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                      >
                        {submitting && (
                          <span className="spinner-border spinner-border-sm me-2"></span>
                        )}
                        <span className="material-icons me-2">save</span>
                        {submitting ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                      
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleCancel}
                        disabled={submitting}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Panel lateral con información */}
            <div className="col-lg-4">
              <div className="card">
                <div className="card-header">
                  <h6 className="card-title mb-0">Información Original</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <strong>Fecha Infracción:</strong>
                    <div>{new Date(multa.fecha_infraccion).toLocaleDateString('es-CL')}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Fecha Vencimiento:</strong>
                    <div>{new Date(multa.fecha_vencimiento).toLocaleDateString('es-CL')}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Estado Actual:</strong>
                    <div>
                      <span className={`status-badge status-${multa.estado}`}>
                        {multasService.getEstadoLabel(multa.estado)}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>Creado:</strong>
                    <div>{new Date(multa.created_at).toLocaleDateString('es-CL')}</div>
                  </div>
                  {multa.updated_at && (
                    <div>
                      <strong>Última Actualización:</strong>
                      <div>{new Date(multa.updated_at).toLocaleDateString('es-CL')}</div>
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