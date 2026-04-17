const router = require('express').Router();
const { register, login, getMe, getStaff, createStaff } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.get('/staff', authenticate, authorize('ADMIN'), getStaff);
router.post('/staff', authenticate, authorize('ADMIN'), createStaff);

module.exports = router;
