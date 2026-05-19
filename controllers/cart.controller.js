const cartService = require('../services/cart.service');
const { success } = require('../utils/response');

const getSessionToken = (req) => req.headers['x-cart-token'] || null;

const getCart = async (req, res, next) => {
  try {
    const sessionToken = getSessionToken(req);
    const userId = req.user?.id || null;
    const { cart, items } = await cartService.resolveCart(sessionToken, userId);
    success(res, 'Cart fetched successfully', {
      session_token: cart.session_token,
      cart_id: cart.id,
      items,
    });
  } catch (err) {
    next(err);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const sessionToken = getSessionToken(req);
    const userId = req.user?.id || null;
    const { cart, items } = await cartService.addToCart(sessionToken, userId, req.body);
    success(res, 'Item added to cart', {
      session_token: cart.session_token,
      cart_id: cart.id,
      items,
    });
  } catch (err) {
    next(err);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const sessionToken = getSessionToken(req);
    const userId = req.user?.id || null;
    const { cart, items } = await cartService.updateCartItem(
      sessionToken,
      userId,
      parseInt(req.params.id),
      req.body.quantity
    );
    success(res, 'Cart item updated', {
      session_token: cart.session_token,
      cart_id: cart.id,
      items,
    });
  } catch (err) {
    next(err);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const sessionToken = getSessionToken(req);
    const userId = req.user?.id || null;
    const { cart, items } = await cartService.removeCartItem(
      sessionToken,
      userId,
      parseInt(req.params.id)
    );
    success(res, 'Cart item removed', {
      session_token: cart.session_token,
      cart_id: cart.id,
      items,
    });
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const sessionToken = getSessionToken(req);
    const userId = req.user?.id || null;
    const { cart } = await cartService.clearCart(sessionToken, userId);
    success(res, 'Cart cleared', {
      session_token: cart.session_token,
      cart_id: cart.id,
      items: [],
    });
  } catch (err) {
    next(err);
  }
};

const mergeCart = async (req, res, next) => {
  try {
    const guestToken = getSessionToken(req);
    if (!guestToken) {
      return success(res, 'No guest cart to merge', { items: [] });
    }
    const { cart, items } = await cartService.mergeCart(guestToken, req.user.id);
    success(res, 'Cart merged successfully', {
      session_token: cart?.session_token || null,
      cart_id: cart?.id || null,
      items,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart, mergeCart };
