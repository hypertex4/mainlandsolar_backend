const Joi = require('joi');

const createOrder = Joi.object({
  addressId: Joi.number().integer().min(1).required(),
  notes: Joi.string().trim().max(1000).allow('', null),
});

module.exports = { createOrder };
