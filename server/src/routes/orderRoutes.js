const router = require('express').Router();
const {
  getOrders, getMyOrders, getOrder, createOrder,
  updateOrderStatus, cancelOrder, getKitchenOrders, updatePayment,
} = require('../controllers/orderController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

router.get('/kitchen', authenticate, authorize('ADMIN', 'KITCHEN', 'CASHIER'), getKitchenOrders);
router.get('/my', authenticate, getMyOrders);
router.get('/', authenticate, authorize('ADMIN', 'CASHIER', 'KITCHEN'), getOrders);
router.get('/:id', optionalAuth, getOrder);
router.post('/', optionalAuth, createOrder);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'CASHIER', 'KITCHEN'), updateOrderStatus);
router.patch('/:id/cancel', optionalAuth, cancelOrder);
router.patch('/:id/payment', authenticate, authorize('ADMIN', 'CASHIER'), updatePayment);

module.exports = router;
