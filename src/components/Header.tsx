import React, { useState } from 'react';
import {
  Wallet,
  PlusCircle,
  Calendar,
  Sparkles,
  Target,
  Download,
  Upload,
  RotateCcw,
  SlidersHorizontal,
  DollarSign,
  PiggyBank,
  Smartphone,
  Repeat,
  CreditCard,
  Cloud,
  CloudCheck,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { getMonthNameIndonesian, getUniqueMonths } from '../utils/formatters';
import { Transaction, UserProfile, ActiveViewMode } from '../types';
import { ProfileSwitcher } from './ProfileSwitcher';

interface HeaderProps {
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onOpenBudgetModal: () => void;
  onOpenAIModal: () => void;
  onOpenResetModal: () => void;
  onOpenSavingsSection: () => void;
  onOpenRecurringSection: () => void;
  onOpenDebtSection: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onForceSyncCloud?: () => void;
  // Multi-user profile props
  profiles?: UserProfile[];
  activeViewMode?: ActiveViewMode;
  onSelectViewMode?: (mode: ActiveViewMode) => void;
  onOpenProfileSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedMonth,
  onSelectMonth,
  transactions,
  onOpenAddModal,
  onOpenBudgetModal,
  onOpenAIModal,
  onOpenResetModal,
  onOpenSavingsSection,
  onOpenRecurringSection,
  onOpenDebtSection,
  onExportJSON,
  onImportJSON,
  onForceSyncCloud,
  profiles = [],
  activeViewMode = 'user_1',
  onSelectViewMode,
  onOpenProfileSettings,
}) => {
  const [showDataMenu, setShowDataMenu] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const availableMonths = getUniqueMonths(transactions);

  const handleSyncClick = async () => {
    if (onForceSyncCloud) {
      setIsSyncing(true);
      await onForceSyncCloud();
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Catatan Keuangan
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    2 Pengguna
                  </span>
                  <button
                    onClick={handleSyncClick}
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-full border border-sky-200 transition cursor-pointer"
                    title="Klik untuk menyinkronkan seluruh data ke Cloud Firestore"
                  >
                    <Cloud className={`w-3 h-3 text-sky-600 ${isSyncing ? 'animate-bounce' : ''}`} />
                    <span className="hidden sm:inline">{isSyncing ? 'Menyinkronkan...' : 'Online Sync'}</span>
                  </button>
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Kelola pengeluaran mandiri untuk 2 orang terpisah & gabungan
                </p>
              </div>
            </div>

            {/* Mobile Quick Add */}
            <div className="flex lg:hidden items-center gap-1.5">
              <button
                onClick={onOpenResetModal}
                className="p-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                title="Reset Data Keuangan"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
                title="Tambah Transaksi"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Profile Switcher (Center) */}
          {onSelectViewMode && onOpenProfileSettings && (
            <div className="flex items-center justify-start lg:justify-center overflow-x-auto py-1">
              <ProfileSwitcher
                profiles={profiles}
                activeViewMode={activeViewMode}
                onSelectViewMode={onSelectViewMode}
                onOpenProfileSettings={onOpenProfileSettings}
              />
            </div>
          )}

          {/* Controls: Month Filter & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Month Filter Selector */}
            <div className="relative flex items-center bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200 text-sm">
              <Calendar className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
              <select
                value={selectedMonth}
                onChange={(e) => onSelectMonth(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-hidden cursor-pointer pr-1"
              >
                {availableMonths.map((mKey) => (
                  <option key={mKey} value={mKey}>
                    {getMonthNameIndonesian(mKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Tagihan Rutin / Recurring Bills Trigger */}
            <button
              onClick={onOpenRecurringSection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 text-indigo-800 hover:bg-indigo-100 text-sm font-medium transition shadow-2xs cursor-pointer"
              title="Pengeluaran Rutin & Tagihan Bulanan (BPJS, Paketan, Kas, dll)"
            >
              <Repeat className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Tagihan Rutin</span>
            </button>

            {/* Hutang & Talangan Defisit Trigger */}
            <button
              onClick={onOpenDebtSection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/70 text-rose-800 hover:bg-rose-100 text-sm font-medium transition shadow-2xs cursor-pointer"
              title="Kewajiban Hutang & Talangan Minus Bulan Sebelumnya"
            >
              <CreditCard className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Hutang & Minus</span>
            </button>

            {/* Tabungan / Savings Goals Trigger */}
            <button
              onClick={onOpenSavingsSection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 text-sm font-medium transition shadow-2xs cursor-pointer"
              title="Pencatat Tabungan & Celengan Target"
            >
              <PiggyBank className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Tabungan</span>
            </button>

            {/* Budgeting Trigger */}
            <button
              onClick={onOpenBudgetModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium transition shadow-2xs"
            >
              <Target className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Anggaran</span>
            </button>

            {/* AI Advisor Button */}
            <button
              onClick={onOpenAIModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 text-sm font-medium transition shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Analisis AI</span>
            </button>

            {/* Dedicated Reset Button */}
            <button
              onClick={onOpenResetModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/60 text-rose-700 hover:bg-rose-100/80 text-sm font-medium transition shadow-2xs"
              title="Reset atau Kosongkan Data Keuangan"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Reset Data</span>
            </button>

            {/* Data Menu dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDataMenu(!showDataMenu)}
                className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm transition"
                title="Kelola Data (Ekspor/Impor)"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {showDataMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowDataMenu(false)}
                >
                  <button
                    onClick={() => {
                      handleSyncClick();
                      setShowDataMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-sky-50 flex items-center gap-2 text-sky-700 font-medium"
                  >
                    <RefreshCw className={`w-4 h-4 text-sky-600 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sinkronkan ke Cloud
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      onExportJSON();
                      setShowDataMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                    Ekspor Backup JSON
                  </button>

                  <label className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    Impor Data JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        onImportJSON(e);
                        setShowDataMenu(false);
                      }}
                      className="hidden"
                    />
                  </label>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setShowDataMenu(false);
                      // Clear dismissal to show the install prompt if hidden
                      sessionStorage.removeItem('pwa_prompt_dismissed');
                      window.location.reload();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 text-xs font-semibold cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    Pasang di Layar HP (PWA)
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      onOpenResetModal();
                      setShowDataMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 text-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Data Keuangan...
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Main CTA: Add Transaction */}
            <button
              onClick={onOpenAddModal}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
