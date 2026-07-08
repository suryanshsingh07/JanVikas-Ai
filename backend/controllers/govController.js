const GovData = require('../models/GovData');
const Submission = require('../models/Submission');
const { asyncHandler, createError } = require('../utils/helpers');
const { ingestSampleData } = require('../services/govIngestService');
const logger = require('../utils/logger');

/**
 * @route GET /api/gov/compare?submissionId=...
 * @desc Return nearby government records to compare against a submission
 */
const compareForSubmission = asyncHandler(async (req, res) => {
  const { submissionId, radiusMeters = 5000 } = req.query;
  
  logger.info(`GOV_COMPARE: Received request - submissionId=${submissionId}, radiusMeters=${radiusMeters}`);
  
  if (!submissionId) {
    logger.error('GOV_COMPARE: submissionId missing');
    throw createError('submissionId query param required', 400);
  }

  const submission = await Submission.findById(submissionId).lean();
  if (!submission) {
    logger.warn(`GOV_COMPARE: Submission not found: ${submissionId}`);
    return res.json({ success: true, data: [], message: 'Submission not found' });
  }
  
  const coords = submission.location?.coordinates;
  logger.info(`GOV_COMPARE: Submission coords = [${coords}]`);
  
  if (!coords || coords.length !== 2) {
    logger.warn(`GOV_COMPARE: Invalid coordinates for submission ${submissionId}`);
    return res.json({ success: true, data: [], message: 'No coordinates available for submission' });
  }

  try {
    logger.info(`GOV_COMPARE: Querying GovData near [${coords[0]}, ${coords[1]}] within ${radiusMeters}m`);
    
    // Ensure geospatial index exists
    await GovData.collection.createIndex({ 'location': '2dsphere' }).catch(err => {
      logger.warn(`Could not create geospatial index: ${err.message}`);
    });
    
    // Find GovData within radius using $near geospatial operator
    const matches = await GovData.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: coords },
          $maxDistance: Number(radiusMeters),
        }
      }
    }).limit(50).lean();

    logger.info(`GOV_COMPARE: Found ${matches?.length || 0} gov records`);
    res.json({ success: true, data: matches || [] });
  } catch (err) {
    logger.error(`GOV_COMPARE: Geospatial query error: ${err.message}`);
    logger.error(`GOV_COMPARE: Stack: ${err.stack}`);
    // Return empty array on query error instead of 500
    res.json({ success: true, data: [], message: 'Unable to fetch government records' });
  }
});

/**
 * @route POST /api/gov/ingest-sample
 * @desc Seed sample government records (dev only)
 */
const ingestSample = asyncHandler(async (req, res) => {
  const result = await ingestSampleData();
  res.json({ success: true, inserted: result.inserted });
});

module.exports = { compareForSubmission, ingestSample };
