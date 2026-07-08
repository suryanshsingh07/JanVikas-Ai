/**
 * JanVikas AI — Tender Model
 * Department raises tenders; Citizens/NGOs can propose
 */

const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  estimatedCost: { type: Number },
  timeline: { type: String },
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'approved', 'rejected'],
    default: 'pending',
  },
  actionNote: { type: String, default: '' },
  actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actionAt: { type: Date },
  submittedAt: { type: Date, default: Date.now },
});

const tenderSchema = new mongoose.Schema(
  {
    // ─── Basic Info ──────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Tender title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    referenceNumber: { type: String, trim: true },

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

    // ─── Status ──────────────────────────────────────────
    status: {
      type: String,
      enum: ['draft', 'open', 'closed', 'awarded', 'cancelled'],
      default: 'open',
    },

    // ─── Budget ──────────────────────────────────────────
    estimatedBudget: { type: Number, min: 0 },
    currency: { type: String, default: 'INR' },

    // ─── Timeline ────────────────────────────────────────
    publishedAt: { type: Date, default: Date.now },
    deadline: { type: Date, required: [true, 'Deadline is required'] },
    projectStart: { type: Date },
    projectEnd: { type: Date },

    // ─── Location ────────────────────────────────────────
    location: {
      district: { type: String },
      state: { type: String },
      address: { type: String },
    },

    // ─── Documents ───────────────────────────────────────
    documents: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],

    // ─── Eligibility ─────────────────────────────────────
    eligibility: { type: String, default: '' },
    eligibleRoles: {
      type: [String],
      enum: ['citizen', 'ngo', 'officer', 'department'],
      default: ['ngo', 'citizen'],
    },

    // ─── Proposals ───────────────────────────────────────
    proposals: [proposalSchema],

    // ─── References ──────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    awardedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ─── Related ─────────────────────────────────────────
    relatedSubmissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }],
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────
tenderSchema.index({ status: 1, deadline: 1 });
tenderSchema.index({ category: 1, status: 1 });
tenderSchema.index({ createdBy: 1 });
tenderSchema.index({ 'location.state': 1, 'location.district': 1 });
tenderSchema.index({ title: 'text', description: 'text' });

// ─── Virtual: proposal count ──────────────────────────────
tenderSchema.virtual('proposalCount').get(function () {
  return this.proposals ? this.proposals.length : 0;
});

module.exports = mongoose.model('Tender', tenderSchema);
