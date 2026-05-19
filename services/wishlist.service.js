const wishlistRepo = require('../repositories/wishlist.repository');
const productRepo = require('../repositories/product.repository');
const AppError = require('../utils/AppError');

const getWishlist = async (userId) => {
  return wishlistRepo.findByUserId(userId);
};

const addToWishlist = async (userId, productId) => {
  const product = await productRepo.findById(productId);
  if (!product) throw new AppError('Product not found', 404);
  await wishlistRepo.add(userId, productId);
  return wishlistRepo.findByUserId(userId);
};

const removeFromWishlist = async (userId, productId) => {
  await wishlistRepo.remove(userId, productId);
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
