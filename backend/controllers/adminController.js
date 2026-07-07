/**
 * JanVikas AI — Admin Controller
 * Full CRUD for admin user management + system overview
 */

const User = require('../models/User');
const Submission = require('../models/Submission');
const Project = require('../models/Project');
const { asyncHandler, createError, getPagination } = require('../utils/helpers');

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters, pagination, and search
 * @access  Admin
 */
const getAdminUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, role = '', search = '', isActive } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined && isActive !== '') {
    filter.isActive = isActive === 'true';
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { district: { $regex: search, $options: 'i' } },
    ];
  }

  const { skip, limitNum } = getPagination(page, limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      total,
      page: Number(page),
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get a single user profile with stats
 * @access  Admin
 */
const getAdminUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) throw createError('User not found', 404);

  const [submissionCount, resolvedCount] = await Promise.all([
    Submission.countDocuments({ citizen: user._id }),
    Submission.countDocuments({ citizen: user._id, status: 'resolved' }),
  ]);

  res.json({
    success: true,
    data: {
      ...user.toPublicJSON(),
      stats: { submissions: submissionCount, resolved: resolvedCount },
    },
  });
});

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Toggle user active/inactive status
 * @access  Admin
 */
const toggleAdminUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw createError('User not found', 404);

  // Prevent admin from deactivating themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw createError('Cannot deactivate your own account', 400);
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: user.toPublicJSON(),
  });
});

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Update a user's role
 * @access  Admin
 */
const updateAdminUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['citizen', 'officer', 'department', 'ngo', 'admin'].includes(role)) {
    throw createError('Invalid role.', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) throw createError('User not found', 404);

  res.json({
    success: true,
    message: `User role updated to ${role}`,
    data: user.toPublicJSON(),
  });
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user account (hard delete — use with caution)
 * @access  Admin
 */
const deleteAdminUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw createError('User not found', 404);

  if (user._id.toString() === req.user._id.toString()) {
    throw createError('Cannot delete your own account', 400);
  }

  await user.deleteOne();

  res.json({ success: true, message: 'User account deleted permanently' });
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get high-level system stats for the admin overview
 * @access  Admin
 */
const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    officerCount,
    citizenCount,
    totalSubmissions,
    pendingSubmissions,
    resolvedSubmissions,
    totalProjects,
    activeProjects,
    thisWeekSubmissions,
    thisWeekUsers,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: 'officer' }),
    User.countDocuments({ role: 'citizen' }),
    Submission.countDocuments({}),
    Submission.countDocuments({ status: 'pending' }),
    Submission.countDocuments({ status: 'resolved' }),
    Project.countDocuments({}),
    Project.countDocuments({ status: { $in: ['ongoing', 'approved'] } }),
    Submission.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
    User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  const resolutionRate = totalSubmissions > 0
    ? Math.round((resolvedSubmissions / totalSubmissions) * 100)
    : 0;

  res.json({
    success: true,
    data: {
      users: { total: totalUsers, officers: officerCount, citizens: citizenCount, newThisWeek: thisWeekUsers },
      submissions: { total: totalSubmissions, pending: pendingSubmissions, resolved: resolvedSubmissions, resolutionRate, newThisWeek: thisWeekSubmissions },
      projects: { total: totalProjects, active: activeProjects },
    },
  });
});

module.exports = {
  getAdminUsers,
  getAdminUser,
  toggleAdminUserStatus,
  updateAdminUserRole,
  deleteAdminUser,
  getAdminStats,
};
