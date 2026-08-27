import { RecurringBill } from '../types';

export const INITIAL_RECURRING_BILLS: RecurringBill[] = [
  {
    id: 'rec_bpjs_1',
    title: 'BPJS Kesehatan',
    amount: 150000,
    categoryId: 'health',
    paymentMethod: 'bank',
    dueDay: 10,
    notes: 'Tagihan iuran BPJS Kesehatan kelas 1 / keluarga',
    isActive: true,
    paidMonths: ['2026-07'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
  {
    id: 'rec_pulsa_2',
    title: 'Paket Data & Pulsa HP',
    amount: 100000,
    categoryId: 'bills',
    paymentMethod: 'e-wallet',
    dueDay: 5,
    notes: 'Kuota internet bulanan',
    isActive: true,
    paidMonths: ['2026-07', '2026-08'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
  {
    id: 'rec_uangkas_3',
    title: 'Uang Kas (RT / Kantor / Komunitas)',
    amount: 50000,
    categoryId: 'other_expense',
    paymentMethod: 'cash',
    dueDay: 15,
    notes: 'Iuran kas bulanan wajib',
    isActive: true,
    paidMonths: ['2026-07'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
  {
    id: 'rec_pln_4',
    title: 'Listrik PLN / Token',
    amount: 300000,
    categoryId: 'bills',
    paymentMethod: 'bank',
    dueDay: 20,
    notes: 'Listrik rumah bulanan',
    isActive: true,
    paidMonths: ['2026-07'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
  {
    id: 'rec_wifi_5',
    title: 'WiFi / Internet Rumah',
    amount: 280000,
    categoryId: 'bills',
    paymentMethod: 'bank',
    dueDay: 18,
    notes: 'Langganan IndiHome/Biznet',
    isActive: true,
    paidMonths: ['2026-07'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
];

export interface RecurringBillPreset {
  title: string;
  defaultAmount: number;
  categoryId: string;
  paymentMethod: 'bank' | 'cash' | 'e-wallet' | 'credit_card';
  dueDay: number;
  iconName: string;
  description: string;
}

export const RECURRING_PRESETS: RecurringBillPreset[] = [
  {
    title: 'BPJS Kesehatan',
    defaultAmount: 150000,
    categoryId: 'health',
    paymentMethod: 'bank',
    dueDay: 10,
    iconName: 'HeartPulse',
    description: 'Iuran jaminan kesehatan bulanan',
  },
  {
    title: 'Paket Data & Pulsa',
    defaultAmount: 100000,
    categoryId: 'bills',
    paymentMethod: 'e-wallet',
    dueDay: 5,
    iconName: 'Smartphone',
    description: 'Paket internet & kuota telepon',
  },
  {
    title: 'Uang Kas / Iuran Warga',
    defaultAmount: 50000,
    categoryId: 'other_expense',
    paymentMethod: 'cash',
    dueDay: 15,
    iconName: 'Users',
    description: 'Uang kas RT/RW, kantor, arisan',
  },
  {
    title: 'Listrik PLN (Token / Tagihan)',
    defaultAmount: 300000,
    categoryId: 'bills',
    paymentMethod: 'bank',
    dueDay: 20,
    iconName: 'Zap',
    description: 'Tagihan / isi ulang token listrik',
  },
  {
    title: 'WiFi / Internet Rumah',
    defaultAmount: 280000,
    categoryId: 'bills',
    paymentMethod: 'bank',
    dueDay: 18,
    iconName: 'Wifi',
    description: 'Langganan fiber optik internet rumah',
  },
  {
    title: 'Sewa Kost / Rumah / IPL',
    defaultAmount: 1200000,
    categoryId: 'family',
    paymentMethod: 'bank',
    dueDay: 1,
    iconName: 'Home',
    description: 'Biaya sewa tempat tinggal bulanan',
  },
  {
    title: 'Tagihan Air PDAM',
    defaultAmount: 75000,
    categoryId: 'bills',
    paymentMethod: 'e-wallet',
    dueDay: 12,
    iconName: 'Droplet',
    description: 'Biaya utilitas air bersih',
  },
  {
    title: 'Langganan Streaming (Netflix/Spotify)',
    defaultAmount: 65000,
    categoryId: 'entertainment',
    paymentMethod: 'credit_card',
    dueDay: 25,
    iconName: 'Film',
    description: 'Hiburan digital bulanan',
  },
  {
    title: 'Cicilan Kendaraan / Gadget',
    defaultAmount: 750000,
    categoryId: 'investment_out',
    paymentMethod: 'bank',
    dueDay: 8,
    iconName: 'CreditCard',
    description: 'Angsuran bulanan wajib',
  },
];
