const wishlistService = require('../services/wishlist.service');
const { success } = require('../utils/response');

const getWishlist = async (req, res, next) => {
  try {
    const items = await wishlistService.getWishlist(req.user.id);
    success(res, 'Wishlist fetched successfully', items);
  } catch (err) {
    next(err);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ status: 'error', message: 'productId is required' });
    }
    const items = await wishlistService.addToWishlist(req.user.id, parseInt(productId));
    success(res, 'Product added to wishlist', items, 201);
  } catch (err) {
    next(err);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    await wishlistService.removeFromWishlist(req.user.id, parseInt(req.params.productId));
    success(res, 'Product removed from wishlist');
  } catch (err) {
    next(err);
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
