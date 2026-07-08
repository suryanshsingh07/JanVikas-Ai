/**
 * JanVikas AI — Auth Controller
 */

const User = require('../models/User');
const { generateToken } = require('../middlewares/auth');
const { createError, asyncHandler } = require('../utils/helpers');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, state, constituency, district } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError('Email already registered. Please login.', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || 'citizen',
    state,
    constituency,
    district,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful! Welcome to JanVikas AI.',
    token,
    user: user.toPublicJSON(),
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user (include password for comparison)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw createError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    const err = createError('Your account has been disabled. Please contact your administrator.', 403);
    err.code = 'ACCOUNT_DISABLED';
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw createError('Invalid email or password.', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    token,
    user: user.toPublicJSON(),
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    user: user.toPublicJSON(),
  });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, state, district, constituency, bio, language } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, state, district, constituency, bio, language },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully.',
    user: user.toPublicJSON(),
  });
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw createError('Current password is incorrect.', 400);
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully.',
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (client-side token removal, server-side log)
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

module.exports = { register, login, getMe, updateProfile, changePassword, logout };
