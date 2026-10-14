const express = require('express');
const {
  createDonationRequest,
  getDonationRequests,
  updateDonationRequest,
} = require('../controllers/donationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/', createDonationRequest);
router.get('/', getDonationRequests);
router.put('/:id', updateDonationRequest);

module.exports = router;
