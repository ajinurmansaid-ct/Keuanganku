import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { getMonthNameIndonesian } from '../utils/formatters';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAll: () => void;
  onClearCurrentMonth: () => void;
  onResetToSample: () => void;
  onExportBackup: () => void;
  selectedMonth: string;
  transactionCount: number;
  monthTransactionCount: number;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({
  isOpen,
  onClose,
  onClearAll,
  onClearCurrentMonth,
  onResetToSample,
  onExportBackup,
  selectedMonth,
  transactionCount,
  monthTransactionCount,
}) => {
  const [selectedOption, setSelectedOption] = useState<'sample' | 'clearMonth' | 'clearAll'>('sample');
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleExecute = () => {
    if (selectedOption === 'clearAll') {
      if (confirmText.toLowerCase() !== 'hapus') {
        alert('Ketik kata "HAPUS" untuk mengonfirmasi pengosongan seluruh data.');
        return;
      }
      onClearAll();
      onClose();
    } else if (selectedOption === 'clearMonth') {
      onClearCurrentMonth();
      onClose();
    } else if (selectedOption === 'sample') {
      onResetToSample();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reset Data Keuangan
              </h3>
              <p className="text-xs text-slate-500">
                Pilih opsi pengaturan ulang data catatan keuangan Anda
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Backup Reminder Banner */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Amankan data Anda sebelum melakukan reset.</span>
            </div>
            <button
              onClick={onExportBackup}
              type="button"
              className="px-2.5 py-1 bg-white hover:bg-amber-100/80 border border-amber-300 text-amber-900 font-semibold rounded-lg transition shrink-0 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Backup JSON
            </button>
          </div>

          {/* Reset Options */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Pilih Tindakan Reset:
            </label>

            {/* Option 1: Reset ke Data Contoh */}
            <div
              onClick={() => setSelectedOption('sample')}
              className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                selectedOption === 'sample'
                  ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-100'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="resetOption"
                checked={selectedOption === 'sample'}
                onChange={() => setSelectedOption('sample')}
                className="mt-1 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    Reset ke Data Contoh (Demo)
                  </span>
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-md font-semibold">
                    Rekomendasi
                  </span>
                </div>
                <p className="text-slate-500 mt-0.5">
                  Mengembalikan data contoh transaksi multi-bulan & batas anggaran agar grafik dapat langsung dicoba.
                </p>
              </div>
            </div>

            {/* Option 2: Hapus Transaksi Bulan Ini Saja */}
            <div
              onClick={() => setSelectedOption('clearMonth')}
              className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                selectedOption === 'clearMonth'
                  ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-100'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="resetOption"
                checked={selectedOption === 'clearMonth'}
                onChange={() => setSelectedOption('clearMonth')}
                className="mt-1 text-rose-600 focus:ring-rose-500"
              />
              <div className="flex-1 text-xs">
                <span className="font-bold text-slate-900 block">
                  Kosongkan Transaksi {getMonthNameIndonesian(selectedMonth)}
                </span>
                <p className="text-slate-500 mt-0.5">
                  Hanya menghapus <strong>{monthTransactionCount} transaksi</strong> pada periode bulan yang aktif. Data bulan lain tetap aman.
                </p>
              </div>
            </div>

            {/* Option 3: Hapus Semua Data (Kosongkan Total) */}
            <div
              onClick={() => setSelectedOption('clearAll')}
              className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                selectedOption === 'clearAll'
                  ? 'border-rose-600 bg-rose-50 ring-2 ring-rose-100'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="resetOption"
                checked={selectedOption === 'clearAll'}
                onChange={() => setSelectedOption('clearAll')}
                className="mt-1 text-rose-600 focus:ring-rose-500"
              />
              <div className="flex-1 text-xs">
                <span className="font-bold text-rose-700 block">
                  Hapus Seluruh Data (Mulai dari Nol)
                </span>
                <p className="text-slate-500 mt-0.5">
                  Menghapus total seluruh <strong>{transactionCount} transaksi</strong> dari semua bulan. Halaman akan menjadi lembaran kosong bersih.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation input if clearAll selected */}
          {selectedOption === 'clearAll' && (
            <div className="p-3.5 bg-rose-100/60 border border-rose-200 rounded-xl space-y-2 text-xs">
              <label className="font-bold text-rose-900 block">
                Konfirmasi Penghapusan Total:
              </label>
              <p className="text-rose-700 text-[11px]">
                Ketik <strong className="underline">HAPUS</strong> pada kotak di bawah untuk melanjutkan:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Ketik HAPUS"
                className="w-full px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-xs font-bold text-rose-900 focus:outline-hidden focus:ring-2 focus:ring-rose-300"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExecute}
            disabled={selectedOption === 'clearAll' && confirmText.toLowerCase() !== 'hapus'}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5 ${
              selectedOption === 'sample'
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {selectedOption === 'sample'
              ? 'Terapkan Data Contoh'
              : selectedOption === 'clearMonth'
              ? `Hapus Data ${getMonthNameIndonesian(selectedMonth).split(' ')[0]}`
              : 'Hapus Seluruh Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
