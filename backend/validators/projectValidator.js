/**
 * JanVikas AI — Project Validators
 */

const { body, query } = require('express-validator');

const VALID_CATEGORIES = [
  'roads', 'water', 'electricity', 'education', 'health',
  'sanitation', 'agriculture', 'housing', 'employment',
  'environment', 'security', 'transport', 'other',
];

const createProjectValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Project title is required')
    .isLength({ min: 5, max: 300 }).withMessage('Title must be 5-300 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(VALID_CATEGORIES).withMessage('Invalid category'),

  body('location.district')
    .notEmpty().withMessage('District is required'),

  body('location.state')
    .notEmpty().withMessage('State is required'),

  body('estimatedBudget')
    .notEmpty().withMessage('Estimated budget is required')
    .toFloat()
    .isFloat({ min: 0 }).withMessage('Budget must be a non-negative number'),
];

const updateProjectStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['proposed', 'approved', 'tendered', 'ongoing', 'completed', 'cancelled', 'on_hold'])
    .withMessage('Invalid status'),
];

module.exports = { createProjectValidator, updateProjectStatusValidator };
