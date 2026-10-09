import React from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const GradientBar = ({ compact = false }) => {
  const { allGradientPresets, gradientPresetId, changeGradientPreset } = useTheme();

  return (
    <div className="relative inline-block select-none z-30">
      {compact ? (
        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-orange-200/50 dark:border-orange-500/20 shadow-sm">
          <Palette className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 ml-1.5" />
          <div className="flex items-center space-x-1">
            {allGradientPresets.map((preset) => {
              const isActive = preset.id === gradientPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => changeGradientPreset(preset.id)}
                  title={`${preset.name}: ${preset.tagline}`}
                  className={`w-6 h-6 rounded-full transition-all flex items-center justify-center p-[2px] cursor-pointer ${
                    isActive
                      ? 'scale-110 ring-2 ring-orange-500 ring-offset-1 dark:ring-offset-stone-900 shadow-md'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${preset.colors.join(', ')})`,
                  }}
                >
                  {isActive && <Check className="w-3 h-3 text-white drop-shadow" />}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-orange-200/60 dark:border-orange-500/25 shadow-xl">
          <div className="flex items-center space-x-2 px-3 py-1 text-xs font-bold text-stone-800 dark:text-stone-100">
            <Palette className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="font-display">Atmosphere:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {allGradientPresets.map((preset) => {
              const isActive = preset.id === gradientPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => changeGradientPreset(preset.id)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-stone-800 text-orange-700 dark:text-orange-300 shadow-md ring-1 ring-orange-400/50 scale-[1.02]'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${preset.colors.join(', ')})`,
                    }}
                  />
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
