/**
 * JanVikas AI — Project Controller
 */

const Project = require('../models/Project');
const Submission = require('../models/Submission'); // Required for population
const { createError, asyncHandler, getPagination } = require('../utils/helpers');
const { rankSubmissions } = require('../services/recommendationService');

/**
 * @route   GET /api/projects
 */
const getProjects = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, status, state, district, search } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (state) filter['location.state'] = state;
  if (district) filter['location.district'] = district;
  if (search) filter.$text = { $search: search };

  const { skip, limitNum } = getPagination(page, limit);

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('assignedOfficial', 'name avatar constituency')
      .sort({ priorityScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Project.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: projects,
    pagination: { total, page: Number(page), limit: limitNum, pages: Math.ceil(total / limitNum) },
  });
});

/**
 * @route   GET /api/projects/ranked
 * @desc    Get AI-ranked projects
 */
const getRankedProjects = asyncHandler(async (req, res) => {
  const { state, category, limit = 20 } = req.query;

  const filter = {};
  if (state) filter['location.state'] = state;
  if (category) filter.category = category;

  const projects = await Project.find(filter)
    .populate('relatedSubmissions', 'votes title')
    .limit(Number(limit) * 2);

  const ranked = rankSubmissions(projects);

  res.json({
    success: true,
    data: ranked.slice(0, Number(limit)),
    total: ranked.length,
    message: `Projects ranked using 6-factor AI algorithm`,
  });
});

/**
 * @route   POST /api/projects
 */
const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    ...req.body,
    createdBy: req.user._id,
    assignedOfficial: req.user.role === 'officer' ? req.user._id : req.body.assignedOfficial,
  });

  res.status(201).json({ success: true, message: 'Project created.', project });
});

/**
 * @route   GET /api/projects/:id
 */
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('assignedOfficial', 'name avatar constituency')
    .populate('relatedSubmissions', 'title status votes category');

  if (!project) throw createError('Project not found', 404);
  res.json({ success: true, project });
});

/**
 * @route   PUT /api/projects/:id
 */
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!project) throw createError('Project not found', 404);
  res.json({ success: true, message: 'Project updated.', project });
});

/**
 * @route   PUT /api/projects/:id/status
 */
const updateProjectStatus = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!project) throw createError('Project not found', 404);
  res.json({ success: true, message: 'Project status updated.', project });
});

/**
 * @route   DELETE /api/projects/:id
 */
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) throw createError('Project not found', 404);
  res.json({ success: true, message: 'Project deleted.' });
});

module.exports = { getProjects, getRankedProjects, createProject, getProject, updateProject, updateProjectStatus, deleteProject };
