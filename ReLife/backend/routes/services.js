const express = require('express');
const {
  createServiceRequest,
  getServiceRequests,
  getAllServiceRequests,
  updateServiceRequest,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);
router.post('/', upload.array('images', 3), createServiceRequest);
router.get('/', getServiceRequests);
router.get('/all', authorize('admin'), getAllServiceRequests);
router.put('/:id', updateServiceRequest);

module.exports = router;
