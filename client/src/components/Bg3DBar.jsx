import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Bg3DBar = ({ compact = false }) => {
  const { allBg3DOptions, bg3DMode, changeBg3DMode } = useTheme();

  return (
    <div className="relative inline-block select-none z-30">
      {compact ? (
        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-orange-200/50 dark:border-orange-500/20 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 ml-1.5" />
          <div className="flex items-center space-x-1">
            {allBg3DOptions.map((opt) => {
              const isActive = opt.id === bg3DMode;
              return (
                <button
                  key={opt.id}
                  onClick={() => changeBg3DMode(opt.id)}
                  title={`${opt.name}: ${opt.tagline}`}
                  className={`px-2 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-300'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span className="hidden sm:inline">{opt.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-orange-200/60 dark:border-orange-500/25 shadow-xl">
          <div className="flex items-center space-x-2 px-3 py-1 text-xs font-bold text-stone-800 dark:text-stone-100">
            <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="font-display">3D Visuals:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {allBg3DOptions.map((opt) => {
              const isActive = opt.id === bg3DMode;
              return (
                <button
                  key={opt.id}
                  onClick={() => changeBg3DMode(opt.id)}
                  title={opt.tagline}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md ring-1 ring-orange-400/50 scale-[1.02]'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <span className="text-sm">{opt.icon}</span>
                  <span>{opt.name}</span>
                  {isActive && <Check className="w-3 h-3 text-white ml-0.5 drop-shadow" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
