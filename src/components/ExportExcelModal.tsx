import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  Wallet,
  Receipt,
  PiggyBank,
  CreditCard,
  Layers,
  ArrowDownToLine,
} from 'lucide-react';
import {
  Transaction,
  CategoryBudget,
  SavingsGoal,
  RecurringBill,
  DebtItem,
  UserProfile,
} from '../types';
import { exportFinancialDataToExcel } from '../utils/excelExporter';
import { getMonthNameIndonesian, formatRupiah } from '../utils/formatters';

interface ExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string;
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

export const ExportExcelModal: React.FC<ExportExcelModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  profiles,
  transactions,
  budgets,
  savingsGoals,
  recurringBills,
  debts,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'selected-month' | 'all'>('selected-month');
  const [profileFilter, setProfileFilter] = useState<'all' | 'user_1' | 'user_2'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  // Filtered counts for preview
  const relevantTxs = transactions.filter((t) => {
    const matchMonth = periodFilter === 'all' || t.date.startsWith(selectedMonth);
    const matchProf = profileFilter === 'all' || (t.profileId || 'user_1') === profileFilter;
    return matchMonth && matchProf;
  });

  const totalIncome = relevantTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = relevantTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const handleDownload = () => {
    setIsExporting(true);
    try {
      exportFinancialDataToExcel({
        periodFilter,
        selectedMonth,
        profileFilter,
        profiles,
        transactions,
        budgets,
        savingsGoals,
        recurringBills,
        debts,
      });
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3500);
    } catch (err) {
      console.error('Failed to export Excel:', err);
      alert('Gagal mengekspor data ke Excel. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Unduh Data Keuangan (Excel)
              </h3>
              <p className="text-xs text-emerald-800 font-medium">
                Format Microsoft Excel (.xlsx) Lengkap & Rapi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/80 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Quick Balance Preview Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Estimasi Saldo yang Diekspor
              </span>
              <p className={`text-base font-bold ${netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatRupiah(netBalance)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Transaksi
              </span>
              <p className="text-sm font-bold text-slate-800">
                {relevantTxs.length} Transaksi
              </p>
            </div>
          </div>

          {/* Option: Periode Data */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>1. Pilih Periode Data:</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPeriodFilter('selected-month')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  periodFilter === 'selected-month'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Bulan Ini Saja
                  </span>
                  {periodFilter === 'selected-month' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {getMonthNameIndonesian(selectedMonth)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPeriodFilter('all')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  periodFilter === 'all'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Semua Periode
                  </span>
                  {periodFilter === 'all' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500">
                  Seluruh riwayat transaksi
                </span>
              </button>
            </div>
          </div>

          {/* Option: Pemilik / Profil */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>2. Pilih Profil / Pemilik Data:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProfileFilter('all')}
                className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-xs font-semibold ${
                  profileFilter === 'all'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Semua / Gabungan
              </button>
              <button
                type="button"
                onClick={() => setProfileFilter('user_1')}
                className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-xs font-semibold truncate ${
                  profileFilter === 'user_1'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {profiles.user_1.name}
              </button>
              <button
                type="button"
                onClick={() => setProfileFilter('user_2')}
                className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-xs font-semibold truncate ${
                  profileFilter === 'user_2'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {profiles.user_2.name}
              </button>
            </div>
          </div>

          {/* Sheets Preview Info */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Lembar Kerja (Worksheet) yang Disertakan:</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Ringkasan Saldo & Arus Kas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Daftar Transaksi Detail</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Anggaran Kategori Bulanan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Tabungan & Celengan Target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Riwayat Setor Tabungan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Catatan Hutang & Cicilan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Riwayat Bayar Hutang</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Tagihan Rutin Bulanan</span>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {downloadSuccess && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-semibold">
                File Excel berhasil diunduh ke perangkat Anda!
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>{isExporting ? 'Membuat File Excel...' : 'Unduh File Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
