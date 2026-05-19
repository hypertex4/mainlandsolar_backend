const Joi = require('joi');

const submitReview = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().trim().max(255).allow('', null),
  body: Joi.string().trim().max(2000).allow('', null),
});

module.exports = { submitReview };
