const { Room } = require('../models');

// In-memory tracking of active rooms, sockets, and whiteboard stroke history
// roomId -> Map(socketId -> { socketId, peerId, user })
const activeRooms = new Map();
// roomId -> Array of strokes
const whiteboardHistories = new Map();

const initializeSignaling = (io) => {
  io.on('connection', (socket) => {
    let currentRoomId = null;
    let currentUser = null;
    let currentPeerId = null;

    // --- 1. JOIN ROOM ---
    socket.on('join-room', async ({ roomId, peerId, user }) => {
      try {
        if (!roomId || !peerId) return;

        currentRoomId = roomId;
        currentPeerId = peerId;
        currentUser = user || { name: 'Anonymous', isHost: false };

        socket.join(roomId);

        if (!activeRooms.has(roomId)) {
          activeRooms.set(roomId, new Map());
        }

        const roomMap = activeRooms.get(roomId);

        // Notify existing members about this new participant
        socket.to(roomId).emit('user-connected', {
          socketId: socket.id,
          peerId: currentPeerId,
          user: currentUser,
        });

        // Store this socket's participant info
        roomMap.set(socket.id, {
          socketId: socket.id,
          peerId: currentPeerId,
          user: currentUser,
          joinedAt: Date.now(),
        });

        // Collect existing participants to send back to the joining user
        const existingParticipants = [];
        roomMap.forEach((participant, sid) => {
          if (sid !== socket.id) {
            existingParticipants.push({
              socketId: participant.socketId,
              peerId: participant.peerId,
              user: participant.user,
            });
          }
        });

        // Send existing participants to the newly joined peer
        socket.emit('room-users', {
          participants: existingParticipants,
        });

        // Send current whiteboard history to the newly joined user
        const roomWhiteboard = whiteboardHistories.get(roomId) || [];
        if (roomWhiteboard.length > 0) {
          socket.emit('whiteboard-history-sync', roomWhiteboard);
        }

        console.log(`[Socket] Peer ${peerId} (${currentUser.name}) joined room ${roomId}. Total: ${roomMap.size}`);
      } catch (err) {
        console.error('[Socket] Error on join-room:', err);
      }
    });

    // --- 2. WEBRTC SIGNALING RELAY ---
    socket.on('signal-offer', ({ toSocketId, fromPeerId, offer, user }) => {
      io.to(toSocketId).emit('signal-offer', {
        fromSocketId: socket.id,
        fromPeerId,
        offer,
        user: user || currentUser,
      });
    });

    socket.on('signal-answer', ({ toSocketId, fromPeerId, answer }) => {
      io.to(toSocketId).emit('signal-answer', {
        fromSocketId: socket.id,
        fromPeerId,
        answer,
      });
    });

    socket.on('signal-ice-candidate', ({ toSocketId, fromPeerId, candidate }) => {
      io.to(toSocketId).emit('signal-ice-candidate', {
        fromSocketId: socket.id,
        fromPeerId,
        candidate,
      });
    });

    // --- 3. MEDIA STATUS BROADCAST ---
    socket.on('media-state-change', ({ roomId, micEnabled, videoEnabled, isScreenSharing }) => {
      if (!roomId) return;
      socket.to(roomId).emit('user-media-state-changed', {
        socketId: socket.id,
        peerId: currentPeerId,
        micEnabled,
        videoEnabled,
        isScreenSharing,
      });
    });

    // --- 4. HOST CONTROLS ---
    socket.on('host-kick-participant', async ({ roomId, targetSocketId, targetPeerId }) => {
      // Confirm sender is host
      const roomMap = activeRooms.get(roomId);
      const sender = roomMap ? roomMap.get(socket.id) : null;
      if (!sender || !sender.user?.isHost) return;

      if (targetSocketId) {
        io.to(targetSocketId).emit('kicked-from-room', {
          reason: 'You were removed from the room by the host.',
        });
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.leave(roomId);
        }
        if (roomMap) {
          roomMap.delete(targetSocketId);
        }
        io.to(roomId).emit('user-disconnected', {
          socketId: targetSocketId,
          peerId: targetPeerId,
          reason: 'kicked',
        });
      }
    });

    socket.on('host-mute-participant', ({ roomId, targetSocketId }) => {
      const roomMap = activeRooms.get(roomId);
      const sender = roomMap ? roomMap.get(socket.id) : null;
      if (!sender || !sender.user?.isHost) return;

      if (targetSocketId) {
        io.to(targetSocketId).emit('remote-mute-requested');
      }
    });

    socket.on('host-mute-all', ({ roomId }) => {
      const roomMap = activeRooms.get(roomId);
      const sender = roomMap ? roomMap.get(socket.id) : null;
      if (!sender || !sender.user?.isHost) return;

      socket.to(roomId).emit('remote-mute-requested');
    });

    socket.on('host-end-room', async ({ roomId }) => {
      const roomMap = activeRooms.get(roomId);
      const sender = roomMap ? roomMap.get(socket.id) : null;
      if (!sender || !sender.user?.isHost) return;

      try {
        await Room.updateOne({ roomId }, { isEnded: true, endedAt: new Date() });
      } catch (err) {
        console.error('Error ending room in DB:', err);
      }

      io.to(roomId).emit('room-ended', {
        reason: 'The host has ended this meeting for all participants.',
      });

      // Clear memory
      activeRooms.delete(roomId);
      whiteboardHistories.delete(roomId);
    });

    // --- 5. SYNCHRONIZED WHITEBOARD ---
    socket.on('whiteboard-draw', ({ roomId, stroke }) => {
      if (!roomId || !stroke) return;

      if (!whiteboardHistories.has(roomId)) {
        whiteboardHistories.set(roomId, []);
      }
      const history = whiteboardHistories.get(roomId);
      // Keep up to 3000 strokes in memory
      if (history.length > 3000) {
        history.shift();
      }
      history.push(stroke);

      // Broadcast to other participants in room
      socket.to(roomId).emit('whiteboard-draw', stroke);
    });

    socket.on('whiteboard-clear', ({ roomId }) => {
      if (!roomId) return;
      whiteboardHistories.set(roomId, []);
      socket.to(roomId).emit('whiteboard-clear');
    });

    // --- 6. CHAT & REACTIONS ---
    socket.on('send-chat-message', ({ roomId, message }) => {
      if (!roomId || !message) return;
      io.to(roomId).emit('chat-message', {
        ...message,
        id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('send-reaction', ({ roomId, reaction, senderName }) => {
      if (!roomId || !reaction) return;
      io.to(roomId).emit('reaction-received', {
        reaction,
        senderName: senderName || currentUser?.name || 'Someone',
        id: `react_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      });
    });

    socket.on('raise-hand', ({ roomId, raised }) => {
      if (!roomId) return;
      io.to(roomId).emit('hand-raise-updated', {
        socketId: socket.id,
        peerId: currentPeerId,
        userName: currentUser?.name || 'Participant',
        raised,
      });
    });

    // --- 7. DISCONNECTION ---
    socket.on('disconnect', () => {
      if (currentRoomId && activeRooms.has(currentRoomId)) {
        const roomMap = activeRooms.get(currentRoomId);
        roomMap.delete(socket.id);

        socket.to(currentRoomId).emit('user-disconnected', {
          socketId: socket.id,
          peerId: currentPeerId,
          userName: currentUser?.name,
        });

        if (roomMap.size === 0) {
          activeRooms.delete(currentRoomId);
          // Keep whiteboard history briefly or clear if room empty
        }

        console.log(`[Socket] User ${currentUser?.name || socket.id} left room ${currentRoomId}. Remaining: ${roomMap.size}`);
      }
    });
  });
};

module.exports = { initializeSignaling };
