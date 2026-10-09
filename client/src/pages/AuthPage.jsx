import React, { useState } from 'react';
import {
  Key,
  Mail,
  User,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  LogIn,
  UserPlus,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage = ({ onNavigate, onSuccess }) => {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, guestLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      onSuccess?.();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGuest = async () => {
    try {
      await guestLogin('Guest Participant');
      onSuccess?.();
    } catch (err) {
      setErrorMsg(err.message || 'Guest login failed');
    }
  };

  const fillNayabCredentials = () => {
    setEmail('nayab.farooq@codealpha.io');
    setPassword('NayabFarooq@2026');
    setUsername('Nayab Farooq');
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 peach-dynamic-mesh peach-dots overflow-hidden">
      {/* Peach Ambient Glow Orbs */}
      <div className="peach-orb orb-peach-sun w-[460px] h-[460px] -top-24 -left-24 opacity-75" />
      <div className="peach-orb orb-peach-rose w-[440px] h-[440px] -bottom-24 -right-24 opacity-70" />

      <div className="w-full max-w-md peach-card rounded-3xl p-6 sm:p-8 border border-orange-200/60 dark:border-orange-500/25 shadow-2xl relative select-none z-10">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('landing')}
          className="absolute top-6 left-6 p-2 rounded-xl text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-white hover:bg-orange-100/50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center pt-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-400 p-[1.5px] mx-auto mb-3 shadow-lg shadow-orange-500/25">
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#120e14] flex items-center justify-center">
              <Key className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {tab === 'login' ? 'Welcome to AuraMeet' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Engineered by <span className="text-orange-600 dark:text-orange-400 font-semibold">Nayab Farooq</span> • CodeAlpha RTC
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white/60 dark:bg-slate-900/90 rounded-2xl border border-orange-200/50 dark:border-orange-500/20 mb-6">
          <button
            onClick={() => {
              setTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Nayab Farooq"
                  className="w-full bg-white dark:bg-slate-900/90 border border-orange-200 dark:border-orange-500/25 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors shadow-inner"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-white dark:bg-slate-900/90 border border-orange-200 dark:border-orange-500/25 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Password</label>
            <div className="relative flex items-center">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                className="w-full bg-white dark:bg-slate-900/90 border border-orange-200 dark:border-orange-500/25 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl btn-peach-primary font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {tab === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{loading ? 'Processing...' : tab === 'login' ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>

        {/* Quick Demo Credentials & Guest Mode */}
        <div className="mt-6 pt-5 border-t border-orange-200/50 dark:border-orange-500/20 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={fillNayabCredentials}
              type="button"
              className="flex-1 py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-orange-200 dark:border-orange-500/25 text-[11px] font-semibold text-orange-700 dark:text-orange-300 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <img
                src="/avatars/nayab.jpg"
                alt="Nayab Farooq"
                className="w-4 h-4 rounded-full object-cover ring-1 ring-orange-400/40"
              />
              <span>Nayab Profile</span>
            </button>

            <button
              onClick={handleQuickGuest}
              type="button"
              className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Guest</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
