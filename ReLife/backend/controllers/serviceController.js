const ServiceRequest = require('../models/ServiceRequest');
const Notification = require('../models/Notification');
const RewardTransaction = require('../models/RewardTransaction');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { isCloudinaryConfigured, cloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// @desc    Create service request
// @route   POST /api/services
// @access  Private
exports.createServiceRequest = asyncHandler(async (req, res) => {
  const { type, title, description, location, productId } = req.body;

  if (!['Repair', 'Recycle', 'Upcycle'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid service type' });
  }

  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      if (isCloudinaryConfigured()) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'relife/services',
          });
          images.push({ url: result.secure_url, publicId: result.public_id });
          fs.unlinkSync(file.path);
        } catch (e) {
          images.push({ url: `/uploads/${path.basename(file.path)}`, publicId: '' });
        }
      } else {
        images.push({ url: `/uploads/${path.basename(file.path)}`, publicId: '' });
      }
    }
  }

  const request = await ServiceRequest.create({
    type,
    title,
    description,
    location,
    product: productId || undefined,
    user: req.user.id,
    images,
  });

  res.status(201).json({ success: true, data: request });
});

// @desc    Get service requests
// @route   GET /api/services
// @access  Private
exports.getServiceRequests = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  const query = { user: req.user.id };
  if (type) query.type = type;
  if (status) query.status = status;

  const requests = await ServiceRequest.find(query)
    .populate('product', 'name images')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: requests.length, data: requests });
});

// @desc    Get all service requests (admin)
// @route   GET /api/services/all
// @access  Private/Admin
exports.getAllServiceRequests = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  const query = {};
  if (type) query.type = type;
  if (status) query.status = status;

  const requests = await ServiceRequest.find(query)
    .populate('user', 'name email location')
    .populate('product', 'name images')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: requests.length, data: requests });
});

// @desc    Update service request status
// @route   PUT /api/services/:id
// @access  Private (owner or admin)
exports.updateServiceRequest = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  const isOwner = request.user.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (req.body.status) {
    request.status = req.body.status;
  }
  if (req.body.adminNotes && isAdmin) {
    request.adminNotes = req.body.adminNotes;
  }

  await request.save();

  // Award points on completion
  if (req.body.status === 'Completed' && isAdmin) {
    const pointsMap = { Repair: 50, Recycle: 80, Upcycle: 70 };
    const points = pointsMap[request.type] || 50;
    try {
      await RewardTransaction.create({
        user: request.user,
        points,
        type: `${request.type.toLowerCase()}_completed`,
        description: `Completed ${request.type} request: ${request.title}`,
        relatedRequest: request._id,
      });
      await User.findByIdAndUpdate(request.user, { $inc: { rewardPoints: points } });
      await Notification.create({
        recipient: request.user,
        type: 'reward',
        title: 'Reward Points Earned',
        message: `You earned ${points} points for completing a ${request.type} request`,
        relatedId: request._id,
      });
    } catch (e) {
      // ignore duplicate
    }
  }

  res.status(200).json({ success: true, data: request });
});
