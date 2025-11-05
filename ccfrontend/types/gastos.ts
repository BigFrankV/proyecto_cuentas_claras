/* eslint-disable @typescript-eslint/no-explicit-any */
// Tipos para módulo Gastos (backend <-> frontend)

export type GastoStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'paid'
  | 'completed';
export type GastoPriority = 'low' | 'medium' | 'high';

export interface AttachmentFile {
  id: number;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface ApprovalRecord {
  id: number;
  approver: string;
  action: 'approved' | 'rejected' | 'requested_changes';
  date: string;
  comments?: string;
}

/** Estructura probable recibida desde el backend */
export interface GastoBackend {
  id: number;
  fecha?: string;
  monto?: number;
  glosa?: string;
  proveedor_nombre?: string;
  centro_costo?: string;
  categoria?: string;
  categoria_nombre?: string; // Nombre legible de la categoría
  documento_compra_id?: number | null;
  documento_tipo?: string | null;
  documento_numero?: string | null;
  has_attachments?: boolean;
  creado_por?: string | null;
  created_at?: string;
  updated_at?: string;
  status?: GastoStatus;
  due_date?: string | null;
  tags?: string[] | null;
  priority?: GastoPriority | null;
  required_approvals?: number | null;
  current_approvals?: number | null;
  observations?: string | null;
  is_recurring?: boolean | null;
  recurring_period?: string | null;
  payment_method?: string | null;
  approval_history?: ApprovalRecord[] | null;
  attachments?: AttachmentFile[] | null;
}

/** Tipo usado por la UI */
export interface Expense {
  id: number;
  description: string;
  category: string;
  categoryId?: number | null; // <-- permitir null para concordar con backend
  provider: string;
  amount: number;
  date: string;
  status: GastoStatus;
  dueDate?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  hasAttachments: boolean;
  createdBy?: string | null;
  createdAt?: string | null;
  tags: string[];
  priority: GastoPriority;
  requiredApprovals: number;
  currentApprovals: number;
  costCenter?: string | null;
  observations?: string | null;
  isRecurring: boolean;
  recurringPeriod?: string | null;
  paymentMethod?: string | null;
  approvalHistory: ApprovalRecord[];
  attachments: AttachmentFile[];
}

export interface GastosListResponse {
  data: GastoBackend[] | GastoBackend;
  pagination?: {
    total?: number;
    limit?: number;
    offset?: number;
    hasMore?: boolean;
  };
}

export interface CreateGastoPayload {
  categoria_id: number;
  fecha: string;
  monto: number;
  centro_costo_id?: number;
  documento_compra_id?: number;
  glosa?: string;
  extraordinario?: boolean;
  // Agrega otros campos si el backend los requiere
}

export interface UpdateGastoPayload extends Partial<CreateGastoPayload> {}

export interface GastosFilters {
  search?: string;
  category?: string;
  status?: GastoStatus;
  provider?: string;
  dateFrom?: string;
  dateTo?: string;
  amountFrom?: number;
  amountTo?: number;
  page?: number;
  limit?: number;
}

/** Mapea GastoBackend -> Expense (UI) */
export function mapBackendToExpense(g: GastoBackend): Expense {
  const statusMap: Record<string, GastoStatus> = {
    pendiente: 'pending',
    aprobado: 'approved',
    rechazado: 'rejected',
    anulado: 'rejected',
    pagado: 'paid',
    completado: 'completed',
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected',
    paid: 'paid',
    completed: 'completed',
  };

  const backendStatus = String(
    (g as any).estado || g.status || '',
  ).toLowerCase();
  const normalizedStatus = statusMap[backendStatus] || 'pending';

  return {
    id: g.id,
    description: g.glosa || g.documento_numero || `Gasto #${g.id}`,
    category:
      (g.categoria_nombre as string) || (g.categoria as string) || 'otros',
    categoryId: (g as any).categoria_id ?? (g as any).categoriaId ?? undefined,
    provider: g.proveedor_nombre || g.creado_por || '',
    amount: Number(g.monto) || 0,
    date: g.fecha || g.created_at || '',
    status: normalizedStatus,
    dueDate: (g.due_date as string) || null,
    documentType: g.documento_tipo || null,
    documentNumber: g.documento_numero || null,
    hasAttachments: Boolean(g.has_attachments),
    createdBy: g.creado_por || null,
    createdAt: g.created_at || null,
    tags: g.tags || [],
    priority: (g.priority as GastoPriority) || 'medium',
    requiredApprovals:
      (g as any).required_approals ?? (g as any).required_approvals ?? 0,
    currentApprovals: g.current_approvals || 0,
    costCenter: g.centro_costo || null,
    observations: g.observations || null,
    isRecurring: Boolean(g.is_recurring),
    recurringPeriod: g.recurring_period || null,
    paymentMethod: g.payment_method || null,
    approvalHistory: g.approval_history || [],
    attachments: g.attachments || [],
  };
}

