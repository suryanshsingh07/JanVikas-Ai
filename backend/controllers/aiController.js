/**
 * JanVikas AI — AI Controller
 * Endpoints for AI features: analysis, recommendations, summaries
 */

const Submission = require('../models/Submission');
const Project = require('../models/Project');
const { asyncHandler } = require('../utils/helpers');
const {
  analyzeSubmission,
  checkDuplicate,
  clusterByTopic,
  generateSummary,
  detectLanguage,
  extractKeywords,
} = require('../services/aiService');
const { rankSubmissions } = require('../services/recommendationService');

/**
 * @route   POST /api/ai/analyze
 * @desc    Run AI analysis on a text
 */
const analyzeText = asyncHandler(async (req, res) => {
  const { text, title, priority, category } = req.body;

  if (!text) {
    return res.status(400).json({ success: false, message: 'Text is required' });
  }

  // Fetch recent submissions for duplicate check
  const recentSubmissions = await Submission.find({ category })
    .select('title description')
    .limit(50);

  const analysis = await analyzeSubmission(
    { title: title || text, description: text, priority },
    recentSubmissions
  );

  res.json({ success: true, analysis });
});

/**
 * @route   POST /api/ai/duplicate-check
 * @desc    Check if a text is duplicate of existing submissions
 */
const duplicateCheck = asyncHandler(async (req, res) => {
  const { text, category } = req.body;

  const recentSubmissions = await Submission.find({
    category,
    createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
  })
    .select('title description _id')
    .limit(100);

  const result = checkDuplicate(text, recentSubmissions);

  let duplicateSubmission = null;
  if (result.isDuplicate && result.duplicateOf) {
    duplicateSubmission = await Submission.findById(result.duplicateOf)
      .select('title status votes location');
  }

  res.json({
    success: true,
    ...result,
    duplicateSubmission,
  });
});

/**
 * @route   GET /api/ai/recommendations
 * @desc    Get AI-ranked project recommendations for MP
 * @access  MP, Admin
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const { state, district, category, limit = 10 } = req.query;

  const filter = {
    status: { $in: ['pending', 'reviewing'] },
  };
  if (state) filter['location.state'] = state;
  if (district) filter['location.district'] = district;
  if (category) filter.category = category;

  const submissions = await Submission.find(filter).limit(100);

  const ranked = rankSubmissions(submissions).slice(0, Number(limit));

  res.json({
    success: true,
    data: ranked,
    algorithm: {
      name: 'JanVikas 6-Factor Recommendation Engine',
      factors: [
        { name: 'Citizen Demand', weight: '25%' },
        { name: 'Population Affected', weight: '20%' },
        { name: 'Infrastructure Gap', weight: '20%' },
        { name: 'Geographic Equity', weight: '15%' },
        { name: 'Urgency Level', weight: '12%' },
        { name: 'Budget Feasibility', weight: '8%' },
      ],
    },
  });
});

/**
 * @route   GET /api/ai/summary
 * @desc    Generate LLM-style executive summary
 * @access  MP, Admin
 */
const getSummary = asyncHandler(async (req, res) => {
  const { state, district, timeframe = 'last month', limit = 200 } = req.query;

  const filter = {};
  if (state) filter['location.state'] = state;
  if (district) filter['location.district'] = district;

  // Date filter based on timeframe
  const dateMap = {
    'last week': 7,
    'last month': 30,
    'last quarter': 90,
    'last year': 365,
  };
  const days = dateMap[timeframe] || 30;
  filter.createdAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };

  const submissions = await Submission.find(filter)
    .select('title category status priority votes location aiAnalysis')
    .limit(Number(limit));

  const summary = generateSummary(submissions, timeframe);

  res.json({ success: true, summary, timeframe, total: submissions.length });
});

/**
 * @route   GET /api/ai/clusters
 * @desc    Get topic clusters
 * @access  MP, Admin
 */
const getClusters = asyncHandler(async (req, res) => {
  const { state, days = 30 } = req.query;

  const filter = {
    createdAt: { $gte: new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000) },
  };
  if (state) filter['location.state'] = state;

  const submissions = await Submission.find(filter)
    .select('category title aiAnalysis.priorityScore status _id');

  const clusters = clusterByTopic(submissions);

  res.json({ success: true, data: clusters, total: submissions.length });
});

/**
 * @route   POST /api/ai/language
 * @desc    Detect language and extract keywords
 */
const processLanguage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ success: false, message: 'Text required' });

  const language = detectLanguage(text);
  const keywords = extractKeywords(text);

  res.json({ success: true, language, keywords });
});

module.exports = {
  analyzeText,
  duplicateCheck,
  getRecommendations,
  getSummary,
  getClusters,
  processLanguage,
};
