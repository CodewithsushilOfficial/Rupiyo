"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Trash2, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

export function BudgetCard({ budget, onDelete }) {
  const IconComponent = Icons[budget.category?.icon_name] || Icons.Target;
  const isOverall = !budget.category_id;
  const spent = Number(budget.spent || 0);
  const totalAmount = Number(budget.amount || 0);
  const remaining = Number(budget.remaining || 0);
  const percentage = Math.min(100, Number(budget.percentage || 0));

  let statusBadgeVariant = 'income';
  let progressBarColor = 'bg-income';
  let statusText = 'Healthy';
  let StatusIcon = CheckCircle2;

  if (budget.status === 'OVER_BUDGET') {
    statusBadgeVariant = 'expense';
    progressBarColor = 'bg-expense';
    statusText = 'Over Budget';
    StatusIcon = AlertCircle;
  } else if (budget.status === 'WARNING') {
    statusBadgeVariant = 'warning';
    progressBarColor = 'bg-warning';
    statusText = '80% Exceeded';
    StatusIcon = AlertTriangle;
  } else if (budget.status === 'MODERATE') {
    statusBadgeVariant = 'info';
    progressBarColor = 'bg-savings';
    statusText = '50% Spent';
    StatusIcon = CheckCircle2;
  }

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-control font-bold bg-primary-soft text-primary shadow-sm shrink-0"
            style={budget.category?.color_hex ? { backgroundColor: budget.category.color_hex, color: '#FFFFFF' } : undefined}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-heading">
              {isOverall ? 'Overall Monthly Budget' : budget.category?.name}
            </CardTitle>

            <div className="mt-1 flex items-center gap-2">
              <Badge variant={statusBadgeVariant} className="text-[10px] gap-1">
                <StatusIcon className="h-3 w-3" /> {statusText}
              </Badge>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(budget.id)}
          className="h-8 w-8 p-0 hover:bg-expense-soft hover:text-expense"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1.5">
            <span>Progress ({percentage}%)</span>
            <span>
              {formatCurrency(spent, true)} / {formatCurrency(totalAmount, true)}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn('h-full rounded-full transition-all duration-500', progressBarColor)}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between border-t border-border-subtle pt-2 text-xs">
          <span className="text-muted-foreground">Remaining</span>
          <span className="font-semibold text-heading">
            {formatCurrency(remaining)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
