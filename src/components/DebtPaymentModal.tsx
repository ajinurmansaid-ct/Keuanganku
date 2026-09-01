import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DebtItem, PaymentMethod } from '../types';
import { PAYMENT_METHODS } from '../data/categories';
import { formatRupiah, getTodayDateString } from '../utils/formatters';

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: DebtItem | null;
  onMakePayment?: (
    debtId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    date: string,
    notes: string,
    syncWithTransactions: boolean
  ) => void;
  onSavePayment?: (
    debtId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    date: string,
    notes: string,
    syncWithTransactions: boolean
  ) => void;
  selectedMonth?: string;
}

export const DebtPaymentModal: React.FC<DebtPaymentModalProps> = ({
  isOpen,
  onClose,
  debt,
  onMakePayment,
  onSavePayment,
  selectedMonth = getTodayDateString().slice(0, 7),
}) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [syncWithTransactions, setSyncWithTransactions] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePaymentSubmitCallback = onMakePayment || onSavePayment;

  useEffect(() => {
    if (debt) {
      // Default to full remaining amount or empty
      setAmount(debt.remainingAmount.toString());
      setPaymentMethod(debt.paymentMethod || 'bank');
      
      const today = getTodayDateString();
      if (today.startsWith(selectedMonth)) {
        setDate(today);
      } else {
        setDate(`${selectedMonth}-15`);
      }

      setNotes(`Pelunasan hutang: ${debt.title}`);
      setSyncWithTransactions(true);
      setErrorMsg(null);
    }
  }, [debt, isOpen, selectedMonth]);

  if (!isOpen || !debt) return null;

  const handleSetQuickAmount = (val: number) => {
    setAmount(Math.min(val, debt.remainingAmount).toString());
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Masukkan nominal pembayaran yang valid (lebih dari 0).');
      return;
    }

    if (numAmount > debt.remainingAmount) {
      setErrorMsg(
        `Nominal pembayaran melebihi sisa hutang (${formatRupiah(debt.remainingAmount)}).`
      );
      return;
    }

    if (!date) {
      setErrorMsg('Pilih tanggal pembayaran.');
      return;
    }

    if (handlePaymentSubmitCallback) {
      handlePaymentSubmitCallback(
        debt.id,
        numAmount,
        paymentMethod,
        date,
        notes.trim(),
        syncWithTransactions
      );
    }

    onClose();
  };

  const isFullPayment = parseFloat(amount) === debt.remainingAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Bayar / Cicil Hutang</h3>
              <p className="text-xs text-slate-500 truncate max-w-[220px]">{debt.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Debt Status Banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Pemberi Pinjaman / Asal:</span>
              <span className="font-bold text-slate-800">{debt.creditor}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Pokok Hutang:</span>
              <span className="font-semibold text-slate-800">{formatRupiah(debt.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1.5 font-bold">
              <span className="text-rose-700">Sisa Hutang Saat Ini:</span>
              <span className="text-rose-700 text-sm">{formatRupiah(debt.remainingAmount)}</span>
            </div>
          </div>

          {/* Amount to Pay */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nominal yang Dibayarkan (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
              <input
                type="number"
                required
                min="1"
                max={debt.remainingAmount}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-3.5 py-2 text-base font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition text-slate-900"
              />
            </div>

            {/* Quick Amount Options */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => handleSetQuickAmount(debt.remainingAmount)}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold text-rose-700 transition cursor-pointer"
              >
                Bayar Lunas ({formatRupiah(debt.remainingAmount)})
              </button>
              {debt.remainingAmount >= 200000 && (
                <button
                  type="button"
                  onClick={() => handleSetQuickAmount(Math.round(debt.remainingAmount / 2))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 transition cursor-pointer"
                >
                  50% ({formatRupiah(Math.round(debt.remainingAmount / 2))})
                </button>
              )}
              {debt.remainingAmount >= 100000 && (
                <button
                  type="button"
                  onClick={() => handleSetQuickAmount(100000)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 transition cursor-pointer"
                >
                  Rp100.000
                </button>
              )}
            </div>

            {/* Helper text after payment */}
            {parseFloat(amount) > 0 && parseFloat(amount) <= debt.remainingAmount && (
              <p className="text-[11px] font-medium text-slate-500 mt-1.5 flex items-center justify-between">
                <span>Sisa hutang setelah pembayaran ini:</span>
                <span className="font-bold text-slate-800">
                  {formatRupiah(debt.remainingAmount - parseFloat(amount))}
                  {isFullPayment && ' (Lunas 🎉)'}
                </span>
              </p>
            )}
          </div>

          {/* Payment Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Pembayaran <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sumber Dana / Rekening
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition text-slate-900 font-medium"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Pembayaran
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Transfer via BCA / bayar tunai"
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition text-slate-900"
            />
          </div>

          {/* Sync Checkbox */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={syncWithTransactions}
                onChange={(e) => setSyncWithTransactions(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-emerald-900 block">
                  Catat Otomatis ke Transaksi Pengeluaran
                </span>
                <span className="text-[11px] text-emerald-700">
                  Pembayaran ini akan langsung tercatat sebagai transaksi pengeluaran (Kategori: <em>Bayar Hutang & Talangan</em>) di bulan {date.slice(0, 7)}.
                </span>
              </div>
            </label>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isFullPayment ? 'Lunasi Hutang' : 'Catat Cicilan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
