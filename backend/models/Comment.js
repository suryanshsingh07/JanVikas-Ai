/**
 * JanVikas AI — Comment Model
 */

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isOfficial: { type: Boolean, default: false }, // MP/Admin official response
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // For replies
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

commentSchema.index({ submission: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

module.exports = mongoose.model('Comment', commentSchema);
