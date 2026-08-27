import React, { useState, useEffect } from 'react';
import {
  X,
  Repeat,
  DollarSign,
  Calendar,
  CreditCard,
  Tag,
  FileText,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { RecurringBill, PaymentMethod, UserProfile, UserProfileId } from '../types';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../data/categories';
import { RECURRING_PRESETS, RecurringBillPreset } from '../data/sampleRecurringBills';
import { formatRupiah } from '../utils/formatters';

interface RecurringBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    billData: Omit<RecurringBill, 'id' | 'createdAt' | 'paidMonths'> & { profileId?: UserProfileId },
    editingId?: string
  ) => void;
  initialData?: RecurringBill | null;
  profiles?: UserProfile[];
  activeProfileId?: UserProfileId;
}

export const RecurringBillModal: React.FC<RecurringBillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  profiles = [],
  activeProfileId = 'user_1',
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(EXPENSE_CATEGORIES[2]?.id || 'bills');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [dueDay, setDueDay] = useState<number>(10);
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<UserProfileId>(activeProfileId);

  const profile1 = profiles.find((p) => p.id === 'user_1');
  const profile2 = profiles.find((p) => p.id === 'user_2');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(initialData.amount.toString());
      setCategoryId(initialData.categoryId);
      setPaymentMethod(initialData.paymentMethod);
      setDueDay(initialData.dueDay || 10);
      setNotes(initialData.notes || '');
      setIsActive(initialData.isActive ?? true);
      setProfileId(initialData.profileId || activeProfileId);
      setErrorMsg(null);
    } else {
      setTitle('');
      setAmount('');
      setCategoryId(EXPENSE_CATEGORIES[2]?.id || 'bills');
      setPaymentMethod('bank');
      setDueDay(10);
      setNotes('');
      setIsActive(true);
      setProfileId(activeProfileId);
      setErrorMsg(null);
    }
  }, [initialData, isOpen, activeProfileId]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: RecurringBillPreset) => {
    setTitle(preset.title);
    setAmount(preset.defaultAmount.toString());
    setCategoryId(preset.categoryId);
    setPaymentMethod(preset.paymentMethod);
    setDueDay(preset.dueDay);
    setNotes(preset.description);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amount);
    if (!title.trim()) {
      setErrorMsg('Nama tagihan / pengeluaran rutin tidak boleh kosong.');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Masukkan nominal tagihan yang valid (lebih dari 0).');
      return;
    }

    if (dueDay < 1 || dueDay > 31) {
      setErrorMsg('Tanggal jatuh tempo harus antara 1 sampai 31.');
      return;
    }

    onSave(
      {
        title: title.trim(),
        amount: numAmount,
        categoryId,
        paymentMethod,
        dueDay,
        notes: notes.trim(),
        isActive,
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
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? 'Edit Pengeluaran Rutin' : 'Tambah Pengeluaran Rutin Bulanan'}
              </h3>
              <p className="text-xs text-slate-500">
                Tagihan wajib tiap bulan seperti BPJS, paketan, kas, dll.
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

          {/* Pemilik Tagihan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tagihan Rutin Milik:
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

          {/* Quick Presets (Only when adding new) */}
          {!initialData && (
            <div className="space-y-1.5 pb-2 border-b border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Pilih Template Cepat:
                </span>
                <span className="text-[10px] text-slate-400">Klik untuk isi otomatis</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                {RECURRING_PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-[11px] font-medium text-slate-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <span>{preset.title}</span>
                    <span className="text-slate-400 text-[10px]">
                      ({preset.defaultAmount >= 1000000 ? `${preset.defaultAmount / 1000000}jt` : `${preset.defaultAmount / 1000}rb`})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Tagihan / Pengeluaran Rutin <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: BPJS Kesehatan, Paket Data Indosat, Uang Kas Kantor"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 font-medium"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nominal Rutin Tiap Bulan (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-3.5 py-2 text-base font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900"
              />
            </div>
            {parseFloat(amount) > 0 && (
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">
                {formatRupiah(parseFloat(amount))} per bulan
              </p>
            )}
          </div>

          {/* Due Day (Tanggal Jatuh Tempo) & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Due Day */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Tanggal Jatuh Tempo <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Tgl 1 - 31</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={dueDay}
                  onChange={(e) => setDueDay(parseInt(e.target.value) || 1)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 font-bold"
                />
              </div>
              {/* Quick Day Chips */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[1, 5, 10, 15, 20, 25, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDueDay(d)}
                    className={`px-1.5 py-0.5 text-[10px] rounded transition cursor-pointer ${
                      dueDay === d
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Tgl {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Anggaran
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 font-medium"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Metode Pembayaran Default
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    paymentMethod === pm.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{pm.label.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {pm.id === 'bank' ? 'Transfer' : pm.id === 'e-wallet' ? 'GoPay/OVO' : pm.id === 'cash' ? 'Tunai' : 'Kredit'}
                  </span>
                </button>
              ))}
            </div>
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
              placeholder="Contoh: No. Pelanggan 01234567, Rekening BCA, dll."
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900"
            />
          </div>

          {/* Active Status Switch */}
          <div className="pt-2 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-800">Status Tagihan Rutin</p>
              <p className="text-[11px] text-slate-500">
                Nonaktifkan jika Anda sedang libur/berhenti berlangganan sementara.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialData ? 'Simpan Perubahan' : 'Tambah Tagihan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
