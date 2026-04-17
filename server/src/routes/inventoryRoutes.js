const router = require('express').Router();
const { getInventory, updateInventory, toggleStock } = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('ADMIN', 'CASHIER', 'KITCHEN'), getInventory);
router.put('/:menuItemId', authenticate, authorize('ADMIN', 'CASHIER'), updateInventory);
router.patch('/:menuItemId/toggle', authenticate, authorize('ADMIN', 'CASHIER'), toggleStock);

module.exports = router;
