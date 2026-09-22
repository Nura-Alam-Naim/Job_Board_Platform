import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import '../index.css'; // Uses global styles

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided in the URL.');
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <div className="container" style={{ marginTop: '5rem', textAlign: 'center', maxWidth: '500px' }}>
      <div className="card" style={{ padding: '3rem' }}>
        <h2>Email Verification</h2>
        
        {status === 'loading' && <p>Verifying your email address, please wait...</p>}
        
        {status === 'success' && (
          <div>
            <div style={{ color: 'var(--success-color)', fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
            <p>{message}</p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Proceed to Login</Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ color: 'var(--danger-color)', fontSize: '3rem', marginBottom: '1rem' }}>✗</div>
            <p style={{ color: 'var(--danger-color)' }}>{message}</p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
              If your link expired, try registering again to receive a new link.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
