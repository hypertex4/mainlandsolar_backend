const router = require('express').Router();
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const addressRoutes = require('./address.routes');
const auditRoutes = require('./audit.routes');
const wishlistRoutes = require('./wishlist.routes');

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/addresses', addressRoutes);
router.use('/audit', auditRoutes);
router.use('/wishlist', wishlistRoutes);

module.exports = router;
