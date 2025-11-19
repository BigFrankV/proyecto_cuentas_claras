// =========================================
// TIPOS PARA PAGOS
// =========================================

export type EstadoPago = 'pending' | 'approved' | 'cancelled' | 'failed';

export type MetodoPago = 'transferencia' | 'efectivo' | 'tarjeta' | 'webpay' | 'khipu';

export const ESTADOS_PAGO = {
  pending: { label: 'Pendiente', color: 'warning' },
  approved: { label: 'Aprobado', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'secondary' },
  failed: { label: 'Fallido', color: 'danger' },
} as const;

export const METODOS_PAGO = {
  transferencia: { label: 'Transferencia' },
  efectivo: { label: 'Efectivo' },
  tarjeta: { label: 'Tarjeta' },
  webpay: { label: 'Webpay' },
  khipu: { label: 'Khipu' },
} as const;

export interface Pago {
  id: number;
  concepto: string;
  monto: number;
  fecha: string;
  estado: EstadoPago;
  metodoPago: MetodoPago;
  personaId: number;
  comunidadId: number;
  transactionId?: string;
  gateway?: string;
  // Additional fields from backend
  orderId?: string;
  paymentDate?: string;
  reference?: string;
  receiptNumber?: string;
  communityName?: string;
  unitNumber?: string;
  residentName?: string;
  residentEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentFilters {
  search: string;
  status: string;
  method: string;
  dateFrom: string;
  dateTo: string;
  limit?: number;
  offset?: number;
}

export interface PaymentStats {
  totalPayments: number;
  approvedPayments: number;
  pendingPayments: number;
  cancelledPayments: number;
  totalAmount: number;
  averageAmount: number;
  oldestPayment?: string;
  newestPayment?: string;
  approvedAmount?: number;
}

export interface PaginatedPayments {
  data: Pago[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface PaymentDetail {
  id: string | number;
  orderId: string;
  amount: number;
  gateway: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  reference: string;
  unitNumber: string;
  unitId: number;
  resident: {
    name: string;
    email: string;
    phone: string;
  };
  charges: Array<{
    id: number;
    type: string;
    description: string;
    amount: number;
    month: string;
    year: number;
  }>;
  documents: Array<{
    id: number;
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
  timeline: Array<{
    id: number;
    action: string;
    description: string;
    date: string;
    user: string;
  }>;
}

export interface EstadisticaPorEstado {
  status: string;
  count: number;
  total_amount: number;
  average_amount: number;
}

export interface EstadisticaPorMetodo {
  payment_method: string;
  count: number;
  total_amount: number;
  average_amount: number;
}
