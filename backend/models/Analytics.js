/**
 * JanVikas AI — Analytics Model
 * Stores aggregated analytics snapshots for fast dashboard loading
 */

const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    // ─── Snapshot Date ────────────────────────────────────
    date: { type: Date, required: true },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },

    // ─── Submission Stats ─────────────────────────────────
    submissions: {
      total: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      approved: { type: Number, default: 0 },
      resolved: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
      byCategory: {
        type: Map,
        of: Number,
      },
      byState: {
        type: Map,
        of: Number,
      },
      byPriority: {
        high: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        low: { type: Number, default: 0 },
        critical: { type: Number, default: 0 },
      },
    },

    // ─── User Stats ───────────────────────────────────────
    users: {
      total: { type: Number, default: 0 },
      citizens: { type: Number, default: 0 },
      newRegistrations: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
    },

    // ─── Project Stats ────────────────────────────────────
    projects: {
      total: { type: Number, default: 0 },
      proposed: { type: Number, default: 0 },
      ongoing: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      totalBudget: { type: Number, default: 0 },
    },

    // ─── Geographic Hotspots ──────────────────────────────
    hotspots: [
      {
        district: String,
        state: String,
        count: Number,
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
      },
    ],

    // ─── Top Issues ───────────────────────────────────────
    topIssues: [
      {
        category: String,
        count: Number,
        percentage: Number,
      },
    ],

    // ─── Trend Data ───────────────────────────────────────
    trends: {
      submissionGrowth: Number, // % growth from previous period
      resolutionRate: Number,   // % of resolved vs total
      avgResponseTime: Number,  // hours
    },

    // ─── MP Region (optional - for MP-specific analytics) ─
    mpId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    constituency: String,
    state: String,
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────
analyticsSchema.index({ date: -1, period: 1 });
analyticsSchema.index({ mpId: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
