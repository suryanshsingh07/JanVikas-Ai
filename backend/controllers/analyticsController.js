/**
 * JanVikas AI — Analytics Controller
 */

const { asyncHandler } = require('../utils/helpers');
const {
  getOverviewStats,
  getCategoryBreakdown,
  getHeatmapData,
  getTrendData,
  getTopDistricts,
} = require('../services/analyticsService');

/**
 * @route   GET /api/analytics/overview
 */
const overview = asyncHandler(async (req, res) => {
  const filters = {
    state: req.query.state,
    district: req.query.district,
  };
  const data = await getOverviewStats(filters);
  res.json({ success: true, data });
});

/**
 * @route   GET /api/analytics/categories
 */
const categories = asyncHandler(async (req, res) => {
  const data = await getCategoryBreakdown({ state: req.query.state });
  res.json({ success: true, data });
});

/**
 * @route   GET /api/analytics/heatmap
 */
const heatmap = asyncHandler(async (req, res) => {
  const data = await getHeatmapData({
    state: req.query.state,
    category: req.query.category,
  });
  res.json({ success: true, data });
});

/**
 * @route   GET /api/analytics/trends
 */
const trends = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months) || 6;
  const data = await getTrendData(months, { state: req.query.state });
  res.json({ success: true, data });
});

/**
 * @route   GET /api/analytics/districts
 */
const districts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const data = await getTopDistricts(limit);
  res.json({ success: true, data });
});

module.exports = { overview, categories, heatmap, trends, districts };
