const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Completed', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Prevent duplicate pending requests for same product by same user
donationRequestSchema.index(
  { product: 1, requester: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'Pending' } }
);

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
