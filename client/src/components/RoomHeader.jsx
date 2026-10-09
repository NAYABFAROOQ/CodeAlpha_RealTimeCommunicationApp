import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Users,
  Shield,
  Clock,
  Wifi,
  Sparkles,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePWA } from '../context/PWAContext';

export const RoomHeader = ({
  roomTitle,
  roomId,
  participantCount,
  isHost,
  onOpenParticipants,
}) => {
  const [copied, setCopied] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { theme, toggleTheme, isDark } = useTheme();
  const { setShowInstallModal } = usePWA();

  // Meeting duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="h-16 px-4 md:px-6 pastel-panel border-b border-purple-200/50 dark:border-pastel-lavender/15 flex items-center justify-between select-none z-20 relative transition-colors duration-200">
      {/* Top subtle visual gradient line */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-purple-500 via-sky-500 to-emerald-400" />

      {/* Left: Room Title & ID */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-purple-500/25 relative">
          <span className="font-extrabold text-white text-xs">NF</span>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate max-w-[160px] md:max-w-xs">
              {roomTitle || 'AuraMeet Meeting'}
            </h1>
            {isHost && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-400/30 flex items-center gap-1 shadow-sm">
                <Shield className="w-2.5 h-2.5 text-purple-600 dark:text-pastel-lavender" /> Host
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              ID: <code className="text-purple-600 dark:text-pastel-lavender font-mono font-semibold tracking-wider">{roomId}</code>
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-[11px] text-purple-600 dark:text-purple-300 hidden md:inline">
              By Nayab Farooq
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Duration & Visual Connection Quality */}
      <div className="hidden sm:flex items-center space-x-4 bg-purple-50/80 dark:bg-slate-900/80 border border-purple-200/60 dark:border-slate-700/60 rounded-full px-4 py-1.5 shadow-sm">
        <div className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-pastel-lavender" />
          <span className="font-mono font-medium">{formatTime(elapsedTime)}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <Wifi className="w-3.5 h-3.5" />
          <span className="font-semibold text-[11px] text-emerald-700 dark:text-emerald-300">Ultra HD WebRTC</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2 md:space-x-2.5">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
          className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-slate-800/90 dark:hover:bg-slate-700 border border-purple-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all shadow-sm"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-purple-600" />
          )}
        </button>

        {/* Desktop App Button */}
        <button
          onClick={() => setShowInstallModal(true)}
          title="Install AuraMeet Desktop App"
          className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-slate-800/90 dark:hover:bg-slate-700 border border-purple-200 dark:border-slate-700 text-xs font-semibold text-purple-700 dark:text-pastel-lavender transition-all shadow-sm"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>App</span>
        </button>

        {/* Copy Invite Button */}
        <button
          onClick={copyInviteLink}
          title="Copy invite link to clipboard"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-xs font-semibold text-white transition-all shadow-sm"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-white" />
              <span className="hidden md:inline">Share</span>
            </>
          )}
        </button>

        {/* Participants count button */}
        <button
          onClick={onOpenParticipants}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-slate-800/90 dark:hover:bg-slate-700 border border-purple-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 transition-all shadow-sm"
        >
          <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>{participantCount}</span>
        </button>
      </div>
    </header>
  );
};
