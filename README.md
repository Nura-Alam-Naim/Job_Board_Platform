# 💼 Job Board Platform

> A full-stack Job Board web application. The platform connects employers and candidates through a streamlined hiring workflow — employers can post jobs and manage applications, while candidates can search listings, upload resumes, and track their application status in real time.

---

## Overview

The **Job Board Platform** is a role-based application with two distinct user types:

- **Employers** — Register their company, post job openings, review incoming applications, update application statuses (reviewed → shortlisted → hired/rejected), and receive dashboard analytics.
- **Candidates** — Create a profile, upload a PDF resume, browse and search job listings with filters, apply to positions with a cover note, and track application progress.

Key capabilities include:

- 🔐 JWT-based authentication with role-based access control
- 📄 PDF resume upload & management (Multer)
- 🔍 Job search with filters (keyword, location, job type) and pagination
- 📊 Employer dashboard with hiring statistics
- 📧 Email notifications on application status changes (Nodemailer)
- ✅ Request validation with express-validator
- 🧪 Backend test suite with Jest & Supertest

---

## Tech Stack

| Layer          | Technology                                                  |
| -------------- | ----------------------------------------------------------- |
| **Runtime**    | Node.js                                                     |
| **Framework**  | Express.js v5                                               |
| **Database**   | MySQL (via `mysql2` connection pool)                         |
| **Auth**       | JSON Web Tokens (`jsonwebtoken`) + `bcrypt`                 |
| **Validation** | `express-validator`                                         |
| **File Upload**| `multer` (PDF only, 5 MB limit)                             |
| **Email**      | `nodemailer` (Ethereal for dev, configurable SMTP)          |
| **Testing**    | `jest` + `supertest` + `cross-env`                          |
| **Frontend**   | React 19 + Vite + React Router v7 + Axios + Lucide Icons    |
| **Dev Tools**  | `concurrently` (parallel dev servers), `nodemon`            |

---

## Architecture

```
Client (React SPA)
    │
    ▼
Express REST API ── Middleware Pipeline ──► Route Handlers ──► Controllers ──► Models
    │                  │                                                        │
    │            ┌─────┴──────┐                                                 │
    │       Auth (JWT)    Validation                                            │
    │       Upload (Multer)  Error Handler                                      │
    │                                                                           │
    ▼                                                                           ▼
Static File Server (/uploads)                                          MySQL Database
                                                                     (Connection Pool)
```

---

## Database Schema

The application uses **4 tables** with foreign-key relationships:

```
┌──────────────┐       ┌──────────────┐
│  employers   │       │  candidates  │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ company_name │       │ full_name    │
│ email (UQ)   │       │ email (UQ)   │
│ password_hash│       │ password_hash│
│ company_desc │       │ resume_path  │
│ created_at   │       │ first_name   │
└──────┬───────┘       │ last_name    │
       │               │ age          │
       │               │ profession   │
       │               │ cgpa         │
       │               │ institute    │
       │               │ created_at   │
       │               └──────┬───────┘
       │                      │
       ▼                      ▼
┌──────────────┐    ┌────────────────────┐
│    jobs      │    │   applications     │
├──────────────┤    ├────────────────────┤
│ id (PK)      │◄───│ job_id (FK)        │
│ employer_id  │    │ candidate_id (FK)  │──►candidates
│ title        │    │ resume_path        │
│ description  │    │ cover_note         │
│ location     │    │ status (ENUM)      │
│ job_type     │    │ applied_at         │
│ salary_min   │    │ UQ(job, candidate) │
│ salary_max   │    └────────────────────┘
│ is_active    │
│ deadline     │    Status: applied → reviewed →
│ created_at   │    shortlisted → hired / rejected
└──────────────┘
```

---

## API Endpoints

Base URL: `http://localhost:5000/api`

### 🔑 Authentication (`/api/auth`)

| Method | Endpoint               | Access | Description                       |
| ------ | ---------------------- | ------ | --------------------------------- |
| POST   | `/auth/register/employer`  | Public | Register a new employer account   |
| POST   | `/auth/register/candidate` | Public | Register a new candidate account  |
| POST   | `/auth/login`              | Public | Login (returns JWT token)         |

### 📌 Jobs (`/api/jobs`)

| Method | Endpoint                  | Access    | Description                          |
| ------ | ------------------------- | --------- | ------------------------------------ |
| GET    | `/jobs`                   | Public    | List all active jobs (with filters)  |
| GET    | `/jobs/:id`               | Public    | Get a single job by ID               |
| POST   | `/jobs`                   | Employer  | Create a new job posting             |
| PUT    | `/jobs/:id`               | Employer  | Update an existing job posting       |
| DELETE | `/jobs/:id`               | Employer  | Deactivate a job posting             |
| GET    | `/jobs/:id/applications`  | Employer  | View applications for a specific job |
| POST   | `/jobs/:id/apply`         | Candidate | Apply to a job                       |

**Query Parameters for `GET /jobs`:**

| Param    | Type   | Description                                             |
| -------- | ------ | ------------------------------------------------------- |
| `search` | string | Search by job title or description                      |
| `location` | string | Filter by location                                    |
| `jobType`  | string | Filter by type (`full-time`, `part-time`, `contract`, `internship`, `remote`) |
| `limit`    | int    | Results per page (default: 10)                         |
| `offset`   | int    | Pagination offset                                      |

### 👤 Candidates (`/api/candidates`)

