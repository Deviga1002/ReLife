const express = require('express');
const {
  createPurchaseRequest,
  getPurchaseRequests,
  updatePurchaseRequest,
} = require('../controllers/purchaseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/', createPurchaseRequest);
router.get('/', getPurchaseRequests);
router.put('/:id', updatePurchaseRequest);

module.exports = router;
