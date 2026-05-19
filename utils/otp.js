const crypto = require('crypto');

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const getOTPExpiry = (minutes = 10) => new Date(Date.now() + minutes * 60 * 1000);

module.exports = { generateOTP, getOTPExpiry };
