const Application = require('../models/applicationModel');
const Job = require('../models/jobModel');
const Candidate = require('../models/candidateModel');
const { sendEmail } = require('../utils/mailer');

const applyForJob = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const jobId = req.params.id;
    const { coverNote } = req.body;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate || !candidate.resume_path) {
      return res.status(400).json({ message: 'Please upload a resume first before applying' });
    }

    const job = await Job.findById(jobId);
    if (!job || !job.is_active) {
      return res.status(404).json({ message: 'Job not found or inactive' });
    }

    await Application.create(jobId, candidateId, candidate.resume_path, coverNote);
    res.status(201).json({ message: 'Applied successfully' });
  } catch (error) {
    if (error.message === 'Already applied to this job') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const applications = await Application.findByCandidateId(candidateId);
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

const getJobApplications = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const jobId = req.params.id;

    const applications = await Application.findByJobIdAndEmployerId(jobId, employerId);
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const applicationId = req.params.id;
    const { status } = req.body;

    const updatedApp = await Application.updateStatus(applicationId, employerId, status);
    
    if (!updatedApp) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    // Send email notification
    const subject = `Update on your application for ${updatedApp.job_title}`;
    const text = `Hello,\n\nYour application status for the position of "${updatedApp.job_title}" has been updated to: ${status.toUpperCase()}.\n\nThank you,\nJob Board Team`;
    
    await sendEmail(updatedApp.candidate_email, subject, text);

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    next(error);
  }
};

const getEmployerStats = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const stats = await Application.getEmployerStats(employerId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = { applyForJob, getMyApplications, getJobApplications, updateApplicationStatus, getEmployerStats };
