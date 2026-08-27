import React, { useState } from 'react';
import {
  PiggyBank,
  PlusCircle,
  Target,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Edit2,
  Trash2,
  TrendingUp,
  ShieldCheck,
  Laptop,
  Plane,
  Car,
  Home,
  GraduationCap,
  Heart,
  Clock,
  AlertTriangle,
  X
} from 'lucide-react';
import { SavingsGoal, UserProfile, ActiveViewMode } from '../types';
import { formatRupiah, formatFullDateIndonesian } from '../utils/formatters';

interface SavingsSectionProps {
  savingsGoals: SavingsGoal[];
  onOpenAddGoal: () => void;
  onOpenEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  onOpenDepositModal: (goal: SavingsGoal, type: 'deposit' | 'withdraw') => void;
  onOpenHistoryModal: (goal: SavingsGoal) => void;
  profiles?: UserProfile[];
  activeViewMode?: ActiveViewMode;
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

export const SavingsSection: React.FC<SavingsSectionProps> = ({
  savingsGoals,
  onOpenAddGoal,
  onOpenEditGoal,
  onDeleteGoal,
  onOpenDepositModal,
  onOpenHistoryModal,
  profiles = [],
  activeViewMode = 'user_1',
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);

  const profile1 = profiles.find((p) => p.id === 'user_1');
  const profile2 = profiles.find((p) => p.id === 'user_2');

  // Stats
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const completedGoals = savingsGoals.filter((g) => g.currentAmount >= g.targetAmount);
  const activeGoals = savingsGoals.filter((g) => g.currentAmount < g.targetAmount);
  const overallPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const filteredGoals = savingsGoals.filter((g) => {
    if (filter === 'active') return g.currentAmount < g.targetAmount;
    if (filter === 'completed') return g.currentAmount >= g.targetAmount;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 md:p-6 mb-6">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Pencatat Tabungan & Celengan Target
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {savingsGoals.length} Pos Tabungan
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Alokasikan dana impian, pantau target kemajuan, dan setor/tarik tabungan secara teratur
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddGoal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition hover:shadow-md cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          + Buat Target Tabungan
        </button>
      </div>

      {/* Summary Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Tabungan Terkumpul
          </span>
          <div className="text-xl font-extrabold text-emerald-700">
            {formatRupiah(totalSaved)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            dari target impian {formatRupiah(totalTarget)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rata-Rata Kemajuan
            </span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              {overallPercentage}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-slate-500 mt-1.5 block">
            {activeGoals.length} target aktif &bull; {completedGoals.length} target tercapai
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Status Target
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {completedGoals.length} Selesai
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                {activeGoals.length} Berjalan
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Target className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition ${
              filter === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Semua ({savingsGoals.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-lg transition ${
              filter === 'active' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Sedang Berjalan ({activeGoals.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg transition ${
              filter === 'completed' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Tercapai ({completedGoals.length})
          </button>
        </div>
      </div>

      {/* Savings Goals Grid Cards */}
      {filteredGoals.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <PiggyBank className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <div>
            <p className="text-sm font-bold text-slate-700">Belum ada target tabungan pada filter ini.</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Mulailah menyisihkan dana untuk impian Anda, dana darurat, atau liburan.
            </p>
          </div>
          <button
            onClick={onOpenAddGoal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            + Buat Target Tabungan Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const IconComponent = CATEGORY_ICONS[goal.icon] || PiggyBank;

            // Monthly calculation if targetDate exists
            let monthsRemaining: number | null = null;
            let monthlyNeeded: number | null = null;
            if (goal.targetDate && !isCompleted) {
              const now = new Date();
              const target = new Date(goal.targetDate);
              const diffTime = target.getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays > 0) {
                monthsRemaining = Math.max(1, Math.ceil(diffDays / 30));
                monthlyNeeded = Math.ceil(remaining / monthsRemaining);
              }
            }

            return (
              <div
                key={goal.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between space-y-4 relative group"
              >
                {/* Card Top: Icon, Title, Actions */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                        style={{ backgroundColor: `${goal.color}18`, color: goal.color }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900 truncate" title={goal.title}>
                            {goal.title}
                          </h3>
                          {activeViewMode === 'combined' && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                (goal.profileId || 'user_1') === 'user_1'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-violet-50 text-violet-700 border-violet-200'
                              }`}
                            >
                              {(goal.profileId || 'user_1') === 'user_1'
                                ? profile1?.name || 'Orang 1'
                                : profile2?.name || 'Orang 2'}
                            </span>
                          )}
                        </div>
                        {goal.targetDate ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Tenggat: {formatFullDateIndonesian(goal.targetDate)}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Tanpa batas waktu</span>
                        )}
                      </div>
                    </div>

                    {/* Edit/Delete dropdown/buttons */}
                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onOpenEditGoal(goal)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                        title="Edit Target"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setGoalToDelete(goal)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus Target"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts & Percentage Badge */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 font-medium block">Terkumpul</span>
                        <span className="text-lg font-extrabold text-slate-900">
                          {formatRupiah(goal.currentAmount)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-medium block">Target</span>
                        <span className="text-xs font-bold text-slate-700">
                          {formatRupiah(goal.targetAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: isCompleted ? '#10B981' : goal.color,
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="font-semibold text-slate-600">
                        {isCompleted ? (
                          <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Target Tercapai! 🎉
                          </span>
                        ) : (
                          <span>Sisa {formatRupiah(remaining)}</span>
                        )}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {percentage}%
                      </span>
                    </div>

                    {/* Smart estimation if targetDate */}
                    {monthlyNeeded !== null && monthsRemaining !== null && (
                      <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] text-slate-600 flex items-center justify-between">
                        <span>
                          Saran: Nabung <strong>{formatRupiah(monthlyNeeded)}/bln</strong>
                        </span>
                        <span className="text-slate-400">({monthsRemaining} bln lagi)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Action Buttons */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => onOpenDepositModal(goal, 'deposit')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Setor
                  </button>

                  <button
                    onClick={() => onOpenDepositModal(goal, 'withdraw')}
                    disabled={goal.currentAmount <= 0}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100/80 text-amber-800 text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    Tarik
                  </button>

                  <button
                    onClick={() => onOpenHistoryModal(goal)}
                    className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    Mutasi ({goal.history.length})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Goal Confirmation Modal */}
      {goalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">Hapus Pos Tabungan?</h3>
                <p className="text-xs text-slate-500 truncate">{goalToDelete.title}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Saldo saat ini:</span>
                <strong className="text-slate-900">{formatRupiah(goalToDelete.currentAmount)}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Target rencana:</span>
                <strong className="text-slate-900">{formatRupiah(goalToDelete.targetAmount)}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Jumlah mutasi:</span>
                <strong className="text-slate-900">{goalToDelete.history.length} catatan</strong>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Pos tabungan ini beserta seluruh riwayat setorannya akan dihapus secara permanen.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGoalToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteGoal(goalToDelete.id);
                  setGoalToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Target
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
