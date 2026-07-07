/**
 * JanVikas AI — User Controller
 */

const User = require('../models/User');
const Submission = require('../models/Submission');
const { createError, asyncHandler, getPagination } = require('../utils/helpers');
const { uploadImages } = require('../services/firebaseService');

/**
 * @route   GET /api/users
 * @access  Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search, isActive } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const { skip, limitNum } = getPagination(page, limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: users.map((u) => u.toPublicJSON()),
    pagination: { total, page: Number(page), limit: limitNum, pages: Math.ceil(total / limitNum) },
  });
});

/**
 * @route   GET /api/users/:id
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw createError('User not found', 404);
  res.json({ success: true, user: user.toPublicJSON() });
});

/**
 * @route   PUT /api/users/:id/role
 * @access  Admin
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['citizen', 'official', 'admin'].includes(role)) {
    throw createError('Invalid role', 400);
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw createError('User not found', 404);
  res.json({ success: true, message: `Role updated to ${role}`, user: user.toPublicJSON() });
});

/**
 * @route   PUT /api/users/:id/status
 * @access  Admin
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw createError('User not found', 404);
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
    user: user.toPublicJSON(),
  });
});

/**
 * @route   POST /api/users/avatar
 * @access  Private
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw createError('No file uploaded', 400);
  const [url] = await uploadImages([req.file]);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: url },
    { new: true }
  );
  res.json({ success: true, avatar: url, user: user.toPublicJSON() });
});

/**
 * @route   GET /api/users/:id/stats
 */
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.params.id === 'me' ? req.user._id : req.params.id;
  const [total, resolved, pending] = await Promise.all([
    Submission.countDocuments({ citizen: userId }),
    Submission.countDocuments({ citizen: userId, status: 'resolved' }),
    Submission.countDocuments({ citizen: userId, status: 'pending' }),
  ]);
  res.json({ success: true, stats: { total, resolved, pending, active: total - resolved } });
});

module.exports = { getUsers, getUser, updateUserRole, toggleUserStatus, uploadAvatar, getUserStats };
