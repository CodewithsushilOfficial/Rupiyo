"use client";

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DashboardError({ message }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-background text-foreground">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl mb-5 bg-expense-soft text-expense">
        <AlertTriangle className="h-7 w-7" />
      </div>

      <h2 className="text-[20px] font-bold mb-2 text-heading">
        Couldn&apos;t load your dashboard
      </h2>
      <p className="text-[14px] max-w-md mb-6 text-muted-foreground">
        {message || 'We couldn\'t load your financial data right now. Please try again.'}
      </p>

      <button
        onClick={() => router.refresh()}
        className="flex items-center gap-2 h-10 px-6 rounded-control text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shadow-primary-btn transition-colors cursor-pointer"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}
