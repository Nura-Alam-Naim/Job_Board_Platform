import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Building, MapPin, Clock } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

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




  if (loading) return <LoadingState />;

  return (
    <div>
      <h1 className="text-2xl mb-6">My Applications</h1>

      {applications.length === 0 ? (
        <EmptyState 
          message="You haven't applied to any jobs yet." 
          actionText="Browse Jobs" 
          actionLink="/" 
        />
      ) : (
        <div className="grid grid-cols-2">
          {applications.map(app => (
            <div key={app.id} className="card">
              <div className="flex justify-between items-start mb-4 gap-4">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/jobs/${app.job_id}`} className="text-lg font-bold text-main block mb-1" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {app.job_title}
                  </Link>
                  <p className="flex items-center gap-2 text-muted text-sm">
                    <Building size={16} /> {app.company_name}
                  </p>
                </div>
                <StatusBadge status={app.status} />
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
