import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Building, MapPin, Clock } from 'lucide-react';

const CandidateApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/candidates/me/applications');
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      }
        setLoading(false);
    };
    fetchApplications();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'shortlisted':
      case 'hired':
        return 'badge-success';
      case 'rejected':
        return 'badge-outline';
      case 'reviewed':
        return 'badge-primary';
      default:
        return 'badge-warning';
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl mb-6">My Applications</h1>

      {applications.length === 0 ? (
        <div className="card text-center text-muted p-6">
          <p className="mb-4">You haven't applied to any jobs yet.</p>
          <Link to="/" className="btn btn-primary">Browse Jobs</Link>
        </div>
      ) : (
        <div className="grid">
          {applications.map(app => (
            <div key={app.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Link to={`/jobs/${app.job_id}`} className="text-lg font-bold text-main block mb-1">
                    {app.job_title}
                  </Link>
                  <p className="flex items-center gap-2 text-muted text-sm">
                    <Building size={16} /> {app.company_name}
                  </p>
                </div>
                <span className={`badge ${getStatusBadgeClass(app.status)} uppercase`}>
                  {app.status}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-muted text-sm border-top pt-4 mt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                <Clock size={16} /> Applied on: {new Date(app.applied_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateApplications;
