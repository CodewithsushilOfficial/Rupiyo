"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInAction } from '@/lib/actions/auth-actions';
import { loginSchema } from '@/lib/validation/auth-schemas';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = React.useState({});
  const [serverError, setServerError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setErrors({});

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] || '',
        password: fieldErrors.password?.[0] || '',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await signInAction(formData);
      if (!res.success) {
        throw new Error(res.error);
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('[LOGIN_ERROR]:', err);
      setServerError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {serverError && (
        <div className="rounded-control p-4 text-sm font-medium bg-expense-soft text-expense border border-expense-border">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Email Address
          </label>
          <Input
            name="email"
            type="email"
            placeholder="ananya@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-xs font-medium text-expense">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-semibold text-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-xs font-medium text-expense">{errors.password}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="relative flex items-center justify-center py-2 border-t border-divider">
        <span className="bg-card px-2 text-xs font-semibold text-muted-foreground">
          OR
        </span>
      </div>

      <GoogleAuthButton label="Sign in with Google" />

      <p className="text-center text-sm font-medium text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-bold text-primary hover:underline">
          Create Account
        </Link>
      </p>
    </div>
  );
}
