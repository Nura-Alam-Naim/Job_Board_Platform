import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Building, MapPin, Clock, PartyPopper } from 'lucide-react';
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

  const hiredApps = applications.filter(app => app.status === 'hired');

  return (
    <div>
      <h1 className="text-2xl mb-6">My Applications</h1>

      {hiredApps.length > 0 && (
        <div className="card mb-8 fade-in-up" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '2px solid var(--success)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, color: 'var(--success)' }}>
            <PartyPopper size={150} />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div style={{ backgroundColor: 'var(--success)', color: 'white', padding: '1rem', borderRadius: '50%' }}>
              <PartyPopper size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-success mb-1">Congratulations! You've been Hired!</h2>
              <p className="text-main font-medium">
                You were successfully hired for <strong>{hiredApps.length === 1 ? hiredApps[0].job_title : `${hiredApps.length} positions`}</strong>! 
                The employer will reach out to you via email shortly.
              </p>
            </div>
          </div>
        </div>
      )}

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
