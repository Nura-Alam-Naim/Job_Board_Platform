import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Briefcase, Users, CheckCircle, XCircle } from 'lucide-react';

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

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (!stats) return <div className="text-center mt-8">Failed to load statistics.</div>;

  return (
    <div>
      <h1 className="text-2xl mb-6">Dashboard Statistics</h1>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', color: 'var(--primary)' }}>
            <Briefcase size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-bold">{stats.totalJobs}</h3>
            <p className="text-muted">Total Jobs Posted</p>
          </div>
        </div>
        
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: 'var(--success)' }}>
            <Users size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-bold">{stats.totalApplications}</h3>
            <p className="text-muted">Total Applications Received</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl mb-4">Applications by Status</h2>
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(stats.applicationsByStatus).map(([status, count]) => (
          <div key={status} className="card text-center" style={{ padding: '1.5rem' }}>
            <h4 className="text-2xl font-bold mb-1">{count}</h4>
            <span className="text-muted uppercase text-sm font-medium">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployerStats;
