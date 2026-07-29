"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalModal } from '@/components/goals/GoalModal';
import { ContributionModal } from '@/components/goals/ContributionModal';
import { deleteGoalAction } from '@/lib/actions/goal-actions';
import { Button } from '@/components/ui/Button';
import { Plus, Target, Trophy } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

export function GoalsView({ initialGoals = [], accounts = [] }) {
  const router = useRouter();
  const [removedGoalIds, setRemovedGoalIds] = React.useState([]);
  const [isGoalModalOpen, setIsGoalModalOpen] = React.useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false);
  const [selectedGoal, setSelectedGoal] = React.useState(null);

  const goals = initialGoals.filter((g) => !removedGoalIds.includes(g.id));

  const handleOpenDeposit = (goal) => {
    setSelectedGoal(goal);
    setIsDepositModalOpen(true);
  };

  const handleDeleteGoal = async (goalId) => {
    if (confirm('Are you sure you want to delete this savings goal?')) {
      const res = await deleteGoalAction(goalId);
      if (res.success) {
        setRemovedGoalIds((prev) => [...prev, goalId]);
        router.refresh();
      }
    }
  };

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount || 0), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            Savings Goals & Milestones
          </h1>
          <p className="text-sm text-muted-foreground">
            Set target savings milestones and log dedicated deposits.
          </p>
        </div>

        <Button onClick={() => setIsGoalModalOpen(true)} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Create Goal
        </Button>
      </div>

      {/* Summary Card */}
      <div className="rounded-card border border-primary-border bg-linear-to-r from-primary to-primary-hover p-6 text-primary-foreground shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Trophy className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-xs font-medium opacity-90">Total Savings Target Progress</p>
              <h2 className="text-2xl font-bold">
                {formatCurrency(totalSaved, true)} / {formatCurrency(totalTarget, true)}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card p-16 text-center shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-heading">No savings goals created</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Set your first savings milestone for emergency funds, vacations, or major purchases.
          </p>
          <Button onClick={() => setIsGoalModalOpen(true)} className="mt-6 gap-2">
            <Plus className="h-4 w-4" /> Create First Goal
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDeposit={handleOpenDeposit}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      )}

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <ContributionModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        goal={selectedGoal}
        accounts={accounts}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
