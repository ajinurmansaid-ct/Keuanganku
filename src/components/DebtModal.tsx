import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Calendar,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  FileText,
  User,
  DollarSign,
  TrendingDown
} from 'lucide-react';
import { DebtItem, PaymentMethod, UserProfile, UserProfileId } from '../types';
import { PAYMENT_METHODS } from '../data/categories';
import { DEBT_PRESETS, DebtPreset } from '../data/sampleDebts';
import { formatRupiah, getMonthNameIndonesian, getTodayDateString } from '../utils/formatters';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    debtData: Omit<DebtItem, 'id' | 'createdAt' | 'history' | 'status' | 'remainingAmount'> & {
      initialRemainingAmount?: number;
      profileId?: UserProfileId;
    },
    editingId?: string
  ) => void;
  initialData?: DebtItem | null;
  suggestedDeficit?: {
    monthKey: string;
    amount: number;
  } | null;
  profiles?: UserProfile[];
  activeProfileId?: UserProfileId;
}

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  suggestedDeficit,
  profiles = [],
  activeProfileId = 'user_1',
}) => {
  const [title, setTitle] = useState('');
  const [creditor, setCreditor] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isFromMonthlyDeficit, setIsFromMonthlyDeficit] = useState(false);
  const [deficitMonth, setDeficitMonth] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<UserProfileId>(activeProfileId);

  const profile1 = profiles.find((p) => p.id === 'user_1');
  const profile2 = profiles.find((p) => p.id === 'user_2');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCreditor(initialData.creditor);
      setTotalAmount(initialData.totalAmount.toString());
      setDueDate(initialData.dueDate || '');
      setIsFromMonthlyDeficit(initialData.isFromMonthlyDeficit ?? false);
      setDeficitMonth(initialData.deficitMonth || '');
      setPaymentMethod(initialData.paymentMethod || 'bank');
      setNotes(initialData.notes || '');
      setProfileId(initialData.profileId || activeProfileId);
      setErrorMsg(null);
    } else if (suggestedDeficit) {
      // Auto pre-fill if triggered from smart deficit detection
      const monthLabel = getMonthNameIndonesian(suggestedDeficit.monthKey);
      setTitle(`Talangan Minus Keuangan ${monthLabel}`);
      setCreditor(`Defisit Bulan Lalu (${monthLabel})`);
      setTotalAmount(suggestedDeficit.amount.toString());
      setIsFromMonthlyDeficit(true);
      setDeficitMonth(suggestedDeficit.monthKey);
      setPaymentMethod('bank');
      setNotes(`Menutup defisit minus pengeluaran bulan ${monthLabel}`);
      setProfileId(activeProfileId);
      
      // Default due date: end of current month
      const today = getTodayDateString();
      setDueDate(today);
      setErrorMsg(null);
    } else {
      setTitle('');
      setCreditor('');
      setTotalAmount('');
      setDueDate('');
      setIsFromMonthlyDeficit(false);
      setDeficitMonth('');
      setPaymentMethod('bank');
      setNotes('');
      setProfileId(activeProfileId);
      setErrorMsg(null);
    }
  }, [initialData, suggestedDeficit, isOpen, activeProfileId]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: DebtPreset) => {
    setTitle(preset.title);
    setCreditor(preset.creditor);
    setTotalAmount(preset.defaultAmount.toString());
    setIsFromMonthlyDeficit(preset.isFromMonthlyDeficit);
    setNotes(preset.notes);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(totalAmount);
    if (!title.trim()) {
      setErrorMsg('Nama atau judul hutang tidak boleh kosong.');
      return;
    }

    if (!creditor.trim()) {
      setErrorMsg('Pemberi pinjaman / asal dana tidak boleh kosong.');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Masukkan nominal pokok hutang yang valid (lebih dari 0).');
      return;
    }

    onSave(
      {
        title: title.trim(),
        creditor: creditor.trim(),
        totalAmount: numAmount,
        dueDate: dueDate || undefined,
        isFromMonthlyDeficit,
        deficitMonth: isFromMonthlyDeficit ? deficitMonth : undefined,
        paymentMethod,
        notes: notes.trim(),
        profileId,
      },
      initialData ? initialData.id : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? 'Edit Data Hutang' : 'Tambah Kewajiban / Hutang'}
              </h3>
              <p className="text-xs text-slate-500">
                Catat hutang, pinjaman, atau talangan minus dari bulan sebelumnya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Pemilik Hutang */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kewajiban / Hutang Milik:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProfileId('user_1')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  profileId === 'user_1'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="truncate">{profile1?.name || 'Orang 1'}</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileId('user_2')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  profileId === 'user_2'
                    ? 'bg-violet-50 text-violet-800 border-violet-500 ring-2 ring-violet-500/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                <span className="truncate">{profile2?.name || 'Orang 2'}</span>
              </button>
            </div>
          </div>

          {/* Quick Presets (Only when adding new and not from suggested deficit) */}
          {!initialData && !suggestedDeficit && (
            <div className="space-y-1.5 pb-2 border-b border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Pilih Template Cepat:
                </span>
                <span className="text-[10px] text-slate-400">Klik untuk isi otomatis</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100">
                {DEBT_PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 text-[11px] font-medium text-slate-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <span>{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Deficit Badge Prompt if suggested */}
          {suggestedDeficit && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
              <TrendingDown className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  Otomatis terisi dari defisit bulan {getMonthNameIndonesian(suggestedDeficit.monthKey)}
                </span>
                <span className="text-rose-700 text-[11px]">
                  Nominal defisit sebesar {formatRupiah(suggestedDeficit.amount)} akan dicatat sebagai kewajiban hutang yang harus dilunasi.
                </span>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Hutang / Keterangan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Talangan Defisit Juli 2026, Pinjam Teman Dimas, Paylater"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition text-slate-900 font-medium"
            />
          </div>

          {/* Creditor / Asal Dana */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pemberi Pinjaman / Sumber Dana <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                value={creditor}
                onChange={(e) => setCreditor(e.target.value)}
                placeholder="Contoh: Defisit Bulan Lalu, Teman Dimas, SPaylater, Bank Mandiri"
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Pokok Hutang (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-3.5 py-2 text-base font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition text-slate-900"
              />
            </div>
            {parseFloat(totalAmount) > 0 && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                {formatRupiah(parseFloat(totalAmount))}
              </p>
            )}
          </div>

          {/* Due Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Target Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Target Tanggal Lunas</span>
                <span className="text-[10px] text-slate-400">Opsional</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Metode Pembayaran Default
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

          {/* Deficit Toggle */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Merupakan Talangan Defisit / Minus Bulan Sebelumnya?
                </p>
                <p className="text-[11px] text-slate-500">
                  Tandai jika hutang ini timbul akibat pengeluaran membengkak di bulan lampau.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isFromMonthlyDeficit}
                onChange={(e) => setIsFromMonthlyDeficit(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer ml-2"
              />
            </label>

            {isFromMonthlyDeficit && (
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium shrink-0">Bulan Defisit:</span>
                <input
                  type="month"
                  value={deficitMonth}
                  onChange={(e) => setDeficitMonth(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: No Rekening tujuan, janji bayar saat gajian"
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition text-slate-900"
            />
          </div>

          {/* Footer Actions */}
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
              <span>{initialData ? 'Simpan Perubahan' : 'Tambah Hutang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
