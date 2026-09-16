const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employer = require('../models/employerModel');
const Candidate = require('../models/candidateModel');
const { validationResult } = require('express-validator');

const generateToken = (id, role, email) => {
  return jwt.sign({ id, role, email }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const registerEmployer = async (req, res, next) => {
  try {
    const { companyName, email, password } = req.body;

    const existingUser = await Employer.findByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const employerId = await Employer.create(companyName, email, passwordHash);

    const token = generateToken(employerId, 'employer', email);
    res.status(201).json({ token, role: 'employer' });
  } catch (error) {
    next(error);
  }
};

const registerCandidate = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await Candidate.findByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const candidateId = await Candidate.create(fullName, email, passwordHash);

    const token = generateToken(candidateId, 'candidate', email);
    res.status(201).json({ token, role: 'candidate' });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    let user;
    if (role === 'employer') {
      user = await Employer.findByEmail(email);
    } else if (role === 'candidate') {
      user = await Candidate.findByEmail(email);
    } else {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, role, user.email);
    res.json({ token, role });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerEmployer, registerCandidate, login };
