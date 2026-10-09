import React, { useEffect, useRef } from 'react';
import {
  PenTool,
  Eraser,
  RotateCcw,
  Trash2,
  Download,
  X,
  Palette,
  Sparkles,
} from 'lucide-react';
import { exportCanvasToImage } from '../utils/canvasHelpers';

export const Whiteboard = ({ whiteboardState, onClose, roomTitle }) => {
  const {
    canvasRef,
    color,
    setColor,
    size,
    setSize,
    tool,
    setTool,
    startDrawing,
    draw,
    stopDrawing,
    clearWhiteboard,
    undoLastStroke,
    refreshCanvas,
  } = whiteboardState;

  const containerRef = useRef(null);

  // Curated Nordic Pastel Palette
  const pastelColors = [
    '#ffffff', // Pure White
    '#c4b5fd', // Pastel Lavender
    '#6ee7b7', // Pastel Mint
    '#fdba74', // Pastel Peach
    '#7dd3fc', // Pastel Sky
    '#f472b6', // Pastel Rose
    '#fef08a', // Pastel Butter
    '#38bdf8', // Vibrant Cyan
    '#1e293b', // Deep Slate
  ];

  const strokeSizes = [
    { label: 'Fine', value: 2 },
    { label: 'Medium', value: 4 },
    { label: 'Bold', value: 8 },
    { label: 'Heavy', value: 14 },
  ];

  // Set internal resolution of canvas to match physical display dimensions
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      if (Math.abs(canvas.width - rect.width * dpr) > 10) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        refreshCanvas();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef, refreshCanvas]);

  const handleDownload = () => {
    if (canvasRef.current) {
      exportCanvasToImage(canvasRef.current, `whiteboard-${roomTitle || 'room'}.png`);
    }
  };

  return (
    <div className="absolute inset-2 md:inset-6 z-30 flex flex-col rounded-3xl overflow-hidden pastel-card border border-pastel-lavender/30 shadow-2xl bg-[#0c101d]/95 animate-in fade-in zoom-in-95">
      {/* Header Bar */}
      <div className="h-14 px-4 md:px-6 bg-slate-900/90 border-b border-pastel-lavender/15 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-pastel-lavender flex items-center justify-center border border-purple-400/30">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <span className="font-display font-bold text-white text-sm md:text-base">
              Synchronized Canvas
            </span>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-pastel-mint/15 text-pastel-mint border border-pastel-mint/25">
            Live Shared
          </span>
        </div>

        {/* Toolbar Center */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Pen / Eraser toggle */}
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-xl transition-all ${
              tool === 'pen'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Pen Tool"
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-xl transition-all ${
              tool === 'eraser'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Eraser Tool"
          >
            <Eraser className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/10" />

          {/* Pastel Color Swatches */}
          {tool === 'pen' && (
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded-xl bg-slate-800/80 border border-white/5">
              {pastelColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-slate-900 shadow-md' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  title={`Color: ${c}`}
                />
              ))}
            </div>
          )}

          <div className="w-px h-5 bg-white/10 hidden md:block" />

          {/* Thickness selection */}
          <div className="hidden md:flex items-center space-x-1 px-2 py-1 rounded-xl bg-slate-800/80 border border-white/5">
            {strokeSizes.map((s) => (
              <button
                key={s.value}
                onClick={() => setSize(s.value)}
                className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${
                  size === s.value ? 'bg-pastel-lavender text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Undo */}
          <button
            onClick={undoLastStroke}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Undo stroke"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Clear */}
          <button
            onClick={() => {
              if (window.confirm('Clear the entire whiteboard for everyone?')) {
                clearWhiteboard();
              }
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-pastel-coral hover:bg-rose-500/10 transition-all"
            title="Clear canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Export PNG */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl text-slate-400 hover:text-pastel-mint hover:bg-emerald-500/10 transition-all"
            title="Export as PNG image"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          title="Close whiteboard"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Interactive Drawing Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full relative bg-[#0a0e1a] overflow-hidden select-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full whiteboard-canvas block"
        />
      </div>
    </div>
  );
};
