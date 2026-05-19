const router = require('express').Router();
const ctrl = require('../controllers/wishlist.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', authenticate, ctrl.getWishlist);
router.post('/', authenticate, ctrl.addToWishlist);
router.delete('/:productId', authenticate, ctrl.removeFromWishlist);

module.exports = router;
