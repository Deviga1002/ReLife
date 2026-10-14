const User = require('../models/User');
const Product = require('../models/Product');
const DonationRequest = require('../models/DonationRequest');
const PurchaseRequest = require('../models/PurchaseRequest');
const ServiceRequest = require('../models/ServiceRequest');
const Report = require('../models/Report');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProducts,
    availableProducts,
    completedProducts,
    pendingDonations,
    pendingPurchases,
    pendingServices,
    pendingReports,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ status: { $ne: 'removed' } }),
    Product.countDocuments({ status: 'available' }),
    Product.countDocuments({ status: 'completed' }),
    DonationRequest.countDocuments({ status: 'Pending' }),
    PurchaseRequest.countDocuments({ status: 'Pending' }),
    ServiceRequest.countDocuments({ status: 'Pending' }),
    Report.countDocuments({ status: 'Pending' }),
  ]);

  // Recent activity
  const recentProducts = await Product.find()
    .sort('-createdAt')
    .limit(5)
    .populate('owner', 'name');
  const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email createdAt');

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalProducts,
      availableProducts,
      completedProducts,
      pendingDonations,
      pendingPurchases,
      pendingServices,
      pendingReports,
      recentProducts,
      recentUsers,
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: users,
  });
});

// @desc    Update user (activate/deactivate, role)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
  const allowedRoles = ['user', 'admin', 'ngo', 'service_provider', 'delivery_partner'];
  if (req.body.role && allowedRoles.includes(req.body.role)) {
    user.role = req.body.role;
  }

  await user.save();

  res.status(200).json({ success: true, data: user });
});

// @desc    Get all products for moderation
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getProducts = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('owner', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    data: products,
  });
});

// @desc    Remove product (admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.removeProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  product.status = 'removed';
  await product.save();
  res.status(200).json({ success: true, message: 'Product removed' });
});

// @desc    Get reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = asyncHandler(async (req, res) => {
  const reports = await Report.find()
    .populate('reporter', 'name email')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: reports.length, data: reports });
});

// @desc    Update report
// @route   PUT /api/admin/reports/:id
// @access  Private/Admin
exports.updateReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }
  if (req.body.status) report.status = req.body.status;
  if (req.body.adminNotes) report.adminNotes = req.body.adminNotes;
  await report.save();
  res.status(200).json({ success: true, data: report });
});

// @desc    Export users CSV
// @route   GET /api/admin/export/users
// @access  Private/Admin
exports.exportUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('name email phone location role rewardPoints createdAt isActive');
  const header = 'Name,Email,Phone,Location,Role,Points,Joined,Active\n';
  const rows = users
    .map(
      (u) =>
        `"${u.name}","${u.email}","${u.phone}","${u.location}","${u.role}",${u.rewardPoints},"${u.createdAt.toISOString()}",${u.isActive}`
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=relife-users.csv');
  res.send(header + rows);
});
