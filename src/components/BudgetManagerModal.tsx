import React, { useState } from 'react';
import { X, Target, Save, RotateCcw } from 'lucide-react';
import { CategoryBudget, Transaction } from '../types';
import { EXPENSE_CATEGORIES } from '../data/categories';
import { formatRupiah, getMonthNameIndonesian, getMonthYearKey } from '../utils/formatters';

interface BudgetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: CategoryBudget[];
  onSaveBudgets: (updated: CategoryBudget[]) => void;
  selectedMonth: string;
  transactions: Transaction[];
}

export const BudgetManagerModal: React.FC<BudgetManagerModalProps> = ({
  isOpen,
  onClose,
  budgets,
  onSaveBudgets,
  selectedMonth,
  transactions,
}) => {
  const [localLimits, setLocalLimits] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    EXPENSE_CATEGORIES.forEach((cat) => {
      const found = budgets.find((b) => b.categoryId === cat.id);
      map[cat.id] = found ? found.monthlyLimit : cat.defaultBudget || 1000000;
    });
    return map;
  });

  if (!isOpen) return null;

  const handleInputChange = (catId: string, valueStr: string) => {
    const num = parseFloat(valueStr) || 0;
    setLocalLimits((prev) => ({ ...prev, [catId]: num }));
  };

  const handleSave = () => {
    const updatedList: CategoryBudget[] = Object.entries(localLimits).map(
      ([categoryId, monthlyLimit]) => ({
        categoryId,
        monthlyLimit: Number(monthlyLimit),
      })
    );
    onSaveBudgets(updatedList);
    onClose();
  };

  // Get current month spending for comparison
  const currentMonthTx = transactions.filter(
    (t) => t.type === 'expense' && getMonthYearKey(t.date) === selectedMonth
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl">
            Tentukan batas maksimal pengeluaran per kategori. Sistem akan memberi peringatan jika pengeluaran bulan ini mendekati atau melewati batas.
          </p>

          <div className="space-y-3">
            {EXPENSE_CATEGORIES.map((cat) => {
              const spent = currentMonthTx
                .filter((t) => t.categoryId === cat.id)
                .reduce((sum, t) => sum + t.amount, 0);

              const limit = localLimits[cat.id] || 0;
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
              setLocalLimits(map);
            }}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset ke Standar
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/50 transition"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm flex items-center gap-1.5"
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
