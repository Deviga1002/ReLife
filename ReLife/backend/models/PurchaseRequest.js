const mongoose = require('mongoose');

const purchaseRequestSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: '',
    },
    offeredPrice: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Completed', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

purchaseRequestSchema.index(
  { product: 1, buyer: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'Pending' } }
);

module.exports = mongoose.model('PurchaseRequest', purchaseRequestSchema);
