import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { validateEmail } from '@/utils/validation';
import { forgotPassword } from '@/api/auth';
import toast from 'react-hot-toast';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setError(undefined);
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch {
      toast.error('Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="card p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Check your email</h2>
        <p className="text-gray-600 mb-6">
          If an account exists for {email}, we've sent password reset instructions.
        </p>
        <Link to="/login" className="link">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h1 className="text-2xl font-bold text-center mb-2">Reset password</h1>
      <p className="text-gray-600 text-center mb-6">
        Enter your email and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Send reset link
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
