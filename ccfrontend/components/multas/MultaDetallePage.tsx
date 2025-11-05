/* eslint-disable @typescript-eslint/no-explicit-any, no-console, react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from 'react';

import multasService from '@/lib/multasService';
import { Multa, MultaActividad } from '@/types/multas';

interface MultaDetallePageProps {
  multa?: Multa | null;
  historial?: MultaActividad[];
}

// Helper seguro para formatear fechas
const parseDateSafe = (d?: string | Date | null): Date | null => {
  if (!d) {
    return null;
  }
  if (d instanceof Date) {
    return d;
  }
  const s0 = String(d).trim();

  // YYYY-MM-DD -> construir fecha en local (evita shift UTC)
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/;
  const mDateOnly = s0.match(dateOnly);
  if (mDateOnly) {
    const [, y, mo, day] = mDateOnly;
    return new Date(Number(y), Number(mo) - 1, Number(day));
  }

  // YYYY-MM-DD HH:MM:SS  OR  YYYY-MM-DDTHH:MM:SS  (tratar como local)
  const datetimeLocal = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/;
  const mDtLocal = s0.match(datetimeLocal);
  if (mDtLocal) {
    const [, y, mo, day, hh, mm, ss] = mDtLocal;
    return new Date(
      Number(y),
      Number(mo) - 1,
      Number(day),
      Number(hh),
      Number(mm),
      Number(ss),
    );
  }

  // Si viene con Z o con offset (+00:00), y quieres IGNORAR la zona y tratar la hora como local:
  // extraer parte antes del offset y parsearla como local
  const tzStrip = /^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})[.+-].*/;
  const mTz = s0.match(tzStrip);
  if (mTz) {
    const core = mTz[1].replace('T', ' ');
    const mCore = core.match(datetimeLocal);
    if (mCore) {
      const [, y, mo, day, hh, mm, ss] = mCore;
      return new Date(
        Number(y),
        Number(mo) - 1,
        Number(day),
        Number(hh),
        Number(mm),
        Number(ss),
      );
    }
  }

  // Fallback: intentar parseo estándar (puede tratar zona correctamente)
  const parsed = new Date(s0);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  return null;
};

