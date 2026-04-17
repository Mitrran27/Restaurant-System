const router = require('express').Router();
const { createReview, getReviews } = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createReview);
router.get('/item/:menuItemId', getReviews);

module.exports = router;
