import React from 'react';
import {
  Monitor,
  Download,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Laptop,
  Globe,
  Layers,
} from 'lucide-react';
import { usePWA } from '../context/PWAContext';

export const InstallModal = () => {
  const { showInstallModal, setShowInstallModal, installApp, isInstallable, isInstalled } = usePWA();

  if (!showInstallModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg pastel-dropdown rounded-3xl p-6 sm:p-8 border border-purple-300/40 shadow-2xl relative select-none">
        {/* Close Button */}
        <button
          onClick={() => setShowInstallModal(false)}
          className="absolute top-5 right-5 p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-purple-100/50 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center space-x-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 p-[1.5px] shadow-lg shadow-purple-500/25">
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#101524] flex items-center justify-center">
              <Laptop className="w-6 h-6 text-purple-600 dark:text-pastel-lavender" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Install AuraMeet Desktop
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-sans font-semibold border border-purple-300/40">
                PWA App
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standalone Desktop App • Engineered by Nayab Farooq
            </p>
          </div>
        </div>

        {/* Benefits Cards */}
        <div className="space-y-2.5 mb-6 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-slate-900/60 border border-purple-200/50 dark:border-purple-400/20 flex items-start space-x-3">
            <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-600 dark:text-pastel-lavender flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <Monitor className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Standalone Desktop Window</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Runs without browser tabs or address bars for distraction-free meetings (just like Taqwa Lens).
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-slate-900/60 border border-emerald-200/50 dark:border-emerald-400/20 flex items-start space-x-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-pastel-mint flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Windows Desktop & Taskbar Shortcut</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pin AuraMeet to your Windows taskbar or Start Menu for instant 1-click launch anytime.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50/70 dark:bg-slate-900/60 border border-sky-200/50 dark:border-sky-400/20 flex items-start space-x-3">
            <div className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-600 dark:text-pastel-sky flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Zero Installation Setup Needed</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Installs directly via standard Chromium PWA technology in seconds with zero heavy downloads.
              </p>
            </div>
          </div>
        </div>

        {/* Installation Actions */}
        <div className="space-y-3">
          {isInstalled ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs text-center font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>AuraMeet is already installed as a desktop application!</span>
            </div>
          ) : (
            <button
              onClick={installApp}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white font-bold text-sm transition-all shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 group"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>Install Desktop App Now</span>
            </button>
          )}

          {/* Manual Browser Step Instructions */}
          <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              Quick Browser Install Guide:
            </p>
            <p>
              <strong className="text-purple-600 dark:text-purple-400">In Chrome / Edge / Brave:</strong> Look at the right side of the address bar at the top of your browser. Click the <span className="underline font-semibold">Install App</span> icon (🖥️ or ➕) next to the bookmark star, then click <strong>Install</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
