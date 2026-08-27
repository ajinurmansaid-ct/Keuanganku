import { Category, PaymentMethod } from '../types';

export const EXPENSE_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'Makanan & Minuman',
    type: 'expense',
    icon: 'Utensils',
    color: '#F59E0B', // Amber
    bgColor: 'bg-amber-100 text-amber-800 border-amber-200',
    defaultBudget: 2500000,
  },
  {
    id: 'transport',
    name: 'Transportasi & Bensin',
    type: 'expense',
    icon: 'Car',
    color: '#3B82F6', // Blue
    bgColor: 'bg-blue-100 text-blue-800 border-blue-200',
    defaultBudget: 1000000,
  },
  {
    id: 'bills',
    name: 'Tagihan & Utilitas',
    type: 'expense',
    icon: 'Zap',
    color: '#EF4444', // Red
    bgColor: 'bg-red-100 text-red-800 border-red-200',
    defaultBudget: 1500000,
  },
  {
    id: 'shopping',
    name: 'Belanja & Gaya Hidup',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#EC4899', // Pink
    bgColor: 'bg-pink-100 text-pink-800 border-pink-200',
    defaultBudget: 1200000,
  },
  {
    id: 'entertainment',
    name: 'Hiburan & Hobi',
    type: 'expense',
    icon: 'Film',
    color: '#8B5CF6', // Purple
    bgColor: 'bg-purple-100 text-purple-800 border-purple-200',
    defaultBudget: 800000,
  },
  {
    id: 'health',
    name: 'Kesehatan & Medis',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#10B981', // Emerald
    bgColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    defaultBudget: 500000,
  },
  {
    id: 'education',
    name: 'Pendidikan & Bimbingan',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#06B6D4', // Cyan
    bgColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    defaultBudget: 1000000,
  },
  {
    id: 'family',
    name: 'Keluarga & Tempat Tinggal',
    type: 'expense',
    icon: 'Home',
    color: '#F97316', // Orange
    bgColor: 'bg-orange-100 text-orange-800 border-orange-200',
    defaultBudget: 2000000,
  },
  {
    id: 'investment_out',
    name: 'Tabungan & Cicilan',
    type: 'expense',
    icon: 'ShieldCheck',
    color: '#6366F1', // Indigo
    bgColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    defaultBudget: 1500000,
  },
  {
    id: 'debt_payment',
    name: 'Bayar Hutang & Talangan',
    type: 'expense',
    icon: 'Receipt',
    color: '#E11D48', // Rose dark
    bgColor: 'bg-rose-100 text-rose-800 border-rose-200',
    defaultBudget: 1000000,
  },
  {
    id: 'other_expense',
    name: 'Pengeluaran Lainnya',
    type: 'expense',
    icon: 'MoreHorizontal',
    color: '#6B7280', // Gray
    bgColor: 'bg-gray-100 text-gray-800 border-gray-200',
    defaultBudget: 500000,
  },
];

export const INCOME_CATEGORIES: Category[] = [
  {
    id: 'salary',
    name: 'Gaji Utama & Bonus',
    type: 'income',
    icon: 'Wallet',
    color: '#10B981', // Emerald
    bgColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'business',
    name: 'Usaha & Freelance',
    type: 'income',
    icon: 'Briefcase',
    color: '#059669', // Emerald dark
    bgColor: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  {
    id: 'investment_in',
    name: 'Investasi & Dividen',
    type: 'income',
    icon: 'TrendingUp',
    color: '#2563EB', // Blue
    bgColor: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  {
    id: 'gift',
    name: 'Hadiah & Transfer Usaha',
    type: 'income',
    icon: 'Gift',
    color: '#D97706', // Amber
    bgColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'other_income',
    name: 'Pemasukan Lainnya',
    type: 'income',
    icon: 'PlusCircle',
    color: '#4B5563', // Gray
    bgColor: 'bg-gray-100 text-gray-800 border-gray-200',
  },
];

export const ALL_CATEGORIES: Category[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'bank', label: 'Transfer Bank', icon: 'Landmark' },
  { id: 'e-wallet', label: 'E-Wallet (GoPay/OVO/DANA)', icon: 'Smartphone' },
  { id: 'cash', label: 'Tunai (Cash)', icon: 'Banknote' },
  { id: 'credit_card', label: 'Kartu Kredit', icon: 'CreditCard' },
];
