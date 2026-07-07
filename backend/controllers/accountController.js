/**
 * JanVikas AI — Hierarchical Account Controller
 * Handles CRUD and RBAC logic for account management, syncing with Firebase Firestore.
 */

const User = require('../models/User');
const { createError, asyncHandler } = require('../utils/helpers');
const { getFirebaseAdmin } = require('../config/firebase');

// Role hierarchy rank mapping
const roleRanks = {
  admin: 100,
  department: 80,
  officer: 60,
  ngo: 40,
  citizen: 20
};

/**
 * Sync user to Firebase Firestore
 */
const syncToFirebase = async (user) => {
  try {
    const adminApp = getFirebaseAdmin();
    if (adminApp) {
      const db = adminApp.firestore();
      await db.collection('users').doc(user._id.toString()).set({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdBy: user.createdBy ? user.createdBy.toString() : null,
        updatedAt: adminApp.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Firebase sync failed:', error.message);
  }
};

/**
 * @route   POST /api/accounts
 * @desc    Create a new junior account
 * @access  Private (Admin, Department, Officer)
 */
const createAccount = asyncHandler(async (req, res) => {
  const { name, email, password, role, ...otherDetails } = req.body;
  const creatorRole = req.user.role;
  
  // Enforce hierarchy: Creator rank must be strictly greater than target role rank
  if (roleRanks[creatorRole] <= roleRanks[role]) {
    throw createError(`A ${creatorRole} cannot create an account of role ${role}`, 403);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError('Email already registered.', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    createdBy: req.user._id,
    ...otherDetails
  });

  await syncToFirebase(user);

  res.status(201).json({
    success: true,
    message: `${role} account created successfully.`,
    user: user.toPublicJSON()
  });
});

/**
 * @route   GET /api/accounts
 * @desc    Get all accounts managed by the current user
 * @access  Private
 */
const getAccounts = asyncHandler(async (req, res) => {
  const creatorRole = req.user.role;
  let filter = {};

  if (creatorRole === 'admin') {
    // Admin sees all accounts except themselves
    filter = { _id: { $ne: req.user._id } };
  } else if (creatorRole === 'department') {
    // Department sees officers, ngos, citizens
    filter = { role: { $in: ['officer', 'ngo', 'citizen'] } };
  } else if (creatorRole === 'officer') {
    // Officer sees ngos, citizens
    filter = { role: { $in: ['ngo', 'citizen'] } };
  } else {
    // Other roles shouldn't access this
    throw createError('Not authorized to manage accounts', 403);
  }

  const accounts = await User.find(filter).select('-password');
  
  res.json({
    success: true,
    count: accounts.length,
    accounts
  });
});

/**
 * @route   PATCH /api/accounts/:id/status
 * @desc    Enable/Disable account
 * @access  Private
 */
const toggleStatus = asyncHandler(async (req, res) => {
  const account = await User.findById(req.params.id);
  if (!account) throw createError('Account not found', 404);

  // Enforce hierarchy
  if (roleRanks[req.user.role] <= roleRanks[account.role]) {
    throw createError(`Not authorized to manage ${account.role} accounts`, 403);
  }

  account.isActive = !account.isActive;
  await account.save({ validateBeforeSave: false });
  await syncToFirebase(account);

  res.json({
    success: true,
    message: `Account has been ${account.isActive ? 'activated' : 'deactivated'}`,
    isActive: account.isActive
  });
});

/**
 * @route   DELETE /api/accounts/:id
 * @desc    Delete an account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const account = await User.findById(req.params.id);
  if (!account) throw createError('Account not found', 404);

  // Enforce hierarchy
  if (roleRanks[req.user.role] <= roleRanks[account.role]) {
    throw createError(`Not authorized to delete ${account.role} accounts`, 403);
  }

  await User.findByIdAndDelete(req.params.id);
  
  try {
    const adminApp = getFirebaseAdmin();
    if (adminApp) {
      await adminApp.firestore().collection('users').doc(req.params.id.toString()).delete();
    }
  } catch(e) {}

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

module.exports = { createAccount, getAccounts, toggleStatus, deleteAccount };
