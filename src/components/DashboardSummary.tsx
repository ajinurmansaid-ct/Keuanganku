import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatRupiah, getMonthNameIndonesian } from '../utils/formatters';
import { FinancialSummary } from '../types';

interface DashboardSummaryProps {
  summary: FinancialSummary;
  selectedMonth: string;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  summary,
  selectedMonth,
}) => {
  const isPositiveBalance = summary.balance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Saldo Bersih / Net Balance */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Saldo Net ({getMonthNameIndonesian(selectedMonth).split(' ')[0]})
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isPositiveBalance
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}
          >
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {formatRupiah(summary.balance)}
        </div>

        <div className="mt-3 flex items-center text-xs text-slate-500">
          {isPositiveBalance ? (
            <span className="inline-flex items-center font-medium text-emerald-600 mr-1.5 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Surplus
            </span>
          ) : (
            <span className="inline-flex items-center font-medium text-rose-600 mr-1.5 bg-rose-50 px-1.5 py-0.5 rounded-sm">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> Defisit
            </span>
          )}
          <span>{summary.transactionCount} transaksi dicatat</span>
        </div>
      </div>

      {/* Total Pemasukan / Total Income */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Pemasukan
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="text-2xl font-bold text-emerald-700 tracking-tight">
          {formatRupiah(summary.totalIncome)}
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Gaji, usaha, atau pemasukan lainnya
        </p>
      </div>

      {/* Total Pengeluaran / Total Expense */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Pengeluaran
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="text-2xl font-bold text-rose-700 tracking-tight">
          {formatRupiah(summary.totalExpense)}
        </div>

        <div className="mt-3 flex items-center text-xs text-slate-500">
          <CalendarCheck className="w-3.5 h-3.5 text-slate-400 mr-1" />
          <span>Rata-rata: {formatRupiah(summary.dailyAverageExpense)}/hari</span>
        </div>
      </div>

      {/* Rasio Tabungan / Savings Rate */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Rasio Tabungan
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-indigo-900 tracking-tight">
            {summary.savingsRate}%
          </span>
          <span className="text-xs font-medium text-slate-500">dari pemasukan</span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                summary.savingsRate >= 30
                  ? 'bg-emerald-500'
                  : summary.savingsRate >= 15
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, summary.savingsRate))}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {summary.savingsRate >= 20 ? ' Target ideal (>20%) tercapai' : ' Usahakan menyisihkan minimal 20%'}
          </span>
        </div>
      </div>
    </div>
  );
};
