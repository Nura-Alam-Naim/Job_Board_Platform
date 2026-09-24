import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { UploadCloud, FileText, Trash2 } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
const CandidateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    first_name: '', 
    last_name: '',
    age: '',
    profession: '',
    cgpa: '',
    institute: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/candidates/me');
      setProfile(res.data);
      
      const names = res.data.full_name ? res.data.full_name.split(' ') : ['', ''];
      const defaultFirst = res.data.first_name || names[0] || '';
      const defaultLast = res.data.last_name || names.slice(1).join(' ') || '';

      setEditForm({ 
        first_name: defaultFirst,
        last_name: defaultLast,
        age: res.data.age || '',
        profession: res.data.profession || '',
        cgpa: res.data.cgpa || '',
        institute: res.data.institute || ''
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage('Please upload a PDF file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    setMessage('');

    try {
      await api.post('/candidates/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Resume uploaded successfully!');
      fetchProfile();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to upload resume.');
    }
    setUploading(false);
  };

  const handleRemoveCV = async () => {
    if (!window.confirm('Are you sure you want to remove your CV? You will not be able to apply for jobs until you upload a new one.')) return;
    
    setUploading(true);
    setMessage('');
    
    try {
      await api.delete('/candidates/resume');
      setMessage('Resume removed successfully!');
      fetchProfile();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to remove resume.');
    }
    setUploading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');
    try {
      await api.put('/candidates/me', editForm);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile.');
    }
    setUploading(false);
  };

  if (loading) return <LoadingState />;
  if (!profile) return <EmptyState message="Failed to load profile." />;

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">My Profile</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm">Edit Profile</button>
        )}
      </div>
      
      {isEditing ? (
        <form onSubmit={handleUpdateProfile} className="mb-8">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">First Name</label>
              <input 
                type="text" 
                value={editForm.first_name} 
                onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Last Name</label>
              <input 
                type="text" 
                value={editForm.last_name} 
                onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Age</label>
              <input 
                type="number" 
                value={editForm.age} 
                onChange={(e) => setEditForm({...editForm, age: e.target.value})}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Profession / Title</label>
              <input 
                type="text" 
                value={editForm.profession} 
                onChange={(e) => setEditForm({...editForm, profession: e.target.value})}
                placeholder="e.g. Software Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Educational Institute</label>
              <input 
                type="text" 
                value={editForm.institute} 
                onChange={(e) => setEditForm({...editForm, institute: e.target.value})}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">CGPA</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                max="10"
                value={editForm.cgpa} 
                onChange={(e) => setEditForm({...editForm, cgpa: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group mb-6">
            <label className="form-label">Email Address <span className="text-muted text-sm">(Cannot be changed)</span></label>
            <input type="text" value={profile.email} disabled />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="btn btn-primary" disabled={uploading}>Save Changes</button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary" disabled={uploading}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-muted block mb-1 text-sm">Full Name</label>
              <div className="text-lg font-medium">{profile.full_name}</div>
            </div>
            <div>
              <label className="text-muted block mb-1 text-sm">Profession / Title</label>
              <div className="text-lg font-medium">{profile.profession || <span className="text-muted italic">Not specified</span>}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-muted block mb-1 text-sm">Age</label>
              <div className="text-lg font-medium">{profile.age || <span className="text-muted italic">Not specified</span>}</div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="text-muted block mb-1 text-sm">Educational Institute</label>
              <div className="text-lg font-medium">{profile.institute || <span className="text-muted italic">Not specified</span>}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="text-muted block mb-1 text-sm">CGPA</label>
              <div className="text-lg font-medium">{profile.cgpa || <span className="text-muted italic">Not specified</span>}</div>
            </div>
            <div>
              <label className="text-muted block mb-1 text-sm">Email Address</label>
              <div className="text-lg font-medium">{profile.email}</div>
            </div>
          </div>
        </>
      )}

      <h2 className="text-xl mb-4 border-top pt-6" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>Resume Management</h2>
      
      {profile.resume_path ? (
        <div className="flex items-center gap-4 p-4 mb-4" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
          <FileText size={24} className="text-success" />
          <div style={{ flex: 1 }}>
            <div className="font-medium">Current Resume Uploaded</div>
            <div className="flex gap-4">
              <a 
                href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${profile.resume_path}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-sm font-medium"
              >
                View Document
              </a>
              <button 
                onClick={handleRemoveCV} 
                className="btn btn-danger flex items-center gap-2" 
                disabled={uploading}
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                <Trash2 size={16} /> Remove CV
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="badge badge-warning mb-4" style={{ display: 'block', padding: '1rem', textAlign: 'center' }}>
          You have not uploaded a resume yet. You must upload one to apply for jobs.
        </div>
      )}

      {message && <div className="badge badge-primary mb-4" style={{ display: 'block', padding: '0.75rem' }}>{message}</div>}

      <div className="form-group mb-0">
        <label className="btn btn-secondary flex items-center justify-center gap-2" style={{ cursor: 'pointer' }}>
          <UploadCloud size={20} />
          {uploading ? 'Uploading...' : 'Upload New Resume (PDF, Max 5MB)'}
          <input 
            type="file" 
            accept=".pdf" 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
};

export default CandidateProfile;
