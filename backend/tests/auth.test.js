const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('Auth Endpoints', () => {
  afterAll(async () => {
    // Cleanup users
    await db.execute('DELETE FROM candidates');
    await db.execute('DELETE FROM employers');
  });

  describe('POST /api/auth/register/employer', () => {
    it('should register a new employer', async () => {
      const res = await request(app)
        .post('/api/auth/register/employer')
        .send({
          companyName: 'Test Corp',
          email: 'test@corp.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toContain('Registration successful');
      expect(res.body).toHaveProperty('token');
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register/employer')
        .send({
          companyName: 'Test Corp',
          email: 'not-an-email',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toEqual('Valid email is required');
    });
    
    it('should not allow duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register/employer')
        .send({
          companyName: 'Another Corp',
          email: 'test@corp.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Email already in use');
    });
  });

  describe('POST /api/auth/register/candidate', () => {
    it('should register a new candidate', async () => {
      const res = await request(app)
        .post('/api/auth/register/candidate')
        .send({
          fullName: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toContain('Registration successful');
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an employer with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@corp.com',
          password: 'password123',
          role: 'employer'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@corp.com',
          password: 'wrongpassword',
          role: 'employer'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Invalid credentials');
    });

    it('should reject login with wrong role', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@corp.com',
          password: 'password123',
          role: 'candidate'
        });
      
      expect(res.statusCode).toEqual(401);
    });
  });
});
