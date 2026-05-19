const Joi = require('joi');

const password = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .message("Password must be at least 8 characters with uppercase, lowercase, and a number");

const signup = Joi.object({
  firstname: Joi.string().trim().min(2).max(100).required(),
  lastname: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  password: password.required(),
});

const activateAccount = Joi.object({
  email: Joi.string().email().lowercase().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});

const resendOTP = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

const login = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

const googleLogin = Joi.object({
  id_token: Joi.string().required(),
});

const refreshToken = Joi.object({
  refresh_token: Joi.string().required(),
});

const logout = Joi.object({
  refresh_token: Joi.string().required(),
});

const forgotPassword = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

const verifyResetOTP = Joi.object({
  email: Joi.string().email().lowercase().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});

const resetPassword = Joi.object({
  reset_token: Joi.string().required(),
  password: password.required(),
  confirm_password: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Passwords do not match' }),
});

const updateProfile = Joi.object({
  firstname: Joi.string().trim().min(2).max(100),
  lastname: Joi.string().trim().min(2).max(100),
  avatar: Joi.string().uri().allow('', null),
}).min(1);

const updatePassword = Joi.object({
  current_password: Joi.string().required(),
  new_password: password.required(),
  confirm_password: Joi.any()
    .valid(Joi.ref('new_password'))
    .required()
    .messages({ 'any.only': 'Passwords do not match' }),
});

module.exports = {
  signup,
  activateAccount,
  resendOTP,
  login,
  googleLogin,
  refreshToken,
  logout,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  updateProfile,
  updatePassword,
};
