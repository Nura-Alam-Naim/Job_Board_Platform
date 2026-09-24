# CodeAlpha Job Board Platform - Backend

Welcome to the backend repository of the **CodeAlpha Job Board Platform**, a full-stack, enterprise-grade job board portal built with Node.js and Express.

This architecture empowers Employers to aggressively recruit the best talent while equipping Candidates with a modern, dynamic UI to apply for jobs and track their hiring pipeline.

## 🚀 Key Capabilities & Features

### 1. Robust Authentication Engine
- **Role-Based Access Control (RBAC):** Distinct authentication streams for `employer` and `candidate` roles.
- **JWT Security:** Stateless, secure JSON Web Token generation (`jwt.sign`) handling protected API endpoints across the platform.
- **Password Hashing:** Fully integrated `bcrypt` encryption preventing plaintext password vulnerability.

### 2. Employer-Driven Recruiting
- **Job Lifecycle Management:** Full CRUD operations on job postings (Create, Read, Update, Close/History).
- **Automated Deadlines:** Intelligent deadline enforcement preventing expired jobs from receiving applications and cleaning up the active jobs feed.
- **Advanced Application Filtering:** Dynamic aggregated view displaying *all* applicants across the employer's entire pipeline, with quick filters to view exclusively `hired` candidates.
- **Real-Time Analytics:** Aggregated statistics endpoint calculating overall pipeline volume, acceptance rates, and job posting counts via optimized SQL queries.

### 3. Candidate Experience
- **File Upload & Resume Storage:** Integrated `multer` storage for fast, efficient PDF CV processing directly into the server's filesystem.
- **Streamlined Application Protocol:** Intelligent constraints block duplicate applications and enforce pre-application CV uploads.
- **Email Notifications:** Asynchronous background email delivery (`nodemailer`) triggering instant congratulatory emails to Candidates upon being hired, and automated CV forwarding directly to the Employer's inbox upon job application.

---

## 📡 Core API Endpoints

The backend exposes a structured RESTful API. All protected routes require a valid `Bearer <Token>` in the `Authorization` header.

### Authentication (`/api/auth`)
- `POST /register/employer` - Register a new employer account
- `POST /register/candidate` - Register a new candidate account
- `POST /login` - Authenticate and receive a JWT

### Jobs (`/api/jobs`)
- `GET /` - Fetch all active jobs (supports `?search`, `?location`, `?jobType` filters)
- `GET /:id` - Get specific job details
- `POST /` - Create a new job posting *(Employer only)*
- `PUT /:id` - Update an existing job *(Employer only)*
- `DELETE /:id` - Close/deactivate a job *(Employer only)*
- `GET /:id/applications` - Get all applicants for a specific job *(Employer only)*
- `POST /:id/apply` - Apply to a job with a cover note *(Candidate only)*

### Employers (`/api/employers`)
- `GET /me` - Get employer profile
- `PUT /me` - Update employer profile
- `GET /me/jobs` - Get all jobs posted by the employer (includes history)
- `GET /me/stats` - Fetch real-time dashboard analytics
- `GET /me/applications` - Get a global feed of all applicants across all jobs (supports `?status` filter)

### Candidates (`/api/candidates`)
- `GET /me` - Get logged-in candidate's profile
- `PUT /me` - Update profile fields (CGPA, institute, profession, etc.)
- `GET /me/applications` - Get candidate's application history
- `POST /resume` - Upload a PDF CV (`multipart/form-data`)
- `DELETE /resume` - Remove the uploaded CV
- `GET /:id` - View a candidate's public profile *(Employer only)*

### Applications (`/api/applications`)
- `PATCH /:id/status` - Update an application's status (triggers email) *(Employer only)*

---

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **ORM / Querying:** `mysql2/promise` (Raw optimized SQL execution)
- **File Handling:** Multer
- **Email Delivery:** Nodemailer
- **Authentication:** jsonwebtoken, bcrypt

## 🗄️ Database Schema

The database `job_board_db` relies on a fully relational structure designed for data integrity:

*   **`employers`**: Secures company credentials and identity.
*   **`candidates`**: Stores candidate profiles including metrics like CGPA, institute, and their `resume_path`.
*   **`jobs`**: Job postings bound to an `employer_id`. Includes deep configuration such as dynamic `is_active` states, salary ranges, and strict `deadline` enforcements.
*   **`applications`**: The junction table connecting `candidates` and `jobs`. Tracks the real-time `status` (e.g., `applied`, `shortlisted`, `hired`) and prevents duplicates with unique compound keys.

## ⚙️ Environment Configuration

Ensure you have a `.env` file at the root of the `backend/` directory configured with the following:

```env
# Server Configuration
PORT=5000

# Database Credentials
DB_HOST=localhost
DB_USER=root
DB_PASS=your_db_password
DB_NAME=job_board_db

# Security
JWT_SECRET=your_super_secret_jwt_key

# Email Service (Required for Hired Notifications)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=replace_with_valid_user
SMTP_PASS=replace_with_valid_pass
```

## 🔌 Running the Server

To launch the backend server locally in development mode, run:

```bash
cd backend
npm install
npm run dev
```

The server will initialize and begin listening on `http://localhost:5000`.

---
