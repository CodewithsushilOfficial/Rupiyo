"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Target, PlusCircle, Trash2, CheckCircle2, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

export function GoalCard({ goal, onDeposit, onDelete }) {
  const current = Number(goal.current_amount || 0);
  const target = Number(goal.target_amount || 0);
  const percentage = Math.min(100, Math.round((current / target) * 100) || 0);
  const isCompleted = goal.status === 'COMPLETED' || percentage >= 100;

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-control shadow-sm text-white font-bold shrink-0',
              isCompleted ? 'bg-income text-income-foreground' : 'bg-primary text-primary-foreground'
            )}
          >
            {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Target className="h-5 w-5" />}
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-heading">{goal.title}</CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={isCompleted ? 'income' : 'primary'} className="text-[10px]">
                {isCompleted ? 'Completed' : 'In Progress'}
              </Badge>
              {goal.target_date && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3" /> {goal.target_date}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(goal.id)}
          className="h-8 w-8 p-0 hover:bg-expense-soft hover:text-expense"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1.5">
            <span>Saved ({percentage}%)</span>
            <span>
              {formatCurrency(current, true)} / {formatCurrency(target, true)}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isCompleted ? 'bg-income' : 'bg-primary'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {goal.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {goal.description}
          </p>
        )}

        <div className="flex justify-end pt-2">
          {!isCompleted && (
            <Button
              size="sm"
              variant="success"
              onClick={() => onDeposit(goal)}
              className="gap-1.5 text-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Deposit Funds
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