const formatDateInput = (d?: string | Date | null) => {
  const dt = parseDateSafe(d);
  if (!dt) {
    return '';
  }
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDate = (d?: string | Date | null) => {
  const dt = parseDateSafe(d);
  return dt ? dt.toLocaleString() : '-';
};

const MultaDetallePage: React.FC<MultaDetallePageProps> = ({
  multa,
  historial = [],
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'evidence' | 'payments' | 'appeals' | 'communications'
  >('overview');
  const [payments, setPayments] = useState<any[] | null>(null);
  const [documents, setDocuments] = useState<any[] | null>(null);
  const [appeals, setAppeals] = useState<any[] | null>(null);
  const [comms, setComms] = useState<any[] | null>(
    historial.length ? historial : null,
  );
  const [loadingTab, setLoadingTab] = useState(false);
  const paymentFormRef = useRef<HTMLFormElement | null>(null);
  const appealFormRef = useRef<HTMLFormElement | null>(null);
  const [appealError, setAppealError] = useState<string | null>(null);

  // Fechas: usar created_at para "Fecha y Hora" (timestamp real),
  // y usar fecha_infraccion como fecha de referencia
  const fechaCreada = multa
    ? (parseDateSafe(multa.created_at) ??
      parseDateSafe(multa.fecha_infraccion) ??
      new Date())
    : new Date();
  // Si tienes fecha_vencimiento en BD úsala; si no, calcular desde la infracción
  const fechaVencBD = multa
    ? (parseDateSafe(multa.fecha_vencimiento) ??
      parseDateSafe(multa.fecha_infraccion))
    : null;
  const fechaVencimiento =
    fechaVencBD ?? new Date(fechaCreada.getTime() + 15 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    // carga inicial ligera: historial (puede venir desde page, si no cargamos aquí)
    if (!multa) {
      return;
    }
    if (comms !== null) {
      return; // Ya cargado
    }
    (async () => {
      try {
        const res: any = await multasService.getHistorial(Number(multa.id));
        setComms(Array.isArray(res) ? res : (res?.data ?? []));
      } catch {
        setComms([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multa?.id]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!mounted) {
        return;
      }
      setLoadingTab(true);
      try {
        if (activeTab === 'payments' && payments === null) {
          const h: any =
            historial && historial.length
              ? historial
              : await multasService.getHistorial(Number(multa.id));
          const histArr: any = Array.isArray(h) ? h : (h?.data ?? []);
          if (!mounted) {
            return;
          }
          setPayments(
            (histArr || []).filter((x: any) =>
              String(x.accion).toLowerCase().includes('pago'),
            ),
          );
        }

        if (activeTab === 'communications' && comms === null) {
          const h: any =
            historial && historial.length
              ? historial
              : await multasService.getHistorial(Number(multa.id));
          const histArr: any = Array.isArray(h) ? h : (h?.data ?? []);
          if (!mounted) {
            return;
          }
          setComms(histArr || []);
        }

        if (activeTab === 'evidence' && documents === null) {
          try {
            const res: any = await multasService.getDocumentos(
              Number(multa.id),
            );
            if (!mounted) {
              return;
            }
            const docs: any = Array.isArray(res) ? res : (res?.data ?? []);
            setDocuments(docs);
          } catch {
            setDocuments([]);
          }
        }

        if (activeTab === 'appeals' && appeals === null) {
          try {
            const res: any = await multasService.getApelaciones(
              Number(multa.id),
            );
            if (!mounted) {
              return;
            }
            const ap: any = Array.isArray(res) ? res : (res?.data ?? []);
            setAppeals(ap);
          } catch {
            // fallback: buscar en historial acciones relacionadas con apelación
            const h: any =
              historial && historial.length
                ? historial
                : await multasService.getHistorial(Number(multa.id));
            const histArr: any = Array.isArray(h) ? h : (h?.data ?? []);
            if (!mounted) {
              return;
            }
            setAppeals(
              (histArr || []).filter((x: any) =>
                String(x.accion).toLowerCase().includes('apel'),
              ),
            );
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error cargando tab:', e);
      } finally {
        if (mounted) {
          setLoadingTab(false);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [activeTab, multa?.id]);

  // Handler para registrar pago desde el modal
  const handleRegistrarPago = async () => {
    if (!multa || !paymentFormRef.current) {
      return;
    }
    const form = paymentFormRef.current;
    const fd = new FormData(form);
    const payload = {
      monto: Number(fd.get('monto')) || undefined,
      fecha_pago: fd.get('fecha_pago')
        ? String(fd.get('fecha_pago'))
        : undefined,
      metodo_pago: fd.get('metodo_pago')
        ? String(fd.get('metodo_pago'))
        : undefined,
      referencia: fd.get('referencia')
        ? String(fd.get('referencia'))
        : undefined,
      observaciones: fd.get('observaciones')
        ? String(fd.get('observaciones'))
        : undefined,
    };

    try {
      setLoadingTab(true);
      await multasService.registrarPago(Number(multa.id), payload);
      // refrescar historial/pagos
      const hist: any = await multasService.getHistorial(Number(multa.id));
      const histArr: any = Array.isArray(hist) ? hist : (hist?.data ?? []);
      setComms(histArr);
      setPayments(
        (histArr || []).filter((x: any) =>
          String(x.accion).toLowerCase().includes('pago'),
        ),
      );
      // cerrar modal (Bootstrap)
      const modalEl = document.getElementById('paymentModal');
      if (modalEl) {
        // @ts-ignore
        const modal = window.bootstrap?.Modal?.getInstance(modalEl);
        if (modal) {
          modal.hide();
        }
      }
      alert('Pago registrado correctamente');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error registrando pago:', err);
      alert('Error registrando pago');
    } finally {
      setLoadingTab(false);
    }
  };

  // Handler para crear apelación desde el modal
  const handleCrearApelacion = async () => {
    if (!multa || !appealFormRef.current) {
      return;
    }
    setAppealError(null);
    const fd = new FormData(appealFormRef.current);
    const motivo = String(fd.get('motivo') || '').trim();
    if (!motivo || motivo.length < 20) {
      setAppealError('El motivo debe tener al menos 20 caracteres.');
      return;
    }
    const payload = { motivo, documentos_json: [] };
    try {
      setLoadingTab(true);
      const createResp = await multasService.crearApelacion(
        Number(multa.id),
        payload,
      );

      // Si el backend devuelve { success: false, details: [...] }
      if (createResp && createResp.success === false) {
        const msgs = (createResp.details || [])
          .map((d: any) => d.msg)
          .filter(Boolean)
          .join('; ');
        setAppealError(
          msgs || String(createResp.error || 'Error creando apelación'),
        );
        return;
      }

      // Normalizar respuesta y refrescar lista
      const res: any = await multasService.getApelaciones(Number(multa.id));
      const ap: any = Array.isArray(res) ? res : (res?.data ?? []);
      setAppeals(ap);
      setActiveTab('appeals');

      // cerrar modal (Bootstrap)
      const modalEl = document.getElementById('appealModal');
      if (modalEl) {
        // @ts-ignore
        const modal = window.bootstrap?.Modal?.getInstance(modalEl);
        if (modal) {
          modal.hide();
        }
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Error creando apelación:', err);
      setAppealError(err?.message ?? 'Error del servidor');
    } finally {
      setLoadingTab(false);
    }
  };

  // Evitar render si no hay multa (la página Next debe manejar loading/no encontrado)
  if (!multa) {
    return null;
  }

  return (
    <div className='multadetalle-root'>
      <div className='container px-0 py-3'>
        <header className='bg-white border-bottom shadow-sm p-3 mb-3'>
          <div className='d-flex justify-content-between align-items-center'>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <i className='material-icons'>schedule</i>
                <small className='fw-medium'>
                  {multasService.getEstadoLabel?.(multa.estado) ??
                    multa.estado ??
                    'Pendiente'}
                </small>
              </div>
              <h2 className='h5 mb-0'>
                Multa {multa.numero} —{' '}
                {multa.tipo_infraccion ?? 'Sin especificar'}
              </h2>
              <small className='text-muted'>
                Emitida {formatDate(fechaCreada)} • Vence{' '}
                {formatDate(fechaVencimiento)}
              </small>
            </div>
            <div className='text-end'>
              <div className='h4 mb-0 text-primary'>
                ${(multa.monto ?? 0).toLocaleString?.() ?? multa.monto}
              </div>
              <small className='text-muted'>Monto a pagar</small>
            </div>
          </div>
        </header>

        {/* Botones de acción */}
        <div className='d-flex flex-wrap align-items-center gap-3 mb-3'>
          <button
            className='btn btn-success btn-lg d-flex align-items-center'
            data-bs-toggle='modal'
            data-bs-target='#paymentModal'
          >
            <i className='material-icons me-2'>payment</i>Registrar Pago
          </button>

          <button
            className='btn btn-outline-primary btn-lg d-flex align-items-center'
            onClick={() => alert('Recordatorio enviado')}
          >
            <i className='material-icons me-2'>mail</i>Enviar Recordatorio
          </button>

          <button
            className='btn btn-info btn-lg d-flex align-items-center text-white'
            data-bs-toggle='modal'
            data-bs-target='#editModal'
          >
            <i className='material-icons me-2'>edit</i>Editar Multa
          </button>

          <button
            className='btn btn-danger btn-lg d-flex align-items-center'
            onClick={() => alert('¿Anular multa?')}
          >
            <i className='material-icons me-2'>cancel</i>Anular Multa
          </button>
        </div>
      </div>

      <div className='row'>
        <div className='col-lg-8'>
          <ul className='nav nav-tabs' id='fineDetailTabs' role='tablist'>
            <li className='nav-item'>
              <button
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <span className='material-icons me-2'>info</span>Información
                General
              </button>
            </li>
            <li className='nav-item'>
              <button
                className={`nav-link ${activeTab === 'evidence' ? 'active' : ''}`}
                onClick={() => setActiveTab('evidence')}
              >
                <span className='material-icons me-2'>attach_file</span>
                Evidencia
              </button>
            </li>
            <li className='nav-item'>
              <button
                className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => setActiveTab('payments')}
              >
                <span className='material-icons me-2'>payment</span>Pagos
              </button>
            </li>
            <li className='nav-item'>
              <button
                className={`nav-link ${activeTab === 'appeals' ? 'active' : ''}`}
                onClick={() => setActiveTab('appeals')}
              >
                <span className='material-icons me-2'>gavel</span>Apelaciones
              </button>
            </li>
            <li className='nav-item'>
              <button
                className={`nav-link ${activeTab === 'communications' ? 'active' : ''}`}
                onClick={() => setActiveTab('communications')}
              >
                <span className='material-icons me-2'>message</span>
                Comunicaciones
              </button>
            </li>
          </ul>

          <div className='tab-content mt-0' style={{ marginTop: 0 }}>
            <div
              className={`tab-pane fade ${activeTab === 'overview' ? 'show active' : ''}`}
            >
              {/* ...mantener el contenido existente (ya usa formatDate) */}
              <div className='row'>
                <div className='col-md-6'>
                  <h6 className='mb-3'>Detalles de la Infracción</h6>
                  <div className='info-item'>
                    <span className='info-label'>Fecha y Hora:</span>
                    <span className='info-value'>
                      {formatDate(fechaCreada)}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Ubicación:</span>
                    <span className='info-value'>
                      {multa.torre_nombre} - {multa.unidad_numero}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Tipo de Infracción:</span>
                    <span className='info-value'>
                      {multa.tipo_infraccion ?? 'Sin especificar'}
                    </span>
                  </div>
                </div>
                <div className='col-md-6'>
                  <h6 className='mb-3'>Información del Pago</h6>
                  <div className='info-item'>
                    <span className='info-label'>Monto Base:</span>
                    <span className='info-value'>
                      ${(multa.monto ?? 0).toLocaleString?.() ?? multa.monto}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>Fecha de Vencimiento:</span>
                    <span className='info-value'>
                      {formatDate(fechaVencimiento)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`tab-pane fade ${activeTab === 'evidence' ? 'show active' : ''}`}
            >
              <h6 className='mb-3'>Evidencia Adjunta</h6>
              {loadingTab ? (
                <div>Cargando evidencia...</div>
              ) : documents && documents.length === 0 ? (
                <div className='alert alert-secondary'>
                  Sin evidencia.{' '}
                  <button
                    className='btn btn-sm btn-outline-primary ms-2'
                    onClick={() => alert('Subir evidencia')}
                  >
                    Subir evidencia
                  </button>
                </div>
              ) : (
                <ul className='list-group'>
                  {documents?.map((d: any, i: number) => (
                    <li
                      key={d.id ?? i}
                      className='list-group-item d-flex justify-content-between align-items-center'
                    >
                      <div>
                        <strong>{d.nombre_archivo ?? d.file_name}</strong>
                        <div className='small text-muted'>
                          {d.descripcion ?? ''}
                        </div>
                      </div>
                      <a
                        href={d.ruta_archivo ?? d.url}
                        target='_blank'
                        rel='noreferrer'
                        className='btn btn-sm btn-outline-secondary'
                      >
                        Ver
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              className={`tab-pane fade ${activeTab === 'payments' ? 'show active' : ''}`}
            >
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <h6 className='mb-0'>Historial de Pagos</h6>
                <button
                  className='btn btn-primary btn-sm'
                  data-bs-toggle='modal'
                  data-bs-target='#paymentModal'
                >
                  Registrar Pago
                </button>
              </div>
              {loadingTab ? (
                <div>Cargando pagos...</div>
              ) : payments && payments.length === 0 ? (
                <div className='alert alert-info'>
                  Sin pagos registrados.{' '}
                  <button
                    className='btn btn-sm btn-primary ms-2'
                    onClick={() => alert('Registrar pago')}
                  >
                    Registrar Pago
                  </button>
                </div>
              ) : (
                <div className='table-responsive'>
                  <table className='table'>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Método</th>
                        <th>Referencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments?.map((p: any, idx: number) => (
                        <tr key={p.id ?? idx}>
                          <td>{formatDate(p.created_at ?? p.fecha)}</td>
                          <td>${p.monto ?? p.monto_pagado}</td>
                          <td>{p.metodo_pago ?? '-'}</td>
                          <td>{p.referencia_pago ?? p.referencia ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div
              className={`tab-pane fade ${activeTab === 'appeals' ? 'show active' : ''}`}
            >
              <h6>Apelaciones</h6>
              {loadingTab ? (
                <div>Cargando apelaciones...</div>
              ) : appeals && appeals.length === 0 ? (
                <div className='alert alert-secondary'>
                  Sin apelaciones.{' '}
                  <button
                    className='btn btn-sm btn-outline-primary ms-2'
                    data-bs-toggle='modal'
                    data-bs-target='#appealModal'
                  >
                    Crear Apelación
                  </button>
                </div>
              ) : (
                <ul className='list-group'>
                  {appeals?.map((a: any, i: number) => (
                    <li key={a.id ?? i} className='list-group-item'>
                      <div className='d-flex justify-content-between'>
                        <div>
                          <strong>{a.motivo_apelacion ?? a.motivo}</strong>
                          <div className='small text-muted'>
                            {a.resolucion ?? ''}
                          </div>
                        </div>
                        <small className='text-muted'>
                          {formatDate(a.created_at)}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Modal para crear apelación */}
            <div className='modal fade' id='appealModal' tabIndex={-1}>
              <div className='modal-dialog'>
                <div className='modal-content'>
                  <div className='modal-header'>
                    <h5 className='modal-title'>
                      Crear Apelación - Multa #{multa.numero}
                    </h5>
                    <button
                      type='button'
                      className='btn-close'
                      data-bs-dismiss='modal'
                    ></button>
                  </div>
                  <div className='modal-body'>
                    <form ref={appealFormRef} id='appealForm'>
                      <div className='mb-3'>
                        <label className='form-label'>Motivo *</label>
                        <textarea
                          name='motivo'
                          className='form-control'
                          rows={4}
                          required
                          minLength={20}
                        />
                        {appealError && (
                          <div className='text-danger small mt-1'>
                            {appealError}
                          </div>
                        )}
                      </div>
                      {/* Si subirás archivos, cambiar a multipart/form-data y adaptar backend */}
                    </form>
                  </div>
                  <div className='modal-footer'>
                    <button
                      type='button'
                      className='btn btn-secondary'
                      data-bs-dismiss='modal'
                    >
                      Cancelar
                    </button>
                    <button
                      type='button'
                      className='btn btn-primary'
                      onClick={handleCrearApelacion}
                    >
                      Enviar Apelación
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`tab-pane fade ${activeTab === 'communications' ? 'show active' : ''}`}
            >
              <h6>Comunicaciones / Historial</h6>
              {loadingTab ? (
                <div>Cargando historial...</div>
              ) : comms && comms.length === 0 ? (
                <div className='alert alert-secondary'>
                  Sin comunicaciones registradas.
                </div>
              ) : (
                comms?.map((c: any, i: number) => (
                  <div key={c.id ?? i} className='mb-3'>
                    <div className='d-flex justify-content-between'>
                      <div>
                        <strong>{c.accion}</strong>
                      </div>
                      <small className='text-muted'>
                        {formatDate(c.created_at)}
                      </small>
                    </div>
                    <div className='text-muted small'>
                      {c.observaciones ?? c.descripcion}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Columna lateral */}
        <div className='col-lg-4'>
          <div className='info-sidebar'>
            <div className='info-card'>
              <div className='info-card-title'>
                <span className='material-icons'>apartment</span> Información de
                la Unidad
              </div>
              <div className='info-item'>
                <span className='info-label'>Unidad:</span>
                <span className='info-value'>
                  {multa.torre_nombre} - {multa.unidad_numero}
                </span>
              </div>
              <div className='info-item'>
                <span className='info-label'>Propietario:</span>
                <span className='info-value'>
                  {multa.propietario_nombre ?? '—'}
                </span>
              </div>
              <div className='info-item'>
                <span className='info-label'>Email:</span>
                <span className='info-value'>
                  {multa.propietario_email ?? '—'}
                </span>
              </div>
              <div className='mt-3'>
                <button
                  className='btn btn-outline-primary btn-sm w-100'
                  onClick={() => alert('Ver detalle unidad')}
                >
                  Ver Detalle de Unidad
                </button>
              </div>
            </div>

            <div className='info-card'>
              <div className='info-card-title'>
                <span className='material-icons'>analytics</span> Historial de
                Multas
              </div>
              <div className='info-item'>
                <span className='info-label'>Última Multa:</span>
                <span className='info-value'>
                  {formatDate(multa.fecha_infraccion)}
                </span>
              </div>
            </div>

            <div className='info-card'>
              <div className='info-card-title'>
                <span className='material-icons'>timeline</span> Actividades
                Recientes
              </div>
              <div className='timeline'>
                {(comms || historial || []).slice(0, 3).map((item, index) => (
                  <div key={index} className='timeline-item'>
                    <div className='timeline-content'>
                      <div className='timeline-date'>
                        {formatDate(item.created_at)}
                      </div>
                      <div className='timeline-title'>{item.accion}</div>
                      <div className='timeline-description'>
                        {item.descripcion || 'Acción realizada'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para registrar pago */}
      <div className='modal fade' id='paymentModal' tabIndex={-1}>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>
                Registrar Pago - Multa #{multa.numero}
              </h5>
              <button
                type='button'
                className='btn-close'
                data-bs-dismiss='modal'
              ></button>
            </div>
            <div className='modal-body'>
              <form ref={paymentFormRef} id='paymentForm'>
                <div className='mb-3'>
                  <label className='form-label'>Monto Pagado *</label>
                  <div className='input-group'>
                    <span className='input-group-text'>$</span>
                    <input
                      name='monto'
                      type='number'
                      className='form-control'
                      defaultValue={multa.monto}
                      required
                    />
                  </div>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Fecha de Pago *</label>
                  <input
                    name='fecha_pago'
                    type='date'
                    className='form-control'
                    required
                    defaultValue={formatDateInput(new Date())}
                  />
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Método de Pago *</label>
                  <select name='metodo_pago' className='form-select' required>
                    <option value='Efectivo'>Efectivo</option>
                    <option value='Transferencia'>Transferencia</option>
                    <option value='Cheque'>Cheque</option>
                    <option value='Tarjeta'>Tarjeta</option>
                    <option value='Online'>Online</option>
                  </select>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Número de Comprobante</label>
                  <input
                    name='referencia'
                    type='text'
                    className='form-control'
                    placeholder='Número de transacción'
                  />
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Observaciones</label>
                  <textarea
                    name='observaciones'
                    className='form-control'
                    rows={3}
                    placeholder='Observaciones...'
                  ></textarea>
                </div>
                <div className='mb-3'>
                  <div className='form-check'>
                    <input
                      className='form-check-input'
                      name='enviar_confirmacion'
                      type='checkbox'
                      defaultChecked
                    />
                    <label className='form-check-label'>
                      Enviar confirmación de pago al residente
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-secondary'
                data-bs-dismiss='modal'
              >
                Cancelar
              </button>
              <button
                type='button'
                className='btn btn-success'
                onClick={handleRegistrarPago}
              >
                <span className='material-icons me-1'>payment</span>
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para editar multa */}
      <div className='modal fade' id='editModal' tabIndex={-1}>
        <div className='modal-dialog modal-lg'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Editar Multa #{multa.numero}</h5>
              <button
                type='button'
                className='btn-close'
                data-bs-dismiss='modal'
              ></button>
            </div>
            <div className='modal-body'>
              <form>
                <div className='row'>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>Fecha de Infracción</label>
                    <input
                      type='date'
                      className='form-control'
                      defaultValue={formatDateInput(multa.fecha_infraccion)}
                    />
                  </div>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>Monto de la Multa</label>
                    <div className='input-group'>
                      <span className='input-group-text'>$</span>
                      <input
                        type='number'
                        className='form-control'
                        defaultValue={multa.monto}
                      />
                    </div>
                  </div>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Descripción</label>
                  <textarea
                    className='form-control'
                    rows={4}
                    defaultValue={multa.descripcion}
                  ></textarea>
                </div>
                <div className='row'>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>Fecha de Vencimiento</label>
                    <input
                      type='date'
                      className='form-control'
                      defaultValue={formatDateInput(fechaVencimiento)}
                    />
                  </div>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>Prioridad</label>
                    <select
                      className='form-select'
                      defaultValue={multa.prioridad}
                    >
                      <option value='baja'>Baja</option>
                      <option value='media'>Media</option>
                      <option value='alta'>Alta</option>
                    </select>
                  </div>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Notas Internas</label>
                  <textarea
                    className='form-control'
                    rows={3}
                    defaultValue='Segunda infracción...'
                  ></textarea>{' '}
                  {/* Estático */}
                </div>
              </form>
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-secondary'
                data-bs-dismiss='modal'
              >
                Cancelar
              </button>
              <button
                type='button'
                className='btn btn-primary'
                onClick={() => alert('Multa actualizada')}
              >
                <span className='material-icons me-1'>save</span>
                Guardar Cambios
              </button>{' '}
              {/* Estático */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultaDetallePage;
