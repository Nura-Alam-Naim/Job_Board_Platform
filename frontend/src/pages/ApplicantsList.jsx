import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const ApplicantsList = () => {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, jobRes] = await Promise.all([
          api.get(`/jobs/${id}/applications`),
          api.get(`/jobs/${id}`)
        ]);
        setApplications(appRes.data);
        setJob(jobRes.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

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
  if (!job) return <EmptyState message="Job not found." />;

  return (
    <div>
      <div className="mb-6">
        <Link to="/employer/jobs" className="text-muted">← Back to Jobs</Link>
        <h1 className="text-2xl mt-2">Applicants for: {job.title}</h1>
      </div>

      {applications.length === 0 ? (
        <EmptyState message="No applications yet." />
      ) : (
        <div className="grid">
          {applications.map(app => (
            <div key={app.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">
                    <Link to={`/candidates/${app.candidate_id}`} className="hover:text-primary hover:underline">{app.candidate_name}</Link>
                  </h3>
                  <p className="text-muted text-sm">{app.candidate_email}</p>
                  <p className="text-muted text-sm mt-1">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <select 
                    value={app.status} 
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
                  >
                    <option value="rejected">Rejected</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="hired">Hired</option>
                  </select>
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

export default ApplicantsList;
