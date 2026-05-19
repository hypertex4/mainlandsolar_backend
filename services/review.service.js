const reviewRepo = require('../repositories/review.repository');
const productRepo = require('../repositories/product.repository');
const AppError = require('../utils/AppError');

const getProductReviews = async (slug, query) => {
  const product = await productRepo.findBySlug(slug);
  if (!product) throw new AppError('Product not found', 404);

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const { rows, total } = await reviewRepo.findByProductId(product.id, { page, limit });
  const rating = await reviewRepo.getAverageRating(product.id);

  return {
    data: rows,
    rating,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const submitReview = async (slug, userId, data) => {
  const product = await productRepo.findBySlug(slug);
  if (!product) throw new AppError('Product not found', 404);

  const existing = await reviewRepo.findByUserAndProduct(userId, product.id);
  if (existing) throw new AppError('You have already reviewed this product', 409);

  await reviewRepo.create(product.id, userId, data);
  return reviewRepo.findByUserAndProduct(userId, product.id);
};

const getAverageRating = async (productId) => {
  return reviewRepo.getAverageRating(productId);
};

module.exports = { getProductReviews, submitReview, getAverageRating };
