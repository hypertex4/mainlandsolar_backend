const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const v = require('../validators/auth.validator');

router.post('/signup',            validate(v.signup),          ctrl.signup);
router.post('/activate',          validate(v.activateAccount), ctrl.activateAccount);
router.post('/resend-otp',        validate(v.resendOTP),       ctrl.resendActivationOTP);
router.post('/login',             validate(v.login),           ctrl.login);
router.post('/google-login',      validate(v.googleLogin),     ctrl.googleLogin);
router.post('/refresh-token',     validate(v.refreshToken),    ctrl.refreshToken);
router.post('/logout',            validate(v.logout),          ctrl.logout);
router.post('/forgot-password',   validate(v.forgotPassword),  ctrl.forgotPassword);
router.post('/verify-reset-otp',  validate(v.verifyResetOTP),  ctrl.verifyResetOTP);
router.post('/reset-password',    validate(v.resetPassword),   ctrl.resetPassword);

router.get('/profile',   authenticate,                          ctrl.getProfile);
router.patch('/profile', authenticate, validate(v.updateProfile), ctrl.updateProfile);
router.patch('/password',authenticate, validate(v.updatePassword),ctrl.updatePassword);

module.exports = router;
