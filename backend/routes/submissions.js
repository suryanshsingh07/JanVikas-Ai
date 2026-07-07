/**
 * JanVikas AI — Submission Routes
 */

const express = require('express');
const router = express.Router();
const {
  createSubmission, getSubmissions, getSubmission,
  updateStatus, voteSubmission, deleteSubmission, getMapSubmissions,
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createSubmissionValidator, listSubmissionsValidator } = require('../validators/submissionValidator');
const { uploadMixed, uploadLimiter } = require('../middlewares/rateLimiter');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(listSubmissionsValidator, validate, getSubmissions)
  .post(
    uploadLimiter,
    // Handle mixed file uploads (images + voice)
    require('../middlewares/upload').uploadMixed.fields([
      { name: 'images', maxCount: 5 },
      { name: 'voice', maxCount: 1 },
    ]),
    createSubmissionValidator,
    validate,
    createSubmission
  );

router.get('/map', getMapSubmissions);
router.get('/:id', getSubmission);
router.put('/:id/status', authorize('official', 'admin'), updateStatus);
router.post('/:id/vote', voteSubmission);
router.delete('/:id', deleteSubmission);

module.exports = router;
