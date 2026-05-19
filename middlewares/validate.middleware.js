const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => d.message.replace(/"/g, "'"));
    return res.status(400).json({ status: 'error', message: 'Validation failed', errors });
  }

  req.body = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => d.message.replace(/"/g, "'"));
    return res.status(400).json({ status: 'error', message: 'Validation failed', errors });
  }

  req.query = value;
  next();
};

module.exports = { validate, validateQuery };
