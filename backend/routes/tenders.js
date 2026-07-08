/**
 * JanVikas AI — Tender Routes
 */

const express = require('express');
const router = express.Router();
const {
  getTenders, getLatestTenders, getTender,
  createTender, updateTender, deleteTender,
  submitProposal, actionOnProposal, getMyTenders,
} = require('../controllers/tenderController');
const { protect, authorize } = require('../middlewares/auth');

// Public: latest tenders for landing page (no auth required)
router.get('/latest', getLatestTenders);

// All other routes require authentication
router.use(protect);

router.get('/mine', authorize('department', 'admin'), getMyTenders);
router.route('/')
  .get(getTenders)
  .post(authorize('department', 'admin'), createTender);

router.route('/:id')
  .get(getTender)
  .put(authorize('department', 'admin'), updateTender)
  .delete(authorize('admin'), deleteTender);

router.post('/:id/propose', authorize('citizen', 'ngo', 'officer'), submitProposal);
router.patch('/:id/proposals/:proposalId', authorize('department', 'admin'), actionOnProposal);

module.exports = router;
