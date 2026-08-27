import { SavingsGoal, SavingsCategoryType } from '../types';

export interface SavingsCategoryConfig {
  id: SavingsCategoryType;
  label: string;
  icon: string;
  defaultColor: string;
}

export const SAVINGS_CATEGORIES_CONFIG: SavingsCategoryConfig[] = [
  { id: 'emergency', label: 'Dana Darurat', icon: 'ShieldCheck', defaultColor: '#10B981' },
  { id: 'gadget', label: 'Elektronik & Gadget', icon: 'Laptop', defaultColor: '#3B82F6' },
  { id: 'travel', label: 'Liburan & Healing', icon: 'Plane', defaultColor: '#F59E0B' },
  { id: 'vehicle', label: 'Kendaraan & Transport', icon: 'Car', defaultColor: '#F97316' },
  { id: 'property', label: 'DP Rumah & Tempat Tinggal', icon: 'Home', defaultColor: '#8B5CF6' },
  { id: 'education', label: 'Pendidikan & Kursus', icon: 'GraduationCap', defaultColor: '#06B6D4' },
  { id: 'investment', label: 'Investasi Masa Depan', icon: 'TrendingUp', defaultColor: '#059669' },
  { id: 'wedding', label: 'Pernikahan & Keluarga', icon: 'Heart', defaultColor: '#EC4899' },
  { id: 'other', label: 'Target Lainnya', icon: 'PiggyBank', defaultColor: '#6366F1' },
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'save-1',
    title: 'Dana Darurat (6 Bulan Pengeluaran)',
    targetAmount: 30000000,
    currentAmount: 18500000,
    targetDate: '2026-12-31',
    category: 'emergency',
    color: '#10B981',
    icon: 'ShieldCheck',
    notes: 'Disimpan di instrumen likuid (Reksadana Pasar Uang / Deposito)',
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    history: [
      {
        id: 'log-1-1',
        date: '2026-06-01',
        amount: 10000000,
        type: 'deposit',
        note: 'Saldo tabungan awal yang dipindahkan',
        createdAt: Date.now() - 75 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'log-1-2',
        date: '2026-07-02',
        amount: 4500000,
        type: 'deposit',
        note: 'Setoran tabungan bulanan dari gaji Juli',
        createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'log-1-3',
        date: '2026-08-05',
        amount: 4000000,
        type: 'deposit',
        note: 'Alokasi 25% gaji Agustus untuk dana darurat',
        createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: 'save-2',
    title: 'Upgrade Laptop Kerja M3 Pro',
    targetAmount: 22000000,
    currentAmount: 14000000,
    targetDate: '2026-11-15',
    category: 'gadget',
    color: '#3B82F6',
    icon: 'Laptop',
    notes: 'Untuk menunjang produktivitas coding dan editing',
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    history: [
      {
        id: 'log-2-1',
        date: '2026-06-15',
        amount: 6000000,
        type: 'deposit',
        note: 'Bonus project freelance',
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'log-2-2',
        date: '2026-07-15',
        amount: 4000000,
        type: 'deposit',
        note: 'Tabungan rutin Juli',
        createdAt: Date.now() - 32 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'log-2-3',
        date: '2026-08-10',
        amount: 4000000,
        type: 'deposit',
        note: 'Setoran Agustus',
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: 'save-3',
    title: 'Liburan Akhir Tahun ke Jepang',
    targetAmount: 15000000,
    currentAmount: 8500000,
    targetDate: '2026-12-20',
    category: 'travel',
    color: '#F59E0B',
    icon: 'Plane',
    notes: 'Tiket pesawat promo + akomodasi hotel',
    createdAt: Date.now() - 40 * 24 * 60 * 60 * 1000,
    history: [
      {
        id: 'log-3-1',
        date: '2026-07-10',
        amount: 5000000,
        type: 'deposit',
        note: 'Tabungan awal liburan',
        createdAt: Date.now() - 37 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'log-3-2',
        date: '2026-08-08',
        amount: 3500000,
        type: 'deposit',
        note: 'Setoran bulan Agustus',
        createdAt: Date.now() - 9 * 24 * 60 * 60 * 1000,
      },
    ],
  },
];
