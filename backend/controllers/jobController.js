const Job = require('../models/jobModel');

const createJob = async (req, res, next) => {
  try {
    const { title, description, location, jobType, salaryMin, salaryMax, deadline } = req.body;
    const employerId = req.user.id;

    if (salaryMin && salaryMax && Number(salaryMin) > Number(salaryMax)) {
      return res.status(400).json({ message: 'Minimum salary cannot be greater than maximum salary' });
    }

    const jobId = await Job.create(employerId, title, description, location, jobType, salaryMin, salaryMax, deadline);
    res.status(201).json({ message: 'Job created successfully', jobId });
  } catch (error) {
    next(error);
  }
};

const getJobs = async (req, res, next) => {
  try {
    const { search, location, jobType, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await Job.findAll({ search, location, jobType, limit, offset });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const { title, description, location, jobType, salaryMin, salaryMax, deadline } = req.body;
    const employerId = req.user.id;
    const jobId = req.params.id;

    if (salaryMin && salaryMax && Number(salaryMin) > Number(salaryMax)) {
      return res.status(400).json({ message: 'Minimum salary cannot be greater than maximum salary' });
    }

    const updated = await Job.update(jobId, employerId, { title, description, location, jobType, salaryMin, salaryMax, deadline });
    
    if (!updated) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    res.json({ message: 'Job updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const jobId = req.params.id;

    const deleted = await Job.deactivate(jobId, employerId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    res.json({ message: 'Job deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

const getEmployerJobs = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const jobs = await Job.findWithStatsByEmployerId(employerId);
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob, getEmployerJobs };
