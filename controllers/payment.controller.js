const paymentService = require('../services/payment.service');
const { success } = require('../utils/response');

const initiatePayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ status: 'error', message: 'orderId is required' });
    }
    const data = await paymentService.initiatePayment(req.user.id, parseInt(orderId));
    success(res, 'Payment initialized successfully', data);
  } catch (err) {
    next(err);
  }
};

const handleCallback = async (req, res, next) => {
  try {
    const { reference } = req.query;
    if (!reference) {
      return res.status(400).json({ status: 'error', message: 'reference is required' });
    }
    const order = await paymentService.handleCallback(reference);
    success(res, 'Payment verified successfully', order);
  } catch (err) {
    next(err);
  }
};

const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const rawBody = req.body.toString();
    await paymentService.handleWebhook(rawBody, signature);
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

module.exports = { initiatePayment, handleCallback, handleWebhook };
