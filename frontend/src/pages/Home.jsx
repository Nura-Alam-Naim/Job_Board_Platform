import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Search, MapPin, Briefcase } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', location: '', jobType: '' });

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
    } else {
      fetchJobs();
    }
  }, [user, navigate]);

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
          <p className="text-center text-muted">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-muted card">No jobs found matching your criteria.</p>
        ) : (
          <div className="grid grid-cols-2">
            {jobs.map(job => (
              <div key={job.id} className="card flex" style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold">{job.title}</h3>
                    <span className="badge badge-primary">{job.job_type}</span>
                  </div>
                  <p className="text-muted font-medium mb-4">{job.company_name}</p>
                  
                  <div className="flex gap-4 mb-4 text-sm text-muted">
                    <span className="flex items-center gap-2"><MapPin size={16} /> {job.location || 'Not specified'}</span>
                    <span className="flex items-center gap-2"><Briefcase size={16} /> ${job.salary_min} - ${job.salary_max}</span>
                  </div>
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
