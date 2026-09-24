const Application = require('../models/applicationModel');
const Job = require('../models/jobModel');
const Candidate = require('../models/candidateModel');
const Employer = require('../models/employerModel');
const { sendEmail } = require('../utils/mailer');
const path = require('path');

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

    // Fetch employer and send email with CV
    const employer = await Employer.findById(job.employer_id);
    if (employer) {
      const subject = `New Application for ${job.title}`;
      const text = `Hello ${employer.company_name},\n\nA candidate named ${candidate.full_name} has applied for your job posting: "${job.title}".\n\nPlease find their CV attached.\n\nCover Note:\n${coverNote || 'N/A'}\n\nThank you,\nJob Board Platform`;
      
      const attachments = [
        {
          filename: 'candidate_resume.pdf',
          path: path.join(__dirname, '..', candidate.resume_path)
        }
      ];
      await sendEmail(employer.email, subject, text, attachments);
    }

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

    // Send email notification based on status
    let subject = `Update on your application for ${updatedApp.job_title}`;
    let text = `Hello,\n\nYour application status for the position of "${updatedApp.job_title}" has been updated to: ${status.toUpperCase()}.\n\nThank you,\nJob Board Team`;
    
    if (status === 'hired') {
      subject = `Congratulations! You have been HIRED for ${updatedApp.job_title}`;
      text = `Hello!\n\nWe are absolutely thrilled to inform you that you have been HIRED for the position of "${updatedApp.job_title}"!\n\nThe employer will be in touch with you shortly regarding the next steps.\n\nCongratulations from the Job Board Team!`;
    }
    
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

const getEmployerAllApplications = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const { status } = req.query;
    const applications = await Application.findByEmployerId(employerId, status);
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

module.exports = { applyForJob, getMyApplications, getJobApplications, updateApplicationStatus, getEmployerStats, getEmployerAllApplications };
