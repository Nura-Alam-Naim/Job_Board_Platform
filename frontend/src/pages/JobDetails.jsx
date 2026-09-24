import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Briefcase, Clock, Building } from 'lucide-react';
import JobMeta from '../components/JobMeta';
import LoadingState from '../components/LoadingState';

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
  const [candidateProfile, setCandidateProfile] = useState(null);

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

    if (user && user.role === 'candidate') {
      const fetchProfile = async () => {
        try {
          const res = await api.get('/candidates/me');
          setCandidateProfile(res.data);
        } catch (err) {
          console.error('Failed to load profile', err);
        }
      };
      fetchProfile();
    }
  }, [id, user]);

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

  if (loading) return <LoadingState />;
  if (!job) return <div className="text-center mt-8 text-danger">{error}</div>;

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 fade-in-up" style={{ gridColumn: 'span 2' }}>
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl">{job.title}</h1>
            <span className="badge badge-primary">{job.job_type}</span>
          </div>
          
          <div className="border-bottom pb-4 mb-6" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <JobMeta 
              companyName={job.company_name} 
              location={job.location} 
              salaryMin={job.salary_min} 
              salaryMax={job.salary_max} 
              createdAt={job.created_at} 
              iconSize={18}
            />
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
          ) : (candidateProfile && !candidateProfile.resume_path) ? (
            <div className="text-center">
              <div className="badge badge-warning mb-4" style={{ display: 'block', padding: '1rem', whiteSpace: 'normal', lineHeight: '1.5' }}>
                You need to upload your CV before you can apply for this job.
              </div>
              <Link to="/candidate/profile" className="btn btn-primary" style={{ width: '100%' }}>Upload CV Now</Link>
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
