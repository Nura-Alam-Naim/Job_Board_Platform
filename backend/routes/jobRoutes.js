const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { createJob, getJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobController');
const { applyForJob, getJobApplications } = require('../controllers/applicationController');

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected employer routes
router.post(
  '/',
  authenticate,
  authorize('employer'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('jobType').isIn(['full-time', 'part-time', 'contract', 'internship', 'remote']).withMessage('Invalid job type'),
    body('salaryMin').optional().isInt(),
    body('salaryMax').optional().isInt(),
  ],
  validate,
  createJob
);

router.put(
  '/:id',
  authenticate,
  authorize('employer'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('jobType').isIn(['full-time', 'part-time', 'contract', 'internship', 'remote']).withMessage('Invalid job type')
  ],
  validate,
  updateJob
);

router.delete('/:id', authenticate, authorize('employer'), deleteJob);

router.get('/:id/applications', authenticate, authorize('employer'), getJobApplications);

// Protected candidate routes
router.post('/:id/apply', authenticate, authorize('candidate'), applyForJob);

module.exports = router;
