const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { updateApplicationStatus } = require('../controllers/applicationController');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.patch(
  '/:id/status',
  authenticate,
  authorize('employer'),
  [
    body('status').isIn(['applied', 'reviewed', 'shortlisted', 'rejected', 'hired']).withMessage('Invalid status')
  ],
  validate,
  updateApplicationStatus
);

module.exports = router;
