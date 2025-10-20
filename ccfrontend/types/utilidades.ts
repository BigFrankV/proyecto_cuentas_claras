// Tipos para las utilidades del sistema

// === UTILIDAD RUT ===
export interface RutValidation {
  rut: string;
  isValid: boolean;
  formatted: string;
  cleanRut: string;
  digitoVerificador: string;
  errorMessage?: string;
}

export interface RutGenerationOptions {
  count: number;
  format: 'dots' | 'clean' | 'dash';
}

export interface GeneratedRut {
  rut: string;
  formatted: string;
  digitoVerificador: string;
}

export interface RutFormatExample {
  format: string;
  example: string;
  description: string;
  isValid: boolean;
}

// === UTILIDAD UF ===
export interface UfValue {
  fecha: string;
  valor: number;
  variacion?: number;
  variacionPorcentaje?: number;
}

export interface UfConsultaResult {
  fecha: string;
  valor: number;
  fechaFormateada: string;
  variacion?: number;
  variacionPorcentaje?: number;
  success: boolean;
  errorMessage?: string;
}

export interface UfCalculatorInputs {
  pesos: number;
  uf: number;
  valorUfActual: number;
}

export interface UfCalculatorResult {
  fromPesos: number;
  fromUf: number;
  toPesos: number;
  toUf: number;
  valorUfUsado: number;
  fechaConsulta: string;
}

export interface UfHistoryItem {
  fecha: string;
  valor: number;
  variacion: number;
  variacionPorcentaje: number;
}

export interface UfChartData {
  labels: string[];
  values: number[];
  period: '7d' | '30d' | '90d' | '1y';
}

// === UTILIDAD UTM ===
export interface UtmValue {
  mes: number;
  ano: number;
  valor: number;
  mesNombre: string;
}

export interface UtmConsultaResult {
  mes: number;
  ano: number;
  valor: number;
  mesNombre: string;
  periodo: string;
  success: boolean;
  errorMessage?: string;
}

export interface UtmCalculatorInputs {
  pesos: number;
  utm: number;
  valorUtmActual: number;
}

export interface UtmCalculatorResult {
  fromPesos: number;
  fromUtm: number;
  toPesos: number;
  toUtm: number;
  valorUtmUsado: number;
  periodoConsulta: string;
}

export interface UtmAnualData {
  [key: number]: UtmValue; // key es el mes (1-12)
}

export interface UtmHistoricoData {
  [key: number]: UtmAnualData; // key es el año
}

// === TIPOS COMUNES ===
export interface DateRange {
  desde: string;
  hasta: string;
}

export interface PeriodoRapido {
  label: string;
  key: string;
  description?: string;
  icon?: string;
}

// Tipos de resultados posibles para calculadoras
export type CalculatorResult = 
  | UtmCalculatorResult 
  | RutValidation 
  | UfCalculatorResult 
  | GeneratedRut
  | string 
  | number 
  | Record<string, unknown>;

export interface CalculatorState {
  loading: boolean;
  error: string | null;
  result: CalculatorResult | null;
}

export interface UtilityStats {
  consultasRealizadas: number;
  ultimaConsulta: string;
  valorActual: number;
  fechaActualizacion: string;
}

// === CONSTANTES ===
export const MESES_NOMBRES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const MESES_ABREV = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export const PERIODOS_RAPIDOS_UF: PeriodoRapido[] = [
  { label: 'Hoy', key: 'today', description: 'Valor UF actual', icon: 'today' },
  {
    label: 'Ayer',
    key: 'yesterday',
    description: 'Valor UF del día anterior',
    icon: 'history',
  },
  {
    label: 'Hace una semana',
    key: 'week',
    description: 'Valor UF hace 7 días',
    icon: 'date_range',
  },
  {
    label: 'Hace un mes',
    key: 'month',
    description: 'Valor UF hace 30 días',
    icon: 'calendar_month',
  },
];

export const PERIODOS_RAPIDOS_UTM: PeriodoRapido[] = [
  {
    label: 'Este mes',
    key: 'current',
    description: 'UTM del mes actual',
    icon: 'today',
  },
  {
    label: 'Mes anterior',
    key: 'previous',
    description: 'UTM del mes pasado',
    icon: 'history',
  },
  {
    label: 'Mismo mes año anterior',
    key: 'year_ago',
    description: 'UTM del mismo mes del año pasado',
    icon: 'compare_arrows',
  },
];

export const RUT_FORMAT_EXAMPLES: RutFormatExample[] = [
  {
    format: 'Con puntos y guión',
    example: '12.345.678-9',
    description: 'Formato estándar chileno',
    isValid: true,
  },
  {
    format: 'Solo con guión',
    example: '12345678-9',
    description: 'Sin separadores de miles',
    isValid: true,
  },
  {
    format: 'Sin formato',
    example: '123456789',
    description: 'Solo números y dígito verificador',
    isValid: true,
  },
  {
    format: 'Con K mayúscula',
    example: '12.345.678-K',
    description: 'Dígito verificador K',
    isValid: true,
  },
];

// === TIPOS DE FUNCIONES UTILITARIAS ===
export type RutFormatter = (
  rut: string,
  format?: 'dots' | 'clean' | 'dash'
) => string;
export type RutValidator = (rut: string) => RutValidation;
export type RutGenerator = (options: RutGenerationOptions) => GeneratedRut[];

export type UfConsultor = (fecha: string) => Promise<UfConsultaResult>;
export type UfCalculator = (
  inputs: UfCalculatorInputs,
  type: 'toPesos' | 'toUf'
) => UfCalculatorResult;

export type UtmConsultor = (
  mes: number,
  ano: number
) => Promise<UtmConsultaResult>;
export type UtmCalculator = (
  inputs: UtmCalculatorInputs,
  type: 'toPesos' | 'toUtm'
) => UtmCalculatorResult;
