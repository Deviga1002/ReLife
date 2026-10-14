const express = require('express');
const {
  getAvailableSlots,
  createPickup,
  getMyPickups,
  getPickup,
  reschedulePickup,
  cancelPickup,
  verifyPickup,
  confirmPickup,
} = require('../controllers/pickupController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/slots', getAvailableSlots);
router.get('/', getMyPickups);
router.post('/', createPickup);
router.post('/verify', verifyPickup);
router.get('/:id', getPickup);
router.put('/:id/reschedule', reschedulePickup);
router.put('/:id/cancel', cancelPickup);
router.put('/:id/confirm', confirmPickup);

module.exports = router;
