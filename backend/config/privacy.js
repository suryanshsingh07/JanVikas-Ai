/**
 * Privacy and logging configuration
 */
module.exports = {
  // Fields to redact from logs and API responses (case-insensitive substrings)
  redactFields: ['name', 'phone', 'email', 'aadhaar', 'ssn', 'pan', 'voter', 'person'],
  // Data retention suggestion (days) — not enforced here, for operators
  retentionDays: 365,
};
