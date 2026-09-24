import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployerDashboard from './pages/EmployerDashboard';
import EmployerStats from './pages/EmployerStats';
import EmployerProfile from './pages/EmployerProfile';
import ApplicantsList from './pages/ApplicantsList';
import GlobalApplicantsList from './pages/GlobalApplicantsList';
import CandidateApplications from './pages/CandidateApplications';
import CandidateProfile from './pages/CandidateProfile';
import CandidatePublicProfile from './pages/CandidatePublicProfile';

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

              <Route path="/employer/dashboard" element={<ProtectedRoute allowedRoles={['employer']}><EmployerDashboard /></ProtectedRoute>} />
              <Route path="/employer/applicants" element={<ProtectedRoute allowedRoles={['employer']}><GlobalApplicantsList /></ProtectedRoute>} />
              <Route path="/employer/jobs/:id/applicants" element={<ProtectedRoute allowedRoles={['employer']}><ApplicantsList /></ProtectedRoute>} />
              <Route path="/employer/stats" element={<ProtectedRoute allowedRoles={['employer']}><EmployerStats /></ProtectedRoute>} />
              <Route path="/employer/profile" element={<ProtectedRoute allowedRoles={['employer']}><EmployerProfile /></ProtectedRoute>} />
              <Route path="/candidates/:id" element={<ProtectedRoute allowedRoles={['employer']}><CandidatePublicProfile /></ProtectedRoute>} />
              
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
