import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  HeartPulse,
  TrendingUp,
  Brain
} from 'lucide-react';
import { AIAdvice, CategoryBudget, FinancialSummary, Transaction } from '../types';
import {
  formatRupiah,
  getCategoryExpenseBreakdown,
  getBudgetProgressList,
  getMonthNameIndonesian
} from '../utils/formatters';

interface AIAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: FinancialSummary;
  transactions: Transaction[];
  budgets: CategoryBudget[];
  selectedMonth: string;
}

export const AIAdviceModal: React.FC<AIAdviceModalProps> = ({
  isOpen,
  onClose,
  summary,
  transactions,
  budgets,
  selectedMonth,
}) => {
  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAIAdvice = async () => {
    setLoading(true);
    setErrorMsg(null);

    const breakdown = getCategoryExpenseBreakdown(transactions, selectedMonth);
    const budgetProgress = getBudgetProgressList(transactions, budgets, selectedMonth);

    try {
      const response = await fetch('/api/financial-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          topExpenseCategories: breakdown.slice(0, 5).map((b) => ({
            name: b.categoryName,
            amount: b.amount,
            percentage: b.percentage,
          })),
          budgets: budgetProgress.map((bp) => ({
            categoryName: bp.categoryName,
            limit: bp.limit,
            spent: bp.spent,
            status: bp.status,
          })),
          selectedMonth: getMonthNameIndonesian(selectedMonth),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan sistem.');
      }

      setAdvice(data);
    } catch (err: any) {
      console.warn('Fallback to rule-based financial advice:', err);
      // Fallback rule-based logic if Gemini API key isn't provided or server error
      const fallbackAdvice = generateFallbackAdvice(summary, breakdown, budgetProgress, selectedMonth);
      setAdvice(fallbackAdvice);
      if (err.message && err.message.includes('GEMINI_API_KEY')) {
        setErrorMsg('Catatan: Menampilkan rekomendasi analisis lokal (Tambahkan GEMINI_API_KEY di Secrets untuk analisis AI penuh).');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !advice && !loading) {
      fetchAIAdvice();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                Analisis & Penasihat Keuangan AI
              </h3>
              <p className="text-xs text-indigo-100">
                Laporan Kesehatan Keuangan Periode {getMonthNameIndonesian(selectedMonth)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center space-y-4">
              <Brain className="w-12 h-12 text-indigo-600 animate-pulse mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Menganalisis Pola Keuangan Anda...
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Mengevaluasi rasio tabungan, tren pengeluaran, dan batas anggaran...
                </p>
              </div>
            </div>
          ) : advice ? (
            <div className="space-y-5">
              {/* Health Score Gauge */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-extrabold text-2xl text-white shadow-md ${
                      advice.healthScore >= 75
                        ? 'bg-emerald-600'
                        : advice.healthScore >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                    }`}
                  >
                    <span>{advice.healthScore}</span>
                    <span className="text-[9px] uppercase font-bold tracking-widest opacity-80">
                      / 100
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Status Kesehatan
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">
                      {advice.healthStatus}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">{advice.summary}</p>
                  </div>
                </div>

                <button
                  onClick={fetchAIAdvice}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                  Analisis Ulang
                </button>
              </div>

              {/* Spending Warnings if any */}
              {advice.spendingWarnings && advice.spendingWarnings.length > 0 && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                  <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Peringatan & Potensi Masalah
                  </h5>
                  <ul className="space-y-1 text-xs text-rose-900 list-disc list-inside">
                    {advice.spendingWarnings.map((warn, idx) => (
                      <li key={idx}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Observations */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Observasi Utama Pola Keuangan
                </h5>
                <div className="grid grid-cols-1 gap-2">
                  {advice.keyObservations?.map((obs, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Saran Konkret Penghematan & Tabungan
                </h5>
                <div className="grid grid-cols-1 gap-2">
                  {advice.recommendations?.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex items-start gap-2.5 font-medium"
                    >
                      <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0 text-[11px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition"
          >
            Tutup Laporan
          </button>
        </div>
      </div>
    </div>
  );
};

// Local Rule-Based Evaluator fallback
function generateFallbackAdvice(
  summary: FinancialSummary,
  breakdown: any[],
  budgets: any[],
  monthName: string
): AIAdvice {
  const savingsRate = summary.savingsRate || 0;
  let score = 70;
  let status: AIAdvice['healthStatus'] = 'Cukup Sehat';

  if (savingsRate >= 30) {
    score = 88;
    status = 'Sangat Sehat';
  } else if (savingsRate >= 15) {
    score = 72;
    status = 'Cukup Sehat';
  } else if (savingsRate >= 0) {
    score = 55;
    status = 'Perlu Perhatian';
  } else {
    score = 35;
    status = 'Waspada';
  }

  const topCategory = breakdown[0];
  const overBudgets = budgets.filter((b) => b.status === 'danger');

  const warnings: string[] = [];
  if (summary.balance < 0) {
    warnings.push(`Pengeluaran bulan ini melebihi total pemasukan sebesar ${formatRupiah(Math.abs(summary.balance))}.`);
  }
  if (overBudgets.length > 0) {
    warnings.push(`Terdapat ${overBudgets.length} kategori yang telah melewati batas anggaran (${overBudgets.map((b) => b.categoryName).join(', ')}).`);
  }

  const keyObservations = [
    `Rasio tabungan Anda bulan ini berada di angka ${savingsRate}%.`,
    topCategory
      ? `Pengeluaran terbesar didominasi oleh kategori ${topCategory.categoryName} (${formatRupiah(topCategory.amount)}).`
      : 'Pengeluaran terdistribusi secara merata.',
    `Rata-rata pengeluaran harian Anda tercatat sebesar ${formatRupiah(summary.dailyAverageExpense)} per hari.`,
  ];

  const recommendations = [
    'Terapkan formula 50/30/20: 50% Kebutuhan Pokok, 30% Keinginan, dan minimal 20% Tabungan / Investasi.',
    topCategory
      ? `Pertimbangkan menetapkan batas anggaran yang lebih ketat pada kategori ${topCategory.categoryName} di bulan berikutnya.`
      : 'Tetapkan target dana darurat minimal setara 3 sampai 6 kali pengeluaran bulanan.',
    'Lakukan evaluasi transaksi mingguan agar batas anggaran tidak terlampaui menjelang akhir bulan.',
  ];

  return {
    healthScore: score,
    healthStatus: status,
    summary: `Kondisi keuangan Anda bulan ini berada pada kategori ${status} dengan rasio tabungan ${savingsRate}%.`,
    keyObservations,
    recommendations,
    spendingWarnings: warnings,
  };
}
