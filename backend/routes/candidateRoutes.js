const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { getMyProfile, uploadResume } = require('../controllers/candidateController');
const { getMyApplications } = require('../controllers/applicationController');

const router = express.Router();

router.get('/me', authenticate, authorize('candidate'), getMyProfile);
router.get('/me/applications', authenticate, authorize('candidate'), getMyApplications);
router.post('/resume', authenticate, authorize('candidate'), upload.single('resume'), uploadResume);

module.exports = router;
