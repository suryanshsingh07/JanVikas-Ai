/**
 * JanVikas AI — Rate Limiter Middlewares
 * Dev-mode: generous limits to avoid 429 storms during development.
 * Prod-mode: strict limits to protect against abuse and DDoS.
 */

const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

/**
 * General API rate limiter
 * Dev:  10,000 req / 15 min
 * Prod: 500 req / 15 min
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 500,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict auth limiter
 * Dev:  500 attempts / 15 min (never block during testing)
 * Prod: 15 attempts / 15 min
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 500 : 15,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * File upload limiter
 * Dev:  unlimited
 * Prod: 30 uploads / hour
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 10000 : 30,
  message: {
    success: false,
    message: 'Upload limit reached. Please try again after 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI processing limiter
 * Dev:  unlimited
 * Prod: 100 requests / hour
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 10000 : 100,
  message: {
    success: false,
    message: 'AI request limit reached. Please try again after 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter, uploadLimiter, aiLimiter };
