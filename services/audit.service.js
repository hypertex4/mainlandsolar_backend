const auditRepo = require('../repositories/audit.repository');
const AppError = require('../utils/AppError');

const ALL_SLOTS = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];
const MAX_PER_SLOT = 5;

const bookAudit = async (data, userId = null) => {
  const bookedSlots = await auditRepo.getBookedSlots(data.preferred_date);
  const slotMap = {};
  bookedSlots.forEach((s) => {
    slotMap[s.preferred_time] = parseInt(s.count);
  });

  const currentCount = slotMap[data.preferred_time] || 0;
  if (currentCount >= MAX_PER_SLOT) {
    throw new AppError('Selected time slot is fully booked. Please choose another slot.', 409);
  }

  const bookingId = await auditRepo.create({ ...data, user_id: userId });
  return auditRepo.findById(bookingId);
};

const getTimeSlots = async (date) => {
  const bookedSlots = await auditRepo.getBookedSlots(date);
  const slotMap = {};
  bookedSlots.forEach((s) => {
    slotMap[s.preferred_time] = parseInt(s.count);
  });

  return ALL_SLOTS.map((slot) => {
    const booked = slotMap[slot] || 0;
    return {
      time: slot,
      booked,
      available: MAX_PER_SLOT - booked,
      max: MAX_PER_SLOT,
      is_full: booked >= MAX_PER_SLOT,
    };
  });
};

const getUserBookings = async (userId) => {
  return auditRepo.findByUserId(userId);
};

module.exports = { bookAudit, getTimeSlots, getUserBookings };
