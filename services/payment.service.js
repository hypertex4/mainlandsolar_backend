const crypto = require('crypto');
const { pool } = require('../config/database');
const orderRepo = require('../repositories/order.repository');
const paymentRepo = require('../repositories/payment.repository');
const AppError = require('../utils/AppError');
const env = require('../config/env');

const initiatePayment = async (userId, orderId) => {
  const order = await orderRepo.findById(orderId, userId);
  if (!order) throw new AppError('Order not found', 404);
  if (order.payment_status !== 'unpaid' && order.payment_status !== 'pending_confirmation') {
    throw new AppError('Order has already been paid or refunded', 400);
  }

  const reference = `MS_${Date.now()}_${orderId}`;
  const amountInKobo = Math.round(parseFloat(order.total) * 100);

  const [userRows] = await pool.query(
    'SELECT email FROM users WHERE id = ? LIMIT 1',
    [userId]
  );
  if (!userRows[0]) throw new AppError('User not found', 404);
  const email = userRows[0].email;

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amountInKobo,
      reference,
      callback_url: env.PAYMENT_CALLBACK_URL,
    }),
  });

  const result = await response.json();
  if (!result.status) {
    throw new AppError(result.message || 'Payment initialization failed', 502);
  }

  await paymentRepo.create(orderId, reference, order.total);

  return {
    payment_url: result.data.authorization_url,
    reference,
  };
};

const handleCallback = async (reference) => {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
    },
  });

  const result = await response.json();
  if (!result.status) {
    throw new AppError(result.message || 'Payment verification failed', 502);
  }

  const payment = await paymentRepo.findByReference(reference);
  if (!payment) throw new AppError('Payment record not found', 404);

  const gatewayData = result.data;
  const isSuccess = gatewayData.status === 'success';
  const newStatus = isSuccess ? 'success' : 'failed';
  const paidAt = isSuccess ? new Date() : null;

  await paymentRepo.updateStatus(payment.id, newStatus, gatewayData, paidAt);

  if (isSuccess) {
    await orderRepo.updatePaymentStatus(payment.order_id, 'confirmed');
    await orderRepo.updateStatus(payment.order_id, 'confirmed');
  }

  return orderRepo.findByIdAdmin(payment.order_id);
};

const handleWebhook = async (rawBody, signature) => {
  const expectedSignature = crypto
    .createHmac('sha512', env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new AppError('Invalid webhook signature', 401);
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    throw new AppError('Invalid webhook payload', 400);
  }

  const { event: eventType, data } = event;

  if (eventType === 'charge.success') {
    const payment = await paymentRepo.findByReference(data.reference);
    if (payment && payment.status !== 'success') {
      await paymentRepo.updateStatus(payment.id, 'success', data, new Date());
      await orderRepo.updatePaymentStatus(payment.order_id, 'paid');
      await orderRepo.updateStatus(payment.order_id, 'confirmed');
    }
  } else if (eventType === 'charge.failed') {
    const payment = await paymentRepo.findByReference(data.reference);
    if (payment && payment.status === 'pending') {
      await paymentRepo.updateStatus(payment.id, 'failed', data, null);
    }
  }
};

module.exports = { initiatePayment, handleCallback, handleWebhook };
