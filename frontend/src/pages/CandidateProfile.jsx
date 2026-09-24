import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { UploadCloud, FileText } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
const CandidateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/candidates/me');
      setProfile(res.data);
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

  if (loading) return <LoadingState />;
  if (!profile) return <EmptyState message="Failed to load profile." />;

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="text-2xl mb-6">My Profile</h1>
      
      <div className="mb-6">
        <label className="text-muted block mb-1 text-sm">Full Name</label>
        <div className="text-lg font-medium">{profile.full_name}</div>
      </div>
      
      <div className="mb-8">
        <label className="text-muted block mb-1 text-sm">Email Address</label>
        <div className="text-lg font-medium">{profile.email}</div>
      </div>

      <h2 className="text-xl mb-4 border-top pt-6" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>Resume Management</h2>
      
      {profile.resume_path ? (
        <div className="flex items-center gap-4 p-4 mb-4" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
          <FileText size={24} className="text-success" />
          <div style={{ flex: 1 }}>
            <div className="font-medium">Current Resume Uploaded</div>
            <a 
              href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${profile.resume_path}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-sm"
            >
              View Document
            </a>
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
