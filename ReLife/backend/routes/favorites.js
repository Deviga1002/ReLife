const express = require('express');
const { toggleFavorite, getFavorites } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/', getFavorites);
router.post('/:productId', toggleFavorite);

module.exports = router;
