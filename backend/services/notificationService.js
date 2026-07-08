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
const notifyStatusChange = async (submission, newStatus, note = '', rejectionReason = '') => {
  const statusMessages = {
    approved: { title: '✅ Submission Approved for Action', type: 'submission_approved' },
    rejected: { title: '❌ Submission Rejected', type: 'submission_rejected' },
    in_progress: { title: '🔧 Work In Progress — Issue Being Addressed', type: 'status_update' },
    resolved: { title: '🎉 Issue Resolved! Please give feedback.', type: 'submission_resolved' },
    reviewing: { title: '👀 Submission Under Review', type: 'status_update' },
  };

  const notifConfig = statusMessages[newStatus];
  if (!notifConfig) return;

  let message = `Your submission "${submission.title}" status changed to: ${newStatus.replace('_', ' ')}.`;
  if (note) message += ` Note: ${note}`;
  if (newStatus === 'rejected' && rejectionReason) message += ` Reason: ${rejectionReason}`;

  return createNotification({
    recipient: submission.citizen,
    title: notifConfig.title,
    message,
    type: notifConfig.type,
    data: { submissionId: submission._id, link: `/citizen/track/${submission._id}` },
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
