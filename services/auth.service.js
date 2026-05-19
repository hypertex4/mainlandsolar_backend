const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const userRepo = require('../repositories/user.repository');
const otpRepo = require('../repositories/otp.repository');
const tokenRepo = require('../repositories/token.repository');
const emailService = require('./email.service');
const activityService = require('./activity.service');
const jwtUtil = require('../utils/jwt');
const { generateOTP } = require('../utils/otp');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const env = require('../config/env');

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// Accepts both Google ID tokens (Sign-In button / One Tap) and
// access tokens (OAuth 2.0 flow) by trying ID token verification first,
// then falling back to the Google userinfo endpoint.
const resolveGoogleToken = async (token) => {
  // 1. Try ID token verification
  if (env.GOOGLE_CLIENT_ID) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      return ticket.getPayload();
    } catch (err) {
      logger.warn(`[Google] ID token verify failed: ${err.message}`);
    }
  } else {
    logger.warn('[Google] GOOGLE_CLIENT_ID is not set — skipping ID token verification');
  }

  // 2. Fallback: treat as access token — fetch profile from Google userinfo API
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Google userinfo API returned HTTP ${res.status}`);
    const profile = await res.json();
    if (!profile.sub) throw new Error('Google profile missing sub (user ID)');
    logger.info(`[Google] Resolved via access token for ${profile.email}`);
    return profile;
  } catch (err) {
    logger.error(`[Google] Access token verify failed: ${err.message}`);
    throw new AppError('Invalid Google token', 401);
  }
};

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const formatUser = (user) => ({
  id: user.id,
  firstname: user.firstname,
  lastname: user.lastname,
  email: user.email,
  avatar: user.avatar || null,
  is_active: Boolean(user.is_active),
  created_at: user.created_at,
});

const signup = async ({ firstname, lastname, email, password }, meta = {}) => {
  const existing = await userRepo.findByEmail(email);

  if (existing) {
    if (existing.is_active) throw new AppError('Email already registered', 409);

    // Account exists but was never activated — update details and resend OTP
    const hashed = await bcrypt.hash(password, 12);
    await userRepo.update(existing.id, { firstname, lastname, password: hashed });

    const otp = generateOTP();
    await otpRepo.upsert(existing.id, otp, 'activation', 10);
    await emailService.sendActivationOTP(email, firstname, otp);

    await activityService.log(existing.id, 'signup_retry', { email }, meta);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const userId = await userRepo.create({ firstname, lastname, email, password: hashed });

  const otp = generateOTP();
  await otpRepo.upsert(userId, otp, 'activation', 10);
  await emailService.sendActivationOTP(email, firstname, otp);

  await activityService.log(userId, 'signup', { email }, meta);
};

const activateAccount = async ({ email, otp }, meta = {}) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new AppError('Invalid email or OTP', 400);
  if (user.is_active) throw new AppError('Account is already activated', 400);

  const record = await otpRepo.findValid(user.id, otp, 'activation');
  if (!record) throw new AppError('Invalid or expired OTP', 400);

  await otpRepo.markUsed(record.id);
  await userRepo.activate(user.id);

  await emailService.sendWelcomeMail(email, user.firstname);
  await activityService.log(user.id, 'account_activated', {}, meta);
};

const resendActivationOTP = async ({ email }, meta = {}) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new AppError('No account found with this email', 404);
  if (user.is_active) throw new AppError('Account is already activated', 400);

  const otp = generateOTP();
  await otpRepo.upsert(user.id, otp, 'activation', 10);
  await emailService.sendActivationOTP(email, user.firstname, otp);

  await activityService.log(user.id, 'resend_activation_otp', {}, meta);
};

const login = async ({ email, password }, meta = {}) => {
  const user = await userRepo.findByEmail(email);

  if (!user || !user.password) {
    await activityService.log(null, 'login_failed', { email, reason: 'user_not_found' }, meta);
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.is_active) {
    await activityService.log(user.id, 'login_failed', { reason: 'account_not_activated' }, meta);
    throw new AppError('Account not activated. Please check your email.', 403);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    await activityService.log(user.id, 'login_failed', { reason: 'wrong_password' }, meta);
    throw new AppError('Invalid email or password', 401);
  }

  const payload = { id: user.id, email: user.email };
  const accessToken = jwtUtil.generateAccessToken(payload);
  const refreshToken = jwtUtil.generateRefreshToken(payload);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await tokenRepo.save(user.id, refreshToken, expiresAt);

  await activityService.log(user.id, 'login', {}, meta);

  return { access_token: accessToken, refresh_token: refreshToken, user: formatUser(user) };
};

const googleLogin = async ({ id_token }, meta = {}) => {
  const {
    sub: googleId,
    email,
    given_name,
    family_name,
    name,
    picture: avatar,
  } = await resolveGoogleToken(id_token);

  const firstname = given_name || (name ? name.split(' ')[0] : 'User');
  const lastname = family_name || (name ? name.split(' ').slice(1).join(' ') : '');

  let user = await userRepo.findByGoogleId(googleId);

  if (!user) {
    user = await userRepo.findByEmail(email);
    if (user) {
      await userRepo.update(user.id, { google_id: googleId, avatar: avatar || user.avatar });
    } else {
      const userId = await userRepo.create({ firstname, lastname, email, password: null });
      await userRepo.update(userId, { google_id: googleId, avatar: avatar || null, is_active: 1 });
    }
    user = await userRepo.findByEmail(email);
  }

  if (!user.is_active) {
    await userRepo.activate(user.id);
    user = await userRepo.findByEmail(email);
  }

  const payload = { id: user.id, email: user.email };
  const accessToken = jwtUtil.generateAccessToken(payload);
  const refreshToken = jwtUtil.generateRefreshToken(payload);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await tokenRepo.save(user.id, refreshToken, expiresAt);

  await activityService.log(user.id, 'google_login', { email }, meta);

  return { access_token: accessToken, refresh_token: refreshToken, user: formatUser(user) };
};

const refreshToken = async ({ refresh_token }) => {
  let decoded;
  try {
    decoded = jwtUtil.verifyRefreshToken(refresh_token);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const stored = await tokenRepo.findByToken(refresh_token);
  if (!stored) throw new AppError('Refresh token not found or revoked', 401);

  await tokenRepo.deleteByToken(refresh_token);

  const payload = { id: decoded.id, email: decoded.email };
  const newAccessToken = jwtUtil.generateAccessToken(payload);
  const newRefreshToken = jwtUtil.generateRefreshToken(payload);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await tokenRepo.save(decoded.id, newRefreshToken, expiresAt);

  return { access_token: newAccessToken, refresh_token: newRefreshToken };
};

const logout = async ({ refresh_token }, meta = {}) => {
  await tokenRepo.deleteByToken(refresh_token);

  try {
    const decoded = jwtUtil.verifyRefreshToken(refresh_token);
    await activityService.log(decoded.id, 'logout', {}, meta);
  } catch {
    // Token already expired — logout still succeeded, skip logging
  }
};

const forgotPassword = async ({ email }, meta = {}) => {
  const user = await userRepo.findByEmail(email);
  if (!user || !user.is_active) return; // silent — prevent user enumeration

  const otp = generateOTP();
  await otpRepo.upsert(user.id, otp, 'password_reset', 10);
  await emailService.sendPasswordResetOTP(email, user.firstname, otp);

  await activityService.log(user.id, 'forgot_password', {}, meta);
};

const verifyResetOTP = async ({ email, otp }, meta = {}) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new AppError('Invalid email or OTP', 400);

  const record = await otpRepo.findValid(user.id, otp, 'password_reset');
  if (!record) throw new AppError('Invalid or expired OTP', 400);

  await otpRepo.markUsed(record.id);

  await activityService.log(user.id, 'verify_reset_otp', {}, meta);

  const resetToken = jwtUtil.generateResetToken({ id: user.id, email: user.email });
  return { reset_token: resetToken };
};

const resetPassword = async ({ reset_token, password }, meta = {}) => {
  let decoded;
  try {
    decoded = jwtUtil.verifyResetToken(reset_token);
  } catch {
    throw new AppError('Invalid or expired reset token. Please request a new one.', 400);
  }

  const hashed = await bcrypt.hash(password, 12);
  await userRepo.update(decoded.id, { password: hashed });
  await tokenRepo.deleteByUserId(decoded.id);

  await activityService.log(decoded.id, 'password_reset', {}, meta);
};

const getProfile = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const updateProfile = async (userId, data, meta = {}) => {
  await userRepo.update(userId, data);

  await activityService.log(userId, 'profile_updated', { fields: Object.keys(data) }, meta);

  return userRepo.findById(userId);
};

const updatePassword = async (userId, { current_password, new_password }, meta = {}) => {
  const user = await userRepo.findByIdFull(userId);
  if (!user) throw new AppError('User not found', 404);
  if (!user.password) throw new AppError('Cannot update password for social login accounts', 400);

  const match = await bcrypt.compare(current_password, user.password);
  if (!match) {
    await activityService.log(userId, 'password_update_failed', { reason: 'wrong_current_password' }, meta);
    throw new AppError('Current password is incorrect', 400);
  }

  const hashed = await bcrypt.hash(new_password, 12);
  await userRepo.update(userId, { password: hashed });

  await activityService.log(userId, 'password_updated', {}, meta);
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
