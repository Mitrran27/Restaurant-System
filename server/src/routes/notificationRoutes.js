const router = require('express').Router();
const { getNotifications, markRead } = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getNotifications);
router.patch('/read', authenticate, markRead);

module.exports = router;
