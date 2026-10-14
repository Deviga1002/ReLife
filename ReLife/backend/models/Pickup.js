const mongoose = require('mongoose');
const crypto = require('crypto');

const TIME_SLOTS = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
];

const pickupSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Optional link to donation/purchase request
    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
    },
    relatedRequestType: {
      type: String,
      enum: ['donation', 'purchase', 'other'],
      default: 'other',
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
      enum: TIME_SLOTS,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    instructions: {
      type: String,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    // Secure verification token (never put PII in QR)
    verificationToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Prevent double-booking same resource (delivery partner or location key) on same slot
pickupSchema.index(
  { date: 1, timeSlot: 1, deliveryPartner: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      deliveryPartner: { $exists: true, $ne: null },
      status: { $in: ['Scheduled', 'Confirmed', 'Rescheduled'] },
    },
  }
);

// One active pickup per product
pickupSchema.index(
  { product: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['Scheduled', 'Confirmed', 'Rescheduled'] },
    },
  }
);

pickupSchema.methods.generateVerificationToken = function () {
  this.verificationToken = crypto.randomBytes(32).toString('hex');
  return this.verificationToken;
};

module.exports = mongoose.model('Pickup', pickupSchema);
module.exports.TIME_SLOTS = TIME_SLOTS;
