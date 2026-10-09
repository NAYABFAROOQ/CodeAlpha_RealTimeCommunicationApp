const { Room } = require('../models');

// Helper to generate a clean Google Meet style slug: "cal-pqrs-tuv"
const generateRoomId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const segment = (len) => {
    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };
  return `${segment(3)}-${segment(4)}-${segment(3)}`;
};

// @desc    Create a new meeting room
// @route   POST /api/rooms
exports.createRoom = async (req, res) => {
  try {
    const { title, password, settings, customRoomId } = req.body;

    let roomId = customRoomId ? customRoomId.toLowerCase().trim() : generateRoomId();

    // Verify uniqueness
    let existing = await Room.findOne({ roomId });
    if (existing) {
      if (customRoomId) {
        return res.status(400).json({
          success: false,
          message: 'Room ID already taken. Please choose another.',
        });
      }
      roomId = generateRoomId();
    }

    const hostUserId = req.user && !req.user.isGuest ? req.user.id : null;
    const hostName = req.user ? req.user.username : (req.body.hostName || 'Meeting Host');

    const newRoom = await Room.create({
      roomId,
      title: title?.trim() || 'Instant Conference',
      hostUserId,
      hostName,
      password: password ? String(password) : null,
      settings: settings || {
        muteOnEntry: false,
        allowWhiteboard: true,
        allowFileSharing: true,
        allowChat: true,
      },
      maxParticipants: 6,
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room: {
        roomId: newRoom.roomId,
        title: newRoom.title,
        hostName: newRoom.hostName,
        isLocked: newRoom.isLocked,
        isEnded: newRoom.isEnded,
        hasPassword: !!newRoom.password,
        settings: newRoom.settings,
        createdAt: newRoom.createdAt,
      },
    });
  } catch (error) {
    console.error('Room creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room',
      error: error.message,
    });
  }
};

// @desc    Get room info by Room ID
// @route   GET /api/rooms/:roomId
exports.getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId: roomId.toLowerCase().trim() });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found. Please check the meeting code or link.',
      });
    }

    if (room.isEnded) {
      return res.status(410).json({
        success: false,
        message: 'This meeting has already ended by the host.',
        isEnded: true,
      });
    }

    res.json({
      success: true,
      room: {
        roomId: room.roomId,
        title: room.title,
        hostName: room.hostName,
        isLocked: room.isLocked,
        isEnded: room.isEnded,
        hasPassword: !!room.password,
        settings: room.settings,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message,
    });
  }
};

// @desc    Verify room passcode
// @route   POST /api/rooms/:roomId/verify
exports.verifyRoomPasscode = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { password } = req.body;

    const room = await Room.findOne({ roomId: roomId.toLowerCase().trim() });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    if (!room.password) {
      return res.json({ success: true, message: 'No password required' });
    }

    if (room.password === password) {
      return res.json({ success: true, message: 'Passcode verified' });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Incorrect meeting passcode',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying passcode',
      error: error.message,
    });
  }
};

// @desc    Get rooms created by logged-in user
// @route   GET /api/rooms
exports.getUserRooms = async (req, res) => {
  try {
    if (!req.user || req.user.isGuest) {
      return res.json({ success: true, rooms: [] });
    }

    const rooms = await Room.find({ hostUserId: req.user.id });
    res.json({
      success: true,
      rooms: rooms.map(r => ({
        roomId: r.roomId,
        title: r.title,
        isEnded: r.isEnded,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user rooms',
      error: error.message,
    });
  }
};
