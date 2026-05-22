const crypto = require('crypto');
const cartRepo = require('../repositories/cart.repository');
const productRepo = require('../repositories/product.repository');
const AppError = require('../utils/AppError');

const generateToken = () => crypto.randomBytes(32).toString('hex');

const getOrCreateCart = async (sessionToken, userId) => {
  let cart = null;

  if (userId) {
    cart = await cartRepo.findByUserId(userId);
  }

  if (!cart && sessionToken) {
    cart = await cartRepo.findByToken(sessionToken);
    if (cart && userId && !cart.user_id) {
      await cartRepo.linkToUser(cart.id, userId);
      cart.user_id = userId;
    }
  }

  if (!cart) {
    const token = sessionToken || generateToken();
    const cartId = await cartRepo.create(token, userId || null);
    cart = { id: cartId, session_token: token, user_id: userId || null };
  }

  return cart;
};

const resolveCart = async (sessionToken, userId) => {
  if (userId && sessionToken) {
    const guestCart = await cartRepo.findByToken(sessionToken);
    if (guestCart && !guestCart.user_id) {
      await cartRepo.mergeGuestCart(sessionToken, userId);
    }
  }

  const cart = await getOrCreateCart(sessionToken, userId);
  const items = await cartRepo.getItems(cart.id);
  return { cart, items };
};

const addToCart = async (sessionToken, userId, { product_id, quantity }) => {
  const product = await productRepo.findById(product_id);
  if (!product) throw new AppError('Product not found', 404);
  if (!product.is_in_stock || product.stock_quantity < quantity) {
    throw new AppError('Product is out of stock or insufficient quantity', 400);
  }

  const cart = await getOrCreateCart(sessionToken, userId);
  await cartRepo.addItem(cart.id, product_id, quantity, product.price);

  const items = await cartRepo.getItems(cart.id);
  return { cart, items };
};

const updateCartItem = async (sessionToken, userId, itemId, quantity) => {
  const cart = await getOrCreateCart(sessionToken, userId);

  if (quantity === 0) {
    await cartRepo.removeItem(cart.id, itemId);
  } else {
    await cartRepo.updateItem(cart.id, itemId, quantity);
  }

  const items = await cartRepo.getItems(cart.id);
  return { cart, items };
};

const removeCartItem = async (sessionToken, userId, itemId) => {
  const cart = await getOrCreateCart(sessionToken, userId);
  await cartRepo.removeItem(cart.id, itemId);

  const items = await cartRepo.getItems(cart.id);
  return { cart, items };
};

const clearCart = async (sessionToken, userId) => {
  const cart = await getOrCreateCart(sessionToken, userId);
  await cartRepo.clearItems(cart.id);
  return { cart, items: [] };
};

const mergeCart = async (guestToken, userId) => {
  await cartRepo.mergeGuestCart(guestToken, userId);
  const cart = await cartRepo.findByUserId(userId);
  if (!cart) return { cart: null, items: [] };
  const items = await cartRepo.getItems(cart.id);
  return { cart, items };
};

module.exports = {
  resolveCart,
  getOrCreateCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeCart,
  generateToken,
};
