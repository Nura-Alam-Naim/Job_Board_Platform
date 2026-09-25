const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Candidate Endpoints', () => {
  let candidateToken;
  let candidateId;

  beforeAll(async () => {
    await db.execute('DELETE FROM candidates');
    
    const passwordHash = await bcrypt.hash('password123', 10);
    const [candRes] = await db.execute(
      'INSERT INTO candidates (full_name, email, password_hash) VALUES (?, ?, ?)',
      ['Candidate 3', 'cand3@job.com', passwordHash]
    );
    candidateId = candRes.insertId;
    candidateToken = jwt.sign({ id: candidateId, role: 'candidate', email: 'cand3@job.com' }, process.env.JWT_SECRET);
  });

  describe('GET /api/candidates/me', () => {
    it('should return candidate profile', async () => {
      const res = await request(app)
        .get('/api/candidates/me')
        .set('Authorization', `Bearer ${candidateToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.full_name).toEqual('Candidate 3');
      expect(res.body.resume_path).toBeNull();
    });
  });
  describe('PUT /api/candidates/me', () => {
    it('should update candidate profile', async () => {
      const res = await request(app)
        .put('/api/candidates/me')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          first_name: 'John',
          last_name: 'Doe',
          age: 30,
          profession: 'Engineer'
        });
      
      expect(res.statusCode).toEqual(200);
      
      const getRes = await request(app)
        .get('/api/candidates/me')
        .set('Authorization', `Bearer ${candidateToken}`);
      expect(getRes.body.full_name).toEqual('John Doe');
      expect(getRes.body.age).toEqual(30);
      expect(getRes.body.profession).toEqual('Engineer');
    });
  });

  describe('GET /api/candidates/:id', () => {
    it('should return public candidate profile', async () => {
      // Need an employer token to test this, let's just test with a mock token or bypass if it just checks auth.
      // Wait, the endpoint uses authenticate middleware, so any valid token works.
      const res = await request(app)
        .get(`/api/candidates/${candidateId}`)
        .set('Authorization', `Bearer ${candidateToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.full_name).toEqual('John Doe');
      expect(res.body.password_hash).toBeUndefined(); // sensitive data should not be returned
    });
  });

  describe('POST /api/candidates/resume', () => {
    it('should upload candidate resume', async () => {
      // Create a dummy file
      const fs = require('fs');
      fs.writeFileSync('dummy.pdf', 'dummy content');

      const res = await request(app)
        .post('/api/candidates/resume')
        .set('Authorization', `Bearer ${candidateToken}`)
        .attach('resume', 'dummy.pdf');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Resume uploaded successfully');
      
      // Cleanup
      if (fs.existsSync('dummy.pdf')) fs.unlinkSync('dummy.pdf');
    });
  });

  describe('DELETE /api/candidates/resume', () => {
    it('should remove candidate resume', async () => {
      const res = await request(app)
        .delete('/api/candidates/resume')
        .set('Authorization', `Bearer ${candidateToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Resume removed successfully');
    });
  });
});
