import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  CheckCircle2,
  Calendar,
  Wallet,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { SavingsGoal, PaymentMethod } from '../types';
import { formatRupiah, getTodayDateString } from '../utils/formatters';
import { PAYMENT_METHODS } from '../data/categories';

interface SavingsDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  defaultType?: 'deposit' | 'withdraw';
  onAddTransactionAndLog: (params: {
    goalId: string;
    type: 'deposit' | 'withdraw';
    amount: number;
    date: string;
    note?: string;
    syncWithCashflow: boolean;
    paymentMethod: PaymentMethod;
  }) => void;
}

export const SavingsDepositModal: React.FC<SavingsDepositModalProps> = ({
  isOpen,
  onClose,
  goal,
  defaultType = 'deposit',
  onAddTransactionAndLog,
}) => {
  const [type, setType] = useState<'deposit' | 'withdraw'>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [note, setNote] = useState<string>('');
  const [syncWithCashflow, setSyncWithCashflow] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setAmount('');
      setDate(getTodayDateString());
      setNote('');
      setSyncWithCashflow(true);
      setPaymentMethod('bank');
      setErrorMsg(null);
    }
  }, [isOpen, defaultType]);

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const numAmount = parseFloat(amount) || 0;

    if (numAmount <= 0) {
      setErrorMsg('Mohon masukkan nominal uang yang valid (lebih dari 0).');
      return;
    }

    if (type === 'withdraw' && numAmount > goal.currentAmount) {
      setErrorMsg(`Nominal penarikan (${formatRupiah(numAmount)}) melebihi saldo tabungan yang ada (${formatRupiah(goal.currentAmount)}).`);
      return;
    }

    onAddTransactionAndLog({
      goalId: goal.id,
      type,
      amount: numAmount,
      date,
      note: note.trim() || undefined,
      syncWithCashflow,
      paymentMethod,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            type === 'deposit'
              ? 'border-emerald-100 bg-emerald-50/70'
              : 'border-amber-100 bg-amber-50/70'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                type === 'deposit'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {type === 'deposit' ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {type === 'deposit' ? 'Setor Tabungan' : 'Tarik Saldo Tabungan'}
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[220px]">
                {goal.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Goal Status Banner */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 font-medium">Saldo Saat Ini:</span>
            <p className="font-bold text-slate-900">{formatRupiah(goal.currentAmount)}</p>
          </div>
          <div className="text-right">
            <span className="text-slate-400 font-medium">Target Total:</span>
            <p className="font-bold text-emerald-700">{formatRupiah(goal.targetAmount)}</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Toggle Type: Setor / Tarik */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                type === 'deposit'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              + Setor (Nabung)
            </button>
            <button
              type="button"
              onClick={() => setType('withdraw')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                type === 'withdraw'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              - Tarik Dana
            </button>
          </div>

          {/* Input Nominal */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nominal {type === 'deposit' ? 'Setoran' : 'Penarikan'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">Rp</span>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Masukkan nominal bebas"
                className="w-full pl-10 pr-3.5 py-2 text-base font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-slate-900"
              />
            </div>
            {parseFloat(amount) > 0 && (
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {formatRupiah(parseFloat(amount))}
              </p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {[100000, 250000, 500000, 1000000, 2000000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAmount(val)}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                +{val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`}
              </button>
            ))}
            {type === 'deposit' && remaining > 0 && (
              <button
                type="button"
                onClick={() => handleQuickAmount(remaining)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
              >
                Lunasi Sisa ({formatRupiah(remaining)})
              </button>
            )}
          </div>

          {/* Tanggal & Rekening */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-slate-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-slate-700 font-medium"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Catatan / Keterangan (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                type === 'deposit'
                  ? 'Contoh: Alokasi gaji bulanan, bonus freelance'
                  : 'Contoh: Terpakai untuk DP sewa tempat, kebutuhan mendesak'
              }
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-slate-800"
            />
          </div>

          {/* Automatic Cashflow Sync Switch */}
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={syncWithCashflow}
                onChange={(e) => setSyncWithCashflow(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-indigo-950">
                Catat otomatis ke Buku Kas Transaksi
              </span>
            </label>
            <p className="text-[11px] text-indigo-800/80 pl-6">
              {type === 'deposit'
                ? 'Akan mencatat pengeluaran pos "Tabungan & Cicilan" pada buku kas agar saldo buku kas tetap akurat.'
                : 'Akan mencatat pemasukan pos "Pemasukan Lainnya / Hadiah" pada buku kas.'}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center gap-1.5 ${
                type === 'deposit'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {type === 'deposit' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {type === 'deposit' ? 'Konfirmasi Setoran' : 'Konfirmasi Penarikan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
