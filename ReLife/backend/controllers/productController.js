const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// @desc    Get all products with filters, search, pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    action,
    condition,
    location,
    status = 'available',
    search,
    sort = '-createdAt',
    page = 1,
    limit = 12,
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (category) query.category = category;
  if (action) query.action = action;
  if (condition) query.condition = condition;
  if (location) query.location = { $regex: location, $options: 'i' };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('owner', 'name location')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    'owner',
    'name location email phone'
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Increment views
  product.views += 1;
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private
exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, condition, action, price, location } =
    req.body;

  const images = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      if (isCloudinaryConfigured()) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'relife/products',
          });
          images.push({ url: result.secure_url, publicId: result.public_id });
          // Remove local temp file
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Cloudinary upload failed, using local:', err.message);
          images.push({
            url: `/uploads/${path.basename(file.path)}`,
            publicId: '',
          });
        }
      } else {
        images.push({
          url: `/uploads/${path.basename(file.path)}`,
          publicId: '',
        });
      }
    }
  }

  // Default placeholder if no image
  if (images.length === 0) {
    images.push({
      url: 'https://via.placeholder.com/400x300?text=ReLife+Item',
      publicId: '',
    });
  }

  const product = await Product.create({
    name,
    description,
    category,
    condition,
    action,
    price: action === 'Donate' || action === 'Recycle' ? 0 : price || 0,
    location,
    images,
    owner: req.user.id,
  });

  res.status(201).json({
    success: true,
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (owner or admin)
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Check ownership
  if (
    product.owner.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this product',
    });
  }

  const fields = [
    'name',
    'description',
    'category',
    'condition',
    'action',
    'price',
    'location',
    'status',
  ];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  // Handle new images
  if (req.files && req.files.length > 0) {
    const newImages = [];
    for (const file of req.files) {
      if (isCloudinaryConfigured()) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'relife/products',
          });
          newImages.push({ url: result.secure_url, publicId: result.public_id });
          fs.unlinkSync(file.path);
        } catch (err) {
          newImages.push({
            url: `/uploads/${path.basename(file.path)}`,
            publicId: '',
          });
        }
      } else {
        newImages.push({
          url: `/uploads/${path.basename(file.path)}`,
          publicId: '',
        });
      }
    }
    product.images = [...product.images, ...newImages];
  }

  await product.save();

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (owner or admin)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  if (
    product.owner.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this product',
    });
  }

  // Soft delete
  product.status = 'removed';
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product removed successfully',
  });
});

// @desc    Get my products
// @route   GET /api/products/my/listings
// @access  Private
exports.getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ owner: req.user.id }).sort(
    '-createdAt'
  );

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});
