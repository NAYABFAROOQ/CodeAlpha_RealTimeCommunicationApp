import React, { useState } from 'react';
import { VideoCard } from './VideoCard';

export const VideoGrid = ({
  localStream,
  localUser,
  localMicEnabled,
  localVideoEnabled,
  localIsSpeaking,
  isLocalScreenSharing,
  screenStream,
  peers,
  currentUserIsHost,
  onHostMute,
  onHostKick,
}) => {
  const [pinnedId, setPinnedId] = useState(null);

  // Check if anyone is sharing screen or pinned
  const remotePeersArray = Object.values(peers);
  const screenSharer = remotePeersArray.find((p) => p.isScreenSharing);
  const hasActiveScreenShare = isLocalScreenSharing || !!screenSharer;

  // Active spotlight target ID
  const activeSpotlightId =
    pinnedId ||
    (isLocalScreenSharing ? 'local-screen' : screenSharer ? screenSharer.peerId : null);

  // Layout calculation for default grid
  const totalCount = 1 + remotePeersArray.length;

  const getGridClasses = () => {
    if (activeSpotlightId) {
      return 'hidden'; // When spotlight is active, main view is spotlight
    }
    if (totalCount === 1) return 'grid-cols-1 max-w-4xl mx-auto h-[75vh]';
    if (totalCount === 2) return 'grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto h-[75vh]';
    if (totalCount <= 4) return 'grid-cols-1 sm:grid-cols-2 max-w-6xl mx-auto h-[75vh]';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto h-[75vh]';
  };

  return (
    <div className="flex-1 w-full p-3 md:p-6 overflow-hidden flex flex-col justify-center">
      {/* SPOTLIGHT MODE (Screen share or Pinned participant) */}
      {activeSpotlightId ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full max-h-[80vh]">
          {/* Main Spotlight Video Area */}
          <div className="flex-1 h-full min-h-[360px] rounded-2xl overflow-hidden shadow-2xl relative">
            {activeSpotlightId === 'local-screen' ? (
              <VideoCard
                stream={screenStream}
                name={`${localUser?.name || 'You'} (Presenting)`}
                isLocal={true}
                isMuted={!localMicEnabled}
                isVideoOff={false}
                isSpeaking={localIsSpeaking}
                isScreenSharing={true}
                isPinned={true}
                onTogglePin={() => setPinnedId(null)}
              />
            ) : activeSpotlightId === 'local' ? (
              <VideoCard
                stream={localStream}
                name={localUser?.name || 'You'}
                isLocal={true}
                isHost={localUser?.isHost}
                isMuted={!localMicEnabled}
                isVideoOff={!localVideoEnabled}
                isSpeaking={localIsSpeaking}
                isScreenSharing={isLocalScreenSharing}
                isPinned={true}
                onTogglePin={() => setPinnedId(null)}
              />
            ) : (
              (() => {
                const targetPeer = peers[activeSpotlightId];
                if (!targetPeer) return null;
                return (
                  <VideoCard
                    stream={targetPeer.stream}
                    name={targetPeer.user?.name || 'Participant'}
                    isLocal={false}
                    isHost={targetPeer.user?.isHost}
                    isMuted={targetPeer.isMuted}
                    isVideoOff={targetPeer.isVideoOff}
                    isSpeaking={targetPeer.isSpeaking}
                    isScreenSharing={targetPeer.isScreenSharing}
                    isPinned={true}
                    onTogglePin={() => setPinnedId(null)}
                    currentUserIsHost={currentUserIsHost}
                    onHostMute={onHostMute}
                    onHostKick={onHostKick}
                    peerId={targetPeer.peerId}
                    socketId={targetPeer.socketId}
                  />
                );
              })()
            )}
          </div>

          {/* Side Docked Tiles */}
          <div className="w-full lg:w-72 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto shrink-0 max-h-[220px] lg:max-h-full">
            {/* Local Video in Dock if not spotlit */}
            {activeSpotlightId !== 'local' && activeSpotlightId !== 'local-screen' && (
              <div className="w-48 lg:w-full h-32 shrink-0">
                <VideoCard
                  stream={localStream}
                  name={localUser?.name || 'You'}
                  isLocal={true}
                  isHost={localUser?.isHost}
                  isMuted={!localMicEnabled}
                  isVideoOff={!localVideoEnabled}
                  isSpeaking={localIsSpeaking}
                  isScreenSharing={isLocalScreenSharing}
                  onTogglePin={() => setPinnedId('local')}
                />
              </div>
            )}

            {/* Remote Peers in Dock */}
            {remotePeersArray.map((peer) => {
              if (peer.peerId === activeSpotlightId) return null;
              return (
                <div key={peer.peerId} className="w-48 lg:w-full h-32 shrink-0">
                  <VideoCard
                    stream={peer.stream}
                    name={peer.user?.name || 'Participant'}
                    isLocal={false}
                    isHost={peer.user?.isHost}
                    isMuted={peer.isMuted}
                    isVideoOff={peer.isVideoOff}
                    isSpeaking={peer.isSpeaking}
                    isScreenSharing={peer.isScreenSharing}
                    onTogglePin={() => setPinnedId(peer.peerId)}
                    currentUserIsHost={currentUserIsHost}
                    onHostMute={onHostMute}
                    onHostKick={onHostKick}
                    peerId={peer.peerId}
                    socketId={peer.socketId}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* STANDARD DYNAMIC GRID */
        <div className={`grid gap-4 w-full ${getGridClasses()}`}>
          {/* Local User Tile */}
          <VideoCard
            stream={localStream}
            name={localUser?.name || 'You'}
            isLocal={true}
            isHost={localUser?.isHost}
            isMuted={!localMicEnabled}
            isVideoOff={!localVideoEnabled}
            isSpeaking={localIsSpeaking}
            isScreenSharing={isLocalScreenSharing}
            isPinned={false}
            onTogglePin={() => setPinnedId('local')}
          />

          {/* Remote Peer Tiles */}
          {remotePeersArray.map((peer) => (
            <VideoCard
              key={peer.peerId}
              stream={peer.stream}
              name={peer.user?.name || 'Participant'}
              isLocal={false}
              isHost={peer.user?.isHost}
              isMuted={peer.isMuted}
              isVideoOff={peer.isVideoOff}
              isSpeaking={peer.isSpeaking}
              isScreenSharing={peer.isScreenSharing}
              isPinned={false}
              onTogglePin={() => setPinnedId(peer.peerId)}
              currentUserIsHost={currentUserIsHost}
              onHostMute={onHostMute}
              onHostKick={onHostKick}
              peerId={peer.peerId}
              socketId={peer.socketId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
