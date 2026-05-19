const addressService = require('../services/address.service');
const { success } = require('../utils/response');

const listAddresses = async (req, res, next) => {
  try {
    const addresses = await addressService.listAddresses(req.user.id);
    success(res, 'Addresses fetched successfully', addresses);
  } catch (err) {
    next(err);
  }
};

const createAddress = async (req, res, next) => {
  try {
    const address = await addressService.createAddress(req.user.id, req.body);
    success(res, 'Address created successfully', address, 201);
  } catch (err) {
    next(err);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const address = await addressService.updateAddress(
      req.user.id,
      parseInt(req.params.id),
      req.body
    );
    success(res, 'Address updated successfully', address);
  } catch (err) {
    next(err);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    await addressService.deleteAddress(req.user.id, parseInt(req.params.id));
    success(res, 'Address deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { listAddresses, createAddress, updateAddress, deleteAddress };
