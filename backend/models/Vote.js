/**
 * JanVikas AI — Vote Model
 * Tracks votes on submissions to prevent duplicates
 */

const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    type: {
      type: String,
      enum: ['upvote', 'downvote'],
      default: 'upvote',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Compound index to ensure one vote per user per submission ─
voteSchema.index({ user: 1, submission: 1 }, { unique: true });
voteSchema.index({ submission: 1 });

module.exports = mongoose.model('Vote', voteSchema);
