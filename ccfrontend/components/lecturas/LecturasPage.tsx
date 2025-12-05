import React, { useState, useEffect, ChangeEvent, FormEvent, useMemo } from 'react';
import { Button, Form, InputGroup, Alert } from 'react-bootstrap';

import ModernPagination from '@/components/ui/ModernPagination';
import PageHeader from '@/components/ui/PageHeader';
import {
  listAllMedidores,
  listLecturas,
  createLectura,
} from '@/lib/medidoresService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';
import { usePermissions } from '@/lib/usePermissions';
import { Medidor as Meter, Reading as Reading } from '@/types/medidores';  // Asume que existe en types/medidores.ts



export default function LecturasPage(): React.ReactElement {
  const { user } = useAuth();
  const { hasPermission, hasRoleInCommunity, isSuperUser } = usePermissions();
  const { comunidadSeleccionada, comunidades } = useComunidad();
  const [meters, setMeters] = useState<Meter[]>([]);
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [readingDate, setReadingDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [currentReading, setCurrentReading] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [readingPeriod, setReadingPeriod] = useState<string>('');  // Inicializa como string vacío
  const [selectedComunidad, setSelectedComunidad] = useState<number | null>(null);

  // Determinar la comunidad a usar (global filter)
  const resolvedComunidadId = useMemo(() => {
    const isSuper = isSuperUser();
    return isSuper ? selectedComunidad : comunidadSeleccionada?.id || null;
  }, [isSuperUser, selectedComunidad, comunidadSeleccionada]);

  // Verificar si es un rol básico (NO puede crear lecturas)
  const isBasicRoleInCommunity = useMemo(() => {
    if (!resolvedComunidadId) {return false;}
    const comunidadId = typeof resolvedComunidadId === 'string' ? parseInt(resolvedComunidadId, 10) : resolvedComunidadId;
    return (
      hasRoleInCommunity(comunidadId, 'residente') ||
      hasRoleInCommunity(comunidadId, 'propietario') ||
      hasRoleInCommunity(comunidadId, 'inquilino')
    );
  }, [resolvedComunidadId, hasRoleInCommunity]);
  // Cargar medidores al montar o cuando cambia la comunidad
  useEffect(() => {
    const loadMeters = async () => {
      setLoading(true);
      try {
        const params: any = { limit: 100 };
        if (resolvedComunidadId) {
          params.comunidad_id = typeof resolvedComunidadId === 'string' ? parseInt(resolvedComunidadId, 10) : resolvedComunidadId;
        }
        const resp = await listAllMedidores(params);
        setMeters(resp.data || []);
        if (resp.data?.length > 0) {setSelectedMeter(resp.data[0]);}
      } catch (err) {
        // Error al cargar medidores - se maneja de forma silenciosa
      } finally {
        setLoading(false);
      }
    };
    loadMeters();
  }, [resolvedComunidadId, comunidadSeleccionada]);

  // Cargar lecturas cuando cambia medidor
  useEffect(() => {
    if (!selectedMeter) {return;}
    const loadReadings = async () => {
      try {
        const resp = await listLecturas(selectedMeter.id, { limit: 50 });
        setReadings(resp.data || []);
      } catch (err) {
        // Error al cargar lecturas - se maneja de forma silenciosa
      }
    };
    loadReadings();
  }, [selectedMeter]);

  // Filtrar medidores por búsqueda
  const filteredMeters = meters.filter(m =>
    m.medidor_codigo.toLowerCase().includes(search.toLowerCase()) ||
    m.unidad.toLowerCase().includes(search.toLowerCase()),
  );

  // Consumo calculado
  const lastReading = readings[0]?.lectura ?? selectedMeter?.ultima_lectura ?? 0;
  const consumo = currentReading && !isNaN(Number(currentReading))
    ? Math.max(Number(currentReading) - lastReading, 0)
    : 0;

  // Handlers
  const handleMeterSelect = (meter: Meter) => {
    setSelectedMeter(meter);
    setCurrentReading('');
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedMeter || !currentReading) {return;}
    setLoading(true);
    try {
      await createLectura(selectedMeter.id, {
        fecha: readingDate,  // Ya es solo fecha
        lectura: Number(currentReading),
        periodo: readingPeriod, // Mantén como está, o ajusta si BD espera formato específico
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      // Recargar lecturas
      const resp = await listLecturas(selectedMeter.id, { limit: 50 });
      setReadings(resp.data || []);
      setCurrentReading('');
    } catch (err) {
      // Error al crear lectura - mostrar mensaje al usuario
      alert('Error al guardar lectura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <PageHeader
        title="Lecturas de Medidor"
        subtitle="Registro y consulta de lecturas de medidores"
        icon="straighten"
      >
        <div className='d-flex align-items-center gap-2 flex-wrap'>
          <div className='input-group input-group-sm' style={{ minWidth: '200px', maxWidth: '300px' }}>
            <span className='input-group-text'>
              <span className='material-icons' style={{ fontSize: '16px' }}>search</span>
            </span>
            <input
              id='meterSearch'
              className='form-control'
              placeholder='Buscar medidor...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </PageHeader>

      <main className='container-fluid p-4'>
        {/* Alerta para roles básicos */}
        {isBasicRoleInCommunity && (
          <Alert variant='info' className='mb-4'>
            <Alert.Heading>
              <span className='material-icons me-2'>info</span>
              Vista de Solo Lectura
            </Alert.Heading>
            <p className='mb-0'>
              Puedes consultar las lecturas de los medidores asociados a tus unidades,
              pero no puedes registrar nuevas lecturas. Esta función está reservada
              para administradores y personal autorizado.
            </p>
          </Alert>
        )}

        {/* Selector de medidor para roles básicos */}
        {isBasicRoleInCommunity && meters.length > 0 && (
          <div className='card mb-4 shadow-sm'>
            <div className='card-body'>
              <div className='row align-items-center'>
                <div className='col-md-6'>
                  <Form.Group className='mb-0'>
                    <Form.Label className='fw-bold'>
                      <span className='material-icons me-2' style={{ fontSize: '18px', verticalAlign: 'middle' }}>speed</span>
                      Seleccionar Medidor
                    </Form.Label>
                    <Form.Select
                      value={selectedMeter?.id || ''}
                      onChange={(e) => {
                        const meter = meters.find(m => m.id === Number(e.target.value));
                        if (meter) {handleMeterSelect(meter);}
                      }}
                      size='lg'
                    >
                      {filteredMeters.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.medidor_codigo} - {m.unidad} ({m.tipo})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                {selectedMeter && (
                  <div className='col-md-6'>
                    <div className='d-flex flex-column'>
                      <small className='text-muted'>Última Lectura</small>
                      <h4 className='mb-0 text-primary'>{selectedMeter.ultima_lectura || '-'} kWh</h4>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className='row'>
          {/* Formulario de registro - Solo visible para no-básicos */}
          {!isBasicRoleInCommunity && (
          <div className='col-12 col-lg-4 mb-4 mb-lg-0'>
            <div className='reading-form-card card shadow-sm'>
                  <div className='card-header bg-primary text-white'>
                    <h5 className='mb-0'>
                      <span className='material-icons me-2' style={{ fontSize: '20px' }}>edit</span>
                      Registrar Lectura
                    </h5>
                  </div>
                  <div className='card-body'>
                    <Form onSubmit={handleFormSubmit}>
                      <Form.Group className='mb-3'>
                        <Form.Label>Medidor</Form.Label>
                        <Form.Select
                          value={selectedMeter?.id || ''}
                          onChange={(e) => {
                            const meter = meters.find(m => m.id === Number(e.target.value));
                            if (meter) {handleMeterSelect(meter);}
                          }}
                          className='form-select-sm'
                        >
                          {filteredMeters.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.medidor_codigo} - {m.unidad}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className='mb-3'>
                        <Form.Label>Fecha</Form.Label>
                        <Form.Control
                          type='date'
                          value={readingDate}
                          onChange={(e) => setReadingDate(e.target.value)}
                          required
                          className='form-control-sm'
                        />
                      </Form.Group>

                      <Form.Group className='mb-3'>
                        <Form.Label>Lectura Actual</Form.Label>
                        <InputGroup size='sm'>
                          <Form.Control
                            type='number'
                            value={currentReading}
                            onChange={(e) => setCurrentReading(e.target.value)}
                            placeholder='0'
                            required
                          />
                          <InputGroup.Text>kWh</InputGroup.Text>
                        </InputGroup>
                        <Form.Text className='text-muted'>
                          Última: <strong>{lastReading}</strong> |
                          Consumo calculado: <strong>{consumo} kWh</strong>
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className='mb-3'>
                        <Form.Label>Periodo</Form.Label>
                        <Form.Control
                          type='text'
                          placeholder='Ej: 2025-11 (Año y Mes)'
                          value={readingPeriod}
                          onChange={(e) => setReadingPeriod(e.target.value)}
                          required
                          className='form-control-sm'
                        />
                      </Form.Group>

                      <div className='d-grid gap-2'>
                        <Button type='submit' variant='primary' size='sm' disabled={loading}>
                          {loading ? 'Guardando...' : 'Guardar Lectura'}
                        </Button>
                        <Button
                          type='button'
                          variant='outline-secondary'
                          size='sm'
                          onClick={() => {
                            setCurrentReading('');
                            setReadingDate(new Date().toISOString().slice(0, 10));
                            setReadingPeriod('');
                          }}
                        >
                          Limpiar
                        </Button>
                      </div>

                      {showSuccess && (
                        <Alert variant='success' className='mt-3 mb-0' dismissible onClose={() => setShowSuccess(false)}>
                          <span className='material-icons me-1' style={{ fontSize: '16px' }}>check_circle</span>
                          Lectura guardada exitosamente
                        </Alert>
                      )}
                    </Form>
                  </div>
                </div>
              </div>
          )}

              {/* Historial de lecturas - Full width cuando básico, 8 columnas cuando no */}
              <div className={isBasicRoleInCommunity ? 'col-12' : 'col-12 col-lg-8'}>
                <div className='reading-history card shadow-sm'>
                  <div className='card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2'>
                    <h5 className='mb-0'>
                      <span className='material-icons me-2' style={{ fontSize: '20px' }}>history</span>
                      Historial de Lecturas
                    </h5>
                    <div className='d-flex gap-2 flex-wrap'>
                      <Button variant='outline-secondary' size='sm'>
                        <span className='material-icons me-1' style={{ fontSize: '16px' }}>download</span>
                        Exportar
                      </Button>
                      {!isBasicRoleInCommunity && (
                      <Button variant='primary' size='sm'>
                        <span className='material-icons me-1' style={{ fontSize: '16px' }}>add</span>
                        Agregar Masiva
                      </Button>
                      )}
                    </div>
                  </div>
                  <div className='card-body p-0'>
                    {readings.length === 0 ? (
                      <div className='text-center py-5 text-muted'>
                        <span className='material-icons' style={{ fontSize: '48px', opacity: 0.3 }}>history</span>
                        <p className='mt-2'>No hay lecturas registradas para este medidor</p>
                      </div>
                    ) : (
                      <div className='list-group list-group-flush'>
                        {readings.map(r => (
                          <div key={r.id} className='list-group-item px-3 py-3'>
                            <div className='d-flex justify-content-between align-items-center flex-wrap gap-2'>
                              <div className='flex-grow-1'>
                                <div className='fw-bold text-primary mb-1 d-flex align-items-center'>
                                  <span className='material-icons me-2' style={{ fontSize: '18px' }}>date_range</span>
                                  {new Date(r.fecha).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </div>
                                <div className='small text-muted d-flex align-items-center'>
                                  <span className='material-icons me-1' style={{ fontSize: '14px' }}>speed</span>
                                  {selectedMeter?.medidor_codigo} • {r.periodo || 'Sin periodo'}
                                </div>
                              </div>
                              <div className='text-end d-flex flex-column align-items-end'>
                                <div className='d-flex align-items-center mb-1'>
                                  <span className='material-icons me-1 text-success' style={{ fontSize: '20px' }}>bolt</span>
                                  <span className='h4 mb-0 text-success fw-bold'>{r.lectura.toLocaleString()}</span>
                                </div>
                                <div className='small text-muted'>kWh</div>
                                <span className={`badge ${r.status === 'activa' ? 'bg-success' : 'bg-secondary'} mt-1`}>
                                  {r.status || 'Sin estado'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>

      <style jsx>{`
        /* Mobile Styles */
        @media (max-width: 991.98px) {
          .reading-form-card .card-header h5 {
            font-size: 1.1rem;
          }

          .reading-history .card-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 1rem !important;
          }

          .reading-history .card-header .d-flex {
            justify-content: center !important;
            width: 100% !important;
          }

          .reading-history .card-header .d-flex .btn {
            flex: 1;
            min-width: 0;
          }
        }

        @media (max-width: 767.98px) {
          .container-fluid {
            padding: 1rem !important;
          }

          .reading-form-card .card-body {
            padding: 1rem;
          }

          .reading-history .card-body {
            max-height: 400px;
          }

          .list-group-item {
            padding: 1rem 0.75rem !important;
          }

          .list-group-item .d-flex {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
            text-align: center !important;
          }

          .list-group-item .text-end {
            text-align: center !important;
          }

          .card-header .d-flex {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }

          .card-header .d-flex .btn {
            width: 100%;
          }

          /* PageHeader responsive */
          .page-header .header-actions {
            width: 100% !important;
            margin-top: 1rem !important;
          }

          .page-header .header-actions .input-group {
            width: 100% !important;
            max-width: none !important;
          }
        }

        @media (max-width: 575.98px) {
          .container-fluid {
            padding: 0.75rem !important;
          }

          .reading-form-card .card-body {
            padding: 0.75rem;
          }

          .reading-history .card-header {
            padding: 0.75rem 1rem;
          }

          .reading-history .card-body {
            max-height: 300px;
          }

          .btn-sm {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
          }

          .form-control-sm {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
          }

          .form-select-sm {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
          }
        }

        /* Enhanced Card Styles */
        .reading-form-card {
          border: none;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .reading-form-card .card-header {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
          border: none;
          padding: 1rem 1.25rem;
        }

        .reading-form-card .card-body {
          padding: 1.5rem;
        }

        .reading-history {
          border: none;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .reading-history .card-header {
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          padding: 1rem 1.25rem;
        }

        .reading-history .card-body {
          max-height: 600px;
          overflow-y: auto;
        }

        /* Mobile Card Enhancements */
        @media (max-width: 767.98px) {
          .reading-form-card,
          .reading-history {
            margin-bottom: 1rem;
            border-radius: 8px;
          }

          .reading-form-card .card-header,
          .reading-history .card-header {
            padding: 0.75rem 1rem;
          }

          .reading-form-card .card-body {
            padding: 1rem;
          }
        }

        /* Form Enhancements */
        .form-control-sm {
          border-radius: 6px;
        }

        .form-select-sm {
          border-radius: 6px;
        }

        .input-group-sm .form-control {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        .input-group-sm .input-group-text {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }

        /* Button Enhancements */
        .btn-sm {
          border-radius: 6px;
          font-weight: 500;
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn {
          transition: all 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        /* Mobile Button Enhancements */
        @media (max-width: 767.98px) {
          .btn-sm {
            min-height: 44px;
            font-size: 0.9rem;
            padding: 0.5rem 1rem;
          }

          .d-grid .btn {
            margin-bottom: 0.5rem;
          }

          .d-grid .btn:last-child {
            margin-bottom: 0;
          }
        }

        /* List Item Enhancements */
        .list-group-item {
          border-left: 4px solid transparent;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .list-group-item:hover {
          background-color: #f8f9fa;
          border-left-color: #007bff;
          transform: translateX(2px);
        }

        /* Mobile List Item Enhancements */
        @media (max-width: 767.98px) {
          .list-group-item {
            border-radius: 8px;
            margin-bottom: 0.5rem;
            border: 1px solid #dee2e6;
          }

          .list-group-item:last-child {
            margin-bottom: 0;
          }
        }

        /* Badge Enhancements */
        .badge {
          font-size: 0.7em;
          padding: 0.35em 0.65em;
        }

        /* Alert Enhancements */
        .alert {
          border-radius: 8px;
          border: none;
        }

        .alert-success {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          color: #155724;
        }

        /* Loading State */
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          z-index: 10;
        }

        /* Scrollbar Styling */
        .reading-history .card-body::-webkit-scrollbar {
          width: 6px;
        }

        .reading-history .card-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .reading-history .card-body::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .reading-history .card-body::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Animation for new items */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .list-group-item {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </ProtectedRoute>
  );
}
