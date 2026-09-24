import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosInstance';
import FormInput from '../components/FormInput';

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [role, setRole] = useState('candidate');
  const [formData, setFormData] = useState({ fullName: '', companyName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = role === 'employer' ? '/auth/register/employer' : '/auth/register/candidate';
      const payload = role === 'employer' 
        ? { companyName: formData.companyName, email: formData.email, password: formData.password }
        : { fullName: formData.fullName, email: formData.email, password: formData.password };
        
      const res = await api.post(endpoint, payload);
      setSuccess(res.data.message || 'Registration successful. Please check your email to verify your account.');
      setError('');
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map(e => e.msg).join(', '));
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2 className="text-2xl mb-6 text-center">Create an Account</h2>
      
      <div className="flex gap-2 mb-6">
        <button 
          className={`btn ${role === 'candidate' ? 'btn-primary' : 'btn-secondary'}`} 
          style={{ flex: 1 }}
          onClick={() => setRole('candidate')}
        >
          Candidate
        </button>
        <button 
          className={`btn ${role === 'employer' ? 'btn-primary' : 'btn-secondary'}`} 
          style={{ flex: 1 }}
          onClick={() => setRole('employer')}
        >
          Employer
        </button>
      </div>

      {error && <div className="badge badge-warning mb-4" style={{ display: 'block', padding: '0.75rem' }}>{error}</div>}
      {success && <div className="badge mb-4" style={{ display: 'block', padding: '0.75rem', backgroundColor: 'var(--success-color)', color: 'white' }}>{success}</div>}
      
      {!success && (
        <form onSubmit={handleSubmit}>
        {role === 'employer' ? (
          <FormInput 
            label="Company Name"
            type="text" 
            required 
            value={formData.companyName} 
            onChange={e => setFormData({...formData, companyName: e.target.value})} 
          />
        ) : (
          <FormInput 
            label="Full Name"
            type="text" 
            required 
            value={formData.fullName} 
            onChange={e => setFormData({...formData, fullName: e.target.value})} 
          />
        )}

        <FormInput 
          label="Email"
          type="email" 
          required 
          value={formData.email} 
          onChange={e => setFormData({...formData, email: e.target.value})} 
        />
        <FormInput 
          label="Password"
          type="password" 
          required 
          minLength={6}
          value={formData.password} 
          onChange={e => setFormData({...formData, password: e.target.value})} 
        />
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
      </form>
      )}
      
      <p className="text-center mt-4 text-muted">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;
