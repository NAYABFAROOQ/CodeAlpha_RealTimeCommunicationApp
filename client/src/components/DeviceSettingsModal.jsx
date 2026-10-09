import React, { useRef, useEffect } from 'react';
import { Settings, Mic, Video, X, Check } from 'lucide-react';

export const DeviceSettingsModal = ({
  isOpen,
  onClose,
  audioDevices = [],
  videoDevices = [],
  selectedAudioId,
  selectedVideoId,
  onSwitchAudio,
  onSwitchVideo,
  audioLevel = 0,
  localStream,
}) => {
  const previewVideoRef = useRef(null);

  useEffect(() => {
    if (previewVideoRef.current && localStream) {
      previewVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg glass-dropdown rounded-3xl p-6 border border-white/10 shadow-2xl relative select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Audio & Video Settings</h2>
              <p className="text-xs text-slate-400">Choose devices and test your hardware</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-5">
          {/* Camera Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Video className="w-4 h-4 text-cyan-400" /> Camera
            </label>
            <select
              value={selectedVideoId}
              onChange={(e) => onSwitchVideo(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {videoDevices.length === 0 ? (
                <option value="">Default Camera / Built-in</option>
              ) : (
                videoDevices.map((device, idx) => (
                  <option key={device.deviceId || idx} value={device.deviceId}>
                    {device.label || `Camera ${idx + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Microphone Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Mic className="w-4 h-4 text-cyan-400" /> Microphone
            </label>
            <select
              value={selectedAudioId}
              onChange={(e) => onSwitchAudio(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {audioDevices.length === 0 ? (
                <option value="">Default Microphone / Built-in</option>
              ) : (
                audioDevices.map((device, idx) => (
                  <option key={device.deviceId || idx} value={device.deviceId}>
                    {device.label || `Microphone ${idx + 1}`}
                  </option>
                ))
              )}
            </select>

            {/* Live Audio Level Meter */}
            <div className="pt-2">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Input Level</span>
                <span className="font-mono">{audioLevel}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-75"
                  style={{ width: `${Math.min(100, audioLevel * 1.5)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Video Preview */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">Video Preview</span>
            <div className="w-full h-36 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative">
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Done
          </button>
        </div>
      </div>
    </div>
  );
};
