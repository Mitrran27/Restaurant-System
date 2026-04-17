const router = require('express').Router();
const {
  getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem,
  getCategories, createCategory, updateCategory,
} = require('../controllers/menuController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

router.get('/categories', getCategories);
router.post('/categories', authenticate, authorize('ADMIN'), createCategory);
router.put('/categories/:id', authenticate, authorize('ADMIN'), updateCategory);

router.get('/', optionalAuth, getMenuItems);
router.get('/:id', getMenuItem);
router.post('/', authenticate, authorize('ADMIN'), createMenuItem);
router.put('/:id', authenticate, authorize('ADMIN'), updateMenuItem);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteMenuItem);

module.exports = router;
