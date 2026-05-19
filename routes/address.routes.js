const router = require('express').Router();
const ctrl = require('../controllers/address.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const v = require('../validators/address.validator');

router.get('/', authenticate, ctrl.listAddresses);
router.post('/', authenticate, validate(v.createAddress), ctrl.createAddress);
router.put('/:id', authenticate, validate(v.updateAddress), ctrl.updateAddress);
router.delete('/:id', authenticate, ctrl.deleteAddress);

module.exports = router;
