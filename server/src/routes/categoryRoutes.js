const router = require('express').Router();
const { getCategories, createCategory, updateCategory } = require('../controllers/menuController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', getCategories);
router.post('/', authenticate, authorize('ADMIN'), createCategory);
router.put('/:id', authenticate, authorize('ADMIN'), updateCategory);

module.exports = router;
