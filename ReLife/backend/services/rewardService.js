const RewardTransaction = require('../models/RewardTransaction');
const UserBadge = require('../models/UserBadge');
const { BADGES } = require('../models/UserBadge');
const User = require('../models/User');
const Notification = require('../models/Notification');

const POINT_RULES = {
  DONATION: 50,
  RECYCLING: 30,
  REPAIR: 25,
  UPCYCLE: 25,
  PICKUP_VERIFIED: 10,
};

/**
 * Check user eligibility for badges and award newly qualified ones.
 */
async function checkAndAwardBadges(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const existingBadges = await UserBadge.find({ user: userId }).select('badgeKey');
    const owned = new Set(existingBadges.map((b) => b.badgeKey));

    const donations = await RewardTransaction.countDocuments({
      user: userId,
      type: 'donation_completed',
    });
    const recycles = await RewardTransaction.countDocuments({
      user: userId,
      type: 'recycle_completed',
    });

    const newlyAwarded = [];

    for (const b of BADGES) {
      if (owned.has(b.key)) continue;

      let eligible = false;
      if (b.requireDonations && donations >= b.requireDonations) eligible = true;
      if (b.requireRecycle && recycles >= b.requireRecycle) eligible = true;
      if (b.minPoints && user.rewardPoints >= b.minPoints) eligible = true;

      if (eligible) {
        try {
          const badge = await UserBadge.create({
            user: userId,
            badgeKey: b.key,
            badgeName: b.name,
          });
          newlyAwarded.push(badge);

          await Notification.create({
            recipient: userId,
            type: 'system',
            title: 'New Badge Unlocked!',
            message: `Congratulations! You unlocked the "${b.name}" badge: ${b.description}`,
            link: '/rewards',
          });
        } catch (err) {
          // Ignore duplicate badge race
        }
      }
    }

    return newlyAwarded;
  } catch (err) {
    console.error('checkAndAwardBadges error:', err.message);
    return [];
  }
}

/**
 * Award points to a user, record transaction, and evaluate badges.
 * Supports both object params ({ userId, points, ... }) and positional params (userId, points, type, description, relatedRequest, relatedProduct).
 */
async function awardPoints(firstArg, ...rest) {
  let opts = {};
  if (firstArg && typeof firstArg === 'object' && !firstArg._bsontype && !firstArg.constructor?.name?.includes('ObjectId')) {
    opts = firstArg;
  } else {
    opts = {
      userId: firstArg,
      points: rest[0],
      type: rest[1],
      description: rest[2],
      relatedRequest: rest[3] || null,
      relatedProduct: rest[4] || null,
    };
  }

  const {
    userId,
    points,
    type,
    description,
    relatedRequest = null,
    relatedProduct = null,
  } = opts;

  if (!userId || !points) return null;

  try {
    // If relatedRequest is provided, check if transaction already exists to avoid duplicate
    if (relatedRequest) {
      const existing = await RewardTransaction.findOne({
        user: userId,
        type,
        relatedRequest,
      });
      if (existing) {
        return existing;
      }
    }

    const tx = await RewardTransaction.create({
      user: userId,
      points,
      type,
      description,
      relatedRequest: relatedRequest || undefined,
      relatedProduct: relatedProduct || undefined,
    });

    await User.findByIdAndUpdate(userId, { $inc: { rewardPoints: points } });

    await Notification.create({
      recipient: userId,
      type: 'reward',
      title: 'Reward Points Earned',
      message: `You earned +${points} points: ${description}`,
      link: '/rewards',
      relatedId: relatedRequest || undefined,
    });

    await checkAndAwardBadges(userId);
    return tx;
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate transaction prevented by MongoDB index
      return null;
    }
    console.error('awardPoints error:', err.message);
    return null;
  }
}

module.exports = {
  awardPoints,
  checkAndAwardBadges,
  POINT_RULES,
};
