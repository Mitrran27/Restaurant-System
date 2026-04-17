const router = require('express').Router();
const {
  getDashboardStats, getRevenueChart, getBestSellers, getPeakHours, getOrderTypeStats,
} = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/stats', authenticate, authorize('ADMIN', 'CASHIER'), getDashboardStats);
router.get('/revenue', authenticate, authorize('ADMIN', 'CASHIER'), getRevenueChart);
router.get('/best-sellers', authenticate, authorize('ADMIN', 'CASHIER'), getBestSellers);
router.get('/peak-hours', authenticate, authorize('ADMIN'), getPeakHours);
router.get('/order-types', authenticate, authorize('ADMIN', 'CASHIER'), getOrderTypeStats);

module.exports = router;
