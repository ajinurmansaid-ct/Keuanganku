import { Transaction, CategoryExpenseBreakdown, DailyExpenseData, MonthlyComparisonData, BudgetProgress, CategoryBudget } from '../types';
import { ALL_CATEGORIES } from '../data/categories';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactRupiah(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  }
  return `Rp ${amount}`;
}

export function formatDateIndonesian(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${parseInt(day, 10)} ${months[mIndex]} ${year}`;
}

export function formatFullDateIndonesian(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const monthsFull = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${parseInt(day, 10)} ${monthsFull[mIndex]} ${year}`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMonthYearKey(dateStr: string): string {
  if (!dateStr || dateStr.length < 7) return '';
  return dateStr.substring(0, 7); // "YYYY-MM"
}

export function getMonthNameIndonesian(monthYearKey: string): string {
  if (!monthYearKey || monthYearKey.length < 7) return 'Semua Waktu';
  const [year, month] = monthYearKey.split('-');
  const monthsFull = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${monthsFull[mIndex]} ${year}`;
}

export function getUniqueMonths(transactions: Transaction[]): string[] {
  const monthSet = new Set<string>();
  transactions.forEach((tx) => {
    const key = getMonthYearKey(tx.date);
    if (key) monthSet.add(key);
  });
  const currentMonth = getCurrentMonthKey();
  monthSet.add(currentMonth);
  return Array.from(monthSet).sort((a, b) => b.localeCompare(a)); // newest first
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getCategoryExpenseBreakdown(
  transactions: Transaction[],
  monthYearKey?: string
): CategoryExpenseBreakdown[] {
  let filtered = transactions.filter((t) => t.type === 'expense');
  if (monthYearKey) {
    filtered = filtered.filter((t) => getMonthYearKey(t.date) === monthYearKey);
  }

  const totalExpense = filtered.reduce((acc, curr) => acc + curr.amount, 0);
  if (totalExpense === 0) return [];

  const categoryMap = new Map<string, number>();
  filtered.forEach((tx) => {
    const prev = categoryMap.get(tx.categoryId) || 0;
    categoryMap.set(tx.categoryId, prev + tx.amount);
  });

  const breakdown: CategoryExpenseBreakdown[] = [];
  categoryMap.forEach((amount, catId) => {
    const cat = ALL_CATEGORIES.find((c) => c.id === catId);
    const categoryName = cat ? cat.name : 'Lainnya';
    const icon = cat ? cat.icon : 'MoreHorizontal';
    const color = cat ? cat.color : '#6B7280';
    const bgColor = cat ? cat.bgColor : 'bg-gray-100 text-gray-800';

    const percentage = Math.round((amount / totalExpense) * 1000) / 10;
    breakdown.push({
      categoryId: catId,
      categoryName,
      amount,
      percentage,
      icon,
      color,
      bgColor,
    });
  });

  return breakdown.sort((a, b) => b.amount - a.amount);
}

export function getDailyExpenseTimeline(
  transactions: Transaction[],
  monthYearKey: string
): DailyExpenseData[] {
  if (!monthYearKey) return [];

  const [yearStr, monthStr] = monthYearKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // Get total days in month
  const daysInMonth = new Date(year, month, 0).getDate();

  const dailyMap = new Map<string, { expense: number; income: number }>();
  for (let i = 1; i <= daysInMonth; i++) {
    const dayPadded = String(i).padStart(2, '0');
    const dateKey = `${monthYearKey}-${dayPadded}`;
    dailyMap.set(dateKey, { expense: 0, income: 0 });
  }

  transactions.forEach((tx) => {
    if (getMonthYearKey(tx.date) === monthYearKey) {
      const existing = dailyMap.get(tx.date) || { expense: 0, income: 0 };
      if (tx.type === 'expense') {
        existing.expense += tx.amount;
      } else {
        existing.income += tx.amount;
      }
      dailyMap.set(tx.date, existing);
    }
  });

  const result: DailyExpenseData[] = [];
  let cumulative = 0;

  const monthShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
  ][month - 1];

  dailyMap.forEach((data, dateKey) => {
    const day = parseInt(dateKey.split('-')[2], 10);
    cumulative += data.expense;
    result.push({
      date: dateKey,
      formattedDate: `${day} ${monthShort}`,
      expense: data.expense,
      income: data.income,
      cumulativeExpense: cumulative,
    });
  });

  return result;
}

export function getMonthlyComparisonData(
  transactions: Transaction[],
  monthsLimit: number = 6
): MonthlyComparisonData[] {
  const months = getUniqueMonths(transactions).slice(0, monthsLimit).reverse();

  return months.map((monthKey) => {
    const filtered = transactions.filter((t) => getMonthYearKey(t.date) === monthKey);
    const pemasukan = filtered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const pengeluaran = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const [y, m] = monthKey.split('-');
    const mShort = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
    ][parseInt(m, 10) - 1];

    return {
      monthKey,
      monthName: `${mShort} ${y.substring(2)}`,
      pemasukan,
      pengeluaran,
      net: pemasukan - pengeluaran,
    };
  });
}

export function getBudgetProgressList(
  transactions: Transaction[],
  budgets: CategoryBudget[],
  monthYearKey: string
): BudgetProgress[] {
  const monthTx = transactions.filter(
    (t) => t.type === 'expense' && getMonthYearKey(t.date) === monthYearKey
  );

  return budgets.map((b) => {
    const cat = ALL_CATEGORIES.find((c) => c.id === b.categoryId);
    const spent = monthTx
      .filter((t) => t.categoryId === b.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;

    let status: 'safe' | 'warning' | 'danger' = 'safe';
    if (percentage >= 100) status = 'danger';
    else if (percentage >= 80) status = 'warning';

    return {
      categoryId: b.categoryId,
      categoryName: cat ? cat.name : 'Kategori',
      limit: b.monthlyLimit,
      spent,
      percentage,
      status,
      color: cat ? cat.color : '#3B82F6',
    };
  });
}
