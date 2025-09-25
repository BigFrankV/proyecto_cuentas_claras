import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
// ✅ Importar desde el servicio principal
import multasService from '../../lib/multasService';
import Layout from '../../components/layout/Layout';
// ✅ Importar el tipo correcto
import { Multa } from '../../types/multas';

const MultaDetalle = () => {
    const router = useRouter();
    const { id } = router.query;
    const [multa, setMulta] = useState<Multa | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (id && typeof id === 'string') {
            fetchMulta(parseInt(id));
        }
    }, [id]);

    const fetchMulta = async (multaId: number) => {
        try {
            setLoading(true);
            // ✅ Usar el método correcto del servicio
            const response = await multasService.getMulta(multaId);
            setMulta(response);
        } catch (err) {
            setError('Error al cargar la multa');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handlers para las acciones
    const handleRegistrarPago = () => {
        if (!multa) return;
        // Por ahora solo mostrar alert, después se puede implementar modal
        alert(`Registrando pago para multa ${multa.numero} - En desarrollo`);
        // TODO: Implementar modal o navegación para registrar pago
    };

    const handleEditar = () => {
        if (!multa) return;
        router.push(`/multas/${multa.id}/editar`);
    };

    const handleAnular = async () => {
        if (!multa) return;
        
        // Crear un modal personalizado usando window.prompt por ahora
        const motivo = window.prompt(
            `¿Está seguro que desea anular la multa ${multa.numero}?\n\nIngrese el motivo de anulación (opcional):`,
            ''
        );
        
        // Si el usuario cancela, no hacer nada
        if (motivo === null) return;
        
        try {
            console.log(`🚫 Anulando multa ${multa.id} con motivo:`, motivo);
            
            // Llamar al servicio para anular la multa
            await multasService.anularMulta(multa.id, motivo || undefined);
            
            // Mostrar mensaje de éxito
            alert(`✅ Multa ${multa.numero} anulada exitosamente`);
            
            // Recargar los datos de la multa
            await fetchMulta(multa.id);
            
        } catch (error) {
            console.error('Error anulando multa:', error);
            alert('❌ Error al anular la multa. Intente nuevamente.');
        }
    };

    if (loading) {
        return (
            <Layout title="Cargando multa...">
                <div className="container-fluid py-4">
                    <div className="text-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando multa...</span>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !multa) {
        return (
            <Layout title="Error">
                <div className="container-fluid py-4">
                    <div className="alert alert-danger">
                        <h4 className="alert-heading">Error</h4>
                        <p className="mb-0">{error || 'Multa no encontrada'}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Completar el return con toda la estructura del mockup:

    return (
        <Layout title={`Multa ${multa.numero}`}>
            <div className="container-fluid py-4">
                <div className="row">
                    <div className="col-lg-8">
                        {/* Header con estado */}
                        <div className="d-flex justify-content-between align-items-start mb-4">
                            <div>
                                <div className={`fine-status ${multa.estado}`}>
                                    <span className="material-icons me-2">schedule</span>
                                    {multasService.getEstadoLabel(multa.estado)}
                                </div>
                                <h2 className="h4 mb-1">Multa por {multa.tipo_infraccion}</h2>
                            </div>
                            <div className="text-end">
                                <div className="h3 mb-0 text-primary">
                                    {multasService.formatearMonto(multa.monto)}
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="d-flex flex-wrap gap-2 mb-4">
                            <button 
                                className="action-button success"
                                onClick={handleRegistrarPago}
                            >
                                <span className="material-icons">payment</span>
                                Registrar Pago
                            </button>
                            <button 
                                className="action-button warning"
                                onClick={handleEditar}
                                disabled={multa.estado === 'anulada'}
                                title={multa.estado === 'anulada' ? 'No se puede editar una multa anulada' : ''}
                            >
                                <span className="material-icons">edit</span>
                                Editar Multa
                            </button>
                            <button 
                                className="action-button danger"
                                onClick={handleAnular}
                                disabled={multa.estado === 'anulada'}
                                title={multa.estado === 'anulada' ? 'Esta multa ya está anulada' : ''}
                            >
                                <span className="material-icons">cancel</span>
                                Anular Multa
                            </button>
                        </div>

                        {/* Tabs */}
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    <span className="material-icons me-2">info</span>
                                    Información General
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'timeline' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('timeline')}
                                >
                                    <span className="material-icons me-2">timeline</span>
                                    Historial
                                </button>
                            </li>
                        </ul>

                        <div className="tab-content">
                            {activeTab === 'overview' && (
                                <div className="tab-pane fade show active p-3">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="text-muted small">Descripción</label>
                                            <p>{multa.descripcion}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small">Fecha de Infracción</label>
                                            <p>{new Date(multa.fecha_infraccion).toLocaleDateString('es-CL')}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small">Fecha de Vencimiento</label>
                                            <p>{new Date(multa.fecha_vencimiento).toLocaleDateString('es-CL')}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small">Días para Vencimiento</label>
                                            <p
                                                className={`fw-bold ${
                                                    multasService.estaVencida(multa.fecha_vencimiento)
                                                        ? 'text-danger'
                                                        : 'text-success'
                                                }`}
                                            >
                                                {multasService.calcularDiasVencimiento(multa.fecha_vencimiento)} días
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="tab-pane fade show active p-3">
                                    <div className="timeline">
                                        <div className="timeline-item">
                                            <div className="timeline-content">
                                                <div className="d-flex justify-content-between">
                                                    <h6>Multa Creada</h6>
                                                    <small className="text-muted">
                                                        {new Date(multa.created_at).toLocaleString('es-CL')}
                                                    </small>
                                                </div>
                                                <p className="mb-0">La multa fue creada por el sistema.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-4">
                        {/* Info Cards */}
                        <div className="info-card">
                            <div className="info-card-title">
                                <span className="material-icons">apartment</span>
                                Información de la Unidad
                            </div>
                            <div className="info-card-content">
                                <div className="mb-3">
                                    <label className="text-muted small">Unidad</label>
                                    <p className="fw-bold">{multa.unidad_numero}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small">Comunidad</label>
                                    <p>{multa.comunidad_nombre}</p>
                                </div>
                                {multa.propietario_nombre && (
                                    <div className="mb-3">
                                        <label className="text-muted small">Propietario</label>
                                        <p>{multa.propietario_nombre}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-card-title">
                                <span className="material-icons">attach_money</span>
                                Estado de Pago
                            </div>
                            <div className="info-card-content">
                                <div className="mb-3">
                                    <label className="text-muted small">Monto Total</label>
                                    <p className="h5 text-primary">{multasService.formatearMonto(multa.monto)}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small">Monto Pagado</label>
                                    <p className="h6 text-success">
                                        {multasService.formatearMonto(multa.monto_pagado || 0)}
                                    </p>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small">Saldo Pendiente</label>
                                    <p className="h6 text-danger">
                                        {multasService.formatearMonto(multa.monto - (multa.monto_pagado || 0))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MultaDetalle;