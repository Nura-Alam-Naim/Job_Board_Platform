const db = require('../config/db');

class Job {
  static async create(employerId, title, description, location, jobType, salaryMin, salaryMax) {
    const [result] = await db.execute(
      `INSERT INTO jobs (employer_id, title, description, location, job_type, salary_min, salary_max) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employerId, title, description, location, jobType, salaryMin, salaryMax]
    );
    return result.insertId;
  }

  static async findAll({ search, location, jobType, limit = 10, offset = 0 }) {
    let query = 'SELECT jobs.*, employers.company_name FROM jobs JOIN employers ON jobs.employer_id = employers.id WHERE jobs.is_active = TRUE';
    const params = [];

    if (search) {
      query += ' AND (jobs.title LIKE ? OR jobs.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (location) {
      query += ' AND jobs.location LIKE ?';
      params.push(`%${location}%`);
    }
    if (jobType) {
      query += ' AND jobs.job_type = ?';
      params.push(jobType);
    }

    query += ' ORDER BY jobs.created_at DESC LIMIT ? OFFSET ?';
    // MySQL requires limit and offset to be integers not strings
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.execute(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM jobs WHERE is_active = TRUE';
    const countParams = [];
    if (search) { countQuery += ' AND (title LIKE ? OR description LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }
    if (location) { countQuery += ' AND location LIKE ?'; countParams.push(`%${location}%`); }
    if (jobType) { countQuery += ' AND job_type = ?'; countParams.push(jobType); }
    
    const [countRows] = await db.execute(countQuery, countParams);
    
    return { data: rows, total: countRows[0].total };
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT jobs.*, employers.company_name FROM jobs JOIN employers ON jobs.employer_id = employers.id WHERE jobs.id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByEmployerId(employerId) {
    const [rows] = await db.execute('SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC', [employerId]);
    return rows;
  }

  static async findWithStatsByEmployerId(employerId) {
    const query = `
      SELECT j.*, 
        COUNT(a.id) as applicants_count,
        SUM(CASE WHEN a.status = 'hired' THEN 1 ELSE 0 END) as accepted_count,
        DATEDIFF(NOW(), j.created_at) as days_open
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.employer_id = ?
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `;
    const [rows] = await db.execute(query, [employerId]);
    return rows;
  }

  static async update(id, employerId, { title, description, location, jobType, salaryMin, salaryMax }) {
    const [result] = await db.execute(
      `UPDATE jobs SET title=?, description=?, location=?, job_type=?, salary_min=?, salary_max=? 
       WHERE id=? AND employer_id=?`,
      [title, description, location, jobType, salaryMin, salaryMax, id, employerId]
    );
    return result.affectedRows > 0;
  }

  static async deactivate(id, employerId) {
    const [result] = await db.execute('UPDATE jobs SET is_active=FALSE WHERE id=? AND employer_id=?', [id, employerId]);
    return result.affectedRows > 0;
  }
}

module.exports = Job;
