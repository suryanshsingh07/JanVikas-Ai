/**
 * JanVikas AI — Tender Controller
 * Department creates tenders; Citizens/NGOs propose; Department/Admin take action
 */

const Tender = require('../models/Tender');
const User = require('../models/User');
const { createError, asyncHandler, getPagination } = require('../utils/helpers');
const { createNotification } = require('../services/notificationService');

/**
 * Broadcast tender notification to citizens and NGOs
 */
const broadcastTenderNotification = async (tender) => {
  try {
    const users = await User.find({
      role: { $in: ['citizen', 'ngo'] },
      isActive: true,
    }).select('_id').lean();

    const notifications = users.map((u) =>
      createNotification({
        recipient: u._id,
        title: '📋 New Tender Posted',
        message: `Department has posted a new tender: "${tender.title}". Category: ${tender.category}. Deadline: ${new Date(tender.deadline).toLocaleDateString('en-IN')}.`,
        type: 'tender_posted',
        data: { tenderId: tender._id, link: `/tenders/${tender._id}` },
        priority: 'normal',
      })
    );
    await Promise.allSettled(notifications);
  } catch (err) {
    console.error('broadcastTenderNotification error:', err.message);
  }
};

/**
 * @route   GET /api/tenders
 * @desc    Get all tenders (public)
 * @access  Public / Private
 */
const getTenders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, category, status, state, search } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  else filter.status = { $in: ['open', 'closed', 'awarded'] }; // default: exclude drafts
  if (state) filter['location.state'] = state;
  if (search) filter.$text = { $search: search };

  const { skip, limitNum } = getPagination(page, limit);

  const [tenders, total] = await Promise.all([
    Tender.find(filter)
      .populate('createdBy', 'name role officerDetails')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Tender.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: tenders,
    pagination: { total, page: Number(page), limit: limitNum, pages: Math.ceil(total / limitNum) },
  });
});

/**
 * @route   GET /api/tenders/latest
 * @desc    Get latest open tenders for landing page
 * @access  Public
 */
const getLatestTenders = asyncHandler(async (req, res) => {
  const tenders = await Tender.find({ status: 'open' })
    .populate('createdBy', 'name officerDetails')
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  res.json({ success: true, data: tenders });
});

/**
 * @route   GET /api/tenders/:id
 * @desc    Get single tender
 * @access  Private
 */
const getTender = asyncHandler(async (req, res) => {
  const tender = await Tender.findById(req.params.id)
    .populate('createdBy', 'name role officerDetails')
    .populate('proposals.proposedBy', 'name role avatar')
    .populate('proposals.actionBy', 'name role')
    .populate('awardedTo', 'name role');

  if (!tender) throw createError('Tender not found', 404);
  res.json({ success: true, tender });
});

/**
 * @route   POST /api/tenders
 * @desc    Create a new tender
 * @access  Private (Department, Admin)
 */
const createTender = asyncHandler(async (req, res) => {
  const tender = await Tender.create({
    ...req.body,
    createdBy: req.user._id,
  });

  // Broadcast if status is open
  if (tender.status === 'open') {
    broadcastTenderNotification(tender);
  }

  res.status(201).json({ success: true, message: 'Tender created successfully.', tender });
});

/**
 * @route   PUT /api/tenders/:id
 * @desc    Update a tender
 * @access  Private (Department creator, Admin)
 */
const updateTender = asyncHandler(async (req, res) => {
  const tender = await Tender.findById(req.params.id);
  if (!tender) throw createError('Tender not found', 404);

  // Only creator or admin can update
  if (
    tender.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw createError('Not authorized to update this tender', 403);
  }

  const wasOpen = tender.status !== 'open';
  Object.assign(tender, req.body);
  await tender.save();

  // Broadcast if newly published
  if (!wasOpen && tender.status === 'open') {
    broadcastTenderNotification(tender);
  }

  res.json({ success: true, message: 'Tender updated.', tender });
});

