const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { getEmployerJobs } = require('../controllers/jobController');
const { getEmployerStats, getEmployerAllApplications } = require('../controllers/applicationController');
const { getEmployerProfile, updateEmployerProfile } = require('../controllers/candidateController');

const router = express.Router();

router.get('/me', authenticate, authorize('employer'), getEmployerProfile);
router.put('/me', authenticate, authorize('employer'), updateEmployerProfile);
router.get('/me/jobs', authenticate, authorize('employer'), getEmployerJobs);
router.get('/me/stats', authenticate, authorize('employer'), getEmployerStats);
router.get('/me/applications', authenticate, authorize('employer'), getEmployerAllApplications);

module.exports = router;
