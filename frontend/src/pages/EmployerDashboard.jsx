import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Plus, Edit2, Trash2, Users, Calendar, MapPin, Briefcase } from 'lucide-react';

const EmployerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', description: '', location: '', jobType: 'full-time', salaryMin: '', salaryMax: ''
  });

  const fetchJobs = async () => {
    try {
      const res = await api.get('/employers/me/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, salaryMin: Number(formData.salaryMin) || null, salaryMax: Number(formData.salaryMax) || null };
      if (editingJob) {
        await api.put(`/jobs/${editingJob.id}`, payload);
      } else {
        await api.post('/jobs', payload);
      }
      setIsModalOpen(false);
      setEditingJob(null);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save job');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to close this job? It will be moved to History.')) {
      try {
        await api.delete(`/jobs/${id}`);
        fetchJobs();
      } catch (err) {
        alert('Failed to close job');
      }
    }
  };

  const openModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title, description: job.description, location: job.location || '', 
        jobType: job.job_type, salaryMin: job.salary_min || '', salaryMax: job.salary_max || ''
      });
    } else {
      setEditingJob(null);
      setFormData({ title: '', description: '', location: '', jobType: 'full-time', salaryMin: '', salaryMax: '' });
    }
    setIsModalOpen(true);
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  const activeJobs = jobs.filter(j => j.is_active);
  const historyJobs = jobs.filter(j => !j.is_active);
  
  const displayedJobs = activeTab === 'active' ? activeJobs : historyJobs;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employer Dashboard</h1>
        <button onClick={() => openModal()} className="btn btn-primary"><Plus size={18} className="mr-2"/> Post New Job</button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-[var(--border-color)]">
        <button 
          className={`pb-2 px-1 ${activeTab === 'active' ? 'border-b-2 border-primary text-primary font-bold' : 'text-muted'}`}
          onClick={() => setActiveTab('active')}
          style={{ background: 'transparent' }}
        >
          Active Postings ({activeJobs.length})
        </button>
        <button 
          className={`pb-2 px-1 ${activeTab === 'history' ? 'border-b-2 border-primary text-primary font-bold' : 'text-muted'}`}
          onClick={() => setActiveTab('history')}
          style={{ background: 'transparent' }}
        >
          History ({historyJobs.length})
        </button>
      </div>

      <div className="grid">
        {displayedJobs.length === 0 ? (
          <div className="card text-center text-muted py-8">
            <p>No jobs found in {activeTab === 'active' ? 'active postings' : 'history'}.</p>
          </div>
        ) : (
          displayedJobs.map(job => (
            <div key={job.id} className="card flex" style={{ flexDirection: 'column', gap: '1rem' }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                  <div className="flex gap-4 text-sm text-muted mb-2">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.location || 'Remote'}</span>
                    <span className="flex items-center gap-1"><Briefcase size={14} /> {job.job_type}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {job.is_active && (
                  <div className="flex gap-2">
                    <button onClick={() => openModal(job)} className="btn btn-secondary text-sm px-3 py-1"><Edit2 size={14} /> Edit</button>
                    <button onClick={() => handleDelete(job.id)} className="btn btn-danger text-sm px-3 py-1"><Trash2 size={14} /> Close Job</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4" style={{ backgroundColor: 'var(--bg-default)', padding: '1rem', borderRadius: '8px' }}>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{job.applicants_count}</p>
                  <p className="text-xs text-muted uppercase tracking-wider">Total Applicants</p>
                </div>
                <div className="text-center" style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                  <p className="text-2xl font-bold text-success">{job.accepted_count || 0}</p>
                  <p className="text-xs text-muted uppercase tracking-wider">Hired</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{job.days_open || 0}</p>
                  <p className="text-xs text-muted uppercase tracking-wider">Days Open</p>
                </div>
              </div>
              
              <Link to={`/employer/jobs/${job.id}/applicants`} className="btn btn-primary text-center mt-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Users size={16} /> View Applicants
              </Link>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="text-xl mb-4">{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})}>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Min Salary</label>
                  <input type="number" value={formData.salaryMin} onChange={e => setFormData({...formData, salaryMin: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Salary</label>
                  <input type="number" value={formData.salaryMax} onChange={e => setFormData({...formData, salaryMax: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
