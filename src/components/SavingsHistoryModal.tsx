import React, { useState } from 'react';
import {
  X,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Calendar,
  PiggyBank,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatRupiah, formatFullDateIndonesian } from '../utils/formatters';

interface SavingsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  onDeleteLog: (goalId: string, logId: string) => void;
  onOpenDeposit: (goal: SavingsGoal, type: 'deposit' | 'withdraw') => void;
}

export const SavingsHistoryModal: React.FC<SavingsHistoryModalProps> = ({
  isOpen,
  onClose,
  goal,
  onDeleteLog,
  onOpenDeposit,
}) => {
  const [logToDeleteId, setLogToDeleteId] = useState<string | null>(null);

  if (!isOpen || !goal) return null;

  const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const isCompleted = goal.currentAmount >= goal.targetAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: goal.color }}
            >
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 truncate max-w-[260px]">
                {goal.title}
              </h3>
              <p className="text-xs text-slate-500">
                Riwayat mutasi setoran dan penarikan tabungan
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

        {/* Overview Progress Pill */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 space-y-2">
          <div className="flex justify-between items-baseline text-xs">
            <div>
              <span className="text-slate-400 font-medium">Terkumpul: </span>
              <strong className="text-sm font-bold text-slate-900">
                {formatRupiah(goal.currentAmount)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Target: </span>
              <strong className="text-xs font-bold text-slate-700">
                {formatRupiah(goal.targetAmount)}
              </strong>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-50 text-indigo-700'
              }`}
            >
              {percentage}%
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%`, backgroundColor: goal.color }}
            ></div>
          </div>

          {goal.notes && (
            <p className="text-[11px] text-slate-500 italic pt-1">
              Catatan: {goal.notes}
            </p>
          )}
        </div>

        {/* Logs List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-2.5 max-h-[360px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>Daftar Transaksi ({goal.history.length})</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenDeposit(goal, 'deposit');
                }}
                className="text-emerald-600 hover:text-emerald-700 font-semibold normal-case flex items-center gap-1 cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" /> + Setor
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenDeposit(goal, 'withdraw');
                }}
                className="text-amber-600 hover:text-amber-700 font-semibold normal-case flex items-center gap-1 cursor-pointer"
              >
                <ArrowDownRight className="w-3.5 h-3.5" /> - Tarik
              </button>
            </div>
          </div>

          {goal.history.length === 0 ? (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <PiggyBank className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-xs">Belum ada riwayat mutasi pada pos tabungan ini.</p>
            </div>
          ) : (
            goal.history
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((log) => {
                const isDeposit = log.type === 'deposit';
                const isConfirming = logToDeleteId === log.id;
                return (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border transition ${
                      isConfirming
                        ? 'border-rose-300 bg-rose-50/70'
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/60'
                    } flex items-center justify-between gap-3 text-xs`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isDeposit ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {isDeposit ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {isDeposit ? 'Setoran Tabungan' : 'Penarikan Dana'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {formatFullDateIndonesian(log.date)}
                          </span>
                        </div>
                        {log.note && (
                          <p className="text-[11px] text-slate-500 truncate">{log.note}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span
                        className={`font-bold ${
                          isDeposit ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {isDeposit ? '+' : '-'} {formatRupiah(log.amount)}
                      </span>

                      {isConfirming ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onDeleteLog(goal.id, log.id);
                              setLogToDeleteId(null);
                            }}
                            className="px-2 py-1 rounded bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700 transition cursor-pointer"
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => setLogToDeleteId(null)}
                            className="px-2 py-1 rounded bg-slate-200 text-slate-700 font-medium text-[10px] hover:bg-slate-300 transition cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setLogToDeleteId(log.id)}
                          className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Hapus riwayat ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>ID: {goal.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
