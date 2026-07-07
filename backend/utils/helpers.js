/**
 * JanVikas AI — Shared Utilities
 */

/**
 * Create an error object with statusCode
 * @param {string} message
 * @param {number} statusCode
 */
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Async handler wrapper — eliminates try/catch boilerplate
 * @param {Function} fn - Async route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Get pagination parameters from query string
 * @param {number|string} page
 * @param {number|string} limit
 */
const getPagination = (page = 1, limit = 10) => {
  const limitNum = Math.min(Math.max(parseInt(limit), 1), 100);
  const pageNum = Math.max(parseInt(page), 1);
  const skip = (pageNum - 1) * limitNum;
  return { skip, limitNum, pageNum };
};

/**
 * Format bytes to human-readable size
 * @param {number} bytes
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Sanitize string — remove potential XSS chars
 * @param {string} str
 */
const sanitize = (str) => {
  if (!str) return '';
  return str.replace(/[<>'"]/g, '').trim();
};

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Check if a value is a valid MongoDB ObjectId
 * @param {string} id
 */
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

/**
 * Build sort object from query params
 * @param {string} sortBy
 * @param {string} order
 */
const buildSort = (sortBy = 'createdAt', order = 'desc') => ({
  [sortBy]: order === 'asc' ? 1 : -1,
});

module.exports = {
  createError,
  asyncHandler,
  getPagination,
  formatFileSize,
  sanitize,
  generateOTP,
  isValidObjectId,
  buildSort,
};
