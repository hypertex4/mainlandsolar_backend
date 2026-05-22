const Joi = require('joi');

const addItem = Joi.object({
  product_id: Joi.number().integer().min(1).required(),
  quantity: Joi.number().integer().min(1).required(),
});

const updateItem = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
});

module.exports = { addItem, updateItem };
