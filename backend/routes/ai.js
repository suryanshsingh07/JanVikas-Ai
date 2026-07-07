/**
 * JanVikas AI — AI Routes
 */
const express = require('express');
const router = express.Router();
const { analyzeText, duplicateCheck, getRecommendations, getSummary, getClusters, processLanguage } = require('../controllers/aiController');
const { protect, authorize } = require('../middlewares/auth');
const { aiLimiter } = require('../middlewares/rateLimiter');

router.use(protect);
router.use(aiLimiter);

router.post('/analyze', analyzeText);
router.post('/duplicate-check', duplicateCheck);
router.post('/language', processLanguage);
router.get('/recommendations', authorize('official', 'admin'), getRecommendations);
router.get('/summary', authorize('official', 'admin'), getSummary);
router.get('/clusters', authorize('official', 'admin'), getClusters);

module.exports = router;
