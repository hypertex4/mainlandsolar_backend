const cartRepo = require('../repositories/cart.repository');
const addressRepo = require('../repositories/address.repository');
const orderRepo = require('../repositories/order.repository');
const AppError = require('../utils/AppError');

const createOrder = async (userId, { addressId, notes }) => {
  const address = await addressRepo.findById(addressId, userId);
  if (!address) throw new AppError('Address not found', 404);

  const userCart = await cartRepo.findByUserId(userId);
  if (!userCart) throw new AppError('Your cart is empty', 400);

  const items = await cartRepo.getItems(userCart.id);
  if (!items.length) throw new AppError('Your cart is empty', 400);

  const shippingAddress = {
    full_name: address.full_name,
    phone: address.phone,
    address_line: address.address_line,
    city: address.city,
    state: address.state,
    label: address.label || null,
  };

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.unit_price) * item.quantity, 0);
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  const orderItems = items.map((item) => ({
    product_id: item.product_id,
    product_name: item.product_name,
    product_sku: item.product_sku || null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: parseFloat(item.unit_price) * item.quantity,
  }));

  const orderId = await orderRepo.create(
    userId,
    { subtotal, shipping_fee: shippingFee, total, shipping_address: shippingAddress, notes },
    orderItems
  );

  await cartRepo.clearItems(userCart.id);

  return orderRepo.findById(orderId, userId);
};

const listOrders = async (userId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const { rows, total } = await orderRepo.findByUserId(userId, { page, limit });
  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getOrder = async (userId, orderId) => {
  const order = await orderRepo.findById(orderId, userId);
  if (!order) throw new AppError('Order not found', 404);
  return order;
};

const cancelOrder = async (userId, orderId) => {
  const order = await orderRepo.findById(orderId, userId);
  if (!order) throw new AppError('Order not found', 404);
  if (order.status !== 'pending') {
    throw new AppError('Only pending orders can be cancelled', 400);
  }
  await orderRepo.updateStatus(orderId, 'cancelled');
  return orderRepo.findById(orderId, userId);
};

module.exports = { createOrder, listOrders, getOrder, cancelOrder };
