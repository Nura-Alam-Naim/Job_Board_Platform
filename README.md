# CodeAlpha Job Board Platform

This is a full-stack Job Board Platform built for the CodeAlpha Backend Development Internship (Task 4). It features separate dashboards for Employers and Candidates, allowing for job posting, job searching, resume uploading, application tracking, and status notifications.

## Architecture & Tech Stack

- **Backend (REST API)**: Node.js, Express.js
- **Frontend (SPA)**: React.js (Vite), React Router DOM, Axios, Context API
- **Database**: MySQL (using `mysql2/promise` with connection pooling)
- **Authentication**: JWT (JSON Web Tokens) with role-based access control (Employer/Candidate), `bcrypt` for password hashing
- **File Uploads**: `multer` for handling PDF resumes
- **Email Notifications**: `nodemailer` with Ethereal/Mailtrap

## Database Setup (MySQL)

1. Ensure MySQL server is running locally on your machine.
2. The database initialization script will automatically create the database (`job_board_db`) and necessary tables (`employers`, `candidates`, `jobs`, `applications`).
3. You can configure your database credentials (username and password) in `backend/.env`.

## Running the Application

### The Easy Way (Concurrently)
You can run both the frontend and backend simultaneously from the root folder:

```bash
# Install dependencies for root, backend, and frontend
npm run install:all

# Initialize the database (make sure backend/.env has your MySQL credentials)
npm run init-db

# Run both servers concurrently
npm run dev
```

### The Manual Way
If you prefer running them separately:

#### 1. Setup Backend
```bash
cd backend
npm install
node db/setup.js
npm start   # or node server.js
```

#### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
- The frontend will be available at `http://localhost:5173`.
- The backend API runs at `http://localhost:5000/api`.

## Implemented "Necessary Additions"
As per the task requirements, the following standard features were successfully implemented:
1. **JWT Authentication & Bcrypt Hashing**: Secure login system with protected role-based routes.
2. **File Uploads (Multer)**: Candidates can upload PDF resumes (max 5MB limit).
3. **Input Validation**: Handled extensively via `express-validator` to ensure data integrity (e.g. valid emails, non-empty fields, correct salary ranges).
4. **Email Notifications**: Integrated `nodemailer` to simulate sending an email to a candidate when an employer updates their application status.
5. **CORS Configuration**: Backend restricted to accept requests only from the frontend origin.
6. **Centralized Error Handling**: Express error middleware returns consistent JSON error payloads instead of raw HTML stack traces.
7. **Application Statistics Endpoint**: Employers have a dashboard to view total postings, total applications received, and a breakdown of application statuses.

## API Documentation

### Authentication API
- `POST /api/auth/register/employer` (Body: `companyName`, `email`, `password`)
- `POST /api/auth/register/candidate` (Body: `fullName`, `email`, `password`)
- `POST /api/auth/login` (Body: `email`, `password`, `role`) -> Returns JWT token and role

### Job API
- `GET /api/jobs` (Public) - Paginated, filterable (`?search=`, `&location=`, `&jobType=`) list of active jobs.
- `GET /api/jobs/:id` (Public) - View details of a specific job.
- `POST /api/jobs` (Employer) - Create a job posting.
- `PUT /api/jobs/:id` (Employer) - Update an existing job.
- `DELETE /api/jobs/:id` (Employer) - Deactivate a job posting.
- `GET /api/employers/me/jobs` (Employer) - List all jobs posted by the logged-in employer.

### Candidate & Resume API
- `GET /api/candidates/me` (Candidate) - View logged-in candidate profile.
- `POST /api/candidates/resume` (Candidate) - Upload/replace resume (Multipart form-data: `resume`).

### Application API
- `POST /api/jobs/:id/apply` (Candidate) - Apply to a job (Requires resume uploaded).
- `GET /api/candidates/me/applications` (Candidate) - List jobs the candidate has applied for.
- `GET /api/jobs/:id/applications` (Employer) - List applicants for a specific job.
- `PATCH /api/applications/:id/status` (Employer) - Update application status (Body: `status`).
- `GET /api/employers/me/stats` (Employer) - View statistics on total postings and applications.