/**
 * @route   DELETE /api/tenders/:id
 * @desc    Delete a tender
 * @access  Private (Admin)
 */
const deleteTender = asyncHandler(async (req, res) => {
  const tender = await Tender.findByIdAndDelete(req.params.id);
  if (!tender) throw createError('Tender not found', 404);
  res.json({ success: true, message: 'Tender deleted.' });
});

/**
 * @route   POST /api/tenders/:id/propose
 * @desc    Submit a proposal on a tender
 * @access  Private (Citizen, NGO, Officer)
 */
const submitProposal = asyncHandler(async (req, res) => {
  const { description, estimatedCost, timeline } = req.body;

  const tender = await Tender.findById(req.params.id);
  if (!tender) throw createError('Tender not found', 404);
  if (tender.status !== 'open') throw createError('This tender is no longer accepting proposals', 400);

  // Check eligibility
  if (!tender.eligibleRoles.includes(req.user.role)) {
    throw createError(`Your role (${req.user.role}) is not eligible to propose on this tender`, 403);
  }

  // Check if already proposed
  const alreadyProposed = tender.proposals.some(
    (p) => p.proposedBy.toString() === req.user._id.toString()
  );
  if (alreadyProposed) throw createError('You have already submitted a proposal for this tender', 400);

  tender.proposals.push({
    proposedBy: req.user._id,
    description,
    estimatedCost,
    timeline,
  });

  await tender.save();

  // Notify department
  await createNotification({
    recipient: tender.createdBy,
    title: '📝 New Proposal Received',
    message: `A new proposal has been submitted for your tender "${tender.title}".`,
    type: 'project_proposed',
    data: { tenderId: tender._id, link: `/department/tenders/${tender._id}` },
    priority: 'normal',
  });

  res.json({ success: true, message: 'Proposal submitted successfully.' });
});

/**
 * @route   PATCH /api/tenders/:id/proposals/:proposalId
 * @desc    Approve or reject a proposal
 * @access  Private (Department, Admin)
 */
const actionOnProposal = asyncHandler(async (req, res) => {
  const { action, note } = req.body; // action: 'approved' | 'rejected' | 'shortlisted'

  const tender = await Tender.findById(req.params.id);
  if (!tender) throw createError('Tender not found', 404);

  // Only tender creator or admin
  if (
    tender.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw createError('Not authorized to manage this tender', 403);
  }

  const proposal = tender.proposals.id(req.params.proposalId);
  if (!proposal) throw createError('Proposal not found', 404);

  proposal.status = action;
  proposal.actionNote = note || '';
  proposal.actionBy = req.user._id;
  proposal.actionAt = new Date();

  if (action === 'approved') {
    tender.awardedTo = proposal.proposedBy;
    tender.status = 'awarded';
  }

  await tender.save();

  // Notify proposer
  await createNotification({
    recipient: proposal.proposedBy,
    title: action === 'approved' ? '🎉 Proposal Approved!' : action === 'shortlisted' ? '📋 Proposal Shortlisted' : '❌ Proposal Rejected',
    message: `Your proposal for tender "${tender.title}" has been ${action}.${note ? ' Note: ' + note : ''}`,
    type: 'tender_action',
    data: { tenderId: tender._id, link: `/tenders/${tender._id}` },
    priority: action === 'approved' ? 'high' : 'normal',
  });

  res.json({ success: true, message: `Proposal ${action} successfully.`, tender });
});

/**
 * @route   GET /api/tenders/department/mine
 * @desc    Get tenders created by the current department user
 * @access  Private (Department, Admin)
 */
const getMyTenders = asyncHandler(async (req, res) => {
  const filter = { createdBy: req.user._id };
  const tenders = await Tender.find(filter)
    .populate('proposals.proposedBy', 'name role avatar')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: tenders, count: tenders.length });
});

module.exports = {
  getTenders,
  getLatestTenders,
  getTender,
  createTender,
  updateTender,
  deleteTender,
  submitProposal,
  actionOnProposal,
  getMyTenders,
};
