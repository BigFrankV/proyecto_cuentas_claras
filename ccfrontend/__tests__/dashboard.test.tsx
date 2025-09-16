import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
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
    expect(screen.getByText('Panel de Control')).toBeInTheDocument();
    expect(
      screen.getByText('Resumen general de la administración de comunidades')
    ).toBeInTheDocument();

    // Verify components are rendered
    expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-charts')).toBeInTheDocument();
    expect(screen.getByTestId('recent-activity')).toBeInTheDocument();
  });

  it('has correct page title', () => {
    render(<Dashboard />);

    const layout = screen.getByTestId('layout');
    expect(layout).toHaveAttribute('data-title', 'Dashboard - Cuentas Claras');
  });

  it('renders action buttons', () => {
    render(<Dashboard />);

    expect(screen.getByText('Actualizar')).toBeInTheDocument();
    expect(screen.getByText('Nueva Emisión')).toBeInTheDocument();
  });
});
