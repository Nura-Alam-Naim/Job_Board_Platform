const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Application Endpoints', () => {
  let employerToken;
  let employerId;
  let candidateToken;
  let candidateId;
  let jobId;
  let applicationId;

  beforeAll(async () => {
    await db.execute('DELETE FROM applications');
    await db.execute('DELETE FROM jobs');
    await db.execute('DELETE FROM employers');
    await db.execute('DELETE FROM candidates');
    
    // Create Employer
    const passwordHash = await bcrypt.hash('password123', 10);
    const [empRes] = await db.execute(
      'INSERT INTO employers (company_name, email, password_hash) VALUES (?, ?, ?)',
      ['Job Corp', 'emp2@job.com', passwordHash]
    );
    employerId = empRes.insertId;
    employerToken = jwt.sign({ id: employerId, role: 'employer', email: 'emp2@job.com' }, process.env.JWT_SECRET);
    
    // Create Candidate with resume
    const [candRes] = await db.execute(
      'INSERT INTO candidates (full_name, email, password_hash, resume_path) VALUES (?, ?, ?, ?)',
      ['Candidate 2', 'cand2@job.com', passwordHash, 'uploads/dummy.pdf']
    );
    candidateId = candRes.insertId;
    candidateToken = jwt.sign({ id: candidateId, role: 'candidate', email: 'cand2@job.com' }, process.env.JWT_SECRET);
    
    // Create Job
    const [jobRes] = await db.execute(
      'INSERT INTO jobs (employer_id, title, description, job_type) VALUES (?, ?, ?, ?)',
      [employerId, 'Test Job', 'Test Desc', 'full-time']
    );
    jobId = jobRes.insertId;
  });

  describe('POST /api/jobs/:id/apply', () => {
    it('should allow candidate to apply to an active job', async () => {
      const res = await request(app)
        .post(`/api/jobs/${jobId}/apply`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ coverNote: 'Hire me!' });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toEqual('Applied successfully');
    });

    it('should prevent duplicate applications', async () => {
      const res = await request(app)
        .post(`/api/jobs/${jobId}/apply`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ coverNote: 'Hire me again!' });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Already applied to this job');
    });
  });

  describe('GET /api/candidates/me/applications', () => {
    it('should list candidate applications', async () => {
      const res = await request(app)
        .get('/api/candidates/me/applications')
        .set('Authorization', `Bearer ${candidateToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].job_title).toEqual('Test Job');
      applicationId = res.body[0].id;
    });
  });

  describe('GET /api/jobs/:id/applications', () => {
    it('should allow employer to see applicants', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/applications`)
        .set('Authorization', `Bearer ${employerToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].candidate_name).toEqual('Candidate 2');
    });
  });

  describe('PATCH /api/applications/:id/status', () => {
    it('should allow employer to update application status', async () => {
      const res = await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: 'shortlisted' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Status updated successfully');
      
      // Verify stats
      const statsRes = await request(app)
        .get('/api/employers/me/stats')
        .set('Authorization', `Bearer ${employerToken}`);
      
      expect(statsRes.statusCode).toEqual(200);
      expect(statsRes.body.applicationsByStatus.shortlisted).toEqual(1);
    });
  });
});
