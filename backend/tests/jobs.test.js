const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Job Endpoints', () => {
  let employerToken;
  let employerId;
  let candidateToken;
  
  beforeAll(async () => {
    await db.execute('DELETE FROM jobs');
    await db.execute('DELETE FROM employers');
    await db.execute('DELETE FROM candidates');
    
    // Create Employer
    const passwordHash = await bcrypt.hash('password123', 10);
    const [empRes] = await db.execute(
      'INSERT INTO employers (company_name, email, password_hash) VALUES (?, ?, ?)',
      ['Job Corp', 'emp@job.com', passwordHash]
    );
    employerId = empRes.insertId;
    employerToken = jwt.sign({ id: employerId, role: 'employer', email: 'emp@job.com' }, process.env.JWT_SECRET);
    
    // Create Candidate
    const [candRes] = await db.execute(
      'INSERT INTO candidates (full_name, email, password_hash) VALUES (?, ?, ?)',
      ['Candidate 1', 'cand1@job.com', passwordHash]
    );
    candidateToken = jwt.sign({ id: candRes.insertId, role: 'candidate', email: 'cand1@job.com' }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await db.execute('DELETE FROM jobs');
    await db.execute('DELETE FROM employers');
    await db.execute('DELETE FROM candidates');
  });

  let createdJobId;

  describe('POST /api/jobs', () => {
    it('should allow employer to create a job', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: 'Software Engineer',
          description: 'Great role.',
          location: 'Remote',
          jobType: 'full-time',
          salaryMin: 50000,
          salaryMax: 100000
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('jobId');
      createdJobId = res.body.jobId;
    });

    it('should forbid candidate from creating a job', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          title: 'Hacker',
          description: 'Hacking role.',
          location: 'Remote',
          jobType: 'full-time'
        });
      
      expect(res.statusCode).toEqual(403);
    });

    it('should validate salary ranges', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: 'Software Engineer',
          description: 'Great role.',
          location: 'Remote',
          jobType: 'full-time',
          salaryMin: 100000,
          salaryMax: 50000
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('greater than maximum');
    });
  });

  describe('GET /api/jobs', () => {
    it('should get all active jobs without auth', async () => {
      const res = await request(app).get('/api/jobs');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].title).toEqual('Software Engineer');
    });

    it('should filter jobs by search term', async () => {
      const res = await request(app).get('/api/jobs?search=Software');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('should get job by id', async () => {
      const res = await request(app).get(`/api/jobs/${createdJobId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual('Software Engineer');
    });
  });

  describe('PUT /api/jobs/:id', () => {
    it('should allow employer to update their job', async () => {
      const res = await request(app)
        .put(`/api/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: 'Senior Software Engineer',
          description: 'Even greater role.',
          location: 'Remote',
          jobType: 'full-time',
          salaryMin: 120000,
          salaryMax: 150000
        });
      
      expect(res.statusCode).toEqual(200);
    });
  });
  
  describe('DELETE /api/jobs/:id', () => {
    it('should soft delete a job', async () => {
      const res = await request(app)
        .delete(`/api/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${employerToken}`);
      
      expect(res.statusCode).toEqual(200);
      
      // Verify it no longer appears in public list
      const getRes = await request(app).get('/api/jobs');
      expect(getRes.body.data.length).toEqual(0);
    });
  });
});
