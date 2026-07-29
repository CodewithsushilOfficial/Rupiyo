import { RegisterForm } from '@/components/auth/RegisterForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Create Account — Rupiyo',
  description: 'Join Rupiyo to track multi-account expenses, manage budgets, and save smarter.',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-xl">
          ₹
        </div>
        <span className="text-2xl font-bold text-slate-900 dark:text-white">Rupiyo</span>
      </div>

      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Start managing your personal finances cleanly
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
