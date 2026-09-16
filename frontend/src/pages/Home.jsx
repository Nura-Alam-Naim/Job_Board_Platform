import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Search, MapPin, Briefcase } from 'lucide-react';

const Home = () => {
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
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div>
      <section className="text-center py-12">
        <h1 className="text-2xl mb-4">Find Your Dream Job</h1>
        <p className="text-muted mb-8">Discover opportunities that match your skills and aspirations.</p>
        
        <form onSubmit={handleSearch} className="card flex gap-4 items-center" style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search className="text-muted" size={18} style={{ position: 'absolute', left: '10px', top: '12px' }} />
            <input 
              type="text" 
              placeholder="Job title, keywords..." 
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
              style={{ paddingLeft: '2.5rem', border: 'none', background: 'transparent', boxShadow: 'none' }}
            />
          </div>
          <div style={{ flex: 1, position: 'relative', borderLeft: '1px solid var(--border-color)' }}>
            <MapPin className="text-muted" size={18} style={{ position: 'absolute', left: '10px', top: '12px' }} />
            <input 
              type="text" 
              placeholder="Location..." 
              value={filters.location}
              onChange={e => setFilters({...filters, location: e.target.value})}
              style={{ paddingLeft: '2.5rem', border: 'none', background: 'transparent', boxShadow: 'none' }}
            />
          </div>
          <div style={{ flex: 1, borderLeft: '1px solid var(--border-color)', paddingLeft: '0.5rem' }}>
            <select 
              value={filters.jobType}
              onChange={e => setFilters({...filters, jobType: e.target.value})}
              style={{ border: 'none', background: 'transparent', boxShadow: 'none', color: 'var(--text-muted)' }}
            >
              <option value="">Any Type</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </section>

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
