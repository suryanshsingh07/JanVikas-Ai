/**
 * JanVikas AI — Analytics Service
 * Aggregation pipelines and analytics computations
 */

const Submission = require('../models/Submission');
const Project = require('../models/Project');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Get overall dashboard stats
 * @param {Object} filters - Optional filters (state, district, mpId)
 */
const getOverviewStats = async (filters = {}) => {
  try {
    const matchFilter = {};
    if (filters.state) matchFilter['location.state'] = filters.state;
    if (filters.district) matchFilter['location.district'] = filters.district;

    const [
      totalSubmissions,
      pendingSubmissions,
      resolvedSubmissions,
      totalProjects,
      activeProjects,
      totalUsers,
      thisMonthSubmissions,
      lastMonthSubmissions,
    ] = await Promise.all([
      Submission.countDocuments(matchFilter),
      Submission.countDocuments({ ...matchFilter, status: 'pending' }),
      Submission.countDocuments({ ...matchFilter, status: 'resolved' }),
      Project.countDocuments({}),
      Project.countDocuments({ status: 'ongoing' }),
      User.countDocuments({ role: 'citizen' }),
      Submission.countDocuments({
        ...matchFilter,
        createdAt: { $gte: new Date(new Date().setDate(1)) },
      }),
      Submission.countDocuments({
        ...matchFilter,
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          $lt: new Date(new Date().setDate(1)),
        },
      }),
    ]);

    const resolutionRate = totalSubmissions > 0
      ? Math.round((resolvedSubmissions / totalSubmissions) * 100)
      : 0;

    const growthRate = lastMonthSubmissions > 0
      ? Math.round(((thisMonthSubmissions - lastMonthSubmissions) / lastMonthSubmissions) * 100)
      : 0;

    return {
      submissions: {
        total: totalSubmissions,
        pending: pendingSubmissions,
        resolved: resolvedSubmissions,
        resolutionRate,
        thisMonth: thisMonthSubmissions,
        growthRate,
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
      },
      citizens: {
        total: totalUsers,
      },
    };
  } catch (error) {
    logger.error(`Analytics overview error: ${error.message}`);
    throw error;
  }
};

/**
 * Get category-wise breakdown
 */
const getCategoryBreakdown = async (filters = {}) => {
  const matchFilter = {};
  if (filters.state) matchFilter['location.state'] = filters.state;

  const data = await Submission.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPriorityScore: { $avg: '$aiAnalysis.priorityScore' },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
        },
      },
    },
    { $sort: { count: -1 } },
    {
      $project: {
        category: '$_id',
        count: 1,
        avgPriorityScore: { $round: ['$avgPriorityScore', 1] },
        resolved: 1,
        _id: 0,
      },
    },
  ]);

  return data;
};

/**
 * Get geographic heatmap data
 */
const getHeatmapData = async (filters = {}) => {
  const matchFilter = {
    'location.coordinates': { $exists: true, $ne: [] },
  };
  if (filters.state) matchFilter['location.state'] = filters.state;
  if (filters.category) matchFilter.category = filters.category;

  const data = await Submission.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          district: '$location.district',
          state: '$location.state',
        },
        count: { $sum: 1 },
        avgLat: { $avg: { $arrayElemAt: ['$location.coordinates', 1] } },
        avgLng: { $avg: { $arrayElemAt: ['$location.coordinates', 0] } },
        categories: { $addToSet: '$category' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 100 },
  ]);

  return data.map((d) => ({
    district: d._id.district,
    state: d._id.state,
    count: d.count,
    coordinates: [d.avgLat || 20.5937, d.avgLng || 78.9629],
    categories: d.categories,
    intensity: Math.min(1, d.count / 100), // Normalize for heatmap
  }));
};

/**
 * Get trend data (monthly submissions over time)
 */
const getTrendData = async (months = 6, filters = {}) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const matchFilter = { createdAt: { $gte: startDate } };
  if (filters.state) matchFilter['location.state'] = filters.state;

  const data = await Submission.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
        },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return data.map((d) => ({
    month: `${monthNames[d._id.month - 1]} ${d._id.year}`,
    submissions: d.count,
    resolved: d.resolved,
    pending: d.count - d.resolved,
  }));
};

/**
 * Get top performing districts
 */
const getTopDistricts = async (limit = 10) => {
  return Submission.aggregate([
    {
      $group: {
        _id: {
          district: '$location.district',
          state: '$location.state',
        },
        count: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
        },
        avgScore: { $avg: '$aiAnalysis.priorityScore' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $project: {
        district: '$_id.district',
        state: '$_id.state',
        count: 1,
        resolved: 1,
        avgScore: { $round: ['$avgScore', 1] },
        resolutionRate: {
          $round: [{ $multiply: [{ $divide: ['$resolved', '$count'] }, 100] }, 1],
        },
        _id: 0,
      },
    },
  ]);
};

module.exports = {
  getOverviewStats,
  getCategoryBreakdown,
  getHeatmapData,
  getTrendData,
  getTopDistricts,
};
