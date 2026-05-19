const productRepo = require('../repositories/product.repository');
const categoryRepo = require('../repositories/category.repository');
const brandRepo = require('../repositories/brand.repository');
const AppError = require('../utils/AppError');

const listProducts = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 30;
  const { rows, total } = await productRepo.findAll({
    page,
    limit,
    categoryId: query.category ? parseInt(query.category) : undefined,
    brandId: query.brand ? parseInt(query.brand) : undefined,
    minPrice: query.minPrice !== undefined ? parseFloat(query.minPrice) : undefined,
    maxPrice: query.maxPrice !== undefined ? parseFloat(query.maxPrice) : undefined,
    capacity: query.capacity || undefined,
    search: query.search || undefined,
    sort: query.sort || undefined,
    isFeatured: query.isFeatured !== undefined ? Boolean(parseInt(query.isFeatured)) : undefined,
  });

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getProduct = async (slug) => {
  const product = await productRepo.findBySlug(slug);
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

const getFeatured = async () => {
  return productRepo.findFeatured(8);
};

const listCategories = async () => {
  return categoryRepo.findAll();
};

const getCategory = async (slug) => {
  const category = await categoryRepo.findBySlug(slug);
  if (!category) throw new AppError('Category not found', 404);
  return category;
};

const listBrands = async () => {
  return brandRepo.findAll();
};

module.exports = { listProducts, getProduct, getFeatured, listCategories, getCategory, listBrands };
