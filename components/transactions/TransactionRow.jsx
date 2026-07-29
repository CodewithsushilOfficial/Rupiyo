"use client";

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Trash2, Tag, Eye, Pencil } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatters';

export function TransactionRow({
  transaction,
  isSelected = false,
  onToggleSelect,
  onView,
  onEdit,
  onDelete,
}) {
  const IconComponent = Icons[transaction.category?.icon_name] || Tag;
  const isIncome = transaction.type === 'INCOME';
  const amount = Number(transaction.amount || 0);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 transition-colors hover:bg-card-hover border-b border-border-subtle last:border-0',
        isSelected && 'bg-primary-soft/40'
      )}
    >
      <div className="flex items-center gap-3">
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(transaction.id)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
          />
        )}

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-primary text-primary-foreground font-bold shadow-sm"
          style={transaction.category?.color_hex ? { backgroundColor: transaction.category.color_hex, color: '#FFFFFF' } : undefined}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold text-heading line-clamp-1">
            {transaction.description || transaction.category?.name || 'Transaction'}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>{transaction.transaction_date}</span>
            <span>•</span>
            <span className="font-medium text-foreground">{transaction.account?.name || 'Account'}</span>
            <span>•</span>
            <span className="capitalize">{(transaction.payment_method || 'UPI').toLowerCase().replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
        <span className={cn('text-sm font-bold', isIncome ? 'text-income' : 'text-expense')}>
          {isIncome ? '+' : '-'} {formatCurrency(amount)}
        </span>

        <div className="flex items-center gap-1">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(transaction)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}

          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(transaction)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              title="Edit Transaction"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(transaction.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-expense hover:bg-expense-soft"
              title="Delete Transaction"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
