import React, { createContext, useContext, useState, useEffect } from 'react';

export const GRADIENT_PRESETS = [
  {
    id: 'peach-sunset',
    name: 'Peach Sunset',
    tagline: 'Warm Peach Fuzz & Sunset Coral',
    accent: '#ea580c',
    colors: ['#fb923c', '#f43f5e', '#f59e0b'],
    threeColors: {
      ambient: 0x26140e,
      lightA: 0xff7a59,
      lightB: 0xfb923c,
      waveColor: 0xfb923c,
      particleColor: 0xf43f5e,
      gridColor: 0xf59e0b,
    },
    textGradientLight: 'from-orange-600 via-rose-600 to-amber-600',
    textGradientDark: 'from-orange-400 via-rose-400 to-amber-300',
    cssMeshClass: 'mesh-peach-sunset',
  },
  {
    id: 'golden-amber',
    name: 'Golden Amber',
    tagline: 'Radiant Sunburst & Warm Honey',
    accent: '#d97706',
    colors: ['#f59e0b', '#fbbf24', '#ea580c'],
    threeColors: {
      ambient: 0x24180a,
      lightA: 0xf59e0b,
      lightB: 0xfbbf24,
      waveColor: 0xf59e0b,
      particleColor: 0xfbbf24,
      gridColor: 0xea580c,
    },
    textGradientLight: 'from-amber-600 via-orange-600 to-yellow-600',
    textGradientDark: 'from-amber-300 via-orange-300 to-yellow-200',
    cssMeshClass: 'mesh-golden-amber',
  },
  {
    id: 'rose-coral',
    name: 'Rose Coral',
    tagline: 'Blush Coral & Warm Petal',
    accent: '#e11d48',
    colors: ['#f43f5e', '#fb7185', '#fda4af'],
    threeColors: {
      ambient: 0x260d16,
      lightA: 0xf43f5e,
      lightB: 0xfb7185,
      waveColor: 0xf43f5e,
      particleColor: 0xfb7185,
      gridColor: 0xfda4af,
    },
    textGradientLight: 'from-rose-600 via-red-600 to-orange-600',
    textGradientDark: 'from-rose-300 via-pink-300 to-orange-300',
    cssMeshClass: 'mesh-rose-coral',
  },
  {
    id: 'warm-terracotta',
    name: 'Warm Terracotta',
    tagline: 'Rich Clay & Earthy Amber',
    accent: '#c2410c',
    colors: ['#c2410c', '#ea580c', '#f59e0b'],
    threeColors: {
      ambient: 0x261208,
      lightA: 0xc2410c,
      lightB: 0xea580c,
      waveColor: 0xc2410c,
      particleColor: 0xea580c,
      gridColor: 0xf59e0b,
    },
    textGradientLight: 'from-orange-700 via-amber-700 to-rose-700',
    textGradientDark: 'from-orange-300 via-amber-200 to-rose-300',
    cssMeshClass: 'mesh-warm-terracotta',
  },
  {
    id: 'emerald-sage',
    name: 'Sage Mint',
    tagline: 'Botanical Sage & Amber Glow',
    accent: '#059669',
    colors: ['#10b981', '#34d399', '#f59e0b'],
    threeColors: {
      ambient: 0x0c2016,
      lightA: 0x10b981,
      lightB: 0x34d399,
      waveColor: 0x10b981,
      particleColor: 0x34d399,
      gridColor: 0xf59e0b,
    },
    textGradientLight: 'from-emerald-700 via-teal-700 to-amber-600',
    textGradientDark: 'from-emerald-300 via-teal-300 to-amber-200',
    cssMeshClass: 'mesh-emerald-sage',
  },
];

export const BG_3D_OPTIONS = [
  { id: 'bubbles', name: 'Glass Bubbles', icon: '🫧', tagline: 'Cute translucent soap bubbles with pop interactions' },
  { id: 'petals', name: 'Petal Drift', icon: '🌸', tagline: 'Soft floating peach & rose blossoms in the breeze' },
  { id: 'sparkles', name: 'Fairy Stardust', icon: '✨', tagline: 'Peaceful twinkling stardust and glowing embers' },
  { id: 'silk-waves', name: 'Silk Ribbons', icon: '🌊', tagline: 'Smooth flowing organic silk waves' },
  { id: 'crystals', name: 'Floating Gems', icon: '💎', tagline: 'Translucent soft geometric crystal prisms' },
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('aurameet_theme');
    return saved || 'dark';
  });

  const [gradientPresetId, setGradientPresetId] = useState(() => {
    const saved = localStorage.getItem('aurameet_gradient_preset');
    return saved || 'peach-sunset';
  });

  const [bg3DMode, setBg3DMode] = useState(() => {
    const saved = localStorage.getItem('aurameet_3d_bg_mode');
    return saved || 'bubbles';
  });

  const currentGradient =
    GRADIENT_PRESETS.find((p) => p.id === gradientPresetId) || GRADIENT_PRESETS[0];

  const currentBg3D =
    BG_3D_OPTIONS.find((b) => b.id === bg3DMode) || BG_3D_OPTIONS[0];

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('aurameet_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-gradient', gradientPresetId);
    localStorage.setItem('aurameet_gradient_preset', gradientPresetId);
  }, [gradientPresetId]);

  useEffect(() => {
    localStorage.setItem('aurameet_3d_bg_mode', bg3DMode);
  }, [bg3DMode]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const changeGradientPreset = (presetId) => {
    setGradientPresetId(presetId);
  };

  const cycleGradientPreset = () => {
    const idx = GRADIENT_PRESETS.findIndex((p) => p.id === gradientPresetId);
    const nextIdx = (idx + 1) % GRADIENT_PRESETS.length;
    setGradientPresetId(GRADIENT_PRESETS[nextIdx].id);
  };

  const changeBg3DMode = (modeId) => {
    setBg3DMode(modeId);
  };

  const cycleBg3DMode = () => {
    const idx = BG_3D_OPTIONS.findIndex((b) => b.id === bg3DMode);
    const nextIdx = (idx + 1) % BG_3D_OPTIONS.length;
    setBg3DMode(BG_3D_OPTIONS[nextIdx].id);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
        gradientPreset: currentGradient,
        gradientPresetId,
        changeGradientPreset,
        cycleGradientPreset,
        allGradientPresets: GRADIENT_PRESETS,
        bg3DMode,
        currentBg3D,
        changeBg3DMode,
        cycleBg3DMode,
        allBg3DOptions: BG_3D_OPTIONS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
