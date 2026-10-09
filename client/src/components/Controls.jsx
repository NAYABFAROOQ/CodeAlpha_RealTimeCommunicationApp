import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Edit3,
  MessageSquare,
  Users,
  Settings,
  Hand,
  PhoneOff,
  Smile,
  ShieldAlert,
  ChevronUp,
  CircleDot,
  Radio,
  Sparkles,
  FileText,
} from 'lucide-react';

export const Controls = ({
  micEnabled,
  videoEnabled,
  isScreenSharing,
  isWhiteboardOpen,
  isChatOpen,
  isParticipantsOpen,
  unreadCount = 0,
  hasHandRaised,
  isHost,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onToggleWhiteboard,
  onToggleChat,
  onToggleParticipants,
  onToggleHandRaise,
  onSendReaction,
  onOpenSettings,
  onLeaveMeeting,
  onHostEndMeeting,
  onHostMuteAll,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showHostMenu, setShowHostMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [noiseSuppression, setNoiseSuppression] = useState(true);

  const reactions = ['👍', '❤️', '👏', '🎉', '🚀', '🔥', '✨', '💡'];

  return (
    <div className="relative py-3 px-4 flex items-center justify-center select-none z-20">
      {/* Floating Reactions Bar */}
      {showReactions && (
        <div className="absolute -top-14 pastel-dropdown rounded-2xl p-2 flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-3 z-30 shadow-2xl border border-pastel-lavender/30">
          {reactions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSendReaction(emoji);
                setShowReactions(false);
              }}
              className="text-xl hover:scale-130 transition-transform p-1.5 rounded-xl hover:bg-white/10"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Floating Host Controls Menu */}
      {showHostMenu && isHost && (
        <div className="absolute -top-32 pastel-dropdown rounded-2xl p-2.5 w-60 flex flex-col space-y-1.5 animate-in fade-in slide-in-from-bottom-3 z-30 border border-pastel-lavender/30 shadow-2xl">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-pastel-lavender flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-pastel-peach" />
            Host Management
          </div>
          <button
            onClick={() => {
              onHostMuteAll?.();
              setShowHostMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-xs font-semibold text-pastel-peach hover:bg-purple-500/10 rounded-xl transition-colors flex items-center gap-2"
          >
            <MicOff className="w-3.5 h-3.5" /> Mute All Participants
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to end the meeting for all participants?')) {
                onHostEndMeeting?.();
                setShowHostMenu(false);
              }
            }}
            className="w-full text-left px-3 py-2 text-xs font-semibold text-pastel-coral hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-2"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> End Meeting for All
          </button>
        </div>
      )}

      {/* Main Glassmorphic Pastel Toolbar */}
      <div className="pastel-toolbar rounded-2xl px-3 md:px-5 py-2.5 flex items-center space-x-2 md:space-x-3 max-w-full overflow-x-auto shadow-2xl">
        {/* Recording Toggle (Unique Feature) */}
        <button
          onClick={() => setIsRecording(!isRecording)}
          title={isRecording ? 'Stop Recording' : 'Start Cloud Recording'}
          className={`px-3 py-2 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm ${
            isRecording
              ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40 animate-pulse'
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-white/5'
          }`}
        >
          <CircleDot className={`w-3.5 h-3.5 ${isRecording ? 'text-rose-400' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">{isRecording ? 'REC 00:24' : 'Record'}</span>
        </button>

        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        {/* Microphone Toggle */}
        <button
          onClick={onToggleMic}
          title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
          className={`p-3 rounded-xl transition-all shadow-md ${
            micEnabled
              ? 'bg-white/90 hover:bg-purple-50 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-purple-200/60 dark:border-pastel-lavender/10 shadow-sm'
              : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-900/50'
          }`}
        >
          {micEnabled ? <Mic className="w-5 h-5 text-pastel-mint" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Video / Camera Toggle */}
        <button
          onClick={onToggleVideo}
          title={videoEnabled ? 'Turn camera off' : 'Turn camera on'}
          className={`p-3 rounded-xl transition-all shadow-md ${
            videoEnabled
              ? 'bg-white/90 hover:bg-purple-50 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-purple-200/60 dark:border-pastel-lavender/10 shadow-sm'
              : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-900/50'
          }`}
        >
          {videoEnabled ? <Video className="w-5 h-5 text-pastel-mint" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        {/* Screen Share Toggle */}
        <button
          onClick={onToggleScreenShare}
          title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
          className={`p-3 rounded-xl transition-all shadow-md ${
            isScreenSharing
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/30'
              : 'bg-white/90 hover:bg-purple-50 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-purple-200/60 dark:border-pastel-lavender/10 shadow-sm'
          }`}
        >
          {isScreenSharing ? <MonitorOff className="w-5 h-5 text-pastel-mint" /> : <Monitor className="w-5 h-5" />}
        </button>

        {/* Whiteboard Toggle */}
        <button
          onClick={onToggleWhiteboard}
          title="Interactive Synchronized Whiteboard"
          className={`p-3 rounded-xl transition-all shadow-md ${
            isWhiteboardOpen
              ? 'bg-gradient-to-r from-pastel-lilac to-purple-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-white/90 hover:bg-purple-50 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-purple-200/60 dark:border-pastel-lavender/10 shadow-sm'
          }`}
        >
          <Edit3 className="w-5 h-5 text-pastel-lavender" />
        </button>

        {/* Noise Suppression AI toggle (Unique Feature) */}
        <button
          onClick={() => setNoiseSuppression(!noiseSuppression)}
          title={noiseSuppression ? 'AI Noise Suppression: Active' : 'AI Noise Suppression: Off'}
          className={`p-3 rounded-xl transition-all shadow-md hidden sm:block ${
            noiseSuppression
              ? 'bg-slate-800/90 text-pastel-mint border border-pastel-mint/30'
              : 'bg-slate-800/60 text-slate-500 border border-white/5'
          }`}
        >
          <Radio className="w-5 h-5" />
        </button>

        {/* Reactions Picker */}
        <button
          onClick={() => setShowReactions(!showReactions)}
          title="Send Reaction"
          className={`p-3 rounded-xl transition-all shadow-md ${
            showReactions
              ? 'bg-slate-700 text-white ring-1 ring-pastel-lavender'
              : 'bg-white/90 hover:bg-purple-50 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-purple-200/60 dark:border-pastel-lavender/10 shadow-sm'
          }`}
        >
          <Smile className="w-5 h-5 text-pastel-peach" />
        </button>

        {/* Raise Hand Button */}
        <button
          onClick={onToggleHandRaise}
          title={hasHandRaised ? 'Lower Hand' : 'Raise Hand'}
          className={`p-3 rounded-xl transition-all shadow-md ${
            hasHandRaised
              ? 'bg-gradient-to-r from-pastel-peach to-amber-500 text-slate-950 font-bold shadow-md'
              : 'bg-white/90 hover:bg-purple-50 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-purple-200/60 dark:border-pastel-lavender/10 shadow-sm'
          }`}
        >
          <Hand className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        {/* Chat, Notes & P2P Files Drawer Toggle */}
        <button
          onClick={onToggleChat}
          title="Chat, Meeting Notes & Files"
          className={`p-3 rounded-xl transition-all relative shadow-md ${
            isChatOpen
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-purple-900/40'
              : 'bg-white/90 hover:bg-purple-50 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-purple-200/60 dark:border-pastel-lavender/10 shadow-sm'
          }`}
        >
          <MessageSquare className="w-5 h-5 text-pastel-sky" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pastel-coral text-slate-950 text-[10px] font-extrabold flex items-center justify-center animate-bounce shadow-md">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Participants Drawer Toggle */}
        <button
          onClick={onToggleParticipants}
          title="Participants"
          className={`p-3 rounded-xl transition-all shadow-md ${
            isParticipantsOpen
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-900/40'
              : 'bg-white/90 hover:bg-purple-50 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-purple-200/60 dark:border-pastel-lavender/10 shadow-sm'
          }`}
        >
          <Users className="w-5 h-5 text-pastel-lavender" />
        </button>

        {/* Settings Modal Toggle */}
        <button
          onClick={onOpenSettings}
          title="Device Settings"
          className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white transition-all shadow-md border border-pastel-lavender/10"
        >
          <Settings className="w-5 h-5 text-slate-300" />
        </button>

        {/* Host Menu Trigger */}
        {isHost && (
          <button
            onClick={() => setShowHostMenu(!showHostMenu)}
            title="Host Controls"
            className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-pastel-lavender hover:text-white transition-all shadow-md border border-pastel-lavender/30 flex items-center gap-1"
          >
            <ShieldAlert className="w-5 h-5 text-pastel-peach" />
            <ChevronUp className={`w-3.5 h-3.5 transition-transform ${showHostMenu ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Leave Meeting Button */}
        <button
          onClick={onLeaveMeeting}
          title="Leave Meeting"
          className="px-4 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm flex items-center space-x-1.5 transition-all shadow-lg shadow-rose-900/40 ml-1"
        >
          <PhoneOff className="w-4 h-4" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </div>
  );
};
