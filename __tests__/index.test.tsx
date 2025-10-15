import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Home from '../pages/index';

// Mock next/router to provide useRouter for Home
jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/', push: jest.fn(), query: {} }),
}));

// Mock auth utilities used by pages
jest.mock('@/lib/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: jest.fn(),
    complete2FALogin: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }),
  ProtectedRoute: ({ children }: any) => <>{children}</>,
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

// Mock Chart.js to avoid canvas rendering issues in tests
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  ArcElement: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
}));

jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid='bar-chart'>Bar Chart</div>,
  Doughnut: () => <div data-testid='doughnut-chart'>Doughnut Chart</div>,
  Line: () => <div data-testid='line-chart'>Line Chart</div>,
}));

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />);
    // There are multiple elements containing the site name; ensure at least one is visible
    expect(screen.getAllByText(/Cuentas Claras/i).length).toBeGreaterThan(0);
  });

  it('contains navigation links', () => {
    render(<Home />);

  // Check for main navigation items (if present)
  const navText = screen.queryByText(/Dashboard/i) || screen.queryByText(/Comunidades/i);
  expect(navText).toBeTruthy();
  });

  it('has accessible heading structure', () => {
    render(<Home />);

    // Check for main heading
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
  });
});
