/**
 * JanVikas AI — Global Error Handler Middleware
 */

const logger = require('../utils/logger');

/**
 * Central error handler — should be the LAST middleware registered
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // ─── Log error ────────────────────────────────────────
  logger.error(`${err.name || 'Error'}: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // ─── Mongoose Bad ObjectId ───────────────────────────
  if (err.name === 'CastError') {
    error.message = `Resource not found with id: ${err.value}`;
    error.statusCode = 404;
  }

  // ─── Mongoose Duplicate Key ──────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error.statusCode = 400;
  }

  // ─── Mongoose Validation Error ───────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error.message = messages.join('. ');
    error.statusCode = 400;
  }

  // ─── JWT Errors ───────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid authentication token';
    error.statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    error.message = 'Authentication token has expired';
    error.statusCode = 401;
  }

  // ─── Multer File Size Error ───────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'File size exceeds the allowed limit';
    error.statusCode = 400;
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    error.message = 'Too many files uploaded';
    error.statusCode = 400;
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = 'Unexpected file field';
    error.statusCode = 400;
  }

  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const code = err.code || error.code || undefined;

  res.status(statusCode).json({
    success: false,
    message,
    ...(code && { code }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
