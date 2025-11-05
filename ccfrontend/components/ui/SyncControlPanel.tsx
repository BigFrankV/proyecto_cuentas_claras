import React, { useState, useEffect } from 'react';

import * as indicadoresAPI from '../../lib/api/indicadores';

interface SyncControlPanelProps {
  className?: string;
  showTitle?: boolean;
}

const SyncControlPanel: React.FC<SyncControlPanelProps> = ({
  className = '',
  showTitle = true,
}) => {
  const [syncStatus, setSyncStatus] =
    useState<indicadoresAPI.SyncStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [initLoading, setInitLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>(
    'info',
  );

  // Cargar estado de sincronización
  const loadSyncStatus = async () => {
    setLoading(true);
    try {
      const status = await indicadoresAPI.getSyncStatus();
      setSyncStatus(status);

      if (!status.success) {
        setMessage(status.error || 'Error al obtener estado de sincronización');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error de conexión al obtener estado');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sincronización manual
  const handleManualSync = async () => {
    setSyncLoading(true);
    setMessage('');

    try {
      const result = await indicadoresAPI.startManualSync();

      if (result.success) {
        setMessage(result.message || 'Sincronización iniciada correctamente');
        setMessageType('success');

        // Recargar estado después de 2 segundos
        setTimeout(() => {
          loadSyncStatus();
        }, 2000);
      } else {
        setMessage(result.error || 'Error al iniciar sincronización');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error de conexión al iniciar sincronización');
      setMessageType('error');
    } finally {
      setSyncLoading(false);
    }
  };

  // Inicializar datos históricos
  const handleInitialize = async () => {
    setInitLoading(true);
    setMessage('');

    try {
      const result = await indicadoresAPI.initializeHistoricalData();

      if (result.success) {
        setMessage(
          result.message || 'Inicialización de datos históricos completada',
        );
        setMessageType('success');

        // Recargar estado después de 3 segundos
        setTimeout(() => {
          loadSyncStatus();
        }, 3000);
      } else {
        setMessage(result.error || 'Error al inicializar datos históricos');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error de conexión al inicializar datos');
      setMessageType('error');
    } finally {
      setInitLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string | null): string => {
    if (!dateString) {
      return 'Nunca';
    }

    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    loadSyncStatus();

    const interval = setInterval(loadSyncStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-clear message después de 5 segundos
  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [message]);

  return (
    <div className={`card ${className}`}>
      {showTitle && (
        <div className='card-header bg-info text-white'>
          <h6 className='card-title mb-0'>
            <i className='material-icons me-2'>sync</i>
            Control de Sincronización
          </h6>
        </div>
      )}

      <div className='card-body'>
        {/* Mensaje de estado */}
        {message && (
          <div
            className={`alert alert-${messageType === 'error' ? 'danger' : messageType === 'success' ? 'success' : 'info'} alert-dismissible fade show`}
            role='alert'
          >
            <i
              className={`material-icons me-2 ${messageType === 'error' ? 'error' : messageType === 'success' ? 'check_circle' : 'info'}`}
            ></i>
            {message}
            <button
              type='button'
              className='btn-close'
              onClick={() => setMessage('')}
            ></button>
          </div>
        )}

        {loading ? (
          <div className='text-center py-3'>
            <div className='spinner-border spinner-border-sm me-2'></div>
            Cargando estado...
          </div>
        ) : syncStatus ? (
          <>
            {/* Estado de sincronización */}
            <div className='row mb-3'>
              <div className='col-md-6'>
                <div className='d-flex align-items-center mb-2'>
                  <span
                    className={`badge me-2 ${syncStatus.isRunning ? 'bg-warning' : 'bg-success'}`}
                  >
                    {syncStatus.isRunning ? 'Ejecutándose' : 'Inactivo'}
                  </span>
                  <small className='text-muted'>Estado actual</small>
                </div>

                <div className='mb-2'>
                  <small className='text-muted'>Última sincronización:</small>
                  <div className='fw-medium'>
                    {syncStatus.lastSync
                      ? formatDate(syncStatus.lastSync)
                      : 'Nunca'}
                  </div>
                </div>
              </div>

              <div className='col-md-6'>
                <div className='mb-2'>
                  <small className='text-muted'>Última actualización:</small>
                  <div className='fw-medium'>
                    {syncStatus.stats?.last_update
                      ? formatDate(syncStatus.stats.last_update)
                      : 'No disponible'}
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas de datos */}
            <div className='row mb-3'>
              <div className='col-4'>
                <div className='text-center'>
                  <div className='h5 mb-0 text-primary'>
                    {syncStatus.stats?.uf_records || 0}
                  </div>
                  <small className='text-muted'>Registros UF</small>
                </div>
              </div>
              <div className='col-4'>
                <div className='text-center'>
                  <div className='h5 mb-0 text-success'>
                    {syncStatus.stats?.utm_records || 0}
                  </div>
                  <small className='text-muted'>Registros UTM</small>
                </div>
              </div>
              <div className='col-4'>
                <div className='text-center'>
                  <div className='h5 mb-0 text-info'>
                    {syncStatus.stats?.otros_records || 0}
                  </div>
                  <small className='text-muted'>Otros indicadores</small>
                </div>
              </div>
            </div>

            {/* Botones de control */}
            <div className='row g-2'>
              <div className='col-md-4'>
                <button
                  className='btn btn-primary w-100 btn-sm'
                  onClick={loadSyncStatus}
                  disabled={loading}
                >
                  <i className='material-icons me-1'>refresh</i>
                  Actualizar
                </button>
              </div>
              <div className='col-md-4'>
                <button
                  className='btn btn-warning w-100 btn-sm'
                  onClick={handleManualSync}
                  disabled={syncLoading || syncStatus.isRunning}
                >
                  {syncLoading ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-1'></span>
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <i className='material-icons me-1'>sync</i>
                      Sincronizar
                    </>
                  )}
                </button>
              </div>
              <div className='col-md-4'>
                <button
                  className='btn btn-info w-100 btn-sm'
                  onClick={handleInitialize}
                  disabled={initLoading || syncStatus.isRunning}
                >
                  {initLoading ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-1'></span>
                      Inicializando...
                    </>
                  ) : (
                    <>
                      <i className='material-icons me-1'>download</i>
                      Inicializar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Información adicional */}
            <div className='mt-3'>
              <small className='text-muted'>
                <i className='material-icons me-1' style={{ fontSize: '14px' }}>
                  info
                </i>
                La sincronización automática se ejecuta diariamente a las 08:00
                AM. Use &quot;Inicializar&quot; solo si es la primera vez que
                configura el sistema.
              </small>
            </div>
          </>
        ) : (
          <div className='text-center text-muted py-3'>
            <i className='material-icons mb-2' style={{ fontSize: '2rem' }}>
              error_outline
            </i>
            <div>No se pudo cargar el estado de sincronización</div>
            <button
              className='btn btn-sm btn-outline-primary mt-2'
              onClick={loadSyncStatus}
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncControlPanel;
