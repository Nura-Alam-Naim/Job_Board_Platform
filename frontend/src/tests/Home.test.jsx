import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '../pages/Home';
import api from '../api/axiosInstance';

// Mock the API calls
vi.mock('../api/axiosInstance', () => ({
  default: {
    get: vi.fn(),
  }
}));

describe('Home Component (Job Search)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially and then shows jobs', async () => {
    const mockJobs = [
      {
        id: 1,
        title: 'Software Engineer',
        job_type: 'full-time',
        company_name: 'Tech Inc',
        location: 'Remote',
        salary_min: 80000,
        salary_max: 120000,
        created_at: new Date().toISOString(),
      }
    ];

    api.get.mockResolvedValueOnce({ data: { data: mockJobs, total: 1 } });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Initial loading state
    expect(screen.getByText(/Loading jobs.../i)).toBeInTheDocument();

    // Wait for jobs to load
    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    expect(screen.getByText('Tech Inc')).toBeInTheDocument();
    expect(screen.getByText(/80000 - Tk 120000/i)).toBeInTheDocument();
    
    // Check API was called
    expect(api.get).toHaveBeenCalledWith('/jobs?');
  });

  it('shows no jobs message when API returns empty array', async () => {
    api.get.mockResolvedValueOnce({ data: { data: [], total: 0 } });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No jobs found matching your criteria/i)).toBeInTheDocument();
    });
  });
});
