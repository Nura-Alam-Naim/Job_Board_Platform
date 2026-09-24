import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const EmployerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ company_name: '', company_description: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/employers/me');
      setProfile(res.data);
      setEditForm({ 
        company_name: res.data.company_name || '',
        company_description: res.data.company_description || ''
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/employers/me', { 
        companyName: editForm.company_name,
        companyDescription: editForm.company_description
      });
      setMessage('Company profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile.');
    }
    setSaving(false);
  };

  if (loading) return <LoadingState />;
  if (!profile) return <EmptyState message="Failed to load profile." />;

  return (
    <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">Company Profile</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm">Edit Profile</button>
        )}
      </div>
      
      {message && <div className="badge badge-success mb-4" style={{ display: 'block', padding: '0.75rem' }}>{message}</div>}

      {isEditing ? (
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input 
              type="text" 
              value={editForm.company_name} 
              onChange={(e) => setEditForm({...editForm, company_name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Company Email <span className="text-muted text-sm">(Cannot be changed)</span></label>
            <input type="text" value={profile.email} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">Company Description</label>
            <textarea 
              rows="6"
              value={editForm.company_description}
              onChange={(e) => setEditForm({...editForm, company_description: e.target.value})}
              placeholder="Tell candidates about your company's mission, culture, and what you do..."
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary" disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="mb-6">
            <label className="text-muted block mb-1 text-sm">Company Name</label>
            <div className="text-lg font-medium">{profile.company_name}</div>
          </div>
          
          <div className="mb-6">
            <label className="text-muted block mb-1 text-sm">Company Email</label>
            <div className="text-lg font-medium">{profile.email}</div>
          </div>

          <div className="mb-4">
            <label className="text-muted block mb-1 text-sm">Company Description</label>
            {profile.company_description ? (
              <div style={{ whiteSpace: 'pre-line', color: 'var(--text-main)' }}>
                {profile.company_description}
              </div>
            ) : (
              <div className="text-muted italic">No description provided yet.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EmployerProfile;
