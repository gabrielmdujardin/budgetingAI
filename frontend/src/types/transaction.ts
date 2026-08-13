export type Category =
  | 'FOOD'
  | 'HEALTH'
  | 'TRANSPORT'
  | 'SHOPPING'
  | 'LEISURE'
  | 'HOME'
  | 'EDUCATION'
  | 'SERVICES'
  | 'INVESTMENTS'
  | 'SALARY'
  | 'OTHER';

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionRequest {
  description: string;
  amount: number;
  category: Category;
}

export interface SummaryResponse {
  /** Saldo = receitas - despesas */
  total: number;
  /** Somente SALARY + INVESTMENTS */
  totalIncome: number;
  /** Somente categorias de despesa (exclui SALARY e INVESTMENTS) */
  totalExpenses: number;
  categories: Partial<Record<Category, number>>;
}


export type VoiceAction =
  | 'CREATE_TRANSACTION'
  | 'LIST_TRANSACTIONS'
  | 'LIST_TRANSACTIONS_BY_CATEGORY'
  | 'BALANCE'
  | 'NEEDS_AMOUNT'
  | 'TRANSCRIPTION_FAILED'
  | 'INVALID_AUDIO';

export interface VoiceResponse {
  action: VoiceAction;
  message: string;
  transcription: string;
  balance?: number;
  summary?: SummaryResponse;
  transaction?: Transaction;
  transactions?: Transaction[];
}

export const CATEGORY_LABELS: Record<Category, { label: string; icon: string; color: string }> = {
  FOOD: { label: 'Alimentacao', icon: 'Utensils', color: '#D93025' },
  HEALTH: { label: 'Saude', icon: 'HeartPulse', color: '#0B8F3C' },
  TRANSPORT: { label: 'Transporte', icon: 'Car', color: '#3B82F6' },
  SHOPPING: { label: 'Compras', icon: 'ShoppingBag', color: '#7A4CC2' },
  LEISURE: { label: 'Lazer', icon: 'Tv', color: '#F59E0B' },
  HOME: { label: 'Casa', icon: 'Home', color: '#14B8A6' },
  EDUCATION: { label: 'Educacao', icon: 'GraduationCap', color: '#6366F1' },
  SERVICES: { label: 'Servicos', icon: 'Wrench', color: '#EC4899' },
  INVESTMENTS: { label: 'Investimentos', icon: 'TrendingUp', color: '#22C55E' },
  SALARY: { label: 'Salario / Renda', icon: 'DollarSign', color: '#0B8F3C' },
  OTHER: { label: 'Outros', icon: 'HelpCircle', color: '#6B7280' },
};
