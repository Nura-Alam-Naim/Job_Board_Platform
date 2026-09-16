import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Briefcase, Clock, Building } from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        setError('Failed to load job details.');
      }
      setLoading(false);
    };
    fetchJob();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'candidate') {
      setError('Only candidates can apply for jobs.');
      return;
    }

    setApplying(true);
    setError('');
    try {
      await api.post(`/jobs/${id}/apply`, { coverNote });
      setSuccess('Successfully applied for this job!');
      setCoverNote('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply. You may need to upload a resume first.');
    }
    setApplying(false);
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (!job) return <div className="text-center mt-8 text-danger">{error}</div>;

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2" style={{ gridColumn: 'span 2' }}>
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl">{job.title}</h1>
            <span className="badge badge-primary">{job.job_type}</span>
          </div>
          
          <div className="flex gap-4 mb-6 text-muted border-bottom pb-4" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <span className="flex items-center gap-2"><Building size={18} /> {job.company_name}</span>
            <span className="flex items-center gap-2"><MapPin size={18} /> {job.location || 'Remote'}</span>
            <span className="flex items-center gap-2"><Briefcase size={18} /> ${job.salary_min} - ${job.salary_max}</span>
            <span className="flex items-center gap-2"><Clock size={18} /> {new Date(job.created_at).toLocaleDateString()}</span>
          </div>
          
          <div>
            <h2 className="text-xl mb-4">Job Description</h2>
            <div style={{ whiteSpace: 'pre-line', color: 'var(--text-muted)' }}>
              {job.description}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="card sticky" style={{ top: '100px' }}>
          <h3 className="text-lg mb-4">Apply for this Job</h3>
          
          {!user ? (
            <div className="text-center">
              <p className="text-muted mb-4">Please log in to apply</p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>Login</Link>
            </div>
          ) : user.role === 'employer' ? (
            <div className="badge badge-warning" style={{ display: 'block', textAlign: 'center' }}>
              Employers cannot apply for jobs.
            </div>
          ) : (
            <form onSubmit={handleApply}>
              {error && <div className="badge badge-warning mb-4" style={{ display: 'block', padding: '0.75rem' }}>{error}</div>}
              {success && <div className="badge badge-success mb-4" style={{ display: 'block', padding: '0.75rem' }}>{success}</div>}
              
              <div className="form-group">
                <label className="form-label">Cover Note (Optional)</label>
                <textarea 
                  rows="4" 
                  placeholder="Introduce yourself..."
                  value={coverNote}
                  onChange={e => setCoverNote(e.target.value)}
                  disabled={applying || success}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                disabled={applying || success}
              >
                {applying ? 'Applying...' : success ? 'Applied' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
