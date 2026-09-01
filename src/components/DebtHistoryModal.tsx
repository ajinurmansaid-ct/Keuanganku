import React from 'react';
import {
  X,
  History,
  Calendar,
  CreditCard,
  Trash2,
  CheckCircle2,
  Receipt,
  ArrowDownRight,
  Coins
} from 'lucide-react';
import { DebtItem } from '../types';
import { formatRupiah, formatFullDateIndonesian } from '../utils/formatters';

interface DebtHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: DebtItem | null;
  onDeleteHistoryItem?: (debtId: string, historyId: string) => void;
  onDeleteLog?: (debtId: string, historyId: string) => void;
  onOpenPayment?: (debt: DebtItem) => void;
}

export const DebtHistoryModal: React.FC<DebtHistoryModalProps> = ({
  isOpen,
  onClose,
  debt,
  onDeleteHistoryItem,
  onDeleteLog,
  onOpenPayment,
}) => {
  if (!isOpen || !debt) return null;

  const handleDeleteItem = onDeleteHistoryItem || onDeleteLog;
  const totalPaid = debt.totalAmount - debt.remainingAmount;
  const percentage = Math.round((totalPaid / debt.totalAmount) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Riwayat Pembayaran Hutang</h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">{debt.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Box */}
        <div className="p-6 pb-3 border-b border-slate-100 bg-gradient-to-br from-rose-50/40 to-slate-50">
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Total Pokok</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900">{formatRupiah(debt.totalAmount)}</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-[10px] text-emerald-600 font-semibold uppercase block">Sudah Dibayar</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-600">{formatRupiah(totalPaid)}</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-[10px] text-rose-600 font-semibold uppercase block">Sisa Hutang</span>
              <span className="text-xs sm:text-sm font-bold text-rose-600">{formatRupiah(debt.remainingAmount)}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Progres Pelunasan</span>
              <span className="text-rose-600 font-bold">{percentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Daftar Pembayaran / Cicilan ({debt.history.length})</span>
            {debt.status === 'paid' && (
              <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
              </span>
            )}
          </h4>

          {debt.history.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-medium text-slate-500">Belum ada riwayat pembayaran</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Klik tombol "Bayar / Cicil" untuk mulai mencatat pelunasan hutang ini.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {debt.history.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition flex items-center justify-between group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <ArrowDownRight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">
                          {formatRupiah(log.amount)}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                          {log.paymentMethod.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatFullDateIndonesian(log.date)}</span>
                      </p>
                      {log.notes && (
                        <p className="text-[11px] text-slate-600 italic mt-0.5">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Hapus catatan pembayaran ini? Sisa hutang akan bertambah kembali.')) {
                        if (handleDeleteItem) {
                          handleDeleteItem(debt.id, log.id);
                        }
                      }
                    }}
                    className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Hapus riwayat pembayaran"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            {debt.status !== 'paid' && onOpenPayment && (
              <button
                type="button"
                onClick={() => onOpenPayment(debt)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Bayar / Cicil Sekarang</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
