import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Briefcase, Users, CheckCircle, XCircle } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const EmployerStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/employers/me/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingState />;
  if (!stats) return <EmptyState message="Failed to load statistics." />;

  return (
    <div>
      <h1 className="text-2xl mb-6">Dashboard Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/employer/dashboard" className="card flex items-center gap-4 hover-effect transition-transform cursor-pointer" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', color: 'var(--primary)' }}>
            <Briefcase size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-bold">{stats.totalJobs}</h3>
            <p className="text-muted">Total Jobs Posted</p>
          </div>
        </Link>
        
        <Link to="/employer/applicants" className="card flex items-center gap-4 hover-effect transition-transform cursor-pointer" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: 'var(--success)' }}>
            <Users size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-bold">{stats.totalApplications}</h3>
            <p className="text-muted">Total Applications Received</p>
          </div>
        </Link>
      </div>

      <h2 className="text-xl mb-4">Applications by Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(stats.applicationsByStatus).map(([status, count]) => (
          <Link to={`/employer/applicants?status=${status}`} key={status} className="card text-center hover-effect transition-transform cursor-pointer" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit' }}>
            <h4 className="text-2xl font-bold mb-1">{count}</h4>
            <span className="text-muted uppercase text-sm font-medium">{status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EmployerStats;
