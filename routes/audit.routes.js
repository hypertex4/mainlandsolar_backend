const router = require('express').Router();
const ctrl = require('../controllers/audit.controller');
const { validate, validateQuery } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const v = require('../validators/audit.validator');

router.get('/time-slots', validateQuery(v.getTimeSlots), ctrl.getTimeSlots);
router.post('/book', validate(v.bookAudit), ctrl.bookAudit);
router.get('/bookings', authenticate, ctrl.getUserBookings);

module.exports = router;
