/**
 * JanVikas AI — Analytics Routes
 */
const express = require('express');
const router = express.Router();
const { overview, categories, heatmap, trends, districts } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('officer', 'department', 'admin'));
router.get('/overview', overview);
router.get('/categories', categories);
router.get('/heatmap', heatmap);
router.get('/trends', trends);
router.get('/districts', districts);

module.exports = router;
