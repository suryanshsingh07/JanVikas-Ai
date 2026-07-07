/**
 * JanVikas AI — User Routes
 */
const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUserRole, toggleUserStatus, uploadAvatar, getUserStats } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadAvatar: avatarUpload } = require('../middlewares/upload');

router.use(protect);
router.post('/avatar', avatarUpload.single('avatar'), uploadAvatar);
router.get('/stats/:id', getUserStats);
router.get('/', authorize('admin'), getUsers);
router.get('/:id', getUser);
router.put('/:id/role', authorize('admin'), updateUserRole);
router.put('/:id/status', authorize('admin'), toggleUserStatus);

module.exports = router;
