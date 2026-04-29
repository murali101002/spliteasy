import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { validatePassword } from '@/utils/validation';
import { resetPassword } from '@/api/auth';
import toast from 'react-hot-toast';
import axios from 'axios';

export function ResetPasswordForm() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    const confirmError = password !== confirmPassword ? 'Passwords do not match' : null;

    if (passwordError || confirmError) {
      setErrors({
        password: passwordError || undefined,
        confirmPassword: confirmError || undefined,
      });
      return;
    }

    if (!token) {
      toast.error('Invalid reset link');
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await resetPassword(token, password);
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to reset password');
      } else {
        toast.error('Failed to reset password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h1 className="text-2xl font-bold text-center mb-2">Set new password</h1>
      <p className="text-gray-600 text-center mb-6">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          label="New Password"
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
          placeholder="Confirm your new password"
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Reset password
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        <Link to="/login" className="link">
          Back to login
        </Link>
      </p>
    </div>
  );
}
