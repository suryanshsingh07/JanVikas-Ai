/**
 * JanVikas AI — System Constants
 */

// ─── Supported Languages ─────────────────────────────────
const LANGUAGES = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  te: 'Telugu',
  mr: 'Marathi',
  ta: 'Tamil',
  ur: 'Urdu',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  or: 'Odia',
  pa: 'Punjabi',
};

// ─── Submission Categories ───────────────────────────────
const CATEGORIES = [
  'roads',
  'water',
  'electricity',
  'education',
  'health',
  'sanitation',
  'agriculture',
  'housing',
  'employment',
  'environment',
  'security',
  'transport',
  'other',
];

// ─── Priorities ──────────────────────────────────────────
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

// ─── Statuses ────────────────────────────────────────────
const SUBMISSION_STATUSES = [
  'pending',
  'reviewing',
  'approved',
  'in_progress',
  'resolved',
  'rejected',
];

const PROJECT_STATUSES = [
  'proposed',
  'approved',
  'tendered',
  'ongoing',
  'completed',
  'cancelled',
  'on_hold',
];

// ─── Roles ───────────────────────────────────────────────
const ROLES = ['citizen', 'mp', 'admin'];

module.exports = {
  LANGUAGES,
  CATEGORIES,
  PRIORITIES,
  SUBMISSION_STATUSES,
  PROJECT_STATUSES,
  ROLES,
};
