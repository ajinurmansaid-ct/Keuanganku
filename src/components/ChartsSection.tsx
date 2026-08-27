import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  LineChart as LineIcon,
  BarChart3,
  Target,
  Info,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import {
  formatRupiah,
  formatCompactRupiah,
  getCategoryExpenseBreakdown,
  getDailyExpenseTimeline,
  getMonthlyComparisonData,
  getBudgetProgressList,
  getMonthNameIndonesian
} from '../utils/formatters';
import { Transaction, CategoryBudget } from '../types';

interface ChartsSectionProps {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  selectedMonth: string;
  onOpenBudgetModal: () => void;
  onOpenAIModal: () => void;
}

type ChartTab = 'category' | 'daily' | 'monthly' | 'budget';

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  transactions,
  budgets,
  selectedMonth,
  onOpenBudgetModal,
  onOpenAIModal,
}) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('category');

  // Compute dataset views
  const categoryBreakdown = getCategoryExpenseBreakdown(transactions, selectedMonth);
  const dailyTimeline = getDailyExpenseTimeline(transactions, selectedMonth);
  const monthlyHistory = getMonthlyComparisonData(transactions, 6);
  const budgetProgress = getBudgetProgressList(transactions, budgets, selectedMonth);

  const totalMonthExpense = categoryBreakdown.reduce((sum, item) => sum + item.amount, 0);

  // Peak spending day computation
  const peakDay = dailyTimeline.reduce(
    (max, day) => (day.expense > max.expense ? day : max),
    { formattedDate: '-', expense: 0 }
  );

  // Custom Recharts Tooltip for Category Donut
  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-lg border border-slate-700">
          <p className="font-bold">{data.categoryName}</p>
          <p className="text-emerald-400 font-medium">{formatRupiah(data.amount)}</p>
          <p className="text-slate-400 mt-0.5">{data.percentage}% dari total pengeluaran</p>
        </div>
      );
    }
    return null;
  };

  // Custom Recharts Tooltip for Daily Timeline
  const CustomDailyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-lg border border-slate-700 space-y-1">
          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{data.formattedDate}</p>
          {data.expense > 0 && (
            <p className="text-rose-400">Pengeluaran: {formatRupiah(data.expense)}</p>
          )}
          {data.income > 0 && (
            <p className="text-emerald-400">Pemasukan: {formatRupiah(data.income)}</p>
          )}
          <p className="text-indigo-300 font-medium pt-1">
            Akumulasi: {formatRupiah(data.cumulativeExpense)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Recharts Tooltip for Monthly History
  const CustomMonthlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-lg border border-slate-700 space-y-1">
          <p className="font-bold border-b border-slate-800 pb-1">{label}</p>
          <p className="text-emerald-400">Pemasukan: {formatRupiah(data.pemasukan)}</p>
          <p className="text-rose-400">Pengeluaran: {formatRupiah(data.pengeluaran)}</p>
          <p className="text-sky-300 font-semibold pt-1 border-t border-slate-800">
            Selisih: {formatRupiah(data.net)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 md:p-6 mb-6">
      {/* Header & View Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Grafik Pengeluaran Bulanan
            </h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded-full border border-indigo-100">
              {getMonthNameIndonesian(selectedMonth)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualisasi distribusi dana, tren harian, dan evaluasi anggaran
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs sm:text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'category'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-4 h-4 text-amber-500" />
            <span>Kategori</span>
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'daily'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <LineIcon className="w-4 h-4 text-emerald-500" />
            <span>Tren Harian</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'monthly'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span>Riwayat 6 Bulan</span>
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'budget'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4 text-indigo-500" />
            <span>Target Anggaran</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Container */}
      <div className="min-h-[320px] flex flex-col justify-center">
        {/* TAB 1: CATEGORY DONUT CHART */}
        {activeTab === 'category' && (
          <div>
            {categoryBreakdown.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <PieIcon className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
                <p className="text-sm font-medium">
                  Belum ada pengeluaran dicatat untuk bulan ini.
                </p>
                <p className="text-xs">Klik "Catat Transaksi" untuk memasukkan data baru.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Donut Chart */}
                <div className="lg:col-span-7 h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={3}
                        dataKey="amount"
                        nameKey="categoryName"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomCategoryTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category List Breakdown Badges */}
                <div className="lg:col-span-5 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Rincian Kategori ({categoryBreakdown.length})
                  </div>
                  {categoryBreakdown.map((item) => (
                    <div
                      key={item.categoryId}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <span className="font-semibold text-slate-800">
                          {item.categoryName}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatRupiah(item.amount)}</p>
                        <p className="text-[11px] text-slate-400">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DAILY TIMELINE AREA CHART */}
        {activeTab === 'daily' && (
          <div className="h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => formatCompactRupiah(val)}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomDailyTooltip />} />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Pengeluaran Harian"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeExpense"
                  name="Akumulasi Bulanan"
                  stroke="#6366F1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorCumulative)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* TAB 3: MONTHLY HISTORY BAR CHART */}
        {activeTab === 'monthly' && (
          <div className="h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="monthName"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => formatCompactRupiah(val)}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomMonthlyTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={36}
                  formatter={(value) => <span className="text-xs font-medium text-slate-700">{value}</span>}
                />
                <Bar
                  dataKey="pemasukan"
                  name="Pemasukan"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="pengeluaran"
                  name="Pengeluaran"
                  fill="#F43F5E"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* TAB 4: BUDGET VS ACTUAL PROGRESS CHART */}
        {activeTab === 'budget' && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Evaluasi Realisasi vs Batas Anggaran Kategori
              </span>
              <button
                onClick={onOpenBudgetModal}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
              >
                Atur Anggaran
              </button>
            </div>

            {budgetProgress.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Target className="w-10 h-10 mx-auto stroke-1 text-slate-300 mb-2" />
                <p className="text-sm">Belum ada batas anggaran yang diatur.</p>
                <button
                  onClick={onOpenBudgetModal}
                  className="mt-2 text-xs text-indigo-600 font-semibold hover:underline"
                >
                  + Atur Batas Anggaran Kategori
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {budgetProgress.map((bp) => (
                  <div
                    key={bp.categoryId}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 font-bold text-slate-800">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: bp.color }}
                        ></span>
                        <span>{bp.categoryName}</span>
                      </div>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                          bp.status === 'danger'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : bp.status === 'warning'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {bp.status === 'danger'
                          ? 'Melebihi Limit'
                          : bp.status === 'warning'
                          ? 'Hampir Habis'
                          : 'Aman'}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline text-xs text-slate-600">
                      <span>Terpakai: <strong className="text-slate-900">{formatRupiah(bp.spent)}</strong></span>
                      <span>Limit: <strong className="text-slate-700">{formatRupiah(bp.limit)}</strong></span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          bp.status === 'danger'
                            ? 'bg-rose-500'
                            : bp.status === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, bp.percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Informative Highlights Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50 rounded-xl p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
            1
          </div>
          <div>
            <span className="block text-slate-400 font-medium">Kategori Terbesar</span>
            <strong className="text-slate-800 font-semibold">
              {categoryBreakdown[0]
                ? `${categoryBreakdown[0].categoryName} (${categoryBreakdown[0].percentage}%)`
                : '-'}
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-slate-400 font-medium">Pengeluaran Harian Tertinggi</span>
            <strong className="text-slate-800 font-semibold">
              {peakDay.expense > 0
                ? `${peakDay.formattedDate} (${formatRupiah(peakDay.expense)})`
                : '-'}
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <span className="block text-slate-400 font-medium">Analisis AI</span>
              <strong className="text-slate-800 font-semibold">Dapatkan Saran Keuangan</strong>
            </div>
            <button
              onClick={onOpenAIModal}
              className="text-xs bg-indigo-600 text-white font-medium px-2 py-1 rounded-md hover:bg-indigo-700 transition"
            >
              Cek AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
