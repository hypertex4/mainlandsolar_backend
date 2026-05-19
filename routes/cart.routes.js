const router = require('express').Router();
const ctrl = require('../controllers/cart.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const v = require('../validators/cart.validator');

router.get('/', ctrl.getCart);
router.post('/items', validate(v.addItem), ctrl.addToCart);
router.put('/items/:id', validate(v.updateItem), ctrl.updateCartItem);
router.delete('/items/:id', ctrl.removeCartItem);
router.delete('/', ctrl.clearCart);
router.post('/merge', authenticate, ctrl.mergeCart);

module.exports = router;
