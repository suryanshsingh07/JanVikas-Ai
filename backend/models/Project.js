/**
 * JanVikas AI — Project Model
 * Development projects created from citizen submissions
 */

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    // ─── Basic Info ──────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    shortSummary: {
      type: String,
      maxlength: [500, 'Short summary cannot exceed 500 characters'],
    },

    // ─── Category ────────────────────────────────────────
    category: {
      type: String,
      required: true,
      enum: [
        'roads', 'water', 'electricity', 'education', 'health',
        'sanitation', 'agriculture', 'housing', 'employment',
        'environment', 'security', 'transport', 'other',
      ],
    },

    // ─── Status & Phase ──────────────────────────────────
    status: {
      type: String,
      enum: ['proposed', 'approved', 'tendered', 'ongoing', 'completed', 'cancelled', 'on_hold'],
      default: 'proposed',
    },
    phase: {
      type: String,
      enum: ['planning', 'design', 'execution', 'quality_check', 'handover'],
      default: 'planning',
    },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },

    // ─── Location ────────────────────────────────────────
    location: {
      district: { type: String, required: true },
      taluka: String,
      village: String,
      state: { type: String, required: true },
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    // ─── Budget ───────────────────────────────────────────
    estimatedBudget: { type: Number, required: true, min: 0 },
    approvedBudget: { type: Number, default: 0 },
    expenditure: { type: Number, default: 0 },
    fundingSource: {
      type: String,
      enum: ['central', 'state', 'local', 'private', 'mixed'],
      default: 'central',
    },

    // ─── Timeline ────────────────────────────────────────
    timeline: {
      proposedStart: Date,
      actualStart: Date,
      proposedEnd: Date,
      actualEnd: Date,
    },

    // ─── AI Ranking ───────────────────────────────────────
    priorityScore: { type: Number, default: 0, min: 0, max: 100 },
    rank: { type: Number, default: 0 },
    rankingExplanation: { type: String, default: '' },
    rankingFactors: {
      citizenDemand: { score: Number, weight: Number, explanation: String },
      population: { score: Number, weight: Number, explanation: String },
      infrastructureGap: { score: Number, weight: Number, explanation: String },
      distance: { score: Number, weight: Number, explanation: String },
      urgency: { score: Number, weight: Number, explanation: String },
      budget: { score: Number, weight: Number, explanation: String },
    },

    // ─── References ──────────────────────────────────────
    relatedSubmissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }],
    assignedOfficial: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contractors: [{ name: String, contact: String, registrationNo: String }],

    // ─── Impact Metrics ──────────────────────────────────
    beneficiaries: { type: Number, default: 0 },
    affectedVillages: [String],
    tags: [String],

    // ─── Documents ───────────────────────────────────────
    documents: [
      {
        name: String,
        url: String,
        type: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // ─── Progress Updates ─────────────────────────────────
    updates: [
      {
        message: String,
        images: [String],
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now },
        percentage: Number,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────
projectSchema.index({ priorityScore: -1 });
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ 'location.state': 1, 'location.district': 1 });
projectSchema.index({ assignedOfficial: 1 });
projectSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Project', projectSchema);
