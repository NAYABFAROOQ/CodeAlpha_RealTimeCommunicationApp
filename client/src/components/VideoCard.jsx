import React, { useRef, useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  VideoOff,
  Pin,
  PinOff,
  Crown,
  Monitor,
  MoreVertical,
  VolumeX,
  UserX,
  Sparkles,
  Shield,
  Wifi,
} from 'lucide-react';

export const VideoCard = ({
  stream,
  name,
  isLocal = false,
  isHost = false,
  isMuted = false,
  isVideoOff = false,
  isSpeaking = false,
  isScreenSharing = false,
  isPinned = false,
  onTogglePin,
  currentUserIsHost = false,
  onHostMute,
  onHostKick,
  peerId,
  socketId,
}) => {
  const videoRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Attach MediaStream to the video DOM element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Helper to pick avatar image based on name
  const getAvatarPhoto = () => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('nayab')) return '/avatars/nayab.jpg';
    if (lower.includes('sarah')) return '/avatars/sarah.jpg';
    if (lower.includes('david') || lower.includes('alex')) return '/avatars/david.jpg';
    return '/avatars/nayab.jpg'; // default high-res photo
  };

  return (
    <div
      className={`relative w-full h-full rounded-2xl overflow-hidden pastel-card transition-all duration-300 group shadow-xl ${
        isSpeaking
          ? 'active-speaker-pastel border-pastel-lavender/80 ring-2 ring-pastel-lavender/40'
          : 'border-pastel-lavender/15 hover:border-pastel-lavender/35'
      } ${isPinned ? 'ring-2 ring-pastel-mint' : ''}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isVideoOff ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      />

      {/* Fallback Portrait Photo Card when Camera is Off */}
      {isVideoOff && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50/90 via-sky-50/80 to-purple-100/70 dark:from-[#121829] dark:via-[#161e33] dark:to-[#111728] relative overflow-hidden transition-colors">
          {/* Ambient soft pastel halo */}
          <div className="absolute w-44 h-44 rounded-full bg-purple-300/25 dark:bg-pastel-lavender/15 blur-3xl pointer-events-none" />
          <div className="absolute w-36 h-36 rounded-full bg-emerald-300/20 dark:bg-pastel-mint/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Real Avatar Photo with animated speaking ring */}
            <div className="relative">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-1 bg-gradient-to-tr from-purple-500 via-sky-400 to-emerald-400 shadow-xl">
                <img
                  src={getAvatarPhoto()}
                  alt={name}
                  className="w-full h-full rounded-full object-cover shadow-inner"
                />
              </div>

              {/* Speaking animated halo */}
              {isSpeaking && (
                <span className="absolute -inset-2 rounded-full border-2 border-purple-500 dark:border-pastel-lavender animate-ping opacity-60" />
              )}

              {/* Status Dot */}
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121829] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
              {isLocal ? `${name} (You)` : name}
              {isHost && <Crown className="w-3.5 h-3.5 text-amber-500 dark:text-pastel-peach" />}
            </p>

            <span className="mt-1 text-[11px] font-medium text-purple-700 dark:text-pastel-lavender/90 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-400/20">
              <VideoOff className="w-3 h-3 text-rose-500 dark:text-pastel-coral" /> Camera Off
            </span>
          </div>
        </div>
      )}

      {/* Screen Sharing Visual Badge */}
      {isScreenSharing && (
        <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-purple-500/25 backdrop-blur-md border border-white/20">
          <Monitor className="w-3.5 h-3.5 animate-pulse text-pastel-mint" />
          <span>Presenting Screen</span>
        </div>
      )}

      {/* Top Right Controls: Pin & Host Menu */}
      <div className="absolute top-3 right-3 flex items-center space-x-1.5 opacity-90 group-hover:opacity-100 transition-opacity z-10">
        {onTogglePin && (
          <button
            onClick={onTogglePin}
            title={isPinned ? 'Unpin video' : 'Pin to spotlight'}
            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
              isPinned
                ? 'bg-pastel-lavender text-slate-900 shadow-md font-bold'
                : 'bg-black/50 hover:bg-black/70 text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Host action dropdown on remote peers */}
        {currentUserIsHost && !isLocal && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-slate-300 hover:text-white border border-white/10 transition-all"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 pastel-dropdown rounded-2xl py-1.5 z-30 animate-in fade-in zoom-in-95 border border-pastel-lavender/25 shadow-xl">
                <button
                  onClick={() => {
                    onHostMute?.(socketId);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-pastel-peach hover:bg-purple-500/10 flex items-center gap-2 transition-colors"
                >
                  <VolumeX className="w-3.5 h-3.5" /> Mute Participant
                </button>
                <button
                  onClick={() => {
                    onHostKick?.(peerId, socketId);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-pastel-coral hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                >
                  <UserX className="w-3.5 h-3.5" /> Remove from Call
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Info Bar: Photo Icon, Name, Badges, Visual Audio Waves */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-black/65 backdrop-blur-md border border-white/10 text-white text-xs max-w-[80%] shadow-lg">
          {/* Mini Photo Thumbnail */}
          <img
            src={getAvatarPhoto()}
            alt=""
            className="w-4 h-4 rounded-full object-cover ring-1 ring-pastel-lavender/50 shrink-0"
          />

          <span className="font-semibold truncate tracking-tight">
            {isLocal ? `${name} (You)` : name}
          </span>

          {isHost && (
            <Crown className="w-3.5 h-3.5 text-pastel-peach shrink-0" title="Meeting Host" />
          )}

          {/* Animated 4-Bar Pastel Audio Equalizer when speaking */}
          {isSpeaking && (
            <div className="flex items-end space-x-0.5 ml-1 h-3.5" title="Speaking">
              <span className="w-0.5 h-2 bg-pastel-lavender rounded-full animate-bounce" />
              <span className="w-0.5 h-3.5 bg-pastel-mint rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-0.5 h-2.5 bg-pastel-sky rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-0.5 h-3 bg-pastel-peach rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
          )}
        </div>

        {/* Mic Status Badge */}
        <div
          className={`p-2 rounded-xl backdrop-blur-md border border-white/10 flex items-center justify-center pointer-events-auto shadow-md transition-transform hover:scale-105 ${
            isMuted
              ? 'bg-rose-600/90 text-white'
              : 'bg-black/65 text-pastel-mint'
          }`}
          title={isMuted ? 'Muted' : 'Microphone Active'}
        >
          {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </div>
      </div>
    </div>
  );
};
