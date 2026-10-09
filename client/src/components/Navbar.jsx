import React from 'react';
import {
  Video,
  LogIn,
  LogOut,
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
  Laptop,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePWA } from '../context/PWAContext';


export const Navbar = ({ onNavigate, currentPage }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { setShowInstallModal, isInstalled } = usePWA();

  return (
    <nav className="h-16 px-4 md:px-8 peach-panel border-b border-orange-200/50 dark:border-orange-500/20 flex items-center justify-between select-none sticky top-0 z-40 shadow-sm transition-colors duration-300">
      {/* Brand & Creator Attribution */}
      <div
        onClick={() => onNavigate('landing')}
        className="flex items-center space-x-3 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-400 p-[1.5px] shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
          <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#18141d] flex items-center justify-center">
            <Video className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-display font-black text-lg tracking-tight text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              AuraMeet
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30 flex items-center gap-1 shadow-sm">
              <Flame className="w-2.5 h-2.5 text-orange-600 dark:text-orange-400" /> Peach 3D
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-stone-500 dark:text-stone-400">
            <span>By</span>
            <span className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
              Nayab Farooq
              <ShieldCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-400 inline" />
            </span>
          </div>
        </div>
      </div>



      {/* Right User Actions & Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* 1-Click Desktop App Install Button */}
        <button
          onClick={() => setShowInstallModal(true)}
          title="Install AuraMeet as a Desktop Application"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-stone-900/90 dark:hover:bg-stone-800 border border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-300 text-xs font-semibold transition-all shadow-sm group hover:scale-[1.02] cursor-pointer"
        >
          <Laptop className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 group-hover:animate-bounce" />
          <span className="hidden sm:inline">Desktop App</span>
          <span className="px-1.5 py-0.2 rounded-full bg-orange-200/70 dark:bg-orange-500/25 text-[9px] font-bold">
            {isInstalled ? 'Installed' : 'Install'}
          </span>
        </button>

        {/* Theme Switcher: Light ☀️ / Dark 🌙 */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
          className="p-2 rounded-xl bg-orange-50/80 hover:bg-orange-100 dark:bg-stone-900/80 dark:hover:bg-stone-800 border border-orange-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 transition-all shadow-sm cursor-pointer"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-orange-600" />
          )}
        </button>

        {/* Creator Photo Badge */}
        <div className="hidden lg:flex items-center space-x-2.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-amber-500/10 border border-orange-200/60 dark:border-orange-500/20 shadow-sm">
          <img
            src="/avatars/nayab.jpg"
            alt="Nayab Farooq"
            className="w-6 h-6 rounded-full object-cover ring-1 ring-orange-400/50 shadow-sm"
          />
          <div className="text-left leading-tight">
            <p className="text-[11px] font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1">
              Nayab Farooq
            </p>
            <p className="text-[9px] text-orange-600 dark:text-orange-400 font-medium">Lead Developer</p>
          </div>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900/80 border border-orange-200/60 dark:border-orange-500/20 shadow-sm">
              <img
                src={user.avatar || '/avatars/nayab.jpg'}
                alt={user.username}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-orange-400/40"
              />
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                {user.username}
              </span>
              {user.isGuest && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-50 dark:bg-stone-800 text-orange-700 dark:text-stone-400">
                  Guest
                </span>
              )}
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-stone-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-stone-900 border border-transparent transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('auth')}
            className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-xl btn-peach-primary font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Sign In / Register</span>
            <span className="sm:hidden">Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
};
