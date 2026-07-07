/**
 * JanVikas AI — Notification Routes
 */
const express = require('express');
const router = express.Router();
const { getNotifications, readNotifications, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.get('/', getNotifications);
router.put('/read', readNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;
