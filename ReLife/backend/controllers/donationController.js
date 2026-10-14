const DonationRequest = require('../models/DonationRequest');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const RewardTransaction = require('../models/RewardTransaction');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create donation request
// @route   POST /api/donations
// @access  Private
exports.createDonationRequest = asyncHandler(async (req, res) => {
  const { productId, message } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (product.action !== 'Donate') {
    return res.status(400).json({ success: false, message: 'This item is not for donation' });
  }

  if (product.status !== 'available') {
    return res.status(400).json({ success: false, message: 'Item is no longer available' });
  }

  if (product.owner.toString() === req.user.id) {
    return res.status(400).json({ success: false, message: 'Cannot request your own item' });
  }

  // Check existing pending request
  const existing = await DonationRequest.findOne({
    product: productId,
    requester: req.user.id,
    status: 'Pending',
  });
  if (existing) {
    return res.status(400).json({ success: false, message: 'You already have a pending request for this item' });
  }

  const request = await DonationRequest.create({
    product: productId,
    requester: req.user.id,
    owner: product.owner,
    message: message || '',
  });

  // Notify owner
  await Notification.create({
    recipient: product.owner,
    sender: req.user.id,
    type: 'donation_request',
    title: 'New Donation Request',
    message: `${req.user.name} requested your item "${product.name}"`,
    link: `/donation-requests`,
    relatedId: request._id,
  });

  res.status(201).json({ success: true, data: request });
});

// @desc    Get donation requests (for owner or requester)
// @route   GET /api/donations
// @access  Private
exports.getDonationRequests = asyncHandler(async (req, res) => {
  const { type = 'received' } = req.query; // received | sent

  let query;
  if (type === 'sent') {
    query = { requester: req.user.id };
  } else {
    query = { owner: req.user.id };
  }

  const requests = await DonationRequest.find(query)
    .populate('product', 'name images category location status')
    .populate('requester', 'name location')
    .populate('owner', 'name location')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: requests.length, data: requests });
});

// @desc    Update donation request status
// @route   PUT /api/donations/:id
// @access  Private (owner)
exports.updateDonationRequest = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['Accepted', 'Rejected', 'Completed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const request = await DonationRequest.findById(req.params.id)
    .populate('product')
    .populate('requester', 'name');

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  if (request.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (request.status !== 'Pending' && status !== 'Completed') {
    return res.status(400).json({ success: false, message: 'Request already processed' });
  }

  request.status = status;
  await request.save();

  // Update product status
  if (status === 'Accepted') {
    await Product.findByIdAndUpdate(request.product._id, { status: 'reserved' });
    await Notification.create({
      recipient: request.requester._id,
      sender: req.user.id,
      type: 'donation_accepted',
      title: 'Donation Request Accepted',
      message: `Your request for "${request.product.name}" was accepted`,
      link: `/products/${request.product._id}`,
      relatedId: request._id,
    });
  } else if (status === 'Rejected') {
    await Notification.create({
      recipient: request.requester._id,
      sender: req.user.id,
      type: 'donation_rejected',
      title: 'Donation Request Rejected',
      message: `Your request for "${request.product.name}" was rejected`,
      relatedId: request._id,
    });
  } else if (status === 'Completed') {
    await Product.findByIdAndUpdate(request.product._id, { status: 'completed' });

    // Award points to owner
    const points = 100;
    try {
      await RewardTransaction.create({
        user: request.owner,
        points,
        type: 'donation_completed',
        description: `Completed donation of "${request.product.name}"`,
        relatedProduct: request.product._id,
        relatedRequest: request._id,
      });
      await User.findByIdAndUpdate(request.owner, { $inc: { rewardPoints: points } });
    } catch (e) {
      // Duplicate reward ignored
    }
  }

  res.status(200).json({ success: true, data: request });
});
