import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Plus, Edit2, Trash2, Users, Clock, CheckCircle, Briefcase, BarChart2, Activity } from 'lucide-react';
import JobMeta from '../components/JobMeta';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const EmployerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', description: '', location: '', jobType: 'full-time', salaryMin: '', salaryMax: ''
  });

  const fetchData = async () => {
    try {
      const [jobsRes, statsRes] = await Promise.all([
        api.get('/employers/me/jobs'),
        api.get('/employers/me/stats')
      ]);
      setJobs(jobsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
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
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save job');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to close this job? It will be moved to History.')) {
      try {
        await api.delete(`/jobs/${id}`);
        fetchData();
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

  if (loading) return <LoadingState />;

  const activeJobs = jobs.filter(j => j.is_active);
  const historyJobs = jobs.filter(j => !j.is_active);
  
  const displayedJobs = activeTab === 'active' ? activeJobs : historyJobs;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Employer Dashboard</h1>
          <p className="text-muted">Manage your job postings, track applications, and find the best talent.</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary shadow-glow flex items-center gap-2">
          <Plus size={20} /> Post New Job
        </button>
      </div>

      {/* Quick Stats Overview */}
      {stats && (
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="card flex items-center gap-5 fade-in-up" style={{ animationDelay: '0.1s', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ padding: '1.2rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '16px', color: 'var(--primary)' }}>
              <Briefcase size={28} />
            </div>
            <div>
              <p className="text-sm text-muted font-bold uppercase tracking-wider mb-1">Total Postings</p>
              <h3 className="text-3xl font-black">{stats.totalJobs}</h3>
            </div>
          </div>
          
          <div className="card flex items-center gap-5 fade-in-up" style={{ animationDelay: '0.2s', borderLeft: '4px solid var(--success)' }}>
            <div style={{ padding: '1.2rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', color: 'var(--success)' }}>
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm text-muted font-bold uppercase tracking-wider mb-1">Total Applicants</p>
              <h3 className="text-3xl font-black">{stats.totalApplications}</h3>
            </div>
          </div>

          <div className="card flex items-center gap-5 fade-in-up" style={{ animationDelay: '0.3s', borderLeft: '4px solid var(--warning)' }}>
            <div style={{ padding: '1.2rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '16px', color: 'var(--warning)' }}>
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-sm text-muted font-bold uppercase tracking-wider mb-1">Total Hired</p>
              <h3 className="text-3xl font-black">{stats.applicationsByStatus?.hired || 0}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Modern Tabs */}
      <div className="flex gap-4 mb-8" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
        <button 
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'active' ? 'bg-primary text-white shadow-md' : 'bg-[var(--bg-card)] text-muted hover:bg-[var(--border-color)]'}`}
          onClick={() => setActiveTab('active')}
          style={activeTab === 'active' ? { background: 'var(--gradient-primary)', color: 'white' } : { backgroundColor: 'transparent' }}
        >
          <Activity size={18} /> Active Postings <span className="ml-1 opacity-80">({activeJobs.length})</span>
        </button>
        <button 
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-md' : 'bg-[var(--bg-card)] text-muted hover:bg-[var(--border-color)]'}`}
          onClick={() => setActiveTab('history')}
          style={activeTab === 'history' ? { background: 'var(--gradient-primary)', color: 'white' } : { backgroundColor: 'transparent' }}
        >
          <BarChart2 size={18} /> Job History <span className="ml-1 opacity-80">({historyJobs.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {displayedJobs.length === 0 ? (
          <div className="col-span-2">
            <EmptyState message={`No jobs found in ${activeTab === 'active' ? 'active postings' : 'history'}.`} />
          </div>
        ) : (
          displayedJobs.map(job => (
            <div key={job.id} className="card flex flex-col justify-between hover-effect fade-in-up" style={{ minHeight: '300px' }}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <h3 className="text-xl font-bold mb-2 text-main" style={{ lineHeight: '1.3' }}>{job.title}</h3>
                    <JobMeta 
                      location={job.location}
                      jobType={job.job_type}
                      createdAt={job.created_at}
                      useCalendar={true}
                      iconSize={14}
                    />
                  </div>
                  {job.is_active && (
                    <div className="flex gap-2">
                      <button onClick={() => openModal(job)} className="btn btn-secondary text-xs px-2 py-1 flex items-center gap-1" title="Edit"><Edit2 size={12} /> Edit</button>
                      <button onClick={() => handleDelete(job.id)} className="btn btn-danger text-xs px-2 py-1 flex items-center gap-1" title="Close"><Trash2 size={12} /> Close</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto">
                <div className="grid grid-cols-3 gap-2 mb-4" style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '12px' }}>
                  <div className="text-center">
                    <div className="flex justify-center mb-1 text-primary"><Users size={20} /></div>
                    <p className="text-2xl font-black">{job.applicants_count}</p>
                    <p className="text-xs text-muted uppercase tracking-wider font-bold">Applicants</p>
                  </div>
                  <div className="text-center" style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                    <div className="flex justify-center mb-1 text-success"><CheckCircle size={20} /></div>
                    <p className="text-2xl font-black text-success">{job.accepted_count || 0}</p>
                    <p className="text-xs text-muted uppercase tracking-wider font-bold">Hired</p>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-1 text-warning"><Clock size={20} /></div>
                    <p className="text-2xl font-black">{job.days_open || 0}</p>
                    <p className="text-xs text-muted uppercase tracking-wider font-bold">Days Open</p>
                  </div>
                </div>
                
                <Link to={`/employer/jobs/${job.id}/applicants`} className="btn btn-secondary text-center w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}>
                  View Candidate Pipeline <Users size={16} />
                </Link>
              </div>
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
