const db = require('../config/db');

class Candidate {
  static async create(fullName, email, passwordHash) {
    const [result] = await db.execute(
      'INSERT INTO candidates (full_name, email, password_hash) VALUES (?, ?, ?)',
      [fullName, email, passwordHash]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM candidates WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT id, full_name, email, resume_path, created_at FROM candidates WHERE id = ?', [id]);
    return rows[0];
  }

  static async updateResume(id, resumePath) {
    await db.execute('UPDATE candidates SET resume_path = ? WHERE id = ?', [resumePath, id]);
  }
}

module.exports = Candidate;
