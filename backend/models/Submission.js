/**
 * JanVikas AI — Submission Model
 * Core data model for citizen issue submissions
 */

const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    // ─── Citizen Reference ───────────────────────────────
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Citizen reference is required'],
    },

    // ─── Content ─────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },

    // ─── Language & Translation ──────────────────────────
    originalLanguage: { type: String, default: 'en' },
    translatedText: { type: String, default: '' },
    translatedTitle: { type: String, default: '' },

    // ─── Category ────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'roads', 'water', 'electricity', 'education', 'health',
        'sanitation', 'agriculture', 'housing', 'employment',
        'environment', 'security', 'transport', 'other',
      ],
    },
    subCategory: { type: String, default: '' },

    // ─── Priority ─────────────────────────────────────────
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    // ─── Status ──────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'approved', 'in_progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
      },
    ],

    // ─── Location (GeoJSON) ──────────────────────────────
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
      address: { type: String, default: '' },
      village: { type: String, default: '' },
      district: { type: String, default: '' },
      taluka: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },

    // ─── Media Files ─────────────────────────────────────
    media: {
      images: [{ type: String }],       // Firebase Storage URLs
      voiceRecording: { type: String }, // Firebase Storage URL
      documents: [{ type: String }],    // Firebase Storage URLs
      voiceTranscript: { type: String }, // Transcribed voice text
    },

    // ─── AI Analysis Results ─────────────────────────────
    aiAnalysis: {
      keywords: [{ type: String }],
      sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'negative', 'urgent'],
        default: 'neutral',
      },
      sentimentScore: { type: Number, default: 0 },
      isDuplicate: { type: Boolean, default: false },
      duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
      similarityScore: { type: Number, default: 0 },
      priorityScore: { type: Number, default: 0, min: 0, max: 100 },
      themes: [{ type: String }],
      clusterId: { type: String, default: '' },
      urgencyLevel: { type: Number, default: 1, min: 1, max: 5 },
      imageAnalysis: {
        caption: String,
        detectedProblems: [String],
        ocrText: String,
      },
      processedAt: { type: Date },
      isProcessed: { type: Boolean, default: false },
    },

    // ─── Social Features ─────────────────────────────────
    votes: { type: Number, default: 0 },
    voterIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },

    // ─── Comments ────────────────────────────────────────
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],

    // ─── Related Projects ────────────────────────────────
    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },

    // ─── MP Assignment ───────────────────────────────────
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    mpNotes: { type: String, default: '' },

    // ─── Meta ────────────────────────────────────────────
    isAnonymous: { type: Boolean, default: false },
    source: {
      type: String,
      enum: ['web', 'mobile', 'whatsapp', 'email', 'direct'],
      default: 'web',
    },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────
submissionSchema.index({ location: '2dsphere' });
submissionSchema.index({ category: 1, status: 1 });
submissionSchema.index({ citizen: 1, createdAt: -1 });
submissionSchema.index({ 'location.state': 1, 'location.district': 1 });
submissionSchema.index({ 'aiAnalysis.priorityScore': -1 });
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ votes: -1 });
submissionSchema.index({ title: 'text', description: 'text' });

// ─── Virtual: Comment count ───────────────────────────────
submissionSchema.virtual('commentCount').get(function () {
  return this.comments ? this.comments.length : 0;
});

module.exports = mongoose.model('Submission', submissionSchema);
