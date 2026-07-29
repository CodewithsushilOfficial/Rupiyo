"use client";

import * as React from 'react';
import Link from 'next/link';
import { resetPasswordAction } from '@/lib/actions/auth-actions';
import { forgotPasswordSchema } from '@/lib/validation/auth-schemas';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.flatten().fieldErrors.email?.[0] || 'Invalid email format');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordAction(email);
      if (!res.success) {
        throw new Error(res.error);
      }
      setSuccessMsg('Password reset instructions have been sent to your email address.');
    } catch (err) {
      console.error('[FORGOT_PASSWORD_ERROR]:', err);
      setError(err.message || 'Unable to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {successMsg && (
        <div className="rounded-control border border-income-border bg-income-soft p-4 text-sm font-medium text-income">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="rounded-control border border-expense-border bg-expense-soft p-4 text-sm font-medium text-expense">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="ananya@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Sending Link...' : 'Send Password Reset Link'}
        </Button>
      </form>

      <p className="text-center text-sm font-medium text-muted-foreground">
        Remembered your password?{' '}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
