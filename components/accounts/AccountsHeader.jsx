"use client";

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Wallet, TrendingUp, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

export function AccountsHeader({ accounts = [], onAddAccount }) {
  const totalAssets = accounts
    .filter((a) => a.type !== 'CREDIT_CARD')
    .reduce((sum, a) => sum + Number(a.current_balance || 0), 0);

  const totalLiabilities = accounts
    .filter((a) => a.type === 'CREDIT_CARD')
    .reduce((sum, a) => sum + Number(a.current_balance || 0), 0);

  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            Accounts & Wealth
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your liquid assets, bank deposits, credit cards, and cash.
          </p>
        </div>

        <Button onClick={onAddAccount} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add Account
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-savings-soft border-savings-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-savings text-savings-foreground">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-savings">Total Assets</p>
                <p className="text-xl font-bold text-heading">
                  {formatCurrency(totalAssets)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-expense-soft border-expense-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-expense text-expense-foreground">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-expense">Liabilities (Credit Cards)</p>
                <p className="text-xl font-bold text-expense">
                  {formatCurrency(totalLiabilities)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-income-soft border-income-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-income text-income-foreground">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-income">Net Financial Worth</p>
                <p className="text-xl font-bold text-income">
                  {formatCurrency(netWorth)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
