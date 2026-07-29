import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground',
        income: 'bg-income-soft text-income border border-income-border',
        expense: 'bg-expense-soft text-expense border border-expense-border',
        warning: 'bg-warning-soft text-warning border border-warning-border',
        info: 'bg-savings-soft text-savings border border-savings-border',
        primary: 'bg-primary-soft text-primary border border-primary-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
