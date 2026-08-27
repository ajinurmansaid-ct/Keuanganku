import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingDown,
  History,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Coins,
  ChevronRight,
  User
} from 'lucide-react';
import { DebtItem, FinancialSummary } from '../types';
import { formatRupiah, formatFullDateIndonesian, getMonthNameIndonesian } from '../utils/formatters';

interface DebtSectionProps {
  debts: DebtItem[];
  selectedMonth: string;
  previousMonthData?: {
    monthKey: string;
    summary: FinancialSummary;
  } | null;
  onOpenAddModal: (suggestedDeficit?: { monthKey: string; amount: number }) => void;
  onOpenEditModal: (debt: DebtItem) => void;
  onOpenPaymentModal: (debt: DebtItem) => void;
  onOpenHistoryModal: (debt: DebtItem) => void;
  onDeleteDebt: (id: string) => void;
}

export const DebtSection: React.FC<DebtSectionProps> = ({
  debts,
  selectedMonth,
  previousMonthData,
  onOpenAddModal,
  onOpenEditModal,
  onOpenPaymentModal,
  onOpenHistoryModal,
  onDeleteDebt,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'unpaid' | 'paid' | 'deficit'>('all');

  // Compute Debt Totals
  const stats = useMemo(() => {
    const totalOriginal = debts.reduce((acc, d) => acc + d.totalAmount, 0);
    const totalRemaining = debts.reduce((acc, d) => acc + d.remainingAmount, 0);
    const totalPaid = totalOriginal - totalRemaining;
    const activeCount = debts.filter((d) => d.status !== 'paid').length;
    const deficitCount = debts.filter((d) => d.isFromMonthlyDeficit).length;
    const paidPercentage = totalOriginal > 0 ? Math.round((totalPaid / totalOriginal) * 100) : 0;

    return {
      totalOriginal,
      totalRemaining,
      totalPaid,
      activeCount,
      deficitCount,
      paidPercentage,
    };
  }, [debts]);

  // Check if previous month was in deficit (minus) and if it has already been registered
  const previousMonthDeficit = useMemo(() => {
    if (!previousMonthData || previousMonthData.summary.balance >= 0) {
      return null;
    }
    const deficitAmount = Math.abs(previousMonthData.summary.balance);
    const monthKey = previousMonthData.monthKey;

    // Check if there is already a debt registered for this deficit month
    const alreadyRegistered = debts.some(
      (d) => d.isFromMonthlyDeficit && d.deficitMonth === monthKey
    );

    if (alreadyRegistered) {
      return null; // Already tracked
    }

    return {
      monthKey,
      amount: deficitAmount,
    };
  }, [previousMonthData, debts]);

  // Filtered debts
  const filteredDebts = useMemo(() => {
    return debts.filter((debt) => {
      if (filterTab === 'unpaid') return debt.status !== 'paid';
      if (filterTab === 'paid') return debt.status === 'paid';
      if (filterTab === 'deficit') return !!debt.isFromMonthlyDeficit;
      return true;
    });
  }, [debts, filterTab]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 mb-6">
      {/* Smart Deficit Alert Banner */}
      {previousMonthDeficit && (
        <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl border border-rose-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-200 text-rose-800 uppercase tracking-wider">
                  Deteksi Defisit Bulan Lalu
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {getMonthNameIndonesian(previousMonthDeficit.monthKey)}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1">
                Bulan lalu Anda mengalami defisit sebesar{' '}
                <strong className="text-rose-700 font-bold">
                  {formatRupiah(previousMonthDeficit.amount)}
                </strong>
                . Catat sekarang sebagai pos hutang/talangan yang harus ditutup bulan ini.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenAddModal(previousMonthDeficit)}
            className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-2xs transition shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Jadikan Pos Hutang</span>
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Kewajiban Hutang & Talangan Minus</span>
                <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-full">
                  {debts.length} Pos
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Catat dan pantau pelunasan hutang pribadi, talangan defisit bulan lampau, dan cicilan
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenAddModal()}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Hutang</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Pokok Hutang</span>
          <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block">
            {formatRupiah(stats.totalOriginal)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Semua pos terdaftar</span>
        </div>

        <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200/70">
          <span className="text-[11px] font-semibold text-rose-700 block">Sisa Belum Lunas</span>
          <span className="text-sm sm:text-base font-bold text-rose-700 mt-0.5 block">
            {formatRupiah(stats.totalRemaining)}
          </span>
          <span className="text-[10px] text-rose-600/80 mt-1 block font-medium">
            {stats.activeCount} hutang belum lunas
          </span>
        </div>

        <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/70">
          <span className="text-[11px] font-semibold text-emerald-700 block">Sudah Dilunasi</span>
          <span className="text-sm sm:text-base font-bold text-emerald-700 mt-0.5 block">
            {formatRupiah(stats.totalPaid)}
          </span>
          <span className="text-[10px] text-emerald-600/80 mt-1 block font-medium">
            {stats.paidPercentage}% terbayar
          </span>
        </div>

        <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200/70">
          <span className="text-[11px] font-semibold text-purple-700 block">Talangan Defisit</span>
          <span className="text-sm sm:text-base font-bold text-purple-800 mt-0.5 block">
            {stats.deficitCount} Pos
          </span>
          <span className="text-[10px] text-purple-600/80 mt-1 block font-medium">
            Minus bulan lampau
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-2 border-b border-slate-100">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            filterTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Semua ({debts.length})
        </button>
        <button
          onClick={() => setFilterTab('unpaid')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            filterTab === 'unpaid'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Belum Lunas ({stats.activeCount})
        </button>
        <button
          onClick={() => setFilterTab('paid')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            filterTab === 'paid'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Sudah Lunas ({debts.length - stats.activeCount})
        </button>
        <button
          onClick={() => setFilterTab('deficit')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            filterTab === 'deficit'
              ? 'bg-purple-700 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Talangan Defisit ({stats.deficitCount})
        </button>
      </div>

      {/* Empty State */}
      {filteredDebts.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Tidak ada data hutang</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {filterTab === 'all'
              ? 'Semua beban keuangan dan talangan Anda bersih! Klik tombol "Tambah Hutang" jika ada pinjaman baru.'
              : 'Tidak ada pos hutang yang sesuai dengan filter ini.'}
          </p>
          {filterTab === 'all' && (
            <button
              onClick={() => onOpenAddModal()}
              className="mt-3 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDebts.map((debt) => {
            const isPaid = debt.status === 'paid';
            const totalPaid = debt.totalAmount - debt.remainingAmount;
            const progress = Math.min(
              100,
              Math.round((totalPaid / debt.totalAmount) * 100)
            );

            return (
              <div
                key={debt.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isPaid
                    ? 'bg-emerald-50/40 border-emerald-200/80'
                    : debt.isFromMonthlyDeficit
                    ? 'bg-white border-purple-200 hover:border-purple-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-rose-200 shadow-xs'
                }`}
              >
                <div>
                  {/* Top Bar: Badges & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Deficit Badge */}
                      {debt.isFromMonthlyDeficit && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 text-purple-800 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          Talangan Defisit {debt.deficitMonth ? getMonthNameIndonesian(debt.deficitMonth) : ''}
                        </span>
                      )}

                      {/* Status Badge */}
                      {isPaid ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Lunas
                        </span>
                      ) : debt.status === 'partial' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Dicicil Sebagian ({progress}%)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-800 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Belum Dibayar
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => onOpenEditModal(debt)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Edit Data Hutang"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus pos hutang "${debt.title}"?`)) {
                            onDeleteDebt(debt.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus Hutang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Creditor */}
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{debt.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Sumber / Pemberi: <strong>{debt.creditor}</strong></span>
                  </p>

                  {/* Progress & Amounts */}
                  <div className="mt-3.5 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">
                          Sisa Hutang
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            isPaid ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {formatRupiah(debt.remainingAmount)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">
                          Total Pokok
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {formatRupiah(debt.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isPaid
                              ? 'bg-emerald-500'
                              : debt.status === 'partial'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Sudah dibayar: {formatRupiah(totalPaid)}</span>
                        <span className="font-bold">{progress}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Due Date & Notes */}
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500">
                    {debt.dueDate ? (
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Target: {formatFullDateIndonesian(debt.dueDate)}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Tanpa target tanggal</span>
                    )}

                    {debt.notes && (
                      <span className="text-slate-500 truncate max-w-[180px] italic">
                        "{debt.notes}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenHistoryModal(debt)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Riwayat ({debt.history.length})</span>
                  </button>

                  {!isPaid ? (
                    <button
                      onClick={() => onOpenPaymentModal(debt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Bayar / Cicil</span>
                    </button>
                  ) : (
                    <span className="text-emerald-700 text-xs font-bold flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Lunas Sempurna
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
