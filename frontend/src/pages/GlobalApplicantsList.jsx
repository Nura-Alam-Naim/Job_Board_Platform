import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { Briefcase } from 'lucide-react';

const GlobalApplicantsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const statusFilter = searchParams.get('status');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = statusFilter ? `?status=${statusFilter}` : '';
        const res = await api.get(`/employers/me/applications${query}`);
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [statusFilter]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <LoadingState />;

  const title = statusFilter === 'hired' ? 'All Hired Candidates' : 'All Applicants';

  return (
    <div>
      <div className="mb-6">
        <Link to="/employer/dashboard" className="text-muted">← Back to Dashboard</Link>
        <h1 className="text-2xl mt-2">{title}</h1>
      </div>

      {applications.length === 0 ? (
        <EmptyState message={`No applications found ${statusFilter ? `with status '${statusFilter}'` : ''}.`} />
      ) : (
        <div className="grid gap-4">
          {applications.map(app => (
            <div key={app.id} className="card fade-in-up">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    <Link to={`/candidates/${app.candidate_id}`} className="hover:text-primary hover:underline">{app.candidate_name}</Link>
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase size={14} className="text-muted" />
                    <Link to={`/jobs/${app.job_id}`} className="text-sm font-medium hover:underline text-main">{app.job_title}</Link>
                  </div>
                  <p className="text-muted text-sm">{app.candidate_email}</p>
                  <p className="text-muted text-sm mt-1">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <select 
                      value={app.status} 
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
                    >
                      <option value="applied">Applied</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="rejected">Rejected</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interviewed">Interviewed</option>
                      <option value="hired">Hired</option>
                    </select>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              </div>
              
              {app.cover_note && (
                <div className="mb-4 bg-muted p-4 rounded" style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '8px' }}>
                  <p className="text-sm font-medium mb-1">Cover Note:</p>
                  <p className="text-sm text-muted">{app.cover_note}</p>
                </div>
              )}
              
              <div className="flex gap-4">
                <Link 
                  to={`/candidates/${app.candidate_id}`}
                  className="btn btn-primary text-sm"
                >
                  View Full Profile
                </Link>
                {app.resume_path && (
                  <a 
                    href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${app.resume_path}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-secondary text-sm"
                  >
                    View Resume (PDF)
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalApplicantsList;
