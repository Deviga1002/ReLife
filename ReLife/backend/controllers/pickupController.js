const Pickup = require('../models/Pickup');
const { TIME_SLOTS } = require('../models/Pickup');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const RewardTransaction = require('../models/RewardTransaction');
const User = require('../models/User');
const UserBadge = require('../models/UserBadge');
const { BADGES } = require('../models/UserBadge');
const asyncHandler = require('../utils/asyncHandler');
const crypto = require('crypto');

const ACTIVE = ['Scheduled', 'Confirmed', 'Rescheduled'];

const isParticipant = (pickup, userId) => {
  const id = userId.toString();
  return (
    pickup.owner.toString() === id ||
    pickup.recipient.toString() === id ||
    (pickup.deliveryPartner && pickup.deliveryPartner.toString() === id)
  );
};

async function awardPoints(userId, points, type, description, relatedId) {
  try {
    await RewardTransaction.create({
      user: userId,
      points,
      type,
      description,
      relatedRequest: relatedId,
    });
    await User.findByIdAndUpdate(userId, { $inc: { rewardPoints: points } });
    await Notification.create({
      recipient: userId,
      type: 'reward',
      title: 'Reward Points Earned',
      message: `You earned ${points} points: ${description}`,
      relatedId,
    });
    await checkAndAwardBadges(userId);
  } catch (e) {
    // duplicate ignored
  }
}

async function checkAndAwardBadges(userId) {
  const user = await User.findById(userId);
  if (!user) return;
  const existing = await UserBadge.find({ user: userId }).select('badgeKey');
  const have = new Set(existing.map((b) => b.badgeKey));
  const donations = await RewardTransaction.countDocuments({
    user: userId,
    type: 'donation_completed',
  });
  const recycles = await RewardTransaction.countDocuments({
    user: userId,
    type: 'recycle_completed',
  });

  for (const b of BADGES) {
    if (have.has(b.key)) continue;
    let ok = false;
    if (b.requireDonations && donations >= b.requireDonations) ok = true;
    if (b.requireRecycle && recycles >= b.requireRecycle) ok = true;
    if (b.minPoints && user.rewardPoints >= b.minPoints) ok = true;
    if (ok) {
      try {
        await UserBadge.create({
          user: userId,
          badgeKey: b.key,
          badgeName: b.name,
        });
        await Notification.create({
          recipient: userId,
          type: 'system',
          title: 'New Badge Earned!',
          message: `You earned the "${b.name}" badge: ${b.description}`,
        });
      } catch (e) {}
    }
  }
}

// GET available slots for a date
exports.getAvailableSlots = asyncHandler(async (req, res) => {
  const { date, deliveryPartnerId } = req.query;
  if (!date) {
    return res.status(400).json({ success: false, message: 'Date is required' });
  }

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const query = {
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ACTIVE },
  };
  if (deliveryPartnerId) query.deliveryPartner = deliveryPartnerId;

  const booked = await Pickup.find(query).select('timeSlot');
  const taken = new Set(booked.map((p) => p.timeSlot));
  const available = TIME_SLOTS.filter((s) => !taken.has(s));

  res.json({ success: true, data: { allSlots: TIME_SLOTS, available, taken: [...taken] } });
});

