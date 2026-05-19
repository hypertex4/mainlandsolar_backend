const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/initiate', authenticate, ctrl.initiatePayment);
router.get('/callback', ctrl.handleCallback);
router.post('/webhook', express.raw({ type: '*/*' }), ctrl.handleWebhook);

module.exports = router;
