const Favorite = require('../models/Favorite');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Toggle favorite
// @route   POST /api/favorites/:productId
// @access  Private
exports.toggleFavorite = asyncHandler(async (req, res) => {
  const existing = await Favorite.findOne({
    user: req.user.id,
    product: req.params.productId,
  });

  if (existing) {
    await existing.deleteOne();
    return res.status(200).json({ success: true, favorited: false, message: 'Removed from favorites' });
  }

  await Favorite.create({
    user: req.user.id,
    product: req.params.productId,
  });

  res.status(201).json({ success: true, favorited: true, message: 'Added to favorites' });
});

// @desc    Get my favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user.id })
    .populate({
      path: 'product',
      populate: { path: 'owner', select: 'name location' },
    })
    .sort('-createdAt');

  // Filter out null products (deleted)
  const valid = favorites.filter((f) => f.product);

  res.status(200).json({
    success: true,
    count: valid.length,
    data: valid,
  });
});
