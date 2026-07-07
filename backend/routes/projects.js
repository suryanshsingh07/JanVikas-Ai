/**
 * JanVikas AI — Project Routes
 */
const express = require('express');
const router = express.Router();
const { getProjects, getRankedProjects, createProject, getProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createProjectValidator, updateProjectStatusValidator } = require('../validators/projectValidator');

router.use(protect);

router.get('/ranked', authorize('official', 'admin'), getRankedProjects);
router.route('/').get(getProjects).post(authorize('official', 'admin'), createProjectValidator, validate, createProject);
router.route('/:id').get(getProject).put(authorize('official', 'admin'), updateProject).delete(authorize('admin'), deleteProject);

module.exports = router;
