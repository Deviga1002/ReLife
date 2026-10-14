const mongoose = require('mongoose');

const BADGES = [
  { key: 'first_donation', name: 'First Donation', description: 'Completed your first donation', minPoints: 0, requireDonations: 1 },
  { key: 'eco_starter', name: 'Eco Starter', description: 'Earned 50 reward points', minPoints: 50 },
  { key: 'reuse_champion', name: 'Reuse Champion', description: 'Earned 150 reward points', minPoints: 150 },
  { key: 'recycling_hero', name: 'Recycling Hero', description: 'Completed a recycle activity', minPoints: 0, requireRecycle: 1 },
  { key: 'community_helper', name: 'Community Helper', description: 'Earned 300 reward points', minPoints: 300 },
  { key: 'sustainability_champion', name: 'Sustainability Champion', description: 'Earned 500 reward points', minPoints: 500 },
];

const userBadgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    badgeKey: {
      type: String,
      required: true,
    },
    badgeName: {
      type: String,
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userBadgeSchema.index({ user: 1, badgeKey: 1 }, { unique: true });

module.exports = mongoose.model('UserBadge', userBadgeSchema);
module.exports.BADGES = BADGES;
