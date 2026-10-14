const mongoose = require('mongoose');

const rewardTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'donation_completed',
        'recycle_completed',
        'upcycle_completed',
        'repair_completed',
        'admin_adjustment',
        'signup_bonus',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

// Prevent duplicate rewards for same action
rewardTransactionSchema.index(
  { user: 1, type: 1, relatedRequest: 1 },
  { unique: true, partialFilterExpression: { relatedRequest: { $exists: true } } }
);

module.exports = mongoose.model('RewardTransaction', rewardTransactionSchema);
