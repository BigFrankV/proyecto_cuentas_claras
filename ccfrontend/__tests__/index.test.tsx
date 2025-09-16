import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Home from '../pages/index';

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
    expect(screen.getByText(/Cuentas Claras/i)).toBeInTheDocument();
  });

  it('contains navigation links', () => {
    render(<Home />);

    // Check for main navigation items
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Comunidades/i)).toBeInTheDocument();
  });

  it('has accessible heading structure', () => {
    render(<Home />);

    // Check for main heading
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
  });
});
