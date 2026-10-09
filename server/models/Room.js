const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  title: {
    type: String,
    default: 'Instant Meeting',
    trim: true,
  },
  hostUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  hostName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    default: null,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  isEnded: {
    type: Boolean,
    default: false,
  },
  maxParticipants: {
    type: Number,
    default: 6,
  },
  settings: {
    muteOnEntry: { type: Boolean, default: false },
    allowWhiteboard: { type: Boolean, default: true },
    allowFileSharing: { type: Boolean, default: true },
    allowChat: { type: Boolean, default: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('Room', RoomSchema);
