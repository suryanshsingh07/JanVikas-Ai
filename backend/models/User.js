/**
 * JanVikas AI — User Model
 * Supports roles: citizen, mp, admin
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ─── Basic Info ──────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },

    // ─── Role & Access ───────────────────────────────────
    role: {
      type: String,
      enum: ['citizen', 'officer', 'department', 'ngo', 'admin'],
      default: 'citizen',
    },
    
    // ─── Hierarchy Tracking ──────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // ─── Location ────────────────────────────────────────
    constituency: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },

    // ─── Profile ─────────────────────────────────────────
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: [500, 'Bio cannot exceed 500 characters'] },
    language: { type: String, default: 'en' },

    // ─── Officer-specific fields ───────────────────────────────
    officerDetails: {
      departmentName: { type: String },
      jurisdiction: { type: String },
      state: { type: String },
      termStart: { type: Date },
      termEnd: { type: Date },
    },

    // ─── Status ──────────────────────────────────────────
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },

    // ─── Notifications ───────────────────────────────────
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },

    // ─── Password Reset ──────────────────────────────────
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ state: 1 });
userSchema.index({ constituency: 1 });

// ─── Virtual: submission count ────────────────────────────
userSchema.virtual('submissionCount', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'citizen',
  count: true,
});

// ─── Pre-save: Hash password ──────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Method: Compare password ─────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ─── Method: Safe public profile ─────────────────────────
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
