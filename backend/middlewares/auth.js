/**
 * JanVikas AI — Authentication Middleware
 * JWT verification + role-based access control
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createError } = require('../utils/helpers');

/**
 * Verify JWT token and attach user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // ─── Extract token from Authorization header ─────────
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // ─── Also check cookie (optional) ───────────────────
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(createError('Access denied. No token provided.', 401));
    }

    // ─── Verify token ────────────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ─── Fetch user from DB ──────────────────────────────
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(createError('User not found. Token invalid.', 401));
    }

    if (!user.isActive) {
      return next(createError('Account is deactivated. Contact admin.', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(createError('Invalid token.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(createError('Token expired. Please login again.', 401));
    }
    next(error);
  }
};

/**
 * Role-based authorization middleware factory
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError('Authentication required.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        createError(
          `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
          403
        )
      );
    }
    next();
  };
};

/**
 * Optional auth — attach user if token present, but don't fail
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
  }
  next();
};

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = { protect, authorize, optionalAuth, generateToken };
