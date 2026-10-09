import React from 'react';
import {
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Crown,
  VolumeX,
  UserX,
  X,
  Shield,
  Sparkles,
} from 'lucide-react';

export const ParticipantsPanel = ({
  localUser,
  localMicEnabled,
  localVideoEnabled,
  peers,
  isHost,
  onHostMute,
  onHostKick,
  onHostMuteAll,
  onClose,
}) => {
  const remotePeersArray = Object.values(peers);
  const totalCount = 1 + remotePeersArray.length;

  const getParticipantPhoto = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('nayab')) return '/avatars/nayab.jpg';
    if (lower.includes('sarah')) return '/avatars/sarah.jpg';
    if (lower.includes('david') || lower.includes('alex')) return '/avatars/david.jpg';
    return '/avatars/nayab.jpg';
  };

  return (
    <aside className="w-80 md:w-96 h-full flex flex-col pastel-panel border-l border-pastel-lavender/15 select-none z-20 animate-in slide-in-from-right duration-200 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-pastel-lavender/15 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-pastel-lavender" />
          <h2 className="text-sm font-display font-bold text-white">Participants</h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-200 border border-purple-400/20">
            {totalCount}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Host Controls Action Bar */}
      {isHost && totalCount > 1 && (
        <div className="p-3 bg-slate-900/70 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs text-slate-400">Host quick actions:</span>
          <button
            onClick={onHostMuteAll}
            className="px-2.5 py-1 rounded-xl bg-pastel-peach/15 hover:bg-pastel-peach/25 text-pastel-peach border border-pastel-peach/30 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <MicOff className="w-3 h-3" /> Mute All
          </button>
        </div>
      )}

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Local User */}
        <div className="p-3 rounded-2xl pastel-card border-pastel-lavender/30 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="relative shrink-0">
              <img
                src={getParticipantPhoto(localUser?.name)}
                alt=""
                className="w-10 h-10 rounded-full object-cover ring-2 ring-pastel-lavender/60 shadow-md"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-pastel-mint ring-2 ring-slate-900" />
            </div>

            <div className="overflow-hidden">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-white truncate">
                  {localUser?.name || 'You'}
                </span>
                <span className="text-[10px] text-pastel-lavender font-medium">(You)</span>
                {localUser?.isHost && (
                  <Crown className="w-3.5 h-3.5 text-pastel-peach shrink-0" title="Host" />
                )}
              </div>
              <span className="text-[10px] text-pastel-mint font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pastel-mint" /> Connected • HD
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-400">
            {localMicEnabled ? (
              <Mic className="w-4 h-4 text-pastel-mint" />
            ) : (
              <MicOff className="w-4 h-4 text-pastel-coral" />
            )}
            {localVideoEnabled ? (
              <Video className="w-4 h-4 text-pastel-mint" />
            ) : (
              <VideoOff className="w-4 h-4 text-pastel-coral" />
            )}
          </div>
        </div>

        {/* Remote Peers */}
        {remotePeersArray.map((peer) => (
          <div
            key={peer.peerId}
            className="p-3 rounded-2xl pastel-card border-pastel-lavender/15 hover:border-pastel-lavender/30 flex items-center justify-between transition-colors shadow-sm"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="relative shrink-0">
                <img
                  src={getParticipantPhoto(peer.user?.name)}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-pastel-lavender/40 shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-pastel-mint ring-2 ring-slate-900" />
              </div>

              <div className="overflow-hidden">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {peer.user?.name || 'Participant'}
                  </span>
                  {peer.user?.isHost && (
                    <Crown className="w-3.5 h-3.5 text-pastel-peach shrink-0" title="Host" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400">Active Peer</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Remote Media Indicators */}
              <div className="flex items-center space-x-1.5 text-slate-400 mr-1">
                {peer.isMuted ? (
                  <MicOff className="w-4 h-4 text-pastel-coral" />
                ) : (
                  <Mic className="w-4 h-4 text-pastel-mint" />
                )}
                {peer.isVideoOff ? (
                  <VideoOff className="w-4 h-4 text-pastel-coral" />
                ) : (
                  <Video className="w-4 h-4 text-pastel-mint" />
                )}
              </div>

              {/* Host Control Actions */}
              {isHost && (
                <div className="flex items-center space-x-1 border-l border-white/10 pl-2">
                  <button
                    onClick={() => onHostMute?.(peer.socketId)}
                    title="Mute participant"
                    className="p-1.5 rounded-lg text-pastel-peach hover:bg-pastel-peach/10 transition-colors"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onHostKick?.(peer.peerId, peer.socketId)}
                    title="Remove from call"
                    className="p-1.5 rounded-lg text-pastel-coral hover:bg-rose-500/10 transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
