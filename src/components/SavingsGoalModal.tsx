import React, { useState, useEffect } from 'react';
import {
  X,
  PiggyBank,
  Target,
  Calendar,
  Sparkles,
  ShieldCheck,
  Laptop,
  Plane,
  Car,
  Home,
  GraduationCap,
  TrendingUp,
  Heart,
  Palette
} from 'lucide-react';
import { SavingsGoal, SavingsCategoryType, UserProfile, UserProfileId } from '../types';
import { SAVINGS_CATEGORIES_CONFIG } from '../data/sampleSavings';
import { formatRupiah } from '../utils/formatters';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'history'> & { initialDeposit?: number; id?: string; profileId?: UserProfileId }) => void;
  initialData?: SavingsGoal | null;
  profiles?: UserProfile[];
  activeProfileId?: UserProfileId;
}

const CATEGORY_ICONS: Record<string, any> = {
  ShieldCheck,
  Laptop,
  Plane,
  Car,
  Home,
  GraduationCap,
  TrendingUp,
  Heart,
  PiggyBank,
};

const COLOR_PRESETS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#64748B', // Slate
];

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  profiles = [],
  activeProfileId = 'user_1',
}) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [initialDeposit, setInitialDeposit] = useState<string>('0');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<SavingsCategoryType>('emergency');
  const [color, setColor] = useState('#10B981');
  const [notes, setNotes] = useState('');
  const [profileId, setProfileId] = useState<UserProfileId>(activeProfileId);

  const profile1 = profiles.find((p) => p.id === 'user_1');
  const profile2 = profiles.find((p) => p.id === 'user_2');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setTargetAmount(initialData.targetAmount.toString());
      setInitialDeposit('0');
      setTargetDate(initialData.targetDate || '');
      setCategory(initialData.category);
      setColor(initialData.color);
      setNotes(initialData.notes || '');
      setProfileId(initialData.profileId || activeProfileId);
    } else {
      setTitle('');
      setTargetAmount('');
      setInitialDeposit('0');
      setTargetDate('');
      setCategory('emergency');
      setColor('#10B981');
      setNotes('');
      setProfileId(activeProfileId);
    }
  }, [initialData, isOpen, activeProfileId]);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: SavingsCategoryType) => {
    setCategory(newCat);
    const config = SAVINGS_CATEGORIES_CONFIG.find((c) => c.id === newCat);
    if (config) {
      setColor(config.defaultColor);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = parseFloat(targetAmount) || 0;
    const numInitDeposit = parseFloat(initialDeposit) || 0;

    if (!title.trim()) {
      alert('Mohon masukkan nama atau tujuan tabungan.');
      return;
    }

    if (numTarget <= 0) {
      alert('Mohon masukkan target nominal tabungan yang valid.');
      return;
    }

    const config = SAVINGS_CATEGORIES_CONFIG.find((c) => c.id === category);

    onSave({
      id: initialData?.id,
      title: title.trim(),
      targetAmount: numTarget,
      currentAmount: initialData ? initialData.currentAmount : numInitDeposit,
      targetDate: targetDate || undefined,
      category,
      color,
      icon: config ? config.icon : 'PiggyBank',
      notes: notes.trim() || undefined,
      initialDeposit: initialData ? 0 : numInitDeposit,
      profileId,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? 'Edit Target Tabungan' : 'Buat Target Tabungan Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Tentukan target impian dan alokasikan dana secara terencana
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Pemilik Tabungan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Tabungan Milik Pengguna:
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

          {/* Judul Target */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nama / Tujuan Tabungan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Dana Darurat 6 Bulan, Beli Mobil, Liburan Jepang"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-slate-900 font-medium"
            />
          </div>

          {/* Kategori Tabungan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Kategori Pos Tabungan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SAVINGS_CATEGORIES_CONFIG.map((cat) => {
                const IconComponent = CATEGORY_ICONS[cat.icon] || PiggyBank;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-200'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.defaultColor}20`, color: cat.defaultColor }}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] leading-tight truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nominal Target & Saldo Awal Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Target Nominal (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="Masukkan nominal bebas"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-slate-900 font-bold"
                />
              </div>
              {parseFloat(targetAmount) > 0 && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  {formatRupiah(parseFloat(targetAmount))}
                </p>
              )}
              {/* Quick Preset Nominal Chips */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[1000000, 5000000, 10000000, 25000000, 50000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTargetAmount(val.toString())}
                    className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                  >
                    {val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`}
                  </button>
                ))}
              </div>
            </div>

            {!initialData && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Saldo Awal (Opsional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={initialDeposit}
                    onChange={(e) => setInitialDeposit(e.target.value)}
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-slate-900"
                  />
                </div>
                {parseFloat(initialDeposit) > 0 && (
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Tersimpan: {formatRupiah(parseFloat(initialDeposit))}
                  </p>
                )}
              </div>
            )}

            {initialData && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Saldo Terkumpul Saat Ini
                </label>
                <div className="px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl font-bold text-emerald-700">
                  {formatRupiah(initialData.currentAmount)}
                </div>
              </div>
            )}
          </div>

          {/* Target Tanggal & Pilihan Warna */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Target Selesai (Opsional)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Warna Tema Kartu
              </label>
              <div className="flex items-center gap-1.5 py-1">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setColor(preset)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === preset ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: preset }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Catatan / Keterangan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Catatan / Rencana Instrumen (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Ditabung di Reksadana / Bank Jago / Brankas Tunai"
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-slate-800"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition flex items-center gap-1.5"
            >
              <Target className="w-4 h-4" />
              {initialData ? 'Simpan Perubahan' : 'Simpan Target Tabungan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
