/**
 * JanVikas AI — Admin Routes
 * All routes protected by admin-only authorization
 */
const express = require('express');
const router = express.Router();
const {
  getAdminUsers,
  getAdminUser,
  toggleAdminUserStatus,
  updateAdminUserRole,
  deleteAdminUser,
  getAdminStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

// All admin routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUser);
router.patch('/users/:id/status', toggleAdminUserStatus);
router.patch('/users/:id/role', updateAdminUserRole);
router.delete('/users/:id', deleteAdminUser);

module.exports = router;
