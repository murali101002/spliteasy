import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from '@/components/features/auth/LoginForm';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLoginForm() {
  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('renders email and password inputs and submit button', () => {
    renderLoginForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    renderLoginForm();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/password/i), 'password1');
    await user.click(screen.getByRole('button', { name: /log in/i }));
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('shows validation error for empty password', async () => {
    renderLoginForm();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /log in/i }));
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it('calls login and navigates on success', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderLoginForm();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password1');
    await user.click(screen.getByRole('button', { name: /log in/i }));
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password1');
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('navigates to join URL when pendingInvite exists in sessionStorage', async () => {
    sessionStorage.setItem('pendingInvite', 'ABC12345');
    mockLogin.mockResolvedValueOnce(undefined);
    renderLoginForm();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password1');
    await user.click(screen.getByRole('button', { name: /log in/i }));
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/join/ABC12345');
    });
    expect(sessionStorage.getItem('pendingInvite')).toBeNull();
  });
});