| Method | Endpoint                    | Access    | Description                     |
| ------ | --------------------------- | --------- | ------------------------------- |
| GET    | `/candidates/me`            | Candidate | Get own profile                 |
| PUT    | `/candidates/me`            | Candidate | Update own profile              |
| GET    | `/candidates/me/applications` | Candidate | List own applications         |
| POST   | `/candidates/resume`        | Candidate | Upload resume (PDF, max 5 MB)   |
| DELETE | `/candidates/resume`        | Candidate | Remove uploaded resume          |
| GET    | `/candidates/:id`           | Auth'd    | View a candidate's public info  |

### 🏢 Employers (`/api/employers`)

| Method | Endpoint                     | Access   | Description                          |
| ------ | ---------------------------- | -------- | ------------------------------------ |
| GET    | `/employers/me`              | Employer | Get own company profile              |
| PUT    | `/employers/me`              | Employer | Update company profile               |
| GET    | `/employers/me/jobs`         | Employer | List all jobs posted by employer      |
| GET    | `/employers/me/stats`        | Employer | Get dashboard statistics             |
| GET    | `/employers/me/applications` | Employer | List all applications across jobs    |

### 📝 Applications (`/api/applications`)

| Method | Endpoint                     | Access   | Description                          |
| ------ | ---------------------------- | -------- | ------------------------------------ |
| PATCH  | `/applications/:id/status`   | Employer | Update application status            |

**Valid status values:** `applied` · `reviewed` · `shortlisted` · `rejected` · `hired`

---

## Authentication

The API uses **Bearer Token** authentication via JWT.

1. Register or login to receive a token.
2. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

The token payload contains: `{ id, role, email }`.

Role-based access is enforced via the `authorize()` middleware — endpoints are restricted to either `employer` or `candidate` roles as noted in the tables above.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MySQL** ≥ 8.0
- **npm** ≥ 9

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Nura-Alam-Naim/Job_Board_Platform.git
cd Job_Board_Platform

# 2. Install all dependencies (root, backend, frontend)
npm run install:all

# 3. Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your MySQL credentials and a strong JWT secret

# 4. Initialize the database
npm run init-db

# 5. (Optional) Seed sample data
npm run seed-db

# 6. Start both servers
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.

---

## Environment Variables

Create a `backend/.env` file based on `backend/.env.example`:

| Variable        | Description                        | Default                |
| --------------- | ---------------------------------- | ---------------------- |
| `PORT`          | Backend server port                | `5000`                 |
| `DB_HOST`       | MySQL host                         | `localhost`            |
| `DB_USER`       | MySQL username                     | `root`                 |
| `DB_PASSWORD`   | MySQL password                     | —                      |
| `DB_NAME`       | Database name                      | `job_board_db`         |
| `JWT_SECRET`    | Secret key for signing JWTs        | —                      |
| `SMTP_HOST`     | SMTP server host                   | `smtp.ethereal.email`  |
| `SMTP_PORT`     | SMTP server port                   | `587`                  |
| `SMTP_USER`     | SMTP username                      | —                      |
| `SMTP_PASS`     | SMTP password                      | —                      |
| `FRONTEND_URL`  | Allowed CORS origin                | `http://localhost:5173` |

> **Tip:** For local development emails, generate test credentials at [Ethereal Email](https://ethereal.email/).

---

## Scripts

Run from the project root:

| Script               | Command                  | Description                              |
| -------------------- | ------------------------ | ---------------------------------------- |
| Install Everything   | `npm run install:all`    | Install root + backend + frontend deps   |
| Init Database        | `npm run init-db`        | Run SQL schema to create tables          |
| Seed Database        | `npm run seed-db`        | Populate database with sample data       |
| Dev (Full Stack)     | `npm run dev`            | Start backend & frontend concurrently    |
| Dev (Backend Only)   | `npm run dev:backend`    | Start the Express server                 |
| Dev (Frontend Only)  | `npm run dev:frontend`   | Start the Vite dev server                |
| Backend Tests        | `cd backend && npm test` | Run Jest test suite                      |

---

## Testing

The backend includes integration tests using **Jest** and **Supertest**:

```bash
cd backend
npm test
```

Test files are located in `backend/tests/` and cover:

- `auth.test.js` — Registration & login flows
- `jobs.test.js` — CRUD operations for job postings
- `applications.test.js` — Application submission & status updates
- `candidate.test.js` — Candidate profile & resume operations

A separate test database (`job_board_test_db`) is used automatically when `NODE_ENV=test`.

---

## Project Structure

```
Job_Board_Platform/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool
│   ├── controllers/
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   ├── candidateController.js
│   │   └── jobController.js
│   ├── db/
│   │   ├── schema.sql            # Database table definitions
│   │   ├── seed.js               # Sample data seeder
│   │   └── setup.js              # Database initializer
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verify + role-based access
│   │   ├── errorMiddleware.js    # Global error handler
│   │   ├── uploadMiddleware.js   # Multer config (PDF, 5 MB)
│   │   └── validationMiddleware.js
│   ├── models/
│   │   ├── applicationModel.js
│   │   ├── candidateModel.js
│   │   ├── employerModel.js
│   │   └── jobModel.js
│   ├── routes/
│   │   ├── applicationRoutes.js
│   │   ├── authRoutes.js
│   │   ├── candidateRoutes.js
│   │   ├── employerRoutes.js
│   │   └── jobRoutes.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── jobs.test.js
│   │   ├── applications.test.js
│   │   ├── candidate.test.js
│   │   └── setup.js
│   ├── uploads/                  # Resume storage directory
│   ├── utils/
│   │   └── mailer.js             # Nodemailer email utility
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/                # React page components
│   │   └── App.jsx               # Root component with routing
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json                  # Root scripts & concurrently
└── README.md
```

---

## License

This project is licensed under the **ISC License**.

---

<p align="center">
  Built with ❤️ by <strong>Nura Alam Naim</strong>
</p>
