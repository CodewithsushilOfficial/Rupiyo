"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RecurringCard } from '@/components/recurring/RecurringCard';
import { RecurringModal } from '@/components/recurring/RecurringModal';
import {
  toggleRecurringRuleStatusAction,
  triggerRecurringExecutionAction,
} from '@/lib/actions/recurring-actions';
import { Button } from '@/components/ui/Button';
import { Plus, RefreshCw, Play } from 'lucide-react';

export function RecurringView({ initialRules = [], accounts = [], categories = [] }) {
  const router = useRouter();
  const [rules, setRules] = React.useState(initialRules);
  const [prevRules, setPrevRules] = React.useState(initialRules);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [message, setMessage] = React.useState('');

  if (prevRules !== initialRules) {
    setPrevRules(initialRules);
    setRules(initialRules);
  }

  const handleToggleStatus = async (ruleId, currentStatus) => {
    const res = await toggleRecurringRuleStatusAction(ruleId, currentStatus);
    if (res.success) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === ruleId ? { ...r, status: currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : r
        )
      );
      router.refresh();
    }
  };

  const handleProcessDue = async () => {
    setIsExecuting(true);
    setMessage('');
    try {
      const res = await triggerRecurringExecutionAction();
      if (res.success) {
        setMessage(`Processed ${res.processedCount} due recurring transactions successfully.`);
        router.refresh();
      }
    } catch (err) {
      console.error('[PROCESS_DUE_ERROR]:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            Recurring Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            Automate monthly salary credits, house rent, EMIs, and utility bill debits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleProcessDue}
            disabled={isExecuting}
            className="gap-2"
          >
            <Play className="h-4 w-4 text-income" />
            {isExecuting ? 'Processing Due...' : 'Process Due Bills'}
          </Button>

          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Recurring Rule
          </Button>
        </div>
      </div>

      {message && (
        <div className="rounded-control border border-income-border bg-income-soft p-4 text-sm font-medium text-income">
          {message}
        </div>
      )}

      {/* Grid */}
      {rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card p-16 text-center shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <RefreshCw className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-heading">No recurring rules set</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Automate your monthly salary income, rent, mobile bills, or subscription payments.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-6 gap-2">
            <Plus className="h-4 w-4" /> Create First Rule
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule) => (
            <RecurringCard key={rule.id} rule={rule} onToggleStatus={handleToggleStatus} />
          ))}
        </div>
      )}

      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accounts={accounts}
        categories={categories}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
