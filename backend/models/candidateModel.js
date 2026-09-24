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
    const [rows] = await db.execute('SELECT id, full_name, email, resume_path, first_name, last_name, age, profession, cgpa, institute, created_at FROM candidates WHERE id = ?', [id]);
    return rows[0];
  }

  static async updateResume(id, resumePath) {
    await db.execute('UPDATE candidates SET resume_path = ? WHERE id = ?', [resumePath, id]);
  }

  static async updateProfile(id, profileData) {
    const { first_name, last_name, age, profession, cgpa, institute } = profileData;
    const full_name = `${first_name} ${last_name}`.trim();
    await db.execute(
      'UPDATE candidates SET full_name = ?, first_name = ?, last_name = ?, age = ?, profession = ?, cgpa = ?, institute = ? WHERE id = ?', 
      [full_name, first_name, last_name, age || null, profession || null, cgpa || null, institute || null, id]
    );
  }
}

module.exports = Candidate;
