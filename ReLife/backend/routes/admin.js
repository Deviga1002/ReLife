const express = require('express');
const {
  getStats,
  getUsers,
  updateUser,
  getProducts,
  removeProduct,
  getReports,
  updateReport,
  exportUsers,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/products', getProducts);
router.delete('/products/:id', removeProduct);
router.get('/reports', getReports);
router.put('/reports/:id', updateReport);
router.get('/export/users', exportUsers);

module.exports = router;
