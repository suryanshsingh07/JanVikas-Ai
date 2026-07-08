/**
 * JanVikas AI — Notification Model
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'submission_received',
        'submission_approved',
        'submission_rejected',
        'submission_resolved',
        'status_update',
        'comment_received',
        'vote_received',
        'project_update',
        'system',
        'ai_insight',
        'new_issue',
        'tender_posted',
        'project_proposed',
        'tender_action',
      ],
      default: 'system',
    },
    data: {
      submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
      tenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tender' },
      link: String,
    },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    // For broadcast notifications sent to all officials
    isGlobal: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

module.exports = mongoose.model('Notification', notificationSchema);
