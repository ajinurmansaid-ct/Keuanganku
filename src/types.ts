export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'cash' | 'bank' | 'e-wallet' | 'credit_card';

export type UserProfileId = 'user_1' | 'user_2';
export type ActiveViewMode = UserProfileId | 'combined';

export interface UserProfile {
  id: UserProfileId;
  name: string;
  subtitle: string;
  avatarIcon: 'User' | 'Heart' | 'Briefcase' | 'Smile' | 'Star' | 'Crown';
  color: 'emerald' | 'violet' | 'sky' | 'rose' | 'amber';
  badgeBg: string;
  badgeText: string;
  borderClass: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType | 'both';
  icon: string;
  color: string; // Tailwind color class or hex
  bgColor: string;
  defaultBudget?: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
  profileId?: UserProfileId;
}

export interface CategoryBudget {
  categoryId: string;
  monthlyLimit: number;
  profileId?: UserProfileId;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number; // percentage 0-100
  dailyAverageExpense: number;
  transactionCount: number;
}

export interface CategoryExpenseBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  icon: string;
  color: string;
  bgColor: string;
}

export interface DailyExpenseData {
  date: string; // YYYY-MM-DD or short date
  formattedDate: string; // e.g. "12 Ags"
  expense: number;
  income: number;
  cumulativeExpense: number;
}

export interface MonthlyComparisonData {
  monthKey: string; // e.g. "2026-05"
  monthName: string; // e.g. "Mei 26"
  pemasukan: number;
  pengeluaran: number;
  net: number;
}

export interface BudgetProgress {
  categoryId: string;
  categoryName: string;
  limit: number;
  spent: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
  color: string;
}

export interface AIAdvice {
  healthScore: number;
  healthStatus: 'Sangat Sehat' | 'Cukup Sehat' | 'Perlu Perhatian' | 'Waspada';
  summary: string;
  keyObservations: string[];
  recommendations: string[];
  spendingWarnings: string[];
}

export type SavingsCategoryType =
  | 'emergency'
  | 'gadget'
  | 'travel'
  | 'vehicle'
  | 'property'
  | 'education'
  | 'investment'
  | 'wedding'
  | 'other';

export interface SavingsLog {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: 'deposit' | 'withdraw';
  note?: string;
  syncWithTransactions?: boolean;
  createdAt: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string; // YYYY-MM-DD
  category: SavingsCategoryType;
  color: string; // Hex color
  icon: string; // Lucide icon name
  notes?: string;
  history: SavingsLog[];
  createdAt: number;
  profileId?: UserProfileId;
}

export interface RecurringBill {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  paymentMethod: PaymentMethod;
  dueDay: number; // 1 - 31 (tanggal jatuh tempo tiap bulan)
  notes?: string;
  isActive: boolean;
  paidMonths: string[]; // List of month keys 'YYYY-MM' where this bill was marked as paid
  lastPaidDate?: string; // YYYY-MM-DD
  createdAt: number;
  profileId?: UserProfileId;
}

export interface DebtPaymentLog {
  id: string;
  debtId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  syncWithTransactions?: boolean;
  createdAt: number;
}

export interface DebtItem {
  id: string;
  title: string;
  creditor: string; // e.g. "Talangan Defisit Juli 2026", "Teman / Keluarga", "Paylater", "Kartu Kredit", "Bank"
  totalAmount: number;
  remainingAmount: number;
  dueDate?: string; // Target tanggal lunas YYYY-MM-DD
  status: 'unpaid' | 'partial' | 'paid';
  isFromMonthlyDeficit?: boolean;
  deficitMonth?: string; // e.g. "2026-07"
  notes?: string;
  paymentMethod?: PaymentMethod;
  history: DebtPaymentLog[];
  createdAt: number;
  profileId?: UserProfileId;
}
