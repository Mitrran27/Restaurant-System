const router = require('express').Router();
const { getBranches, createBranch, updateBranch } = require('../controllers/branchController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', getBranches);
router.post('/', authenticate, authorize('ADMIN'), createBranch);
router.put('/:id', authenticate, authorize('ADMIN'), updateBranch);

module.exports = router;
