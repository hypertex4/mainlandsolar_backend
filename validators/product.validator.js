const Joi = require('joi');

const listProducts = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  category: Joi.number().integer().min(1),
  brand: Joi.number().integer().min(1),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  capacity: Joi.string().trim().max(50),
  search: Joi.string().trim().max(200),
  sort: Joi.string().valid('price_asc', 'price_desc', 'newest', 'popular'),
  isFeatured: Joi.number().valid(0, 1),
});

module.exports = { listProducts };
