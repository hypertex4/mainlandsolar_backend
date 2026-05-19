const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const v = require('../validators/order.validator');

router.post('/', authenticate, validate(v.createOrder), ctrl.createOrder);
router.get('/', authenticate, ctrl.listOrders);
router.get('/:id', authenticate, ctrl.getOrder);
router.put('/:id/cancel', authenticate, ctrl.cancelOrder);

module.exports = router;
