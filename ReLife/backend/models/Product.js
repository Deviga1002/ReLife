const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Clothes and Fashion',
        'Books and Stationery',
        'Food and Groceries',
        'Electronics',
        'Furniture',
        'Home Appliances',
        'Toys and Accessories',
        'Other Items',
      ],
    },
    condition: {
      type: String,
      required: [true, 'Please select condition'],
      enum: ['New', 'Like New', 'Good', 'Fair', 'Needs Repair'],
    },
    action: {
      type: String,
      required: [true, 'Please select an action'],
      enum: ['Donate', 'Sell', 'Repair', 'Recycle', 'Upcycle'],
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Please provide location'],
      trim: true,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'completed', 'removed'],
      default: 'available',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes for search and filter
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, action: 1, status: 1, location: 1 });
productSchema.index({ owner: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
