const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');
const { registerEmployer, registerCandidate, login, verifyEmail } = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register/employer',
  [
    body('companyName').notEmpty().withMessage('Company name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validate,
  registerEmployer
);

router.post(
  '/register/candidate',
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validate,
  registerCandidate
);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['employer', 'candidate']).withMessage('Valid role is required')
], validate, login);

router.get('/verify-email', verifyEmail);

module.exports = router;
