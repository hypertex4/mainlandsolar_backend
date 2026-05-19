const auditService = require('../services/audit.service');
const { success } = require('../utils/response');

const bookAudit = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const booking = await auditService.bookAudit(req.body, userId);
    success(res, 'Audit booking created successfully', booking, 201);
  } catch (err) {
    next(err);
  }
};

const getTimeSlots = async (req, res, next) => {
  try {
    const slots = await auditService.getTimeSlots(req.query.date);
    success(res, 'Time slots fetched successfully', slots);
  } catch (err) {
    next(err);
  }
};

const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await auditService.getUserBookings(req.user.id);
    success(res, 'Bookings fetched successfully', bookings);
  } catch (err) {
    next(err);
  }
};

module.exports = { bookAudit, getTimeSlots, getUserBookings };
