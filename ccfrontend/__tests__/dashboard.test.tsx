import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';

// Mock auth utilities BEFORE importing pages that use them
jest.mock('@/lib/useAuth', () => ({
  // A simple ProtectedRoute that just renders children in tests
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  // useAuth returns a logged-in user by default for tests
  useAuth: () => ({
    user: { username: 'TestUser', id: 1 },
    isLoading: false,
    isAuthenticated: true,
    login: jest.fn(),
    complete2FALogin: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }),
  // Provide AuthProvider as passthrough
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

import Dashboard from '../pages/dashboard';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock components
jest.mock('@/components/layout/Layout', () => {
  return function MockLayout({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) {
    return (
      <div data-testid='layout' data-title={title}>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/ui/DashboardStats', () => {
  return function MockDashboardStats() {
    return <div data-testid='dashboard-stats'>Dashboard Stats</div>;
  };
});

jest.mock('@/components/ui/DashboardCharts', () => {
  return function MockDashboardCharts() {
    return <div data-testid='dashboard-charts'>Dashboard Charts</div>;
  };
});

jest.mock('@/components/ui/RecentActivity', () => {
  return function MockRecentActivity() {
    return <div data-testid='recent-activity'>Recent Activity</div>;
  };
});

describe('Dashboard Page', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/dashboard',
      push: jest.fn(),
      query: {},
    });
  });

  it('renders dashboard page correctly', () => {
    render(<Dashboard />);

    // Verify main elements are present
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    // The page renders a Dashboard heading and welcome text
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Bienvenido de vuelta/i)).toBeInTheDocument();

    // Verify components are rendered
    // DashboardCharts is used in the page
    expect(screen.getByTestId('dashboard-charts')).toBeInTheDocument();
  });

  it('has correct page title', () => {
    render(<Dashboard />);

    const layout = screen.getByTestId('layout');
    // Layout mock uses the title passed in the page
    expect(layout).toHaveAttribute('data-title', 'Dashboard');
  });

  it('renders action buttons', () => {
    render(<Dashboard />);

    // Check that some KPI and section headings are present
    expect(screen.getByText('Saldo Total')).toBeInTheDocument();
    expect(screen.getByText('Pagos Recientes')).toBeInTheDocument();
  });
});