// POST create pickup
exports.createPickup = asyncHandler(async (req, res) => {
  const { productId, recipientId, date, timeSlot, location, instructions, deliveryPartnerId, relatedRequest, relatedRequestType } = req.body;

  if (!productId || !recipientId || !date || !timeSlot || !location) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  if (!TIME_SLOTS.includes(timeSlot)) {
    return res.status(400).json({ success: false, message: 'Invalid time slot' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  // Only owner or recipient can schedule
  const uid = req.user.id;
  if (product.owner.toString() !== uid && recipientId !== uid) {
    // allow recipient to request if they are recipientId
  }
  const ownerId = product.owner;

  // Clash check for delivery partner
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  if (deliveryPartnerId) {
    const clash = await Pickup.findOne({
      date: { $gte: dayStart, $lte: dayEnd },
      timeSlot,
      deliveryPartner: deliveryPartnerId,
      status: { $in: ACTIVE },
    });
    if (clash) {
      const booked = await Pickup.find({
        date: { $gte: dayStart, $lte: dayEnd },
        status: { $in: ACTIVE },
        deliveryPartner: deliveryPartnerId,
      }).select('timeSlot');
      const taken = new Set(booked.map((p) => p.timeSlot));
      const alternatives = TIME_SLOTS.filter((s) => !taken.has(s));
      return res.status(409).json({
        success: false,
        message: 'This time slot is not available for the assigned partner',
        alternatives,
      });
    }
  }

  // Existing active pickup for product
  const existing = await Pickup.findOne({
    product: productId,
    status: { $in: ACTIVE },
  });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'An active pickup already exists for this listing',
    });
  }

  const token = crypto.randomBytes(32).toString('hex');
  let pickup;
  try {
    pickup = await Pickup.create({
      product: productId,
      owner: ownerId,
      recipient: recipientId,
      deliveryPartner: deliveryPartnerId || undefined,
      date: new Date(date),
      timeSlot,
      location,
      instructions: instructions || '',
      status: 'Scheduled',
      verificationToken: token,
      relatedRequest,
      relatedRequestType: relatedRequestType || 'other',
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Slot conflict or duplicate pickup. Please choose another slot.',
      });
    }
    throw err;
  }

  // Notify parties
  const notifyIds = [ownerId.toString(), recipientId.toString()].filter((id) => id !== uid);
  for (const rid of notifyIds) {
    await Notification.create({
      recipient: rid,
      sender: uid,
      type: 'system',
      title: 'Pickup Scheduled',
      message: `A pickup was scheduled for "${product.name}" on ${new Date(date).toLocaleDateString()} (${timeSlot})`,
      link: `/pickups/${pickup._id}`,
      relatedId: pickup._id,
    });
  }

  const populated = await Pickup.findById(pickup._id)
    .populate('product', 'name images category')
    .populate('owner', 'name location')
    .populate('recipient', 'name location')
    .populate('deliveryPartner', 'name');

  res.status(201).json({ success: true, data: populated });
});

// GET my pickups
exports.getMyPickups = asyncHandler(async (req, res) => {
  const { tab = 'upcoming' } = req.query;
  const uid = req.user.id;
  const base = {
    $or: [{ owner: uid }, { recipient: uid }, { deliveryPartner: uid }],
  };

  let statusFilter;
  if (tab === 'upcoming') statusFilter = { $in: ACTIVE };
  else if (tab === 'past') statusFilter = 'Completed';
  else if (tab === 'cancelled') statusFilter = 'Cancelled';
  else statusFilter = { $exists: true };

  const pickups = await Pickup.find({ ...base, status: statusFilter })
    .populate('product', 'name images category')
    .populate('owner', 'name location avatar')
    .populate('recipient', 'name location avatar')
    .populate('deliveryPartner', 'name')
    .sort(tab === 'upcoming' ? 'date' : '-date');

  res.json({ success: true, count: pickups.length, data: pickups });
});

