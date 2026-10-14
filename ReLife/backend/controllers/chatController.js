const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// POST start or get conversation for a product
exports.startConversation = asyncHandler(async (req, res) => {
  const { productId, otherUserId } = req.body;
  if (!productId || !otherUserId) {
    return res.status(400).json({ success: false, message: 'productId and otherUserId required' });
  }
  if (otherUserId === req.user.id) {
    return res.status(400).json({ success: false, message: 'Cannot chat with yourself' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  // Find existing conversation between these two about this product
  let conversation = await Conversation.findOne({
    product: productId,
    participants: { $all: [req.user.id, otherUserId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      product: productId,
      participants: [req.user.id, otherUserId],
    });
  }

  const populated = await Conversation.findById(conversation._id)
    .populate('participants', 'name avatar')
    .populate('product', 'name images');

  res.status(201).json({ success: true, data: populated });
});

// GET my conversations
exports.getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user.id })
    .populate('participants', 'name avatar')
    .populate('product', 'name images')
    .sort('-lastMessageAt');

  // Unread counts
  const withUnread = await Promise.all(
    conversations.map(async (c) => {
      const unread = await Message.countDocuments({
        conversation: c._id,
        sender: { $ne: req.user.id },
        readBy: { $ne: req.user.id },
      });
      return { ...c.toObject(), unread };
    })
  );

  res.json({ success: true, count: withUnread.length, data: withUnread });
});

// GET messages in conversation
exports.getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) {
    return res.status(404).json({ success: false, message: 'Conversation not found' });
  }
  if (!conversation.participants.map(String).includes(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const messages = await Message.find({ conversation: conversation._id })
    .populate('sender', 'name avatar')
    .sort('createdAt')
    .limit(200);

  // Mark as read
  await Message.updateMany(
    { conversation: conversation._id, sender: { $ne: req.user.id } },
    { $addToSet: { readBy: req.user.id } }
  );

  res.json({ success: true, data: messages });
});

// POST send message
exports.sendMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Message text required' });
  }

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) {
    return res.status(404).json({ success: false, message: 'Conversation not found' });
  }
  if (!conversation.participants.map(String).includes(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user.id,
    text: text.trim().slice(0, 2000),
    readBy: [req.user.id],
  });

  conversation.lastMessage = text.trim().slice(0, 100);
  conversation.lastMessageAt = new Date();
  await conversation.save();

  const populated = await Message.findById(message._id).populate('sender', 'name avatar');

  // Notify other participant
  const otherId = conversation.participants.map(String).find((id) => id !== req.user.id);
  if (otherId) {
    await Notification.create({
      recipient: otherId,
      sender: req.user.id,
      type: 'system',
      title: 'New Message',
      message: text.trim().slice(0, 80),
      link: `/chat/${conversation._id}`,
      relatedId: conversation._id,
    });
  }

  // Emit via socket if available
  const io = req.app.get('io');
  if (io) {
    io.to(`conversation:${conversation._id}`).emit('new_message', populated);
    if (otherId) {
      io.to(`user:${otherId}`).emit('notification', { type: 'chat' });
    }
  }

  res.status(201).json({ success: true, data: populated });
});
