const express = require('express');
const router = express.Router();
const { compareForSubmission, ingestSample } = require('../controllers/govController');
const { protect, authorize } = require('../middlewares/auth');
const GovData = require('../models/GovData');
const logger = require('../utils/logger');

// Test endpoint - verify route is accessible (NO AUTH)
router.get('/test', (req, res) => {
  logger.info('GOV_TEST: Route is accessible');
  res.json({ success: true, message: 'Gov test route is accessible', timestamp: new Date() });
});

// Public compare endpoint
router.get('/compare', protect, compareForSubmission);

// Health check (no auth required for this one)
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Gov routes are accessible' });
});

// Debug endpoint - check GovData collection status
router.get('/debug/status', protect, authorize('admin'), async (req, res) => {
  try {
    const count = await GovData.countDocuments();
    const indexes = await GovData.collection.getIndexes();
    const sample = await GovData.findOne().lean();
    
    logger.info(`DEBUG: GovData count=${count}, indexes=${JSON.stringify(Object.keys(indexes))}`);
    
    res.json({
      success: true,
      govDataCount: count,
      hasData: count > 0,
      indexes: Object.keys(indexes),
      sampleRecord: sample ? { 
        _id: sample._id, 
        source: sample.source, 
        location: sample.location 
      } : null,
    });
  } catch (err) {
    logger.error(`DEBUG: Status check error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dev: seed sample data (admin only)
router.post('/ingest-sample', protect, authorize('admin'), ingestSample);

module.exports = router;
