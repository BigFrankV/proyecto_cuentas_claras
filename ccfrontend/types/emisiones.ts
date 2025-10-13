// Tipos para el módulo de emisiones
export interface Emission {
  id: string;
  period: string;
  type: 'gastos_comunes' | 'extraordinaria' | 'multa' | 'interes';
  status: 'draft' | 'ready' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  unitCount: number;
  description: string;
  communityName: string;
  hasInterest?: boolean;
  interestRate?: number;
  gracePeriod?: number;
}

export interface EmissionDetail extends Emission {
  tieneInteres: boolean;
  tasaInteres: number;
  periodoGracia: number;
}

export interface Concept {
  id: string;
  name: string;
  description: string;
  amount: number;
  distributionType: 'proportional' | 'equal' | 'custom';
  category: string;
}

export interface ExpenseDetail {
  id: string;
  description: string;
  amount: number;
  category: string;
  supplier: string;
  date: string;
  document: string;
}

export interface UnitDistribution {
  id: string;
  unitNumber: string;
  unitType: string;
  owner: string;
  contact: string;
  participation: number;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid';
  details?: ConceptDistribution[];
}

export interface ConceptDistribution {
  conceptId: string;
  conceptName: string;
  totalAmount: number;
  unitAmount: number;
  distributionType: 'proportional' | 'equal' | 'custom';
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
  unit: string;
  status: 'confirmed' | 'pending' | 'rejected';
}

export interface HistoryEntry {
  id: string;
  date: string;
  action: string;
  user: string;
  description: string;
}

export interface EmissionFilters {
  search?: string;
  status?: 'all' | 'draft' | 'ready' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  type?: 'all' | 'gastos_comunes' | 'extraordinaria' | 'multa' | 'interes';
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  communityId?: number;
}

export interface EmissionPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface EmissionListResponse {
  data: Emission[];
  pagination: EmissionPagination;
}

export interface CreateEmissionData {
  periodo: string;
  fecha_vencimiento: string;
  observaciones?: string;
  detalles?: EmissionDetailItem[];
}

export interface EmissionDetailItem {
  gasto_id?: number;
  categoria_id: number;
  monto: number;
  regla_prorrateo?: string;
  metadata_json?: string;
}