const Product = require('../models/Product');
const DonationRequest = require('../models/DonationRequest');
const PurchaseRequest = require('../models/PurchaseRequest');
const ServiceRequest = require('../models/ServiceRequest');
const RewardTransaction = require('../models/RewardTransaction');
const asyncHandler = require('../utils/asyncHandler');

// Approximate impact estimates (documented)
// Average weight estimates by category (kg)
const WEIGHT_ESTIMATES = {
  'Clothes and Fashion': 0.5,
  'Books and Stationery': 0.3,
  'Food and Groceries': 1.0,
  Electronics: 2.0,
  Furniture: 15.0,
  'Home Appliances': 8.0,
  'Toys and Accessories': 0.4,
  'Other Items': 1.0,
};
// CO2 kg per kg of waste diverted (rough average)
const CO2_PER_KG = 2.5;

// @desc    Get user dashboard stats
// @route   GET /api/dashboard
// @access  Private
exports.getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [
    totalListed,
    donated,
    sold,
    repairRequests,
    recycleRequests,
    upcycleRequests,
    rewards,
  ] = await Promise.all([
    Product.countDocuments({ owner: userId, status: { $ne: 'removed' } }),
    Product.countDocuments({ owner: userId, action: 'Donate', status: 'completed' }),
    Product.countDocuments({ owner: userId, action: 'Sell', status: 'completed' }),
    ServiceRequest.countDocuments({ user: userId, type: 'Repair' }),
    ServiceRequest.countDocuments({ user: userId, type: 'Recycle' }),
    ServiceRequest.countDocuments({ user: userId, type: 'Upcycle' }),
    RewardTransaction.find({ user: userId }).sort('-createdAt').limit(20),
  ]);

  // Calculate environmental impact from completed items
  const completedProducts = await Product.find({
    owner: userId,
    status: 'completed',
  });

  let wasteDiverted = 0;
  completedProducts.forEach((p) => {
    wasteDiverted += WEIGHT_ESTIMATES[p.category] || 1.0;
  });
  const co2Avoided = Math.round(wasteDiverted * CO2_PER_KG * 10) / 10;

  // Money saved (for sold items - rough, using listing price)
  const soldItems = await Product.find({
    owner: userId,
    action: 'Sell',
    status: 'completed',
  });
  const moneyEarned = soldItems.reduce((sum, p) => sum + (p.price || 0), 0);

  res.status(200).json({
    success: true,
    data: {
      totalListed,
      itemsDonated: donated,
      itemsSold: sold,
      repairRequests,
      recycleRequests,
      upcycleRequests,
      rewardPoints: req.user.rewardPoints,
      moneyEarned,
      wasteDivertedKg: Math.round(wasteDiverted * 10) / 10,
      co2AvoidedKg: co2Avoided,
      rewardHistory: rewards,
      impactNote:
        'Environmental impact values are estimates based on average item weights and industry CO₂ factors. They are illustrative, not exact measurements.',
    },
  });
});

// @desc    Get sustainability overview (public-ish)
// @route   GET /api/dashboard/sustainability
// @access  Private
exports.getSustainability = asyncHandler(async (req, res) => {
  const completed = await Product.find({ status: 'completed' });

  let totalWaste = 0;
  const byCategory = {};
  completed.forEach((p) => {
    const w = WEIGHT_ESTIMATES[p.category] || 1.0;
    totalWaste += w;
    byCategory[p.category] = (byCategory[p.category] || 0) + w;
  });

  res.status(200).json({
    success: true,
    data: {
      totalItemsReused: completed.length,
      wasteDivertedKg: Math.round(totalWaste * 10) / 10,
      co2AvoidedKg: Math.round(totalWaste * CO2_PER_KG * 10) / 10,
      byCategory,
      note: 'These are platform-wide estimates based on average weights. Not exact measurements.',
    },
  });
});
