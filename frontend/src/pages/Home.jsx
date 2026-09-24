import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Search, MapPin, Briefcase } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import JobMeta from '../components/JobMeta';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', location: '', jobType: '' });
  const [appliedJobs, setAppliedJobs] = useState({});

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { search, location, jobType } = filters;
      let query = '?';
      if (search) query += `search=${search}&`;
      if (location) query += `location=${location}&`;
      if (jobType) query += `jobType=${jobType}`;

      const res = await api.get(`/jobs${query}`);
      setJobs(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && user.role === 'employer') {
      navigate('/employer/dashboard');
    } else if (user && user.role === 'candidate') {
      const fetchApplications = async () => {
        try {
          const res = await api.get('/candidates/me/applications');
          const map = {};
          res.data.forEach(app => {
            map[app.job_id] = app.status;
          });
          setAppliedJobs(map);
        } catch (err) {
          console.error('Failed to fetch applications', err);
        }
      };
      fetchApplications();
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'employer') {
      const delayDebounceFn = setTimeout(() => {
        fetchJobs();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [filters.search, filters.location, filters.jobType, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div>
      <div className="text-center py-20" style={{ marginBottom: '3rem' }}>
        <h1 className="text-5xl mb-6 text-gradient">Find Your Dream Job</h1>
        <p className="text-xl text-muted mb-12 max-w-2xl mx-auto">
          Discover thousands of job opportunities with all the information you need. 
          Its your future, build it the way you want.
        </p>

        <form onSubmit={handleSearch} className="card flex gap-4 max-w-4xl mx-auto" style={{ alignItems: 'flex-end', padding: '1.5rem', background: 'var(--bg-card)' }}>
          <div className="form-group flex-1" style={{ marginBottom: 0, textAlign: 'left' }}>
            <label className="form-label flex items-center gap-2"><Search size={16} /> Keyword</label>
            <input 
              type="text" 
              placeholder="Job title or keyword" 
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div className="form-group flex-1" style={{ marginBottom: 0, textAlign: 'left' }}>
            <label className="form-label flex items-center gap-2"><MapPin size={16} /> Location</label>
            <input 
              type="text" 
              placeholder="City, state, or remote" 
              value={filters.location}
              onChange={e => setFilters({...filters, location: e.target.value})}
            />
          </div>
          <div className="form-group flex-1" style={{ marginBottom: 0, textAlign: 'left' }}>
            <label className="form-label flex items-center gap-2"><Briefcase size={16} /> Type</label>
            <select 
              value={filters.jobType}
              onChange={e => setFilters({...filters, jobType: e.target.value})}
            >
              <option value="">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>
            Search
          </button>
        </form>
      </div>

      <section>
        <h2 className="text-xl mb-6">Latest Opportunities</h2>
        {loading ? (
          <LoadingState message="Loading jobs..." />
        ) : jobs.length === 0 ? (
          <EmptyState message="No jobs found matching your criteria." />
        ) : (
          <div className="grid grid-cols-2">
            {jobs.map((job, index) => (
              <div key={job.id} className="card flex fade-in-up" style={{ flexDirection: 'column', justifyContent: 'space-between', animationDelay: `${index * 0.1}s` }}>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold">{job.title}</h3>
                    <div className="flex gap-2 items-center">
                      <StatusBadge status={appliedJobs[job.id]} />
                      <span className="badge badge-primary">{job.job_type}</span>
                    </div>
                  </div>
                  <p className="text-muted font-medium mb-4">{job.company_name}</p>
                  
                  <JobMeta location={job.location || 'Not specified'} salaryMin={job.salary_min} salaryMax={job.salary_max} className="mb-4" />
                </div>
                
                <Link to={`/jobs/${job.id}`} className="btn btn-secondary text-center" style={{ display: 'block' }}>
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