// GET single pickup
exports.getPickup = asyncHandler(async (req, res) => {
  const pickup = await Pickup.findById(req.params.id)
    .populate('product', 'name images category action')
    .populate('owner', 'name location avatar')
    .populate('recipient', 'name location avatar')
    .populate('deliveryPartner', 'name')
    .populate('verifiedBy', 'name');

  if (!pickup) return res.status(404).json({ success: false, message: 'Pickup not found' });

  if (!isParticipant(pickup, req.user.id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.json({ success: true, data: pickup });
});

// PUT reschedule
exports.reschedulePickup = asyncHandler(async (req, res) => {
  const { date, timeSlot } = req.body;
  const pickup = await Pickup.findById(req.params.id);
  if (!pickup) return res.status(404).json({ success: false, message: 'Pickup not found' });
  if (!isParticipant(pickup, req.user.id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  if (!ACTIVE.includes(pickup.status)) {
    return res.status(400).json({ success: false, message: 'Cannot reschedule this pickup' });
  }
  if (!TIME_SLOTS.includes(timeSlot)) {
    return res.status(400).json({ success: false, message: 'Invalid time slot' });
  }

  if (pickup.deliveryPartner) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    const clash = await Pickup.findOne({
      _id: { $ne: pickup._id },
      date: { $gte: dayStart, $lte: dayEnd },
      timeSlot,
      deliveryPartner: pickup.deliveryPartner,
      status: { $in: ACTIVE },
    });
    if (clash) {
      return res.status(409).json({
        success: false,
        message: 'Selected slot is not available',
      });
    }
  }

  pickup.date = new Date(date);
  pickup.timeSlot = timeSlot;
  pickup.status = 'Rescheduled';
  pickup.verificationToken = crypto.randomBytes(32).toString('hex');
  await pickup.save();

  const others = [pickup.owner.toString(), pickup.recipient.toString()].filter((id) => id !== req.user.id);
  for (const rid of others) {
    await Notification.create({
      recipient: rid,
      sender: req.user.id,
      type: 'system',
      title: 'Pickup Rescheduled',
      message: `Pickup rescheduled to ${new Date(date).toLocaleDateString()} (${timeSlot})`,
      link: `/pickups/${pickup._id}`,
      relatedId: pickup._id,
    });
  }

  res.json({ success: true, data: pickup });
});

// PUT cancel
exports.cancelPickup = asyncHandler(async (req, res) => {
  const pickup = await Pickup.findById(req.params.id);
  if (!pickup) return res.status(404).json({ success: false, message: 'Pickup not found' });
  if (!isParticipant(pickup, req.user.id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  if (pickup.status === 'Completed' || pickup.status === 'Cancelled') {
    return res.status(400).json({ success: false, message: 'Cannot cancel this pickup' });
  }
  pickup.status = 'Cancelled';
  await pickup.save();

  const others = [pickup.owner.toString(), pickup.recipient.toString()].filter((id) => id !== req.user.id);
  for (const rid of others) {
    await Notification.create({
      recipient: rid,
      sender: req.user.id,
      type: 'system',
      title: 'Pickup Cancelled',
      message: 'A scheduled pickup was cancelled',
      link: `/pickups/${pickup._id}`,
      relatedId: pickup._id,
    });
  }

  res.json({ success: true, data: pickup });
});

// POST verify QR / token
exports.verifyPickup = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'Verification token required' });

  const pickup = await Pickup.findOne({ verificationToken: token })
    .populate('product', 'name');

  if (!pickup) {
    return res.status(404).json({ success: false, message: 'Invalid verification token' });
  }
  if (!isParticipant(pickup, req.user.id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to verify this pickup' });
  }
  if (pickup.status === 'Completed') {
    return res.status(400).json({ success: false, message: 'Pickup already completed' });
  }
  if (pickup.status === 'Cancelled') {
    return res.status(400).json({ success: false, message: 'Pickup was cancelled' });
  }
  if (!ACTIVE.includes(pickup.status) && pickup.status !== 'Confirmed') {
    return res.status(400).json({ success: false, message: 'Pickup cannot be verified in current status' });
  }

  pickup.status = 'Completed';
  pickup.verifiedAt = new Date();
  pickup.verifiedBy = req.user.id;
  // Invalidate token after use
  pickup.verificationToken = crypto.randomBytes(32).toString('hex') + '_used';
  await pickup.save();

  // Bonus points for verified pickup (owner)
  await awardPoints(
    pickup.owner,
    10,
    'admin_adjustment',
    `Verified pickup completed for listing`,
    pickup._id
  );

  await Notification.create({
    recipient: pickup.owner,
    type: 'system',
    title: 'Pickup Completed',
    message: `Pickup verified and completed for "${pickup.product?.name || 'item'}"`,
    relatedId: pickup._id,
  });
  await Notification.create({
    recipient: pickup.recipient,
    type: 'system',
    title: 'Pickup Completed',
    message: `Pickup verified and completed for "${pickup.product?.name || 'item'}"`,
    relatedId: pickup._id,
  });

  res.json({ success: true, message: 'Pickup verified and completed', data: pickup });
});

// Confirm pickup
exports.confirmPickup = asyncHandler(async (req, res) => {
  const pickup = await Pickup.findById(req.params.id);
  if (!pickup) return res.status(404).json({ success: false, message: 'Pickup not found' });
  if (!isParticipant(pickup, req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  if (pickup.status !== 'Scheduled' && pickup.status !== 'Rescheduled') {
    return res.status(400).json({ success: false, message: 'Cannot confirm this pickup' });
  }
  pickup.status = 'Confirmed';
  await pickup.save();
  res.json({ success: true, data: pickup });
});
