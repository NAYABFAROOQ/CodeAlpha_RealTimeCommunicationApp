import React, { useState } from 'react';
import {
  Video,
  Plus,
  ArrowRight,
  Shield,
  Monitor,
  PenTool,
  FileUp,
  Sparkles,
  Lock,
  Users,
  Award,
  Radio,
  FileText,
  CheckCircle,
  Wifi,
  Laptop,
  Flame,
  Waves,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePWA } from '../context/PWAContext';
import { Interactive3DBackground } from '../components/Interactive3DBackground';
import { TiltCard } from '../components/TiltCard';
import { GradientBar } from '../components/GradientBar';
import { Bg3DBar } from '../components/Bg3DBar';
import { InteractiveShowcase } from '../components/InteractiveShowcase';

export const LandingPage = ({ onJoinRoom, onNavigate }) => {
  const { user, isAuthenticated, guestLogin } = useAuth();
  const { gradientPreset, cycleGradientPreset, currentBg3D, cycleBg3DMode } = useTheme();
  const { setShowInstallModal, isInstalled } = usePWA();
  const [joinCode, setJoinCode] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingPasscode, setMeetingPasscode] = useState('');
  const [guestName, setGuestName] = useState(user?.username || 'Nayab Farooq');
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Instant Meeting Creation
  const handleCreateRoom = async (e) => {
    e?.preventDefault();
    setIsCreating(true);
    setErrorMsg('');

    try {
      let currentUser = user;
      const nameToUse = guestName.trim() || 'Nayab Farooq';
      if (!currentUser) {
        currentUser = await guestLogin(nameToUse);
      }

      const roomTitle = meetingTitle.trim() || 'Creative Collaboration Sync';
      const password = meetingPasscode.trim() || null;
      const generatedRoomId = 'cal-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6);

      // Try calling server API
      try {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('rtc_token')
              ? { Authorization: `Bearer ${localStorage.getItem('rtc_token')}` }
              : {}),
          },
          body: JSON.stringify({
            title: roomTitle,
            password,
            hostName: currentUser?.username || nameToUse,
          }),
        });

        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok && data?.room) {
            setShowCreateModal(false);
            onJoinRoom(data.room.roomId, {
              title: data.room.title,
              isHost: true,
              password,
            });
            return;
          }
        }
      } catch (networkErr) {
        console.warn('Backend API offline, using local client room store:', networkErr);
      }

      // Fallback for static hosting (e.g. Netlify) or when backend is unreachable
      const localRoom = {
        roomId: generatedRoomId,
        title: roomTitle,
        password,
        hasPassword: !!password,
        hostName: currentUser?.username || nameToUse,
        isHost: true,
        createdAt: new Date().toISOString(),
      };

      const savedRooms = JSON.parse(localStorage.getItem('aurameet_rooms') || '{}');
      savedRooms[generatedRoomId] = localRoom;
      localStorage.setItem('aurameet_rooms', JSON.stringify(savedRooms));

      setShowCreateModal(false);
      onJoinRoom(generatedRoomId, {
        title: roomTitle,
        isHost: true,
        password,
      });
    } catch (err) {
      console.error('Room start error:', err);
      // Guarantee the meeting ALWAYS starts smoothly
      const fallbackId = 'cal-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6);
      setShowCreateModal(false);
      onJoinRoom(fallbackId, {
        title: meetingTitle.trim() || 'AuraMeet Space',
        isHost: true,
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Joining Existing Room
  const handleJoinExisting = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    let code = joinCode.trim();
    if (code.includes('room=')) {
      code = code.split('room=')[1].split('&')[0];
    } else if (code.includes('/')) {
      code = code.substring(code.lastIndexOf('/') + 1);
    }

    if (!user) {
      const nameToUse = guestName.trim() || 'Nayab Farooq';
      await guestLogin(nameToUse).catch(() => {});
    }

    onJoinRoom(code);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between px-4 md:px-8 py-6 md:py-10 max-w-7xl mx-auto peach-dynamic-mesh peach-dots overflow-hidden">
      {/* ======================================================== */}
      {/* 3D INTERACTIVE VISUALS AT THE BACKGROUND (NO GLOBE!)      */}
      {/* ======================================================== */}
      <Interactive3DBackground />

      {/* Foreground Content Grid */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center my-auto relative z-10 pointer-events-none">
        {/* Left Column: Title, Atmosphere Bar & Action Controls */}
        <div className="lg:col-span-6 space-y-6 text-left pointer-events-auto">
          {/* Creator Attribution & Peach 3D Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-100/90 dark:bg-orange-500/20 border border-orange-200/80 dark:border-orange-500/30 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-stone-600 dark:text-stone-300">Engineered by</span>
              <span className="text-orange-700 dark:text-orange-300 font-bold flex items-center gap-1">
                Nayab Farooq
                <Award className="w-3.5 h-3.5 text-amber-500" />
              </span>
              <span className="text-stone-400 dark:text-stone-600">•</span>
              <span className="text-rose-600 dark:text-rose-300 font-medium">CodeAlpha Task 4</span>
            </div>

            <button
              type="button"
              onClick={cycleBg3DMode}
              title={`Active: ${currentBg3D.name} (${currentBg3D.tagline}). Click to switch 3D Visual!`}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-stone-900/80 hover:bg-orange-50 dark:hover:bg-stone-800 border border-orange-200/60 dark:border-orange-400/25 text-[11px] font-bold text-orange-700 dark:text-orange-300 shadow-sm transition-all cursor-pointer active:scale-95 group"
            >
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>3D: {currentBg3D.icon} {currentBg3D.name}</span>
              <span className="text-[10px] text-orange-500 font-mono group-hover:rotate-45 transition-transform">↻</span>
            </button>
          </div>

          {/* Headline: High Contrast, Sharp & 100% Readable (NO PURPLE, NO BLUE) */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
            <span className="text-hero-brand drop-shadow-sm">AuraMeet.</span>{' '}
            <span className="text-peach-gradient block sm:inline">
              Pure Clarity in 3D.
            </span>
            <span className="block text-stone-700 dark:text-stone-200 text-2xl sm:text-3xl lg:text-4xl font-normal mt-2">
              Interactive Spatial Collaboration.
            </span>
          </h1>

          <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
            Ultra-low latency HD WebRTC mesh conferencing with live 1080p 60FPS screen sharing, an interactive synchronized whiteboard, and direct chunked P2P data channels.
          </p>

          {/* Interactive Atmosphere & 3D Background Options ("like clrs add 3d background options") */}
          <div className="pt-1 flex flex-col gap-2.5">
            <GradientBar compact={false} />
            <Bg3DBar compact={false} />
          </div>

          {/* Action Form (Create Meeting & Join) */}
          <div className="pt-2 space-y-3.5 max-w-md">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div>
              {/* Single Prominent Create Meeting Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full px-6 py-3.5 rounded-2xl btn-peach-primary font-bold text-sm flex items-center justify-center gap-2 group cursor-pointer shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                <span>Start Instant Meeting</span>
              </button>
            </div>

            {/* Guest Name & Join with Code Form */}
            <div className="space-y-2 pt-1">
              {!isAuthenticated && (
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium shrink-0">
                    Your Name:
                  </span>
                  <input
                    type="text"
                    placeholder="Nayab Farooq"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900/80 border border-orange-200 dark:border-orange-500/25 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-orange-500 transition-colors shadow-sm"
                  />
                </div>
              )}

              <form onSubmit={handleJoinExisting} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter meeting link or room code (e.g. cal-pqrs-tuv)..."
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-stone-900/80 border border-orange-200 dark:border-orange-500/25 text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-orange-500 transition-colors shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 disabled:opacity-40 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Join</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Live Studio & Collaboration Showcase Floating Above 3D Background */}
        <div className="lg:col-span-6 relative flex flex-col pointer-events-auto">
          {/* Top Label */}
          <div className="flex items-center justify-between mb-3 z-20">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-orange-200/50 dark:border-orange-500/20 shadow-sm text-xs font-semibold text-stone-800 dark:text-stone-200">
              <Monitor className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>Live Screening Studio</span>
            </div>

            <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
              <Sparkles className="w-3 h-3 text-orange-500 animate-spin" />
              <span>Live HD Mesh</span>
            </div>
          </div>

          {/* Interactive Feature Showcase with Frosted Glass */}
          <div className="peach-card rounded-3xl p-1.5 relative shadow-2xl overflow-hidden backdrop-blur-2xl">
            <InteractiveShowcase />
          </div>
        </div>
      </div>

      {/* Bottom Creator Spotlight Card */}
      <div className="mt-8 pt-6 border-t border-orange-200/60 dark:border-orange-500/15 relative z-10 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 dark:text-stone-400 gap-3">
        <div className="flex items-center space-x-3">
          <img
            src="/avatars/nayab.jpg"
            alt="Nayab Farooq"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-400/50 shadow-md"
          />
          <div>
            <span className="text-stone-800 dark:text-stone-200 font-bold">Crafted by Nayab Farooq</span>
            <span className="text-stone-500 dark:text-stone-400"> • Full Stack Web Development Intern</span>
          </div>
        </div>

        {/* Status Tag */}
        <div className="text-stone-500 dark:text-stone-400 text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">WebRTC Mesh Active</span>
        </div>
      </div>

      {/* Modal: Create Meeting Room Details */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md peach-dropdown rounded-3xl p-6 border border-orange-300/40 shadow-2xl relative select-none">
            {/* Top Close (X) Button */}
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-display font-bold text-stone-900 dark:text-white mb-1">Create Meeting Room</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-5">
              Configure room name, host details, and optional security passcodes
            </p>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Meeting Topic / Title
                </label>
                <input
                  type="text"
                  placeholder="Design & Architecture Review"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-stone-900 border border-orange-200 dark:border-orange-500/30 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-orange-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Host Name
                </label>
                <input
                  type="text"
                  placeholder="Nayab Farooq"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-stone-900 border border-orange-200 dark:border-orange-500/30 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-orange-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Room Passcode (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Leave empty for open room"
                    value={meetingPasscode}
                    onChange={(e) => setMeetingPasscode(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-stone-900 border border-orange-200 dark:border-orange-500/30 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-orange-600"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded-xl btn-peach-primary font-bold text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isCreating ? 'Creating Room...' : 'Start Meeting Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
