const { getMongoStatus } = require('../config/db');
const MongoUser = require('./User');
const MongoRoom = require('./Room');
const { MemoryUser, MemoryRoom } = require('./memoryStore');

const getModels = () => {
  if (getMongoStatus()) {
    return {
      User: MongoUser,
      Room: MongoRoom,
    };
  }
  return {
    User: MemoryUser,
    Room: MemoryRoom,
  };
};

module.exports = {
  get User() {
    return getModels().User;
  },
  get Room() {
    return getModels().Room;
  },
  MongoUser,
  MongoRoom,
  MemoryUser,
  MemoryRoom,
};
