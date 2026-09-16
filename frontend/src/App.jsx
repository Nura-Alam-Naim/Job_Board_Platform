import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployerJobs from './pages/EmployerJobs';
import EmployerStats from './pages/EmployerStats';
import ApplicantsList from './pages/ApplicantsList';
import CandidateApplications from './pages/CandidateApplications';
import CandidateProfile from './pages/CandidateProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main className="container" style={{ flex: 1, padding: '2rem 1rem' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/employer/jobs" element={<ProtectedRoute allowedRoles={['employer']}><EmployerJobs /></ProtectedRoute>} />
              <Route path="/employer/jobs/:id/applicants" element={<ProtectedRoute allowedRoles={['employer']}><ApplicantsList /></ProtectedRoute>} />
              <Route path="/employer/stats" element={<ProtectedRoute allowedRoles={['employer']}><EmployerStats /></ProtectedRoute>} />
              
              <Route path="/candidate/applications" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateApplications /></ProtectedRoute>} />
              <Route path="/candidate/profile" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateProfile /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
