const express = require('express');
const { getMyRewards, getLeaderboard } = require('../controllers/rewardsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/leaderboard', protect, getLeaderboard);
router.get('/', protect, getMyRewards);

module.exports = router;
