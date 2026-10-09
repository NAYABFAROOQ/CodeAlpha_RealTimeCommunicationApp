const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname, '..', 'data');
const usersFile = path.join(dataDir, 'users.json');
const roomsFile = path.join(dataDir, 'rooms.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {}
}

const readData = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    return content ? JSON.parse(content) : [];
  } catch (err) {
    return [];
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing store:', err.message);
  }
};

const MemoryUser = {
  async findOne(query) {
    const users = readData(usersFile);
    return users.find(u => {
      if (query.email && u.email.toLowerCase() === query.email.toLowerCase()) return true;
      if (query.username && u.username.toLowerCase() === query.username.toLowerCase()) return true;
      if (query._id && u._id === query._id) return true;
      return false;
    }) || null;
  },

  async findById(id) {
    const users = readData(usersFile);
    return users.find(u => u._id === id) || null;
  },

  async create(userData) {
    const users = readData(usersFile);
    const newUser = {
      _id: uuidv4(),
      username: userData.username,
      email: userData.email.toLowerCase(),
      password: userData.password,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.username)}`,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeData(usersFile, users);
    return newUser;
  }
};

const MemoryRoom = {
  async findOne(query) {
    const rooms = readData(roomsFile);
    return rooms.find(r => {
      if (query.roomId && r.roomId === query.roomId) return true;
      if (query._id && r._id === query._id) return true;
      return false;
    }) || null;
  },

  async find(query = {}) {
    const rooms = readData(roomsFile);
    if (query.hostUserId) {
      return rooms.filter(r => r.hostUserId === query.hostUserId);
    }
    return rooms;
  },

  async create(roomData) {
    const rooms = readData(roomsFile);
    const newRoom = {
      _id: uuidv4(),
      roomId: roomData.roomId,
      title: roomData.title || 'Instant Meeting',
      hostUserId: roomData.hostUserId || null,
      hostName: roomData.hostName || 'Host',
      password: roomData.password || null,
      isLocked: false,
      isEnded: false,
      maxParticipants: roomData.maxParticipants || 6,
      settings: roomData.settings || {
        muteOnEntry: false,
        allowWhiteboard: true,
        allowFileSharing: true,
        allowChat: true,
      },
      createdAt: new Date().toISOString(),
      endedAt: null,
    };
    rooms.push(newRoom);
    writeData(roomsFile, rooms);
    return newRoom;
  },

  async updateOne(query, updateData) {
    const rooms = readData(roomsFile);
    const index = rooms.findIndex(r => r.roomId === query.roomId || r._id === query._id);
    if (index !== -1) {
      rooms[index] = { ...rooms[index], ...(updateData.$set || updateData) };
      writeData(roomsFile, rooms);
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  }
};

module.exports = { MemoryUser, MemoryRoom };
