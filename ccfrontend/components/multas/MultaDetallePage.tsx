/* eslint-disable @typescript-eslint/no-explicit-any, no-console, react-hooks/exhaustive-deps */
import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef } from 'react';

import multasService from '@/lib/multasService';
import { Permission, usePermissions } from '@/lib/usePermissions';
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
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'evidence' | 'payments' | 'appeals' | 'communications'
  >('overview');
  const [payments, setPayments] = useState<any[] | null>(null);
  const [documents, setDocuments] = useState<any[] | null>(null);
  const [appeals, setAppeals] = useState<any[] | null>(null);
  const [comms, setComms] = useState<any[] | null>(
    historial.length ? historial : null,
  );

  // Permiso para pagar multas
  const canPayMulta = hasPermission(Permission.EDIT_MULTA);
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pendiente': return 'status-pending';
      case 'pagado': return 'status-paid';
      case 'vencido': return 'status-overdue';
      case 'apelada': return 'status-appealed';
      case 'anulada': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  // Evitar render si no hay multa (la página Next debe manejar loading/no encontrado)
  if (!multa) {
    return null;
  }

  return (
    <div className='multa-detalle-page'>
      <div className='page-header'>
        <div className='header-content'>
          <div className='d-flex align-items-center gap-2 mb-2'>
            <button className="btn-back" onClick={() => router.back()}>
              <span className="material-icons">arrow_back</span>
            </button>
            <span className={`status-badge ${getStatusBadgeClass(multa.estado)}`}>
              {multasService.getEstadoLabel?.(multa.estado) ?? multa.estado ?? 'Pendiente'}
            </span>
            <span className="text-muted mx-2">|</span>
            <span className="text-muted">Multa #{multa.numero}</span>
          </div>
          
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
            <div>
              <h1 className="page-title">{multa.tipo_infraccion ?? 'Infracción sin especificar'}</h1>
              <div className="d-flex gap-4 text-muted mt-2">
                <div className="d-flex align-items-center gap-1">
                  <span className="material-icons fs-5">event</span>
                  Emitida: {formatDate(fechaCreada)}
                </div>
                <div className="d-flex align-items-center gap-1">
                  <span className="material-icons fs-5">event_busy</span>
                  Vence: {formatDate(fechaVencimiento)}
                </div>
              </div>
            </div>

            <div className="amount-card">
              <div className="amount-label">Monto a Pagar</div>
              <div className="amount-value">
                ${(multa.monto ?? 0).toLocaleString?.() ?? multa.monto}
              </div>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {multa.estado === 'pendiente' && (
            <button
              className='btn-primary-action'
              onClick={() => router.push(`/multas/${multa.id}/pagar`)}
            >
              <span className='material-icons'>credit_card</span>
              Pagar Online
            </button>
          )}

          <button
            className='btn-secondary-action'
            data-bs-toggle='modal'
            data-bs-target='#paymentModal'
          >
            <span className='material-icons'>payments</span>
            Registrar Pago
          </button>

          <button
            className='btn-secondary-action'
            data-bs-toggle='modal'
            data-bs-target='#editModal'
          >
            <span className='material-icons'>edit</span>
            Editar
          </button>

          <div className="dropdown">
            <button className="btn-icon-action" data-bs-toggle="dropdown">
              <span className="material-icons">more_vert</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item" onClick={() => alert('Recordatorio enviado')}>
                  <span className="material-icons fs-6 me-2">mail</span> Enviar Recordatorio
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger" onClick={() => alert('¿Anular multa?')}>
                  <span className="material-icons fs-6 me-2">block</span> Anular Multa
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className='content-grid'>
        <div className='main-column'>
          <div className="tabs-container">
            <div className="tabs-header">
              <button
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Información
              </button>
              <button
                className={`tab-btn ${activeTab === 'evidence' ? 'active' : ''}`}
                onClick={() => setActiveTab('evidence')}
              >
                Evidencia
              </button>
              <button
                className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => setActiveTab('payments')}
              >
                Pagos
              </button>
              <button
                className={`tab-btn ${activeTab === 'appeals' ? 'active' : ''}`}
                onClick={() => setActiveTab('appeals')}
              >
                Apelaciones
              </button>
              <button
                className={`tab-btn ${activeTab === 'communications' ? 'active' : ''}`}
                onClick={() => setActiveTab('communications')}
              >
                Historial
              </button>
            </div>

            <div className="tab-content-area">
              {activeTab === 'overview' && (
                <div className="fade-in">
                  <h3 className="section-title">Detalles de la Infracción</h3>
                  <div className="info-grid">
                    <div className="info-group">
                      <label>Descripción</label>
                      <p>{multa.descripcion || 'Sin descripción disponible.'}</p>
                    </div>
                    <div className="info-group">
                      <label>Ubicación</label>
                      <p>{multa.torre_nombre} - {multa.unidad_numero}</p>
                    </div>
                    <div className="info-group">
                      <label>Prioridad</label>
                      <span className={`priority-badge priority-${multa.prioridad || 'media'}`}>
                        {multa.prioridad || 'Media'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'evidence' && (
                <div className="fade-in">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="section-title mb-0">Evidencia Adjunta</h3>
                    <button className="btn-sm btn-outline" onClick={() => alert('Subir evidencia')}>
                      <span className="material-icons fs-6 me-1">upload</span> Subir
                    </button>
                  </div>
                  
                  {loadingTab ? (
                    <div className="text-center py-4 text-muted">Cargando evidencia...</div>
                  ) : documents && documents.length === 0 ? (
                    <div className="empty-state">
                      <span className="material-icons">folder_open</span>
                      <p>No hay evidencia adjunta</p>
                    </div>
                  ) : (
                    <div className="files-grid">
                      {documents?.map((d: any, i: number) => (
                        <div key={d.id ?? i} className="file-card">
                          <div className="file-icon">
                            <span className="material-icons">description</span>
                          </div>
                          <div className="file-info">
                            <div className="file-name">{d.nombre_archivo ?? d.file_name}</div>
                            <div className="file-desc">{d.descripcion}</div>
                          </div>
                          <a href={d.ruta_archivo ?? d.url} target="_blank" rel="noreferrer" className="btn-icon-sm">
                            <span className="material-icons">visibility</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="fade-in">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="section-title mb-0">Historial de Pagos</h3>
                  </div>
                  
                  {loadingTab ? (
                    <div className="text-center py-4">Cargando...</div>
                  ) : payments && payments.length === 0 ? (
                    <div className="empty-state">
                      <span className="material-icons">payments</span>
                      <p>No hay pagos registrados</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="custom-table">
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
                              <td className="fw-bold text-success">${p.monto ?? p.monto_pagado}</td>
                              <td>{p.metodo_pago ?? '-'}</td>
                              <td>{p.referencia_pago ?? p.referencia ?? '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'appeals' && (
                <div className="fade-in">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="section-title mb-0">Apelaciones</h3>
                    <button 
                      className="btn-sm btn-outline"
                      data-bs-toggle='modal'
                      data-bs-target='#appealModal'
                    >
                      <span className="material-icons fs-6 me-1">add</span> Nueva Apelación
                    </button>
                  </div>

                  {loadingTab ? (
                    <div className="text-center py-4">Cargando...</div>
                  ) : appeals && appeals.length === 0 ? (
                    <div className="empty-state">
                      <span className="material-icons">gavel</span>
                      <p>No hay apelaciones registradas</p>
                    </div>
                  ) : (
                    <div className="appeals-list">
                      {appeals?.map((a: any, i: number) => (
                        <div key={a.id ?? i} className="appeal-card">
                          <div className="appeal-header">
                            <span className="appeal-date">{formatDate(a.created_at)}</span>
                            <span className="badge bg-light text-dark">Pendiente</span>
                          </div>
                          <div className="appeal-body">
                            <p>{a.motivo_apelacion ?? a.motivo}</p>
                            {a.resolucion && (
                              <div className="appeal-resolution">
                                <strong>Resolución:</strong> {a.resolucion}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'communications' && (
                <div className="fade-in">
                  <h3 className="section-title mb-4">Historial de Actividad</h3>
                  <div className="timeline-feed">
                    {comms?.map((c: any, i: number) => (
                      <div key={c.id ?? i} className="feed-item">
                        <div className="feed-icon">
                          <span className="material-icons">history</span>
                        </div>
                        <div className="feed-content">
                          <div className="feed-header">
                            <span className="feed-action">{c.accion}</span>
                            <span className="feed-date">{formatDate(c.created_at)}</span>
                          </div>
                          <p className="feed-desc">{c.observaciones ?? c.descripcion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='sidebar-column'>
          <div className="sidebar-card">
            <h4 className="sidebar-title">
              <span className="material-icons">apartment</span>
              Unidad
            </h4>
            <div className="sidebar-content">
              <div className="unit-display">
                <div className="unit-number">{multa.unidad_numero}</div>
                <div className="unit-tower">{multa.torre_nombre}</div>
              </div>
              <div className="info-row">
                <span className="label">Propietario</span>
                <span className="value">{multa.propietario_nombre ?? '—'}</span>
              </div>
              <div className="info-row">
                <span className="label">Email</span>
                <span className="value text-truncate" title={multa.propietario_email}>{multa.propietario_email ?? '—'}</span>
              </div>
              <button className="btn-link-action mt-2" onClick={() => alert('Ver detalle unidad')}>
                Ver perfil de unidad
              </button>
            </div>
          </div>

          <div className="sidebar-card">
            <h4 className="sidebar-title">
              <span className="material-icons">info</span>
              Información Adicional
            </h4>
            <div className="sidebar-content">
              <div className="info-row">
                <span className="label">Creado por</span>
                <span className="value">Administración</span>
              </div>
              <div className="info-row">
                <span className="label">ID Interno</span>
                <span className="value">#{multa.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals (Keeping structure but cleaning up classes if needed) */}
      <div className='modal fade' id='paymentModal' tabIndex={-1}>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Registrar Pago</h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal'></button>
            </div>
            <div className='modal-body'>
              <form ref={paymentFormRef} id='paymentForm'>
                <div className='mb-3'>
                  <label className='form-label'>Monto Pagado *</label>
                  <div className='input-group'>
                    <span className='input-group-text'>$</span>
                    <input name='monto' type='number' className='form-control' defaultValue={multa.monto} required />
                  </div>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Fecha de Pago *</label>
                  <input name='fecha_pago' type='date' className='form-control' required defaultValue={formatDateInput(new Date())} />
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
                  <input name='referencia' type='text' className='form-control' placeholder='Número de transacción' />
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Observaciones</label>
                  <textarea name='observaciones' className='form-control' rows={3} placeholder='Observaciones...'></textarea>
                </div>
              </form>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>Cancelar</button>
              <button type='button' className='btn btn-success' onClick={handleRegistrarPago}>Registrar Pago</button>
            </div>
          </div>
        </div>
      </div>

      <div className='modal fade' id='appealModal' tabIndex={-1}>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Crear Apelación</h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal'></button>
            </div>
            <div className='modal-body'>
              <form ref={appealFormRef} id='appealForm'>
                <div className='mb-3'>
                  <label className='form-label'>Motivo de la apelación *</label>
                  <textarea name='motivo' className='form-control' rows={4} required minLength={20} placeholder="Describa detalladamente el motivo..." />
                  {appealError && <div className='text-danger small mt-1'>{appealError}</div>}
                </div>
              </form>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>Cancelar</button>
              <button type='button' className='btn btn-primary' onClick={handleCrearApelacion}>Enviar Apelación</button>
            </div>
          </div>
        </div>
      </div>

      <div className='modal fade' id='editModal' tabIndex={-1}>
        <div className='modal-dialog modal-lg'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Editar Multa</h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal'></button>
            </div>
            <div className='modal-body'>
              <form>
                <div className='row'>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>Fecha de Infracción</label>
                    <input type='date' className='form-control' defaultValue={formatDateInput(multa.fecha_infraccion)} />
                  </div>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>Monto</label>
                    <div className='input-group'>
                      <span className='input-group-text'>$</span>
                      <input type='number' className='form-control' defaultValue={multa.monto} />
                    </div>
                  </div>
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Descripción</label>
                  <textarea className='form-control' rows={4} defaultValue={multa.descripcion}></textarea>
                </div>
                <div className='row'>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>Vencimiento</label>
                    <input type='date' className='form-control' defaultValue={formatDateInput(fechaVencimiento)} />
                  </div>
                  <div className='col-md-6 mb-3'>
                    <label className='form-label'>Prioridad</label>
                    <select className='form-select' defaultValue={multa.prioridad}>
                      <option value='baja'>Baja</option>
                      <option value='media'>Media</option>
                      <option value='alta'>Alta</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>Cancelar</button>
              <button type='button' className='btn btn-primary' onClick={() => alert('Multa actualizada')}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .multa-detalle-page {
          background-color: #f8f9fa;
          min-height: 100vh;
          padding-bottom: 2rem;
        }

        .page-header {
          background: white;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .header-content {
          flex: 1;
        }

        .btn-back {
          background: none;
          border: none;
          color: #6c757d;
          padding: 0;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: color 0.2s;
        }

        .btn-back:hover {
          color: #212529;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #212529;
          margin: 0;
        }

        .amount-card {
          background: #f8f9fa;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          text-align: right;
          border: 1px solid #e9ecef;
        }

        .amount-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #6c757d;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .amount-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2a5298;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .btn-primary-action {
          background: #2a5298;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-primary-action:hover {
          background: #1e3c72;
          transform: translateY(-1px);
        }

        .btn-secondary-action {
          background: white;
          color: #495057;
          border: 1px solid #dee2e6;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-secondary-action:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
          color: #212529;
        }

        .btn-icon-action {
          background: white;
          border: 1px solid #dee2e6;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #495057;
          transition: all 0.2s;
        }

        .btn-icon-action:hover {
          background: #f8f9fa;
          color: #212529;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1.5rem;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (max-width: 992px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        .main-column {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e9ecef;
          overflow: hidden;
        }

        .tabs-container {
          display: flex;
          flex-direction: column;
        }

        .tabs-header {
          display: flex;
          border-bottom: 1px solid #e9ecef;
          padding: 0 1.5rem;
          background: #fff;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 1rem 1.5rem;
          font-weight: 600;
          color: #6c757d;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          color: #2a5298;
        }

        .tab-btn.active {
          color: #2a5298;
          border-bottom-color: #2a5298;
        }

        .tab-content-area {
          padding: 2rem;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #212529;
          margin-bottom: 1.5rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .info-group label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #6c757d;
          font-weight: 600;
          margin-bottom: 0.4rem;
          letter-spacing: 0.5px;
        }

        .info-group p {
          margin: 0;
          color: #212529;
          font-size: 0.95rem;
        }

        .sidebar-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e9ecef;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .sidebar-title {
          font-size: 1rem;
          font-weight: 700;
          color: #212529;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sidebar-title .material-icons {
          color: #6c757d;
          font-size: 1.2rem;
        }

        .unit-display {
          text-align: center;
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.25rem;
        }

        .unit-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2a5298;
        }

        .unit-tower {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
        }

        .info-row .label {
          color: #6c757d;
        }

        .info-row .value {
          font-weight: 500;
          color: #212529;
        }

        .btn-link-action {
          background: none;
          border: none;
          color: #2a5298;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0;
          cursor: pointer;
        }

        .btn-link-action:hover {
          text-decoration: underline;
        }

        /* Status Badges */
        .status-badge {
          padding: 0.35rem 0.75rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-pending { background-color: #fffde7; color: #b78103; }
        .status-paid { background-color: #4caf50; color: white; }
        .status-overdue { background-color: #ffebee; color: #b71c1c; }
        .status-appealed { background-color: #e3f2fd; color: #0d47a1; }
        .status-cancelled { background-color: #fafafa; color: #616161; }

        .priority-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .priority-baja { background-color: #f1f8e9; color: #33691e; }
        .priority-media { background-color: #fffde7; color: #f57f17; }
        .priority-alta { background-color: #ffebee; color: #c62828; }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #adb5bd;
        }

        .empty-state .material-icons {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        /* Files Grid */
        .files-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .file-card {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.2s;
        }

        .file-card:hover {
          border-color: #2a5298;
          box-shadow: 0 2px 8px rgba(42, 82, 152, 0.1);
        }

        .file-icon {
          color: #2a5298;
          background: #e3f2fd;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-info {
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-weight: 600;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-desc {
          font-size: 0.75rem;
          color: #6c757d;
        }

        /* Custom Table */
        .custom-table {
          width: 100%;
          border-collapse: collapse;
        }

        .custom-table th {
          text-align: left;
          padding: 1rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #6c757d;
          font-weight: 600;
          border-bottom: 2px solid #e9ecef;
        }

        .custom-table td {
          padding: 1rem;
          border-bottom: 1px solid #e9ecef;
          color: #212529;
        }

        /* Timeline Feed */
        .timeline-feed {
          position: relative;
          padding-left: 1rem;
        }

        .timeline-feed::before {
          content: '';
          position: absolute;
          left: 24px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e9ecef;
        }

        .feed-item {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          position: relative;
        }

        .feed-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: white;
          border: 2px solid #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
          z-index: 1;
        }

        .feed-content {
          flex: 1;
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
        }

        .feed-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .feed-action {
          font-weight: 600;
          color: #212529;
        }

        .feed-date {
          font-size: 0.8rem;
          color: #6c757d;
        }

        .feed-desc {
          margin: 0;
          font-size: 0.9rem;
          color: #495057;
        }

        .btn-sm.btn-outline {
          border: 1px solid #dee2e6;
          background: white;
          color: #495057;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
        }
        
        .btn-sm.btn-outline:hover {
          background: #f8f9fa;
          color: #2a5298;
          border-color: #2a5298;
        }
        
        .btn-icon-sm {
          color: #6c757d;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .btn-icon-sm:hover {
          background: #e9ecef;
          color: #2a5298;
        }
        
        .appeal-card {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        
        .appeal-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        
        .appeal-date {
          font-size: 0.85rem;
          color: #6c757d;
        }
        
        .appeal-body p {
          margin: 0;
          color: #212529;
        }
        
        .appeal-resolution {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e9ecef;
          font-size: 0.9rem;
          color: #495057;
        }
      `}</style>
    </div>
  );
};

export default MultaDetallePage;
