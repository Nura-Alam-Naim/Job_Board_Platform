const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

let pool;

beforeAll(async () => {
  // Create a connection without database selected
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  // Drop and recreate test database
  await connection.query('DROP DATABASE IF EXISTS job_board_test_db');
  await connection.query('CREATE DATABASE job_board_test_db');
  await connection.query('USE job_board_test_db');

  // Execute schema
  const schemaPath = path.join(__dirname, '../db/schema.sql');
  let schema = fs.readFileSync(schemaPath, 'utf8');
  schema = schema.replace(/CREATE DATABASE IF NOT EXISTS job_board_db;/g, '');
  schema = schema.replace(/USE job_board_db;/g, '');
  await connection.query(schema);
  
  await connection.end();

  // Initialize pool for tests
  pool = require('../config/db');
});

afterAll(async () => {
  if (pool) {
    await pool.end();
  }
});
