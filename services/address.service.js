const addressRepo = require('../repositories/address.repository');
const AppError = require('../utils/AppError');

const listAddresses = async (userId) => {
  return addressRepo.findByUserId(userId);
};

const createAddress = async (userId, data) => {
  const id = await addressRepo.create(userId, data);
  return addressRepo.findById(id, userId);
};

const updateAddress = async (userId, addressId, data) => {
  const existing = await addressRepo.findById(addressId, userId);
  if (!existing) throw new AppError('Address not found', 404);
  await addressRepo.update(addressId, userId, data);
  return addressRepo.findById(addressId, userId);
};

const deleteAddress = async (userId, addressId) => {
  const existing = await addressRepo.findById(addressId, userId);
  if (!existing) throw new AppError('Address not found', 404);
  await addressRepo.delete(addressId, userId);
};

const getAddress = async (userId, addressId) => {
  const address = await addressRepo.findById(addressId, userId);
  if (!address) throw new AppError('Address not found', 404);
  return address;
};

module.exports = { listAddresses, createAddress, updateAddress, deleteAddress, getAddress };
