const Joi = require('joi');

const BUILDING_TYPES = ['residential', 'commercial', 'industrial', 'mixed_use'];
const TIME_SLOTS = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];

const bookAudit = Joi.object({
  full_name: Joi.string().trim().max(200).required(),
  phone: Joi.string().trim().max(20).required(),
  email: Joi.string().email().lowercase().trim().required(),
  address: Joi.string().trim().max(255).required(),
  city: Joi.string().trim().max(100).required(),
  state: Joi.string().trim().max(100).required(),
  building_type: Joi.string().valid(...BUILDING_TYPES).required(),
  monthly_bill: Joi.number().min(0).allow(null),
  preferred_date: Joi.string().isoDate().required(),
  preferred_time: Joi.string().valid(...TIME_SLOTS).required(),
  notes: Joi.string().trim().max(1000).allow('', null),
});

const getTimeSlots = Joi.object({
  date: Joi.string().isoDate().required(),
});

module.exports = { bookAudit, getTimeSlots };
