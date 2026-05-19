const router = require('express').Router();
const ctrl = require('../controllers/product.controller');
const reviewCtrl = require('../controllers/review.controller');
const { validateQuery, validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const v = require('../validators/product.validator');
const rv = require('../validators/review.validator');

router.get('/featured', ctrl.getFeatured);
router.get('/search', validateQuery(v.listProducts), ctrl.listProducts);

router.get('/categories', ctrl.listCategories);
router.get('/categories/:slug', ctrl.getCategory);
router.get('/brands', ctrl.listBrands);

router.get('/:slug/reviews', reviewCtrl.getProductReviews);
router.post('/:slug/reviews', authenticate, validate(rv.submitReview), reviewCtrl.submitReview);
router.get('/:slug', ctrl.getProduct);

router.get('/', validateQuery(v.listProducts), ctrl.listProducts);

module.exports = router;
