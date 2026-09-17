import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

describe('Navbar Component', () => {
  const renderNavbarWithAuth = (user = null) => {
    return render(
      <AuthContext.Provider value={{ user, logout: () => {} }}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('renders JobBoard logo and Jobs link', () => {
    renderNavbarWithAuth();
    expect(screen.getByText('JobBoard')).toBeInTheDocument();
    expect(screen.getByText('Jobs')).toBeInTheDocument();
  });

  it('shows Login and Register buttons when user is not authenticated', () => {
    renderNavbarWithAuth(null);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('shows Employer links when user is an employer', () => {
    renderNavbarWithAuth({ role: 'employer', email: 'emp@test.com' });
    expect(screen.getByText('My Postings')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('shows Candidate links when user is a candidate', () => {
    renderNavbarWithAuth({ role: 'candidate', email: 'cand@test.com' });
    expect(screen.getByText('My Applications')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });
});
