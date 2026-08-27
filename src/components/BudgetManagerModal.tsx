import React, { useState, useEffect } from 'react';
import { X, Target, Save, RotateCcw, User, Heart } from 'lucide-react';
import { CategoryBudget, Transaction, UserProfile, UserProfileId } from '../types';
import { EXPENSE_CATEGORIES } from '../data/categories';
import { formatRupiah, getMonthNameIndonesian, getMonthYearKey } from '../utils/formatters';

interface BudgetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: CategoryBudget[];
  onSaveBudgets: (updated: CategoryBudget[]) => void;
  selectedMonth: string;
  transactions: Transaction[];
  profiles?: UserProfile[];
  activeProfileId?: UserProfileId;
}

export const BudgetManagerModal: React.FC<BudgetManagerModalProps> = ({
  isOpen,
  onClose,
  budgets,
  onSaveBudgets,
  selectedMonth,
  transactions,
  profiles = [],
  activeProfileId = 'user_1',
}) => {
  const [currentTab, setCurrentTab] = useState<UserProfileId>(activeProfileId);

  const profile1 = profiles.find((p) => p.id === 'user_1');
  const profile2 = profiles.find((p) => p.id === 'user_2');

  // Helper to load limits for a given profile
  const getLimitsForProfile = (pId: UserProfileId) => {
    const map: Record<string, number> = {};
    EXPENSE_CATEGORIES.forEach((cat) => {
      const found = budgets.find(
        (b) => b.categoryId === cat.id && (b.profileId || 'user_1') === pId
      );
      map[cat.id] = found ? found.monthlyLimit : cat.defaultBudget || 1000000;
    });
    return map;
  };

  const [limits1, setLimits1] = useState<Record<string, number>>(() => getLimitsForProfile('user_1'));
  const [limits2, setLimits2] = useState<Record<string, number>>(() => getLimitsForProfile('user_2'));

  useEffect(() => {
    setLimits1(getLimitsForProfile('user_1'));
    setLimits2(getLimitsForProfile('user_2'));
    setCurrentTab(activeProfileId);
  }, [budgets, activeProfileId, isOpen]);

  if (!isOpen) return null;

  const currentLimits = currentTab === 'user_1' ? limits1 : limits2;
  const setCurrentLimits = currentTab === 'user_1' ? setLimits1 : setLimits2;

  const handleInputChange = (catId: string, valueStr: string) => {
    const num = parseFloat(valueStr) || 0;
    setCurrentLimits((prev) => ({ ...prev, [catId]: num }));
  };

  const handleSave = () => {
    // Generate full list for both profiles to keep state comprehensive
    const list1: CategoryBudget[] = Object.entries(limits1).map(
      ([categoryId, monthlyLimit]) => ({
        categoryId,
        monthlyLimit: Number(monthlyLimit),
        profileId: 'user_1',
      })
    );

    const list2: CategoryBudget[] = Object.entries(limits2).map(
      ([categoryId, monthlyLimit]) => ({
        categoryId,
        monthlyLimit: Number(monthlyLimit),
        profileId: 'user_2',
      })
    );

    onSaveBudgets([...list1, ...list2]);
    onClose();
  };

  // Get current month spending for comparison for the active tab user
  const currentMonthTx = transactions.filter(
    (t) =>
      t.type === 'expense' &&
      getMonthYearKey(t.date) === selectedMonth &&
      (t.profileId || 'user_1') === currentTab
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pengaturan Target Anggaran Kategori
              </h3>
              <p className="text-xs text-slate-500">
                Batas pengeluaran bulanan ({getMonthNameIndonesian(selectedMonth)})
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

        {/* Profile Tab Switcher */}
        <div className="px-6 pt-4 pb-2 bg-slate-50/50 border-b border-slate-100">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Pilih Target Anggaran Untuk:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCurrentTab('user_1')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                currentTab === 'user_1'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate">{profile1?.name || 'Orang 1'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('user_2')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                currentTab === 'user_2'
                  ? 'bg-violet-50 text-violet-800 border-violet-500 ring-2 ring-violet-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-violet-600" />
              <span className="truncate">{profile2?.name || 'Orang 2'}</span>
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl">
            Tentukan batas maksimal pengeluaran per kategori untuk{' '}
            <strong className="text-indigo-900 font-bold">
              {currentTab === 'user_1' ? profile1?.name || 'Orang 1' : profile2?.name || 'Orang 2'}
            </strong>
            . Sistem akan memberi peringatan jika pengeluaran bulan ini mendekati atau melewati batas.
          </p>

          <div className="space-y-3">
            {EXPENSE_CATEGORIES.map((cat) => {
              const spent = currentMonthTx
                .filter((t) => t.categoryId === cat.id)
                .reduce((sum, t) => sum + t.amount, 0);

              const limit = currentLimits[cat.id] || 0;
              const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;

              return (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">
                        {cat.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        Terpakai: <strong className="text-slate-800">{formatRupiah(spent)}</strong> ({percent}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-400">Rp</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={limit}
                      onChange={(e) => handleInputChange(cat.id, e.target.value)}
                      className="w-36 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 text-right focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              const map: Record<string, number> = {};
              EXPENSE_CATEGORIES.forEach((cat) => {
                map[cat.id] = cat.defaultBudget || 1000000;
              });
              setCurrentLimits(map);
            }}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset {currentTab === 'user_1' ? profile1?.name : profile2?.name} ke Standar
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Target
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
