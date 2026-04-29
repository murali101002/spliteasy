import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { validateEmail } from '@/utils/validation';
import toast from 'react-hot-toast';
import axios from 'axios';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = password ? null : 'Password is required';

    if (emailError || passwordError) {
      setErrors({ email: emailError || undefined, password: passwordError || undefined });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await login(email, password);
      const pendingInvite = sessionStorage.getItem('pendingInvite');
      if (pendingInvite) {
        sessionStorage.removeItem('pendingInvite');
        navigate(`/join/${pendingInvite}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Login failed');
      } else {
        toast.error('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Welcome back</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <Input
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm link">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Log in
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="link">
          Sign up
        </Link>
      </p>
    </div>
  );
}
