"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, Play, Pause } from 'lucide-react';
import * as Icons from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

export function RecurringCard({ rule, onToggleStatus }) {
  const IconComponent = Icons[rule.category?.icon_name] || Icons.RefreshCw;
  const isIncome = rule.type === 'INCOME';
  const isActive = rule.status === 'ACTIVE';

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-control bg-primary-soft text-primary font-bold shadow-sm shrink-0"
            style={rule.category?.color_hex ? { backgroundColor: rule.category.color_hex, color: '#FFFFFF' } : undefined}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-heading">
              {rule.description || rule.category?.name || 'Recurring Rule'}
            </CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={isActive ? 'income' : 'default'} className="text-[10px]">
                {isActive ? 'Active' : 'Paused'}
              </Badge>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                {rule.frequency}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus(rule.id, rule.status)}
          className="h-8 w-8 p-0"
        >
          {isActive ? <Pause className="h-4 w-4 text-warning" /> : <Play className="h-4 w-4 text-income" />}
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">
            {isIncome ? 'Income Credit' : 'Expense Debit'} ({rule.account?.name})
          </span>
          <span className={cn('text-lg font-bold', isIncome ? 'text-income' : 'text-expense')}>
            {isIncome ? '+' : '-'} {formatCurrency(Number(rule.amount || 0))}
          </span>
        </div>

        <div className="flex justify-between border-t border-border-subtle pt-2 text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Next Execution:
          </span>
          <span className="font-semibold text-heading">{rule.next_date}</span>
        </div>
      </CardContent>
    </Card>
  );
}
