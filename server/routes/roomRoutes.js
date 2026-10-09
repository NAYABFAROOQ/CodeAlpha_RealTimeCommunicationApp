const express = require('express');
const router = express.Router();
const { createRoom, getRoom, verifyRoomPasscode, getUserRooms } = require('../controllers/roomController');
const { optionalAuth, protect } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, createRoom);
router.get('/', protect, getUserRooms);
router.get('/:roomId', getRoom);
router.post('/:roomId/verify', verifyRoomPasscode);

module.exports = router;
