const orderService = require('../services/order.service');
const { success } = require('../utils/response');

const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    success(res, 'Order created successfully', order, 201);
  } catch (err) {
    next(err);
  }
};

const listOrders = async (req, res, next) => {
  try {
    const result = await orderService.listOrders(req.user.id, req.query);
    success(res, 'Orders fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrder(req.user.id, parseInt(req.params.id));
    success(res, 'Order fetched successfully', order);
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.user.id, parseInt(req.params.id));
    success(res, 'Order cancelled successfully', order);
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, listOrders, getOrder, cancelOrder };
