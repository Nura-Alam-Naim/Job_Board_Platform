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
      `INSERT IGNORE INTO employers (company_name, email, password_hash, company_description, is_verified) VALUES 
      ('TechNova Solutions', 'hr@technova.com', ?, 'Leading software solutions provider with a focus on AI.', true),
      ('Global Industries', 'recruiting@global.com', ?, 'Multinational conglomerate focused on innovation and sustainability.', true),
      ('Creative Web Agency', 'jobs@creativeweb.com', ?, 'Award-winning digital agency creating beautiful web experiences.', true),
      ('Unverified Startup', 'unverified@startup.com', ?, 'We are in stealth mode.', false)`,
      [passwordHash, passwordHash, passwordHash, passwordHash]
    );
    console.log('Employers seeded.');

    // 2. Seed Candidates
    const [candRes] = await connection.execute(
      `INSERT IGNORE INTO candidates (full_name, email, password_hash, resume_path, is_verified) VALUES 
      ('Alice Smith', 'alice@example.com', ?, 'uploads/dummy.pdf', true),
      ('Bob Johnson', 'bob@example.com', ?, 'uploads/dummy.pdf', true),
      ('Charlie Brown', 'charlie@example.com', ?, NULL, true),
      ('Diana Prince', 'diana@example.com', ?, 'uploads/dummy.pdf', true),
      ('Evan Wright', 'evan@example.com', ?, 'uploads/dummy.pdf', true),
      ('Unverified Candidate', 'unverified@candidate.com', ?, NULL, false)`,
      [passwordHash, passwordHash, passwordHash, passwordHash, passwordHash, passwordHash]
    );
    console.log('Candidates seeded.');

    // Get IDs to create relationships
    const [employers] = await connection.execute('SELECT id, email FROM employers');
    const [candidates] = await connection.execute('SELECT id, email FROM candidates');
    
    if (employers.length > 0 && candidates.length > 0) {
      const techNovaId = employers.find(e => e.email === 'hr@technova.com').id;
      const globalId = employers.find(e => e.email === 'recruiting@global.com').id;
      const creativeId = employers.find(e => e.email === 'jobs@creativeweb.com').id;

      // 3. Seed Jobs (Rich dataset for filtering and pagination)
      await connection.execute('DELETE FROM jobs'); 
      await connection.execute(
        `INSERT INTO jobs (employer_id, title, description, location, job_type, salary_min, salary_max) VALUES 
        (?, 'Senior Full-Stack Developer', 'We are looking for an experienced developer to join our core team. Must know React and Node.js.', 'New York, NY', 'full-time', 120000, 150000),
        (?, 'Frontend Engineer', 'Build beautiful user interfaces using React and Tailwind CSS.', 'Remote', 'full-time', 90000, 110000),
        (?, 'Backend Systems Architect', 'Design scalable microservices using Node and Go.', 'San Francisco, CA', 'full-time', 150000, 190000),
        (?, 'Data Analyst', 'Join our analytics team to process big data and create insightful reports.', 'Remote', 'remote', 80000, 110000),
        (?, 'Machine Learning Engineer', 'Help us build predictive models for our logistics platform.', 'Austin, TX', 'full-time', 130000, 160000),
        (?, 'UI/UX Designer', 'Looking for a creative mind to revamp our product interfaces.', 'San Francisco, CA', 'contract', 90000, 130000),
        (?, 'Graphic Designer', 'Create stunning visual assets for our marketing campaigns.', 'London, UK', 'part-time', 40000, 60000),
        (?, 'Frontend Intern', 'Great opportunity for students to learn React and modern frontend workflows.', 'Austin, TX', 'internship', 40000, 50000),
        (?, 'DevOps Engineer', 'Maintain our cloud infrastructure on AWS.', 'Remote', 'full-time', 110000, 140000),
        (?, 'Product Manager', 'Lead our cross-functional teams to deliver amazing features.', 'New York, NY', 'full-time', 130000, 170000)`,
        [techNovaId, techNovaId, techNovaId, globalId, globalId, creativeId, creativeId, techNovaId, globalId, creativeId]
      );
      console.log('Jobs seeded.');

      // 4. Seed Applications (Diverse statuses for employer stats dashboard)
      const [jobs] = await connection.execute('SELECT id, title FROM jobs');
      const aliceId = candidates.find(c => c.email === 'alice@example.com').id;
      const bobId = candidates.find(c => c.email === 'bob@example.com').id;
      const dianaId = candidates.find(c => c.email === 'diana@example.com').id;
      const evanId = candidates.find(c => c.email === 'evan@example.com').id;

      await connection.execute('DELETE FROM applications'); 
      
      const findJob = (keyword) => jobs.find(j => j.title.includes(keyword))?.id;

      // Ensure we have jobs before applying
      if (jobs.length > 0) {
        await connection.execute(
          `INSERT INTO applications (job_id, candidate_id, resume_path, cover_note, status) VALUES 
          (?, ?, 'uploads/dummy.pdf', 'I have 5 years of React experience. Would love to join!', 'shortlisted'),
          (?, ?, 'uploads/dummy.pdf', 'I am passionate about UI/UX design and love your agency.', 'applied'),
          (?, ?, 'uploads/dummy.pdf', 'My data analysis skills are perfect for this role.', 'reviewed'),
          (?, ?, 'uploads/dummy.pdf', 'I can build great microservices.', 'rejected'),
          (?, ?, 'uploads/dummy.pdf', 'Frontend is my jam.', 'applied'),
          (?, ?, 'uploads/dummy.pdf', 'I want to manage this product.', 'shortlisted'),
          (?, ?, 'uploads/dummy.pdf', 'I have strong AWS experience.', 'reviewed'),
          (?, ?, 'uploads/dummy.pdf', 'I can help with ML models.', 'applied')`,
          [
            findJob('Full-Stack'), aliceId, 
            findJob('UI/UX'), bobId, 
            findJob('Data'), dianaId, 
            findJob('Architect'), evanId,
            findJob('Frontend Engineer'), aliceId,
            findJob('Product'), bobId,
            findJob('DevOps'), dianaId,
            findJob('Machine'), evanId
          ]
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
