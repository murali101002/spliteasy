import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { validateEmail, validatePassword, validateName } from '@/utils/validation';
import toast from 'react-hot-toast';
import axios from 'axios';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string | undefined> = {
      name: validateName(name) || undefined,
      email: validateEmail(email) || undefined,
      password: validatePassword(password) || undefined,
      confirmPassword: password !== confirmPassword ? 'Passwords do not match' : undefined,
    };

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await register(email, password, name);
      const pendingInvite = sessionStorage.getItem('pendingInvite');
      if (pendingInvite) {
        sessionStorage.removeItem('pendingInvite');
        navigate(`/join/${pendingInvite}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Registration failed');
      } else {
        toast.error('Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Create your account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="Your name"
          autoComplete="name"
        />

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
          placeholder="At least 8 characters with a number"
          autoComplete="new-password"
        />

        <Input
          type="password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="link">
          Log in
        </Link>
      </p>
    </div>
  );
}
