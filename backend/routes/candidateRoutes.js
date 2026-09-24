const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { getMyProfile, getCandidateById, uploadResume, removeResume, updateMyProfile } = require('../controllers/candidateController');
const { getMyApplications } = require('../controllers/applicationController');

const router = express.Router();

router.get('/me', authenticate, authorize('candidate'), getMyProfile);
router.put('/me', authenticate, authorize('candidate'), updateMyProfile);
router.get('/me/applications', authenticate, authorize('candidate'), getMyApplications);
router.post('/resume', authenticate, authorize('candidate'), upload.single('resume'), uploadResume);
router.delete('/resume', authenticate, authorize('candidate'), removeResume);
router.get('/:id', authenticate, getCandidateById);

module.exports = router;
