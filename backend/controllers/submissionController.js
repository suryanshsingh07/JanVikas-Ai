/**
 * JanVikas AI — Submission Controller
 */

const Submission = require('../models/Submission');
const Vote = require('../models/Vote');
const { createError, asyncHandler, getPagination } = require('../utils/helpers');
const { analyzeSubmission } = require('../services/aiService');
const { uploadImages, uploadVoice } = require('../services/firebaseService');
const { notifyStatusChange } = require('../services/notificationService');

/**
 * @route   POST /api/submissions
 * @desc    Create new submission
 * @access  Private (Citizen)
 */
const createSubmission = asyncHandler(async (req, res) => {
  const {
    title, description, category, priority,
    location, originalLanguage, isAnonymous, source,
  } = req.body;

  // ─── Upload media files ───────────────────────────────
  let imageUrls = [];
  let voiceUrl = null;

  if (req.files?.images) {
    imageUrls = await uploadImages(req.files.images);
  }
  if (req.files?.voice && req.files.voice[0]) {
    voiceUrl = await uploadVoice(req.files.voice[0]);
  }

  // ─── Parse location ───────────────────────────────────
  let parsedLocation = {};
  try {
    parsedLocation = typeof location === 'string' ? JSON.parse(location) : location || {};
  } catch (e) {
    parsedLocation = {};
  }

  // ─── Create submission ────────────────────────────────
  const submission = await Submission.create({
    citizen: req.user._id,
    title,
    description,
    category,
    priority: priority || 'medium',
    originalLanguage: originalLanguage || 'en',
    location: parsedLocation,
    media: {
      images: imageUrls,
      voiceRecording: voiceUrl,
      voiceTranscript: req.body.voiceTranscript || '',
    },
    isAnonymous: isAnonymous === 'true' || isAnonymous === true,
    source: source || 'web',
  });

  // ─── Run AI analysis in background ───────────────────
  // Get recent similar submissions for duplicate detection
  const recentSubmissions = await Submission.find({
    category,
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    _id: { $ne: submission._id },
  }).select('title description').limit(50);

  const aiResult = await analyzeSubmission(
    { title, description, priority },
    recentSubmissions
  );

  // Update submission with AI analysis
  submission.aiAnalysis = aiResult;
  await submission.save();

  res.status(201).json({
    success: true,
    message: 'Submission created successfully. AI analysis complete.',
    submission,
  });
});

/**
 * @route   GET /api/submissions
 * @desc    Get all submissions (with filters, pagination, sorting)
 * @access  Private
 */
const getSubmissions = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 10, category, status, priority,
    state, district, search, sortBy = 'createdAt', order = 'desc',
    isDuplicate,
  } = req.query;

  // ─── Build filter ─────────────────────────────────────
  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (state) filter['location.state'] = state;
  if (district) filter['location.district'] = district;
  if (isDuplicate !== undefined) filter['aiAnalysis.isDuplicate'] = isDuplicate === 'true';

  // ─── Role-based filtering ─────────────────────────────
  if (req.user.role === 'citizen') {
    filter.citizen = req.user._id; // Citizens only see their own
  }

  // ─── Text search ──────────────────────────────────────
  if (search) {
    filter.$text = { $search: search };
  }

  const { skip, limitNum } = getPagination(page, limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [submissions, total] = await Promise.all([
    Submission.find(filter)
      .populate('citizen', 'name avatar role')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Submission.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: submissions,
    pagination: {
      total,
      page: Number(page),
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * @route   GET /api/submissions/:id
 * @desc    Get single submission
 * @access  Private
 */
const getSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('citizen', 'name avatar role constituency')
    .populate('comments')
    .populate('relatedProject', 'title status priorityScore');

  if (!submission) {
    throw createError('Submission not found', 404);
  }

  // Increment view count
  submission.views += 1;
  await submission.save({ validateBeforeSave: false });

  res.json({ success: true, submission });
});

/**
 * @route   PUT /api/submissions/:id/status
 * @desc    Update submission status (MP/Admin)
 * @access  Private (MP, Admin)
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const submission = await Submission.findById(req.params.id);
  if (!submission) throw createError('Submission not found', 404);

  const oldStatus = submission.status;
  submission.status = status;
  submission.statusHistory.push({
    status,
    changedBy: req.user._id,
    note: note || '',
  });

  await submission.save();

  // Notify citizen
  await notifyStatusChange(submission, status, note);

  res.json({
    success: true,
    message: `Status updated from ${oldStatus} to ${status}`,
    submission,
  });
});

/**
 * @route   POST /api/submissions/:id/vote
 * @desc    Vote on a submission
 * @access  Private (Citizen)
 */
const voteSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) throw createError('Submission not found', 404);

  // Check if already voted
  const existingVote = await Vote.findOne({
    user: req.user._id,
    submission: req.params.id,
  });

  if (existingVote) {
    // Remove vote
    await Vote.deleteOne({ _id: existingVote._id });
    submission.votes = Math.max(0, submission.votes - 1);
    submission.voterIds = submission.voterIds.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await submission.save({ validateBeforeSave: false });
    return res.json({ success: true, message: 'Vote removed', votes: submission.votes, voted: false });
  }

  // Add vote
  await Vote.create({ user: req.user._id, submission: req.params.id });
  submission.votes += 1;
  submission.voterIds.push(req.user._id);
  await submission.save({ validateBeforeSave: false });

  res.json({ success: true, message: 'Vote added', votes: submission.votes, voted: true });
});

/**
 * @route   DELETE /api/submissions/:id
 * @desc    Delete submission
 * @access  Private (Owner or Admin)
 */
const deleteSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) throw createError('Submission not found', 404);

  // Only owner or admin can delete
  if (
    submission.citizen.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw createError('Not authorized to delete this submission', 403);
  }

  await Submission.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'Submission deleted successfully' });
});

/**
 * @route   GET /api/submissions/map
 * @desc    Get submissions with coordinates for map
 * @access  Private
 */
const getMapSubmissions = asyncHandler(async (req, res) => {
  const { category, status, state } = req.query;

  const filter = {
    'location.coordinates': { $exists: true, $ne: [] },
  };
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (state) filter['location.state'] = state;

  const submissions = await Submission.find(filter)
    .select('title category status priority location votes aiAnalysis.priorityScore createdAt')
    .limit(500)
    .lean();

  res.json({ success: true, data: submissions, total: submissions.length });
});

module.exports = {
  createSubmission,
  getSubmissions,
  getSubmission,
  updateStatus,
  voteSubmission,
  deleteSubmission,
  getMapSubmissions,
};
