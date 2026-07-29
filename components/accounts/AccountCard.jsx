"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Building2, Wallet, CreditCard, Banknote, Smartphone, HelpCircle, Archive, Edit2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

const TYPE_ICONS = {
  BANK: Building2,
  CASH: Banknote,
  UPI: Smartphone,
  WALLET: Wallet,
  CREDIT_CARD: CreditCard,
  OTHER: HelpCircle,
};

const TYPE_STYLES = {
  BANK: 'bg-savings-soft text-savings',
  CASH: 'bg-income-soft text-income',
  UPI: 'bg-primary-soft text-primary',
  WALLET: 'bg-warning-soft text-warning',
  CREDIT_CARD: 'bg-expense-soft text-expense',
  OTHER: 'bg-muted text-muted-foreground',
};

export function AccountCard({ account, onEdit, onArchive }) {
  const Icon = TYPE_ICONS[account.type] || HelpCircle;
  const styleClass = TYPE_STYLES[account.type] || TYPE_STYLES.OTHER;
  const isCredit = account.type === 'CREDIT_CARD';
  const balance = Number(account.current_balance || 0);

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-control font-bold', styleClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-heading">{account.name}</CardTitle>
            <p className="text-xs text-muted-foreground capitalize">
              {account.type.toLowerCase().replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(account)} className="h-8 w-8 p-0">
            <Edit2 className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onArchive(account.id)} className="h-8 w-8 p-0 hover:bg-expense-soft hover:text-expense">
            <Archive className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium text-muted-foreground">Current Balance</span>
          <span
            className={cn(
              'text-xl font-bold',
              isCredit
                ? 'text-expense'
                : balance >= 0
                ? 'text-heading'
                : 'text-expense'
            )}
          >
            {formatCurrency(balance)}
          </span>
        </div>

        {account.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
            {account.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
