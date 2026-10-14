const express = require('express');
const {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getConversations);
router.post('/start', startConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

module.exports = router;
