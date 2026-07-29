import Link from 'next/link';
import { ArrowRight, ShieldCheck, Wallet, PieChart, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* Public Header */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-lg">
            ₹
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">Rupiyo</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-20 text-center md:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Zero-Trust Private Financial Tracking</span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Master Your Money with <span className="text-blue-600 dark:text-blue-500">Absolute Clarity</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Track multi-account balances, enforce monthly budgets, automate recurring payments, and receive intelligent spending summaries powered by NVIDIA NIM AI.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row sm:items-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Tracking Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In to Account
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
              Everything You Need for Personal Financial Discipline
            </h2>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="mt-2">Multi-Account Ledger</CardTitle>
                  <CardDescription>
                    Aggregate Cash, Bank Accounts, UPI Wallets, and Credit Card liabilities in one view.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <PieChart className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  <CardTitle className="mt-2">Budget Limits</CardTitle>
                  <CardDescription>
                    Set monthly overall and category budget caps with automated threshold alerts.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  <CardTitle className="mt-2">Savings Goals</CardTitle>
                  <CardDescription>
                    Create targeted savings milestones with contribution histories and radial progress.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Sparkles className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                  <CardTitle className="mt-2">NVIDIA NIM Insights</CardTitle>
                  <CardDescription>
                    Receive non-advisory, data-backed financial summaries highlighting spending deltas.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-100 py-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        <p>© 2026 Rupiyo Financial System. Built for privacy, speed, and discipline.</p>
      </footer>
    </div>
  );
}
