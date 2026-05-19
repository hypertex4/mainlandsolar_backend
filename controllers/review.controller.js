const reviewService = require('../services/review.service');
const { success } = require('../utils/response');

const getProductReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getProductReviews(req.params.slug, req.query);
    success(res, 'Reviews fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

const submitReview = async (req, res, next) => {
  try {
    const result = await reviewService.submitReview(req.params.slug, req.user.id, req.body);
    success(res, 'Review submitted successfully. It will be visible after approval.', result, 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { getProductReviews, submitReview };
