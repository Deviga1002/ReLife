const RewardTransaction = require('../models/RewardTransaction');
const UserBadge = require('../models/UserBadge');
const { BADGES } = require('../models/UserBadge');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.getMyRewards = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const history = await RewardTransaction.find({ user: req.user.id })
    .sort('-createdAt')
    .limit(50);
  const badges = await UserBadge.find({ user: req.user.id }).sort('-earnedAt');
  const totalEarned = history
    .filter((t) => t.points > 0)
    .reduce((s, t) => s + t.points, 0);

  const points = user.rewardPoints || 0;
  let currentBadge = null;
  let nextBadge = null;
  const sorted = [...BADGES].filter((b) => b.minPoints).sort((a, b) => a.minPoints - b.minPoints);
  for (const b of sorted) {
    if (points >= b.minPoints) currentBadge = b;
    else if (!nextBadge) nextBadge = b;
  }
  const earnedKeys = new Set(badges.map((b) => b.badgeKey));
  if (!currentBadge) {
    const first = badges[0];
    if (first) currentBadge = { name: first.badgeName, key: first.badgeKey };
  }

  res.json({
    success: true,
    data: {
      points,
      totalEarned,
      currentBadge,
      nextBadge,
      pointsToNext: nextBadge ? Math.max(0, nextBadge.minPoints - points) : 0,
      badges,
      allBadges: BADGES,
      earnedKeys: [...earnedKeys],
      history,
    },
  });
});

exports.getLeaderboard = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const users = await User.find({ isActive: true, role: { $ne: 'admin' } })
    .select('name avatar rewardPoints')
    .sort('-rewardPoints')
    .limit(limit);

  const withBadges = await Promise.all(
    users.map(async (u, i) => {
      const badge = await UserBadge.findOne({ user: u._id }).sort('-earnedAt');
      const activityCount = await RewardTransaction.countDocuments({ user: u._id });
      return {
        rank: i + 1,
        id: u._id,
        name: u.name,
        avatar: u.avatar,
        points: u.rewardPoints || 0,
        badge: badge?.badgeName || null,
        activityCount,
      };
    })
  );

  res.json({ success: true, data: withBadges });
});
