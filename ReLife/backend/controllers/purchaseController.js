const PurchaseRequest = require('../models/PurchaseRequest');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create purchase request
// @route   POST /api/purchases
// @access  Private
exports.createPurchaseRequest = asyncHandler(async (req, res) => {
  const { productId, message, offeredPrice } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (product.action !== 'Sell') {
    return res.status(400).json({ success: false, message: 'This item is not for sale' });
  }

  if (product.status !== 'available') {
    return res.status(400).json({ success: false, message: 'Item is no longer available' });
  }

  if (product.owner.toString() === req.user.id) {
    return res.status(400).json({ success: false, message: 'Cannot purchase your own item' });
  }

  const existing = await PurchaseRequest.findOne({
    product: productId,
    buyer: req.user.id,
    status: 'Pending',
  });
  if (existing) {
    return res.status(400).json({ success: false, message: 'You already have a pending request' });
  }

  const request = await PurchaseRequest.create({
    product: productId,
    buyer: req.user.id,
    seller: product.owner,
    message: message || '',
    offeredPrice: offeredPrice || product.price,
  });

  await Notification.create({
    recipient: product.owner,
    sender: req.user.id,
    type: 'purchase_request',
    title: 'New Purchase Request',
    message: `${req.user.name} wants to buy "${product.name}"`,
    link: `/sell-purchase`,
    relatedId: request._id,
  });

  res.status(201).json({ success: true, data: request });
});

// @desc    Get purchase requests
// @route   GET /api/purchases
// @access  Private
exports.getPurchaseRequests = asyncHandler(async (req, res) => {
  const { type = 'received' } = req.query;

  const query = type === 'sent' ? { buyer: req.user.id } : { seller: req.user.id };

  const requests = await PurchaseRequest.find(query)
    .populate('product', 'name images category location price status')
    .populate('buyer', 'name location')
    .populate('seller', 'name location')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: requests.length, data: requests });
});

// @desc    Update purchase request
// @route   PUT /api/purchases/:id
// @access  Private (seller)
exports.updatePurchaseRequest = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['Accepted', 'Rejected', 'Completed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const request = await PurchaseRequest.findById(req.params.id)
    .populate('product')
    .populate('buyer', 'name');

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  if (request.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  request.status = status;
  await request.save();

  if (status === 'Accepted') {
    await Product.findByIdAndUpdate(request.product._id, { status: 'reserved' });
    await Notification.create({
      recipient: request.buyer._id,
      sender: req.user.id,
      type: 'purchase_accepted',
      title: 'Purchase Request Accepted',
      message: `Your request for "${request.product.name}" was accepted. Contact the seller to complete the transaction.`,
      link: `/products/${request.product._id}`,
      relatedId: request._id,
    });
  } else if (status === 'Rejected') {
    await Notification.create({
      recipient: request.buyer._id,
      sender: req.user.id,
      type: 'purchase_rejected',
      title: 'Purchase Request Rejected',
      message: `Your request for "${request.product.name}" was rejected`,
      relatedId: request._id,
    });
  } else if (status === 'Completed') {
    await Product.findByIdAndUpdate(request.product._id, { status: 'completed' });
  }

  res.status(200).json({ success: true, data: request });
});
