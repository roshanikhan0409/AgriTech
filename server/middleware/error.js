const { validationResult } = require('express-validator');

exports.notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not found: ${req.originalUrl}`));
};

// Central error handler with logging
exports.errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  }
  if (err.code === 11000) {
    status = 400;
    message = 'Duplicate value: ' + Object.keys(err.keyValue).join(', ');
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Invalid or expired token';
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ message, ...(process.env.NODE_ENV !== 'production' && status >= 500 ? { stack: err.stack } : {}) });
};

// Use after express-validator chains
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};
