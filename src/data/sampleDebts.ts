import { DebtItem } from '../types';

export const INITIAL_DEBTS: DebtItem[] = [
  {
    id: 'debt_defisit_juli_1',
    title: 'Talangan Minus Keuangan Juli 2026',
    creditor: 'Defisit Bulan Lalu (Dana Darurat / Talangan)',
    totalAmount: 650000,
    remainingAmount: 350000,
    dueDate: '2026-08-30',
    status: 'partial',
    isFromMonthlyDeficit: true,
    deficitMonth: '2026-07',
    notes: 'Penutup defisit belanja & tagihan membengkak di bulan Juli',
    paymentMethod: 'bank',
    history: [
      {
        id: 'pay_hist_1',
        debtId: 'debt_defisit_juli_1',
        date: '2026-08-05',
        amount: 300000,
        paymentMethod: 'bank',
        notes: 'Cicilan 1 dari gaji awal bulan',
        syncWithTransactions: true,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
      },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
  {
    id: 'debt_pinjaman_teman_2',
    title: 'Pinjaman Teman (Talangan Service Motor)',
    creditor: 'Dimas (Teman)',
    totalAmount: 500000,
    remainingAmount: 500000,
    dueDate: '2026-09-10',
    status: 'unpaid',
    isFromMonthlyDeficit: false,
    notes: 'Pinjam untuk ganti sparepart motor mendadak',
    paymentMethod: 'e-wallet',
    history: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
  },
];

export interface DebtPreset {
  title: string;
  creditor: string;
  defaultAmount: number;
  isFromMonthlyDeficit: boolean;
  notes: string;
  iconName: string;
}

export const DEBT_PRESETS: DebtPreset[] = [
  {
    title: 'Tutup Minus Bulan Lalu',
    creditor: 'Talangan Defisit Anggaran',
    defaultAmount: 500000,
    isFromMonthlyDeficit: true,
    notes: 'Penggantian dana talangan untuk defisit belanja bulan sebelumnya',
    iconName: 'AlertCircle',
  },
  {
    title: 'Pinjaman Teman / Rekan Kerja',
    creditor: 'Teman / Rekan',
    defaultAmount: 300000,
    isFromMonthlyDeficit: false,
    notes: 'Pinjaman pribadi untuk kebutuhan mendesak',
    iconName: 'Users',
  },
  {
    title: 'Tagihan Paylater / Kartu Kredit',
    creditor: 'SPaylater / Kredivo / Kartu Kredit',
    defaultAmount: 750000,
    isFromMonthlyDeficit: false,
    notes: 'Tagihan jatuh tempo transaksi tempo bulan lalu',
    iconName: 'CreditCard',
  },
  {
    title: 'Pinjaman Keluarga / Kerabat',
    creditor: 'Keluarga / Saudara',
    defaultAmount: 1000000,
    isFromMonthlyDeficit: false,
    notes: 'Pinjaman talangan keluarga',
    iconName: 'Home',
  },
];
