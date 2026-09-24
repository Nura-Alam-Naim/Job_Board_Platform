const db = require('../config/db');

class Employer {
  static async create(companyName, email, passwordHash) {
    const [result] = await db.execute(
      'INSERT INTO employers (company_name, email, password_hash) VALUES (?, ?, ?)',
      [companyName, email, passwordHash]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM employers WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT id, company_name, email, company_description, created_at FROM employers WHERE id = ?', [id]);
    return rows[0];
  }

  static async updateProfile(id, companyName, companyDescription) {
    await db.execute('UPDATE employers SET company_name = ?, company_description = ? WHERE id = ?', [companyName, companyDescription, id]);
  }
}

module.exports = Employer;
