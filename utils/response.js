const success = (res, message, data = null, statusCode = 200) => {
  const payload = { status: 'success', message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

const error = (res, message, statusCode = 400, errors = null) => {
  const payload = { status: 'error', message };
  if (errors !== null) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

module.exports = { success, error };
