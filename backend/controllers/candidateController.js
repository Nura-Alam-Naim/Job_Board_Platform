const Candidate = require('../models/candidateModel');
const Employer = require('../models/employerModel');
const fs = require('fs');
const path = require('path');

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

const getCandidateById = async (req, res, next) => {
  try {
    const candidateId = req.params.id;
    const profile = await Candidate.findById(candidateId);
    if (!profile) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    // Remove sensitive info just in case
    delete profile.password_hash;
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

const removeResume = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const candidate = await Candidate.findById(candidateId);
    
    if (candidate && candidate.resume_path) {
      const fullPath = path.join(__dirname, '..', candidate.resume_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      await Candidate.updateResume(candidateId, null);
    }
    
    res.json({ message: 'Resume removed successfully' });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const { first_name, last_name, age, profession, cgpa, institute } = req.body;
    if (!first_name || !last_name) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }
    await Candidate.updateProfile(candidateId, { first_name, last_name, age, profession, cgpa, institute });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

const updateEmployerProfile = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const { companyName, companyDescription } = req.body;
    if (!companyName) {
      return res.status(400).json({ message: 'Company name is required' });
    }
    await Employer.updateProfile(employerId, companyName, companyDescription || null);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile, getCandidateById, uploadResume, removeResume, getEmployerProfile, updateMyProfile, updateEmployerProfile };
