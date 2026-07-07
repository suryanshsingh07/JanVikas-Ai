/**
 * JanVikas AI — Notification Controller
 */

const Notification = require('../models/Notification');
const { asyncHandler, getPagination } = require('../utils/helpers');
const { markAsRead, markAllAsRead } = require('../services/notificationService');

/**
 * @route   GET /api/notifications
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const { skip, limitNum } = getPagination(page, limit);

  const filter = { recipient: req.user._id };
  if (unreadOnly === 'true') filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: { total, page: Number(page), limit: limitNum, pages: Math.ceil(total / limitNum) },
  });
});

/**
 * @route   PUT /api/notifications/read
 */
const readNotifications = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (ids && ids.length > 0) {
    await markAsRead(ids, req.user._id);
  } else {
    await markAllAsRead(req.user._id);
  }
  res.json({ success: true, message: 'Notifications marked as read' });
});

/**
 * @route   DELETE /api/notifications/:id
 */
const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  res.json({ success: true, message: 'Notification deleted' });
});

module.exports = { getNotifications, readNotifications, deleteNotification };
