import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosInstance';
import FormInput from '../components/FormInput';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', role: 'candidate' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', formData);
      login(res.data.token, res.data.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2 className="text-2xl mb-6 text-center">Welcome Back</h2>
      {error && <div className="badge badge-warning mb-4" style={{ display: 'block', padding: '0.75rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
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
          value={formData.password} 
          onChange={e => setFormData({...formData, password: e.target.value})} 
        />
        <div className="form-group">
          <label className="form-label">I am a...</label>
          <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="candidate">Candidate</option>
            <option value="employer">Employer</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
      </form>
      <p className="text-center mt-4 text-muted">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;
