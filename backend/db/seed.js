const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function seedDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'job_board_db',
  });

  try {
    console.log('Seeding database with dummy data...');
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Seed Employers
    const [empRes] = await connection.execute(
      `INSERT IGNORE INTO employers (company_name, email, password_hash, company_description) VALUES 
      ('TechNova Solutions', 'hr@technova.com', ?, 'Leading software solutions provider.'),
      ('Global Industries', 'recruiting@global.com', ?, 'Multinational conglomerate focused on innovation.'),
      ('Creative Web Agency', 'jobs@creativeweb.com', ?, 'Award-winning digital agency.')`,
      [passwordHash, passwordHash, passwordHash]
    );
    console.log('Employers seeded.');

    // 2. Seed Candidates
    const [candRes] = await connection.execute(
      `INSERT IGNORE INTO candidates (full_name, email, password_hash) VALUES 
      ('Alice Smith', 'alice@example.com', ?),
      ('Bob Johnson', 'bob@example.com', ?),
      ('Charlie Brown', 'charlie@example.com', ?)`,
      [passwordHash, passwordHash, passwordHash]
    );
    console.log('Candidates seeded.');

    // Get IDs to create relationships
    const [employers] = await connection.execute('SELECT id, email FROM employers');
    const [candidates] = await connection.execute('SELECT id, email FROM candidates');
    
    if (employers.length > 0 && candidates.length > 0) {
      const techNovaId = employers.find(e => e.email === 'hr@technova.com').id;
      const globalId = employers.find(e => e.email === 'recruiting@global.com').id;
      const creativeId = employers.find(e => e.email === 'jobs@creativeweb.com').id;

      // 3. Seed Jobs
      await connection.execute('DELETE FROM jobs'); // Clear old jobs to prevent duplicates on re-run
      await connection.execute(
        `INSERT INTO jobs (employer_id, title, description, location, job_type, salary_min, salary_max) VALUES 
        (?, 'Senior Full-Stack Developer', 'We are looking for an experienced developer to join our core team. Must know React and Node.js.', 'New York, NY', 'full-time', 120000, 150000),
        (?, 'Data Analyst', 'Join our analytics team to process big data and create insightful reports.', 'Remote', 'remote', 80000, 110000),
        (?, 'UI/UX Designer', 'Looking for a creative mind to revamp our product interfaces.', 'San Francisco, CA', 'contract', 90000, 130000),
        (?, 'Frontend Intern', 'Great opportunity for students to learn React and modern frontend workflows.', 'Austin, TX', 'internship', 40000, 50000)`,
        [techNovaId, globalId, creativeId, techNovaId]
      );
      console.log('Jobs seeded.');

      // 4. Seed Applications
      const [jobs] = await connection.execute('SELECT id, title FROM jobs');
      const aliceId = candidates.find(c => c.email === 'alice@example.com').id;
      const bobId = candidates.find(c => c.email === 'bob@example.com').id;

      await connection.execute('DELETE FROM applications'); // Clear applications
      
      const fullStackJob = jobs.find(j => j.title.includes('Full-Stack'));
      const designerJob = jobs.find(j => j.title.includes('Designer'));

      if (fullStackJob && designerJob) {
        await connection.execute(
          `INSERT INTO applications (job_id, candidate_id, resume_path, cover_note, status) VALUES 
          (?, ?, 'uploads/dummy1.pdf', 'I have 5 years of React experience. Would love to join!', 'reviewed'),
          (?, ?, 'uploads/dummy2.pdf', 'I am passionate about UI/UX design and love your agency.', 'applied')`,
          [fullStackJob.id, aliceId, designerJob.id, bobId]
        );
        console.log('Applications seeded.');
      }
    }

    console.log('Database seeding completed successfully! All users have the password: password123');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    await connection.end();
  }
}

seedDatabase();
