const Joi = require('joi');

const createAddress = Joi.object({
  label: Joi.string().trim().max(50).allow('', null),
  full_name: Joi.string().trim().max(200).required(),
  phone: Joi.string().trim().max(20).required(),
  address_line: Joi.string().trim().max(255).required(),
  city: Joi.string().trim().max(100).required(),
  state: Joi.string().trim().max(100).required(),
  is_default: Joi.boolean().default(false),
});

const updateAddress = Joi.object({
  label: Joi.string().trim().max(50).allow('', null),
  full_name: Joi.string().trim().max(200),
  phone: Joi.string().trim().max(20),
  address_line: Joi.string().trim().max(255),
  city: Joi.string().trim().max(100),
  state: Joi.string().trim().max(100),
  is_default: Joi.boolean(),
});

module.exports = { createAddress, updateAddress };
