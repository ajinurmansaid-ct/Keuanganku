import React from 'react';
import {
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  ArrowRight,
  Sparkles,
  Scale
} from 'lucide-react';
import { UserProfile, FinancialSummary, ActiveViewMode } from '../types';
import { formatRupiah, getMonthNameIndonesian } from '../utils/formatters';

interface CombinedOverviewSectionProps {
  selectedMonth: string;
  profiles: UserProfile[];
  summary1: FinancialSummary;
  summary2: FinancialSummary;
  combinedSummary: FinancialSummary;
  totalSavings1: number;
  totalSavings2: number;
  totalDebts1: number;
  totalDebts2: number;
  onSwitchProfile: (mode: ActiveViewMode) => void;
}

export const CombinedOverviewSection: React.FC<CombinedOverviewSectionProps> = ({
  selectedMonth,
  profiles,
  summary1,
  summary2,
  combinedSummary,
  totalSavings1,
  totalSavings2,
  totalDebts1,
  totalDebts2,
  onSwitchProfile,
}) => {
  const p1 = profiles.find((p) => p.id === 'user_1') || profiles[0];
  const p2 = profiles.find((p) => p.id === 'user_2') || profiles[1];

  const totalIncomeBoth = summary1.totalIncome + summary2.totalIncome;
  const incomeShare1 =
    totalIncomeBoth > 0 ? Math.round((summary1.totalIncome / totalIncomeBoth) * 100) : 50;
  const incomeShare2 = 100 - incomeShare1;

  const totalExpenseBoth = summary1.totalExpense + summary2.totalExpense;
  const expenseShare1 =
    totalExpenseBoth > 0 ? Math.round((summary1.totalExpense / totalExpenseBoth) * 100) : 50;
  const expenseShare2 = 100 - expenseShare1;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 mb-6">
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-800/40">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                Mode Gabungan 2 Orang
              </span>
              <span className="text-xs text-indigo-300">
                {getMonthNameIndonesian(selectedMonth)}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
              Ringkasan Keuangan Bersama: {p1?.name} & {p2?.name}
            </h2>
          </div>
        </div>

        {/* Combined Net Balance Chip */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/15">
          <p className="text-xs text-indigo-200 uppercase font-semibold tracking-wider">
            Total Saldo Bersih Bersama
          </p>
          <p
            className={`text-2xl font-black mt-0.5 ${
              combinedSummary.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatRupiah(combinedSummary.balance)}
          </p>
        </div>
      </div>

      {/* Side-by-Side Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {/* Person 1 Card */}
        <div className="bg-slate-800/60 rounded-2xl p-5 border border-emerald-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{p1?.name}</h3>
                  <p className="text-xs text-slate-400">{p1?.subtitle || 'Pengguna 1'}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
                {incomeShare1}% Pendapatan
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" /> Pemasukan
                </span>
                <p className="text-sm font-bold text-emerald-400 mt-1">
                  {formatRupiah(summary1.totalIncome)}
                </p>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-rose-400" /> Pengeluaran
                </span>
                <p className="text-sm font-bold text-rose-400 mt-1">
                  {formatRupiah(summary1.totalExpense)}
                </p>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-sky-400" /> Saldo Net
                </span>
                <p
                  className={`text-sm font-bold mt-1 ${
                    summary1.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatRupiah(summary1.balance)}
                </p>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <PiggyBank className="w-3 h-3 text-amber-400" /> Tabungan Aktif
                </span>
                <p className="text-sm font-bold text-amber-300 mt-1">
                  {formatRupiah(totalSavings1)}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSwitchProfile('user_1')}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <span>Buka & Kelola Keuangan {p1?.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Person 2 Card */}
        <div className="bg-slate-800/60 rounded-2xl p-5 border border-violet-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold border border-violet-500/30 text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{p2?.name}</h3>
                  <p className="text-xs text-slate-400">{p2?.subtitle || 'Pengguna 2'}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-md border border-violet-500/30">
                {incomeShare2}% Pendapatan
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" /> Pemasukan
                </span>
                <p className="text-sm font-bold text-emerald-400 mt-1">
                  {formatRupiah(summary2.totalIncome)}
                </p>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-rose-400" /> Pengeluaran
                </span>
                <p className="text-sm font-bold text-rose-400 mt-1">
                  {formatRupiah(summary2.totalExpense)}
                </p>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-sky-400" /> Saldo Net
                </span>
                <p
                  className={`text-sm font-bold mt-1 ${
                    summary2.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatRupiah(summary2.balance)}
                </p>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <PiggyBank className="w-3 h-3 text-amber-400" /> Tabungan Aktif
                </span>
                <p className="text-sm font-bold text-amber-300 mt-1">
                  {formatRupiah(totalSavings2)}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSwitchProfile('user_2')}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <span>Buka & Kelola Keuangan {p2?.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bars: Income & Expense Contribution */}
      <div className="mt-6 pt-5 border-t border-indigo-800/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Income Share Bar */}
        <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/40">
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-emerald-400">
              {p1?.name}: {incomeShare1}%
            </span>
            <span className="text-slate-400">Rasio Pemasukan</span>
            <span className="text-violet-400">
              {p2?.name}: {incomeShare2}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${incomeShare1}%` }}
            ></div>
            <div
              className="bg-violet-500 h-full transition-all duration-500"
              style={{ width: `${incomeShare2}%` }}
            ></div>
          </div>
        </div>

        {/* Expense Share Bar */}
        <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/40">
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-emerald-400">
              {p1?.name}: {expenseShare1}%
            </span>
            <span className="text-slate-400">Rasio Pengeluaran</span>
            <span className="text-violet-400">
              {p2?.name}: {expenseShare2}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${expenseShare1}%` }}
            ></div>
            <div
              className="bg-violet-500 h-full transition-all duration-500"
              style={{ width: `${expenseShare2}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
