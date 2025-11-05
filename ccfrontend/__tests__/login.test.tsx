import { render, screen, fireEvent } from '@testing-library/react';

// eslint-disable-next-line import/order
import testLogger from '../lib/testLogger';

// Mock next/router before importing the page to provide a router for useRouter()
jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn(), pathname: '/login', query: {} }),
}));

import Login from '../pages/login';

describe('Login Page', () => {
  beforeEach(() => {
    // Limpiar logs antes de cada test
    testLogger.clearLogs();
  });

  it('renders login form correctly', () => {
    try {
      render(<Login />);

      // Verify form elements
      expect(screen.getByText('Cuentas Claras')).toBeInTheDocument();
      expect(screen.getByText('Sistema de Administración')).toBeInTheDocument();
      expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
      expect(screen.getByLabelText('Recordar sesión')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /iniciar sesión/i }),
      ).toBeInTheDocument();

      testLogger.info('Login form rendered successfully');
    } catch (error) {
      testLogger.error('Failed to render login form', error);
      throw error;
    }
  });

  it('updates form inputs correctly', () => {
    render(<Login />);

    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const rememberCheckbox = screen.getByLabelText('Recordar sesión');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(rememberCheckbox);

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(rememberCheckbox).toBeChecked();
  });

  it('prevents form submission with empty fields', () => {
    render(<Login />);

    const submitButton = screen.getByRole('button', {
      name: /iniciar sesión/i,
    });
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');

    fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    expect(emailInput).toBeInvalid();
    expect(passwordInput).toBeInvalid();
  });

  it('has forgot password link', () => {
    render(<Login />);

    const forgotPasswordLink = screen.getByText('¿Olvidaste tu contraseña?');
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest('a')).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });
});

