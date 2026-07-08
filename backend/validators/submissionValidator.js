/**
 * JanVikas AI — Submission Validators
 */

const { body, query, param } = require('express-validator');

const VALID_CATEGORIES = [
  'roads', 'water', 'electricity', 'education', 'health',
  'sanitation', 'agriculture', 'housing', 'employment',
  'environment', 'security', 'transport', 'other',
];

const createSubmissionValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Description must be 10-5000 characters'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),

  body('location.state')
    .optional()
    .trim(),

  body('location.district')
    .optional()
    .trim(),

  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
];

const listSubmissionsValidator = [
  query('page').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional({ values: 'falsy' }).isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('category').optional({ values: 'falsy' }).isIn(VALID_CATEGORIES).withMessage('Invalid category'),
  query('status').optional({ values: 'falsy' }).isIn(['pending', 'reviewing', 'approved', 'in_progress', 'resolved', 'rejected']),
  query('priority').optional({ values: 'falsy' }).isIn(['low', 'medium', 'high', 'critical']),
  query('sortBy').optional({ values: 'falsy' }).isIn(['createdAt', 'votes', 'priorityScore', 'aiAnalysis.priorityScore', 'status']),
  query('order').optional({ values: 'falsy' }).isIn(['asc', 'desc']),
];

module.exports = { createSubmissionValidator, listSubmissionsValidator };
