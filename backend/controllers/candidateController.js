const Candidate = require('../models/candidateModel');
const Employer = require('../models/employerModel');

const getMyProfile = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const profile = await Candidate.findById(candidateId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

const getEmployerProfile = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const profile = await Employer.findById(employerId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }
    
    const candidateId = req.user.id;
    const resumePath = req.file.path.replace(/\\/g, '/'); // Normalize path for windows/unix
    
    await Candidate.updateResume(candidateId, resumePath);
    
    res.json({ message: 'Resume uploaded successfully', resumePath });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile, uploadResume, getEmployerProfile };
