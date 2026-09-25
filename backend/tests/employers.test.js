const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Employer Endpoints', () => {
  let employerToken;
  let employerId;
  let candidateToken;
  let candidateId;
  let jobId;

  beforeAll(async () => {
    await db.execute('DELETE FROM applications');
    await db.execute('DELETE FROM jobs');
    await db.execute('DELETE FROM candidates');
    await db.execute('DELETE FROM employers');
    
    // Create Employer
    const passwordHash = await bcrypt.hash('password123', 10);
    const [empRes] = await db.execute(
      'INSERT INTO employers (company_name, email, password_hash) VALUES (?, ?, ?)',
      ['Employer 1', 'emp1@test.com', passwordHash]
    );
    employerId = empRes.insertId;
    employerToken = jwt.sign({ id: employerId, role: 'employer', email: 'emp1@test.com' }, process.env.JWT_SECRET);
    
    // Create Candidate
    const [candRes] = await db.execute(
      'INSERT INTO candidates (full_name, email, password_hash) VALUES (?, ?, ?)',
      ['Candidate 1', 'cand1@test.com', passwordHash]
    );
    candidateId = candRes.insertId;
    candidateToken = jwt.sign({ id: candidateId, role: 'candidate', email: 'cand1@test.com' }, process.env.JWT_SECRET);

    // Create Job
    const [jobRes] = await db.execute(
      'INSERT INTO jobs (employer_id, title, description, job_type, is_active) VALUES (?, ?, ?, ?, ?)',
      [employerId, 'Dev Job', 'Cool Job', 'full-time', true]
    );
    jobId = jobRes.insertId;

    // Create Application
    await db.execute(
      'INSERT INTO applications (job_id, candidate_id, resume_path, status) VALUES (?, ?, ?, ?)',
      [jobId, candidateId, 'uploads/mock.pdf', 'applied']
    );
  });

  describe('GET /api/employers/me', () => {
    it('should return employer profile', async () => {
      const res = await request(app)
        .get('/api/employers/me')
        .set('Authorization', `Bearer ${employerToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.company_name).toEqual('Employer 1');
      expect(res.body.email).toEqual('emp1@test.com');
    });
  });

  describe('PUT /api/employers/me', () => {
    it('should update employer profile', async () => {
      const res = await request(app)
        .put('/api/employers/me')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          companyName: 'Updated Employer 1',
          companyDescription: 'We do things'
        });
      
      expect(res.statusCode).toEqual(200);
      
      const getRes = await request(app)
        .get('/api/employers/me')
        .set('Authorization', `Bearer ${employerToken}`);
      expect(getRes.body.company_name).toEqual('Updated Employer 1');
      expect(getRes.body.company_description).toEqual('We do things');
    });
  });

  describe('GET /api/employers/me/jobs', () => {
    it('should return employer jobs', async () => {
      const res = await request(app)
        .get('/api/employers/me/jobs')
        .set('Authorization', `Bearer ${employerToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].title).toEqual('Dev Job');
    });
  });

  describe('GET /api/employers/me/stats', () => {
    it('should return employer stats', async () => {
      const res = await request(app)
        .get('/api/employers/me/stats')
        .set('Authorization', `Bearer ${employerToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('totalJobs');
      expect(res.body).toHaveProperty('totalApplications');
      expect(res.body.totalJobs).toEqual(1);
      expect(res.body.totalApplications).toEqual(1);
    });
  });

  describe('GET /api/employers/me/applications', () => {
    it('should return all employer applications', async () => {
      const res = await request(app)
        .get('/api/employers/me/applications')
        .set('Authorization', `Bearer ${employerToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].job_title).toEqual('Dev Job');
      expect(res.body[0].status).toEqual('applied');
    });
    
    it('should filter applications by status', async () => {
      const res = await request(app)
        .get('/api/employers/me/applications?status=hired')
        .set('Authorization', `Bearer ${employerToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toEqual(0);
    });
  });
});
