import * as XLSX from 'xlsx';
import {
  Transaction,
  CategoryBudget,
  SavingsGoal,
  RecurringBill,
  DebtItem,
  UserProfile,
  UserProfileId,
} from '../types';
import { ALL_CATEGORIES, PAYMENT_METHODS } from '../data/categories';

export interface ExcelExportOptions {
  periodFilter: 'all' | 'selected-month';
  selectedMonth: string; // YYYY-MM
  profileFilter: 'all' | 'user_1' | 'user_2';
  profiles: {
    user_1: UserProfile;
    user_2: UserProfile;
  };
  transactions: Transaction[];
  budgets: CategoryBudget[];
  savingsGoals: SavingsGoal[];
  recurringBills: RecurringBill[];
  debts: DebtItem[];
}

export function exportFinancialDataToExcel(options: ExcelExportOptions) {
  const {
    periodFilter,
    selectedMonth,
    profileFilter,
    profiles,
    transactions,
    budgets,
    savingsGoals,
    recurringBills,
    debts,
  } = options;

  const wb = XLSX.utils.book_new();

  // Helper for Profile Name
  const getProfileName = (id?: UserProfileId) => {
    if (id === 'user_2') return profiles.user_2.name || 'Profil 2';
    return profiles.user_1.name || 'Profil 1';
  };

  // Helper for Category Name
  const getCategoryName = (catId: string) => {
    const found = ALL_CATEGORIES.find((c) => c.id === catId);
    return found ? found.name : catId;
  };

  // Helper for Payment Method Label
  const getPaymentMethodLabel = (pm: string) => {
    const found = PAYMENT_METHODS.find((p) => p.id === pm);
    return found ? found.label : pm;
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchMonth =
      periodFilter === 'all' || t.date.startsWith(selectedMonth);
    const matchProfile =
      profileFilter === 'all' ||
      (t.profileId || 'user_1') === profileFilter;
    return matchMonth && matchProfile;
  });

  // Filter budgets
  const filteredBudgets = budgets.filter((b) => {
    if (profileFilter === 'all') return true;
    return (b.profileId || 'user_1') === profileFilter;
  });

  // Filter savings
  const filteredSavings = savingsGoals.filter((s) => {
    if (profileFilter === 'all') return true;
    return (s.profileId || 'user_1') === profileFilter;
  });

  // Filter bills
  const filteredBills = recurringBills.filter((b) => {
    if (profileFilter === 'all') return true;
    return (b.profileId || 'user_1') === profileFilter;
  });

  // Filter debts
  const filteredDebts = debts.filter((d) => {
    if (profileFilter === 'all') return true;
    return (d.profileId || 'user_1') === profileFilter;
  });

  // ----------------------------------------------------
  // SHEET 1: RINGKASAN & SALDO KEUANGAN
  // ----------------------------------------------------
  // Calculate summary per profile and combined
  const calcSummaryForProfile = (pid?: UserProfileId) => {
    const txs = transactions.filter((t) => {
      const matchMonth =
        periodFilter === 'all' || t.date.startsWith(selectedMonth);
      const matchPid = !pid || (t.profileId || 'user_1') === pid;
      return matchMonth && matchPid;
    });

    const income = txs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = txs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? Math.max(0, Math.round((balance / income) * 100)) : 0;

    const sv = savingsGoals
      .filter((s) => !pid || (s.profileId || 'user_1') === pid)
      .reduce((sum, s) => sum + s.currentAmount, 0);

    const db = debts
      .filter((d) => !pid || (d.profileId || 'user_1') === pid)
      .reduce((sum, d) => sum + d.remainingAmount, 0);

    return { income, expense, balance, savingsRate, savingsTotal: sv, debtTotal: db, txCount: txs.length };
  };

  const user1Sum = calcSummaryForProfile('user_1');
  const user2Sum = calcSummaryForProfile('user_2');
  const totalSum = calcSummaryForProfile(undefined);

  // Summary Rows Data
  const summaryData: (string | number)[][] = [
    ['LAPORAN KEUANGAN & SALDO LENGKAP'],
    ['Tanggal Ekspor', new Date().toLocaleString('id-ID')],
    ['Periode Data', periodFilter === 'all' ? 'Semua Riwayat' : `Bulan ${selectedMonth}`],
    [
      'Filter Profil',
      profileFilter === 'all'
        ? `Gabungan (${profiles.user_1.name} & ${profiles.user_2.name})`
        : profileFilter === 'user_1'
        ? profiles.user_1.name
        : profiles.user_2.name,
    ],
    [],
    ['--- RINGKASAN SALDO & ARUS KAS ---'],
    ['Kategori Metrik', profiles.user_1.name, profiles.user_2.name, 'TOTAL KELUARGA / GABUNGAN'],
    ['Total Pemasukan (Rp)', user1Sum.income, user2Sum.income, totalSum.income],
    ['Total Pengeluaran (Rp)', user1Sum.expense, user2Sum.expense, totalSum.expense],
    ['Sisa Saldo Bersih / Cashflow (Rp)', user1Sum.balance, user2Sum.balance, totalSum.balance],
    ['Saving Rate / Rasio Tabungan (%)', `${user1Sum.savingsRate}%`, `${user2Sum.savingsRate}%`, `${totalSum.savingsRate}%`],
    ['Total Tabungan & Celengan (Rp)', user1Sum.savingsTotal, user2Sum.savingsTotal, totalSum.savingsTotal],
    ['Total Sisa Hutang Belum Lunas (Rp)', user1Sum.debtTotal, user2Sum.debtTotal, totalSum.debtTotal],
    ['Jumlah Transaksi Tercatat', user1Sum.txCount, user2Sum.txCount, totalSum.txCount],
    [],
    ['--- SALDO MENURUT METODE PEMBAYARAN (PERIODE INI) ---'],
    ['Metode Pembayaran', 'Total Pemasukan (Rp)', 'Total Pengeluaran (Rp)', 'Net Arus Kas (Rp)'],
  ];

  // Payment method breakdown for selected period
  PAYMENT_METHODS.forEach((pm) => {
    const pmTxs = filteredTransactions.filter((t) => t.paymentMethod === pm.id);
    const pmIn = pmTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const pmOut = pmTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    summaryData.push([pm.label, pmIn, pmOut, pmIn - pmOut]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 35 }, { wch: 25 }, { wch: 25 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan & Saldo');

  // ----------------------------------------------------
  // SHEET 2: DAFTAR TRANSAKSI LENGKAP
  // ----------------------------------------------------
  const transactionsData = filteredTransactions.map((t, idx) => ({
    'No': idx + 1,
    'Tanggal': t.date,
    'Pemilik / Profil': getProfileName(t.profileId),
    'Jenis Transaksi': t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    'Judul Transaksi': t.title,
    'Kategori': getCategoryName(t.categoryId),
    'Metode Pembayaran': getPaymentMethodLabel(t.paymentMethod),
    'Nominal (Rp)': t.amount,
    'Catatan': t.notes || '-',
  }));

  const wsTransactions = XLSX.utils.json_to_sheet(
    transactionsData.length > 0
      ? transactionsData
      : [
          {
            'No': '-',
            'Tanggal': '-',
            'Pemilik / Profil': '-',
            'Jenis Transaksi': '-',
            'Judul Transaksi': 'Tidak ada data transaksi pada periode ini',
            'Kategori': '-',
            'Metode Pembayaran': '-',
            'Nominal (Rp)': 0,
            'Catatan': '-',
          },
        ]
  );
  wsTransactions['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 20 },
    { wch: 16 },
    { wch: 30 },
    { wch: 24 },
    { wch: 22 },
    { wch: 18 },
    { wch: 35 },
  ];
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Daftar Transaksi');

  // ----------------------------------------------------
  // SHEET 3: ANGGARAN KATEGORI & REALISASI
  // ----------------------------------------------------
  const budgetRows = filteredBudgets.map((b, idx) => {
    const profile = getProfileName(b.profileId);
    const catName = getCategoryName(b.categoryId);
    // calculate spent for this budget in selected month / period
    const spent = transactions
      .filter((t) => {
        const matchCat = t.categoryId === b.categoryId && t.type === 'expense';
        const matchMonth = periodFilter === 'all' || t.date.startsWith(selectedMonth);
        const matchProf = (t.profileId || 'user_1') === (b.profileId || 'user_1');
        return matchCat && matchMonth && matchProf;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = b.monthlyLimit - spent;
    const percentage = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
    const status =
      percentage >= 100
        ? 'Melebihi Anggaran'
        : percentage >= 80
        ? 'Waspada'
        : 'Aman';

    return {
      'No': idx + 1,
      'Pemilik / Profil': profile,
      'Kategori Pengeluaran': catName,
      'Batas Anggaran Bulanan (Rp)': b.monthlyLimit,
      'Realisasi Pengeluaran (Rp)': spent,
      'Sisa Anggaran (Rp)': remaining,
      'Persentase Terpakai': `${percentage}%`,
      'Status': status,
    };
  });

  const wsBudgets = XLSX.utils.json_to_sheet(
    budgetRows.length > 0
      ? budgetRows
      : [
          {
            'No': '-',
            'Pemilik / Profil': '-',
            'Kategori Pengeluaran': 'Belum ada data anggaran',
            'Batas Anggaran Bulanan (Rp)': 0,
            'Realisasi Pengeluaran (Rp)': 0,
            'Sisa Anggaran (Rp)': 0,
            'Persentase Terpakai': '0%',
            'Status': '-',
          },
        ]
  );
  wsBudgets['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 25 },
    { wch: 25 },
    { wch: 24 },
    { wch: 20 },
    { wch: 18 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsBudgets, 'Anggaran Kategori');

  // ----------------------------------------------------
  // SHEET 4: TABUNGAN & CELENGAN TARGET
  // ----------------------------------------------------
  const savingsRows = filteredSavings.map((s, idx) => {
    const progress =
      s.targetAmount > 0
        ? Math.min(100, Math.round((s.currentAmount / s.targetAmount) * 100))
        : 0;
    const sisa = Math.max(0, s.targetAmount - s.currentAmount);

    return {
      'No': idx + 1,
      'Pemilik / Profil': getProfileName(s.profileId),
      'Nama Target Tabungan': s.title,
      'Kategori': s.category,
      'Target Dana (Rp)': s.targetAmount,
      'Terkumpul Saat Ini (Rp)': s.currentAmount,
      'Sisa Kekurangan (Rp)': sisa,
      'Progres (%)': `${progress}%`,
      'Target Tanggal': s.targetDate || '-',
      'Catatan': s.notes || '-',
    };
  });

  const wsSavings = XLSX.utils.json_to_sheet(
    savingsRows.length > 0
      ? savingsRows
      : [
          {
            'No': '-',
            'Pemilik / Profil': '-',
            'Nama Target Tabungan': 'Belum ada target tabungan',
            'Kategori': '-',
            'Target Dana (Rp)': 0,
            'Terkumpul Saat Ini (Rp)': 0,
            'Sisa Kekurangan (Rp)': 0,
            'Progres (%)': '0%',
            'Target Tanggal': '-',
            'Catatan': '-',
          },
        ]
  );
  wsSavings['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 26 },
    { wch: 16 },
    { wch: 20 },
    { wch: 22 },
    { wch: 20 },
    { wch: 14 },
    { wch: 16 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSavings, 'Tabungan & Celengan');

  // ----------------------------------------------------
  // SHEET 5: RIWAYAT SETORAN TABUNGAN
  // ----------------------------------------------------
  const savingsHistoryRows: any[] = [];
  filteredSavings.forEach((s) => {
    if (s.history && s.history.length > 0) {
      s.history.forEach((h) => {
        savingsHistoryRows.push({
          'Tanggal': h.date,
          'Pemilik / Profil': getProfileName(s.profileId),
          'Nama Tabungan': s.title,
          'Jenis Mutasi': h.type === 'deposit' ? 'Setoran (+)' : 'Penarikan (-)',
          'Nominal (Rp)': h.amount,
          'Catatan': h.note || '-',
        });
      });
    }
  });

  // Sort newest first
  savingsHistoryRows.sort((a, b) => b.Tanggal.localeCompare(a.Tanggal));
  const wsSavingsHistory = XLSX.utils.json_to_sheet(
    savingsHistoryRows.length > 0
      ? savingsHistoryRows.map((r, i) => ({ No: i + 1, ...r }))
      : [
          {
            'No': '-',
            'Tanggal': '-',
            'Pemilik / Profil': '-',
            'Nama Tabungan': 'Belum ada mutasi tabungan',
            'Jenis Mutasi': '-',
            'Nominal (Rp)': 0,
            'Catatan': '-',
          },
        ]
  );
  wsSavingsHistory['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 20 },
    { wch: 25 },
    { wch: 16 },
    { wch: 18 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSavingsHistory, 'Riwayat Setor Tabungan');

  // ----------------------------------------------------
  // SHEET 6: CATATAN HUTANG & CICILAN
  // ----------------------------------------------------
  const debtRows = filteredDebts.map((d, idx) => {
    const paid = d.totalAmount - d.remainingAmount;
    const statusLabel =
      d.status === 'paid'
        ? 'LUNAS'
        : d.status === 'partial'
        ? 'Sebagian Dicicil'
        : 'Belum Dibayar';

    return {
      'No': idx + 1,
      'Pemilik / Profil': getProfileName(d.profileId),
      'Judul Hutang': d.title,
      'Pemberi Pinjaman / Kreditor': d.creditor,
      'Total Hutang Awal (Rp)': d.totalAmount,
      'Sudah Dibayar (Rp)': paid,
      'Sisa Hutang (Rp)': d.remainingAmount,
      'Status': statusLabel,
      'Jatuh Tempo': d.dueDate || '-',
      'Asal Defisit': d.isFromMonthlyDeficit ? `Defisit Bulan ${d.deficitMonth}` : 'Hutang Biasa',
      'Catatan': d.notes || '-',
    };
  });

  const wsDebts = XLSX.utils.json_to_sheet(
    debtRows.length > 0
      ? debtRows
      : [
          {
            'No': '-',
            'Pemilik / Profil': '-',
            'Judul Hutang': 'Tidak ada data hutang',
            'Pemberi Pinjaman / Kreditor': '-',
            'Total Hutang Awal (Rp)': 0,
            'Sudah Dibayar (Rp)': 0,
            'Sisa Hutang (Rp)': 0,
            'Status': '-',
            'Jatuh Tempo': '-',
            'Asal Defisit': '-',
            'Catatan': '-',
          },
        ]
  );
  wsDebts['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 28 },
    { wch: 25 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
    { wch: 14 },
    { wch: 18 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDebts, 'Catatan Hutang');

  // ----------------------------------------------------
  // SHEET 7: RIWAYAT PEMBAYARAN HUTANG
  // ----------------------------------------------------
  const debtPaymentRows: any[] = [];
  filteredDebts.forEach((d) => {
    if (d.history && d.history.length > 0) {
      d.history.forEach((h) => {
        debtPaymentRows.push({
          'Tanggal Bayar': h.date,
          'Pemilik / Profil': getProfileName(d.profileId),
          'Nama Hutang': d.title,
          'Nominal Bayar (Rp)': h.amount,
          'Metode Pembayaran': getPaymentMethodLabel(h.paymentMethod),
          'Catatan': h.notes || '-',
        });
      });
    }
  });

  debtPaymentRows.sort((a, b) => b['Tanggal Bayar'].localeCompare(a['Tanggal Bayar']));
  const wsDebtPayments = XLSX.utils.json_to_sheet(
    debtPaymentRows.length > 0
      ? debtPaymentRows.map((r, i) => ({ No: i + 1, ...r }))
      : [
          {
            'No': '-',
            'Tanggal Bayar': '-',
            'Pemilik / Profil': '-',
            'Nama Hutang': 'Belum ada riwayat pembayaran hutang',
            'Nominal Bayar (Rp)': 0,
            'Metode Pembayaran': '-',
            'Catatan': '-',
          },
        ]
  );
  wsDebtPayments['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 20 },
    { wch: 25 },
    { wch: 20 },
    { wch: 22 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDebtPayments, 'Riwayat Bayar Hutang');

  // ----------------------------------------------------
  // SHEET 8: TAGIHAN RUTIN BULANAN
  // ----------------------------------------------------
  const billRows = filteredBills.map((b, idx) => {
    const isPaidThisMonth = b.paidMonths && b.paidMonths.includes(selectedMonth);
    return {
      'No': idx + 1,
      'Pemilik / Profil': getProfileName(b.profileId),
      'Nama Tagihan': b.title,
      'Nominal (Rp)': b.amount,
      'Jatuh Tempo': `Tiap tanggal ${b.dueDay}`,
      'Kategori': getCategoryName(b.categoryId),
      'Metode Pembayaran': getPaymentMethodLabel(b.paymentMethod),
      [`Status Bulan (${selectedMonth})`]: isPaidThisMonth ? 'Sudah Dibayar' : 'Belum Dibayar',
      'Terakhir Dibayar': b.lastPaidDate || '-',
    };
  });

  const wsBills = XLSX.utils.json_to_sheet(
    billRows.length > 0
      ? billRows
      : [
          {
            'No': '-',
            'Pemilik / Profil': '-',
            'Nama Tagihan': 'Belum ada tagihan rutin',
            'Nominal (Rp)': 0,
            'Jatuh Tempo': '-',
            'Kategori': '-',
            'Metode Pembayaran': '-',
            'Status': '-',
            'Terakhir Dibayar': '-',
          },
        ]
  );
  wsBills['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 25 },
    { wch: 18 },
    { wch: 16 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsBills, 'Tagihan Rutin');

  // Generate filename
  const profileSlug =
    profileFilter === 'all'
      ? 'Gabungan'
      : (profiles[profileFilter]?.name || profileFilter).replace(/[^a-zA-Z0-9]/g, '_');
  const periodSlug = periodFilter === 'all' ? 'SemuaPeriode' : selectedMonth;
  const fileName = `Laporan_Keuangan_${profileSlug}_${periodSlug}.xlsx`;

  // Write file to download
  XLSX.writeFile(wb, fileName);
}
