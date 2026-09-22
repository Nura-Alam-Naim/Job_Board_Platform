const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const employerModel = require('../models/employerModel');
const candidateModel = require('../models/candidateModel');
const { sendVerificationEmail } = require('../utils/mailer');
const { validationResult } = require('express-validator');

const generateToken = (id, role, email) => {
  return jwt.sign({ id, role, email }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const registerEmployer = async (req, res, next) => {
  try {
    const { companyName, email, password } = req.body;

    const existingUser = await employerModel.findByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const employerId = await employerModel.create(companyName, email, passwordHash);

    const verificationToken = jwt.sign(
      { id: employerId, role: 'employer', email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await sendVerificationEmail(email, verificationToken, 'employer');

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    next(error);
  }
};

const registerCandidate = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await candidateModel.findByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const candidateId = await candidateModel.create(fullName, email, passwordHash);

    const verificationToken = jwt.sign(
      { id: candidateId, role: 'candidate', email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await sendVerificationEmail(email, verificationToken, 'candidate');

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    let user;
    if (role === 'employer') {
      user = await employerModel.findByEmail(email);
    } else if (role === 'candidate') {
      user = await candidateModel.findByEmail(email);
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

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email address to log in.' });
    }

    const token = generateToken(user.id, role, user.email);
    res.json({ token, role });
  } catch (error) {
    next(error);
  }
};
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Update the correct table based on role
    const db = require('../config/db');
    if (decoded.role === 'employer') {
      await db.execute('UPDATE employers SET is_verified = TRUE WHERE id = ?', [decoded.id]);
    } else if (decoded.role === 'candidate') {
      await db.execute('UPDATE candidates SET is_verified = TRUE WHERE id = ?', [decoded.id]);
    } else {
      return res.status(400).json({ message: 'Invalid role in token' });
    }

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Verification link has expired.' });
    }
    return res.status(400).json({ message: 'Invalid verification token.' });
  }
};

module.exports = { registerEmployer, registerCandidate, login, verifyEmail };
