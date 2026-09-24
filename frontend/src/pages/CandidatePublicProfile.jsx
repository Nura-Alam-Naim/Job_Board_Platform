import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const CandidatePublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/candidates/${id}`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  if (loading) return <LoadingState />;
  if (!profile) return <EmptyState message="Candidate not found." />;

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="mb-6">
        <button onClick={() => window.history.back()} className="text-muted text-sm hover:text-main">← Back</button>
      </div>

      <div className="flex justify-between items-center mb-6 border-bottom pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <h1 className="text-2xl font-bold">{profile.full_name}</h1>
          <p className="text-lg text-primary">{profile.profession || 'Candidate'}</p>
        </div>
        {profile.resume_path && (
          <a 
            href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${profile.resume_path}`} 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-primary btn-sm"
          >
            View Resume
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-muted block mb-1 text-sm font-semibold uppercase tracking-wider">Email</label>
          <div className="text-md font-medium text-main">
            <a href={`mailto:${profile.email}`} className="text-main hover:text-primary">{profile.email}</a>
          </div>
        </div>
        <div>
          <label className="text-muted block mb-1 text-sm font-semibold uppercase tracking-wider">Age</label>
          <div className="text-md font-medium text-main">{profile.age || 'Not specified'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-muted block mb-1 text-sm font-semibold uppercase tracking-wider">Educational Institute</label>
          <div className="text-md font-medium text-main">{profile.institute || 'Not specified'}</div>
        </div>
        <div>
          <label className="text-muted block mb-1 text-sm font-semibold uppercase tracking-wider">CGPA</label>
          <div className="text-md font-medium text-main">{profile.cgpa || 'Not specified'}</div>
        </div>
      </div>
      
      <div className="mt-8 pt-4 border-top" style={{ borderTop: '1px solid var(--border-color)' }}>
        <p className="text-sm text-muted">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default CandidatePublicProfile;
