import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  X,
  CheckCircle,
  WifiOff,
  Sparkles,
  Info
} from 'lucide-react';
import { BeforeInstallPromptEvent, isIosDevice, isRunningStandalone } from '../utils/pwa';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    setIsStandalone(isRunningStandalone());
    setIsIos(isIosDevice());

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      console.log('[PWA] Aplikasi telah berhasil dipasang di layar utama');
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          console.log('[PWA] User accepted installation');
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('[PWA] Installation prompt error:', err);
      }
    } else if (isIos) {
      setShowIosModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  // If already running standalone and online, don't show install bar
  const canShowPrompt = !isStandalone && !isDismissed && (deferredPrompt !== null || isIos);

  return (
    <>
      {/* Offline Status Floating Pill */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md sticky top-0 z-50 animate-in slide-in-from-top duration-200">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            Mode Offline Aktif — Aplikasi tetap berfungsi penuh. Seluruh data transaksi tersimpan di ponsel Anda.
          </span>
        </div>
      )}

      {/* PWA Mobile Install Floating Banner */}
      {canShowPrompt && (
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white border-b border-emerald-500/30 px-4 py-3 shadow-lg relative z-20">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    PWA Mobile & Cloud Sync
                  </p>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online Ready & Cloud Sync
                  </span>
                </div>
                <p className="text-xs text-slate-200 truncate sm:whitespace-normal">
                  Data otomatis tersimpan di Cloud & perangkat Anda. Pasang di layar utama HP untuk akses cepat & offline.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Pasang di HP</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Tutup banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Add to Home Screen Instructions Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-5 animate-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pasang di iPhone / iPad</h3>
                  <p className="text-xs text-slate-500">Panduan Tambah ke Layar Utama iOS</p>
                </div>
              </div>
              <button
                onClick={() => setShowIosModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    Ketuk tombol Bagikan (Share)
                    <Share className="w-4 h-4 text-blue-600 inline" />
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Di bilah menu bawah browser Safari iPhone/iPad Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    Pilih "Tambah ke Layar Utama"
                    <PlusSquare className="w-4 h-4 text-emerald-600 inline" />
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Gulir ke bawah pada menu opsi lalu ketuk <em>"Add to Home Screen"</em>.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    Ketuk "Tambah" (Add) di pojok kanan atas
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Aplikasi Catatan Keuangan akan muncul sebagai ikon aplikasi mandiri di beranda HP Anda.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Aplikasi akan dapat dibuka secara instan dan dapat digunakan saat offline!</span>
            </div>

            <button
              onClick={() => setShowIosModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
