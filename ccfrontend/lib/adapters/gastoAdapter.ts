import * as gastosApi from '../api/gastos';

type GastoConRelaciones = gastosApi.GastoDetalle & {
  archivos?: gastosApi.ArchivoAdjunto[];
  aprobaciones?: gastosApi.Aprobacion[];
  historial?: gastosApi.HistorialCambio[];
  emisiones?: gastosApi.EmisionGasto[];
};

/**
 * Adapta los datos del gasto del backend al formato usado en el frontend
 */
export const adaptGastoForDetail = (gasto: GastoConRelaciones) => {
  const aprobacionesAprobadas = gasto.aprobaciones?.filter(a => a.estado === 'aprobado').length || 0;
  const aprobacionesRequeridas = calcularAprobacionesRequeridas(gasto.monto);

  return {
    ...gasto,
    // Mantener compatibilidad con componentes que usan nombres antiguos
    description: gasto.glosa,
    amount: gasto.monto,
    date: gasto.fecha,
    status: gasto.estado,
    category: gasto.categoria_nombre || 'Sin categoría',
    createdBy: gasto.creado_por_nombre || 'Usuario',
    createdAt: gasto.created_at,
    currentApprovals: aprobacionesAprobadas,
    requiredApprovals: aprobacionesRequeridas,
    costCenter: gasto.centro_costo_nombre || '-',
    provider: gasto.centro_costo_nombre || '-', // Usar centro de costo como proveedor temporal
    documentType: 'Gasto',
    documentNumber: gasto.numero,
    hasAttachments: gasto.archivos && gasto.archivos.length > 0,
    // Valores por defecto para campos no disponibles
    tags: [],
    priority: gasto.extraordinario ? 'high' : 'medium',
    observations: '',
    isRecurring: false,
    recurringPeriod: '',
    paymentMethod: '',
    dueDate: gasto.fecha, // Usar fecha del gasto como fallback
    // Adaptar aprobaciones al formato esperado
    approvalHistory: gasto.aprobaciones?.map(a => ({
      id: a.id,
      approver: a.persona_nombre || 'Usuario',
      action: a.estado === 'aprobado' ? 'approved' : a.estado === 'rechazado' ? 'rejected' : 'requested_changes',
      date: a.fecha_aprobacion || a.created_at,
      comments: a.comentario || ''
    })) || [],
    // Adaptar archivos
    attachments: gasto.archivos?.map((a: gastosApi.ArchivoAdjunto) => ({
      id: a.id,
      name: a.nombre_archivo,
      type: a.tipo_archivo,
      size: a.tamano,
      url: a.ruta,
      uploadedAt: a.created_at
    })) || []
  };
};

/**
 * Calcula las aprobaciones requeridas según el monto
 * TODO: Obtener esta lógica del backend
 */
function calcularAprobacionesRequeridas(monto: number): number {
  if (monto >= 5000000) return 3; // Más de 5M requiere 3 aprobaciones
  if (monto >= 1000000) return 2; // Entre 1M y 5M requiere 2
  return 1; // Menos de 1M requiere 1
}
