CREATE DATABASE IF NOT EXISTS job_board_db;
USE job_board_db;

CREATE TABLE IF NOT EXISTS employers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company_description TEXT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  resume_path VARCHAR(255) NULL,
  first_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,
  age INT NULL,
  profession VARCHAR(150) NULL,
  cgpa DECIMAL(4,2) NULL,
  institute VARCHAR(255) NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employer_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(100),
  job_type ENUM('full-time', 'part-time', 'contract', 'internship', 'remote') NOT NULL,
  salary_min INT NULL,
  salary_max INT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  deadline DATE NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  candidate_id INT NOT NULL,
  resume_path VARCHAR(255) NOT NULL,
  cover_note TEXT NULL,
  status ENUM('applied', 'reviewed', 'shortlisted', 'rejected', 'hired', 'interviewed') DEFAULT 'applied',
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  UNIQUE KEY unique_job_candidate (job_id, candidate_id)
);
