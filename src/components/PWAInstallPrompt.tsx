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
  Info,
  AlertTriangle,
  Compass
} from 'lucide-react';
import { BeforeInstallPromptEvent, isIosDevice, isInAppBrowser, isRunningStandalone } from '../utils/pwa';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    setIsStandalone(isRunningStandalone());
    setIsIos(isIosDevice());
    setInAppBrowser(isInAppBrowser());

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

    const handleOpenGuide = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt().catch(() => {
          setShowIosModal(true);
        });
      } else {
        setShowIosModal(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('open-pwa-install-guide', handleOpenGuide);

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
      window.removeEventListener('open-pwa-install-guide', handleOpenGuide);
    };
  }, [deferredPrompt]);

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
        setShowIosModal(true);
      }
    } else {
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
                  {isIos
                    ? 'Pengguna iPhone: Pasang ke Layar Utama lewat Safari agar dapat dibuka seperti aplikasi mandiri.'
                    : 'Data tersimpan di Cloud & perangkat. Pasang di layar utama HP untuk akses cepat & offline.'}
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
                <span>{isIos ? 'Cara Pasang di iPhone' : 'Pasang di HP'}</span>
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

      {/* iOS & Mobile Add to Home Screen Instructions Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in slide-in-from-bottom-6 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isIos ? 'Pasang di iPhone / iPad' : 'Pasang di Layar Utama HP'}
                  </h3>
                  <p className="text-xs text-slate-500">Panduan PWA Progressive Web App</p>
                </div>
              </div>
              <button
                onClick={() => setShowIosModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-App Browser Warning if detected */}
            {inAppBrowser && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold">Membuka dari WhatsApp / Instagram?</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Browser internal chat tidak mengizinkan pemasangan aplikasi. Ketuk ikon titik tiga (•••) atau kompas di pojok, lalu pilih <strong className="font-semibold">"Buka di Safari"</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* iOS System Explanation Notice */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Mengapa tidak ada tombol download otomatis?</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Sistem operasi Apple iOS tidak mengizinkan web app memicu instalasi otomatis secara sepihak. Pengguna iPhone memasangnya langsung melalui fitur resmi <strong>"Add to Home Screen"</strong> di browser Safari.
                </p>
              </div>
            </div>

            {/* Steps Guide */}
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    Buka di Browser Safari
                    <Compass className="w-4 h-4 text-sky-600 inline" />
                  </p>
                  <p className="text-slate-500 mt-0.5 text-[11px]">
                    Pastikan tautan dibuka di browser resmi Safari bawaan iPhone (bukan in-app browser WhatsApp/Instagram).
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    Ketuk tombol Bagikan (Share)
                    <Share className="w-4 h-4 text-blue-600 inline" />
                  </p>
                  <p className="text-slate-500 mt-0.5 text-[11px]">
                    Ikon kotak berpanah atas di bilah menu bawah layar Safari iPhone Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    Pilih "Tambah ke Layar Utama"
                    <PlusSquare className="w-4 h-4 text-emerald-600 inline" />
                  </p>
                  <p className="text-slate-500 mt-0.5 text-[11px]">
                    Gulir menu opsi ke bawah lalu pilih <em>"Add to Home Screen"</em>.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    Ketuk "Tambah" (Add) di pojok kanan atas
                  </p>
                  <p className="text-slate-500 mt-0.5 text-[11px]">
                    Ikon "Buku Keuangan" akan langsung tampil di beranda iPhone Anda dan dapat dibuka secara layar penuh tanpa bilah URL!
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Dapat dibuka secara instan dan dapat digunakan bahkan saat tidak ada koneksi internet (offline).</span>
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
