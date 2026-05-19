const authService = require('../services/auth.service');
const { success } = require('../utils/response');

const getMeta = (req) => ({
  ip: req.ip || req.headers['x-forwarded-for'] || null,
  userAgent: req.headers['user-agent'] || null,
});

const signup = async (req, res, next) => {
  try {
    await authService.signup(req.body, getMeta(req));
    success(res, 'Account created. Please check your email to activate your account.', null, 201);
  } catch (err) {
    next(err);
  }
};

const activateAccount = async (req, res, next) => {
  try {
    await authService.activateAccount(req.body, getMeta(req));
    success(res, 'Account activated successfully. You can now log in.');
  } catch (err) {
    next(err);
  }
};

const resendActivationOTP = async (req, res, next) => {
  try {
    await authService.resendActivationOTP(req.body, getMeta(req));
    success(res, 'Activation code resent. Please check your email.');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body, getMeta(req));
    success(res, 'Login successful', data);
  } catch (err) {
    next(err);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const data = await authService.googleLogin(req.body, getMeta(req));
    success(res, 'Google login successful', data);
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const data = await authService.refreshToken(req.body);
    success(res, 'Token refreshed', data);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.body, getMeta(req));
    success(res, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body, getMeta(req));
    success(res, 'If that email is registered, a reset code has been sent.');
  } catch (err) {
    next(err);
  }
};

const verifyResetOTP = async (req, res, next) => {
  try {
    const data = await authService.verifyResetOTP(req.body, getMeta(req));
    success(res, 'OTP verified successfully', data);
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body, getMeta(req));
    success(res, 'Password reset successful. Please log in with your new password.');
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    success(res, 'Profile fetched successfully', user);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body, getMeta(req));
    success(res, 'Profile updated successfully', user);
  } catch (err) {
    next(err);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    await authService.updatePassword(req.user.id, req.body, getMeta(req));
    success(res, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  activateAccount,
  resendActivationOTP,
  login,
  googleLogin,
  refreshToken,
  logout,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  getProfile,
  updateProfile,
  updatePassword,
};
