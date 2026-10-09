import { useState, useEffect, useRef, useCallback } from 'react';
import { createPeerConnection, sliceFile } from '../utils/signaling';

export const useWebRTC = (roomId, socket, user, localStream) => {
  // Remote peers state: { [peerId]: { peerId, socketId, user, stream, isMuted, isVideoOff, isScreenSharing, isSpeaking } }
  const [peers, setPeers] = useState({});
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [transferProgress, setTransferProgress] = useState(null); // { fileName, percent, speed, type: 'send'|'receive' }
  const [receivedFiles, setReceivedFiles] = useState([]); // [{ name, size, url, senderName, timestamp }]
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);

  // References to keep mutable peer connections and data channels
  // peerId -> RTCPeerConnection
  const peerConnectionsRef = useRef(new Map());
  // peerId -> RTCDataChannel (for file transfer)
  const dataChannelsRef = useRef(new Map());
  // peerId -> { fileMeta: { name, size, type }, receivedChunks: [], receivedBytes: 0 }
  const fileReceiversRef = useRef(new Map());
  // Store camera video track when screen sharing
  const originalVideoTrackRef = useRef(null);
  // Audio analyzers for remote streams
  const remoteAnalysersRef = useRef(new Map());

  // Helper to add local tracks to a peer connection
  const addTracksToConnection = useCallback((pc, stream) => {
    if (!pc || !stream) return;
    stream.getTracks().forEach((track) => {
      // Check if already added
      const senders = pc.getSenders();
      const existingSender = senders.find((s) => s.track && s.track.kind === track.kind);
      if (!existingSender) {
        pc.addTrack(track, stream);
      }
    });
  }, []);

  // Setup file data channel events
  const setupDataChannelEvents = useCallback((dataChannel, remotePeerId, remoteUserName) => {
    dataChannel.binaryType = 'arraybuffer';

    dataChannel.onopen = () => {
      console.log(`[DataChannel] Open with peer ${remotePeerId}`);
    };

    dataChannel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        // Metadata JSON message
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'file-meta') {
            console.log('[DataChannel] Received file meta:', message);
            fileReceiversRef.current.set(remotePeerId, {
              fileMeta: message,
              receivedChunks: [],
              receivedBytes: 0,
            });
            setTransferProgress({
              fileName: message.name,
              percent: 0,
              type: 'receive',
              senderName: remoteUserName || 'Peer',
            });
          }
        } catch (e) {
          console.error('[DataChannel] Error parsing message:', e);
        }
      } else if (event.data instanceof ArrayBuffer) {
        // Chunk received
        const receiver = fileReceiversRef.current.get(remotePeerId);
        if (!receiver) return;

        receiver.receivedChunks.push(event.data);
        receiver.receivedBytes += event.data.byteLength;

        const totalBytes = receiver.fileMeta.size;
        const percent = Math.min(100, Math.round((receiver.receivedBytes / totalBytes) * 100));

        setTransferProgress({
          fileName: receiver.fileMeta.name,
          percent,
          type: 'receive',
          senderName: remoteUserName || 'Peer',
        });

        if (receiver.receivedBytes >= totalBytes) {
          // File completed! Construct Blob
          const fileBlob = new Blob(receiver.receivedChunks, {
            type: receiver.fileMeta.mimeType || 'application/octet-stream',
          });
          const downloadUrl = URL.createObjectURL(fileBlob);

          const newFile = {
            id: `file_${Date.now()}`,
            name: receiver.fileMeta.name,
            size: receiver.fileMeta.size,
            url: downloadUrl,
            senderName: remoteUserName || 'Peer',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setReceivedFiles((prev) => [newFile, ...prev]);
          setTransferProgress(null);
          fileReceiversRef.current.delete(remotePeerId);
        }
      }
    };

    dataChannel.onerror = (err) => {
      console.warn('[DataChannel] Error:', err);
    };

    dataChannel.onclose = () => {
      console.log(`[DataChannel] Closed with peer ${remotePeerId}`);
    };
  }, []);

  // Create Peer Connection for a specific peer
  const createPeer = useCallback((remoteSocketId, remotePeerId, remoteUser, isInitiator) => {
    if (peerConnectionsRef.current.has(remotePeerId)) {
      return peerConnectionsRef.current.get(remotePeerId);
    }

    const pc = createPeerConnection();
    peerConnectionsRef.current.set(remotePeerId, pc);

    // If local stream exists, add its tracks
    if (localStream) {
      addTracksToConnection(pc, localStream);
    }

    // Handle remote track arrival
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        setPeers((prev) => ({
          ...prev,
          [remotePeerId]: {
            peerId: remotePeerId,
            socketId: remoteSocketId,
            user: remoteUser,
            stream: remoteStream,
            isMuted: false,
            isVideoOff: false,
            isScreenSharing: false,
          },
        }));

        // Monitor remote audio for active speaker detection
        try {
          const audioTrack = remoteStream.getAudioTracks()[0];
          if (audioTrack && window.AudioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContextClass();
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 128;
            const source = audioCtx.createMediaStreamSource(new MediaStream([audioTrack]));
            source.connect(analyser);

            const buffer = new Uint8Array(analyser.frequencyBinCount);
            const interval = setInterval(() => {
              if (pc.connectionState === 'closed') {
                clearInterval(interval);
                return;
              }
              analyser.getByteFrequencyData(buffer);
              const avg = buffer.reduce((a, b) => a + b, 0) / buffer.length;
              if (avg > 25) {
                setActiveSpeakerId(remotePeerId);
              }
            }, 500);
          }
        } catch (e) {}
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('signal-ice-candidate', {
          toSocketId: remoteSocketId,
          fromPeerId: user.id || user.peerId,
          candidate: event.candidate,
        });
      }
    };

    // Set up DataChannel for file transfer
    if (isInitiator) {
      const dataChannel = pc.createDataChannel('fileTransfer', { ordered: true });
      dataChannelsRef.current.set(remotePeerId, dataChannel);
      setupDataChannelEvents(dataChannel, remotePeerId, remoteUser?.name);

      // Create offer
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          socket.emit('signal-offer', {
            toSocketId: remoteSocketId,
            fromPeerId: user.id || user.peerId,
            offer: pc.localDescription,
            user,
          });
        })
        .catch((err) => console.error('Error creating offer:', err));
    } else {
      pc.ondatachannel = (event) => {
        const dataChannel = event.channel;
        dataChannelsRef.current.set(remotePeerId, dataChannel);
        setupDataChannelEvents(dataChannel, remotePeerId, remoteUser?.name);
      };
    }

    pc.onconnectionstatechange = () => {
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        removePeer(remotePeerId);
      }
    };

    return pc;
  }, [localStream, socket, user, addTracksToConnection, setupDataChannelEvents]);

  // Remove peer cleanup
  const removePeer = useCallback((peerId) => {
    if (peerConnectionsRef.current.has(peerId)) {
      const pc = peerConnectionsRef.current.get(peerId);
      pc.close();
      peerConnectionsRef.current.delete(peerId);
    }
    dataChannelsRef.current.delete(peerId);
    fileReceiversRef.current.delete(peerId);

    setPeers((prev) => {
      const updated = { ...prev };
      delete updated[peerId];
      return updated;
    });
  }, []);

  // Update tracks across existing peer connections when localStream changes
  useEffect(() => {
    if (!localStream) return;

    peerConnectionsRef.current.forEach((pc) => {
      const senders = pc.getSenders();
      localStream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track && s.track.kind === track.kind);
        if (sender) {
          // Replace track
          sender.replaceTrack(track).catch((err) => console.warn('replaceTrack error:', err));
        } else {
          pc.addTrack(track, localStream);
        }
      });
    });
  }, [localStream]);

  // Main Socket Signaling Listeners
  useEffect(() => {
    if (!socket || !roomId) return;

    // 1. Existing users in the room when we join
    const handleRoomUsers = ({ participants }) => {
      participants.forEach((p) => {
        createPeer(p.socketId, p.peerId, p.user, true);
      });
    };

    // 2. New user connected after us
    const handleUserConnected = ({ socketId, peerId, user: newUser }) => {
      console.log(`[WebRTC] User connected: ${newUser?.name} (${peerId})`);
      // We wait for their offer or initiate
    };

    // 3. Receive WebRTC Offer
    const handleSignalOffer = async ({ fromSocketId, fromPeerId, offer, user: remoteUser }) => {
      try {
        let pc = peerConnectionsRef.current.get(fromPeerId);
        if (!pc) {
          pc = createPeer(fromSocketId, fromPeerId, remoteUser, false);
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('signal-answer', {
          toSocketId: fromSocketId,
          fromPeerId: user.id || user.peerId,
          answer,
        });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    };

    // 4. Receive WebRTC Answer
    const handleSignalAnswer = async ({ fromPeerId, answer }) => {
      try {
        const pc = peerConnectionsRef.current.get(fromPeerId);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    };

    // 5. Receive ICE Candidate
    const handleSignalCandidate = async ({ fromPeerId, candidate }) => {
      try {
        const pc = peerConnectionsRef.current.get(fromPeerId);
        if (pc && candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    };

    // 6. User disconnected
    const handleUserDisconnected = ({ peerId }) => {
      if (peerId) {
        removePeer(peerId);
      }
    };

    // 7. Media state change (audio/video toggle)
    const handleMediaStateChanged = ({ peerId, micEnabled, videoEnabled, isScreenSharing: peerScreen }) => {
      setPeers((prev) => {
        if (!prev[peerId]) return prev;
        return {
          ...prev,
          [peerId]: {
            ...prev[peerId],
            isMuted: !micEnabled,
            isVideoOff: !videoEnabled,
            isScreenSharing: !!peerScreen,
          },
        };
      });
    };

    socket.on('room-users', handleRoomUsers);
    socket.on('user-connected', handleUserConnected);
    socket.on('signal-offer', handleSignalOffer);
    socket.on('signal-answer', handleSignalAnswer);
    socket.on('signal-ice-candidate', handleSignalCandidate);
    socket.on('user-disconnected', handleUserDisconnected);
    socket.on('user-media-state-changed', handleMediaStateChanged);

    return () => {
      socket.off('room-users', handleRoomUsers);
      socket.off('user-connected', handleUserConnected);
      socket.off('signal-offer', handleSignalOffer);
      socket.off('signal-answer', handleSignalAnswer);
      socket.off('signal-ice-candidate', handleSignalCandidate);
      socket.off('user-disconnected', handleUserDisconnected);
      socket.off('user-media-state-changed', handleMediaStateChanged);
    };
  }, [socket, roomId, user, createPeer, removePeer]);

  // Screen Sharing Implementation with replaceTrack
  const startScreenShare = async () => {
    try {
      if (isScreenSharing) {
        stopScreenShare();
        return;
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true,
      });

      const screenVideoTrack = displayStream.getVideoTracks()[0];

      // Save original camera track
      if (localStream) {
        const currentVideoTrack = localStream.getVideoTracks()[0];
        originalVideoTrackRef.current = currentVideoTrack;

        // Replace track on all active peer connection senders seamlessly
        peerConnectionsRef.current.forEach((pc) => {
          const videoSender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenVideoTrack);
          }
        });
      }

      setScreenStream(displayStream);
      setIsScreenSharing(true);

      if (socket) {
        socket.emit('media-state-change', {
          roomId,
          micEnabled: localStream?.getAudioTracks()[0]?.enabled,
          videoEnabled: true,
          isScreenSharing: true,
        });
      }

      // Handle user stopping screen share from browser banner
      screenVideoTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.warn('Screen share canceled or error:', err);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }

    // Restore camera video track on all peer senders
    const originalTrack = originalVideoTrackRef.current || localStream?.getVideoTracks()[0];
    if (originalTrack) {
      peerConnectionsRef.current.forEach((pc) => {
        const videoSender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(originalTrack);
        }
      });
    }

    setScreenStream(null);
    setIsScreenSharing(false);

    if (socket) {
      socket.emit('media-state-change', {
        roomId,
        micEnabled: localStream?.getAudioTracks()[0]?.enabled,
        videoEnabled: localStream?.getVideoTracks()[0]?.enabled,
        isScreenSharing: false,
      });
    }
  };

  // P2P File Sending over DataChannels with chunking
  const sendP2PFile = async (file) => {
    if (!file) return;

    const activeChannels = Array.from(dataChannelsRef.current.values()).filter(
      (dc) => dc.readyState === 'open'
    );

    if (activeChannels.length === 0) {
      throw new Error('No peer data channels are open for direct transfer.');
    }

    // Send metadata header first
    const metadata = {
      type: 'file-meta',
      name: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
    };

    activeChannels.forEach((dc) => {
      dc.send(JSON.stringify(metadata));
    });

    setTransferProgress({
      fileName: file.name,
      percent: 0,
      type: 'send',
    });

    let sentBytes = 0;

    await sliceFile(file, ({ chunkIndex, totalChunks, data, isLast }) => {
      activeChannels.forEach((dc) => {
        if (dc.readyState === 'open') {
          dc.send(data);
        }
      });

      sentBytes += data.byteLength;
      const percent = Math.min(100, Math.round((sentBytes / file.size) * 100));

      setTransferProgress({
        fileName: file.name,
        percent,
        type: 'send',
      });

      if (isLast) {
        setTimeout(() => setTransferProgress(null), 1500);
      }
    });

    // Also add to sender's own file list for easy preview
    const fileUrl = URL.createObjectURL(file);
    setReceivedFiles((prev) => [
      {
        id: `file_${Date.now()}`,
        name: file.name,
        size: file.size,
        url: fileUrl,
        senderName: 'You',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ]);
  };

  // Host Controls: Kick participant
  const hostKick = (targetPeerId, targetSocketId) => {
    if (socket) {
      socket.emit('host-kick-participant', {
        roomId,
        targetPeerId,
        targetSocketId,
      });
    }
  };

  // Host Controls: Mute participant
  const hostMute = (targetSocketId) => {
    if (socket) {
      socket.emit('host-mute-participant', {
        roomId,
        targetSocketId,
      });
    }
  };

  // Host Controls: End room for all
  const hostEndRoom = () => {
    if (socket) {
      socket.emit('host-end-room', { roomId });
    }
  };

  return {
    peers,
    isScreenSharing,
    screenStream,
    transferProgress,
    receivedFiles,
    activeSpeakerId,
    startScreenShare,
    stopScreenShare,
    sendP2PFile,
    hostKick,
    hostMute,
    hostEndRoom,
  };
};
