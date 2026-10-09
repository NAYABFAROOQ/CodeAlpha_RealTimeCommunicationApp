import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  ArrowRight,
  Lock,
  AlertCircle,
  Home,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useMediaStream } from '../hooks/useMediaStream';
import { useWebRTC } from '../hooks/useWebRTC';
import { useWhiteboard } from '../hooks/useWhiteboard';
import { RoomHeader } from '../components/RoomHeader';
import { VideoGrid } from '../components/VideoGrid';
import { Controls } from '../components/Controls';
import { Whiteboard } from '../components/Whiteboard';
import { ChatPanel } from '../components/ChatPanel';
import { ParticipantsPanel } from '../components/ParticipantsPanel';
import { DeviceSettingsModal } from '../components/DeviceSettingsModal';

export const RoomPage = ({ roomId, initialRoomData, onLeave }) => {
  const { user, isAuthenticated, guestLogin } = useAuth();
  const { socket, isConnected } = useSocket();

  // Room state
  const [roomInfo, setRoomInfo] = useState(initialRoomData || null);
  const [isInRoom, setIsInRoom] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [guestDisplayName, setGuestDisplayName] = useState(user?.username || 'Nayab Farooq');
  const [roomError, setRoomError] = useState('');
  const [isRoomEnded, setIsRoomEnded] = useState(false);
  const [isKicked, setIsKicked] = useState(false);
  const [kickedReason, setKickedReason] = useState('');

  // UI Drawers & Overlays
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Chat & Activity state
  const [chatMessages, setChatMessages] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [hasHandRaised, setHasHandRaised] = useState(false);
  const [activeReactions, setActiveReactions] = useState([]); // [{ id, reaction, senderName }]
  const [handRaiseToasts, setHandRaiseToasts] = useState([]);

  // Local media stream hook
  const {
    localStream,
    micEnabled,
    videoEnabled,
    audioDevices,
    videoDevices,
    selectedAudioId,
    selectedVideoId,
    audioLevel,
    isSpeaking,
    startLocalStream,
    toggleMic,
    toggleVideo,
    switchAudioDevice,
    switchVideoDevice,
  } = useMediaStream();

  // Current session user identity
  const currentParticipant = {
    id: user?.id || `user_${Math.random().toString(36).substr(2, 9)}`,
    peerId: user?.id || `peer_${Math.random().toString(36).substr(2, 9)}`,
    name: user?.username || guestDisplayName || 'Guest',
    isHost: !!roomInfo?.isHost || (user && roomInfo?.hostUserId === user?.id),
    avatar: user?.avatar || '',
  };

  // WebRTC multi-peer conferencing hook
  const {
    peers,
    isScreenSharing,
    screenStream,
    transferProgress,
    receivedFiles,
    startScreenShare,
    stopScreenShare,
    sendP2PFile,
    hostKick,
    hostMute,
    hostEndRoom,
  } = useWebRTC(roomId, socket, currentParticipant, localStream);

  // Whiteboard hook
  const whiteboardState = useWhiteboard(roomId, socket);

  // Preview video ref for Lobby
  const lobbyVideoRef = useRef(null);

  // Fetch Room metadata from server
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}`);
        const data = await res.json();
        if (!res.ok) {
          if (data.isEnded) {
            setIsRoomEnded(true);
          } else {
            setRoomError(data.message || 'Room not found');
          }
          return;
        }
        setRoomInfo((prev) => ({
          ...data.room,
          isHost: prev?.isHost ?? false,
        }));
      } catch (err) {
        setRoomError('Unable to load meeting information');
      }
    };

    fetchRoom();
  }, [roomId]);

  // Start local media stream preview for lobby
  useEffect(() => {
    let active = true;
    startLocalStream().then((stream) => {
      if (active && lobbyVideoRef.current && stream) {
        lobbyVideoRef.current.srcObject = stream;
      }
    });

    return () => {
      active = false;
    };
  }, [startLocalStream]);

  // Handle Joining Meeting
  const handleJoinMeeting = async (e) => {
    e?.preventDefault();
    setRoomError('');

    // If passcode required, verify
    if (roomInfo?.hasPassword) {
      try {
        const verifyRes = await fetch(`/api/rooms/${roomId}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: passcode }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          setRoomError(verifyData.message || 'Incorrect room passcode');
          return;
        }
      } catch (err) {
        setRoomError('Verification error');
        return;
      }
    }

    // Ensure guest user has session
    let participantName = user?.username;
    if (!user) {
      participantName = guestDisplayName.trim() || `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
      await guestLogin(participantName);
    }

    // Join room over socket
    if (socket && isConnected) {
      socket.emit('join-room', {
        roomId,
        peerId: currentParticipant.peerId,
        user: {
          ...currentParticipant,
          name: participantName,
        },
      });
    }

    setIsInRoom(true);
  };

  // Socket event listeners for in-room events
  useEffect(() => {
    if (!socket || !isInRoom) return;

    // 1. Incoming chat message
    const handleChatMessage = (message) => {
      setChatMessages((prev) => [...prev, message]);
      if (!isChatOpen) {
        setUnreadChatCount((prev) => prev + 1);
      }
    };

    // 2. Incoming reaction
    const handleReaction = ({ reaction, senderName, id }) => {
      setActiveReactions((prev) => [...prev, { id, reaction, senderName }]);
      setTimeout(() => {
        setActiveReactions((prev) => prev.filter((r) => r.id !== id));
      }, 4000);
    };

    // 3. Hand raise notification
    const handleHandRaise = ({ userName, raised }) => {
      if (raised) {
        const toastId = Date.now();
        setHandRaiseToasts((prev) => [...prev, { id: toastId, userName }]);
        setTimeout(() => {
          setHandRaiseToasts((prev) => prev.filter((t) => t.id !== toastId));
        }, 5000);
      }
    };

    // 4. Remote mute requested by host
    const handleRemoteMute = () => {
      if (micEnabled) {
        toggleMic();
        alert('The host has muted your microphone.');
      }
    };

    // 5. Kicked from room by host
    const handleKicked = ({ reason }) => {
      setIsKicked(true);
      setKickedReason(reason || 'You have been removed from the meeting by the host.');
      setIsInRoom(false);
    };

    // 6. Meeting ended for all by host
    const handleRoomEnded = () => {
      setIsRoomEnded(true);
      setIsInRoom(false);
    };

    socket.on('chat-message', handleChatMessage);
    socket.on('reaction-received', handleReaction);
    socket.on('hand-raise-updated', handleHandRaise);
    socket.on('remote-mute-requested', handleRemoteMute);
    socket.on('kicked-from-room', handleKicked);
    socket.on('room-ended', handleRoomEnded);

    return () => {
      socket.off('chat-message', handleChatMessage);
      socket.off('reaction-received', handleReaction);
      socket.off('hand-raise-updated', handleHandRaise);
      socket.off('remote-mute-requested', handleRemoteMute);
      socket.off('kicked-from-room', handleKicked);
      socket.off('room-ended', handleRoomEnded);
    };
  }, [socket, isInRoom, isChatOpen, micEnabled, toggleMic]);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (isChatOpen) {
      setUnreadChatCount(0);
    }
  }, [isChatOpen]);

  // Send Chat message
  const handleSendMessage = (text) => {
    if (socket) {
      socket.emit('send-chat-message', {
        roomId,
        message: {
          sender: currentParticipant.name,
          senderId: currentParticipant.id,
          text,
          isHost: currentParticipant.isHost,
        },
      });
    }
  };

  // Send Floating Reaction
  const handleSendReaction = (emoji) => {
    if (socket) {
      socket.emit('send-reaction', {
        roomId,
        reaction: emoji,
        senderName: currentParticipant.name,
      });
    }
  };

  // Toggle Hand Raise
  const handleToggleHandRaise = () => {
    const nextState = !hasHandRaised;
    setHasHandRaised(nextState);
    if (socket) {
      socket.emit('raise-hand', {
        roomId,
        raised: nextState,
      });
    }
  };

  // --- VIEW 1: ROOM ENDED OR KICKED ---
  if (isRoomEnded || isKicked) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isKicked ? 'Removed from Meeting' : 'Meeting Ended'}
          </h2>
          <p className="text-xs text-slate-400">
            {isKicked
              ? kickedReason
              : 'The host has ended this conference for all participants.'}
          </p>
          <div className="pt-4">
            <button
              onClick={onLeave}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: PRE-JOIN LOBBY ---
  if (!isInRoom) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 cyber-grid overflow-hidden">
        {/* Visual Ambient Glow Orbs */}
        <div className="glow-orb orb-cyan w-[420px] h-[420px] -top-24 -left-24" />
        <div className="glow-orb orb-purple w-[450px] h-[450px] -bottom-24 -right-24" />

        <div className="w-full max-w-4xl grid md:grid-cols-12 gap-8 items-center glass-panel rounded-3xl p-6 md:p-8 border border-cyan-500/30 shadow-2xl relative z-10">
          {/* Left: Video Preview & Test Controls */}
          <div className="md:col-span-7 flex flex-col items-center">
            <div className="w-full aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative shadow-xl">
              <video
                ref={lobbyVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  videoEnabled ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {!videoEnabled && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-2">
                    <VideoOff className="w-6 h-6 text-rose-400" />
                  </div>
                  <span className="text-xs font-semibold">Camera is Off</span>
                </div>
              )}

              {/* Floating Preview Controls */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
                <button
                  onClick={toggleMic}
                  className={`p-2.5 rounded-xl transition-all ${
                    micEnabled ? 'bg-slate-800 text-emerald-400' : 'bg-gradient-to-r from-rose-600 to-red-600 text-white'
                  }`}
                  title={micEnabled ? 'Mute' : 'Unmute'}
                >
                  {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-2.5 rounded-xl transition-all ${
                    videoEnabled ? 'bg-slate-800 text-emerald-400' : 'bg-gradient-to-r from-rose-600 to-red-600 text-white'
                  }`}
                  title={videoEnabled ? 'Stop Video' : 'Start Video'}
                >
                  {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mic Level bar */}
            <div className="w-full mt-3 flex items-center space-x-2 text-xs text-slate-400">
              <span className="text-[11px] font-medium">Mic Check:</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-75"
                  style={{ width: `${Math.min(100, audioLevel * 2)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Meeting Info & Join Action */}
          <div className="md:col-span-5 space-y-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold mb-2">
                <span>By Nayab Farooq</span>
                <span>•</span>
                <span>CodeAlpha Task 4</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
                {roomInfo?.title || 'Conference Room'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Room ID: <code className="text-cyan-300 font-mono">{roomId}</code>
              </p>
            </div>

            {roomError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {roomError}
              </div>
            )}

            <form onSubmit={handleJoinMeeting} className="space-y-4">
              {!isAuthenticated && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Your Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={guestDisplayName}
                    onChange={(e) => setGuestDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              )}

              {roomInfo?.hasPassword && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" /> Room Passcode Required
                  </label>
                  <input
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter passcode"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
              >
                <span>Join Meeting</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <button
              onClick={onLeave}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              Cancel and Return
            </button>
          </div>
        </div>

        {/* Device Settings Modal */}
        <DeviceSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          audioDevices={audioDevices}
          videoDevices={videoDevices}
          selectedAudioId={selectedAudioId}
          selectedVideoId={selectedVideoId}
          onSwitchAudio={switchAudioDevice}
          onSwitchVideo={switchVideoDevice}
          audioLevel={audioLevel}
          localStream={localStream}
        />
      </div>
    );
  }

  // --- VIEW 3: ACTIVE CONFERENCE ROOM ---
  const participantCount = 1 + Object.keys(peers).length;

  return (
    <div className="h-screen w-screen bg-[#060911] cyber-grid flex flex-col overflow-hidden relative select-none">
      {/* Background Ambient Lighting Glows */}
      <div className="glow-orb orb-cyan w-[500px] h-[500px] -top-32 -left-32 opacity-25" />
      <div className="glow-orb orb-purple w-[550px] h-[550px] -bottom-32 -right-32 opacity-25" />

      {/* Floating Emoji Reactions Stream */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {activeReactions.map((r, i) => (
          <div
            key={r.id}
            className="absolute bottom-24 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white animate-bounce"
            style={{
              left: `${15 + (i * 15) % 65}%`,
            }}
          >
            <span className="text-2xl">{r.reaction}</span>
            <span className="text-xs font-semibold text-cyan-300">{r.senderName}</span>
          </div>
        ))}
      </div>

      {/* Floating Hand Raise Toasts */}
      <div className="absolute top-20 right-6 z-40 space-y-2 pointer-events-none">
        {handRaiseToasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl glass-dropdown border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-xl animate-in slide-in-from-top-4"
          >
            <span>✋</span>
            <span>{toast.userName} raised their hand</span>
          </div>
        ))}
      </div>

      {/* Room Header */}
      <RoomHeader
        roomTitle={roomInfo?.title}
        roomId={roomId}
        participantCount={participantCount}
        isHost={currentParticipant.isHost}
        onOpenParticipants={() => setIsParticipantsOpen(true)}
      />

      {/* Main Workspace: Video Grid + Optional Whiteboard + Slide Drawers */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Grid */}
        <VideoGrid
          localStream={localStream}
          localUser={currentParticipant}
          localMicEnabled={micEnabled}
          localVideoEnabled={videoEnabled}
          localIsSpeaking={isSpeaking}
          isLocalScreenSharing={isScreenSharing}
          screenStream={screenStream}
          peers={peers}
          currentUserIsHost={currentParticipant.isHost}
          onHostMute={hostMute}
          onHostKick={hostKick}
        />

        {/* Synchronized Whiteboard Modal / Canvas */}
        {isWhiteboardOpen && (
          <Whiteboard
            whiteboardState={whiteboardState}
            onClose={() => setIsWhiteboardOpen(false)}
            roomTitle={roomInfo?.title}
          />
        )}

        {/* Chat & P2P File Sharing Drawer */}
        {isChatOpen && (
          <ChatPanel
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onSendFile={sendP2PFile}
            transferProgress={transferProgress}
            receivedFiles={receivedFiles}
            onClose={() => setIsChatOpen(false)}
            currentUser={currentParticipant}
          />
        )}

        {/* Participants Drawer */}
        {isParticipantsOpen && (
          <ParticipantsPanel
            localUser={currentParticipant}
            localMicEnabled={micEnabled}
            localVideoEnabled={videoEnabled}
            peers={peers}
            isHost={currentParticipant.isHost}
            onHostMute={hostMute}
            onHostKick={hostKick}
            onHostMuteAll={() => socket?.emit('host-mute-all', { roomId })}
            onClose={() => setIsParticipantsOpen(false)}
          />
        )}
      </div>

      {/* Floating Bottom Controls Toolbar */}
      <Controls
        micEnabled={micEnabled}
        videoEnabled={videoEnabled}
        isScreenSharing={isScreenSharing}
        isWhiteboardOpen={isWhiteboardOpen}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        unreadCount={unreadChatCount}
        hasHandRaised={hasHandRaised}
        isHost={currentParticipant.isHost}
        onToggleMic={toggleMic}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={startScreenShare}
        onToggleWhiteboard={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
        onToggleChat={() => {
          setIsChatOpen(!isChatOpen);
          if (isParticipantsOpen) setIsParticipantsOpen(false);
        }}
        onToggleParticipants={() => {
          setIsParticipantsOpen(!isParticipantsOpen);
          if (isChatOpen) setIsChatOpen(false);
        }}
        onToggleHandRaise={handleToggleHandRaise}
        onSendReaction={handleSendReaction}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLeaveMeeting={onLeave}
        onHostEndMeeting={hostEndRoom}
        onHostMuteAll={() => socket?.emit('host-mute-all', { roomId })}
      />

      {/* Device Settings Modal */}
      <DeviceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        audioDevices={audioDevices}
        videoDevices={videoDevices}
        selectedAudioId={selectedAudioId}
        selectedVideoId={selectedVideoId}
        onSwitchAudio={switchAudioDevice}
        onSwitchVideo={switchVideoDevice}
        audioLevel={audioLevel}
        localStream={localStream}
      />
    </div>
  );
};
