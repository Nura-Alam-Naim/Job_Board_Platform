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
});
