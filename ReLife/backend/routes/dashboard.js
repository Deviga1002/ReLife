const express = require('express');
const { getDashboard, getSustainability } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/', getDashboard);
router.get('/sustainability', getSustainability);

module.exports = router;
