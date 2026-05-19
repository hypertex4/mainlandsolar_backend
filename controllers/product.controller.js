const productService = require('../services/product.service');
const { success } = require('../utils/response');

const listProducts = async (req, res, next) => {
  try {
    const result = await productService.listProducts(req.query);
    success(res, 'Products fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProduct(req.params.slug);
    success(res, 'Product fetched successfully', product);
  } catch (err) {
    next(err);
  }
};

const getFeatured = async (req, res, next) => {
  try {
    const products = await productService.getFeatured();
    success(res, 'Featured products fetched successfully', products);
  } catch (err) {
    next(err);
  }
};

const listCategories = async (req, res, next) => {
  try {
    const categories = await productService.listCategories();
    success(res, 'Categories fetched successfully', categories);
  } catch (err) {
    next(err);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const category = await productService.getCategory(req.params.slug);
    success(res, 'Category fetched successfully', category);
  } catch (err) {
    next(err);
  }
};

const listBrands = async (req, res, next) => {
  try {
    const brands = await productService.listBrands();
    success(res, 'Brands fetched successfully', brands);
  } catch (err) {
    next(err);
  }
};

module.exports = { listProducts, getProduct, getFeatured, listCategories, getCategory, listBrands };
