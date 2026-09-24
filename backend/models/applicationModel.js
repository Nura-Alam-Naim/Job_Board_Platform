const db = require('../config/db');

class Application {
  static async create(jobId, candidateId, resumePath, coverNote) {
    try {
      const [result] = await db.execute(
        'INSERT INTO applications (job_id, candidate_id, resume_path, cover_note) VALUES (?, ?, ?, ?)',
        [jobId, candidateId, resumePath, coverNote]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Already applied to this job');
      }
      throw error;
    }
  }

  static async findByCandidateId(candidateId) {
    const [rows] = await db.execute(
      `SELECT a.*, j.title as job_title, e.company_name 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       JOIN employers e ON j.employer_id = e.id 
       WHERE a.candidate_id = ? 
       ORDER BY a.applied_at DESC`,
      [candidateId]
    );
    return rows;
  }

  static async findByJobIdAndEmployerId(jobId, employerId) {
    const [rows] = await db.execute(
      `SELECT a.*, c.full_name as candidate_name, c.email as candidate_email
       FROM applications a
       JOIN candidates c ON a.candidate_id = c.id
       JOIN jobs j ON a.job_id = j.id
       WHERE a.job_id = ? AND j.employer_id = ?
       ORDER BY a.applied_at DESC`,
      [jobId, employerId]
    );
    return rows;
  }

  static async findByEmployerId(employerId, status = null) {
    let query = `
       SELECT a.*, c.full_name as candidate_name, c.email as candidate_email, j.title as job_title
       FROM applications a
       JOIN candidates c ON a.candidate_id = c.id
       JOIN jobs j ON a.job_id = j.id
       WHERE j.employer_id = ?
    `;
    const params = [employerId];
    
    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY a.applied_at DESC`;
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async updateStatus(applicationId, employerId, status) {
    // First, verify the employer owns the job this application is for
    const [appCheck] = await db.execute(
      `SELECT a.id, c.email as candidate_email, j.title as job_title
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN candidates c ON a.candidate_id = c.id
       WHERE a.id = ? AND j.employer_id = ?`,
      [applicationId, employerId]
    );

    if (appCheck.length === 0) {
      return null; // Application not found or not owned by employer
    }

    await db.execute('UPDATE applications SET status = ? WHERE id = ?', [status, applicationId]);
    
    return appCheck[0]; // Return info needed for email notification
  }

  static async getEmployerStats(employerId) {
    const [jobRows] = await db.execute('SELECT COUNT(*) as total_jobs FROM jobs WHERE employer_id = ?', [employerId]);
    const [appRows] = await db.execute(
      `SELECT a.status, COUNT(*) as count 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE j.employer_id = ? 
       GROUP BY a.status`,
      [employerId]
    );

    const totalJobs = jobRows[0].total_jobs;
    let totalApplications = 0;
    const applicationsByStatus = {};
    
    // Initialize standard statuses
    ['applied', 'reviewed', 'shortlisted', 'rejected', 'hired'].forEach(s => applicationsByStatus[s] = 0);

    appRows.forEach(row => {
      applicationsByStatus[row.status] = row.count;
      totalApplications += row.count;
    });

    return { totalJobs, totalApplications, applicationsByStatus };
  }
}

module.exports = Application;
