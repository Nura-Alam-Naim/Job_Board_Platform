import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Briefcase } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="logo text-gradient">
          <Briefcase size={28} style={{ color: 'var(--primary)' }} />
          <span>JobBoard</span>
        </Link>
        <div className="nav-links">
          <Link to={user?.role === 'employer' ? '/employer/dashboard' : '/'}>
            {user?.role === 'employer' ? 'Dashboard' : 'Jobs'}
          </Link>
          
          {!user ? (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          ) : (
            <>
              {user.role === 'employer' ? (
                <>
                  <Link to="/employer/stats">Stats</Link>
                </>
              ) : (
                <>
                  <Link to="/candidate/applications">My Applications</Link>
                  <Link to="/candidate/profile">Profile</Link>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                Logout
              </button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
