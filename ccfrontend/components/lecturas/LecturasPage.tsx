import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Button, Form, InputGroup, Alert } from 'react-bootstrap';

import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/lib/useAuth';
import {
  listAllMedidores,
  listLecturas,
  createLectura,
} from '@/lib/medidoresService';
import { usePermissions } from '@/lib/usePermissions';
import { Medidor as Meter, Reading as Reading } from '@/types/medidores';  // Asume que existe en types/medidores.ts



export default function LecturasPage(): React.ReactElement {
  const { hasPermission } = usePermissions();
  const [meters, setMeters] = useState<Meter[]>([]);
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [readingDate, setReadingDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 16),
  );
  const [currentReading, setCurrentReading] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  // Cargar medidores al montar
  useEffect(() => {
    const loadMeters = async () => {
      setLoading(true);
      try {
        const resp = await listAllMedidores({ limit: 100 }); // Global para superadmin
        setMeters(resp.data || []);
        if (resp.data?.length > 0) setSelectedMeter(resp.data[0]);
      } catch (err) {
        console.error('Error cargando medidores:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMeters();
  }, []);

  // Cargar lecturas cuando cambia medidor
  useEffect(() => {
    if (!selectedMeter) return;
    const loadReadings = async () => {
      try {
        const resp = await listLecturas(selectedMeter.id, { limit: 50 });
        setReadings(resp.data || []);
      } catch (err) {
        console.error('Error cargando lecturas:', err);
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
    if (!selectedMeter || !currentReading) return;
    setLoading(true);
    try {
      await createLectura(selectedMeter.id, {
        fecha: readingDate.split('T')[0],  // Solo fecha (e.g., "2025-11-08"), sin hora
        lectura: Number(currentReading),
        periodo: 'real', // Mantén como está, o ajusta si BD espera formato específico
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      // Recargar lecturas
      const resp = await listLecturas(selectedMeter.id, { limit: 50 });
      setReadings(resp.data || []);
      setCurrentReading('');
    } catch (err) {
      console.error('Error creando lectura:', err);
      alert('Error al guardar lectura');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !meters.length) return <div>Cargando...</div>;

  return (
    <ProtectedRoute>
      <div className='d-flex'>
        <Sidebar />
        <div className='main-content flex-grow-1 bg-light' style={{ marginLeft: 280 }}>
          <header className='bg-white border-bottom shadow-sm p-3'>
            <div className='container-fluid d-flex align-items-center justify-content-between'>
              <h4 className='mb-0'>Lecturas de Medidor</h4>
              <div className='d-flex align-items-center gap-2'>
                <input
                  id='meterSearch'
                  className='form-control form-control-sm'
                  placeholder='Buscar medidor...'
                  style={{ width: 220 }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </header>

          <main className='container-fluid p-4'>
            <div className='row'>
              <div className='col-lg-4'>
                <div className='reading-form-card'>
                  <h5>Registrar Lectura</h5>
                  <Form onSubmit={handleFormSubmit}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Medidor</Form.Label>
                      <Form.Select
                        value={selectedMeter?.id || ''}
                        onChange={(e) => {
                          const meter = meters.find(m => m.id === Number(e.target.value));
                          if (meter) handleMeterSelect(meter);
                        }}
                      >
                        {filteredMeters.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.medidor_codigo} - {m.unidad}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className='mb-3'>
                      <Form.Label>Fecha y Hora</Form.Label>
                      <Form.Control
                        type='datetime-local'
                        value={readingDate}
                        onChange={(e) => setReadingDate(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className='mb-3'>
                      <Form.Label>Lectura Actual</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type='number'
                          value={currentReading}
                          onChange={(e) => setCurrentReading(e.target.value)}
                          required
                        />
                        <InputGroup.Text>kWh</InputGroup.Text>
                      </InputGroup>
                      <Form.Text>Última: {lastReading} | Consumo: {consumo}</Form.Text>
                    </Form.Group>
                    <div className='d-grid gap-2'>
                      <Button type='submit' variant='primary' disabled={loading}>
                        Guardar Lectura
                      </Button>
                      <Button
                        type='button'
                        variant='outline-secondary'
                        onClick={() => {
                          setCurrentReading('');
                          setReadingDate(new Date().toISOString().slice(0, 16));
                        }}
                      >
                        Limpiar
                      </Button>
                    </div>
                    {showSuccess && <Alert variant='success' className='mt-3'>Lectura guardada</Alert>}
                  </Form>
                </div>

                <div className='meter-selector mt-3'>
                  <h6>Medidores</h6>
                  {filteredMeters.map(m => (
                    <div
                      key={m.id}
                      className={`meter-option p-2 ${m.id === selectedMeter?.id ? 'selected' : ''}`}
                      onClick={() => handleMeterSelect(m)}
                      style={{ cursor: 'pointer' }}
                    >
                      {m.medidor_codigo} - {m.unidad}
                    </div>
                  ))}
                </div>
              </div>

              <div className='col-lg-8'>
                <div className='reading-history'>
                  <div className='reading-history-header d-flex justify-content-between align-items-center p-3'>
                    <h5 className='mb-0'>Historial de Lecturas</h5>
                    <div>
                      <Button variant='outline-secondary' size='sm'>Exportar</Button>
                      <Button variant='primary' size='sm'>Agregar Masiva</Button>
                    </div>
                  </div>
                  <div className='p-3'>
                    {readings.map(r => (
                      <div key={r.id} className='reading-item d-flex justify-content-between'>
                        <div>
                          <div className='fw-bold'>{new Date(r.fecha).toLocaleString()}</div>
                          <div className='small text-muted'>{selectedMeter?.medidor_codigo}</div>
                        </div>
                        <div className='text-end'>
                          <div className='consumption-value'>{r.lectura}</div>
                          <div className='small text-muted'>{r.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
