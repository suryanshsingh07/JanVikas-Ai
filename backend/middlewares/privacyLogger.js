const logger = require('../utils/logger');
const { redactFields } = require('../config/privacy');

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

const redactValue = (key, value) => {
  if (!key || value === undefined || value === null) return value;
  const lower = key.toString().toLowerCase();
  for (const fld of redactFields) {
    if (lower.includes(fld)) return '[REDACTED]';
  }
  return value;
};

const redactObject = (obj) => {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(redactObject);
  if (!isObject(obj)) return obj;
  const out = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (isObject(v) || Array.isArray(v)) out[k] = redactObject(v);
    else out[k] = redactValue(k, v);
  }
  return out;
};

// Middleware: redact sensitive fields and log request/response metadata
module.exports = (req, res, next) => {
  try {
    const safeQuery = redactObject(req.query || {});
    const safeBody = redactObject(req.body || {});
    const userId = req.user?._id || null;

    logger.info('gov:request', {
      method: req.method,
      path: req.originalUrl,
      user: userId,
      query: safeQuery,
      body: Object.keys(safeBody).length ? safeBody : undefined,
      timestamp: new Date().toISOString(),
    });

    res.on('finish', () => {
      logger.info('gov:response', {
        method: req.method,
        path: req.originalUrl,
        user: userId,
        status: res.statusCode,
        timestamp: new Date().toISOString(),
      });
    });
  } catch (err) {
    logger.error('privacyLogger error: ' + err.message);
  }
  next();
};

module.exports.redactObject = redactObject;
