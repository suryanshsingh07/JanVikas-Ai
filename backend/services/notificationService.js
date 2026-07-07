/**
 * JanVikas AI — Notification Service
 */

const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Create a notification for a user
 * @param {Object} params
 */
const createNotification = async ({
  recipient,
  title,
  message,
  type = 'system',
  data = {},
  priority = 'normal',
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      data,
      priority,
    });
    logger.info(`📢 Notification created for user ${recipient}: ${title}`);
    return notification;
  } catch (error) {
    logger.error(`Notification creation error: ${error.message}`);
    return null;
  }
};

/**
 * Notify citizen when submission status changes
 */
const notifyStatusChange = async (submission, newStatus, note = '') => {
  const statusMessages = {
    approved: { title: '✅ Submission Approved', type: 'submission_approved' },
    rejected: { title: '❌ Submission Rejected', type: 'submission_rejected' },
    in_progress: { title: '🔧 Your Issue is Being Addressed', type: 'status_update' },
    resolved: { title: '🎉 Issue Resolved', type: 'submission_resolved' },
    reviewing: { title: '👀 Submission Under Review', type: 'status_update' },
  };

  const notifConfig = statusMessages[newStatus];
  if (!notifConfig) return;

  return createNotification({
    recipient: submission.citizen,
    title: notifConfig.title,
    message: `Your submission "${submission.title}" has been ${newStatus.replace('_', ' ')}. ${note}`,
    type: notifConfig.type,
    data: { submissionId: submission._id },
    priority: newStatus === 'resolved' ? 'high' : 'normal',
  });
};

/**
 * Notify MP of new AI insight
 */
const notifyAIInsight = async (mpId, insight) => {
  return createNotification({
    recipient: mpId,
    title: '🤖 New AI Insight Available',
    message: insight,
    type: 'ai_insight',
    priority: 'high',
  });
};

/**
 * Mark notifications as read
 */
const markAsRead = async (notificationIds, userId) => {
  await Notification.updateMany(
    { _id: { $in: notificationIds }, recipient: userId },
    { isRead: true, readAt: new Date() }
  );
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

module.exports = {
  createNotification,
  notifyStatusChange,
  notifyAIInsight,
  markAsRead,
  markAllAsRead,
};
