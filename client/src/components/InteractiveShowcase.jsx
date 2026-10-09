import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  PenTool,
  Users,
  FileUp,
  Play,
  Pause,
  Maximize2,
  Sparkles,
  ShieldCheck,
  Award,
  Mic,
  MicOff,
  Video,
  Volume2,
  RefreshCw,
  Download,
  Eraser,
  CheckCircle2,
  Share2,
  Zap,
} from 'lucide-react';

export const InteractiveShowcase = () => {
  const [activeTab, setActiveTab] = useState('screenshare'); // 'screenshare' | 'whiteboard' | 'videogrid' | 'transfer'
  const [isPaused, setIsPaused] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#fb923c'); // Radiant Peach
  const [brushSize, setBrushSize] = useState(3);
  const [transferProgress, setTransferProgress] = useState(68);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  // Auto-tour tab cycler (pauses if user interacts)
  const [autoTour, setAutoTour] = useState(false);
  useEffect(() => {
    if (!autoTour) return;
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        if (prev === 'screenshare') return 'whiteboard';
        if (prev === 'whiteboard') return 'videogrid';
        if (prev === 'videogrid') return 'transfer';
        return 'screenshare';
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [autoTour]);

  // Live file transfer animation
  useEffect(() => {
    if (activeTab !== 'transfer') return;
    const interval = setInterval(() => {
      setTransferProgress((prev) => {
        if (prev >= 100) return 32;
        return prev + 4;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Interactive Whiteboard Canvas setup
  useEffect(() => {
    if (activeTab !== 'whiteboard') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Set high DPI scale
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw some initial decorative pastel sketches
    ctx.strokeStyle = '#c4b5fd';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(80, 70, 35, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#6ee7b7';
    ctx.beginPath();
    ctx.moveTo(130, 70);
    ctx.lineTo(210, 70);
    ctx.stroke();

    ctx.strokeStyle = '#fed7aa';
    ctx.strokeRect(230, 45, 80, 50);

    ctx.font = '12px Outfit, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Live WebRTC Canvas (Try drawing here!)', 50, 140);
  }, [activeTab]);

  // Whiteboard drawing handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    isDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushSize;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Add floating reaction
  const triggerReaction = (emoji) => {
    const id = Date.now() + Math.random();
    setReactions((prev) => [...prev, { id, emoji, x: 20 + Math.random() * 60 }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2000);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden peach-card border border-orange-200/50 dark:border-orange-500/20 p-3 shadow-2xl">
      {/* Top delicate peach gradient bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-rose-500 to-amber-400" />

      {/* Feature Screening Mode Switcher Tabs */}
      <div className="mb-2.5 flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center space-x-1 bg-stone-950/70 p-1 rounded-2xl border border-orange-500/15">
          <button
            onClick={() => setActiveTab('screenshare')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'screenshare'
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-orange-400" />
            <span>Screen Share</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('whiteboard')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'whiteboard'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span>Whiteboard</span>
          </button>

          <button
            onClick={() => setActiveTab('videogrid')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'videogrid'
                ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-rose-400" />
            <span>4K Video Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('transfer')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'transfer'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <FileUp className="w-3.5 h-3.5 text-amber-300" />
            <span>P2P Data</span>
          </button>
        </div>

        {/* Live Status indicator */}
        <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-stone-900/80 border border-orange-500/20 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-stone-300 font-mono">1080p 60FPS</span>
        </div>
      </div>

      {/* Main Screening Display Container */}
      <div className="rounded-2xl overflow-hidden bg-[#0a0e1a] border border-pastel-lavender/25 aspect-[16/10] sm:aspect-[4/3] flex flex-col relative select-none">
        {/* Screening Window Header */}
        <div className="h-9 px-3.5 bg-slate-900/90 border-b border-pastel-lavender/15 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pastel-coral/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-pastel-peach/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-pastel-mint/80" />
            <span className="ml-2 font-mono text-[11px] text-pastel-lavender font-semibold truncate">
              {activeTab === 'screenshare' && '🔴 live-screening // Nayab Farooq (Presenter)'}
              {activeTab === 'whiteboard' && '🎨 shared-canvas // Multi-Peer Collaborative'}
              {activeTab === 'videogrid' && '👥 webrtc-mesh // 4 Peers Connected (Zero Latency)'}
              {activeTab === 'transfer' && '⚡ datachannel // Direct P2P File Transmission'}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[10px]">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-pastel-mint font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pastel-mint" />
              Ultra HD
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: REAL-TIME SCREEN SHARING BROADCAST */}
        {/* ============================================================== */}
        {activeTab === 'screenshare' && (
          <div className="flex-1 relative bg-[#070b14] p-3 flex flex-col justify-between overflow-hidden">
            {/* Top Overlay Banner: Presenter Info */}
            <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-pastel-sky/30 shadow-md">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[11px] font-bold text-white">Nayab Farooq is Sharing Screen</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-pastel-sky font-mono">
                  1080p 60fps
                </span>
              </div>
              <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono">
                <span className="text-pastel-mint">Bitrate: 5.4 Mbps</span>
                <span className="text-pastel-lavender">Latency: 14ms</span>
                <span className="text-pastel-peach">Loss: 0.0%</span>
              </div>
            </div>

            {/* Simulated Live Broadcasted Application Screen */}
            <div className="flex-1 my-2 rounded-xl bg-[#0d1322] border border-pastel-lavender/20 p-3.5 relative overflow-hidden flex flex-col justify-between shadow-inner">
              {/* Animated Floating Virtual Cursor */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-float-slow z-20 flex items-center space-x-1">
                <svg
                  className="w-5 h-5 text-pastel-lavender drop-shadow-md -rotate-45"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 3l7 18 3-7 7-3L3 3z" />
                </svg>
                <span className="px-1.5 py-0.5 rounded-md bg-purple-500/80 text-white text-[9px] font-bold shadow">
                  Nayab Farooq
                </span>
              </div>

              {/* Code / Architecture Window Content */}
              <div className="space-y-2 font-mono text-[11px] text-slate-300">
                <div className="flex items-center space-x-2 text-pastel-lavender">
                  <Sparkles className="w-3.5 h-3.5 text-pastel-mint" />
                  <span className="font-semibold text-xs text-white">AuraMeet WebRTC Pipeline Engine</span>
                  <span className="text-[10px] text-slate-500">// Native RTCPeerConnection Mesh</span>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-[10px] leading-relaxed text-slate-300 space-y-1">
                  <p>
                    <span className="text-pastel-coral">const</span>{' '}
                    <span className="text-pastel-sky">peerConnection</span> ={' '}
                    <span className="text-pastel-peach">new RTCPeerConnection</span>(rtcConfig);
                  </p>
                  <p>
                    <span className="text-pastel-sky">screenStream</span>.getVideoTracks()[
                    <span className="text-purple-300">0</span>].
                    <span className="text-pastel-mint">replaceTrack</span>(activeSender);
                  </p>
                  <p className="text-emerald-400">
                    // Real-time 60FPS screen stream broadcasting to all peers with zero degradation
                  </p>
                </div>

                {/* Animated Spectrum Waveform */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-sans">
                      Audio Stream Quality:
                    </span>
                    <div className="flex items-end space-x-0.5 h-3">
                      <span className="w-1 h-3 bg-pastel-mint rounded-full animate-bounce" />
                      <span className="w-1 h-2 bg-pastel-sky rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-1 h-3.5 bg-pastel-lavender rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1 h-1.5 bg-pastel-peach rounded-full animate-bounce [animation-delay:0.3s]" />
                      <span className="w-1 h-3 bg-pastel-mint rounded-full animate-bounce [animation-delay:0.15s]" />
                    </div>
                  </div>
                  <span className="text-[9px] text-pastel-mint font-semibold">Opus 48kHz Stereo</span>
                </div>
              </div>

              {/* Bottom Screening Tool Dock */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-[10px]">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-medium">
                    Screen: Entire Display 1
                  </span>
                  <span className="text-pastel-mint flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-pastel-mint" /> System Audio Shared
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-pastel-lavender font-bold">
                    HD Broadcast Active
                  </span>
                </div>
              </div>
            </div>

            {/* Picture-in-Picture (PIP) Presenter Webcam Card */}
            <div className="absolute bottom-4 right-4 w-28 sm:w-32 rounded-2xl bg-slate-900/95 border-2 border-pastel-lavender/60 p-1.5 shadow-2xl backdrop-blur-md active-speaker-pastel z-30">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-black">
                <img
                  src="/avatars/nayab.jpg"
                  alt="Nayab Farooq"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 px-1 rounded bg-black/60 text-[8px] font-bold text-white flex items-center gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-pastel-mint animate-pulse" /> Presenter
                </div>
                <div className="absolute bottom-1 right-1 flex items-end space-x-0.5 h-2">
                  <span className="w-0.5 h-1.5 bg-pastel-mint rounded-full animate-bounce" />
                  <span className="w-0.5 h-2 bg-pastel-lavender rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-0.5 h-1.5 bg-pastel-sky rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-200 mt-1 truncate text-center">
                Nayab Farooq
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: INTERACTIVE COLLABORATIVE WHITEBOARD */}
        {/* ============================================================== */}
        {activeTab === 'whiteboard' && (
          <div className="flex-1 relative bg-[#090e1c] flex flex-col justify-between overflow-hidden p-2.5">
            {/* Whiteboard Toolbar */}
            <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-pastel-lavender/25 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-pastel-mint" />
                  Interactive Canvas
                </span>
                <span className="text-[9px] text-slate-400 hidden sm:inline">(Draw directly with your mouse!)</span>
              </div>

              {/* Pastel Color Swatches */}
              <div className="flex items-center space-x-1.5">
                {[
                  { color: '#c4b5fd', name: 'Lavender' },
                  { color: '#6ee7b7', name: 'Mint' },
                  { color: '#fed7aa', name: 'Peach' },
                  { color: '#7dd3fc', name: 'Sky' },
                  { color: '#fda4af', name: 'Coral' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setSelectedColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      selectedColor === c.color ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.name}
                  />
                ))}

                <div className="h-3 w-px bg-slate-700 mx-1" />

                <button
                  onClick={clearCanvas}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Interactive Drawing Canvas */}
            <div className="flex-1 my-2 rounded-xl bg-[#0c1222] border border-pastel-lavender/20 relative cursor-crosshair overflow-hidden shadow-inner">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-full block"
              />

              {/* Live Collaborative Participant Badges */}
              <div className="absolute bottom-2 left-2 flex items-center space-x-2 pointer-events-none">
                <div className="px-2 py-1 rounded-full bg-slate-900/90 border border-pastel-lavender/30 text-[9px] text-pastel-lavender font-bold flex items-center gap-1 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-pastel-lavender" />
                  Nayab Farooq Drawing
                </div>
                <div className="px-2 py-1 rounded-full bg-slate-900/90 border border-pastel-mint/30 text-[9px] text-pastel-mint font-bold flex items-center gap-1 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-pastel-mint" />
                  Sarah Chen Joined
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: 4-WAY WEBRTC VIDEO GRID WITH REAL PORTRAIT PHOTOS */}
        {/* ============================================================== */}
        {activeTab === 'videogrid' && (
          <div className="flex-1 relative bg-[#090e1c] p-2.5 flex flex-col justify-between overflow-hidden">
            {/* 4-Participant Grid */}
            <div className="flex-1 grid grid-cols-2 gap-2 relative">
              {/* Floating Emojis */}
              {reactions.map((r) => (
                <div
                  key={r.id}
                  style={{ left: `${r.x}%` }}
                  className="absolute bottom-8 text-2xl pointer-events-none animate-bubble z-40"
                >
                  {r.emoji}
                </div>
              ))}

              {/* Peer 1: Nayab Farooq (Host) */}
              <div className="rounded-xl bg-gradient-to-br from-[#121828] to-[#0f1422] border-2 border-pastel-lavender/60 p-2 flex flex-col justify-between relative overflow-hidden active-speaker-pastel shadow-lg">
                <div className="flex justify-between items-center text-[10px] text-pastel-lavender font-bold">
                  <span className="flex items-center gap-1">
                    Nayab Farooq
                    <span className="px-1.5 py-0.2 rounded-full bg-pastel-peach/20 text-pastel-peach text-[8px]">
                      Host
                    </span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-pastel-mint animate-ping" />
                </div>

                <div className="relative mx-auto my-auto">
                  <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-pastel-lavender via-pastel-sky to-pastel-mint shadow-md">
                    <img
                      src="/avatars/nayab.jpg"
                      alt="Nayab Farooq"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] text-pastel-mint font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pastel-mint" /> Speaking
                  </span>
                  <div className="flex items-end space-x-0.5 h-2.5">
                    <span className="w-0.5 h-2 bg-pastel-lavender rounded-full animate-bounce" />
                    <span className="w-0.5 h-2.5 bg-pastel-mint rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-0.5 h-1.5 bg-pastel-sky rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>

              {/* Peer 2: Sarah Chen (UX Lead) */}
              <div className="rounded-xl bg-[#0f1526] border border-pastel-lavender/25 p-2 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] text-slate-300 font-semibold">
                  <span>Sarah Chen</span>
                  <span className="text-[8px] text-pastel-lavender">UX Lead</span>
                </div>

                <div className="relative mx-auto my-auto">
                  <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-pastel-lavender to-pastel-peach shadow-md">
                    <img
                      src="/avatars/sarah.jpg"
                      alt="Sarah Chen"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pastel-mint" /> Connected
                  </span>
                  <Mic className="w-3 h-3 text-pastel-mint" />
                </div>
              </div>

              {/* Peer 3: David Kim (Backend) */}
              <div className="rounded-xl bg-[#0f1526] border border-pastel-lavender/25 p-2 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] text-slate-300 font-semibold">
                  <span>David Kim</span>
                  <span className="text-[8px] text-pastel-sky">Backend</span>
                </div>

                <div className="relative mx-auto my-auto">
                  <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-pastel-sky to-pastel-mint shadow-md">
                    <img
                      src="/avatars/david.jpg"
                      alt="David Kim"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pastel-mint" /> Connected
                  </span>
                  <Mic className="w-3 h-3 text-pastel-mint" />
                </div>
              </div>

              {/* Peer 4: Maya Patel (Systems) */}
              <div className="rounded-xl bg-[#0f1526] border border-pastel-lavender/25 p-2 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] text-slate-300 font-semibold">
                  <span>Maya Patel</span>
                  <span className="text-[8px] text-pastel-coral">Systems</span>
                </div>

                <div className="relative mx-auto my-auto">
                  <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-pastel-peach to-pastel-coral shadow-md">
                    <img
                      src="/avatars/maya.jpg"
                      alt="Maya Patel"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pastel-mint" /> Connected
                  </span>
                  <Mic className="w-3 h-3 text-pastel-mint" />
                </div>
              </div>
            </div>

            {/* Interactive Emoji Reaction Bar */}
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Click reaction to test:</span>
              <div className="flex items-center space-x-1.5">
                {['🔥', '👏', '🚀', '💡', '❤️'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => triggerReaction(emoji)}
                    className="p-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-sm hover:scale-125 transition-transform border border-pastel-lavender/20"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: P2P DATACHANNELS FILE TRANSFER & MEETING NOTES */}
        {/* ============================================================== */}
        {activeTab === 'transfer' && (
          <div className="flex-1 relative bg-[#090e1c] p-3 flex flex-col justify-between overflow-hidden">
            <div className="space-y-3">
              {/* File Transfer Card */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-pastel-peach/30 shadow-md space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-pastel-peach flex items-center justify-center font-bold">
                      <FileUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-[11px]">AuraMeet_Product_Roadmap_2026.fig</p>
                      <p className="text-[9px] text-slate-400">28.4 MB • Sent by Nayab Farooq</p>
                    </div>
                  </div>
                  <span className="font-mono text-pastel-peach font-bold text-xs">{transferProgress}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${transferProgress}%` }}
                    className="h-full bg-gradient-to-r from-pastel-peach via-pastel-coral to-pastel-lavender transition-all duration-300"
                  />
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>Speed: 42.8 MB/s (Direct RTCDataChannel)</span>
                  <span className="text-pastel-mint">SHA-256 Verified ✓</span>
                </div>
              </div>

              {/* Shared Collaborative Meeting Notes */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-pastel-lavender/25 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-pastel-mint" />
                    Synchronized Meeting Notes
                  </span>
                  <span className="text-[9px] text-pastel-mint">Live Synced</span>
                </div>

                <ul className="text-[10px] text-slate-300 space-y-1 list-disc list-inside">
                  <li>Task 4 Full-Stack Real-Time Communication App completed.</li>
                  <li>Multi-peer 4K WebRTC video mesh with STUN server relay.</li>
                  <li>Instant screen share with native track replacement.</li>
                  <li className="text-pastel-lavender font-semibold">
                    Interactive synchronized pastel whiteboard & chunked P2P files.
                  </li>
                </ul>
              </div>
            </div>

            {/* Security Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-pastel-mint">
                <ShieldCheck className="w-3.5 h-3.5" /> End-to-End DTLS Encrypted
              </span>
              <span className="text-slate-500">Zero Server Storage Required</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Feature Badges */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px]">
        <button
          type="button"
          onClick={() => setActiveTab('screenshare')}
          className={`p-2 rounded-xl cursor-pointer transition-all font-semibold flex items-center justify-center gap-1 shadow-xs ${
            activeTab === 'screenshare'
              ? 'bg-orange-500/20 text-orange-600 dark:text-orange-300 border border-orange-500/50 font-bold ring-1 ring-orange-400/30'
              : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 border border-stone-800'
          }`}
        >
          <Monitor className="w-3 h-3 text-orange-500" />
          <span>Screen Share</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('whiteboard')}
          className={`p-2 rounded-xl cursor-pointer transition-all font-semibold flex items-center justify-center gap-1 shadow-xs ${
            activeTab === 'whiteboard'
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/50 font-bold ring-1 ring-amber-400/30'
              : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 border border-stone-800'
          }`}
        >
          <PenTool className="w-3 h-3 text-amber-500" />
          <span>Whiteboard</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('videogrid')}
          className={`p-2 rounded-xl cursor-pointer transition-all font-semibold flex items-center justify-center gap-1 shadow-xs ${
            activeTab === 'videogrid'
              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/50 font-bold ring-1 ring-rose-400/30'
              : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 border border-stone-800'
          }`}
        >
          <Users className="w-3 h-3 text-rose-500" />
          <span>4-Way Video</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transfer')}
          className={`p-2 rounded-xl cursor-pointer transition-all font-semibold flex items-center justify-center gap-1 shadow-xs ${
            activeTab === 'transfer'
              ? 'bg-orange-600/20 text-orange-700 dark:text-orange-300 border border-orange-600/50 font-bold ring-1 ring-orange-500/30'
              : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 border border-stone-800'
          }`}
        >
          <FileUp className="w-3 h-3 text-orange-500" />
          <span>P2P Data</span>
        </button>
      </div>
    </div>
  );
};
