import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';

const EmployerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
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
    if (window.confirm('Are you sure you want to deactivate this job?')) {
      try {
        await api.delete(`/jobs/${id}`);
        fetchJobs();
      } catch (err) {
        alert('Failed to delete job');
      }
    }
  };

  const openModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title, description: job.description, location: job.location, 
        jobType: job.job_type, salaryMin: job.salary_min || '', salaryMax: job.salary_max || ''
      });
    } else {
      setEditingJob(null);
      setFormData({ title: '', description: '', location: '', jobType: 'full-time', salaryMin: '', salaryMax: '' });
    }
    setIsModalOpen(true);
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">My Job Postings</h1>
        <button onClick={() => openModal()} className="btn btn-primary"><Plus size={18} className="mr-2"/> Post New Job</button>
      </div>

      <div className="grid">
        {jobs.map(job => (
          <div key={job.id} className={`card flex justify-between items-center ${!job.is_active ? 'opacity-50' : ''}`}>
            <div>
              <h3 className="text-lg font-bold">{job.title} {!job.is_active && '(Inactive)'}</h3>
              <p className="text-muted text-sm">{new Date(job.created_at).toLocaleDateString()} • {job.job_type}</p>
            </div>
            
            {job.is_active && (
              <div className="flex gap-2">
                <Link to={`/employer/jobs/${job.id}/applicants`} className="btn btn-secondary text-sm">
                  <Users size={16} /> Applicants
                </Link>
                <button onClick={() => openModal(job)} className="btn btn-secondary text-sm">
                  <Edit2 size={16} /> Edit
                </button>
                <button onClick={() => handleDelete(job.id)} className="btn btn-danger text-sm">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
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

export default EmployerJobs;
