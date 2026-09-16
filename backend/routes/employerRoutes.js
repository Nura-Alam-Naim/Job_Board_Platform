const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { getEmployerJobs } = require('../controllers/jobController');
const { getEmployerStats } = require('../controllers/applicationController');
const { getEmployerProfile } = require('../controllers/candidateController');

const router = express.Router();

router.get('/me', authenticate, authorize('employer'), getEmployerProfile);
router.get('/me/jobs', authenticate, authorize('employer'), getEmployerJobs);
router.get('/me/stats', authenticate, authorize('employer'), getEmployerStats);

module.exports = router;
