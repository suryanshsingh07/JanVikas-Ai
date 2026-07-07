/**
 * JanVikas AI — Request Validation Middleware
 * Works with express-validator
 */

const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results from express-validator
 * Returns 422 with all field errors if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors,
    });
  }

  next();
};

module.exports = validate;
