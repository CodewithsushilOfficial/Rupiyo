"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { BudgetModal } from '@/components/budgets/BudgetModal';
import { deleteBudgetAction } from '@/lib/actions/budget-actions';
import { Button } from '@/components/ui/Button';
import { Plus, Target } from 'lucide-react';

export function BudgetsView({ initialBudgets = [], categories = [], currentMonth }) {
  const router = useRouter();
  const [budgets, setBudgets] = React.useState(initialBudgets);
  const [prevBudgets, setPrevBudgets] = React.useState(initialBudgets);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState(
    currentMonth || new Date().toISOString().substring(0, 7)
  );

  if (prevBudgets !== initialBudgets) {
    setPrevBudgets(initialBudgets);
    setBudgets(initialBudgets);
  }

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
    router.push(`/budgets?month=${newMonth}`);
  };

  const handleDelete = async (budgetId) => {
    if (confirm('Are you sure you want to delete this budget cap?')) {
      const res = await deleteBudgetAction(budgetId);
      if (res.success) {
        setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
        router.refresh();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            Budget Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Set monthly expenditure caps and track real-time consumption limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="rounded-control border border-input bg-card text-foreground px-3 py-2 text-xs font-semibold outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />

          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Budget
          </Button>
        </div>
      </div>

      {/* Grid */}
      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card p-16 text-center shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-heading">No budgets configured for {selectedMonth}</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Set monthly spending caps for food, rent, entertainment, or overall monthly expenditure.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-6 gap-2">
            <Plus className="h-4 w-4" /> Set First Budget
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        currentMonth={selectedMonth}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
